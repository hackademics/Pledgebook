import { defineEventHandler, createError, getHeader, readMultipartFormData } from 'h3'
import { useRuntimeConfig } from '#imports'
import { sendSuccess } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { requireTurnstile } from '../../utils/turnstile'
import { createLogger } from '../../utils/logger'

const logger = createLogger('IPFSUpload')

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Allowed MIME types
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10

function readTextPart(part: { data?: string | Uint8Array } | undefined): string | null {
  if (!part || part.data === undefined) {
    return null
  }
  if (typeof part.data === 'string') {
    return part.data
  }
  if (part.data instanceof Uint8Array) {
    return new TextDecoder().decode(part.data)
  }
  return null
}

/**
 * Generate a unique file key
 */
function generateFileKey(originalName: string, contentType: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  const ext = contentType.split('/')[1] || 'bin'
  const safeName = originalName
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 32)
  return `uploads/${timestamp}-${random}-${safeName}.${ext}`
}

function validateMagicBytes(data: Uint8Array, mime: string): boolean {
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return data.length > 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
  }
  if (mime === 'image/png') {
    return (
      data.length > 7 &&
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47 &&
      data[4] === 0x0d &&
      data[5] === 0x0a &&
      data[6] === 0x1a &&
      data[7] === 0x0a
    )
  }
  if (mime === 'image/gif') {
    return (
      data.length > 5 &&
      data[0] === 0x47 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x38 &&
      (data[4] === 0x37 || data[4] === 0x39) &&
      data[5] === 0x61
    )
  }
  if (mime === 'image/webp') {
    return (
      data.length > 11 &&
      data[0] === 0x52 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x46 &&
      data[8] === 0x57 &&
      data[9] === 0x45 &&
      data[10] === 0x42 &&
      data[11] === 0x50
    )
  }
  return false
}

/**
 * POST /api/upload/ipfs
 * Upload an image file to IPFS via Pinata, optionally storing a backup in R2.
 *
 * @body FormData with 'file' field
 * @returns {ApiResponse<{ cid: string; ipfsUrl: string; r2Key: string; size: number }>}
 */
export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig()

    // Check if Cloudflare bindings are available
    const cloudflare = event.context.cloudflare
    if (!cloudflare) {
      logger.error('Cloudflare bindings not available')
      throw createError({
        statusCode: 503,
        message: 'Storage service not available. Please try again later.',
      })
    }

    const { STORAGE, DB } = cloudflare.env
    const RATE_LIMITS = (cloudflare.env as typeof cloudflare.env & { RATE_LIMITS?: KVNamespace })
      .RATE_LIMITS

    const walletAddress = requireWalletAddress(event)

    await requireTurnstile(event)

    if (RATE_LIMITS) {
      const bucket = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS)
      const rateKey = `ipfs-upload:${walletAddress.toLowerCase()}:${bucket}`
      const current = Number(await RATE_LIMITS.get(rateKey)) || 0
      if (current >= RATE_LIMIT_MAX) {
        throw createError({
          statusCode: 429,
          message: 'Rate limit exceeded. Please wait before uploading again.',
        })
      }
      await RATE_LIMITS.put(rateKey, String(current + 1), {
        expirationTtl: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) + 5,
      })
    }

    // Get content length
    const contentLength = Number.parseInt(getHeader(event, 'content-length') || '0')

    // Validate content length
    if (contentLength > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 413,
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      })
    }

    // Parse multipart form data
    let formData: Awaited<ReturnType<typeof readMultipartFormData>> | null = null
    try {
      formData = await readMultipartFormData(event)
      logger.debug('FormData parsed', { parts: formData?.length })
    } catch (parseError) {
      logger.error('Failed to parse multipart form data', { error: parseError })
      throw createError({
        statusCode: 400,
        message: 'Failed to parse upload data. Please try again.',
      })
    }

    if (!formData || formData.length === 0) {
      logger.error('No formData parts found')
      throw createError({
        statusCode: 400,
        message: 'No file uploaded. Please select a file.',
      })
    }

    const campaignId = readTextPart(formData.find((part) => part.name === 'campaignId'))

    // Find the file part
    const filePart = formData.find((part) => part.name === 'file')

    if (!filePart || !filePart.data) {
      throw createError({
        statusCode: 400,
        message: 'File field is required',
      })
    }

    // Get file info
    const fileType = filePart.type || 'application/octet-stream'
    const fileName = filePart.filename || 'unnamed'
    const fileData = filePart.data

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      throw createError({
        statusCode: 400,
        message: `Invalid file type: ${fileType}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
      })
    }

    // Validate file size
    if (fileData.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 413,
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      })
    }

    // Resolve IPFS gateway URL (configurable)
    const gatewayBase =
      (runtimeConfig.public.ipfsGatewayUrl as string | undefined) ||
      cloudflare.env.IPFS_GATEWAY_URL ||
      'https://gateway.pinata.cloud/ipfs/'
    const normalizedGatewayBase = gatewayBase.endsWith('/') ? gatewayBase : `${gatewayBase}/`

    // Resolve Pinata JWT (required)
    const pinataJwt =
      runtimeConfig.ipfsPinataJwt ||
      cloudflare.env.IPFS_PINATA_JWT ||
      cloudflare.env.NUXT_IPFS_PINATA_SECRET_JWT

    if (!pinataJwt) {
      logger.error('Pinata JWT not configured')
      throw createError({
        statusCode: 503,
        message: 'IPFS pinning is not configured. Please set a Pinata JWT.',
      })
    }

    // Convert Buffer to Uint8Array for compatibility
    const dataArray = new Uint8Array(fileData)

    if (!validateMagicBytes(dataArray, fileType)) {
      throw createError({
        statusCode: 400,
        message: 'File content does not match the declared image type.',
      })
    }

    // Upload to Pinata
    let cid = ''
    try {
      const pinataForm = new FormData()
      const blob = new Blob([dataArray], { type: fileType })
      pinataForm.append('file', blob, fileName)
      pinataForm.append(
        'pinataMetadata',
        JSON.stringify({
          name: fileName,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
          },
        }),
      )

      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: pinataForm,
      })

      if (!pinataResponse.ok) {
        const errorText = await pinataResponse.text()
        logger.error('Pinata error', { status: pinataResponse.status, body: errorText })
        throw createError({
          statusCode: 502,
          message: 'Failed to pin file to IPFS.',
        })
      }

      const pinataData = (await pinataResponse.json()) as { IpfsHash?: string }
      cid = pinataData.IpfsHash || ''

      if (!cid) {
        throw createError({
          statusCode: 502,
          message: 'Pinata did not return a CID.',
        })
      }
    } catch (pinError) {
      logger.error('Pinata upload failed', { error: pinError })
      throw pinError
    }

    // Optional R2 backup
    let r2Key: string | null = null
    if (STORAGE) {
      r2Key = generateFileKey(fileName, fileType)
      try {
        await STORAGE.put(r2Key, dataArray, {
          httpMetadata: {
            contentType: fileType,
          },
          customMetadata: {
            originalName: fileName,
            uploadedAt: new Date().toISOString(),
            cid,
          },
        })
      } catch (r2Error) {
        logger.warn('R2 backup failed', { error: r2Error })
      }
    }

    // Construct URLs
    const ipfsUrl = `ipfs://${cid}`
    const gatewayUrl = `${normalizedGatewayBase}${cid}`

    if (DB) {
      const evidenceId = crypto.randomUUID()
      await DB.prepare(
        `INSERT INTO evidence (
          evidence_id,
          campaign_id,
          uploader_address,
          ipfs_cid,
          ipfs_url,
          gateway_url,
          r2_key,
          content_type,
          file_name,
          size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          evidenceId,
          campaignId,
          walletAddress,
          cid,
          ipfsUrl,
          gatewayUrl,
          r2Key,
          fileType,
          fileName,
          dataArray.length,
        )
        .run()
    }

    // Return success response
    return sendSuccess(event, {
      cid,
      ipfsUrl,
      gatewayUrl,
      r2Key,
      size: dataArray.length,
      contentType: fileType,
      fileName,
    })
  } catch (error) {
    throw handleError(error)
  }
})
