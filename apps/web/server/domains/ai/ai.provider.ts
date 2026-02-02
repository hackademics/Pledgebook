import type { AIProvider, AIModelConfig } from './ai.types'

// =============================================================================
// AI PROVIDER CONFIGURATION
// Purpose: Multi-provider AI setup with fallback and consensus support
// Pattern: Provider registry with model configurations
// =============================================================================

/**
 * Default model configurations per provider
 * These are optimized for structured output and reasoning tasks
 */
export const DEFAULT_MODELS: Record<AIProvider, AIModelConfig> = {
  anthropic: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    temperature: 0.1, // Low temperature for consistent, deterministic outputs
    maxTokens: 4096,
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4.1',
    temperature: 0.1,
    maxTokens: 4096,
  },
  google: {
    provider: 'google',
    model: 'gemini-2.5-flash',
    temperature: 0.1,
    maxTokens: 4096,
  },
}

/**
 * Model configurations for consensus (multi-AI voting)
 * Uses latest models optimized for reasoning
 */
export const CONSENSUS_MODELS: AIModelConfig[] = [
  {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    temperature: 0.0, // Zero temperature for maximum consistency
    maxTokens: 4096,
  },
  {
    provider: 'openai',
    model: 'gpt-4.1',
    temperature: 0.0,
    maxTokens: 4096,
  },
  {
    provider: 'google',
    model: 'gemini-2.5-pro',
    temperature: 0.0,
    maxTokens: 4096,
  },
]

/**
 * Provider priority for fallback
 * If primary provider fails, try next in list
 */
export const PROVIDER_PRIORITY: AIProvider[] = ['anthropic', 'openai', 'google']

/**
 * Rate limiting configuration per provider
 */
export const RATE_LIMITS: Record<
  AIProvider,
  { requestsPerMinute: number; tokensPerMinute: number }
> = {
  anthropic: {
    requestsPerMinute: 50,
    tokensPerMinute: 100000,
  },
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 150000,
  },
  google: {
    requestsPerMinute: 60,
    tokensPerMinute: 120000,
  },
}

/**
 * Environment variable names for API keys
 */
export const API_KEY_ENV_VARS: Record<AIProvider, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_AI_API_KEY',
}

/**
 * Check if a provider is configured (has API key)
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  const envVar = API_KEY_ENV_VARS[provider]
  return Boolean(process.env[envVar])
}

/**
 * Get available providers (those with configured API keys)
 */
export function getAvailableProviders(): AIProvider[] {
  return PROVIDER_PRIORITY.filter(isProviderConfigured)
}

/**
 * Get the primary configured provider
 */
export function getPrimaryProvider(): AIProvider | null {
  const available = getAvailableProviders()
  return available.length > 0 ? (available[0] ?? null) : null
}

/**
 * Get model configuration for a specific use case
 */
export function getModelConfig(
  useCase: 'approval' | 'setup' | 'consensus',
  provider?: AIProvider,
): AIModelConfig {
  const targetProvider = provider ?? getPrimaryProvider() ?? 'anthropic'

  switch (useCase) {
    case 'consensus':
      // For consensus, use zero temperature for maximum determinism
      return {
        ...DEFAULT_MODELS[targetProvider],
        temperature: 0.0,
      }
    case 'approval':
      // For approval, use low temperature for consistency
      return {
        ...DEFAULT_MODELS[targetProvider],
        temperature: 0.1,
      }
    case 'setup':
      // For setup helper, slightly higher temperature for better suggestions
      return {
        ...DEFAULT_MODELS[targetProvider],
        temperature: 0.3,
      }
    default:
      return DEFAULT_MODELS[targetProvider]
  }
}

/**
 * Provider-specific options for the AI SDK
 */
export const PROVIDER_OPTIONS = {
  anthropic: {
    // Enable cache control for repeated tool definitions
    cacheControl: { type: 'ephemeral' as const },
  },
  openai: {
    // Use strict JSON schema validation
    strictJsonSchema: true,
  },
  google: {
    // Enable structured outputs
    structuredOutputs: true,
  },
} as const

/**
 * Retry configuration for API calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
} as const

/**
 * Timeout configuration
 */
export const TIMEOUT_CONFIG = {
  // Standard request timeout
  standard: 30000, // 30 seconds
  // Extended timeout for complex reasoning
  extended: 60000, // 60 seconds
  // Consensus timeout (parallel requests)
  consensus: 45000, // 45 seconds
} as const
