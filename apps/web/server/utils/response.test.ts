import { describe, it, expect } from 'vitest'
import { successResponse, errorResponse } from './response'
import { createApiError, ApiErrorCode } from './errors'

describe('response utility', () => {
  describe('successResponse', () => {
    it('creates a response with success=true and data', () => {
      const result = successResponse({ id: 1, name: 'Test' })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, name: 'Test' })
      expect(result.meta).toBeUndefined()
    })

    it('includes meta when provided', () => {
      const result = successResponse([1, 2, 3], { page: 1, limit: 10, total: 100 })
      expect(result.success).toBe(true)
      expect(result.data).toEqual([1, 2, 3])
      expect(result.meta).toEqual({ page: 1, limit: 10, total: 100 })
    })

    it('handles null data', () => {
      const result = successResponse(null)
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('handles empty object data', () => {
      const result = successResponse({})
      expect(result.success).toBe(true)
      expect(result.data).toEqual({})
    })
  })

  describe('errorResponse', () => {
    it('creates a response with success=false from API error', () => {
      const error = createApiError(ApiErrorCode.NOT_FOUND, 'Campaign not found')
      const result = errorResponse(error)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe(ApiErrorCode.NOT_FOUND)
      expect(result.error!.message).toBe('Campaign not found')
    })

    it('includes details from API error', () => {
      const error = createApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid input', {
        field: 'email',
        issue: 'invalid_format',
      })
      const result = errorResponse(error)
      expect(result.error!.details).toEqual({ field: 'email', issue: 'invalid_format' })
    })

    it('handles error without details', () => {
      const error = createApiError(ApiErrorCode.INTERNAL_ERROR, 'Server error')
      const result = errorResponse(error)
      expect(result.error!.details).toBeUndefined()
    })
  })
})
