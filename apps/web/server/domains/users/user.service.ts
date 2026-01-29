import type { UserRepository } from './user.repository'
import type {
  UserResponse,
  UserProfileResponse,
  CreateUserInput,
  UpdateUserInput,
  AdminUpdateUserInput,
  ListUsersQuery,
} from './user.schema'
import {
  toUserResponse,
  toUserResponseList,
  toUserProfileResponse,
  toUserProfileResponseList,
} from './user.mapper'
import { createApiError, ApiErrorCode } from '../../utils/errors'

// =============================================================================
// USER SERVICE
// Purpose: Business logic layer for User operations
// Pattern: Service layer that orchestrates repository calls and applies business rules
// =============================================================================

export interface UserService {
  getByAddress(address: string): Promise<UserResponse>
  getProfileByAddress(address: string): Promise<UserProfileResponse>
  getAll(query: ListUsersQuery): Promise<{
    data: UserResponse[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getLeaderboard(limit?: number): Promise<UserProfileResponse[]>
  create(input: CreateUserInput): Promise<UserResponse>
  update(address: string, input: UpdateUserInput): Promise<UserResponse>
  adminUpdate(address: string, input: AdminUpdateUserInput): Promise<UserResponse>
  recordLogin(address: string): Promise<UserResponse>
  recordActivity(address: string): Promise<void>
  deactivate(address: string): Promise<void>
}

/**
 * Create a UserService instance
 */
export function createUserService(repository: UserRepository): UserService {
  return {
    /**
     * Get a user by wallet address (full details)
     * @throws ApiError if not found
     */
    async getByAddress(address: string): Promise<UserResponse> {
      const user = await repository.findByAddress(address)

      if (!user) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `User with address '${address}' not found`, {
          resourceType: 'user',
          resourceId: address,
        })
      }

      return toUserResponse(user)
    },

    /**
     * Get a user's public profile
     * @throws ApiError if not found
     */
    async getProfileByAddress(address: string): Promise<UserProfileResponse> {
      const user = await repository.findByAddress(address)

      if (!user) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `User with address '${address}' not found`, {
          resourceType: 'user',
          resourceId: address,
        })
      }

      // Check if user has privacy mode enabled
      const preferences =
        typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences

      if (preferences.privacyMode) {
        // Return limited info for privacy mode users
        return {
          address: user.address,
          displayName: null,
          ensName: null,
          avatarUrl: null,
          reputationScore: user.reputation_score,
          campaignsCreated: user.campaigns_created,
          pledgesMade: user.pledges_made,
          createdAt: user.created_at,
        }
      }

      return toUserProfileResponse(user)
    },

    /**
     * Get all users with pagination and filtering
     */
    async getAll(query: ListUsersQuery): Promise<{
      data: UserResponse[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await repository.findAll(query)

      return {
        data: toUserResponseList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get top users by reputation (leaderboard)
     */
    async getLeaderboard(limit = 10): Promise<UserProfileResponse[]> {
      const users = await repository.findTopByReputation(limit)
      return toUserProfileResponseList(users)
    },

    /**
     * Create a new user (first wallet connection)
     * @throws ApiError if address already exists
     */
    async create(input: CreateUserInput): Promise<UserResponse> {
      // Check if address already exists
      const exists = await repository.exists(input.address)
      if (exists) {
        throw createApiError(
          ApiErrorCode.CONFLICT,
          `User with address '${input.address}' already exists`,
          { field: 'address', value: input.address }
        )
      }

      const user = await repository.create(input)
      return toUserResponse(user)
    },

    /**
     * Update user profile (self-update)
     * @throws ApiError if not found
     */
    async update(address: string, input: UpdateUserInput): Promise<UserResponse> {
      const exists = await repository.exists(address)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `User with address '${address}' not found`, {
          resourceType: 'user',
          resourceId: address,
        })
      }

      const user = await repository.update(address, input)
      if (!user) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update user')
      }

      return toUserResponse(user)
    },

    /**
     * Admin update user (can modify role, ban status, etc.)
     * @throws ApiError if not found
     */
    async adminUpdate(address: string, input: AdminUpdateUserInput): Promise<UserResponse> {
      const exists = await repository.exists(address)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `User with address '${address}' not found`, {
          resourceType: 'user',
          resourceId: address,
        })
      }

      const user = await repository.update(address, input)
      if (!user) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update user')
      }

      return toUserResponse(user)
    },

    /**
     * Record user login (creates user if not exists, updates last_login)
     */
    async recordLogin(address: string): Promise<UserResponse> {
      const exists = await repository.exists(address)

      if (!exists) {
        // First-time login, create user
        const user = await repository.create({ address })
        return toUserResponse(user)
      }

      // Update last login
      await repository.updateLastLogin(address)
      const user = await repository.findByAddress(address)

      if (!user) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to record login')
      }

      // Check if banned
      if (user.is_banned) {
        throw createApiError(ApiErrorCode.FORBIDDEN, 'Account is banned', {
          reason: user.ban_reason,
        })
      }

      return toUserResponse(user)
    },

    /**
     * Record user activity (heartbeat)
     */
    async recordActivity(address: string): Promise<void> {
      const exists = await repository.exists(address)
      if (exists) {
        await repository.updateLastActive(address)
      }
    },

    /**
     * Deactivate a user account
     * @throws ApiError if not found
     */
    async deactivate(address: string): Promise<void> {
      const exists = await repository.exists(address)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `User with address '${address}' not found`, {
          resourceType: 'user',
          resourceId: address,
        })
      }

      const deleted = await repository.delete(address)
      if (!deleted) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to deactivate user')
      }
    },
  }
}
