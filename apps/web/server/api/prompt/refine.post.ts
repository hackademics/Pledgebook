import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { useRuntimeConfig } from '#imports'
import { parseBody } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { createLogger } from '../../utils/logger'

const logger = createLogger('PromptRefine')

// =============================================================================
// POST /api/prompt/refine
// Purpose: AI-powered prompt refinement for campaign verification
// Uses Anthropic Claude via AI SDK for SMART analysis and prompt improvement
// =============================================================================

/**
 * Request schema for prompt refinement
 */
const refinePromptSchema = z.object({
  prompt: z.string().min(10).max(5000),
  purpose: z.string().optional(),
  rulesAndResolution: z.string().optional(),
  sources: z
    .array(
      z.object({
        type: z.enum(['public-api', 'private-api', 'image-ocr']),
        endpoint: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
})

/**
 * SMART score criteria
 */
interface SmartScore {
  specific: number
  measurable: number
  achievable: number
  relevant: number
  timeBound: number
  overall: number
}

/**
 * Prompt suggestion response
 */
interface PromptSuggestion {
  original: string
  refined: string
  improvements: string[]
  warnings: string[]
  smartScore: SmartScore
}

/**
 * AI response schema for structured output
 */
const promptRefinementSchema = z.object({
  refined: z.string().describe('The improved, refined prompt'),
  improvements: z.array(z.string()).describe('List of improvements made'),
  warnings: z.array(z.string()).describe('Potential issues or concerns'),
  smartScore: z.object({
    specific: z.number().min(0).max(100).describe('How specific the prompt is (0-100)'),
    measurable: z.number().min(0).max(100).describe('How measurable the outcome is (0-100)'),
    achievable: z.number().min(0).max(100).describe('How achievable the goal is (0-100)'),
    relevant: z.number().min(0).max(100).describe('How relevant the data sources are (0-100)'),
    timeBound: z.number().min(0).max(100).describe('How time-bound the criteria are (0-100)'),
  }),
})

/**
 * Heuristic-based fallback analysis when AI is unavailable
 */
function analyzePromptFallback(
  prompt: string,
  purpose?: string,
  sources?: { type: string; endpoint?: string; description?: string }[],
): PromptSuggestion {
  const combined = `${prompt} ${purpose || ''}`.toLowerCase()
  const scores: SmartScore = {
    specific: 0,
    measurable: 0,
    achievable: 0,
    relevant: 0,
    timeBound: 0,
    overall: 0,
  }
  const improvements: string[] = []
  const warnings: string[] = []

  // Specific
  const specificTerms = ['reduce', 'increase', 'achieve', 'complete', 'reach', 'deliver', 'verify']
  const vagueTerms = ['improve', 'better', 'more', 'good', 'great', 'help', 'change']
  if (specificTerms.some((t) => combined.includes(t))) scores.specific = 80
  else {
    scores.specific = 30
    improvements.push('Use specific action verbs like "reduce", "increase", or "achieve"')
  }
  if (vagueTerms.some((t) => combined.includes(t))) {
    scores.specific = Math.max(20, scores.specific - 30)
    warnings.push('Avoid vague terms — use concrete targets instead')
  }

  // Measurable
  const hasNumbers = /\d+/.test(combined)
  const hasMetrics = ['%', 'percent', 'lbs', 'kg', 'miles', 'dollars', '$', 'count', 'total'].some(
    (m) => combined.includes(m),
  )
  if (hasNumbers && hasMetrics) scores.measurable = 90
  else if (hasNumbers) {
    scores.measurable = 60
    improvements.push('Add units to your numbers (e.g., "50 lbs", "10%", "$1000")')
  } else {
    scores.measurable = 20
    improvements.push('Include specific numbers and metrics for verification')
  }

  // Achievable
  const extremeTerms = ['all', 'everything', 'everyone', 'world', 'universe', 'impossible', 'never']
  if (extremeTerms.some((t) => combined.includes(t))) {
    scores.achievable = 40
    warnings.push('Consider narrowing scope for achievability')
  } else scores.achievable = 80

  // Relevant
  const hasDataSource =
    (sources && sources.length > 0) ||
    ['api', 'data', 'source', 'fitbit', 'strava', 'github', 'endpoint'].some((s) =>
      combined.includes(s),
    )
  if (hasDataSource) scores.relevant = 90
  else {
    scores.relevant = 40
    improvements.push(
      'Specify data sources (e.g., "Fitbit API", "GitHub commits") for verification',
    )
  }

  // Time-bound
  const hasTimeBound =
    ['date', 'deadline', 'by', 'until', 'before', 'end', 'start'].some((t) =>
      combined.includes(t),
    ) || /\d{4}/.test(combined)
  if (hasTimeBound) scores.timeBound = 85
  else {
    scores.timeBound = 30
    improvements.push('Reference specific dates or timeframes in your prompt')
  }

  scores.overall = Math.round(
    (scores.specific + scores.measurable + scores.achievable + scores.relevant + scores.timeBound) /
      5,
  )

  return { original: prompt, refined: prompt, improvements, warnings, smartScore: scores }
}

/**
 * POST /api/prompt/refine
 * Refine a campaign verification prompt using AI
 */
export default defineEventHandler(async (event) => {
  try {
    const input = await parseBody(event, refinePromptSchema)
    const config = useRuntimeConfig(event)
    const anthropicApiKey = config.anthropicApiKey as string | undefined

    // If no API key is configured, fall back to heuristic analysis
    if (!anthropicApiKey) {
      logger.warn('No Anthropic API key configured — using heuristic fallback')
      const suggestion = analyzePromptFallback(input.prompt, input.purpose, input.sources)
      return { success: true, data: suggestion }
    }

    const anthropic = createAnthropic({ apiKey: anthropicApiKey })

    const sourcesDescription = (input.sources || [])
      .map((s) => `- ${s.type}: ${s.description || s.endpoint || 'No description'}`)
      .join('\n')

    const systemPrompt = `You are an expert at crafting SMART (Specific, Measurable, Achievable, Relevant, Time-bound) verification prompts for a crowdfunding platform called Pledgebook.

Your job is to analyze a user's campaign verification prompt and:
1. Score it on each SMART criterion (0-100)
2. Suggest a refined version that is clearer and more verifiable
3. List specific improvements made
4. Flag any warnings (vague language, unverifiable claims, etc.)

The prompt will be used by AI judges to evaluate whether a campaign creator achieved their goal, using data from specified sources. The refined prompt should:
- Have clear TRUE/FALSE success criteria
- Reference specific data values and thresholds
- Include instructions for what evidence to examine
- Be unambiguous for automated verification`

    const userMessage = `Please analyze and refine this campaign verification prompt:

**Prompt:** ${input.prompt}
${input.purpose ? `**Campaign Purpose:** ${input.purpose}` : ''}
${input.rulesAndResolution ? `**Rules & Resolution:** ${input.rulesAndResolution}` : ''}
${sourcesDescription ? `**Data Sources:**\n${sourcesDescription}` : '**Data Sources:** None specified'}

Return a refined prompt and SMART scores.`

    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: promptRefinementSchema,
      system: systemPrompt,
      prompt: userMessage,
      temperature: 0.3,
    })

    const suggestion: PromptSuggestion = {
      original: input.prompt,
      refined: object.refined,
      improvements: object.improvements,
      warnings: object.warnings,
      smartScore: {
        ...object.smartScore,
        overall: Math.round(
          (object.smartScore.specific +
            object.smartScore.measurable +
            object.smartScore.achievable +
            object.smartScore.relevant +
            object.smartScore.timeBound) /
            5,
        ),
      },
    }

    return { success: true, data: suggestion }
  } catch (error) {
    // If AI call fails, fall back to heuristic
    logger.error('AI prompt refinement failed, using fallback', { error: String(error) })

    try {
      const input = await parseBody(event, refinePromptSchema)
      const suggestion = analyzePromptFallback(input.prompt, input.purpose, input.sources)
      return { success: true, data: suggestion }
    } catch (fallbackError) {
      throw handleError(fallbackError)
    }
  }
})
