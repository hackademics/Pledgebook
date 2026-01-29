import { H3Error, createError } from 'h3'
import { ZodError } from 'zod'

// =============================================================================
// API ERROR UTILITIES
// Purpose: Standardized error handling across the application
// =============================================================================

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * HTTP status codes mapped to error codes
 */
const errorStatusMap: Record<ApiErrorCode, number> = {
  [ApiErrorCode.BAD_REQUEST]: 400,
  [ApiErrorCode.VALIDATION_ERROR]: 400,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.RATE_LIMITED]: 429,
  [ApiErrorCode.INTERNAL_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
}

/**
 * API Error class with additional context
 */
export interface ApiError extends H3Error {
  data: {
    code: ApiErrorCode
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * Create a standardized API error
 */
export function createApiError(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  const statusCode = errorStatusMap[code] || 500

  return createError({
    statusCode,
    statusMessage: code,
    message,
    data: {
      code,
      message,
      details,
    },
  }) as ApiError
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'statusCode' in error && 'data' in error
}

/**
 * Convert a Zod validation error to an API error
 */
export function fromZodError(error: ZodError): ApiError {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }))

  return createApiError(ApiErrorCode.VALIDATION_ERROR, 'Validation failed', { issues })
}

/**
 * Wrap an error handler with consistent error formatting
 */
export function handleError(error: unknown): ApiError {
  // Already an API error
  if (isApiError(error)) {
    return error
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return fromZodError(error)
  }

  // H3 error
  if (error instanceof H3Error) {
    return createApiError(ApiErrorCode.INTERNAL_ERROR, error.message, {
      originalStatusCode: error.statusCode,
    })
  }

  // Generic error
  if (error instanceof Error) {
    return createApiError(ApiErrorCode.INTERNAL_ERROR, error.message)
  }

  // Unknown error
  return createApiError(ApiErrorCode.INTERNAL_ERROR, 'An unexpected error occurred')
}
