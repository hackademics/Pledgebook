import type { D1Database } from '@cloudflare/workers-types'
import type {
  Pledge,
  CreatePledgeInput,
  UpdatePledgeInput,
  ListPledgesQuery,
  PledgeStatus,
} from './pledge.schema'

// =============================================================================
// PLEDGE REPOSITORY
// Purpose: Data access layer for Pledge entity
// Pattern: Repository pattern with parameterized queries for SQL injection prevention
// =============================================================================

export interface PledgeRepository {
  findById(id: string): Promise<Pledge | null>
  findByTxHash(txHash: string): Promise<Pledge | null>
  findAll(query: ListPledgesQuery): Promise<{ data: Pledge[]; total: number }>
  findByCampaign(
    campaignId: string,
    query: ListPledgesQuery,
  ): Promise<{ data: Pledge[]; total: number }>
  findByPledger(
    pledgerAddress: string,
    query: ListPledgesQuery,
  ): Promise<{ data: Pledge[]; total: number }>
  create(pledgerAddress: string, input: CreatePledgeInput): Promise<Pledge>
  update(id: string, input: UpdatePledgeInput): Promise<Pledge | null>
  updateStatus(id: string, status: PledgeStatus): Promise<Pledge | null>
  exists(id: string): Promise<boolean>
  txHashExists(txHash: string): Promise<boolean>
  hasPledgedToCampaign(pledgerAddress: string, campaignId: string): Promise<boolean>
  count(filters?: {
    campaignId?: string
    pledgerAddress?: string
    status?: PledgeStatus
  }): Promise<number>
  sumByCampaign(campaignId: string): Promise<string>
}

/**
 * D1 implementation of PledgeRepository
 */
export function createPledgeRepository(db: D1Database): PledgeRepository {
  return {
    /**
     * Find a pledge by ID
     */
    async findById(id: string): Promise<Pledge | null> {
      const result = await db
        .prepare('SELECT * FROM pledges WHERE pledge_id = ?')
        .bind(id)
        .first<Pledge>()

      return result ?? null
    },

    /**
     * Find a pledge by transaction hash
     */
    async findByTxHash(txHash: string): Promise<Pledge | null> {
      const result = await db
        .prepare('SELECT * FROM pledges WHERE tx_hash = ?')
        .bind(txHash)
        .first<Pledge>()

      return result ?? null
    },

    /**
     * Find all pledges with pagination, sorting, and filtering
     */
    async findAll(query: ListPledgesQuery): Promise<{ data: Pledge[]; total: number }> {
      const { page, limit, sortBy, sortOrder, campaignId, pledgerAddress, status } = query

      const conditions: string[] = []
      const params: (string | number)[] = []

      if (campaignId !== undefined) {
        conditions.push('campaign_id = ?')
        params.push(campaignId)
      }

      if (pledgerAddress !== undefined) {
        conditions.push('pledger_address = ?')
        params.push(pledgerAddress.toLowerCase())
      }

      if (status !== undefined) {
        conditions.push('status = ?')
        params.push(status)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Validate sort column
      const validSortColumns = ['amount', 'pledged_at', 'created_at']
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'pledged_at'
      const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

      // Get total count
      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM pledges ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()
      const total = countResult?.count ?? 0

      // Get paginated data
      const offset = (page - 1) * limit
      const dataResult = await db
        .prepare(
          `
          SELECT * FROM pledges 
          ${whereClause} 
          ORDER BY ${safeSort} ${safeOrder} 
          LIMIT ? OFFSET ?
        `,
        )
        .bind(...params, limit, offset)
        .all<Pledge>()

      return {
        data: dataResult.results ?? [],
        total,
      }
    },

    /**
     * Find pledges by campaign
     */
    async findByCampaign(
      campaignId: string,
      query: ListPledgesQuery,
    ): Promise<{ data: Pledge[]; total: number }> {
      return this.findAll({ ...query, campaignId })
    },

    /**
     * Find pledges by pledger
     */
    async findByPledger(
      pledgerAddress: string,
      query: ListPledgesQuery,
    ): Promise<{ data: Pledge[]; total: number }> {
      return this.findAll({ ...query, pledgerAddress })
    },

    /**
     * Create a new pledge
     */
    async create(pledgerAddress: string, input: CreatePledgeInput): Promise<Pledge> {
      const now = new Date().toISOString()
      const pledgeId = crypto.randomUUID()

      const result = await db
        .prepare(
          `
          INSERT INTO pledges (
            pledge_id, campaign_id, pledger_address, amount, message, status,
            tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
            release_tx_hash, refund_tx_hash, released_at, refunded_at,
            yield_earned, yield_claimed, last_yield_claim_at, is_anonymous,
            created_at, updated_at, pledged_at
          ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, 0, NULL, NULL, NULL, NULL, NULL,
            '0', '0', NULL, ?, ?, ?, ?)
          RETURNING *
        `,
        )
        .bind(
          pledgeId,
          input.campaignId,
          pledgerAddress.toLowerCase(),
          input.amount,
          input.message ?? null,
          input.txHash,
          input.blockNumber ?? null,
          input.blockTimestamp ?? null,
          input.isAnonymous ? 1 : 0,
          now,
          now,
          now,
        )
        .first<Pledge>()

      if (!result) {
        throw new Error('Failed to create pledge')
      }

      return result
    },

    /**
     * Update a pledge
     */
    async update(id: string, input: UpdatePledgeInput): Promise<Pledge | null> {
      const updates: string[] = []
      const params: (string | number | null)[] = []

      if (input.status !== undefined) {
        updates.push('status = ?')
        params.push(input.status)

        // Set timestamp based on status
        if (input.status === 'confirmed') {
          updates.push('confirmed_at = ?')
          params.push(new Date().toISOString())
        } else if (input.status === 'released') {
          updates.push('released_at = ?')
          params.push(new Date().toISOString())
        } else if (input.status === 'refunded') {
          updates.push('refunded_at = ?')
          params.push(new Date().toISOString())
        }
      }

      if (input.confirmations !== undefined) {
        updates.push('confirmations = ?')
        params.push(input.confirmations)
      }

      if (input.releaseTxHash !== undefined) {
        updates.push('release_tx_hash = ?')
        params.push(input.releaseTxHash)
      }

      if (input.refundTxHash !== undefined) {
        updates.push('refund_tx_hash = ?')
        params.push(input.refundTxHash)
      }

      if (updates.length === 0) {
        return this.findById(id)
      }

      updates.push('updated_at = ?')
      params.push(new Date().toISOString())
      params.push(id)

      const result = await db
        .prepare(`UPDATE pledges SET ${updates.join(', ')} WHERE pledge_id = ? RETURNING *`)
        .bind(...params)
        .first<Pledge>()

      return result ?? null
    },

    /**
     * Update pledge status
     */
    async updateStatus(id: string, status: PledgeStatus): Promise<Pledge | null> {
      return this.update(id, { status })
    },

    /**
     * Check if pledge exists
     */
    async exists(id: string): Promise<boolean> {
      const result = await db.prepare('SELECT 1 FROM pledges WHERE pledge_id = ?').bind(id).first()

      return result !== null
    },

    /**
     * Check if transaction hash already exists
     */
    async txHashExists(txHash: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM pledges WHERE tx_hash = ?')
        .bind(txHash)
        .first()

      return result !== null
    },

    /**
     * Check if user has already pledged to a campaign
     */
    async hasPledgedToCampaign(pledgerAddress: string, campaignId: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM pledges WHERE pledger_address = ? AND campaign_id = ?')
        .bind(pledgerAddress.toLowerCase(), campaignId)
        .first()

      return result !== null
    },

    /**
     * Count pledges
     */
    async count(filters?: {
      campaignId?: string
      pledgerAddress?: string
      status?: PledgeStatus
    }): Promise<number> {
      const conditions: string[] = []
      const params: string[] = []

      if (filters?.campaignId) {
        conditions.push('campaign_id = ?')
        params.push(filters.campaignId)
      }

      if (filters?.pledgerAddress) {
        conditions.push('pledger_address = ?')
        params.push(filters.pledgerAddress.toLowerCase())
      }

      if (filters?.status) {
        conditions.push('status = ?')
        params.push(filters.status)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const result = await db
        .prepare(`SELECT COUNT(*) as count FROM pledges ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()

      return result?.count ?? 0
    },

    /**
     * Get total amount pledged to a campaign
     */
    async sumByCampaign(campaignId: string): Promise<string> {
      const result = await db
        .prepare(
          `
          SELECT COALESCE(SUM(CAST(amount AS INTEGER)), 0) as total 
          FROM pledges 
          WHERE campaign_id = ? AND status IN ('confirmed', 'active')
        `,
        )
        .bind(campaignId)
        .first<{ total: number }>()

      return String(result?.total ?? 0)
    },
  }
}
