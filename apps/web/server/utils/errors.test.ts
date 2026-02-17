import { describe, it, expect } from 'vitest'
import { ZodError, z } from 'zod'
import { ApiErrorCode, createApiError, isApiError, fromZodError, handleError } from './errors'

describe('errors utility', () => {
  describe('createApiError', () => {
    it('creates a BAD_REQUEST error with status 400', () => {
      const error = createApiError(ApiErrorCode.BAD_REQUEST, 'Bad input')
      expect(error.statusCode).toBe(400)
      expect(error.data.code).toBe(ApiErrorCode.BAD_REQUEST)
      expect(error.data.message).toBe('Bad input')
    })

    it('creates a NOT_FOUND error with status 404', () => {
      const error = createApiError(ApiErrorCode.NOT_FOUND, 'Campaign not found')
      expect(error.statusCode).toBe(404)
      expect(error.data.code).toBe(ApiErrorCode.NOT_FOUND)
    })

    it('creates an UNAUTHORIZED error with status 401', () => {
      const error = createApiError(ApiErrorCode.UNAUTHORIZED, 'Missing token')
      expect(error.statusCode).toBe(401)
    })

    it('creates a FORBIDDEN error with status 403', () => {
      const error = createApiError(ApiErrorCode.FORBIDDEN, 'Admin only')
      expect(error.statusCode).toBe(403)
    })

    it('creates an INTERNAL_ERROR with status 500', () => {
      const error = createApiError(ApiErrorCode.INTERNAL_ERROR, 'Something broke')
      expect(error.statusCode).toBe(500)
    })

    it('includes additional details when provided', () => {
      const error = createApiError(ApiErrorCode.CONFLICT, 'Duplicate', { field: 'email' })
      expect(error.data.details).toEqual({ field: 'email' })
    })
  })

  describe('isApiError', () => {
    it('returns true for API errors', () => {
      const error = createApiError(ApiErrorCode.BAD_REQUEST, 'test')
      expect(isApiError(error)).toBe(true)
    })

    it('returns false for plain Error', () => {
      expect(isApiError(new Error('plain'))).toBe(false)
    })

    it('returns false for non-error values', () => {
      expect(isApiError(null)).toBe(false)
      expect(isApiError('string')).toBe(false)
      expect(isApiError(42)).toBe(false)
    })
  })

  describe('fromZodError', () => {
    it('converts ZodError to VALIDATION_ERROR', () => {
      const schema = z.object({ email: z.string().email() })
      try {
        schema.parse({ email: 'not-an-email' })
      } catch (err) {
        const apiError = fromZodError(err as ZodError)
        expect(apiError.statusCode).toBe(400)
        expect(apiError.data.code).toBe(ApiErrorCode.VALIDATION_ERROR)
        expect(apiError.data.message).toBe('Validation failed')
        expect(apiError.data.details).toBeDefined()
        expect((apiError.data.details as Record<string, unknown>).issues).toBeDefined()
      }
    })
  })

  describe('handleError', () => {
    it('returns API errors unchanged', () => {
      const original = createApiError(ApiErrorCode.NOT_FOUND, 'Not found')
      const result = handleError(original)
      expect(result).toBe(original)
    })

    it('converts ZodError to validation error', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string',
        },
      ])
      const result = handleError(zodError)
      expect(result.statusCode).toBe(400)
      expect(result.data.code).toBe(ApiErrorCode.VALIDATION_ERROR)
    })

    it('converts generic Error to INTERNAL_ERROR', () => {
      const result = handleError(new Error('Something went wrong'))
      expect(result.statusCode).toBe(500)
      expect(result.data.code).toBe(ApiErrorCode.INTERNAL_ERROR)
    })

    it('handles unknown error values', () => {
      const result = handleError('unexpected string error')
      expect(result.statusCode).toBe(500)
      expect(result.data.code).toBe(ApiErrorCode.INTERNAL_ERROR)
    })

    it('handles null error', () => {
      const result = handleError(null)
      expect(result.statusCode).toBe(500)
    })
  })
})
