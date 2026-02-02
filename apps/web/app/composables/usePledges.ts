import type { PaginationParams, ApiResponse, PaginationMeta } from '../types'
import type { PledgeResponse, PledgeSummary, CreatePledgeInput } from '../types/pledge'

/**
 * Composable for pledge API operations
 */
export function usePledges() {
  const api = useApi()

  /**
   * Create a new pledge
   */
  async function createPledge(input: CreatePledgeInput): Promise<ApiResponse<PledgeResponse>> {
    return api.post<PledgeResponse>('/pledges', input)
  }

  /**
   * Get a pledge by ID
   */
  async function getPledge(pledgeId: string): Promise<ApiResponse<PledgeResponse>> {
    return api.get<PledgeResponse>(`/pledges/${pledgeId}`)
  }

  /**
   * Get a pledge by transaction hash
   */
  async function getPledgeByTxHash(txHash: string): Promise<ApiResponse<PledgeResponse>> {
    return api.get<PledgeResponse>(`/pledges/tx/${txHash}`)
  }

  /**
   * List pledges for a campaign
   */
  async function getCampaignPledges(
    campaignId: string,
    params?: PaginationParams,
  ): Promise<ApiResponse<PledgeSummary[]> & { meta?: PaginationMeta }> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return api.get<PledgeSummary[]>(`/campaigns/${campaignId}/pledges${query}`)
  }

  /**
   * List pledges by the current user
   */
  async function getMyPledges(
    params?: PaginationParams,
  ): Promise<ApiResponse<PledgeSummary[]> & { meta?: PaginationMeta }> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return api.get<PledgeSummary[]>(`/pledges/me${query}`)
  }

  /**
   * Check if current user has pledged to a campaign
   */
  async function hasUserPledged(campaignId: string): Promise<boolean> {
    const response = await api.get<{ hasPledged: boolean }>(
      `/campaigns/${campaignId}/pledges/check`,
    )
    return response.success && response.data?.hasPledged === true
  }

  return {
    createPledge,
    getPledge,
    getPledgeByTxHash,
    getCampaignPledges,
    getMyPledges,
    hasUserPledged,
  }
}
