import { ref, computed } from 'vue'
import { z } from 'zod'
import { useCampaignStore, type DataSource, type DataSourceType } from '../stores/campaign'

// =============================================================================
// USE CAMPAIGN CREATION COMPOSABLE
// Purpose: Advanced form logic for campaign creation workflow
// Includes: AI prompt refinement, data validation, step management
// =============================================================================

/**
 * SMART goal criteria item
 */
export interface SmartCriterion {
  passed: boolean
  feedback: string
}

/**
 * SMART goal validation result
 */
export interface SmartValidation {
  isValid: boolean
  score: number
  criteria: {
    specific: SmartCriterion
    measurable: SmartCriterion
    achievable: SmartCriterion
    relevant: SmartCriterion
    timeBound: SmartCriterion
  }
  suggestions: string[]
}

/**
 * Education content field keys
 */
export type EducationContentKey =
  | 'name'
  | 'purpose'
  | 'fundraisingGoal'
  | 'creatorBond'
  | 'rulesAndResolution'
  | 'sources'
  | 'prompt'
  | 'privacyMode'

/**
 * Step definition for the multi-step form
 */
export interface FormStep {
  id: number
  title: string
  description: string
  icon: string
  isComplete: boolean
  isActive: boolean
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Slug must be lowercase with hyphens only')
    .max(100)
    .optional()
    .or(z.literal('')),
  purpose: z
    .string()
    .min(10, 'Purpose must be at least 10 characters')
    .max(1000, 'Purpose must not exceed 1000 characters'),
  fundraisingGoal: z
    .string()
    .regex(/^\d+$/, 'Goal must be a valid amount')
    .refine((val) => BigInt(val) > 0n, 'Goal must be greater than 0'),
  creatorBond: z
    .string()
    .regex(/^\d+$/, 'Bond must be a valid amount')
    .refine((val) => BigInt(val) >= 0n, 'Bond must be 0 or greater'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine((val) => new Date(val) > new Date(), 'End date must be in the future'),
  startDate: z.string().optional().or(z.literal('')),
})

export const verificationSchema = z.object({
  rulesAndResolution: z
    .string()
    .min(10, 'Rules must be at least 10 characters')
    .max(2000, 'Rules must not exceed 2000 characters'),
})

export const promptSchema = z.object({
  prompt: z
    .string()
    .min(20, 'Prompt must be at least 20 characters')
    .max(5000, 'Prompt must not exceed 5000 characters'),
})

export const dataSourceSchema = z
  .object({
    type: z.enum(['public-api', 'private-api', 'image-ocr']),
    label: z.string().min(1, 'Label is required'),
    endpoint: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    apiKey: z.string().optional(),
    apiToken: z.string().optional(),
    fileUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    description: z.string().optional(),
    isPrivate: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const hasEndpoint = Boolean(value.endpoint && value.endpoint.trim())
    const hasFileUrl = Boolean(value.fileUrl && value.fileUrl.trim())

    if (value.type === 'image-ocr' && !hasFileUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fileUrl'],
        message: 'Image URL is required for image/OCR sources',
      })
    }

    if (value.type !== 'image-ocr' && !hasEndpoint) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endpoint'],
        message: 'API endpoint is required for API sources',
      })
    }
  })

// =============================================================================
// COMPOSABLE
// =============================================================================

export function useCampaignCreation() {
  const store = useCampaignStore()

  // Local state
  const validationErrors = ref<Record<string, string>>({})
  const isValidating = ref(false)
  const smartValidation = ref<SmartValidation | null>(null)

  // ==========================================================================
  // STEP DEFINITIONS
  // ==========================================================================

  const steps = computed<FormStep[]>(() => [
    {
      id: 1,
      title: 'Basic Info',
      description: 'Campaign name, purpose, goal, and timeline',
      icon: 'heroicons:sparkles',
      isComplete: Boolean(store.isBasicInfoComplete),
      isActive: store.draft.currentStep === 1,
    },
    {
      id: 2,
      title: 'Verification Setup',
      description: 'Define rules and data sources for verification',
      icon: 'heroicons:shield-check',
      isComplete: Boolean(store.isVerificationComplete),
      isActive: store.draft.currentStep === 2,
    },
    {
      id: 3,
      title: 'AI Prompt',
      description: 'Craft and refine your verification prompt',
      icon: 'heroicons:cpu-chip',
      isComplete: Boolean(store.isPromptComplete),
      isActive: store.draft.currentStep === 3,
    },
    {
      id: 4,
      title: 'Preview & Submit',
      description: 'Review and submit your campaign',
      icon: 'heroicons:paper-airplane',
      isComplete: Boolean(store.canSubmit),
      isActive: store.draft.currentStep === 4,
    },
  ])

  const currentStep = computed(() => steps.value.find((s) => s.isActive) || steps.value[0])

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate a specific step
   */
  function validateStep(stepId: number): boolean {
    validationErrors.value = {}

    try {
      switch (stepId) {
        case 1: {
          const result = basicInfoSchema.safeParse({
            name: store.draft.name,
            slug: store.draft.slug,
            purpose: store.draft.purpose,
            fundraisingGoal: store.draft.fundraisingGoal || '0',
            creatorBond: store.draft.creatorBond || '0',
            endDate: store.draft.endDate,
            startDate: store.draft.startDate,
          })

          if (!result.success) {
            result.error.errors.forEach((err) => {
              validationErrors.value[err.path[0] as string] = err.message
            })
            return false
          }
          return true
        }

        case 2: {
          const result = verificationSchema.safeParse({
            rulesAndResolution: store.draft.rulesAndResolution,
          })

          if (!result.success) {
            result.error.errors.forEach((err) => {
              validationErrors.value[err.path[0] as string] = err.message
            })
            return false
          }
          return true
        }

        case 3: {
          const result = promptSchema.safeParse({
            prompt: store.draft.prompt,
          })

          if (!result.success) {
            result.error.errors.forEach((err) => {
              validationErrors.value[err.path[0] as string] = err.message
            })
            return false
          }
          return true
        }

        default:
          return true
      }
    } catch {
      return false
    }
  }

  /**
   * Validate all steps
   */
  function validateAll(): boolean {
    return validateStep(1) && validateStep(2) && validateStep(3)
  }

  /**
   * Get error for a specific field
   */
  function getFieldError(field: string): string {
    return validationErrors.value[field] || ''
  }

  /**
   * Clear validation errors
   */
  function clearErrors(): void {
    validationErrors.value = {}
  }

  // ==========================================================================
  // SMART GOAL VALIDATION
  // ==========================================================================

  /**
   * Analyze purpose/prompt for SMART criteria
   */
  async function analyzeSmartGoal(): Promise<SmartValidation> {
    isValidating.value = true

    try {
      // Call API for AI-based SMART analysis
      const response = await $fetch<{
        success: boolean
        data?: SmartValidation
      }>('/api/prompt/analyze-smart', {
        method: 'POST',
        body: {
          purpose: store.draft.purpose,
          prompt: store.draft.prompt,
          rulesAndResolution: store.draft.rulesAndResolution,
        },
      }).catch(() => null)

      if (response?.success && response.data) {
        smartValidation.value = response.data
        return response.data
      }

      // Fallback to local validation if API fails
      const localValidation = performLocalSmartValidation()
      smartValidation.value = localValidation
      return localValidation
    } finally {
      isValidating.value = false
    }
  }

  /**
   * Local SMART validation fallback
   */
  function performLocalSmartValidation(): SmartValidation {
    const purpose = store.draft.purpose.toLowerCase()
    const prompt = store.draft.prompt.toLowerCase()
    const combined = `${purpose} ${prompt}`

    const criteria = {
      specific: {
        passed: false,
        feedback: '',
      },
      measurable: {
        passed: false,
        feedback: '',
      },
      achievable: {
        passed: false,
        feedback: '',
      },
      relevant: {
        passed: false,
        feedback: '',
      },
      timeBound: {
        passed: false,
        feedback: '',
      },
    }

    const suggestions: string[] = []

    // Specific: Check for vague language
    const vagueTerms = ['better', 'improve', 'more', 'good', 'great', 'help', 'change']
    const specificTerms = ['reduce', 'increase', 'achieve', 'complete', 'reach', 'deliver']
    const hasVague = vagueTerms.some((term) => combined.includes(term))
    const hasSpecific = specificTerms.some((term) => combined.includes(term))

    criteria.specific.passed = hasSpecific && !hasVague
    criteria.specific.feedback = hasSpecific
      ? 'Good use of specific action verbs'
      : 'Add specific, concrete actions (e.g., "reduce by X", "complete Y")'

    if (!criteria.specific.passed) {
      suggestions.push(
        'Replace vague terms like "improve" with specific targets like "reduce weight by 50 lbs"',
      )
    }

    // Measurable: Check for numbers/metrics
    const hasNumbers = /\d+/.test(combined)
    const hasMetrics = [
      '%',
      'percent',
      'lbs',
      'kg',
      'miles',
      'dollars',
      '$',
      'count',
      'total',
    ].some((m) => combined.includes(m))

    criteria.measurable.passed = hasNumbers && hasMetrics
    criteria.measurable.feedback =
      hasNumbers && hasMetrics
        ? 'Includes quantifiable metrics'
        : 'Add specific numbers and units (e.g., "50 lbs", "10%", "$1000")'

    if (!criteria.measurable.passed) {
      suggestions.push('Include measurable targets with numbers and units')
    }

    // Achievable: Check for reasonable scope
    const extremeTerms = ['all', 'everything', 'everyone', 'world', 'universe', 'impossible']
    const hasExtreme = extremeTerms.some((term) => combined.includes(term))

    criteria.achievable.passed = !hasExtreme
    criteria.achievable.feedback = !hasExtreme
      ? 'Goal appears achievable in scope'
      : 'Consider narrowing scope for achievability'

    if (!criteria.achievable.passed) {
      suggestions.push('Narrow your scope to something achievable within the timeframe')
    }

    // Relevant: Check for data sources
    const hasDataSource =
      store.draft.sources.length > 0 ||
      ['api', 'data', 'source', 'fitbit', 'strava', 'github'].some((s) => combined.includes(s))

    criteria.relevant.passed = hasDataSource
    criteria.relevant.feedback = hasDataSource
      ? 'Includes verifiable data sources'
      : 'Add data sources for verification (APIs, images, documents)'

    if (!criteria.relevant.passed) {
      suggestions.push(
        'Specify data sources like "Fitbit API" or "GitHub commits" for verification',
      )
    }

    // Time-bound: Check for dates/deadlines
    const hasTimeBound =
      ['date', 'deadline', 'by', 'until', 'before', 'end'].some((t) => combined.includes(t)) ||
      Boolean(store.draft.endDate)

    criteria.timeBound.passed = Boolean(hasTimeBound)
    criteria.timeBound.feedback = hasTimeBound
      ? 'Includes time constraints'
      : 'Ensure end date is set and referenced in the goal'

    if (!criteria.timeBound.passed) {
      suggestions.push('Reference the deadline in your goal description')
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

  // ==========================================================================
  // DATA SOURCE HELPERS
  // ==========================================================================

  /**
   * Get label for data source type
   */
  function getSourceTypeLabel(type: DataSourceType): string {
    const labels: Record<DataSourceType, string> = {
      'public-api': 'Public API',
      'private-api': 'Private API (DECO/ZKP)',
      'image-ocr': 'Image/OCR Upload',
    }
    return labels[type]
  }

  /**
   * Get description for data source type
   */
  function getSourceTypeDescription(type: DataSourceType): string {
    const descriptions: Record<DataSourceType, string> = {
      'public-api': 'Publicly accessible API endpoint (e.g., FBI UCR, public statistics)',
      'private-api':
        'API requiring authentication (e.g., Fitbit, Strava). Keys are encrypted and used via DECO for ZKP.',
      'image-ocr': 'Upload image for AI-based OCR extraction (e.g., scale photo for weight).',
    }
    return descriptions[type]
  }

  /**
   * Get icon for data source type
   */
  function getSourceTypeIcon(type: DataSourceType): string {
    const icons: Record<DataSourceType, string> = {
      'public-api': 'heroicons:globe-alt',
      'private-api': 'heroicons:lock-closed',
      'image-ocr': 'heroicons:photo',
    }
    return icons[type]
  }

  /**
   * Create empty source of given type
   */
  function createEmptySource(type: DataSourceType): Omit<DataSource, 'id'> {
    return {
      type,
      label: '',
      endpoint: '',
      apiKey: '',
      apiToken: '',
      fileUrl: '',
      ipfsHash: '',
      isEncrypted: type === 'private-api',
      description: '',
      isPrivate: type !== 'public-api',
    }
  }

  // ==========================================================================
  // EDUCATION CONTENT
  // ==========================================================================

  const educationContent = {
    name: {
      title: 'Campaign Name',
      description: 'Choose a clear, memorable name that captures your goal.',
      why: 'A good name helps donors understand and remember your campaign.',
    },
    purpose: {
      title: 'Purpose Statement',
      description:
        'Describe your SMART goal: Specific, Measurable, Achievable, Relevant, Time-bound.',
      why: 'Clear goals enable objective AI verification and build donor trust.',
      examples: {
        good: 'Lose 50 lbs by Dec 2026 as verified by weekly Fitbit weigh-ins',
        bad: 'Get healthier and feel better about myself',
      },
    },
    fundraisingGoal: {
      title: 'Fundraising Goal',
      description: 'The total amount you need to achieve your goal.',
      why: 'Sets clear expectations for donors and triggers automatic fund release on success.',
    },
    creatorBond: {
      title: 'Creator Bond',
      description: 'Amount you stake to show commitment. Forfeited if campaign fails.',
      why: 'Bonds prevent fraud by ensuring creator has skin in the game. Returned on success.',
    },
    rulesAndResolution: {
      title: 'Rules & Resolution Criteria',
      description: 'Define exactly how success/failure is determined.',
      why: 'Clear rules enable unambiguous AI consensus and dispute resolution.',
    },
    sources: {
      title: 'Verification Data Sources',
      description: 'Specify where verification data comes from.',
      why: 'Verifiable sources ensure tamper-proof consensus. AI fetches data directly from these sources.',
      types: {
        'public-api': 'Public APIs (no authentication needed) like government statistics',
        'private-api':
          'Private APIs (Fitbit, Strava) - your keys are encrypted and used via DECO for ZKP without exposing raw data',
        'image-ocr': 'Images uploaded to IPFS - AI extracts values via OCR (e.g., scale photo)',
      },
    },
    prompt: {
      title: 'AI Verification Prompt',
      description: 'The exact prompt AI systems use to verify your goal.',
      why: 'This prompt is hashed (keccak256) and stored on IPFS for immutability. Multiple AI providers (Claude, Gemini, Grok) must reach ≥66% consensus.',
    },
    privacyMode: {
      title: 'Privacy Mode',
      description: 'Enable zero-knowledge proofs for sensitive data.',
      why: 'ZKPs prove outcomes (e.g., "lost ≥50 lbs") without revealing actual values. Uses DECO for private API attestation.',
    },
  } as const

  /**
   * Get education content for a field (type-safe)
   */
  function getEducationContent(key: string | null) {
    if (!key) return null
    return educationContent[key as EducationContentKey] || null
  }

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // Store reference
    store,

    // Steps
    steps,
    currentStep,

    // Validation
    validationErrors,
    isValidating,
    smartValidation,
    validateStep,
    validateAll,
    getFieldError,
    clearErrors,
    analyzeSmartGoal,

    // Data sources
    getSourceTypeLabel,
    getSourceTypeDescription,
    getSourceTypeIcon,
    createEmptySource,

    // Education
    educationContent,
    getEducationContent,
  }
}
