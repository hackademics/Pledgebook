import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { parseBody } from '../../utils/response'
import { handleError } from '../../utils/errors'

// =============================================================================
// POST /api/prompt/analyze-smart
// Purpose: Analyze purpose/prompt for SMART goal criteria
// =============================================================================

/**
 * Request schema for SMART analysis
 */
const analyzeSmartSchema = z.object({
  purpose: z.string().min(1),
  prompt: z.string().optional(),
  rulesAndResolution: z.string().optional(),
})

/**
 * SMART criteria result
 */
interface SmartCriteria {
  passed: boolean
  feedback: string
}

/**
 * SMART validation result
 */
interface SmartValidation {
  isValid: boolean
  score: number
  criteria: {
    specific: SmartCriteria
    measurable: SmartCriteria
    achievable: SmartCriteria
    relevant: SmartCriteria
    timeBound: SmartCriteria
  }
  suggestions: string[]
}

/**
 * Analyze text for SMART criteria
 */
function analyzeSmartCriteria(
  purpose: string,
  prompt?: string,
  rulesAndResolution?: string,
): SmartValidation {
  const combined = `${purpose} ${prompt || ''} ${rulesAndResolution || ''}`.toLowerCase()

  const criteria: SmartValidation['criteria'] = {
    specific: { passed: false, feedback: '' },
    measurable: { passed: false, feedback: '' },
    achievable: { passed: false, feedback: '' },
    relevant: { passed: false, feedback: '' },
    timeBound: { passed: false, feedback: '' },
  }

  const suggestions: string[] = []

  // Specific: Check for concrete actions and targets
  const vagueTerms = ['better', 'improve', 'more', 'good', 'great', 'help', 'change', 'enhance']
  const specificTerms = [
    'reduce',
    'increase',
    'achieve',
    'complete',
    'reach',
    'deliver',
    'verify',
    'obtain',
  ]
  const hasVague = vagueTerms.some((term) => combined.includes(term))
  const hasSpecific = specificTerms.some((term) => combined.includes(term))

  if (hasSpecific && !hasVague) {
    criteria.specific.passed = true
    criteria.specific.feedback = 'Good use of specific action verbs'
  } else if (hasSpecific) {
    criteria.specific.passed = true
    criteria.specific.feedback = 'Uses specific verbs, but also contains vague language'
    suggestions.push('Replace vague terms like "improve" with specific targets')
  } else {
    criteria.specific.passed = false
    criteria.specific.feedback =
      'Add specific, concrete actions (e.g., "reduce by X", "complete Y")'
    suggestions.push(
      'Replace vague goals like "make the world better" with "reduce weight by 50 lbs per Fitbit data"',
    )
  }

  // Measurable: Check for numbers/metrics
  const hasNumbers = /\d+/.test(combined)
  const hasMetrics = ['%', 'percent', 'lbs', 'kg', 'miles', 'dollars', '$', 'count', 'total'].some(
    (m) => combined.includes(m),
  )

  if (hasNumbers && hasMetrics) {
    criteria.measurable.passed = true
    criteria.measurable.feedback = 'Includes quantifiable metrics with units'
  } else if (hasNumbers) {
    criteria.measurable.passed = true
    criteria.measurable.feedback = 'Includes numbers - consider adding units for clarity'
    suggestions.push('Add units to numbers (e.g., "50 lbs" instead of just "50")')
  } else {
    criteria.measurable.passed = false
    criteria.measurable.feedback = 'Add specific numbers and units (e.g., "50 lbs", "10%", "$1000")'
    suggestions.push('Include measurable targets that AI can verify objectively')
  }

  // Achievable: Check for reasonable scope
  const extremeTerms = [
    'all',
    'everything',
    'everyone',
    'world',
    'universe',
    'impossible',
    'forever',
    'always',
    'never',
  ]
  const hasExtreme = extremeTerms.some((term) => combined.includes(term))

  if (!hasExtreme) {
    criteria.achievable.passed = true
    criteria.achievable.feedback = 'Goal appears achievable in scope'
  } else {
    criteria.achievable.passed = false
    criteria.achievable.feedback = 'Consider narrowing scope for achievability'
    suggestions.push('Narrow your scope to something achievable within the timeframe')
  }

  // Relevant: Check for data sources/verification method
  const hasDataSource = [
    'api',
    'data',
    'source',
    'fitbit',
    'strava',
    'github',
    'endpoint',
    'verify',
    'proof',
    'evidence',
  ].some((s) => combined.includes(s))

  if (hasDataSource) {
    criteria.relevant.passed = true
    criteria.relevant.feedback = 'Includes verifiable data sources or verification methods'
  } else {
    criteria.relevant.passed = false
    criteria.relevant.feedback = 'Add data sources for verification (APIs, images, documents)'
    suggestions.push(
      'Specify data sources like "Fitbit API" or "GitHub commits" for AI verification',
    )
  }

  // Time-bound: Check for dates/deadlines
  const hasTimeBound =
    ['date', 'deadline', 'by', 'until', 'before', 'end', 'start', 'week', 'month', 'year'].some(
      (t) => combined.includes(t),
    ) || /\d{4}/.test(combined)

  if (hasTimeBound) {
    criteria.timeBound.passed = true
    criteria.timeBound.feedback = 'Includes time constraints or deadlines'
  } else {
    criteria.timeBound.passed = false
    criteria.timeBound.feedback = 'Ensure end date is set and referenced in the goal'
    suggestions.push('Reference the deadline explicitly in your goal description')
  }

  // Calculate score
  const passed = Object.values(criteria).filter((c) => c.passed).length
  const score = Math.round((passed / 5) * 100)

  return {
    isValid: score >= 60,
    score,
    criteria,
    suggestions,
  }
}

/**
 * POST /api/prompt/analyze-smart
 * Analyze campaign purpose and prompt for SMART goal criteria
 */
export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const input = await parseBody(event, analyzeSmartSchema)

    // Perform SMART analysis
    const validation = analyzeSmartCriteria(input.purpose, input.prompt, input.rulesAndResolution)

    return {
      success: true,
      data: validation,
    }
  } catch (error) {
    throw handleError(error)
  }
})
