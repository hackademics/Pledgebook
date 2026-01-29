import type { CampaignRepository } from './campaign.repository'
import type {
  CampaignResponse,
  CampaignSummary,
  CreateCampaignInput,
  UpdateCampaignInput,
  AdminUpdateCampaignInput,
  ListCampaignsQuery,
  CampaignStatus,
} from './campaign.schema'
import { toCampaignResponse, toCampaignSummaryList, generateCampaignSlug } from './campaign.mapper'
import { createApiError, ApiErrorCode } from '../../utils/errors'

// =============================================================================
// CAMPAIGN SERVICE
// Purpose: Business logic layer for Campaign operations
// Pattern: Service layer that orchestrates repository calls and applies business rules
// =============================================================================

export interface CampaignService {
  getById(id: string): Promise<CampaignResponse>
  getBySlug(slug: string): Promise<CampaignResponse>
  getAll(query: ListCampaignsQuery): Promise<{
    data: CampaignSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getByCreator(
    creatorAddress: string,
    query: ListCampaignsQuery
  ): Promise<{
    data: CampaignSummary[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getFeatured(limit?: number): Promise<CampaignSummary[]>
  getActive(limit?: number): Promise<CampaignSummary[]>
  getShowcased(limit?: number): Promise<CampaignSummary[]>
  create(creatorAddress: string, input: CreateCampaignInput): Promise<CampaignResponse>
  update(id: string, creatorAddress: string, input: UpdateCampaignInput): Promise<CampaignResponse>
  adminUpdate(id: string, input: AdminUpdateCampaignInput): Promise<CampaignResponse>
  updateStatus(id: string, status: CampaignStatus): Promise<CampaignResponse>
  delete(id: string, creatorAddress: string): Promise<void>
}

/**
 * Create a CampaignService instance
 */
export function createCampaignService(repository: CampaignRepository): CampaignService {
  return {
    /**
     * Get a campaign by ID
     * @throws ApiError if not found
     */
    async getById(id: string): Promise<CampaignResponse> {
      const campaign = await repository.findById(id)

      if (!campaign) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Campaign with ID '${id}' not found`, {
          resourceType: 'campaign',
          resourceId: id,
        })
      }

      return toCampaignResponse(campaign)
    },

    /**
     * Get a campaign by slug
     * @throws ApiError if not found
     */
    async getBySlug(slug: string): Promise<CampaignResponse> {
      const campaign = await repository.findBySlug(slug)

      if (!campaign) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Campaign with slug '${slug}' not found`, {
          resourceType: 'campaign',
          resourceId: slug,
        })
      }

      return toCampaignResponse(campaign)
    },

    /**
     * Get all campaigns with pagination
     */
    async getAll(query: ListCampaignsQuery): Promise<{
      data: CampaignSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await repository.findAll(query)

      return {
        data: toCampaignSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get campaigns by creator
     */
    async getByCreator(
      creatorAddress: string,
      query: ListCampaignsQuery
    ): Promise<{
      data: CampaignSummary[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await repository.findByCreator(creatorAddress, query)

      return {
        data: toCampaignSummaryList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get featured campaigns
     */
    async getFeatured(limit = 10): Promise<CampaignSummary[]> {
      const campaigns = await repository.findFeatured(limit)
      return toCampaignSummaryList(campaigns)
    },

    /**
     * Get active campaigns
     */
    async getActive(limit = 20): Promise<CampaignSummary[]> {
      const campaigns = await repository.findActive(limit)
      return toCampaignSummaryList(campaigns)
    },

    /**
     * Get showcased campaigns
     */
    async getShowcased(limit = 6): Promise<CampaignSummary[]> {
      const campaigns = await repository.findShowcased(limit)
      return toCampaignSummaryList(campaigns)
    },

    /**
     * Create a new campaign
     * @throws ApiError if slug already exists
     */
    async create(creatorAddress: string, input: CreateCampaignInput): Promise<CampaignResponse> {
      // Generate or validate slug
      const slug = input.slug || generateCampaignSlug(input.name)

      // Check if slug already exists
      const slugExists = await repository.slugExists(slug)
      if (slugExists) {
        throw createApiError(ApiErrorCode.CONFLICT, `Campaign with slug '${slug}' already exists`, {
          field: 'slug',
          value: slug,
        })
      }

      // Validate end date is in the future
      const endDate = new Date(input.endDate)
      if (endDate <= new Date()) {
        throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'End date must be in the future', {
          field: 'endDate',
          value: input.endDate,
        })
      }

      // Validate start date if provided
      if (input.startDate) {
        const startDate = new Date(input.startDate)
        if (startDate >= endDate) {
          throw createApiError(
            ApiErrorCode.VALIDATION_ERROR,
            'Start date must be before end date',
            { field: 'startDate', value: input.startDate }
          )
        }
      }

      const campaign = await repository.create(creatorAddress, { ...input, slug })
      return toCampaignResponse(campaign)
    },

    /**
     * Update a campaign (by creator)
     * @throws ApiError if not found or not authorized
     */
    async update(
      id: string,
      creatorAddress: string,
      input: UpdateCampaignInput
    ): Promise<CampaignResponse> {
      const campaign = await repository.findById(id)

      if (!campaign) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Campaign with ID '${id}' not found`, {
          resourceType: 'campaign',
          resourceId: id,
        })
      }

      // Check ownership
      if (campaign.creator_address.toLowerCase() !== creatorAddress.toLowerCase()) {
        throw createApiError(
          ApiErrorCode.FORBIDDEN,
          'You are not authorized to update this campaign'
        )
      }

      // Can only update draft campaigns
      if (campaign.status !== 'draft') {
        throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Only draft campaigns can be edited', {
          currentStatus: campaign.status,
        })
      }

      const updated = await repository.update(id, input)
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update campaign')
      }

      return toCampaignResponse(updated)
    },

    /**
     * Admin update a campaign
     * @throws ApiError if not found
     */
    async adminUpdate(id: string, input: AdminUpdateCampaignInput): Promise<CampaignResponse> {
      const exists = await repository.exists(id)

      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Campaign with ID '${id}' not found`, {
          resourceType: 'campaign',
          resourceId: id,
        })
      }

      const updated = await repository.update(id, input)
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update campaign')
      }

      return toCampaignResponse(updated)
    },

    /**
     * Update campaign status
     * @throws ApiError if not found or invalid transition
     */
    async updateStatus(id: string, status: CampaignStatus): Promise<CampaignResponse> {
      const campaign = await repository.findById(id)

      if (!campaign) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Campaign with ID '${id}' not found`, {
          resourceType: 'campaign',
          resourceId: id,
        })
      }

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        draft: ['submitted', 'cancelled'],
        submitted: ['approved', 'draft', 'cancelled'],
        approved: ['active', 'cancelled'],
        active: ['complete', 'failed', 'disputed'],
        disputed: ['active', 'failed', 'cancelled'],
        complete: [],
        failed: [],
        cancelled: [],
      }

      if (!validTransitions[campaign.status]?.includes(status)) {
        throw createApiError(
          ApiErrorCode.VALIDATION_ERROR,
          `Invalid status transition from '${campaign.status}' to '${status}'`,
          { currentStatus: campaign.status, requestedStatus: status }
        )
      }

      const updated = await repository.updateStatus(id, status)
      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update campaign status')
      }

      return toCampaignResponse(updated)
    },

    /**
     * Delete a campaign (soft delete)
     * @throws ApiError if not found or not authorized
     */
    async delete(id: string, creatorAddress: string): Promise<void> {
      const campaign = await repository.findById(id)

      if (!campaign) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Campaign with ID '${id}' not found`, {
          resourceType: 'campaign',
          resourceId: id,
        })
      }

      // Check ownership
      if (campaign.creator_address.toLowerCase() !== creatorAddress.toLowerCase()) {
        throw createApiError(
          ApiErrorCode.FORBIDDEN,
          'You are not authorized to delete this campaign'
        )
      }

      // Can only delete draft campaigns
      if (campaign.status !== 'draft') {
        throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Only draft campaigns can be deleted', {
          currentStatus: campaign.status,
        })
      }

      const deleted = await repository.softDelete(id)
      if (!deleted) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to delete campaign')
      }
    },
  }
}
