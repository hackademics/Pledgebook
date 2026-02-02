import type { D1Database } from '@cloudflare/workers-types'
import type {
  Voucher,
  CreateVoucherInput,
  UpdateVoucherInput,
  ListVouchersQuery,
  VoucherStatus,
} from './voucher.schema'

// =============================================================================
// VOUCHER REPOSITORY
// Purpose: Data access layer for Voucher entity
// Pattern: Repository pattern with parameterized queries for SQL injection prevention
// =============================================================================

export interface VoucherRepository {
  findById(id: string): Promise<Voucher | null>
  findByTxHash(txHash: string): Promise<Voucher | null>
  findAll(query: ListVouchersQuery): Promise<{ data: Voucher[]; total: number }>
  findByCampaign(
    campaignId: string,
    query: ListVouchersQuery,
  ): Promise<{ data: Voucher[]; total: number }>
  findByVoucher(
    voucherAddress: string,
    query: ListVouchersQuery,
  ): Promise<{ data: Voucher[]; total: number }>
  findActiveByCampaign(campaignId: string): Promise<Voucher[]>
  create(voucherAddress: string, input: CreateVoucherInput): Promise<Voucher>
  update(id: string, input: UpdateVoucherInput): Promise<Voucher | null>
  updateStatus(id: string, status: VoucherStatus): Promise<Voucher | null>
  exists(id: string): Promise<boolean>
  txHashExists(txHash: string): Promise<boolean>
  hasVouchedForCampaign(voucherAddress: string, campaignId: string): Promise<boolean>
  count(filters?: {
    campaignId?: string
    voucherAddress?: string
    status?: VoucherStatus
  }): Promise<number>
  sumByCampaign(campaignId: string): Promise<string>
}

/**
 * D1 implementation of VoucherRepository
 */
export function createVoucherRepository(db: D1Database): VoucherRepository {
  return {
    /**
     * Find a voucher by ID
     */
    async findById(id: string): Promise<Voucher | null> {
      const result = await db
        .prepare('SELECT * FROM vouchers WHERE voucher_id = ?')
        .bind(id)
        .first<Voucher>()

      return result ?? null
    },

    /**
     * Find a voucher by stake transaction hash
     */
    async findByTxHash(txHash: string): Promise<Voucher | null> {
      const result = await db
        .prepare('SELECT * FROM vouchers WHERE stake_tx_hash = ?')
        .bind(txHash)
        .first<Voucher>()

      return result ?? null
    },

    /**
     * Find all vouchers with pagination, sorting, and filtering
     */
    async findAll(query: ListVouchersQuery): Promise<{ data: Voucher[]; total: number }> {
      const { page, limit, sortBy, sortOrder, campaignId, voucherAddress, status } = query

      const conditions: string[] = []
      const params: (string | number)[] = []

      if (campaignId !== undefined) {
        conditions.push('campaign_id = ?')
        params.push(campaignId)
      }

      if (voucherAddress !== undefined) {
        conditions.push('voucher_address = ?')
        params.push(voucherAddress.toLowerCase())
      }

      if (status !== undefined) {
        conditions.push('status = ?')
        params.push(status)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Validate sort column
      const validSortColumns = ['amount', 'vouched_at', 'created_at']
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'vouched_at'
      const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

      // Get total count
      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM vouchers ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()
      const total = countResult?.count ?? 0

      // Get paginated data
      const offset = (page - 1) * limit
      const dataResult = await db
        .prepare(
          `
          SELECT * FROM vouchers 
          ${whereClause} 
          ORDER BY ${safeSort} ${safeOrder} 
          LIMIT ? OFFSET ?
        `,
        )
        .bind(...params, limit, offset)
        .all<Voucher>()

      return {
        data: dataResult.results ?? [],
        total,
      }
    },

    /**
     * Find vouchers by campaign
     */
    async findByCampaign(
      campaignId: string,
      query: ListVouchersQuery,
    ): Promise<{ data: Voucher[]; total: number }> {
      return this.findAll({ ...query, campaignId })
    },

    /**
     * Find vouchers by voucher address
     */
    async findByVoucher(
      voucherAddress: string,
      query: ListVouchersQuery,
    ): Promise<{ data: Voucher[]; total: number }> {
      return this.findAll({ ...query, voucherAddress })
    },

    /**
     * Find active vouchers for a campaign
     */
    async findActiveByCampaign(campaignId: string): Promise<Voucher[]> {
      const result = await db
        .prepare(
          `
          SELECT * FROM vouchers 
          WHERE campaign_id = ? AND status = 'active'
          ORDER BY amount DESC
        `,
        )
        .bind(campaignId)
        .all<Voucher>()

      return result.results ?? []
    },

    /**
     * Create a new voucher
     */
    async create(voucherAddress: string, input: CreateVoucherInput): Promise<Voucher> {
      const now = new Date().toISOString()
      const voucherId = crypto.randomUUID()

      const result = await db
        .prepare(
          `
          INSERT INTO vouchers (
            voucher_id, campaign_id, voucher_address, amount, status,
            endorsement_message, stake_tx_hash, release_tx_hash, slash_tx_hash,
            block_number, block_timestamp, reward_earned, reward_claimed,
            reward_claimed_at, slash_amount, slash_reason, slashed_at,
            expires_at, created_at, updated_at, vouched_at, released_at, withdrawn_at
          ) VALUES (?, ?, ?, ?, 'pending', ?, ?, NULL, NULL, ?, ?, '0', '0',
            NULL, '0', NULL, NULL, ?, ?, ?, ?, NULL, NULL)
          RETURNING *
        `,
        )
        .bind(
          voucherId,
          input.campaignId,
          voucherAddress.toLowerCase(),
          input.amount,
          input.endorsementMessage ?? null,
          input.stakeTxHash,
          input.blockNumber ?? null,
          input.blockTimestamp ?? null,
          input.expiresAt ?? null,
          now,
          now,
          now,
        )
        .first<Voucher>()

      if (!result) {
        throw new Error('Failed to create voucher')
      }

      return result
    },

    /**
     * Update a voucher
     */
    async update(id: string, input: UpdateVoucherInput): Promise<Voucher | null> {
      const updates: string[] = []
      const params: (string | number | null)[] = []

      if (input.status !== undefined) {
        updates.push('status = ?')
        params.push(input.status)

        // Set timestamp based on status
        if (input.status === 'released') {
          updates.push('released_at = ?')
          params.push(new Date().toISOString())
        } else if (input.status === 'slashed') {
          updates.push('slashed_at = ?')
          params.push(new Date().toISOString())
        } else if (input.status === 'withdrawn') {
          updates.push('withdrawn_at = ?')
          params.push(new Date().toISOString())
        }
      }

      if (input.releaseTxHash !== undefined) {
        updates.push('release_tx_hash = ?')
        params.push(input.releaseTxHash)
      }

      if (input.slashTxHash !== undefined) {
        updates.push('slash_tx_hash = ?')
        params.push(input.slashTxHash)
      }

      if (input.slashAmount !== undefined) {
        updates.push('slash_amount = ?')
        params.push(input.slashAmount)
      }

      if (input.slashReason !== undefined) {
        updates.push('slash_reason = ?')
        params.push(input.slashReason)
      }

      if (input.rewardEarned !== undefined) {
        updates.push('reward_earned = ?')
        params.push(input.rewardEarned)
      }

      if (updates.length === 0) {
        return this.findById(id)
      }

      updates.push('updated_at = ?')
      params.push(new Date().toISOString())
      params.push(id)

      const result = await db
        .prepare(`UPDATE vouchers SET ${updates.join(', ')} WHERE voucher_id = ? RETURNING *`)
        .bind(...params)
        .first<Voucher>()

      return result ?? null
    },

    /**
     * Update voucher status
     */
    async updateStatus(id: string, status: VoucherStatus): Promise<Voucher | null> {
      return this.update(id, { status })
    },

    /**
     * Check if voucher exists
     */
    async exists(id: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM vouchers WHERE voucher_id = ?')
        .bind(id)
        .first()

      return result !== null
    },

    /**
     * Check if stake transaction hash already exists
     */
    async txHashExists(txHash: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM vouchers WHERE stake_tx_hash = ?')
        .bind(txHash)
        .first()

      return result !== null
    },

    /**
     * Check if user has already vouched for a campaign
     */
    async hasVouchedForCampaign(voucherAddress: string, campaignId: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM vouchers WHERE voucher_address = ? AND campaign_id = ?')
        .bind(voucherAddress.toLowerCase(), campaignId)
        .first()

      return result !== null
    },

    /**
     * Count vouchers
     */
    async count(filters?: {
      campaignId?: string
      voucherAddress?: string
      status?: VoucherStatus
    }): Promise<number> {
      const conditions: string[] = []
      const params: string[] = []

      if (filters?.campaignId) {
        conditions.push('campaign_id = ?')
        params.push(filters.campaignId)
      }

      if (filters?.voucherAddress) {
        conditions.push('voucher_address = ?')
        params.push(filters.voucherAddress.toLowerCase())
      }

      if (filters?.status) {
        conditions.push('status = ?')
        params.push(filters.status)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const result = await db
        .prepare(`SELECT COUNT(*) as count FROM vouchers ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()

      return result?.count ?? 0
    },

    /**
     * Get total amount vouched for a campaign
     */
    async sumByCampaign(campaignId: string): Promise<string> {
      const result = await db
        .prepare(
          `
          SELECT COALESCE(SUM(CAST(amount AS INTEGER)), 0) as total 
          FROM vouchers 
          WHERE campaign_id = ? AND status = 'active'
        `,
        )
        .bind(campaignId)
        .first<{ total: number }>()

      return String(result?.total ?? 0)
    },
  }
}
