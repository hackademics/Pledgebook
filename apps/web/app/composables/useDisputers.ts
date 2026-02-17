import { ref, onUnmounted } from 'vue'
import type { ApiResponse, PaginationMeta, PaginationParams } from '../types'
import type {
  DisputerResponse,
  DisputerSummary,
  CreateDisputerInput,
  UpdateDisputerInput,
  ResolveDisputerInput,
} from '../types/disputer'

/**
 * Composable for disputer API operations
 * Includes loading state and automatic request cancellation on unmount
 */
export function useDisputers() {
  const api = useApi()
  const loading = ref(false)
  const error = ref<string | null>(null)

  onUnmounted(() => {
    api.cancelAllRequests()
  })

  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An unknown error occurred'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new dispute
   */
  async function createDispute(input: CreateDisputerInput): Promise<ApiResponse<DisputerResponse>> {
    return withLoading(() => api.post<DisputerResponse>('/disputers', input))
  }

  /**
   * Get a dispute by ID
   */
  async function getDispute(disputeId: string): Promise<ApiResponse<DisputerResponse>> {
    return withLoading(() => api.get<DisputerResponse>(`/disputers/${disputeId}`))
  }

  /**
   * Get a dispute by transaction hash
   */
  async function getDisputeByTxHash(txHash: string): Promise<ApiResponse<DisputerResponse>> {
    return withLoading(() => api.get<DisputerResponse>(`/disputers/tx/${txHash}`))
  }

  /**
   * List disputes for a campaign
   */
  async function getCampaignDisputes(
    campaignId: string,
    params?: PaginationParams,
  ): Promise<ApiResponse<DisputerSummary[]> & { meta?: PaginationMeta }> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return withLoading(() =>
      api.get<DisputerSummary[]>(`/campaigns/${campaignId}/disputers${query}`),
    )
  }

  /**
   * List disputes by address
   */
  async function getDisputesByAddress(
    address: string,
    params?: PaginationParams,
  ): Promise<ApiResponse<DisputerSummary[]> & { meta?: PaginationMeta }> {
    const queryParams = { ...params, disputerAddress: address }
    const query = `?${new URLSearchParams(queryParams as unknown as Record<string, string>)}`
    return withLoading(() => api.get<DisputerSummary[]>(`/disputers${query}`))
  }

  /**
   * Update a dispute
   */
  async function updateDispute(
    disputeId: string,
    input: UpdateDisputerInput,
  ): Promise<ApiResponse<DisputerResponse>> {
    return withLoading(() => api.patch<DisputerResponse>(`/disputers/${disputeId}`, input))
  }

  /**
   * Resolve a dispute (admin only)
   */
  async function resolveDispute(
    disputeId: string,
    input: ResolveDisputerInput,
  ): Promise<ApiResponse<DisputerResponse>> {
    return withLoading(() => api.post<DisputerResponse>(`/disputers/${disputeId}/resolve`, input))
  }

  /**
   * Get pending disputes (admin view)
   */
  async function getPendingDisputes(
    params?: PaginationParams,
  ): Promise<ApiResponse<DisputerSummary[]> & { meta?: PaginationMeta }> {
    const queryParams = { ...params, status: 'pending' }
    const query = `?${new URLSearchParams(queryParams as unknown as Record<string, string>)}`
    return withLoading(() => api.get<DisputerSummary[]>(`/disputers${query}`))
  }

  /**
   * Check if current user has disputed a campaign
   */
  async function hasUserDisputed(campaignId: string, address: string): Promise<boolean> {
    const response = await api.get<DisputerSummary[]>(
      `/disputers?campaignId=${campaignId}&disputerAddress=${address}&limit=1`,
    )
    return response.success && (response.data?.length ?? 0) > 0
  }

  /**
   * Get dispute stats for an address
   */
  async function getDisputeStats(address: string): Promise<{
    total: number
    pending: number
    upheld: number
    rejected: number
  }> {
    const response = await api.get<DisputerSummary[]>(
      `/disputers?disputerAddress=${address}&limit=100`,
    )
    if (!response.success || !response.data) {
      return { total: 0, pending: 0, upheld: 0, rejected: 0 }
    }
    const disputes = response.data
    return {
      total: disputes.length,
      pending: disputes.filter((d: DisputerSummary) => ['pending', 'active'].includes(d.status))
        .length,
      upheld: disputes.filter((d: DisputerSummary) => d.status === 'upheld').length,
      rejected: disputes.filter((d: DisputerSummary) => d.status === 'rejected').length,
    }
  }

  return {
    // State
    loading,
    error,
    // Actions
    createDispute,
    getDispute,
    getDisputeByTxHash,
    getCampaignDisputes,
    getDisputesByAddress,
    updateDispute,
    resolveDispute,
    getPendingDisputes,
    hasUserDisputed,
    getDisputeStats,
  }
}
