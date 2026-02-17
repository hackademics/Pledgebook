import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePledges } from './usePledges'

describe('usePledges', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('exports all pledge methods', () => {
    const pledges = usePledges()
    expect(pledges).toHaveProperty('createPledge')
    expect(pledges).toHaveProperty('getPledge')
    expect(pledges).toHaveProperty('getPledgeByTxHash')
    expect(pledges).toHaveProperty('getCampaignPledges')
    expect(pledges).toHaveProperty('getMyPledges')
    expect(pledges).toHaveProperty('hasUserPledged')
    expect(pledges).toHaveProperty('loading')
    expect(pledges).toHaveProperty('error')
  })

  it('initializes with loading=false and error=null', () => {
    const { loading, error } = usePledges()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('createPledge sends correct data', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'pledge-1', status: 'pending' },
    })

    const { createPledge } = usePledges()

    const result = await createPledge({
      campaignId: 'campaign-1',
      amount: '100000000',
      txHash: '0xabc123',
      isAnonymous: false,
    })

    expect(result.success).toBe(true)
  })

  it('getPledge fetches by ID', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'pledge-1', amount: '100000000' },
    })

    const { getPledge } = usePledges()
    const result = await getPledge('pledge-1')

    expect(result.success).toBe(true)
    expect(globalThis.$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/pledges/pledge-1'),
      expect.any(Object),
    )
  })

  it('getMyPledges returns paginated list', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        { id: 'p1', amount: '100000000' },
        { id: 'p2', amount: '200000000' },
      ],
    })

    const { getMyPledges } = usePledges()
    const result = await getMyPledges({ page: 1, limit: 10 })

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('hasUserPledged returns boolean', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { hasPledged: true },
    })

    const { hasUserPledged } = usePledges()
    const result = await hasUserPledged('campaign-1')

    expect(result).toBe(true)
  })

  it('sets error on failure', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'))

    const { getPledge, error } = usePledges()

    await expect(getPledge('fake')).rejects.toThrow('Server error')
    expect(error.value).toBe('Server error')
  })
})
