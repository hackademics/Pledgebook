import { z } from 'zod'

// =============================================================================
// AI DOMAIN SCHEMAS
// Purpose: Zod validation schemas for AI requests and responses
// =============================================================================

/**
 * Evidence type enum
 */
export const evidenceTypeSchema = z.enum([
  'public-api',
  'private-api',
  'image-ocr',
  'document',
  'url',
])

/**
 * Evidence item schema
 */
export const evidenceItemSchema = z.object({
  type: evidenceTypeSchema,
  uri: z.string().min(1),
  description: z.string().optional(),
  hash: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Campaign AI context schema (minimal campaign data for AI processing)
 */
export const campaignAIContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  purpose: z.string().min(1),
  rulesAndResolution: z.string().min(1),
  prompt: z.string().min(1),
  promptHash: z.string(),
  baselineData: z.record(z.unknown()).default({}),
  fundraisingGoal: z.string(),
  consensusThreshold: z.number().min(0.5).max(1.0),
  startDate: z.string().nullable(),
  endDate: z.string(),
  tags: z.array(z.string()),
  categories: z.array(z.string()),
  creatorAddress: z.string(),
  evidence: z.array(evidenceItemSchema).optional(),
})

// =============================================================================
// CAMPAIGN APPROVAL SCHEMAS
// =============================================================================

/**
 * Risk signal schema
 */
export const riskSignalSchema = z.object({
  category: z.enum(['fraud', 'spam', 'policy', 'quality', 'legal', 'technical']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  evidence: z.string().optional(),
})

/**
 * Campaign approval request schema
 */
export const campaignApprovalRequestSchema = z.object({
  campaign: campaignAIContextSchema,
  strictMode: z.boolean().optional().default(false),
})

/**
 * Campaign approval response schema (for AI structured output)
 */
export const campaignApprovalResponseSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'needs_review']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  riskSignals: z.array(riskSignalSchema),
  recommendations: z.array(z.string()),
  policyViolations: z.array(z.string()),
})

// =============================================================================
// CAMPAIGN SETUP HELPER SCHEMAS
// =============================================================================

/**
 * SMART score schema
 */
export const smartScoreSchema = z.object({
  specific: z.number().min(0).max(100),
  measurable: z.number().min(0).max(100),
  achievable: z.number().min(0).max(100),
  relevant: z.number().min(0).max(100),
  timeBound: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
})

/**
 * Data source recommendation schema
 */
export const dataSourceRecommendationSchema = z.object({
  type: evidenceTypeSchema,
  name: z.string(),
  description: z.string(),
  endpoint: z.string().optional(),
  requiredForConsensus: z.boolean(),
})

/**
 * Consensus readiness schema
 */
export const consensusReadinessSchema = z.object({
  ready: z.boolean(),
  blockers: z.array(z.string()),
  score: z.number().min(0).max(100),
})

/**
 * Campaign setup help request schema
 */
export const campaignSetupHelpRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  purpose: z.string().min(1).max(1000).optional(),
  rulesAndResolution: z.string().min(1).max(2000).optional(),
  prompt: z.string().min(1).max(5000).optional(),
  fundraisingGoal: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  evidence: z.array(evidenceItemSchema).optional(),
})

/**
 * Campaign setup help response schema (for AI structured output)
 */
export const campaignSetupHelpResponseSchema = z.object({
  isValid: z.boolean(),
  smartScore: smartScoreSchema,
  refinedPrompt: z.string(),
  promptImprovements: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
  recommendedDataSources: z.array(dataSourceRecommendationSchema),
  consensusReadiness: consensusReadinessSchema,
})

// =============================================================================
// CONSENSUS SCHEMAS
// =============================================================================

/**
 * Verification type schema
 */
export const verificationTypeSchema = z.enum(['baseline', 'progress', 'completion', 'dispute'])

/**
 * Provider consensus result schema
 */
export const providerConsensusResultSchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'google']),
  model: z.string(),
  result: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  sourcesCited: z.array(z.string()),
  processingTimeMs: z.number(),
})

/**
 * Consensus request schema
 */
export const consensusRequestSchema = z.object({
  campaign: campaignAIContextSchema,
  verificationType: verificationTypeSchema,
  currentEvidence: z.array(evidenceItemSchema),
  baselineData: z.record(z.unknown()).optional(),
  requestId: z.string().uuid().optional(),
})

/**
 * Single AI consensus evaluation response schema (for structured output)
 */
export const consensusEvaluationResponseSchema = z.object({
  result: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  sourcesCited: z.array(z.string()),
  dataPointsEvaluated: z.array(
    z.object({
      name: z.string(),
      baselineValue: z.string().optional(),
      currentValue: z.string().optional(),
      comparison: z.string(),
      meetsGoal: z.boolean(),
    }),
  ),
})

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type EvidenceItemInput = z.input<typeof evidenceItemSchema>
export type CampaignAIContextInput = z.input<typeof campaignAIContextSchema>
export type CampaignApprovalRequestInput = z.input<typeof campaignApprovalRequestSchema>
export type CampaignSetupHelpRequestInput = z.input<typeof campaignSetupHelpRequestSchema>
export type ConsensusRequestInput = z.input<typeof consensusRequestSchema>
