// =============================================================================
// USER DOMAIN - BARREL EXPORT
// =============================================================================

// Schemas & Types
export {
  userSchema,
  userResponseSchema,
  userProfileResponseSchema,
  createUserSchema,
  updateUserSchema,
  adminUpdateUserSchema,
  listUsersQuerySchema,
  walletAddressSchema,
  userRoleSchema,
  userPreferencesSchema,
  type User,
  type UserResponse,
  type UserProfileResponse,
  type CreateUserInput,
  type UpdateUserInput,
  type AdminUpdateUserInput,
  type ListUsersQuery,
  type UserRole,
  type UserPreferences,
} from './user.schema'

// Mapper
export {
  toUserResponse,
  toUserResponseList,
  toUserProfileResponse,
  toUserProfileResponseList,
  formatUserDisplayName,
} from './user.mapper'

// Repository
export { type UserRepository, createUserRepository } from './user.repository'

// Service
export { type UserService, createUserService } from './user.service'
