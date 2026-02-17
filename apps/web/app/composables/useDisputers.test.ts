import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDisputers } from './useDisputers'

describe('useDisputers', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('exports all disputer methods', () => {
    const disputers = useDisputers()
    expect(disputers).toHaveProperty('createDispute')
    expect(disputers).toHaveProperty('getDispute')
    expect(disputers).toHaveProperty('getDisputeByTxHash')
    expect(disputers).toHaveProperty('getCampaignDisputes')
    expect(disputers).toHaveProperty('getDisputesByAddress')
    expect(disputers).toHaveProperty('updateDispute')
    expect(disputers).toHaveProperty('resolveDispute')
    expect(disputers).toHaveProperty('getPendingDisputes')
    expect(disputers).toHaveProperty('hasUserDisputed')
    expect(disputers).toHaveProperty('getDisputeStats')
    expect(disputers).toHaveProperty('loading')
    expect(disputers).toHaveProperty('error')
  })

  it('initializes with loading=false and error=null', () => {
    const { loading, error } = useDisputers()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('createDispute calls API and sets loading', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'dispute-1', status: 'pending' },
    })

    const { createDispute, loading } = useDisputers()

    const promise = createDispute({
      campaignId: 'campaign-1',
      amount: '25000000',
      stakeTxHash: '0xabc',
      reason: 'Fraudulent campaign',
      disputeType: 'fraud',
      evidence: [],
    })

    // Loading should be true during the call
    expect(loading.value).toBe(true)

    const result = await promise
    expect(result.success).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('getDispute fetches by ID', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'dispute-1', status: 'pending' },
    })

    const { getDispute } = useDisputers()
    const result = await getDispute('dispute-1')

    expect(result.success).toBe(true)
    expect(globalThis.$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/disputers/dispute-1'),
      expect.any(Object),
    )
  })

  it('getDisputeStats returns stats for an address', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        { status: 'pending', disputeType: 'fraud' },
        { status: 'upheld', disputeType: 'general' },
        { status: 'rejected', disputeType: 'fraud' },
      ],
    })

    const { getDisputeStats } = useDisputers()
    const stats = await getDisputeStats('0x1234')

    expect(stats.total).toBe(3)
    expect(stats.pending).toBe(1)
    expect(stats.upheld).toBe(1)
    expect(stats.rejected).toBe(1)
  })

  it('hasUserDisputed returns boolean', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [{ id: 'dispute-1' }],
    })

    const { hasUserDisputed } = useDisputers()
    const result = await hasUserDisputed('campaign-1', '0x1234')

    expect(result).toBe(true)
  })

  it('sets error on API failure', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { getDispute, error } = useDisputers()

    await expect(getDispute('fake-id')).rejects.toThrow('Network error')
    expect(error.value).toBe('Network error')
  })
})
