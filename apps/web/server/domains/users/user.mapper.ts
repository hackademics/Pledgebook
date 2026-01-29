import type { User, UserResponse, UserProfileResponse, UserPreferences } from './user.schema'

// =============================================================================
// USER MAPPER
// Purpose: Transform between database rows and API response formats
// =============================================================================

/**
 * Parse preferences JSON string to object
 */
function parsePreferences(preferences: string | UserPreferences): UserPreferences {
  if (typeof preferences === 'object') {
    return preferences
  }
  try {
    return JSON.parse(preferences) as UserPreferences
  } catch {
    return { privacyMode: false, notifications: true }
  }
}

/**
 * Maps a database row to the full API response format
 * Converts snake_case to camelCase and transforms types
 */
export function toUserResponse(row: User): UserResponse {
  return {
    address: row.address,
    role: row.role,
    preferences: parsePreferences(row.preferences),
    displayName: row.display_name ?? null,
    ensName: row.ens_name ?? null,
    avatarUrl: row.avatar_url ?? null,
    reputationScore: row.reputation_score,
    campaignsCreated: row.campaigns_created,
    pledgesMade: row.pledges_made,
    totalPledged: row.total_pledged,
    isActive: Boolean(row.is_active),
    isBanned: Boolean(row.is_banned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at ?? null,
    lastActiveAt: row.last_active_at ?? null,
  }
}

/**
 * Maps a database row to public profile format (limited info)
 */
export function toUserProfileResponse(row: User): UserProfileResponse {
  return {
    address: row.address,
    displayName: row.display_name ?? null,
    ensName: row.ens_name ?? null,
    avatarUrl: row.avatar_url ?? null,
    reputationScore: row.reputation_score,
    campaignsCreated: row.campaigns_created,
    pledgesMade: row.pledges_made,
    createdAt: row.created_at,
  }
}

/**
 * Maps multiple database rows to full API response format
 */
export function toUserResponseList(rows: User[]): UserResponse[] {
  return rows.map(toUserResponse)
}

/**
 * Maps multiple database rows to public profile format
 */
export function toUserProfileResponseList(rows: User[]): UserProfileResponse[] {
  return rows.map(toUserProfileResponse)
}

/**
 * Format display name or return truncated address
 */
export function formatUserDisplayName(user: User): string {
  if (user.display_name) return user.display_name
  if (user.ens_name) return user.ens_name
  return `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
}
