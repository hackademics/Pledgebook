// =============================================================================
// AI DOMAIN TYPES
// Purpose: Type definitions for AI services, prompts, and responses
// =============================================================================

/**
 * Supported AI providers
 */
export type AIProvider = 'anthropic' | 'openai' | 'google'

/**
 * AI model identifiers per provider
 */
export interface AIModelConfig {
  provider: AIProvider
  model: string
  temperature?: number
  maxTokens?: number
}

/**
 * Evidence types for campaign verification
 */
export type EvidenceType = 'public-api' | 'private-api' | 'image-ocr' | 'document' | 'url'

/**
 * Evidence item for verification
 */
export interface EvidenceItem {
  type: EvidenceType
  uri: string
  description?: string
  hash?: string
  metadata?: Record<string, unknown>
}

/**
 * Campaign data for AI processing (subset of CampaignResponse)
 */
export interface CampaignAIContext {
  id: string
  name: string
  purpose: string
  rulesAndResolution: string
  prompt: string
  promptHash: string
  baselineData: Record<string, unknown>
  fundraisingGoal: string
  consensusThreshold: number
  startDate: string | null
  endDate: string
  tags: string[]
  categories: string[]
  creatorAddress: string
  evidence?: EvidenceItem[]
}

// =============================================================================
// CAMPAIGN APPROVAL TYPES
// =============================================================================

/**
 * Campaign approval decision
 */
export type ApprovalDecision = 'approved' | 'rejected' | 'needs_review'

/**
 * Risk signals detected during approval analysis
 */
export interface RiskSignal {
  category: 'fraud' | 'spam' | 'policy' | 'quality' | 'legal' | 'technical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  evidence?: string
}

/**
 * Campaign approval request
 */
export interface CampaignApprovalRequest {
  campaign: CampaignAIContext
  strictMode?: boolean
}

/**
 * Campaign approval response
 */
export interface CampaignApprovalResponse {
  decision: ApprovalDecision
  confidence: number
  reasoning: string
  riskSignals: RiskSignal[]
  recommendations: string[]
  policyViolations: string[]
  timestamp: string
}

// =============================================================================
// CAMPAIGN SETUP HELPER TYPES
// =============================================================================

/**
 * SMART score breakdown for campaign validation
 */
export interface SmartScore {
  specific: number
  measurable: number
  achievable: number
  relevant: number
  timeBound: number
  overall: number
}

/**
 * Data source recommendation
 */
export interface DataSourceRecommendation {
  type: EvidenceType
  name: string
  description: string
  endpoint?: string
  requiredForConsensus: boolean
}

/**
 * Campaign setup help request
 */
export interface CampaignSetupHelpRequest {
  name?: string
  purpose?: string
  rulesAndResolution?: string
  prompt?: string
  fundraisingGoal?: string
  endDate?: string
  tags?: string[]
  categories?: string[]
  evidence?: EvidenceItem[]
}

/**
 * Campaign setup help response
 */
export interface CampaignSetupHelpResponse {
  isValid: boolean
  smartScore: SmartScore
  refinedPrompt: string
  promptImprovements: string[]
  warnings: string[]
  suggestions: string[]
  recommendedDataSources: DataSourceRecommendation[]
  consensusReadiness: {
    ready: boolean
    blockers: string[]
    score: number
  }
  timestamp: string
}

// =============================================================================
// CONSENSUS TYPES
// =============================================================================

/**
 * Consensus verification type
 */
export type VerificationType = 'baseline' | 'progress' | 'completion' | 'dispute'

/**
 * Single AI provider consensus result
 */
export interface ProviderConsensusResult {
  provider: AIProvider
  model: string
  result: boolean
  confidence: number
  reasoning: string
  sourcesCited: string[]
  processingTimeMs: number
}

/**
 * Aggregated consensus result
 */
export interface ConsensusResult {
  campaignId: string
  requestId: string
  verificationType: VerificationType
  verdict: boolean
  consensusScore: number
  threshold: number
  thresholdMet: boolean
  providerResults: ProviderConsensusResult[]
  aggregatedReasoning: string
  sourcesCited: string[]
  inputHash: string
  timestamp: string
}

/**
 * Consensus request input
 */
export interface ConsensusRequest {
  campaign: CampaignAIContext
  verificationType: VerificationType
  currentEvidence: EvidenceItem[]
  baselineData?: Record<string, unknown>
  requestId?: string
}

// =============================================================================
// PROMPT TEMPLATE TYPES
// =============================================================================

/**
 * Prompt template with variable interpolation support
 */
export interface PromptTemplate {
  id: string
  version: string
  name: string
  description: string
  systemPrompt: string
  userPromptTemplate: string
  variables: string[]
  outputSchema?: string
}

/**
 * Prompt interpolation context
 */
export type PromptContext = Record<string, unknown>

/**
 * Prompt metadata for auditing
 */
export interface PromptMetadata {
  templateId: string
  templateVersion: string
  interpolatedAt: string
  inputHash: string
  variablesUsed: string[]
}
