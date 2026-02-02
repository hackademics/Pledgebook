// =============================================================================
// CRE WORKFLOW AI INTEGRATION
// Purpose: Bridge between CRE workflows and AI service
// Pattern: Adapter pattern for CRE-compatible input/output transformation
// =============================================================================

import type { CampaignAIContext, EvidenceItem, VerificationType, ConsensusResult } from './ai.types'
import {
  CONSENSUS_PROMPT,
  VERIFICATION_TYPE_INSTRUCTIONS,
  PROVIDER_ADJUSTMENTS,
} from './prompts/consensus.prompt'
import {
  interpolatePrompt,
  formatEvidenceForPrompt,
  formatBaselineDataForPrompt,
  hashPrompt,
} from './prompts/prompt.utils'

/**
 * CRE Validation Input (matches CRE workflow types)
 */
export interface CREValidationInput {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  evidence?: CREEvidenceItem[]
  baseline_data?: Record<string, unknown>
  metadata?: CRERequestMetadata
}

/**
 * CRE Baseline Input
 */
export interface CREBaselineInput {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  evidence?: CREEvidenceItem[]
  metadata?: CRERequestMetadata
}

/**
 * CRE Evaluation Input
 */
export interface CREEvaluationInput {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  baseline_hash: string
  baseline_data?: Record<string, unknown>
  evidence?: CREEvidenceItem[]
  metadata?: CRERequestMetadata
}

/**
 * CRE Evidence Item format
 */
export interface CREEvidenceItem {
  evidence_id?: string
  type: 'file' | 'url' | 'text' | 'image' | 'video' | 'audio'
  uri: string
  hash?: string
  metadata?: Record<string, unknown>
}

/**
 * CRE Request Metadata
 */
export interface CRERequestMetadata {
  requester?: string
  environment?: 'local' | 'staging' | 'production'
  version?: string
  trace_id?: string
}

/**
 * CRE Validation Output
 */
export interface CREValidationOutput {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  summary: string
  signals?: Record<string, unknown>
  model?: string
  created_at?: string
}

/**
 * CRE Evaluation Output
 */
export interface CREEvaluationOutput {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  evaluation_summary: string
  consensus?: number
  signals?: Record<string, unknown>
  model?: string
  created_at?: string
}

/**
 * Convert CRE evidence format to internal format
 */
export function convertCREEvidence(creEvidence: CREEvidenceItem[]): EvidenceItem[] {
  return creEvidence.map((item) => ({
    type: mapCREEvidenceType(item.type),
    uri: item.uri,
    description: item.metadata?.description as string | undefined,
    hash: item.hash,
    metadata: item.metadata,
  }))
}

/**
 * Map CRE evidence type to internal evidence type
 */
function mapCREEvidenceType(creType: CREEvidenceItem['type']): EvidenceItem['type'] {
  switch (creType) {
    case 'url':
      return 'url'
    case 'image':
      return 'image-ocr'
    case 'file':
    case 'text':
      return 'document'
    case 'video':
    case 'audio':
      return 'url'
    default:
      return 'url'
  }
}

/**
 * Build the full consensus prompt for CRE workflow
 * This is used by the CRE main.ts to construct prompts for AI calls
 */
export function buildCREConsensusPrompt(
  input: CREEvaluationInput,
  campaignContext: Partial<CampaignAIContext>,
  verificationType: VerificationType,
  provider: 'anthropic' | 'openai' | 'google' = 'anthropic',
): { systemPrompt: string; userPrompt: string; inputHash: string } {
  const context = {
    campaign: {
      id: input.campaign_id,
      name: campaignContext.name ?? 'Campaign',
      purpose: campaignContext.purpose ?? '',
      prompt: input.prompt,
      promptHash: input.prompt_hash,
      consensusThreshold: campaignContext.consensusThreshold ?? 0.66,
      startDate: campaignContext.startDate ?? 'Not specified',
      endDate: campaignContext.endDate ?? 'Not specified',
    },
    verificationType: verificationType.toUpperCase(),
    baselineData: formatBaselineDataForPrompt(input.baseline_data ?? {}),
    currentEvidence: formatEvidenceForPrompt(convertCREEvidence(input.evidence ?? [])),
    requestId: input.request_id,
  }

  const typeInstructions = VERIFICATION_TYPE_INSTRUCTIONS[verificationType]
  const providerAdjustment = PROVIDER_ADJUSTMENTS[provider] ?? ''

  const systemPrompt =
    interpolatePrompt(CONSENSUS_PROMPT.systemPrompt, context) +
    '\n\n' +
    typeInstructions +
    '\n\n' +
    providerAdjustment

  const userPrompt = interpolatePrompt(CONSENSUS_PROMPT.userPromptTemplate, context)

  const inputHash = hashPrompt(systemPrompt + userPrompt)

  return { systemPrompt, userPrompt, inputHash }
}

/**
 * Convert internal consensus result to CRE output format
 */
export function toCREEvaluationOutput(
  result: ConsensusResult,
  requestId: string,
): CREEvaluationOutput {
  return {
    request_id: requestId,
    campaign_id: result.campaignId,
    verdict: result.verdict ? 'pass' : 'fail',
    confidence: result.consensusScore,
    evaluation_summary: result.aggregatedReasoning,
    consensus: result.consensusScore,
    signals: {
      threshold: result.threshold,
      threshold_met: result.thresholdMet,
      provider_count: result.providerResults.length,
      input_hash: result.inputHash,
    },
    model: 'multi-ai-consensus',
    created_at: result.timestamp,
  }
}

/**
 * Score to verdict conversion (matches CRE workflow logic)
 */
export function scoreToVerdict(
  score: number,
  passThreshold: number,
  failThreshold: number,
): 'pass' | 'fail' | 'needs_review' {
  if (score >= passThreshold) return 'pass'
  if (score <= failThreshold) return 'fail'
  return 'needs_review'
}

/**
 * Prompt templates for CRE workflow configuration
 * These are exported for use in CRE config files
 */
export const CRE_PROMPT_TEMPLATES = {
  validation: `You are validating a campaign for PledgeBook.

CAMPAIGN PROMPT:
{{prompt}}

EVIDENCE:
{{evidence}}

Analyze this campaign for:
1. Fraud indicators
2. Policy compliance  
3. Goal clarity and verifiability
4. Data source availability

Provide a validation score from 0.0 to 1.0 and explain your reasoning.`,

  baseline: `You are capturing baseline data for a PledgeBook campaign.

CAMPAIGN PROMPT:
{{prompt}}

EVIDENCE:
{{evidence}}

Extract and summarize the initial state data that will be compared against at campaign end. Include:
1. Key metrics with current values
2. Data source verification
3. Timestamp confirmation
4. Any data quality concerns`,

  evaluation: `You are evaluating campaign goal achievement for PledgeBook.

CAMPAIGN PROMPT:
{{prompt}}

BASELINE (captured at start):
{{baseline}}

CURRENT EVIDENCE:
{{evidence}}

Compare the baseline data to current evidence and determine:
1. Has the goal been achieved? (TRUE/FALSE)
2. What is your confidence level? (0.0-1.0)
3. What specific data points support your conclusion?
4. Are there any concerns about data integrity?

Be objective and cite specific evidence for your determination.`,
}
