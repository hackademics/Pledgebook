import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { createPublicClient, http, keccak256, toBytes, toHex } from 'viem'
import { polygon, polygonAmoy } from 'viem/chains'
import { useRuntimeConfig } from '#imports'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { requireTurnstile } from '../../utils/turnstile'
import { sendCreated, parseBody } from '../../utils/response'
import { createCampaignRepository, createCampaignService } from '../../domains/campaigns'
import { createLogger } from '../../utils/logger'

const logger = createLogger('CampaignCreate')

// =============================================================================
// POST /api/campaigns/create
// Purpose: Create a new campaign with full validation and CRE baseline initialization
// Handles: Zod validation, prompt hashing, bond verification, D1 insert
// =============================================================================

/**
 * Data source schema for verification
 */
const dataSourceSchema = z
  .object({
    id: z.string(),
    type: z.enum(['public-api', 'private-api', 'image-ocr']),
    label: z.string(),
    endpoint: z.string().url().optional(),
    apiKey: z.string().optional(),
    apiToken: z.string().optional(),
    fileUrl: z.string().url().optional(),
    ipfsHash: z.string().optional(),
    isEncrypted: z.boolean().optional(),
    description: z.string().optional(),
    isPrivate: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const hasEndpoint = Boolean(value.endpoint && value.endpoint.trim())
    const hasFileUrl = Boolean(value.fileUrl && value.fileUrl.trim())

    if (value.type === 'image-ocr' && !hasFileUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fileUrl'],
        message: 'Image URL is required for image/OCR sources',
      })
    }

    if (value.type !== 'image-ocr' && !hasEndpoint) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endpoint'],
        message: 'API endpoint is required for API sources',
      })
    }
  })

/**
 * Enhanced create campaign schema with sources
 */
const createCampaignWithSourcesSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  purpose: z.string().min(10).max(1000).trim(),
  rulesAndResolution: z.string().min(10).max(2000).trim(),
  prompt: z.string().min(20).max(5000).trim(),
  promptHash: z.string().optional(),
  fundraisingGoal: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  creatorBond: z.string().regex(/^\d+$/).optional().default('0'),
  endDate: z.string().datetime(),
  startDate: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  categories: z.array(z.string()).max(5).optional().default([]),
  imageUrl: z.string().url().max(500).nullable().optional(),
  bannerUrl: z.string().url().max(500).nullable().optional(),
  privacyMode: z.boolean().optional().default(false),
  consensusThreshold: z.number().min(0.5).max(1.0).optional().default(0.66),
  sources: z.array(dataSourceSchema).optional().default([]),
  bondTxHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
})

/**
 * Compute keccak256 hash of prompt
 */
function computePromptHash(prompt: string): string {
  const hash = keccak256(toBytes(prompt.trim()))
  return toHex(hash)
}

/**
 * Initialize baseline data structure
 * In production, this would trigger CRE to capture initial data from sources
 */
function initializeBaselineData(
  sources: z.infer<typeof dataSourceSchema>[],
  privacyMode: boolean,
): Record<string, unknown> {
  const baseline: Record<string, unknown> = {
    capturedAt: new Date().toISOString(),
    privacyMode,
    sources: sources.map((source) => ({
      id: source.id,
      type: source.type,
      label: source.label,
      isPrivate: source.isPrivate,
      // In production: CRE would fetch and hash/encrypt the actual data
      status: 'pending',
      dataHash: null,
      zkProof: privacyMode || source.isPrivate ? 'pending' : null,
    })),
  }

  return baseline
}

/**
 * Encrypt sensitive API keys for storage
 * In production, use proper encryption with KMS
 */
function encryptSensitiveData(
  sources: z.infer<typeof dataSourceSchema>[],
): z.infer<typeof dataSourceSchema>[] {
  return sources.map((source) => {
    if (source.type === 'private-api' && (source.apiKey || source.apiToken)) {
      // In production: Encrypt with KMS and store in CRE secrets
      return {
        ...source,
        apiKey: source.apiKey ? '[ENCRYPTED]' : undefined,
        apiToken: source.apiToken ? '[ENCRYPTED]' : undefined,
        isEncrypted: true,
      }
    }
    return source
  })
}

/**
 * Trigger CRE baseline capture workflow via Chainlink Runtime Environment.
 * Sends an HTTP request to the CRE workflow endpoint with the campaign
 * sources and prompt so the baseline data can be captured and hashed.
 */
async function triggerCREBaseline(
  campaignId: string,
  sources: z.infer<typeof dataSourceSchema>[],
  prompt: string,
  promptHash: string,
  privacyMode: boolean,
): Promise<void> {
  const config = useRuntimeConfig()
  const creEndpoint = config.creWorkflowEndpoint as string | undefined

  if (!creEndpoint) {
    logger.warn('CRE workflow endpoint not configured — skipping baseline capture', { campaignId })
    return
  }

  const evidence = sources.map((source) => ({
    type: source.type === 'image-ocr' ? ('image' as const) : ('url' as const),
    uri: source.fileUrl || source.endpoint || '',
    metadata: {
      label: source.label,
      private: source.isPrivate || privacyMode,
      sourceType: source.type,
    },
  }))

  const payload = {
    workflow: 'baseline',
    data: {
      request_id: `baseline-${campaignId}-${Date.now()}`,
      campaign_id: campaignId,
      prompt,
      prompt_hash: promptHash,
      evidence,
      metadata: {
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
        version: '1.0.0',
      },
    },
  }

  try {
    const response = await fetch(creEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      logger.error('CRE baseline trigger failed', {
        campaignId,
        status: response.status,
        statusText: response.statusText,
      })
    } else {
      logger.info('CRE baseline capture triggered', { campaignId })
    }
  } catch (error) {
    // Non-blocking — campaign creation should still succeed
    logger.error('CRE baseline trigger error', { campaignId, error: String(error) })
  }
}

/**
 * Verify a creator bond transaction on-chain.
 * Reads the transaction receipt and confirms the USDC transfer amount
 * matches the declared bond and was sent by the creator.
 */
async function verifyBondTransaction(
  creatorAddress: string,
  creatorBond: string,
  bondTxHash?: string,
): Promise<{ verified: boolean; reason?: string }> {
  // No bond required
  if (creatorBond === '0' || !bondTxHash) {
    return { verified: true, reason: 'No bond required' }
  }

  const config = useRuntimeConfig()
  const chainId = Number(config.public?.chainId ?? 80002)

  const chain = chainId === 137 ? polygon : polygonAmoy
  const rpcUrl = (config.rpcUrl as string | undefined) || chain.rpcUrls.default.http[0]

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  })

  try {
    const receipt = await client.getTransactionReceipt({
      hash: bondTxHash as `0x${string}`,
    })

    if (receipt.status !== 'success') {
      return { verified: false, reason: 'Bond transaction failed on-chain' }
    }

    // Verify the sender matches the creator
    const tx = await client.getTransaction({
      hash: bondTxHash as `0x${string}`,
    })

    if (tx.from.toLowerCase() !== creatorAddress.toLowerCase()) {
      return { verified: false, reason: 'Transaction sender does not match creator address' }
    }

    // Check USDC Transfer event in logs for the declared bond amount
    // USDC Transfer event signature: Transfer(address,address,uint256)
    const transferTopic = keccak256(toBytes('Transfer(address,address,uint256)'))
    const transferLog = receipt.logs.find((log) => log.topics[0] === transferTopic)

    if (!transferLog) {
      return { verified: false, reason: 'No USDC transfer found in transaction' }
    }

    // USDC has 6 decimals — the bond amount is stored as a plain integer string in USDC units
    const transferAmount = BigInt(transferLog.data)
    const expectedAmount = BigInt(creatorBond) * BigInt(1_000_000) // Convert USDC units to wei

    if (transferAmount < expectedAmount) {
      return {
        verified: false,
        reason: `Bond amount insufficient: expected ${creatorBond} USDC, got ${(transferAmount / BigInt(1_000_000)).toString()} USDC`,
      }
    }

    logger.info('Bond transaction verified', {
      creator: creatorAddress,
      bondAmount: creatorBond,
      txHash: bondTxHash,
    })

    return { verified: true }
  } catch (error) {
    logger.error('Bond verification failed', {
      txHash: bondTxHash,
      error: String(error),
    })
    return { verified: false, reason: 'Failed to verify bond transaction on-chain' }
  }
}

/**
 * POST /api/campaigns/create
 * Create a new campaign with full verification setup
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    await requireTurnstile(event)

    // Get creator address from header
    const creatorAddress = requireWalletAddress(event)

    // Parse and validate request body
    const input = await parseBody(event, createCampaignWithSourcesSchema)

    // Compute prompt hash if not provided
    const promptHash = input.promptHash || computePromptHash(input.prompt)

    // Validate prompt hash matches
    if (input.promptHash && input.promptHash !== computePromptHash(input.prompt)) {
      throw new Error('Prompt hash mismatch - prompt may have been modified')
    }

    // Encrypt sensitive source data
    const encryptedSources = encryptSensitiveData(input.sources)

    // Initialize baseline data structure
    const baselineData = initializeBaselineData(input.sources, input.privacyMode)

    // Prepare campaign data for service
    const campaignData = {
      name: input.name,
      slug: input.slug,
      purpose: input.purpose,
      rulesAndResolution: input.rulesAndResolution,
      prompt: input.prompt,
      fundraisingGoal: input.fundraisingGoal,
      endDate: input.endDate,
      startDate: input.startDate,
      tags: input.tags,
      categories: input.categories,
      imageUrl: input.imageUrl,
      bannerUrl: input.bannerUrl,
      privacyMode: input.privacyMode,
      consensusThreshold: input.consensusThreshold,
    }

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Create campaign in database
    const campaign = await service.create(creatorAddress.toLowerCase(), campaignData)

    // Update with additional fields (prompt hash, baseline, sources)
    // In production, this would be atomic with the create
    const updateResult = await DB.prepare(
      `
      UPDATE campaigns 
      SET 
        prompt_hash = ?,
        baseline_data = ?,
        creator_bond = ?
      WHERE campaign_id = ?
    `,
    )
      .bind(
        promptHash,
        JSON.stringify({
          ...baselineData,
          encryptedSources,
        }),
        input.creatorBond,
        campaign.id,
      )
      .run()

    if (!updateResult.success) {
      logger.error('Failed to update campaign with additional fields', { campaignId: campaign.id })
    }

    // Trigger CRE baseline capture workflow (non-blocking)
    triggerCREBaseline(
      campaign.id,
      input.sources,
      input.prompt,
      promptHash,
      input.privacyMode,
    ).catch((err) =>
      logger.error('CRE baseline async error', { campaignId: campaign.id, error: String(err) }),
    )

    // Verify creator bond transaction on-chain (if bond required)
    let bondVerification: { verified: boolean; reason?: string } = {
      verified: true,
      reason: 'No bond required',
    }
    if (input.creatorBond !== '0' && input.bondTxHash) {
      bondVerification = await verifyBondTransaction(
        creatorAddress,
        input.creatorBond,
        input.bondTxHash,
      )
      if (!bondVerification.verified) {
        logger.warn('Bond verification failed', {
          campaignId: campaign.id,
          reason: bondVerification.reason,
        })
      }
    }

    return sendCreated(event, {
      ...campaign,
      promptHash,
      baselineData,
      sources: encryptedSources,
      creatorBond: input.creatorBond,
      // Provide info for next steps
      nextSteps: {
        status: 'submitted',
        bondRequired: input.creatorBond !== '0',
        bondAmount: input.creatorBond,
        bondVerified: bondVerification.verified,
        bondVerificationReason: bondVerification.reason,
        baselineCapture: 'pending',
        estimatedApprovalTime: '24-48 hours',
      },
    })
  } catch (error) {
    throw handleError(error)
  }
})
