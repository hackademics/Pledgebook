import { randomUUID } from 'node:crypto'
import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { ZodSchema } from 'zod'
import type {
  CampaignApprovalRequest,
  CampaignApprovalResponse,
  CampaignSetupHelpRequest,
  CampaignSetupHelpResponse,
  ConsensusRequest,
  ConsensusResult,
  ProviderConsensusResult,
  AIProvider,
} from './ai.types'
import {
  campaignApprovalResponseSchema,
  campaignSetupHelpResponseSchema,
  consensusEvaluationResponseSchema,
} from './ai.schema'
import {
  CAMPAIGN_APPROVAL_PROMPT,
  CATEGORY_CONTEXT_PROMPTS,
} from './prompts/campaign-approval.prompt'
import { CAMPAIGN_SETUP_PROMPT, DATA_SOURCE_RECOMMENDATIONS } from './prompts/campaign-setup.prompt'
import {
  CONSENSUS_PROMPT,
  VERIFICATION_TYPE_INSTRUCTIONS,
  PROVIDER_ADJUSTMENTS,
  MIN_VOTE_CONFIDENCE,
} from './prompts/consensus.prompt'
import {
  interpolatePrompt,
  formatEvidenceForPrompt,
  formatBaselineDataForPrompt,
  hashPrompt,
  sanitizePromptInput,
} from './prompts/prompt.utils'
import {
  CONSENSUS_MODELS,
  getModelConfig,
  getAvailableProviders,
  TIMEOUT_CONFIG,
} from './ai.provider'

// =============================================================================
// AI SERVICE
// Purpose: Core AI service for campaign approval, setup, and consensus
// Pattern: Service layer with provider abstraction
// =============================================================================

export interface AIService {
  /**
   * Analyze a campaign for approval
   * Returns decision (approved/rejected/needs_review) with reasoning
   */
  analyzeCampaignApproval(
    request: CampaignApprovalRequest,
    apiKeys: AIApiKeys,
  ): Promise<CampaignApprovalResponse>

  /**
   * Help user create/improve a campaign
   * Returns SMART score, refined prompt, and recommendations
   */
  helpCampaignSetup(
    request: CampaignSetupHelpRequest,
    apiKeys: AIApiKeys,
  ): Promise<CampaignSetupHelpResponse>

  /**
   * Run consensus verification across multiple AI providers
   * Returns aggregated consensus result with individual provider votes
   */
  runConsensusVerification(request: ConsensusRequest, apiKeys: AIApiKeys): Promise<ConsensusResult>

  /**
   * Get a single AI evaluation (for CRE workflow integration)
   * Used when CRE orchestrates the multi-AI calls
   */
  evaluateForConsensus(
    request: ConsensusRequest,
    provider: AIProvider,
    apiKeys: AIApiKeys,
  ): Promise<ProviderConsensusResult>
}

/**
 * Create the AI service with API key injection
 */
export function createAIService(): AIService {
  return {
    async analyzeCampaignApproval(
      request: CampaignApprovalRequest,
      apiKeys: AIApiKeys,
    ): Promise<CampaignApprovalResponse> {
      // Build the context for prompt interpolation
      const context = buildApprovalContext(request)

      // Interpolate the prompts
      const systemPrompt = interpolatePrompt(CAMPAIGN_APPROVAL_PROMPT.systemPrompt, context)
      const userPrompt = interpolatePrompt(CAMPAIGN_APPROVAL_PROMPT.userPromptTemplate, context)

      // Get model configuration
      const modelConfig = getModelConfig('approval')

      // Call AI - note: schema doesn't include timestamp, we add it after
      const response = await callAIWithStructuredOutput<
        Omit<CampaignApprovalResponse, 'timestamp'>
      >({
        systemPrompt,
        userPrompt,
        schema: campaignApprovalResponseSchema,
        modelConfig,
        timeout: TIMEOUT_CONFIG.standard,
        apiKeys,
      })

      return {
        ...response,
        timestamp: new Date().toISOString(),
      }
    },

    async helpCampaignSetup(
      request: CampaignSetupHelpRequest,
      apiKeys: AIApiKeys,
    ): Promise<CampaignSetupHelpResponse> {
      // Build the context for prompt interpolation
      const context = buildSetupContext(request)

      // Interpolate the prompts
      const systemPrompt = interpolatePrompt(CAMPAIGN_SETUP_PROMPT.systemPrompt, context)
      const userPrompt = interpolatePrompt(CAMPAIGN_SETUP_PROMPT.userPromptTemplate, context)

      // Get model configuration (slightly higher temperature for suggestions)
      const modelConfig = getModelConfig('setup')

      // Call AI with structured output - note: schema doesn't include timestamp
      const response = await callAIWithStructuredOutput<
        Omit<CampaignSetupHelpResponse, 'timestamp'>
      >({
        systemPrompt,
        userPrompt,
        schema: campaignSetupHelpResponseSchema,
        modelConfig,
        timeout: TIMEOUT_CONFIG.standard,
        apiKeys,
      })

      // Enhance with category-specific data source recommendations
      const enhancedDataSources = enhanceDataSourceRecommendations(
        response.recommendedDataSources,
        request.categories,
      )

      return {
        ...response,
        recommendedDataSources: enhancedDataSources,
        timestamp: new Date().toISOString(),
      }
    },

    async runConsensusVerification(
      request: ConsensusRequest,
      apiKeys: AIApiKeys,
    ): Promise<ConsensusResult> {
      const requestId = request.requestId ?? randomUUID()
      const startTime = Date.now()

      // Get available providers
      const availableProviders = getAvailableProviders()
      if (availableProviders.length === 0) {
        throw new Error('No AI providers configured for consensus verification')
      }

      // Use configured consensus models (or available subset)
      const modelsToUse = CONSENSUS_MODELS.filter((m) => availableProviders.includes(m.provider))

      if (modelsToUse.length < 2) {
        throw new Error('At least 2 AI providers required for consensus')
      }

      // Run evaluations in parallel
      const evaluationPromises = modelsToUse.map((modelConfig) =>
        this.evaluateForConsensus(request, modelConfig.provider, apiKeys).catch((error) => ({
          provider: modelConfig.provider,
          model: modelConfig.model,
          result: false,
          confidence: 0,
          reasoning: `Error: ${error.message}`,
          sourcesCited: [],
          processingTimeMs: Date.now() - startTime,
          error: true,
        })),
      )

      const providerResults = (await Promise.all(evaluationPromises)) as ProviderConsensusResult[]

      // Filter out failed results with low confidence
      const validResults = providerResults.filter(
        (r) => r.confidence >= MIN_VOTE_CONFIDENCE && !(r as unknown as { error?: boolean }).error,
      )

      // Calculate consensus
      const trueVotes = validResults.filter((r) => r.result === true).length
      const totalVotes = validResults.length
      const consensusScore = totalVotes > 0 ? trueVotes / totalVotes : 0
      const threshold = request.campaign.consensusThreshold

      // Aggregate reasoning
      const aggregatedReasoning = aggregateReasoning(validResults)

      // Collect all cited sources
      const allSources = [...new Set(validResults.flatMap((r) => r.sourcesCited))]

      // Create input hash for audit
      const inputHash = hashPrompt(
        JSON.stringify({
          campaignId: request.campaign.id,
          prompt: request.campaign.prompt,
          evidence: request.currentEvidence,
          verificationType: request.verificationType,
        }),
      )

      return {
        campaignId: request.campaign.id,
        requestId,
        verificationType: request.verificationType,
        verdict: consensusScore >= threshold,
        consensusScore,
        threshold,
        thresholdMet: consensusScore >= threshold,
        providerResults,
        aggregatedReasoning,
        sourcesCited: allSources,
        inputHash,
        timestamp: new Date().toISOString(),
      }
    },

    async evaluateForConsensus(
      request: ConsensusRequest,
      provider: AIProvider,
      apiKeys: AIApiKeys,
    ): Promise<ProviderConsensusResult> {
      const startTime = Date.now()

      // Build context for consensus prompt
      const context = buildConsensusContext(request)

      // Add provider-specific adjustments
      const providerAdjustment = PROVIDER_ADJUSTMENTS[provider] ?? ''
      const typeInstructions = VERIFICATION_TYPE_INSTRUCTIONS[request.verificationType]

      // Interpolate prompts with provider adjustments
      const systemPrompt =
        interpolatePrompt(CONSENSUS_PROMPT.systemPrompt, context) +
        '\n\n' +
        typeInstructions +
        '\n\n' +
        providerAdjustment

      const userPrompt = interpolatePrompt(CONSENSUS_PROMPT.userPromptTemplate, context)

      // Get model configuration for this provider
      const modelConfig = getModelConfig('consensus', provider)

      // Call AI with structured output
      const response = await callAIWithStructuredOutput<{
        result: boolean
        confidence: number
        reasoning: string
        sourcesCited: string[]
      }>({
        systemPrompt,
        userPrompt,
        schema: consensusEvaluationResponseSchema,
        modelConfig,
        timeout: TIMEOUT_CONFIG.consensus,
        apiKeys,
      })

      return {
        provider,
        model: modelConfig.model,
        result: response.result,
        confidence: response.confidence,
        reasoning: response.reasoning,
        sourcesCited: response.sourcesCited,
        processingTimeMs: Date.now() - startTime,
      }
    },
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build context for approval prompt interpolation
 */
function buildApprovalContext(request: CampaignApprovalRequest): Record<string, unknown> {
  const { campaign, strictMode } = request

  // Get category-specific context if applicable
  let categoryContext = ''
  for (const category of campaign.categories) {
    const catLower = category.toLowerCase()
    if (CATEGORY_CONTEXT_PROMPTS[catLower]) {
      categoryContext += CATEGORY_CONTEXT_PROMPTS[catLower] + '\n'
    }
  }

  return {
    campaign: {
      name: sanitizePromptInput(campaign.name),
      purpose: sanitizePromptInput(campaign.purpose),
      rulesAndResolution: sanitizePromptInput(campaign.rulesAndResolution),
      prompt: sanitizePromptInput(campaign.prompt),
      fundraisingGoal: campaign.fundraisingGoal,
      endDate: campaign.endDate,
      tags: campaign.tags.join(', ') || 'None',
      categories: campaign.categories.join(', ') || 'None',
      creatorAddress: campaign.creatorAddress,
    },
    evidence: formatEvidenceForPrompt(campaign.evidence ?? []),
    strictMode: strictMode
      ? 'STRICT MODE: Apply higher standards for fraud detection and quality assessment.'
      : 'STANDARD MODE: Apply normal approval standards.',
    categoryContext,
  }
}

/**
 * Build context for setup helper prompt interpolation
 */
function buildSetupContext(request: CampaignSetupHelpRequest): Record<string, unknown> {
  return {
    name: sanitizePromptInput(request.name ?? 'Not provided'),
    purpose: sanitizePromptInput(request.purpose ?? 'Not provided'),
    rulesAndResolution: sanitizePromptInput(request.rulesAndResolution ?? 'Not provided'),
    prompt: sanitizePromptInput(request.prompt ?? 'Not provided'),
    fundraisingGoal: request.fundraisingGoal ?? 'Not specified',
    endDate: request.endDate ?? 'Not specified',
    tags: (request.tags ?? []).join(', ') || 'None',
    categories: (request.categories ?? []).join(', ') || 'None',
    evidence: formatEvidenceForPrompt(request.evidence ?? []),
  }
}

/**
 * Build context for consensus prompt interpolation
 */
function buildConsensusContext(request: ConsensusRequest): Record<string, unknown> {
  const { campaign, verificationType, currentEvidence, baselineData } = request

  return {
    campaign: {
      id: campaign.id,
      name: sanitizePromptInput(campaign.name),
      purpose: sanitizePromptInput(campaign.purpose),
      prompt: campaign.prompt, // Don't sanitize the verification prompt
      promptHash: campaign.promptHash,
      consensusThreshold: campaign.consensusThreshold,
      startDate: campaign.startDate ?? 'Not specified',
      endDate: campaign.endDate,
    },
    verificationType: verificationType.toUpperCase(),
    baselineData: formatBaselineDataForPrompt(baselineData ?? campaign.baselineData ?? {}),
    currentEvidence: formatEvidenceForPrompt(currentEvidence),
    requestId: request.requestId ?? randomUUID(),
  }
}

/**
 * Enhance data source recommendations based on categories
 */
function enhanceDataSourceRecommendations(
  existing: CampaignSetupHelpResponse['recommendedDataSources'],
  categories?: string[],
): CampaignSetupHelpResponse['recommendedDataSources'] {
  if (!categories || categories.length === 0) {
    return existing
  }

  const recommendations = [...existing]
  const existingNames = new Set(existing.map((r) => r.name))

  for (const category of categories) {
    const catLower = category.toLowerCase()
    const categoryRecs = DATA_SOURCE_RECOMMENDATIONS[catLower]
    if (categoryRecs) {
      for (const rec of categoryRecs) {
        if (!existingNames.has(rec.name)) {
          recommendations.push({
            ...rec,
            requiredForConsensus: false,
          })
          existingNames.add(rec.name)
        }
      }
    }
  }

  return recommendations
}

/**
 * Aggregate reasoning from multiple provider results
 */
function aggregateReasoning(results: ProviderConsensusResult[]): string {
  if (results.length === 0) {
    return 'No valid provider results available for reasoning aggregation.'
  }

  const trueVotes = results.filter((r) => r.result === true)
  const falseVotes = results.filter((r) => r.result === false)

  let aggregated = `## Consensus Summary\n\n`
  aggregated += `- **TRUE votes**: ${trueVotes.length}/${results.length}\n`
  aggregated += `- **FALSE votes**: ${falseVotes.length}/${results.length}\n\n`

  aggregated += `## Provider Reasoning\n\n`
  for (const result of results) {
    const vote = result.result ? '✅ TRUE' : '❌ FALSE'
    aggregated += `### ${result.provider} (${result.model}) - ${vote} (${(result.confidence * 100).toFixed(0)}% confidence)\n\n`
    aggregated += `${result.reasoning}\n\n`
  }

  return aggregated
}

/**
 * API keys configuration type
 */
export interface AIApiKeys {
  anthropic?: string
  openai?: string
  google?: string
}

/**
 * Call AI with structured output using Vercel AI SDK
 */
async function callAIWithStructuredOutput<T>(options: {
  systemPrompt: string
  userPrompt: string
  schema: ZodSchema<T>
  modelConfig: { provider: AIProvider; model: string; temperature?: number; maxTokens?: number }
  timeout: number
  apiKeys: AIApiKeys
}): Promise<T> {
  const { systemPrompt, userPrompt, schema, modelConfig, timeout, apiKeys } = options

  // Create the appropriate provider based on configuration
  const model = getAIModel(modelConfig.provider, modelConfig.model, apiKeys)

  // Use AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const { object } = await generateObject({
      model,
      schema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: modelConfig.temperature ?? 0.1,
      maxTokens: modelConfig.maxTokens ?? 4096,
      abortSignal: controller.signal,
    })

    return object as T
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Get the AI model instance for a given provider
 */
function getAIModel(
  provider: AIProvider,
  modelName: string,
  apiKeys: { anthropic?: string; openai?: string; google?: string },
) {
  switch (provider) {
    case 'anthropic': {
      const apiKey = apiKeys.anthropic
      if (!apiKey) {
        throw new Error('NUXT_ANTHROPIC_API_KEY environment variable is not set')
      }
      const anthropic = createAnthropic({ apiKey })
      return anthropic(modelName)
    }
    case 'openai': {
      const apiKey = apiKeys.openai
      if (!apiKey) {
        throw new Error('NUXT_OPENAI_API_KEY environment variable is not set')
      }
      const openai = createOpenAI({ apiKey })
      return openai(modelName)
    }
    case 'google': {
      const apiKey = apiKeys.google
      if (!apiKey) {
        throw new Error('NUXT_GOOGLE_AI_API_KEY environment variable is not set')
      }
      const google = createGoogleGenerativeAI({ apiKey })
      return google(modelName)
    }
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let aiServiceInstance: AIService | null = null

/**
 * Get or create the AI service singleton
 */
export function useAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = createAIService()
  }
  return aiServiceInstance
}
