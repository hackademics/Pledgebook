import type { ApiResponse, PaginationMeta, PaginationParams } from '../types'
import type {
  VoucherResponse,
  VoucherSummary,
  CreateVoucherInput,
  UpdateVoucherInput,
} from '../types/voucher'

/**
 * Composable for voucher API operations
 */
export function useVouchers() {
  const api = useApi()

  /**
   * Create a new voucher
   */
  async function createVoucher(input: CreateVoucherInput): Promise<ApiResponse<VoucherResponse>> {
    return api.post<VoucherResponse>('/vouchers', input)
  }

  /**
   * Get a voucher by ID
   */
  async function getVoucher(voucherId: string): Promise<ApiResponse<VoucherResponse>> {
    return api.get<VoucherResponse>(`/vouchers/${voucherId}`)
  }

  /**
   * Get a voucher by transaction hash
   */
  async function getVoucherByTxHash(txHash: string): Promise<ApiResponse<VoucherResponse>> {
    return api.get<VoucherResponse>(`/vouchers/tx/${txHash}`)
  }

  /**
   * List vouchers for a campaign
   */
  async function getCampaignVouchers(
    campaignId: string,
    params?: PaginationParams,
  ): Promise<ApiResponse<VoucherSummary[]> & { meta?: PaginationMeta }> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return api.get<VoucherSummary[]>(`/campaigns/${campaignId}/vouchers${query}`)
  }

  /**
   * List vouchers by address
   */
  async function getVouchersByAddress(
    address: string,
    params?: PaginationParams,
  ): Promise<ApiResponse<VoucherSummary[]> & { meta?: PaginationMeta }> {
    const queryParams = { ...params, voucherAddress: address }
    const query = `?${new URLSearchParams(queryParams as unknown as Record<string, string>)}`
    return api.get<VoucherSummary[]>(`/vouchers${query}`)
  }

  /**
   * Update a voucher
   */
  async function updateVoucher(
    voucherId: string,
    input: UpdateVoucherInput,
  ): Promise<ApiResponse<VoucherResponse>> {
    return api.patch<VoucherResponse>(`/vouchers/${voucherId}`, input)
  }

  /**
   * Check if current user has vouched for a campaign
   */
  async function hasUserVouched(campaignId: string, address: string): Promise<boolean> {
    const response = await api.get<VoucherSummary[]>(
      `/vouchers?campaignId=${campaignId}&voucherAddress=${address}&limit=1`,
    )
    return response.success && (response.data?.length ?? 0) > 0
  }

  /**
   * Get voucher stats for an address
   */
  async function getVoucherStats(address: string): Promise<{
    total: number
    active: number
    totalStaked: string
  }> {
    const response = await api.get<VoucherSummary[]>(
      `/vouchers?voucherAddress=${address}&limit=100`,
    )
    if (!response.success || !response.data) {
      return { total: 0, active: 0, totalStaked: '0' }
    }
    const vouchers = response.data
    const active = vouchers.filter((v: VoucherSummary) => v.status === 'active').length
    const totalStaked = vouchers
      .filter((v: VoucherSummary) => ['pending', 'active'].includes(v.status))
      .reduce((sum: bigint, v: VoucherSummary) => sum + BigInt(v.amount), BigInt(0))
    return {
      total: vouchers.length,
      active,
      totalStaked: totalStaked.toString(),
    }
  }

  return {
    createVoucher,
    getVoucher,
    getVoucherByTxHash,
    getCampaignVouchers,
    getVouchersByAddress,
    updateVoucher,
    hasUserVouched,
    getVoucherStats,
  }
}
