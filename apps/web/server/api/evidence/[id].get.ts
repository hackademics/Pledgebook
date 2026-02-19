import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError, createApiError, ApiErrorCode } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'

/**
 * GET /api/evidence/:id
 * Fetch a single evidence record by ID
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)
    const evidenceId = getRequiredParam(event, 'id')

    const evidence = await DB.prepare(
      `
      SELECT 
        evidence_id,
        campaign_id,
        uploader_address,
        ipfs_cid,
        ipfs_url,
        gateway_url,
        content_type,
        file_name,
        size_bytes,
        evidence_type,
        verification_status,
        verification_result,
        verified_at,
        created_at
      FROM evidence 
      WHERE evidence_id = ?
    `,
    )
      .bind(evidenceId)
      .first()

    if (!evidence) {
      throw createApiError(ApiErrorCode.NOT_FOUND, 'Evidence not found')
    }

    // Parse verification_result if it exists
    let verificationResult = null
    if (evidence.verification_result && evidence.verification_result !== 'null') {
      try {
        verificationResult = JSON.parse(evidence.verification_result as string)
      } catch {
        verificationResult = null
      }
    }

    return sendSuccess(event, {
      evidenceId: evidence.evidence_id,
      campaignId: evidence.campaign_id,
      uploaderAddress: evidence.uploader_address,
      ipfsCid: evidence.ipfs_cid,
      ipfsUrl: evidence.ipfs_url,
      gatewayUrl: evidence.gateway_url,
      contentType: evidence.content_type,
      fileName: evidence.file_name,
      sizeBytes: evidence.size_bytes,
      evidenceType: evidence.evidence_type,
      verificationStatus: evidence.verification_status,
      verificationResult,
      verifiedAt: evidence.verified_at,
      createdAt: evidence.created_at,
    })
  } catch (error) {
    throw handleError(error)
  }
})
