import { createHash } from 'node:crypto'
import type { PromptContext, PromptMetadata, PromptTemplate } from '../ai.types'

// =============================================================================
// PROMPT UTILITIES
// Purpose: Common utilities for prompt management and interpolation
// Pattern: Functional utilities with immutable operations
// =============================================================================

/**
 * Interpolate variables into a prompt template
 * Supports {{variable}} syntax with nested object access via dot notation
 *
 * @example
 * interpolatePrompt("Hello {{user.name}}", { user: { name: "Alice" } })
 * // Returns: "Hello Alice"
 */
export function interpolatePrompt(template: string, context: PromptContext): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path: string) => {
    const keys = path.split('.')
    let value: unknown = context

    for (const key of keys) {
      if (value === null || value === undefined) {
        return match // Keep original placeholder if path not found
      }
      value = (value as Record<string, unknown>)[key]
    }

    if (value === null || value === undefined) {
      return match
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  })
}

/**
 * Extract variable names from a prompt template
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+(?:\.\w+)*)\}\}/g) || []
  return [...new Set(matches.map((m) => m.slice(2, -2)))]
}

/**
 * Hash a prompt for integrity verification
 * Uses SHA-256 for consistency with CRE workflow
 */
export function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex')
}

/**
 * Create prompt metadata for auditing
 */
export function createPromptMetadata(
  template: PromptTemplate,
  context: PromptContext,
): PromptMetadata {
  const interpolatedPrompt =
    interpolatePrompt(template.systemPrompt, context) +
    '\n\n' +
    interpolatePrompt(template.userPromptTemplate, context)

  return {
    templateId: template.id,
    templateVersion: template.version,
    interpolatedAt: new Date().toISOString(),
    inputHash: hashPrompt(interpolatedPrompt),
    variablesUsed: extractTemplateVariables(
      template.systemPrompt + template.userPromptTemplate,
    ).filter((v) => {
      const keys = v.split('.')
      let value: unknown = context
      for (const key of keys) {
        if (value === null || value === undefined) return false
        value = (value as Record<string, unknown>)[key]
      }
      return value !== null && value !== undefined
    }),
  }
}

/**
 * Sanitize user input to prevent prompt injection
 * Escapes special characters and removes potentially harmful patterns
 */
export function sanitizePromptInput(input: string): string {
  return (
    input
      // Remove any attempt to override system prompts
      .replace(/\b(system|assistant|user)\s*:/gi, '[FILTERED]:')
      // Remove instruction override attempts
      .replace(
        /\b(ignore|disregard|forget)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/gi,
        '[FILTERED]',
      )
      // Escape curly braces to prevent variable injection
      .replace(/\{\{/g, '{ {')
      .replace(/\}\}/g, '} }')
      // Trim and normalize whitespace
      .trim()
      .replace(/\s+/g, ' ')
  )
}

/**
 * Format evidence items for prompt inclusion
 */
export function formatEvidenceForPrompt(
  evidence: Array<{ type: string; uri: string; description?: string }>,
): string {
  if (!evidence || evidence.length === 0) {
    return 'No evidence provided.'
  }

  return evidence
    .map((item, index) => {
      const desc = item.description ? ` - ${item.description}` : ''
      return `${index + 1}. [${item.type.toUpperCase()}] ${item.uri}${desc}`
    })
    .join('\n')
}

/**
 * Format baseline data for prompt inclusion
 */
export function formatBaselineDataForPrompt(baselineData: Record<string, unknown>): string {
  if (!baselineData || Object.keys(baselineData).length === 0) {
    return 'No baseline data available.'
  }

  return Object.entries(baselineData)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      return `- ${key}: ${formattedValue}`
    })
    .join('\n')
}

/**
 * Validate that all required variables are present in context
 */
export function validatePromptContext(
  template: PromptTemplate,
  context: PromptContext,
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const variable of template.variables) {
    const keys = variable.split('.')
    let value: unknown = context

    for (const key of keys) {
      if (value === null || value === undefined) {
        missing.push(variable)
        break
      }
      value = (value as Record<string, unknown>)[key]
    }

    if (value === null || value === undefined) {
      if (!missing.includes(variable)) {
        missing.push(variable)
      }
    }
  }

  return { valid: missing.length === 0, missing }
}

/**
 * Create a formatted campaign summary for prompts
 */
export function formatCampaignSummary(campaign: {
  name: string
  purpose: string
  rulesAndResolution: string
  fundraisingGoal: string
  endDate: string
  tags?: string[]
  categories?: string[]
}): string {
  const tagsList = campaign.tags?.length ? campaign.tags.join(', ') : 'None'
  const categoriesList = campaign.categories?.length ? campaign.categories.join(', ') : 'None'

  return `
CAMPAIGN: ${campaign.name}

PURPOSE:
${campaign.purpose}

RULES AND RESOLUTION:
${campaign.rulesAndResolution}

FUNDRAISING GOAL: ${campaign.fundraisingGoal} wei
END DATE: ${campaign.endDate}
TAGS: ${tagsList}
CATEGORIES: ${categoriesList}
`.trim()
}
