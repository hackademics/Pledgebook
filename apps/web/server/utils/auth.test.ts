import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock h3 getHeader
const mockGetHeader = vi.fn()
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    getHeader: (...args: unknown[]) => mockGetHeader(...args),
  }
})

// Mock #imports
vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn(),
}))

// eslint-disable-next-line import/first
import { requireWalletAddress } from './auth'

function createMockEvent(overrides?: { authAddress?: string; headerValue?: string }): H3Event {
  const event = {
    context: {
      auth: overrides?.authAddress ? { address: overrides.authAddress } : undefined,
    },
    node: { req: {}, res: {} },
    web: {},
  } as unknown as H3Event

  mockGetHeader.mockReturnValue(overrides?.headerValue ?? undefined)

  return event
}

describe('auth utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireWalletAddress', () => {
    it('returns address from SIWE session context', () => {
      const event = createMockEvent({
        authAddress: '0x1234567890abcdef1234567890abcdef12345678',
      })

      const result = requireWalletAddress(event)
      expect(result).toBe('0x1234567890abcdef1234567890abcdef12345678')
    })

    it('throws UNAUTHORIZED when session and header mismatch', () => {
      const event = createMockEvent({
        authAddress: '0x1234567890abcdef1234567890abcdef12345678',
        headerValue: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      })

      expect(() => requireWalletAddress(event)).toThrow()
      try {
        requireWalletAddress(event)
      } catch (error: unknown) {
        const err = error as { statusCode: number; data: { code: string } }
        expect(err.statusCode).toBe(401)
      }
    })

    it('allows matching header and session addresses (case-insensitive)', () => {
      const event = createMockEvent({
        authAddress: '0x1234567890abcdef1234567890abcdef12345678',
        headerValue: '0x1234567890ABCDEF1234567890ABCDEF12345678',
      })

      const result = requireWalletAddress(event)
      expect(result).toBe('0x1234567890abcdef1234567890abcdef12345678')
    })

    it('throws on invalid wallet address format from header', () => {
      const event = createMockEvent({
        headerValue: 'not-a-valid-address',
      })

      expect(() => requireWalletAddress(event)).toThrow()
    })

    it('throws UNAUTHORIZED when no address is provided', () => {
      const event = createMockEvent({})

      expect(() => requireWalletAddress(event)).toThrow()
    })
  })
})
