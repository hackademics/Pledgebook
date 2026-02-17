import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock useRuntimeConfig
const mockRuntimeConfig = vi.fn()
vi.mock('#imports', () => ({
  useRuntimeConfig: (...args: unknown[]) => mockRuntimeConfig(...args),
}))

// Mock h3 getHeader
const mockGetHeader = vi.fn()
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    getHeader: (...args: unknown[]) => mockGetHeader(...args),
  }
})

// eslint-disable-next-line import/first
import { isAdminAddress, requireAdmin } from './admin'

function createMockEvent(overrides?: {
  authAddress?: string
  headerValue?: string
  adminAllowlist?: string
}): H3Event {
  const event = {
    context: {
      auth: overrides?.authAddress ? { address: overrides.authAddress } : undefined,
    },
    node: { req: {}, res: {} },
    web: {},
  } as unknown as H3Event

  mockGetHeader.mockReturnValue(overrides?.headerValue ?? undefined)
  mockRuntimeConfig.mockReturnValue({
    adminWalletAllowlist: overrides?.adminAllowlist ?? '',
  })

  return event
}

describe('admin utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isAdminAddress', () => {
    it('returns true for address in allowlist', () => {
      const event = createMockEvent({
        adminAllowlist:
          '0xadmin1111111111111111111111111111111111,0xadmin2222222222222222222222222222222222',
      })

      expect(isAdminAddress(event, '0xadmin1111111111111111111111111111111111')).toBe(true)
    })

    it('returns false for address not in allowlist', () => {
      const event = createMockEvent({
        adminAllowlist: '0xadmin1111111111111111111111111111111111',
      })

      expect(isAdminAddress(event, '0xuser0000000000000000000000000000000000')).toBe(false)
    })

    it('is case-insensitive', () => {
      const event = createMockEvent({
        adminAllowlist: '0xADMIN1111111111111111111111111111111111',
      })

      expect(isAdminAddress(event, '0xadmin1111111111111111111111111111111111')).toBe(true)
    })

    it('returns false for empty allowlist', () => {
      const event = createMockEvent({ adminAllowlist: '' })

      expect(isAdminAddress(event, '0xadmin1111111111111111111111111111111111')).toBe(false)
    })
  })

  describe('requireAdmin', () => {
    it('returns address for valid admin from session', () => {
      const event = createMockEvent({
        authAddress: '0xadmin1111111111111111111111111111111111',
        adminAllowlist: '0xadmin1111111111111111111111111111111111',
      })

      const result = requireAdmin(event)
      expect(result).toBe('0xadmin1111111111111111111111111111111111')
    })

    it('throws FORBIDDEN for non-admin address', () => {
      const event = createMockEvent({
        authAddress: '0xuser0000000000000000000000000000000000',
        adminAllowlist: '0xadmin1111111111111111111111111111111111',
      })

      expect(() => requireAdmin(event)).toThrow()
      try {
        requireAdmin(event)
      } catch (error: unknown) {
        const err = error as { statusCode: number }
        expect(err.statusCode).toBe(403)
      }
    })

    it('throws UNAUTHORIZED when no address provided', () => {
      const event = createMockEvent({ adminAllowlist: '0xadmin1111111111111111111111111111111111' })

      expect(() => requireAdmin(event)).toThrow()
      try {
        requireAdmin(event)
      } catch (error: unknown) {
        const err = error as { statusCode: number }
        expect(err.statusCode).toBe(401)
      }
    })

    it('throws SERVICE_UNAVAILABLE when allowlist not configured', () => {
      const event = createMockEvent({
        authAddress: '0xadmin1111111111111111111111111111111111',
        adminAllowlist: '',
      })

      expect(() => requireAdmin(event)).toThrow()
      try {
        requireAdmin(event)
      } catch (error: unknown) {
        const err = error as { statusCode: number }
        expect(err.statusCode).toBe(503)
      }
    })

    it('throws BAD_REQUEST for invalid address format', () => {
      const event = createMockEvent({
        authAddress: 'not-an-address',
        adminAllowlist: '0xadmin1111111111111111111111111111111111',
      })

      expect(() => requireAdmin(event)).toThrow()
      try {
        requireAdmin(event)
      } catch (error: unknown) {
        const err = error as { statusCode: number }
        expect(err.statusCode).toBe(400)
      }
    })
  })
})
