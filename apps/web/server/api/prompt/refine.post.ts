import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { parseBody } from '../../utils/response'
import { handleError } from '../../utils/errors'

// =============================================================================
// POST /api/prompt/refine
// Purpose: AI-powered prompt refinement for campaign verification
// Uses mock Claude API for hackathon - replace with real implementation
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
 * Analyze prompt for SMART criteria (mock AI analysis)
 */
function analyzePrompt(
  prompt: string,
  purpose?: string,
  sources?: { type: string; endpoint?: string; description?: string }[],
): PromptSuggestion {
  const combined = `${prompt} ${purpose || ''}`.toLowerCase()

  // Analyze each SMART criterion
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

  // Specific: Check for concrete actions and targets
  const specificTerms = ['reduce', 'increase', 'achieve', 'complete', 'reach', 'deliver', 'verify']
  const vagueTerms = ['improve', 'better', 'more', 'good', 'great', 'help', 'change']

  if (specificTerms.some((term) => combined.includes(term))) {
    scores.specific = 80
  } else {
    scores.specific = 30
    improvements.push('Use specific action verbs like "reduce", "increase", or "achieve"')
  }

  if (vagueTerms.some((term) => combined.includes(term))) {
    scores.specific = Math.max(20, scores.specific - 30)
    warnings.push('Avoid vague terms like "improve" or "better" - use concrete targets instead')
  }

  // Measurable: Check for numbers and metrics
  const hasNumbers = /\d+/.test(combined)
  const hasMetrics = ['%', 'percent', 'lbs', 'kg', 'miles', 'dollars', '$', 'count', 'total'].some(
    (m) => combined.includes(m),
  )
  const hasComparison = ['greater', 'less', 'more than', 'at least', '>=', '<=', '=='].some((c) =>
    combined.includes(c),
  )

  if (hasNumbers && hasMetrics) {
    scores.measurable = 90
  } else if (hasNumbers) {
    scores.measurable = 60
    improvements.push('Add units to your numbers (e.g., "50 lbs", "10%", "$1000")')
  } else {
    scores.measurable = 20
    improvements.push('Include specific numbers and metrics for verification')
  }

  if (hasComparison) {
    scores.measurable = Math.min(100, scores.measurable + 10)
  }

  // Achievable: Check for reasonable scope
  const extremeTerms = ['all', 'everything', 'everyone', 'world', 'universe', 'impossible', 'never']
  if (extremeTerms.some((term) => combined.includes(term))) {
    scores.achievable = 40
    warnings.push('Consider narrowing scope for achievability')
  } else {
    scores.achievable = 80
  }

  // Relevant: Check for data sources
  const hasDataSource =
    (sources && sources.length > 0) ||
    ['api', 'data', 'source', 'fitbit', 'strava', 'github', 'endpoint'].some((s) =>
      combined.includes(s),
    )

  if (hasDataSource) {
    scores.relevant = 90
  } else {
    scores.relevant = 40
    improvements.push(
      'Specify data sources (e.g., "Fitbit API", "GitHub commits") for verification',
    )
  }

  // Time-bound: Check for dates/deadlines
  const hasTimeBound =
    ['date', 'deadline', 'by', 'until', 'before', 'end', 'start'].some((t) =>
      combined.includes(t),
    ) || /\d{4}/.test(combined) // Year pattern

  if (hasTimeBound) {
    scores.timeBound = 85
  } else {
    scores.timeBound = 30
    improvements.push('Reference specific dates or timeframes in your prompt')
  }

  // Calculate overall score
  scores.overall = Math.round(
    (scores.specific + scores.measurable + scores.achievable + scores.relevant + scores.timeBound) /
      5,
  )

  // Generate refined prompt
  let refined = prompt

  // Add data source references if missing
  if (sources && sources.length > 0 && !combined.includes('source')) {
    const sourceDescriptions = sources
      .map((s) => {
        if (s.type === 'public-api' && s.endpoint) {
          return `Public API: ${s.endpoint}`
        } else if (s.type === 'private-api') {
          return `Private API (DECO/ZKP verified): ${s.description || s.endpoint || 'Authenticated endpoint'}`
        } else if (s.type === 'image-ocr') {
          return `Image OCR: ${s.description || 'AI-extracted value from uploaded image'}`
        }
        return s.description || s.type
      })
      .join('\n- ')

    refined += `\n\nData Sources:\n- ${sourceDescriptions}`
  }

  // Add success criteria structure if missing
  if (!combined.includes('true') && !combined.includes('false') && !combined.includes('success')) {
    refined += `\n\nSuccess Criteria:
Return TRUE if: [condition met based on data comparison]
Return FALSE if: [condition not met]

Include reasoning and cite the exact data values used.`
  }

  // Add time reference if missing
  if (!hasTimeBound) {
    refined += `\n\nVerification Timeline:
- Baseline capture: Campaign start date
- Final verification: Campaign end date`
  }

  return {
    original: prompt,
    refined: refined.trim(),
    improvements,
    warnings,
    smartScore: scores,
  }
}

/**
 * POST /api/prompt/refine
 * Refine a campaign verification prompt using AI
 */
export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const input = await parseBody(event, refinePromptSchema)

    // Perform analysis (mock AI - replace with real Claude/Gemini/Grok call)
    const suggestion = analyzePrompt(input.prompt, input.purpose, input.sources)

    return {
      success: true,
      data: suggestion,
    }
  } catch (error) {
    throw handleError(error)
  }
})
