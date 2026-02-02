import type { VoucherRepository } from './voucher.repository'
import type { CampaignRepository } from '../campaigns/campaign.repository'
import type {
  VoucherResponse,
  VoucherSummary,
  CreateVoucherInput,
  UpdateVoucherInput,
  ListVouchersQuery,
} from './voucher.schema'
import { toVoucherResponse, toVoucherSummaryList } from './voucher.mapper'
import { createApiError, ApiErrorCode } from '../../utils/errors'

// =============================================================================
// VOUCHER SERVICE
// Purpose: Business logic layer for Voucher operations
// Pattern: Service layer that orchestrates repository calls and applies business rules
// =============================================================================

export interface VoucherService {
  getById(id: string): Promise<VoucherResponse>
  getByTxHash(txHash: string): Promise<VoucherResponse>
  getAll(query: ListVouchersQuery): Promise<{
    data: VoucherSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByCampaign(
    campaignId: string,
    query: ListVouchersQuery,
  ): Promise<{
    data: VoucherSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByVoucher(
    voucherAddress: string,
    query: ListVouchersQuery,
  ): Promise<{
    data: VoucherSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getActiveByCampaign(campaignId: string): Promise<VoucherSummary[]>
  create(voucherAddress: string, input: CreateVoucherInput): Promise<VoucherResponse>
  update(id: string, input: UpdateVoucherInput): Promise<VoucherResponse>
  activateVoucher(id: string): Promise<VoucherResponse>
  releaseVoucher(id: string, releaseTxHash: string): Promise<VoucherResponse>
  slashVoucher(
    id: string,
    slashTxHash: string,
    slashAmount: string,
    reason: string,
  ): Promise<VoucherResponse>
}

interface VoucherServiceDependencies {
  voucherRepository: VoucherRepository
  campaignRepository?: CampaignRepository
}

/**
 * Create a VoucherService instance
 */
export function createVoucherService(deps: VoucherServiceDependencies): VoucherService {
  const { voucherRepository, campaignRepository } = deps

  return {
    /**
     * Get a voucher by ID
     * @throws ApiError if not found
     */
    async getById(id: string): Promise<VoucherResponse> {
      const voucher = await voucherRepository.findById(id)

      if (!voucher) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Voucher with ID '${id}' not found`, {
          resourceType: 'voucher',
          resourceId: id,
        })
      }

      return toVoucherResponse(voucher)
    },

    /**
     * Get a voucher by stake transaction hash
     * @throws ApiError if not found
     */
    async getByTxHash(txHash: string): Promise<VoucherResponse> {
      const voucher = await voucherRepository.findByTxHash(txHash)

      if (!voucher) {
        throw createApiError(
          ApiErrorCode.NOT_FOUND,
          `Voucher with transaction hash '${txHash}' not found`,
          { resourceType: 'voucher', resourceId: txHash },
        )
      }

      return toVoucherResponse(voucher)
    },

    /**
     * Get all vouchers with pagination
     */
    async getAll(query: ListVouchersQuery): Promise<{
      data: VoucherSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await voucherRepository.findAll(query)

      return {
        data: toVoucherSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get vouchers by campaign
     */
    async getByCampaign(
      campaignId: string,
      query: ListVouchersQuery,
    ): Promise<{
      data: VoucherSummary[]
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

      const { data, total } = await voucherRepository.findByCampaign(campaignId, query)

      return {
        data: toVoucherSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get vouchers by voucher address
     */
    async getByVoucher(
      voucherAddress: string,
      query: ListVouchersQuery,
    ): Promise<{
      data: VoucherSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await voucherRepository.findByVoucher(voucherAddress, query)

      return {
        data: toVoucherSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get active vouchers for a campaign
     */
    async getActiveByCampaign(campaignId: string): Promise<VoucherSummary[]> {
      const vouchers = await voucherRepository.findActiveByCampaign(campaignId)
      return toVoucherSummaryList(vouchers)
    },

    /**
     * Create a new voucher
     * @throws ApiError if transaction hash already exists or already vouched
     */
    async create(voucherAddress: string, input: CreateVoucherInput): Promise<VoucherResponse> {
      // Check for duplicate transaction hash
      const txExists = await voucherRepository.txHashExists(input.stakeTxHash)
      if (txExists) {
        throw createApiError(
          ApiErrorCode.CONFLICT,
          `Voucher with transaction hash '${input.stakeTxHash}' already exists`,
          { field: 'stakeTxHash', value: input.stakeTxHash },
        )
      }

      // Check if user has already vouched for this campaign
      const hasVouched = await voucherRepository.hasVouchedForCampaign(
        voucherAddress,
        input.campaignId,
      )
      if (hasVouched) {
        throw createApiError(ApiErrorCode.CONFLICT, 'You have already vouched for this campaign', {
          campaignId: input.campaignId,
        })
      }

      // Verify campaign exists and is in valid state
      if (campaignRepository) {
        const campaign = await campaignRepository.findById(input.campaignId)
        if (!campaign) {
          throw createApiError(
            ApiErrorCode.NOT_FOUND,
            `Campaign with ID '${input.campaignId}' not found`,
            { resourceType: 'campaign', resourceId: input.campaignId },
          )
        }

        // Can vouch for draft, submitted, approved, or active campaigns
        const validStatuses = ['draft', 'submitted', 'approved', 'active']
        if (!validStatuses.includes(campaign.status)) {
          throw createApiError(
            ApiErrorCode.VALIDATION_ERROR,
            'Cannot vouch for campaigns that are complete, failed, or cancelled',
            { campaignStatus: campaign.status },
          )
        }
      }

      // Create voucher
      const voucher = await voucherRepository.create(voucherAddress, input)

      // Update campaign voucher count
      if (campaignRepository) {
        await campaignRepository.incrementVoucherCount(input.campaignId)
      }

      return toVoucherResponse(voucher)
    },

    /**
     * Update a voucher
     * @throws ApiError if not found
     */
    async update(id: string, input: UpdateVoucherInput): Promise<VoucherResponse> {
      const exists = await voucherRepository.exists(id)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Voucher with ID '${id}' not found`, {
          resourceType: 'voucher',
          resourceId: id,
        })
      }

      const updated = await voucherRepository.update(id, input)
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update voucher')
      }

      return toVoucherResponse(updated)
    },

    /**
     * Activate a voucher (confirm stake on-chain)
     */
    async activateVoucher(id: string): Promise<VoucherResponse> {
      const voucher = await voucherRepository.findById(id)
      if (!voucher) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Voucher with ID '${id}' not found`, {
          resourceType: 'voucher',
          resourceId: id,
        })
      }

      if (voucher.status !== 'pending') {
        throw createApiError(
          ApiErrorCode.VALIDATION_ERROR,
          'Only pending vouchers can be activated',
          { currentStatus: voucher.status },
        )
      }

      const updated = await voucherRepository.updateStatus(id, 'active')
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to activate voucher')
      }

      return toVoucherResponse(updated)
    },

    /**
     * Release a voucher (campaign succeeded)
     */
    async releaseVoucher(id: string, releaseTxHash: string): Promise<VoucherResponse> {
      const voucher = await voucherRepository.findById(id)
      if (!voucher) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Voucher with ID '${id}' not found`, {
          resourceType: 'voucher',
          resourceId: id,
        })
      }

      if (voucher.status !== 'active') {
        throw createApiError(
          ApiErrorCode.VALIDATION_ERROR,
          'Only active vouchers can be released',
          { currentStatus: voucher.status },
        )
      }

      const updated = await voucherRepository.update(id, {
        status: 'released',
        releaseTxHash,
      })
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to release voucher')
      }

      return toVoucherResponse(updated)
    },

    /**
     * Slash a voucher (campaign failed/disputed)
     */
    async slashVoucher(
      id: string,
      slashTxHash: string,
      slashAmount: string,
      reason: string,
    ): Promise<VoucherResponse> {
      const voucher = await voucherRepository.findById(id)
      if (!voucher) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Voucher with ID '${id}' not found`, {
          resourceType: 'voucher',
          resourceId: id,
        })
      }

      if (voucher.status !== 'active') {
        throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Only active vouchers can be slashed', {
          currentStatus: voucher.status,
        })
      }

      const updated = await voucherRepository.update(id, {
        status: 'slashed',
        slashTxHash,
        slashAmount,
        slashReason: reason,
      })
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to slash voucher')
      }

      return toVoucherResponse(updated)
    },
  }
}
