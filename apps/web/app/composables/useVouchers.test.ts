import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useVouchers } from './useVouchers'

describe('useVouchers', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('exports all voucher methods', () => {
    const vouchers = useVouchers()
    expect(vouchers).toHaveProperty('createVoucher')
    expect(vouchers).toHaveProperty('getVoucher')
    expect(vouchers).toHaveProperty('getVoucherByTxHash')
    expect(vouchers).toHaveProperty('getCampaignVouchers')
    expect(vouchers).toHaveProperty('getVouchersByAddress')
    expect(vouchers).toHaveProperty('updateVoucher')
    expect(vouchers).toHaveProperty('hasUserVouched')
    expect(vouchers).toHaveProperty('getVoucherStats')
    expect(vouchers).toHaveProperty('loading')
    expect(vouchers).toHaveProperty('error')
  })

  it('initializes with loading=false and error=null', () => {
    const { loading, error } = useVouchers()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('createVoucher sends correct data', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'voucher-1', status: 'pending' },
    })

    const { createVoucher } = useVouchers()
    const result = await createVoucher({
      campaignId: 'campaign-1',
      amount: '50000000',
      stakeTxHash: '0xdef456',
      endorsementMessage: 'I support this campaign',
    })

    expect(result.success).toBe(true)
  })

  it('getVoucherStats calculates stats correctly', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        { status: 'active', amount: '100000000' },
        { status: 'active', amount: '200000000' },
        { status: 'released', amount: '50000000' },
      ],
    })

    const { getVoucherStats } = useVouchers()
    const stats = await getVoucherStats('0x1234')

    expect(stats.total).toBe(3)
    expect(stats.active).toBe(2)
    expect(BigInt(stats.totalStaked)).toBe(BigInt('300000000'))
  })

  it('hasUserVouched returns boolean', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [],
    })

    const { hasUserVouched } = useVouchers()
    const result = await hasUserVouched('campaign-1', '0x1234')

    expect(result).toBe(false)
  })

  it('sets error on API failure', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch'))

    const { getVoucher, error } = useVouchers()

    await expect(getVoucher('fake')).rejects.toThrow('Failed to fetch')
    expect(error.value).toBe('Failed to fetch')
  })
})
