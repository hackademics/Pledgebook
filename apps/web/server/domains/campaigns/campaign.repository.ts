import type { D1Database } from '@cloudflare/workers-types'
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  AdminUpdateCampaignInput,
  ListCampaignsQuery,
  CampaignStatus,
} from './campaign.schema'
import { generateCampaignSlug, generatePromptHash } from './campaign.mapper'

// =============================================================================
// CAMPAIGN REPOSITORY
// Purpose: Data access layer for Campaign entity
// Pattern: Repository pattern with parameterized queries for SQL injection prevention
// =============================================================================

export interface CampaignRepository {
  findById(id: string): Promise<Campaign | null>
  findBySlug(slug: string): Promise<Campaign | null>
  findAll(query: ListCampaignsQuery): Promise<{ data: Campaign[]; total: number }>
  findByCreator(
    creatorAddress: string,
    query: ListCampaignsQuery,
  ): Promise<{ data: Campaign[]; total: number }>
  findFeatured(limit?: number): Promise<Campaign[]>
  findActive(limit?: number): Promise<Campaign[]>
  findShowcased(limit?: number): Promise<Campaign[]>
  create(creatorAddress: string, input: CreateCampaignInput): Promise<Campaign>
  update(
    id: string,
    input: UpdateCampaignInput | AdminUpdateCampaignInput,
  ): Promise<Campaign | null>
  updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null>
  softDelete(id: string): Promise<boolean>
  exists(id: string): Promise<boolean>
  slugExists(slug: string): Promise<boolean>
  count(filters?: { status?: CampaignStatus; creatorAddress?: string }): Promise<number>
  incrementPledgeStats(id: string, amount: string, isNewPledger: boolean): Promise<void>
  incrementVoucherCount(id: string): Promise<void>
  incrementDisputerCount(id: string): Promise<void>
}

/**
 * D1 implementation of CampaignRepository
 */
export function createCampaignRepository(db: D1Database): CampaignRepository {
  return {
    /**
     * Find a campaign by ID
     */
    async findById(id: string): Promise<Campaign | null> {
      const result = await db
        .prepare('SELECT * FROM campaigns WHERE campaign_id = ? AND is_deleted = 0')
        .bind(id)
        .first<Campaign>()

      return result ?? null
    },

    /**
     * Find a campaign by slug
     */
    async findBySlug(slug: string): Promise<Campaign | null> {
      const result = await db
        .prepare('SELECT * FROM campaigns WHERE slug = ? AND is_deleted = 0')
        .bind(slug)
        .first<Campaign>()

      return result ?? null
    },

    /**
     * Find all campaigns with pagination, sorting, and filtering
     */
    async findAll(query: ListCampaignsQuery): Promise<{ data: Campaign[]; total: number }> {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        creatorAddress,
        isShowcased,
        isFeatured,
        isVerified,
        category,
        search,
      } = query

      const conditions: string[] = ['is_deleted = 0']
      const params: (string | number)[] = []

      if (status !== undefined) {
        conditions.push('status = ?')
        params.push(status)
      }

      if (creatorAddress !== undefined) {
        conditions.push('creator_address = ?')
        params.push(creatorAddress.toLowerCase())
      }

      if (isShowcased !== undefined) {
        conditions.push('is_showcased = ?')
        params.push(isShowcased ? 1 : 0)
      }

      if (isFeatured !== undefined) {
        conditions.push('is_featured = ?')
        params.push(isFeatured ? 1 : 0)
      }

      if (isVerified !== undefined) {
        conditions.push('is_verified = ?')
        params.push(isVerified ? 1 : 0)
      }

      if (category !== undefined) {
        conditions.push('categories LIKE ?')
        // Escape LIKE special characters to prevent SQL injection
        const escapedCategory = category.replace(/[%_\\]/g, '\\$&')
        params.push(`%"${escapedCategory}"%`)
      }

      if (search) {
        conditions.push('(name LIKE ? OR purpose LIKE ?)')
        // Escape LIKE special characters in search pattern
        const escapedSearch = search.replace(/[%_\\]/g, '\\$&')
        const searchPattern = `%${escapedSearch}%`
        params.push(searchPattern, searchPattern)
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`

      // Validate sort column
      const validSortColumns = ['created_at', 'end_date', 'amount_pledged', 'pledge_count', 'name']
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
      const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

      // Get total count
      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM campaigns ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()
      const total = countResult?.count ?? 0

      // Get paginated data
      const offset = (page - 1) * limit
      const dataResult = await db
        .prepare(
          `
          SELECT * FROM campaigns 
          ${whereClause} 
          ORDER BY ${safeSort} ${safeOrder} 
          LIMIT ? OFFSET ?
        `,
        )
        .bind(...params, limit, offset)
        .all<Campaign>()

      return {
        data: dataResult.results ?? [],
        total,
      }
    },

    /**
     * Find campaigns by creator address
     */
    async findByCreator(
      creatorAddress: string,
      query: ListCampaignsQuery,
    ): Promise<{ data: Campaign[]; total: number }> {
      return this.findAll({ ...query, creatorAddress })
    },

    /**
     * Find featured campaigns
     */
    async findFeatured(limit = 10): Promise<Campaign[]> {
      const result = await db
        .prepare(
          `
          SELECT * FROM campaigns 
          WHERE is_featured = 1 AND is_deleted = 0 AND status = 'active'
          ORDER BY created_at DESC 
          LIMIT ?
        `,
        )
        .bind(limit)
        .all<Campaign>()

      return result.results ?? []
    },

    /**
     * Find active campaigns
     */
    async findActive(limit = 20): Promise<Campaign[]> {
      const result = await db
        .prepare(
          `
          SELECT * FROM campaigns 
          WHERE status = 'active' AND is_deleted = 0 AND end_date > datetime('now')
          ORDER BY amount_pledged DESC 
          LIMIT ?
        `,
        )
        .bind(limit)
        .all<Campaign>()

      return result.results ?? []
    },

    /**
     * Find showcased campaigns
     */
    async findShowcased(limit = 6): Promise<Campaign[]> {
      const result = await db
        .prepare(
          `
          SELECT * FROM campaigns 
          WHERE is_showcased = 1 AND is_deleted = 0 AND status = 'active'
          ORDER BY amount_pledged DESC 
          LIMIT ?
        `,
        )
        .bind(limit)
        .all<Campaign>()

      return result.results ?? []
    },

    /**
     * Create a new campaign
     */
    async create(creatorAddress: string, input: CreateCampaignInput): Promise<Campaign> {
      const now = new Date().toISOString()
      const campaignId = crypto.randomUUID()
      const slug = input.slug || generateCampaignSlug(input.name)
      const promptHash = generatePromptHash(input.prompt)

      const result = await db
        .prepare(
          `
          INSERT INTO campaigns (
            campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
            prompt, prompt_hash, status, baseline_data, privacy_mode, consensus_threshold,
            creator_bond, amount_pledged, fundraising_goal, yield_rate, yield_pool,
            tags, categories, image_url, banner_url, is_showcased, is_featured, is_verified,
            history, consensus_results, is_disputed, escrow_address, start_date, end_date,
            pledge_count, unique_pledgers, voucher_count, disputer_count,
            created_at, updated_at, is_deleted
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', '{}', ?, ?, '0', '0', ?, 0.0, '0',
            ?, ?, ?, ?, 0, 0, 0, '[]', '[]', 0, NULL, ?, ?, 0, 0, 0, 0, ?, ?, 0)
          RETURNING *
        `,
        )
        .bind(
          campaignId,
          creatorAddress.toLowerCase(),
          input.name,
          slug,
          input.purpose,
          input.rulesAndResolution,
          input.prompt,
          promptHash,
          input.privacyMode ? 1 : 0,
          input.consensusThreshold,
          input.fundraisingGoal,
          JSON.stringify(input.tags),
          JSON.stringify(input.categories),
          input.imageUrl ?? null,
          input.bannerUrl ?? null,
          input.startDate ?? null,
          input.endDate,
          now,
          now,
        )
        .first<Campaign>()

      if (!result) {
        throw new Error('Failed to create campaign')
      }

      return result
    },

    /**
     * Update a campaign
     */
    async update(
      id: string,
      input: UpdateCampaignInput | AdminUpdateCampaignInput,
    ): Promise<Campaign | null> {
      const updates: string[] = []
      const params: (string | number | null)[] = []

      if (input.name !== undefined) {
        updates.push('name = ?')
        params.push(input.name)
      }

      if (input.purpose !== undefined) {
        updates.push('purpose = ?')
        params.push(input.purpose)
      }

      if (input.rulesAndResolution !== undefined) {
        updates.push('rules_and_resolution = ?')
        params.push(input.rulesAndResolution)
      }

      if (input.prompt !== undefined) {
        updates.push('prompt = ?')
        params.push(input.prompt)
        updates.push('prompt_hash = ?')
        params.push(generatePromptHash(input.prompt))
      }

      if (input.tags !== undefined) {
        updates.push('tags = ?')
        params.push(JSON.stringify(input.tags))
      }

      if (input.categories !== undefined) {
        updates.push('categories = ?')
        params.push(JSON.stringify(input.categories))
      }

      if (input.imageUrl !== undefined) {
        updates.push('image_url = ?')
        params.push(input.imageUrl)
      }

      if (input.bannerUrl !== undefined) {
        updates.push('banner_url = ?')
        params.push(input.bannerUrl)
      }

      if (input.privacyMode !== undefined) {
        updates.push('privacy_mode = ?')
        params.push(input.privacyMode ? 1 : 0)
      }

      // Admin-only fields
      const adminInput = input as AdminUpdateCampaignInput
      if ('status' in adminInput && adminInput.status !== undefined) {
        updates.push('status = ?')
        params.push(adminInput.status)
      }

      if ('isShowcased' in adminInput && adminInput.isShowcased !== undefined) {
        updates.push('is_showcased = ?')
        params.push(adminInput.isShowcased ? 1 : 0)
      }

      if ('isFeatured' in adminInput && adminInput.isFeatured !== undefined) {
        updates.push('is_featured = ?')
        params.push(adminInput.isFeatured ? 1 : 0)
      }

      if ('isVerified' in adminInput && adminInput.isVerified !== undefined) {
        updates.push('is_verified = ?')
        params.push(adminInput.isVerified ? 1 : 0)
      }

      if (updates.length === 0) {
        return this.findById(id)
      }

      updates.push('updated_at = ?')
      params.push(new Date().toISOString())
      params.push(id)

      const result = await db
        .prepare(
          `UPDATE campaigns SET ${updates.join(', ')} WHERE campaign_id = ? AND is_deleted = 0 RETURNING *`,
        )
        .bind(...params)
        .first<Campaign>()

      return result ?? null
    },

    /**
     * Update campaign status
     */
    async updateStatus(id: string, status: CampaignStatus): Promise<Campaign | null> {
      const now = new Date().toISOString()
      let timestampField = ''

      switch (status) {
        case 'submitted':
          timestampField = ', submitted_at = ?'
          break
        case 'approved':
          timestampField = ', approved_at = ?'
          break
        case 'active':
          timestampField = ', activated_at = ?'
          break
        case 'complete':
        case 'failed':
        case 'cancelled':
          timestampField = ', completed_at = ?'
          break
      }

      const query = `UPDATE campaigns SET status = ?, updated_at = ?${timestampField} WHERE campaign_id = ? AND is_deleted = 0 RETURNING *`
      const params = timestampField ? [status, now, now, id] : [status, now, id]

      const result = await db
        .prepare(query)
        .bind(...params)
        .first<Campaign>()

      return result ?? null
    },

    /**
     * Soft delete a campaign
     */
    async softDelete(id: string): Promise<boolean> {
      const now = new Date().toISOString()

      const result = await db
        .prepare(
          'UPDATE campaigns SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE campaign_id = ?',
        )
        .bind(now, now, id)
        .run()

      return result.meta.changes > 0
    },

    /**
     * Check if campaign exists
     */
    async exists(id: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM campaigns WHERE campaign_id = ? AND is_deleted = 0')
        .bind(id)
        .first()

      return result !== null
    },

    /**
     * Check if slug exists
     */
    async slugExists(slug: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM campaigns WHERE slug = ? AND is_deleted = 0')
        .bind(slug)
        .first()

      return result !== null
    },

    /**
     * Count campaigns
     */
    async count(filters?: { status?: CampaignStatus; creatorAddress?: string }): Promise<number> {
      const conditions: string[] = ['is_deleted = 0']
      const params: string[] = []

      if (filters?.status) {
        conditions.push('status = ?')
        params.push(filters.status)
      }

      if (filters?.creatorAddress) {
        conditions.push('creator_address = ?')
        params.push(filters.creatorAddress.toLowerCase())
      }

      const result = await db
        .prepare(`SELECT COUNT(*) as count FROM campaigns WHERE ${conditions.join(' AND ')}`)
        .bind(...params)
        .first<{ count: number }>()

      return result?.count ?? 0
    },

    /**
     * Increment pledge statistics
     */
    async incrementPledgeStats(id: string, amount: string, isNewPledger: boolean): Promise<void> {
      const uniquePledgerIncrement = isNewPledger ? 1 : 0

      await db
        .prepare(
          `
          UPDATE campaigns SET 
            pledge_count = pledge_count + 1,
            unique_pledgers = unique_pledgers + ?,
            amount_pledged = CAST((CAST(amount_pledged AS INTEGER) + CAST(? AS INTEGER)) AS TEXT),
            updated_at = ?
          WHERE campaign_id = ?
        `,
        )
        .bind(uniquePledgerIncrement, amount, new Date().toISOString(), id)
        .run()
    },

    /**
     * Increment voucher count
     */
    async incrementVoucherCount(id: string): Promise<void> {
      await db
        .prepare(
          'UPDATE campaigns SET voucher_count = voucher_count + 1, updated_at = ? WHERE campaign_id = ?',
        )
        .bind(new Date().toISOString(), id)
        .run()
    },

    /**
     * Increment disputer count
     */
    async incrementDisputerCount(id: string): Promise<void> {
      await db
        .prepare(
          'UPDATE campaigns SET disputer_count = disputer_count + 1, is_disputed = 1, updated_at = ? WHERE campaign_id = ?',
        )
        .bind(new Date().toISOString(), id)
        .run()
    },
  }
}
