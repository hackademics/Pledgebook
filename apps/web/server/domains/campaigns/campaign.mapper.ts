import { keccak256, toBytes, toHex } from 'viem'
import type { Campaign, CampaignResponse, CampaignSummary } from './campaign.schema'

// =============================================================================
// CAMPAIGN MAPPER
// Purpose: Transform between database rows and API response formats
// =============================================================================

/**
 * Parse JSON string to object/array safely
 */
function parseJson<T>(value: string | T, defaultValue: T): T {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value) as T
  } catch {
    return defaultValue
  }
}

/**
 * Maps a database row to the full API response format
 * Converts snake_case to camelCase and transforms types
 */
export function toCampaignResponse(row: Campaign): CampaignResponse {
  return {
    id: row.campaign_id,
    creatorAddress: row.creator_address,
    name: row.name,
    slug: row.slug,
    purpose: row.purpose,
    rulesAndResolution: row.rules_and_resolution,
    prompt: row.prompt,
    promptHash: row.prompt_hash,
    status: row.status,
    baselineData: parseJson(row.baseline_data, {}),
    privacyMode: Boolean(row.privacy_mode),
    consensusThreshold: row.consensus_threshold,
    creatorBond: row.creator_bond,
    amountPledged: row.amount_pledged,
    fundraisingGoal: row.fundraising_goal,
    yieldRate: row.yield_rate,
    yieldPool: row.yield_pool,
    tags: parseJson(row.tags, []),
    categories: parseJson(row.categories, []),
    imageUrl: row.image_url ?? null,
    bannerUrl: row.banner_url ?? null,
    isShowcased: Boolean(row.is_showcased),
    isFeatured: Boolean(row.is_featured),
    isVerified: Boolean(row.is_verified),
    isDisputed: Boolean(row.is_disputed),
    escrowAddress: row.escrow_address ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date,
    pledgeCount: row.pledge_count,
    uniquePledgers: row.unique_pledgers,
    voucherCount: row.voucher_count,
    disputerCount: row.disputer_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at ?? null,
    approvedAt: row.approved_at ?? null,
    activatedAt: row.activated_at ?? null,
    completedAt: row.completed_at ?? null,
  }
}

/**
 * Maps a database row to summary format (for list views)
 */
export function toCampaignSummary(row: Campaign): CampaignSummary {
  return {
    id: row.campaign_id,
    creatorAddress: row.creator_address,
    name: row.name,
    slug: row.slug,
    purpose: row.purpose,
    description: row.purpose,
    status: row.status,
    imageUrl: row.image_url ?? null,
    amountPledged: row.amount_pledged,
    fundraisingGoal: row.fundraising_goal,
    pledgeCount: row.pledge_count,
    voucherCount: row.voucher_count,
    categories: parseJson(row.categories, []),
    category: parsePrimaryCategory(row.categories),
    isShowcased: Boolean(row.is_showcased),
    isFeatured: Boolean(row.is_featured),
    isVerified: Boolean(row.is_verified),
    endDate: row.end_date,
    createdAt: row.created_at,
  }
}

/**
 * Parse the primary (first) category from JSON categories string
 */
function parsePrimaryCategory(categories: string | string[]): string {
  const parsed = parseJson<string[]>(categories as string, [])
  if (parsed.length > 0) {
    // Convert slug like 'shelter-housing' to display name
    return parsed[0]
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  return 'General'
}

/**
 * Maps multiple database rows to full API response format
 */
export function toCampaignResponseList(rows: Campaign[]): CampaignResponse[] {
  return rows.map(toCampaignResponse)
}

/**
 * Maps multiple database rows to summary format
 */
export function toCampaignSummaryList(rows: Campaign[]): CampaignSummary[] {
  return rows.map(toCampaignSummary)
}

/**
 * Generate a slug from campaign name
 */
export function generateCampaignSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

/**
 * Generate a prompt hash using keccak256 (matching on-chain hash)
 */
export function generatePromptHash(prompt: string): string {
  return toHex(keccak256(toBytes(prompt.trim())))
}
