import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the SIWE utility
const mockVerifySiweSession = vi.fn()
vi.mock('../utils/siwe', () => ({
  SIWE_TOKEN_COOKIE: 'siwe_token',
  verifySiweSession: (...args: unknown[]) => mockVerifySiweSession(...args),
}))

// Mock h3 functions
const mockGetCookie = vi.fn()
const mockGetHeader = vi.fn()
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    defineEventHandler: (fn: (...args: unknown[]) => unknown) => fn,
    getCookie: (...args: unknown[]) => mockGetCookie(...args),
    getHeader: (...args: unknown[]) => mockGetHeader(...args),
  }
})

// eslint-disable-next-line import/first
import siweAuth from './siwe-auth'

type SiweHandler = (event: ReturnType<typeof createMockEvent>) => Promise<void>

function createMockEvent() {
  return {
    context: {} as Record<string, unknown>,
    node: { req: {}, res: {} },
  }
}

describe('siwe-auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing when no token is present', async () => {
    const event = createMockEvent()
    mockGetCookie.mockReturnValue(undefined)
    mockGetHeader.mockReturnValue(undefined)

    await (siweAuth as SiweHandler)(event)

    expect(mockVerifySiweSession).not.toHaveBeenCalled()
    expect(event.context.auth).toBeUndefined()
  })

  it('sets auth context from valid cookie token', async () => {
    const event = createMockEvent()
    mockGetCookie.mockReturnValue('valid-jwt-token')
    mockGetHeader.mockReturnValue(undefined)
    mockVerifySiweSession.mockResolvedValue({ address: '0xuser123' })

    await (siweAuth as SiweHandler)(event)

    expect(mockVerifySiweSession).toHaveBeenCalledWith(event, 'valid-jwt-token')
    expect(event.context.auth).toEqual({ address: '0xuser123' })
  })

  it('sets auth context from Bearer authorization header', async () => {
    const event = createMockEvent()
    mockGetCookie.mockReturnValue(undefined)
    mockGetHeader.mockReturnValue('Bearer bearer-token-here')
    mockVerifySiweSession.mockResolvedValue({ address: '0xuser456' })

    await (siweAuth as SiweHandler)(event)

    expect(mockVerifySiweSession).toHaveBeenCalledWith(event, 'bearer-token-here')
    expect(event.context.auth).toEqual({ address: '0xuser456' })
  })

  it('prefers cookie token over Bearer header', async () => {
    const event = createMockEvent()
    mockGetCookie.mockReturnValue('cookie-token')
    mockGetHeader.mockReturnValue('Bearer header-token')
    mockVerifySiweSession.mockResolvedValue({ address: '0xfromcookie' })

    await (siweAuth as SiweHandler)(event)

    expect(mockVerifySiweSession).toHaveBeenCalledWith(event, 'cookie-token')
  })

  it('does not set auth context when session verification fails', async () => {
    const event = createMockEvent()
    mockGetCookie.mockReturnValue('expired-token')
    mockGetHeader.mockReturnValue(undefined)
    mockVerifySiweSession.mockResolvedValue(null)

    await (siweAuth as SiweHandler)(event)

    expect(event.context.auth).toBeUndefined()
  })

  it('ignores non-Bearer authorization headers', async () => {
    const event = createMockEvent()
    mockGetCookie.mockReturnValue(undefined)
    mockGetHeader.mockReturnValue('Basic dXNlcjpwYXNz')

    await (siweAuth as SiweHandler)(event)

    expect(mockVerifySiweSession).not.toHaveBeenCalled()
    expect(event.context.auth).toBeUndefined()
  })
})
