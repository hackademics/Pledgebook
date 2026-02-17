import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCampaignCreation } from './useCampaignCreation'

// Mock the campaign store
vi.mock('../stores/campaign', () => ({
  useCampaignStore: () => ({
    draft: {
      currentStep: 1,
      name: '',
      slug: '',
      purpose: '',
      fundraisingGoal: '',
      creatorBond: '',
      endDate: '',
      startDate: '',
      rulesAndResolution: '',
      prompt: '',
      sources: [],
      privacyMode: false,
    },
    isBasicInfoComplete: false,
    isVerificationComplete: false,
    isPromptComplete: false,
    canSubmit: false,
  }),
}))

describe('useCampaignCreation', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('exports expected properties', () => {
    const creation = useCampaignCreation()
    expect(creation).toHaveProperty('store')
    expect(creation).toHaveProperty('steps')
    expect(creation).toHaveProperty('currentStep')
    expect(creation).toHaveProperty('validateStep')
    expect(creation).toHaveProperty('validateAll')
    expect(creation).toHaveProperty('getFieldError')
    expect(creation).toHaveProperty('clearErrors')
    expect(creation).toHaveProperty('analyzeSmartGoal')
    expect(creation).toHaveProperty('getSourceTypeLabel')
    expect(creation).toHaveProperty('getSourceTypeDescription')
    expect(creation).toHaveProperty('getSourceTypeIcon')
    expect(creation).toHaveProperty('createEmptySource')
    expect(creation).toHaveProperty('educationContent')
    expect(creation).toHaveProperty('getEducationContent')
  })

  it('has 4 steps', () => {
    const { steps } = useCampaignCreation()
    expect(steps.value).toHaveLength(4)
    expect(steps.value[0]!.title).toBe('Basic Info')
    expect(steps.value[3]!.title).toBe('Preview & Submit')
  })

  it('validateStep returns false for empty step 1', () => {
    const { validateStep } = useCampaignCreation()
    expect(validateStep(1)).toBe(false)
  })

  it('getFieldError returns empty string for valid field', () => {
    const { getFieldError } = useCampaignCreation()
    expect(getFieldError('nonexistent')).toBe('')
  })

  it('clearErrors resets validation errors', () => {
    const { validateStep, clearErrors, validationErrors } = useCampaignCreation()
    validateStep(1) // Will produce errors
    expect(Object.keys(validationErrors.value).length).toBeGreaterThan(0)

    clearErrors()
    expect(Object.keys(validationErrors.value).length).toBe(0)
  })

  it('getSourceTypeLabel returns correct labels', () => {
    const { getSourceTypeLabel } = useCampaignCreation()
    expect(getSourceTypeLabel('public-api')).toBe('Public API')
    expect(getSourceTypeLabel('private-api')).toBe('Private API (DECO/ZKP)')
    expect(getSourceTypeLabel('image-ocr')).toBe('Image/OCR Upload')
  })

  it('createEmptySource returns correct defaults', () => {
    const { createEmptySource } = useCampaignCreation()

    const publicSource = createEmptySource('public-api')
    expect(publicSource.type).toBe('public-api')
    expect(publicSource.isPrivate).toBe(false)
    expect(publicSource.isEncrypted).toBe(false)

    const privateSource = createEmptySource('private-api')
    expect(privateSource.type).toBe('private-api')
    expect(privateSource.isPrivate).toBe(true)
    expect(privateSource.isEncrypted).toBe(true)
  })

  it('getEducationContent returns content for valid keys', () => {
    const { getEducationContent } = useCampaignCreation()
    const content = getEducationContent('name')
    expect(content).toBeDefined()
    expect(content).toHaveProperty('title')
    expect(content).toHaveProperty('description')
  })

  it('getEducationContent returns null for invalid keys', () => {
    const { getEducationContent } = useCampaignCreation()
    expect(getEducationContent(null)).toBeNull()
    expect(getEducationContent('nonexistent')).toBeNull()
  })
})
