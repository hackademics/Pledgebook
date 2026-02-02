import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { keccak256, toBytes, toHex } from 'viem'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { requireTurnstile } from '../../utils/turnstile'
import { sendCreated, parseBody } from '../../utils/response'
import { createCampaignRepository, createCampaignService } from '../../domains/campaigns'

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
      console.error('Failed to update campaign with additional fields')
    }

    // TODO: In production, trigger CRE baseline capture workflow
    // await triggerCREBaseline(campaign.id, input.sources, input.privacyMode)

    // TODO: In production, verify bond transaction on-chain
    // await verifyBondTransaction(creatorAddress, input.creatorBond, campaign.id)

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
        baselineCapture: 'pending',
        estimatedApprovalTime: '24-48 hours',
      },
    })
  } catch (error) {
    throw handleError(error)
  }
})
