// =============================================================================
// AI CONFIGURATION
// Purpose: Centralized configuration for AI services
// Pattern: Environment-based configuration with defaults
// =============================================================================

import type { AIProvider, AIModelConfig } from './ai.types'

/**
 * AI Configuration interface
 */
export interface AIConfig {
  // Provider settings
  providers: {
    anthropic: ProviderConfig
    openai: ProviderConfig
    google: ProviderConfig
  }

  // Feature flags
  features: {
    campaignApproval: boolean
    campaignSetup: boolean
    consensusVerification: boolean
    multiProviderConsensus: boolean
  }

  // Consensus settings
  consensus: {
    defaultThreshold: number
    minProviders: number
    minConfidence: number
    timeoutMs: number
  }

  // Rate limiting
  rateLimiting: {
    requestsPerMinute: number
    tokensPerMinute: number
    burstLimit: number
  }

  // Prompt settings
  prompts: {
    maxInputLength: number
    maxOutputTokens: number
    temperatureDefault: number
    temperatureConsensus: number
  }

  // Audit settings
  audit: {
    logPrompts: boolean
    logResponses: boolean
    retentionDays: number
  }
}

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  enabled: boolean
  apiKeyEnv: string
  defaultModel: string
  fallbackModel?: string
  maxRetries: number
  timeoutMs: number
}

/**
 * Default AI configuration
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  providers: {
    anthropic: {
      enabled: true,
      apiKeyEnv: 'ANTHROPIC_API_KEY',
      defaultModel: 'claude-sonnet-4-20250514',
      fallbackModel: 'claude-3-5-sonnet-20241022',
      maxRetries: 3,
      timeoutMs: 30000,
    },
    openai: {
      enabled: true,
      apiKeyEnv: 'OPENAI_API_KEY',
      defaultModel: 'gpt-4.1',
      fallbackModel: 'gpt-4o',
      maxRetries: 3,
      timeoutMs: 30000,
    },
    google: {
      enabled: true,
      apiKeyEnv: 'GOOGLE_AI_API_KEY',
      defaultModel: 'gemini-2.5-flash',
      fallbackModel: 'gemini-2.0-flash',
      maxRetries: 3,
      timeoutMs: 30000,
    },
  },

  features: {
    campaignApproval: true,
    campaignSetup: true,
    consensusVerification: true,
    multiProviderConsensus: true,
  },

  consensus: {
    defaultThreshold: 0.66, // 2/3 majority
    minProviders: 2,
    minConfidence: 0.5,
    timeoutMs: 45000,
  },

  rateLimiting: {
    requestsPerMinute: 30,
    tokensPerMinute: 100000,
    burstLimit: 10,
  },

  prompts: {
    maxInputLength: 50000, // ~12k tokens
    maxOutputTokens: 4096,
    temperatureDefault: 0.1,
    temperatureConsensus: 0.0,
  },

  audit: {
    logPrompts: true,
    logResponses: true,
    retentionDays: 90,
  },
}

/**
 * Get AI configuration from environment
 */
export function getAIConfig(): AIConfig {
  const config = { ...DEFAULT_AI_CONFIG }

  // Override with environment variables if present
  if (process.env.AI_CONSENSUS_THRESHOLD) {
    config.consensus.defaultThreshold = Number.parseFloat(process.env.AI_CONSENSUS_THRESHOLD)
  }

  if (process.env.AI_MIN_PROVIDERS) {
    config.consensus.minProviders = Number.parseInt(process.env.AI_MIN_PROVIDERS, 10)
  }

  if (process.env.AI_TIMEOUT_MS) {
    config.consensus.timeoutMs = Number.parseInt(process.env.AI_TIMEOUT_MS, 10)
  }

  // Disable providers without API keys
  config.providers.anthropic.enabled = Boolean(process.env.ANTHROPIC_API_KEY)
  config.providers.openai.enabled = Boolean(process.env.OPENAI_API_KEY)
  config.providers.google.enabled = Boolean(process.env.GOOGLE_AI_API_KEY)

  return config
}

/**
 * Validate AI configuration
 */
export function validateAIConfig(config: AIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check if at least one provider is enabled
  const enabledProviders = Object.values(config.providers).filter((p) => p.enabled)
  if (enabledProviders.length === 0) {
    errors.push('At least one AI provider must be enabled')
  }

  // Check consensus requirements
  if (
    config.features.multiProviderConsensus &&
    enabledProviders.length < config.consensus.minProviders
  ) {
    errors.push(
      `Multi-provider consensus requires at least ${config.consensus.minProviders} providers, ` +
        `but only ${enabledProviders.length} are enabled`,
    )
  }

  // Validate threshold
  if (config.consensus.defaultThreshold < 0.5 || config.consensus.defaultThreshold > 1.0) {
    errors.push('Consensus threshold must be between 0.5 and 1.0')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Get model configuration for a provider
 */
export function getProviderModelConfig(
  config: AIConfig,
  provider: AIProvider,
  useCase: 'approval' | 'setup' | 'consensus',
): AIModelConfig {
  const providerConfig = config.providers[provider]

  const temperature =
    useCase === 'consensus'
      ? config.prompts.temperatureConsensus
      : useCase === 'setup'
        ? 0.3
        : config.prompts.temperatureDefault

  return {
    provider,
    model: providerConfig.defaultModel,
    temperature,
    maxTokens: config.prompts.maxOutputTokens,
  }
}

/**
 * Environment variable template for AI configuration
 */
export const ENV_TEMPLATE = `
# =============================================================================
# AI PROVIDER CONFIGURATION
# =============================================================================

# Anthropic (Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key

# OpenAI (GPT-4)
OPENAI_API_KEY=your-openai-api-key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# =============================================================================
# AI CONSENSUS SETTINGS (optional overrides)
# =============================================================================

# Consensus threshold (0.5-1.0, default: 0.66)
# AI_CONSENSUS_THRESHOLD=0.66

# Minimum providers for consensus (default: 2)
# AI_MIN_PROVIDERS=2

# Request timeout in milliseconds (default: 45000)
# AI_TIMEOUT_MS=45000
`
