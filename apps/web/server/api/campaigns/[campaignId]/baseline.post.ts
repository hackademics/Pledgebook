import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError, createApiError, ApiErrorCode } from '../../../utils/errors'
import { requireWalletAddress } from '../../../utils/auth'
import { sendSuccess, parseBody, getRequiredParam } from '../../../utils/response'

const baselineBodySchema = z.object({
  evidenceId: z.string().uuid(),
})

/**
 * POST /api/campaigns/:campaignId/baseline
 * Set baseline evidence for a campaign (creator only)
 *
 * @param campaignId - Campaign ID (path parameter)
 * @header X-Wallet-Address - Creator's wallet address (required)
 * @body { evidenceId: string } - Evidence ID to set as baseline
 * @returns {ApiResponse<{ campaignId: string; baselineEvidenceId: string }>}
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    const campaignId = getRequiredParam(event, 'campaignId')
    const walletAddress = requireWalletAddress(event)
    const { evidenceId } = await parseBody(event, baselineBodySchema)

    // Verify caller is the campaign creator
    const campaign = await DB.prepare(
      `SELECT campaign_id, creator_address FROM campaigns WHERE campaign_id = ?`,
    )
      .bind(campaignId)
      .first<{ campaign_id: string; creator_address: string }>()

    if (!campaign) {
      throw createApiError(ApiErrorCode.NOT_FOUND, 'Campaign not found')
    }

    if (campaign.creator_address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw createApiError(
        ApiErrorCode.FORBIDDEN,
        'Only the campaign creator can set baseline evidence',
      )
    }

    // Verify evidence exists and belongs to this campaign
    const evidence = await DB.prepare(
      `SELECT evidence_id, campaign_id FROM evidence WHERE evidence_id = ?`,
    )
      .bind(evidenceId)
      .first<{ evidence_id: string; campaign_id: string | null }>()

    if (!evidence) {
      throw createApiError(ApiErrorCode.NOT_FOUND, 'Evidence not found')
    }

    if (evidence.campaign_id !== campaignId) {
      throw createApiError(ApiErrorCode.BAD_REQUEST, 'Evidence does not belong to this campaign')
    }

    // Update evidence type and campaign reference
    await DB.batch([
      DB.prepare(`UPDATE evidence SET evidence_type = 'baseline' WHERE evidence_id = ?`).bind(
        evidenceId,
      ),
      DB.prepare(`UPDATE campaigns SET baseline_evidence_id = ? WHERE campaign_id = ?`).bind(
        evidenceId,
        campaignId,
      ),
    ])

    return sendSuccess(event, {
      campaignId,
      baselineEvidenceId: evidenceId,
    })
  } catch (error) {
    throw handleError(error)
  }
})
