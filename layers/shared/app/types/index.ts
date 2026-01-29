/**
 * Generic API response type
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: PaginationMeta
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * User entity
 */
export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: UserRole
  status: UserStatus
}

/**
 * User roles
 */
export type UserRole = 'admin' | 'user' | 'guest'

/**
 * User status
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

/**
 * Async data state
 */
export interface AsyncState<T> {
  data: T | null
  pending: boolean
  error: Error | null
}

/**
 * Form field state
 */
export interface FormField<T = string> {
  value: T
  error: string | null
  touched: boolean
  dirty: boolean
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Breakpoint sizes
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Component size variants
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Component color variants
 */
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
