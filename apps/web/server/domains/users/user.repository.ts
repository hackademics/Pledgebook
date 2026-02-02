import type { D1Database } from '@cloudflare/workers-types'
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  AdminUpdateUserInput,
  ListUsersQuery,
} from './user.schema'

// =============================================================================
// USER REPOSITORY
// Purpose: Data access layer for User entity
// Pattern: Repository pattern with parameterized queries for SQL injection prevention
// =============================================================================

export interface UserRepository {
  findByAddress(address: string): Promise<User | null>
  findAll(query: ListUsersQuery): Promise<{ data: User[]; total: number }>
  findTopByReputation(limit?: number): Promise<User[]>
  create(input: CreateUserInput): Promise<User>
  update(address: string, input: UpdateUserInput | AdminUpdateUserInput): Promise<User | null>
  updateLastLogin(address: string): Promise<void>
  updateLastActive(address: string): Promise<void>
  delete(address: string): Promise<boolean>
  exists(address: string): Promise<boolean>
  count(filters?: { role?: string; isActive?: boolean; isBanned?: boolean }): Promise<number>
  incrementCampaignsCreated(address: string): Promise<void>
  incrementPledgesMade(address: string, amount: string): Promise<void>
}

/**
 * D1 implementation of UserRepository
 */
export function createUserRepository(db: D1Database): UserRepository {
  return {
    /**
     * Find a user by wallet address (primary key)
     */
    async findByAddress(address: string): Promise<User | null> {
      const normalizedAddress = address.toLowerCase()
      const result = await db
        .prepare('SELECT * FROM users WHERE address = ?')
        .bind(normalizedAddress)
        .first<User>()

      return result ?? null
    },

    /**
     * Find all users with pagination, sorting, and filtering
     */
    async findAll(query: ListUsersQuery): Promise<{ data: User[]; total: number }> {
      const { page, limit, sortBy, sortOrder, role, isActive, isBanned, search } = query

      // Build WHERE clause dynamically
      const conditions: string[] = []
      const params: (string | number)[] = []

      if (role !== undefined) {
        conditions.push('role = ?')
        params.push(role)
      }

      if (isActive !== undefined) {
        conditions.push('is_active = ?')
        params.push(isActive ? 1 : 0)
      }

      if (isBanned !== undefined) {
        conditions.push('is_banned = ?')
        params.push(isBanned ? 1 : 0)
      }

      if (search) {
        conditions.push('(address LIKE ? OR display_name LIKE ? OR ens_name LIKE ?)')
        const searchPattern = `%${search}%`
        params.push(searchPattern, searchPattern, searchPattern)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Validate sort column to prevent SQL injection
      const validSortColumns = [
        'reputation_score',
        'campaigns_created',
        'pledges_made',
        'created_at',
        'last_active_at',
      ]
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
      const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM users ${whereClause}`
      const countResult = await db
        .prepare(countQuery)
        .bind(...params)
        .first<{ count: number }>()
      const total = countResult?.count ?? 0

      // Get paginated data
      const offset = (page - 1) * limit
      const dataQuery = `
        SELECT * FROM users 
        ${whereClause} 
        ORDER BY ${safeSort} ${safeOrder} 
        LIMIT ? OFFSET ?
      `
      const dataResult = await db
        .prepare(dataQuery)
        .bind(...params, limit, offset)
        .all<User>()

      return {
        data: dataResult.results ?? [],
        total,
      }
    },

    /**
     * Find top users by reputation score
     */
    async findTopByReputation(limit = 10): Promise<User[]> {
      const result = await db
        .prepare(
          'SELECT * FROM users WHERE is_active = 1 AND is_banned = 0 ORDER BY reputation_score DESC LIMIT ?',
        )
        .bind(limit)
        .all<User>()

      return result.results ?? []
    },

    /**
     * Create a new user (first wallet connection)
     */
    async create(input: CreateUserInput): Promise<User> {
      const now = new Date().toISOString()
      const normalizedAddress = input.address.toLowerCase()
      const defaultPreferences = JSON.stringify({ privacyMode: false, notifications: true })

      const result = await db
        .prepare(
          `INSERT INTO users (
            address, role, preferences, display_name, ens_name, avatar_url,
            reputation_score, campaigns_created, pledges_made, total_pledged,
            is_active, is_banned, created_at, updated_at, last_login_at
          ) VALUES (?, 'user', ?, ?, ?, ?, 0, 0, 0, '0', 1, 0, ?, ?, ?)
          RETURNING *`,
        )
        .bind(
          normalizedAddress,
          defaultPreferences,
          input.displayName ?? null,
          input.ensName ?? null,
          input.avatarUrl ?? null,
          now,
          now,
          now,
        )
        .first<User>()

      if (!result) {
        throw new Error('Failed to create user')
      }

      return result
    },

    /**
     * Update an existing user
     */
    async update(
      address: string,
      input: UpdateUserInput | AdminUpdateUserInput,
    ): Promise<User | null> {
      const normalizedAddress = address.toLowerCase()

      // Build SET clause dynamically
      const updates: string[] = []
      const params: (string | number | null)[] = []

      if (input.displayName !== undefined) {
        updates.push('display_name = ?')
        params.push(input.displayName)
      }

      if (input.avatarUrl !== undefined) {
        updates.push('avatar_url = ?')
        params.push(input.avatarUrl)
      }

      if (input.preferences !== undefined) {
        // Merge with existing preferences
        const existingUser = await this.findByAddress(normalizedAddress)
        if (existingUser) {
          const existingPrefs =
            typeof existingUser.preferences === 'string'
              ? JSON.parse(existingUser.preferences)
              : existingUser.preferences
          const mergedPrefs = { ...existingPrefs, ...input.preferences }
          updates.push('preferences = ?')
          params.push(JSON.stringify(mergedPrefs))
        }
      }

      // Admin-only fields
      const adminInput = input as AdminUpdateUserInput
      if ('role' in adminInput && adminInput.role !== undefined) {
        updates.push('role = ?')
        params.push(adminInput.role)
      }

      if ('isActive' in adminInput && adminInput.isActive !== undefined) {
        updates.push('is_active = ?')
        params.push(adminInput.isActive ? 1 : 0)
      }

      if ('isBanned' in adminInput && adminInput.isBanned !== undefined) {
        updates.push('is_banned = ?')
        params.push(adminInput.isBanned ? 1 : 0)
      }

      if ('banReason' in adminInput && adminInput.banReason !== undefined) {
        updates.push('ban_reason = ?')
        params.push(adminInput.banReason)
      }

      if (updates.length === 0) {
        return this.findByAddress(normalizedAddress)
      }

      updates.push('updated_at = ?')
      params.push(new Date().toISOString())
      params.push(normalizedAddress)

      const result = await db
        .prepare(`UPDATE users SET ${updates.join(', ')} WHERE address = ? RETURNING *`)
        .bind(...params)
        .first<User>()

      return result ?? null
    },

    /**
     * Update last login timestamp
     */
    async updateLastLogin(address: string): Promise<void> {
      const normalizedAddress = address.toLowerCase()
      const now = new Date().toISOString()

      await db
        .prepare('UPDATE users SET last_login_at = ?, last_active_at = ? WHERE address = ?')
        .bind(now, now, normalizedAddress)
        .run()
    },

    /**
     * Update last active timestamp
     */
    async updateLastActive(address: string): Promise<void> {
      const normalizedAddress = address.toLowerCase()
      const now = new Date().toISOString()

      await db
        .prepare('UPDATE users SET last_active_at = ? WHERE address = ?')
        .bind(now, normalizedAddress)
        .run()
    },

    /**
     * Delete a user (soft delete by deactivating)
     */
    async delete(address: string): Promise<boolean> {
      const normalizedAddress = address.toLowerCase()

      const result = await db
        .prepare('UPDATE users SET is_active = 0, updated_at = ? WHERE address = ?')
        .bind(new Date().toISOString(), normalizedAddress)
        .run()

      return result.meta.changes > 0
    },

    /**
     * Check if a user exists
     */
    async exists(address: string): Promise<boolean> {
      const normalizedAddress = address.toLowerCase()

      const result = await db
        .prepare('SELECT 1 FROM users WHERE address = ?')
        .bind(normalizedAddress)
        .first()

      return result !== null
    },

    /**
     * Count users with optional filters
     */
    async count(filters?: {
      role?: string
      isActive?: boolean
      isBanned?: boolean
    }): Promise<number> {
      const conditions: string[] = []
      const params: (string | number)[] = []

      if (filters?.role !== undefined) {
        conditions.push('role = ?')
        params.push(filters.role)
      }

      if (filters?.isActive !== undefined) {
        conditions.push('is_active = ?')
        params.push(filters.isActive ? 1 : 0)
      }

      if (filters?.isBanned !== undefined) {
        conditions.push('is_banned = ?')
        params.push(filters.isBanned ? 1 : 0)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const result = await db
        .prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`)
        .bind(...params)
        .first<{ count: number }>()

      return result?.count ?? 0
    },

    /**
     * Increment campaigns created counter
     */
    async incrementCampaignsCreated(address: string): Promise<void> {
      const normalizedAddress = address.toLowerCase()

      await db
        .prepare(
          'UPDATE users SET campaigns_created = campaigns_created + 1, updated_at = ? WHERE address = ?',
        )
        .bind(new Date().toISOString(), normalizedAddress)
        .run()
    },

    /**
     * Increment pledges made counter and add to total pledged
     */
    async incrementPledgesMade(address: string, amount: string): Promise<void> {
      const normalizedAddress = address.toLowerCase()

      // Note: SQLite doesn't have native big integer support, so we use string arithmetic
      // In production, consider using a stored procedure or handling this in application code
      await db
        .prepare(
          `UPDATE users SET 
            pledges_made = pledges_made + 1, 
            total_pledged = CAST((CAST(total_pledged AS INTEGER) + CAST(? AS INTEGER)) AS TEXT),
            updated_at = ? 
          WHERE address = ?`,
        )
        .bind(amount, new Date().toISOString(), normalizedAddress)
        .run()
    },
  }
}
