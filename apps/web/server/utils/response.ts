import type { H3Event } from 'h3'
import { getQuery, getRouterParam, readBody, setResponseStatus } from 'h3'
import type { ZodType, ZodTypeDef } from 'zod'
import type { handleError } from './errors'
import { fromZodError, createApiError, ApiErrorCode } from './errors'

// =============================================================================
// API RESPONSE UTILITIES
// Purpose: Standardized response formatting and request handling
// =============================================================================

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
    [key: string]: unknown
  }
}

/**
 * Create a successful response
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  }

  if (meta) {
    response.meta = meta
  }

  return response
}

/**
 * Create an error response from an API error
 */
export function errorResponse(error: ReturnType<typeof handleError>): ApiResponse<never> {
  return {
    success: false,
    error: {
      code: error.data.code,
      message: error.data.message,
      details: error.data.details,
    },
  }
}

/**
 * Parse and validate request body with Zod schema
 * Uses Output type to ensure defaults are applied
 */
export async function parseBody<Output, Def extends ZodTypeDef, Input>(
  event: H3Event,
  schema: ZodType<Output, Def, Input>,
): Promise<Output> {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw fromZodError(result.error)
  }

  return result.data
}

/**
 * Parse and validate query parameters with Zod schema
 * Uses Output type to ensure defaults are applied
 */
export function parseQuery<Output, Def extends ZodTypeDef, Input>(
  event: H3Event,
  schema: ZodType<Output, Def, Input>,
): Output {
  const query = getQuery(event)
  const result = schema.safeParse(query)

  if (!result.success) {
    throw fromZodError(result.error)
  }

  return result.data
}

/**
 * Get a required route parameter
 */
export function getRequiredParam(event: H3Event, name: string): string {
  const param = getRouterParam(event, name)

  if (!param) {
    throw createApiError(ApiErrorCode.BAD_REQUEST, `Missing required parameter: ${name}`)
  }

  return param
}

/**
 * Set appropriate status code and return response
 */
export function sendSuccess<T>(
  event: H3Event,
  data: T,
  meta?: ApiResponse['meta'],
  statusCode: number = 200,
): ApiResponse<T> {
  setResponseStatus(event, statusCode)
  return successResponse(data, meta)
}

/**
 * Send a 201 Created response
 */
export function sendCreated<T>(event: H3Event, data: T): ApiResponse<T> {
  return sendSuccess(event, data, undefined, 201)
}

/**
 * Send a 204 No Content response
 */
export function respondNoContent(event: H3Event): void {
  setResponseStatus(event, 204)
}
