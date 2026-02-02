import type { D1Database } from '@cloudflare/workers-types'
import type {
  Disputer,
  CreateDisputerInput,
  UpdateDisputerInput,
  ResolveDisputerInput,
  ListDisputersQuery,
  DisputerStatus,
  DisputeType,
} from './disputer.schema'

// =============================================================================
// DISPUTER REPOSITORY
// Purpose: Data access layer for Disputer entity
// Pattern: Repository pattern with parameterized queries for SQL injection prevention
// =============================================================================

export interface DisputerRepository {
  findById(id: string): Promise<Disputer | null>
  findByTxHash(txHash: string): Promise<Disputer | null>
  findAll(query: ListDisputersQuery): Promise<{ data: Disputer[]; total: number }>
  findByCampaign(
    campaignId: string,
    query: ListDisputersQuery,
  ): Promise<{ data: Disputer[]; total: number }>
  findByDisputer(
    disputerAddress: string,
    query: ListDisputersQuery,
  ): Promise<{ data: Disputer[]; total: number }>
  findActiveByCampaign(campaignId: string): Promise<Disputer[]>
  findPending(): Promise<Disputer[]>
  create(disputerAddress: string, input: CreateDisputerInput): Promise<Disputer>
  update(id: string, input: UpdateDisputerInput): Promise<Disputer | null>
  resolve(
    id: string,
    resolverAddress: string,
    input: ResolveDisputerInput,
  ): Promise<Disputer | null>
  updateStatus(id: string, status: DisputerStatus): Promise<Disputer | null>
  exists(id: string): Promise<boolean>
  txHashExists(txHash: string): Promise<boolean>
  hasDisputedCampaign(disputerAddress: string, campaignId: string): Promise<boolean>
  count(filters?: {
    campaignId?: string
    disputerAddress?: string
    status?: DisputerStatus
    disputeType?: DisputeType
  }): Promise<number>
}

/**
 * D1 implementation of DisputerRepository
 */
export function createDisputerRepository(db: D1Database): DisputerRepository {
  return {
    /**
     * Find a disputer by ID
     */
    async findById(id: string): Promise<Disputer | null> {
      const result = await db
        .prepare('SELECT * FROM disputers WHERE disputer_id = ?')
        .bind(id)
        .first<Disputer>()

      return result ?? null
    },

    /**
     * Find a disputer by stake transaction hash
     */
    async findByTxHash(txHash: string): Promise<Disputer | null> {
      const result = await db
        .prepare('SELECT * FROM disputers WHERE stake_tx_hash = ?')
        .bind(txHash)
        .first<Disputer>()

      return result ?? null
    },

    /**
     * Find all disputers with pagination, sorting, and filtering
     */
    async findAll(query: ListDisputersQuery): Promise<{ data: Disputer[]; total: number }> {
      const { page, limit, sortBy, sortOrder, campaignId, disputerAddress, status, disputeType } =
        query

      const conditions: string[] = []
      const params: (string | number)[] = []

      if (campaignId !== undefined) {
        conditions.push('campaign_id = ?')
        params.push(campaignId)
      }

      if (disputerAddress !== undefined) {
        conditions.push('disputer_address = ?')
        params.push(disputerAddress.toLowerCase())
      }

      if (status !== undefined) {
        conditions.push('status = ?')
        params.push(status)
      }

      if (disputeType !== undefined) {
        conditions.push('dispute_type = ?')
        params.push(disputeType)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Validate sort column
      const validSortColumns = ['amount', 'disputed_at', 'created_at']
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'disputed_at'
      const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

      // Get total count
      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM disputers ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()
      const total = countResult?.count ?? 0

      // Get paginated data
      const offset = (page - 1) * limit
      const dataResult = await db
        .prepare(
          `
          SELECT * FROM disputers 
          ${whereClause} 
          ORDER BY ${safeSort} ${safeOrder} 
          LIMIT ? OFFSET ?
        `,
        )
        .bind(...params, limit, offset)
        .all<Disputer>()

      return {
        data: dataResult.results ?? [],
        total,
      }
    },

    /**
     * Find disputers by campaign
     */
    async findByCampaign(
      campaignId: string,
      query: ListDisputersQuery,
    ): Promise<{ data: Disputer[]; total: number }> {
      return this.findAll({ ...query, campaignId })
    },

    /**
     * Find disputers by disputer address
     */
    async findByDisputer(
      disputerAddress: string,
      query: ListDisputersQuery,
    ): Promise<{ data: Disputer[]; total: number }> {
      return this.findAll({ ...query, disputerAddress })
    },

    /**
     * Find active disputes for a campaign
     */
    async findActiveByCampaign(campaignId: string): Promise<Disputer[]> {
      const result = await db
        .prepare(
          `
          SELECT * FROM disputers 
          WHERE campaign_id = ? AND status IN ('pending', 'active')
          ORDER BY disputed_at DESC
        `,
        )
        .bind(campaignId)
        .all<Disputer>()

      return result.results ?? []
    },

    /**
     * Find pending disputes (for admin review)
     */
    async findPending(): Promise<Disputer[]> {
      const result = await db
        .prepare(
          `
          SELECT * FROM disputers 
          WHERE status = 'pending'
          ORDER BY disputed_at ASC
        `,
        )
        .all<Disputer>()

      return result.results ?? []
    },

    /**
     * Create a new disputer
     */
    async create(disputerAddress: string, input: CreateDisputerInput): Promise<Disputer> {
      const now = new Date().toISOString()
      const disputerId = crypto.randomUUID()

      const result = await db
        .prepare(
          `
          INSERT INTO disputers (
            disputer_id, campaign_id, disputer_address, amount, status, reason,
            dispute_type, evidence, stake_tx_hash, resolution_tx_hash,
            block_number, block_timestamp, resolution_outcome, resolution_notes,
            resolved_by, resolved_at, reward_earned, stake_returned, stake_slashed,
            expires_at, created_at, updated_at, disputed_at
          ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, NULL, ?, ?, NULL, NULL,
            NULL, NULL, '0', '0', '0', ?, ?, ?, ?)
          RETURNING *
        `,
        )
        .bind(
          disputerId,
          input.campaignId,
          disputerAddress.toLowerCase(),
          input.amount,
          input.reason,
          input.disputeType,
          JSON.stringify(input.evidence),
          input.stakeTxHash,
          input.blockNumber ?? null,
          input.blockTimestamp ?? null,
          input.expiresAt ?? null,
          now,
          now,
          now,
        )
        .first<Disputer>()

      if (!result) {
        throw new Error('Failed to create disputer')
      }

      return result
    },

    /**
     * Update a disputer
     */
    async update(id: string, input: UpdateDisputerInput): Promise<Disputer | null> {
      const updates: string[] = []
      const params: (string | number | null)[] = []

      if (input.status !== undefined) {
        updates.push('status = ?')
        params.push(input.status)
      }

      if (input.evidence !== undefined) {
        updates.push('evidence = ?')
        params.push(JSON.stringify(input.evidence))
      }

      if (updates.length === 0) {
        return this.findById(id)
      }

      updates.push('updated_at = ?')
      params.push(new Date().toISOString())
      params.push(id)

      const result = await db
        .prepare(`UPDATE disputers SET ${updates.join(', ')} WHERE disputer_id = ? RETURNING *`)
        .bind(...params)
        .first<Disputer>()

      return result ?? null
    },

    /**
     * Resolve a dispute
     */
    async resolve(
      id: string,
      resolverAddress: string,
      input: ResolveDisputerInput,
    ): Promise<Disputer | null> {
      const now = new Date().toISOString()

      // Determine new status based on outcome
      let newStatus: DisputerStatus
      switch (input.outcome) {
        case 'upheld':
          newStatus = 'upheld'
          break
        case 'rejected':
          newStatus = 'rejected'
          break
        case 'partial':
          newStatus = 'upheld' // Partial goes to upheld but with partial refund
          break
      }

      const result = await db
        .prepare(
          `
          UPDATE disputers SET
            status = ?,
            resolution_outcome = ?,
            resolution_tx_hash = ?,
            resolution_notes = ?,
            resolved_by = ?,
            resolved_at = ?,
            reward_earned = COALESCE(?, reward_earned),
            stake_returned = COALESCE(?, stake_returned),
            stake_slashed = COALESCE(?, stake_slashed),
            updated_at = ?
          WHERE disputer_id = ?
          RETURNING *
        `,
        )
        .bind(
          newStatus,
          input.outcome,
          input.resolutionTxHash ?? null,
          input.notes ?? null,
          resolverAddress.toLowerCase(),
          now,
          input.rewardEarned ?? null,
          input.stakeReturned ?? null,
          input.stakeSlashed ?? null,
          now,
          id,
        )
        .first<Disputer>()

      return result ?? null
    },

    /**
     * Update disputer status
     */
    async updateStatus(id: string, status: DisputerStatus): Promise<Disputer | null> {
      return this.update(id, { status })
    },

    /**
     * Check if disputer exists
     */
    async exists(id: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM disputers WHERE disputer_id = ?')
        .bind(id)
        .first()

      return result !== null
    },

    /**
     * Check if stake transaction hash already exists
     */
    async txHashExists(txHash: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM disputers WHERE stake_tx_hash = ?')
        .bind(txHash)
        .first()

      return result !== null
    },

    /**
     * Check if user has already disputed a campaign
     */
    async hasDisputedCampaign(disputerAddress: string, campaignId: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM disputers WHERE disputer_address = ? AND campaign_id = ?')
        .bind(disputerAddress.toLowerCase(), campaignId)
        .first()

      return result !== null
    },

    /**
     * Count disputers
     */
    async count(filters?: {
      campaignId?: string
      disputerAddress?: string
      status?: DisputerStatus
      disputeType?: DisputeType
    }): Promise<number> {
      const conditions: string[] = []
      const params: string[] = []

      if (filters?.campaignId) {
        conditions.push('campaign_id = ?')
        params.push(filters.campaignId)
      }

      if (filters?.disputerAddress) {
        conditions.push('disputer_address = ?')
        params.push(filters.disputerAddress.toLowerCase())
      }

      if (filters?.status) {
        conditions.push('status = ?')
        params.push(filters.status)
      }

      if (filters?.disputeType) {
        conditions.push('dispute_type = ?')
        params.push(filters.disputeType)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const result = await db
        .prepare(`SELECT COUNT(*) as count FROM disputers ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()

      return result?.count ?? 0
    },
  }
}
