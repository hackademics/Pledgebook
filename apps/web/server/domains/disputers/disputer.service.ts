import type { DisputerRepository } from './disputer.repository'
import type { CampaignRepository } from '../campaigns/campaign.repository'
import type {
  DisputerResponse,
  DisputerSummary,
  CreateDisputerInput,
  UpdateDisputerInput,
  ResolveDisputerInput,
  ListDisputersQuery,
} from './disputer.schema'
import { toDisputerResponse, toDisputerSummaryList } from './disputer.mapper'
import { createApiError, ApiErrorCode } from '../../utils/errors'

// =============================================================================
// DISPUTER SERVICE
// Purpose: Business logic layer for Disputer operations
// Pattern: Service layer that orchestrates repository calls and applies business rules
// =============================================================================

export interface DisputerService {
  getById(id: string): Promise<DisputerResponse>
  getByTxHash(txHash: string): Promise<DisputerResponse>
  getAll(query: ListDisputersQuery): Promise<{
    data: DisputerSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByCampaign(
    campaignId: string,
    query: ListDisputersQuery
  ): Promise<{
    data: DisputerSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByDisputer(
    disputerAddress: string,
    query: ListDisputersQuery
  ): Promise<{
    data: DisputerSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getActiveByCampaign(campaignId: string): Promise<DisputerSummary[]>
  getPending(): Promise<DisputerSummary[]>
  create(disputerAddress: string, input: CreateDisputerInput): Promise<DisputerResponse>
  update(id: string, input: UpdateDisputerInput): Promise<DisputerResponse>
  resolve(
    id: string,
    resolverAddress: string,
    input: ResolveDisputerInput
  ): Promise<DisputerResponse>
  activateDispute(id: string): Promise<DisputerResponse>
  withdrawDispute(id: string, disputerAddress: string): Promise<DisputerResponse>
}

interface DisputerServiceDependencies {
  disputerRepository: DisputerRepository
  campaignRepository?: CampaignRepository
}

/**
 * Create a DisputerService instance
 */
export function createDisputerService(deps: DisputerServiceDependencies): DisputerService {
  const { disputerRepository, campaignRepository } = deps

  return {
    /**
     * Get a disputer by ID
     * @throws ApiError if not found
     */
    async getById(id: string): Promise<DisputerResponse> {
      const disputer = await disputerRepository.findById(id)

      if (!disputer) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Dispute with ID '${id}' not found`, {
          resourceType: 'disputer',
          resourceId: id,
        })
      }

      return toDisputerResponse(disputer)
    },

    /**
     * Get a disputer by stake transaction hash
     * @throws ApiError if not found
     */
    async getByTxHash(txHash: string): Promise<DisputerResponse> {
      const disputer = await disputerRepository.findByTxHash(txHash)

      if (!disputer) {
        throw createApiError(
          ApiErrorCode.NOT_FOUND,
          `Dispute with transaction hash '${txHash}' not found`,
          { resourceType: 'disputer', resourceId: txHash }
        )
      }

      return toDisputerResponse(disputer)
    },

    /**
     * Get all disputers with pagination
     */
    async getAll(query: ListDisputersQuery): Promise<{
      data: DisputerSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await disputerRepository.findAll(query)

      return {
        data: toDisputerSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get disputers by campaign
     */
    async getByCampaign(
      campaignId: string,
      query: ListDisputersQuery
    ): Promise<{
      data: DisputerSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      // Verify campaign exists if repository is provided
      if (campaignRepository) {
        const exists = await campaignRepository.exists(campaignId)
        if (!exists) {
          throw createApiError(
            ApiErrorCode.NOT_FOUND,
            `Campaign with ID '${campaignId}' not found`,
            { resourceType: 'campaign', resourceId: campaignId }
          )
        }
      }

      const { data, total } = await disputerRepository.findByCampaign(campaignId, query)

      return {
        data: toDisputerSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get disputers by disputer address
     */
    async getByDisputer(
      disputerAddress: string,
      query: ListDisputersQuery
    ): Promise<{
      data: DisputerSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await disputerRepository.findByDisputer(disputerAddress, query)

      return {
        data: toDisputerSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get active disputes for a campaign
     */
    async getActiveByCampaign(campaignId: string): Promise<DisputerSummary[]> {
      const disputers = await disputerRepository.findActiveByCampaign(campaignId)
      return toDisputerSummaryList(disputers)
    },

    /**
     * Get pending disputes (for admin review)
     */
    async getPending(): Promise<DisputerSummary[]> {
      const disputers = await disputerRepository.findPending()
      return toDisputerSummaryList(disputers)
    },

    /**
     * Create a new dispute
     * @throws ApiError if transaction hash already exists or already disputed
     */
    async create(disputerAddress: string, input: CreateDisputerInput): Promise<DisputerResponse> {
      // Check for duplicate transaction hash
      const txExists = await disputerRepository.txHashExists(input.stakeTxHash)
      if (txExists) {
        throw createApiError(
          ApiErrorCode.CONFLICT,
          `Dispute with transaction hash '${input.stakeTxHash}' already exists`,
          { field: 'stakeTxHash', value: input.stakeTxHash }
        )
      }

      // Check if user has already disputed this campaign
      const hasDisputed = await disputerRepository.hasDisputedCampaign(
        disputerAddress,
        input.campaignId
      )
      if (hasDisputed) {
        throw createApiError(ApiErrorCode.CONFLICT, 'You have already disputed this campaign', {
          campaignId: input.campaignId,
        })
      }

      // Verify campaign exists and is in a disputable state
      if (campaignRepository) {
        const campaign = await campaignRepository.findById(input.campaignId)
        if (!campaign) {
          throw createApiError(
            ApiErrorCode.NOT_FOUND,
            `Campaign with ID '${input.campaignId}' not found`,
            { resourceType: 'campaign', resourceId: input.campaignId }
          )
        }

        // Can only dispute active campaigns
        if (campaign.status !== 'active') {
          throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Can only dispute active campaigns', {
            campaignStatus: campaign.status,
          })
        }
      }

      // Create dispute
      const disputer = await disputerRepository.create(disputerAddress, input)

      // Update campaign disputer count and mark as disputed
      if (campaignRepository) {
        await campaignRepository.incrementDisputerCount(input.campaignId)
      }

      return toDisputerResponse(disputer)
    },

    /**
     * Update a dispute
     * @throws ApiError if not found
     */
    async update(id: string, input: UpdateDisputerInput): Promise<DisputerResponse> {
      const exists = await disputerRepository.exists(id)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Dispute with ID '${id}' not found`, {
          resourceType: 'disputer',
          resourceId: id,
        })
      }

      const updated = await disputerRepository.update(id, input)
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update dispute')
      }

      return toDisputerResponse(updated)
    },

    /**
     * Resolve a dispute (admin/verifier action)
     * @throws ApiError if not found or already resolved
     */
    async resolve(
      id: string,
      resolverAddress: string,
      input: ResolveDisputerInput
    ): Promise<DisputerResponse> {
      const disputer = await disputerRepository.findById(id)
      if (!disputer) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Dispute with ID '${id}' not found`, {
          resourceType: 'disputer',
          resourceId: id,
        })
      }

      // Can only resolve pending or active disputes
      if (!['pending', 'active'].includes(disputer.status)) {
        throw createApiError(
          ApiErrorCode.VALIDATION_ERROR,
          'Can only resolve pending or active disputes',
          { currentStatus: disputer.status }
        )
      }

      const resolved = await disputerRepository.resolve(id, resolverAddress, input)
      if (!resolved) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to resolve dispute')
      }

      return toDisputerResponse(resolved)
    },

    /**
     * Activate a dispute (confirm stake on-chain)
     */
    async activateDispute(id: string): Promise<DisputerResponse> {
      const disputer = await disputerRepository.findById(id)
      if (!disputer) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Dispute with ID '${id}' not found`, {
          resourceType: 'disputer',
          resourceId: id,
        })
      }

      if (disputer.status !== 'pending') {
        throw createApiError(
          ApiErrorCode.VALIDATION_ERROR,
          'Only pending disputes can be activated',
          { currentStatus: disputer.status }
        )
      }

      const updated = await disputerRepository.updateStatus(id, 'active')
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to activate dispute')
      }

      return toDisputerResponse(updated)
    },

    /**
     * Withdraw a dispute (disputer action before resolution)
     */
    async withdrawDispute(id: string, disputerAddress: string): Promise<DisputerResponse> {
      const disputer = await disputerRepository.findById(id)
      if (!disputer) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Dispute with ID '${id}' not found`, {
          resourceType: 'disputer',
          resourceId: id,
        })
      }

      // Check ownership
      if (disputer.disputer_address.toLowerCase() !== disputerAddress.toLowerCase()) {
        throw createApiError(
          ApiErrorCode.FORBIDDEN,
          'You are not authorized to withdraw this dispute'
        )
      }

      // Can only withdraw pending disputes
      if (disputer.status !== 'pending') {
        throw createApiError(
          ApiErrorCode.VALIDATION_ERROR,
          'Only pending disputes can be withdrawn',
          { currentStatus: disputer.status }
        )
      }

      const updated = await disputerRepository.updateStatus(id, 'withdrawn')
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to withdraw dispute')
      }

      return toDisputerResponse(updated)
    },
  }
}
