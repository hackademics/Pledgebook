import type { PledgeRepository } from './pledge.repository'
import type { CampaignRepository } from '../campaigns/campaign.repository'
import type { UserRepository } from '../users/user.repository'
import type {
  PledgeResponse,
  PledgeSummary,
  CreatePledgeInput,
  UpdatePledgeInput,
  ListPledgesQuery,
} from './pledge.schema'
import { toPledgeResponse, toPledgeSummaryList } from './pledge.mapper'
import { createApiError, ApiErrorCode } from '../../utils/errors'

// =============================================================================
// PLEDGE SERVICE
// Purpose: Business logic layer for Pledge operations
// Pattern: Service layer that orchestrates repository calls and applies business rules
// =============================================================================

export interface PledgeService {
  getById(id: string): Promise<PledgeResponse>
  getByTxHash(txHash: string): Promise<PledgeResponse>
  getAll(query: ListPledgesQuery): Promise<{
    data: PledgeSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByCampaign(
    campaignId: string,
    query: ListPledgesQuery,
  ): Promise<{
    data: PledgeSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByPledger(
    pledgerAddress: string,
    query: ListPledgesQuery,
  ): Promise<{
    data: PledgeSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  create(pledgerAddress: string, input: CreatePledgeInput): Promise<PledgeResponse>
  update(id: string, input: UpdatePledgeInput): Promise<PledgeResponse>
  confirmPledge(id: string, confirmations: number): Promise<PledgeResponse>
}

interface PledgeServiceDependencies {
  pledgeRepository: PledgeRepository
  campaignRepository?: CampaignRepository
  userRepository?: UserRepository
}

/**
 * Create a PledgeService instance
 */
export function createPledgeService(deps: PledgeServiceDependencies): PledgeService {
  const { pledgeRepository, campaignRepository, userRepository } = deps

  return {
    /**
     * Get a pledge by ID
     * @throws ApiError if not found
     */
    async getById(id: string): Promise<PledgeResponse> {
      const pledge = await pledgeRepository.findById(id)

      if (!pledge) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Pledge with ID '${id}' not found`, {
          resourceType: 'pledge',
          resourceId: id,
        })
      }

      return toPledgeResponse(pledge)
    },

    /**
     * Get a pledge by transaction hash
     * @throws ApiError if not found
     */
    async getByTxHash(txHash: string): Promise<PledgeResponse> {
      const pledge = await pledgeRepository.findByTxHash(txHash)

      if (!pledge) {
        throw createApiError(
          ApiErrorCode.NOT_FOUND,
          `Pledge with transaction hash '${txHash}' not found`,
          { resourceType: 'pledge', resourceId: txHash },
        )
      }

      return toPledgeResponse(pledge)
    },

    /**
     * Get all pledges with pagination
     */
    async getAll(query: ListPledgesQuery): Promise<{
      data: PledgeSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await pledgeRepository.findAll(query)

      return {
        data: toPledgeSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get pledges by campaign
     */
    async getByCampaign(
      campaignId: string,
      query: ListPledgesQuery,
    ): Promise<{
      data: PledgeSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      // Verify campaign exists if repository is provided
      if (campaignRepository) {
        const exists = await campaignRepository.exists(campaignId)
        if (!exists) {
          throw createApiError(
            ApiErrorCode.NOT_FOUND,
            `Campaign with ID '${campaignId}' not found`,
            { resourceType: 'campaign', resourceId: campaignId },
          )
        }
      }

      const { data, total } = await pledgeRepository.findByCampaign(campaignId, query)

      return {
        data: toPledgeSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get pledges by pledger
     */
    async getByPledger(
      pledgerAddress: string,
      query: ListPledgesQuery,
    ): Promise<{
      data: PledgeSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await pledgeRepository.findByPledger(pledgerAddress, query)

      return {
        data: toPledgeSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Create a new pledge
     * @throws ApiError if transaction hash already exists or campaign not active
     */
    async create(pledgerAddress: string, input: CreatePledgeInput): Promise<PledgeResponse> {
      // Check for duplicate transaction hash
      const txExists = await pledgeRepository.txHashExists(input.txHash)
      if (txExists) {
        throw createApiError(
          ApiErrorCode.CONFLICT,
          `Pledge with transaction hash '${input.txHash}' already exists`,
          { field: 'txHash', value: input.txHash },
        )
      }

      // Verify campaign exists and is active
      if (campaignRepository) {
        const campaign = await campaignRepository.findById(input.campaignId)
        if (!campaign) {
          throw createApiError(
            ApiErrorCode.NOT_FOUND,
            `Campaign with ID '${input.campaignId}' not found`,
            { resourceType: 'campaign', resourceId: input.campaignId },
          )
        }

        if (campaign.status !== 'active') {
          throw createApiError(
            ApiErrorCode.VALIDATION_ERROR,
            'Can only pledge to active campaigns',
            { campaignStatus: campaign.status },
          )
        }

        // Check if end date has passed
        if (new Date(campaign.end_date) < new Date()) {
          throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Campaign has ended', {
            endDate: campaign.end_date,
          })
        }
      }

      // Check if this is a new pledger for the campaign
      const isNewPledger = !(await pledgeRepository.hasPledgedToCampaign(
        pledgerAddress,
        input.campaignId,
      ))

      // Create pledge
      const pledge = await pledgeRepository.create(pledgerAddress, input)

      // Update campaign statistics
      if (campaignRepository) {
        await campaignRepository.incrementPledgeStats(input.campaignId, input.amount, isNewPledger)
      }

      // Update user statistics
      if (userRepository) {
        await userRepository.incrementPledgesMade(pledgerAddress, input.amount)
      }

      return toPledgeResponse(pledge)
    },

    /**
     * Update a pledge
     * @throws ApiError if not found
     */
    async update(id: string, input: UpdatePledgeInput): Promise<PledgeResponse> {
      const exists = await pledgeRepository.exists(id)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Pledge with ID '${id}' not found`, {
          resourceType: 'pledge',
          resourceId: id,
        })
      }

      const updated = await pledgeRepository.update(id, input)
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update pledge')
      }

      return toPledgeResponse(updated)
    },

    /**
     * Confirm a pledge (update confirmations and status)
     * @throws ApiError if not found
     */
    async confirmPledge(id: string, confirmations: number): Promise<PledgeResponse> {
      const pledge = await pledgeRepository.findById(id)
      if (!pledge) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Pledge with ID '${id}' not found`, {
          resourceType: 'pledge',
          resourceId: id,
        })
      }

      // Only update if still pending or needs more confirmations
      if (pledge.status === 'pending' && confirmations >= 1) {
        const updated = await pledgeRepository.update(id, {
          status: 'confirmed',
          confirmations,
        })
        if (!updated) {
          throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to confirm pledge')
        }
        return toPledgeResponse(updated)
      }

      // Just update confirmations
      const updated = await pledgeRepository.update(id, { confirmations })
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update pledge')
      }

      return toPledgeResponse(updated)
    },
  }
}
