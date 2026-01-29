// =============================================================================
// CAMPAIGN DOMAIN - BARREL EXPORT
// =============================================================================

// Schemas & Types
export {
  campaignSchema,
  campaignResponseSchema,
  campaignSummarySchema,
  createCampaignSchema,
  updateCampaignSchema,
  adminUpdateCampaignSchema,
  listCampaignsQuerySchema,
  campaignIdSchema,
  campaignSlugSchema,
  campaignStatusSchema,
  weiAmountSchema,
  type Campaign,
  type CampaignResponse,
  type CampaignSummary,
  type CreateCampaignInput,
  type UpdateCampaignInput,
  type AdminUpdateCampaignInput,
  type ListCampaignsQuery,
  type CampaignStatus,
} from './campaign.schema'

// Mapper
export {
  toCampaignResponse,
  toCampaignResponseList,
  toCampaignSummary,
  toCampaignSummaryList,
  generateCampaignSlug,
  generatePromptHash,
} from './campaign.mapper'

// Repository
export { type CampaignRepository, createCampaignRepository } from './campaign.repository'

// Service
export { type CampaignService, createCampaignService } from './campaign.service'
