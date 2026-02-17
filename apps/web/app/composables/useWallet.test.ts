import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWallet } from './useWallet'

// Mock window.ethereum
const mockEthereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
}

describe('useWallet', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      ...globalThis.window,
      ethereum: mockEthereum,
    })
    mockEthereum.request.mockReset()
    mockEthereum.on.mockReset()
    mockEthereum.removeListener.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('initializes with disconnected state', () => {
    const { isConnected, address } = useWallet()
    expect(isConnected.value).toBe(false)
    expect(address.value).toBeNull()
  })

  it('exports required functions and state', () => {
    const wallet = useWallet()
    expect(wallet).toHaveProperty('isConnected')
    expect(wallet).toHaveProperty('address')
    expect(wallet).toHaveProperty('connect')
    expect(wallet).toHaveProperty('disconnect')
    expect(wallet).toHaveProperty('getPublicClient')
    expect(wallet).toHaveProperty('getWalletClient')
    expect(wallet).toHaveProperty('isCorrectNetwork')
    expect(wallet).toHaveProperty('switchToCorrectNetwork')
  })

  it('connect requests ethereum accounts', async () => {
    mockEthereum.request.mockResolvedValueOnce(['0x1234567890abcdef1234567890abcdef12345678'])

    const { connect } = useWallet()
    await connect('metamask')

    expect(mockEthereum.request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'eth_requestAccounts' }),
    )
  })

  it('disconnect clears address', async () => {
    const { disconnect, address } = useWallet()
    await disconnect()
    expect(address.value).toBeNull()
  })

  it('getPublicClient returns a client or null', () => {
    const { getPublicClient } = useWallet()
    const client = getPublicClient()
    // May be null if not connected
    expect(client === null || typeof client === 'object').toBe(true)
  })

  it('getWalletClient returns a client or null', () => {
    const { getWalletClient } = useWallet()
    const client = getWalletClient()
    expect(client === null || typeof client === 'object').toBe(true)
  })
})
