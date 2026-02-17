import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { keccak256, toBytes, toHex } from 'viem'

// =============================================================================
// CAMPAIGN STORE
// Purpose: Pinia store for campaign creation draft state management
// =============================================================================

/**
 * Data source types for campaign verification
 */
export type DataSourceType = 'public-api' | 'private-api' | 'image-ocr'

/**
 * Data source configuration for verification
 */
export interface DataSource {
  id: string
  type: DataSourceType
  label: string
  // Public API
  endpoint?: string
  // Private API (encrypted client-side, stored in CRE secrets)
  apiKey?: string
  apiToken?: string
  // Image/OCR
  fileUrl?: string
  ipfsHash?: string
  isEncrypted?: boolean
  // Common
  description?: string
  isPrivate: boolean
}

/**
 * Campaign draft state
 */
export interface CampaignDraft {
  // Basic info
  name: string
  slug: string
  purpose: string
  fundraisingGoal: string
  creatorBond: string
  endDate: string
  startDate: string
  // Verification
  rulesAndResolution: string
  sources: DataSource[]
  // Prompt
  prompt: string
  promptHash: string
  // Settings
  privacyMode: boolean
  consensusThreshold: number
  // Media
  imageUrl: string
  bannerUrl: string
  // Categories
  tags: string[]
  categories: string[]
  // Metadata
  currentStep: number
  lastSavedAt: string | null
  isDirty: boolean
}

/**
 * Prompt refinement suggestion from AI
 */
export interface PromptSuggestion {
  original: string
  refined: string
  improvements: string[]
  warnings: string[]
  smartScore: {
    specific: number
    measurable: number
    achievable: number
    relevant: number
    timeBound: number
    overall: number
  }
}

const STORAGE_KEY = 'pledgebook-campaign-draft'

const DEFAULT_DRAFT: CampaignDraft = {
  name: '',
  slug: '',
  purpose: '',
  fundraisingGoal: '',
  creatorBond: '',
  endDate: '',
  startDate: '',
  rulesAndResolution: '',
  sources: [],
  prompt: '',
  promptHash: '',
  privacyMode: false,
  consensusThreshold: 0.66,
  imageUrl: '',
  bannerUrl: '',
  tags: [],
  categories: [],
  currentStep: 1,
  lastSavedAt: null,
  isDirty: false,
}

export const useCampaignStore = defineStore('campaign', () => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const draft = ref<CampaignDraft>({ ...DEFAULT_DRAFT })
  const isLoading = ref(false)
  const isSaving = ref(false)
  const saveError = ref<string | null>(null)
  const promptSuggestion = ref<PromptSuggestion | null>(null)
  const isRefiningPrompt = ref(false)

  // ==========================================================================
  // COMPUTED
  // ==========================================================================

  /**
   * Calculate prompt hash using keccak256
   */
  const computedPromptHash = computed(() => {
    if (!draft.value.prompt.trim()) return ''
    try {
      const hash = keccak256(toBytes(draft.value.prompt.trim()))
      return toHex(hash)
    } catch {
      return ''
    }
  })

  /**
   * Check if basic info step is complete
   */
  const isBasicInfoComplete = computed(() => {
    return (
      draft.value.name.trim().length >= 3 &&
      draft.value.purpose.trim().length >= 10 &&
      draft.value.fundraisingGoal &&
      BigInt(draft.value.fundraisingGoal || '0') > 0n &&
      draft.value.endDate
    )
  })

  /**
   * Check if verification step is complete
   */
  const isVerificationComplete = computed(() => {
    return draft.value.rulesAndResolution.trim().length >= 10
  })

  /**
   * Check if prompt step is complete
   */
  const isPromptComplete = computed(() => {
    return draft.value.prompt.trim().length >= 20
  })

  /**
   * Overall form progress (0-100)
   */
  const formProgress = computed(() => {
    let progress = 0

    // Basic info (40%)
    if (draft.value.name.trim()) progress += 8
    if (draft.value.purpose.trim()) progress += 8
    if (draft.value.fundraisingGoal) progress += 8
    if (draft.value.creatorBond) progress += 8
    if (draft.value.endDate) progress += 8

    // Verification (30%)
    if (draft.value.rulesAndResolution.trim()) progress += 15
    if (draft.value.sources.length > 0) progress += 15

    // Prompt (30%)
    if (draft.value.prompt.trim()) progress += 30

    return Math.min(100, progress)
  })

  /**
   * Check if form can be submitted
   */
  const canSubmit = computed(() => {
    return isBasicInfoComplete.value && isVerificationComplete.value && isPromptComplete.value
  })

  /**
   * Get step validation status
   */
  const stepValidation = computed(() => ({
    1: isBasicInfoComplete.value,
    2: isVerificationComplete.value,
    3: isPromptComplete.value,
    4: canSubmit.value,
  }))

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Load draft from localStorage
   */
  function loadDraft(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CampaignDraft
        draft.value = { ...DEFAULT_DRAFT, ...parsed, isDirty: false }
        return true
      }
    } catch (error) {
      if (import.meta.dev) console.error('Failed to load campaign draft:', error)
    }
    return false
  }

  /**
   * Save draft to localStorage
   */
  function saveDraft(): void {
    if (typeof window === 'undefined') return

    try {
      isSaving.value = true
      saveError.value = null

      const redactedSources = draft.value.sources.map((source) =>
        source.type === 'private-api' ? { ...source, apiKey: '', apiToken: '' } : source,
      )

      const toSave = {
        ...draft.value,
        sources: redactedSources,
        lastSavedAt: new Date().toISOString(),
        isDirty: false,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      draft.value.lastSavedAt = toSave.lastSavedAt
      draft.value.isDirty = false
    } catch (error) {
      if (import.meta.dev) console.error('Failed to save campaign draft:', error)
      saveError.value = 'Failed to save draft'
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Clear draft from localStorage
   */
  function clearDraft(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEY)
      draft.value = { ...DEFAULT_DRAFT }
      promptSuggestion.value = null
    } catch (error) {
      if (import.meta.dev) console.error('Failed to clear campaign draft:', error)
    }
  }

  /**
   * Update draft field and mark as dirty
   */
  function updateField<K extends keyof CampaignDraft>(field: K, value: CampaignDraft[K]): void {
    draft.value[field] = value
    draft.value.isDirty = true

    // Update prompt hash when prompt changes
    if (field === 'prompt') {
      draft.value.promptHash = computedPromptHash.value
    }
  }

  /**
   * Set current step
   */
  function setStep(step: number): void {
    if (step >= 1 && step <= 4) {
      draft.value.currentStep = step
    }
  }

  /**
   * Navigate to next step if current is valid
   */
  function nextStep(): boolean {
    const current = draft.value.currentStep

    if (current === 1 && !isBasicInfoComplete.value) return false
    if (current === 2 && !isVerificationComplete.value) return false
    if (current === 3 && !isPromptComplete.value) return false
    if (current >= 4) return false

    draft.value.currentStep = current + 1
    return true
  }

  /**
   * Navigate to previous step
   */
  function prevStep(): boolean {
    if (draft.value.currentStep <= 1) return false
    draft.value.currentStep -= 1
    return true
  }

  // ==========================================================================
  // DATA SOURCES MANAGEMENT
  // ==========================================================================

  /**
   * Add a new data source
   */
  function addSource(source: Omit<DataSource, 'id'>): string {
    const id = `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    draft.value.sources.push({ ...source, id })
    draft.value.isDirty = true
    return id
  }

  /**
   * Update an existing data source
   */
  function updateSource(id: string, updates: Partial<DataSource>): void {
    const index = draft.value.sources.findIndex((s) => s.id === id)
    if (index !== -1) {
      const current = draft.value.sources[index]!
      // Only update defined optional properties
      if (updates.endpoint !== undefined) current.endpoint = updates.endpoint
      if (updates.apiKey !== undefined) current.apiKey = updates.apiKey
      if (updates.apiToken !== undefined) current.apiToken = updates.apiToken
      if (updates.fileUrl !== undefined) current.fileUrl = updates.fileUrl
      if (updates.ipfsHash !== undefined) current.ipfsHash = updates.ipfsHash
      if (updates.isEncrypted !== undefined) current.isEncrypted = updates.isEncrypted
      if (updates.description !== undefined) current.description = updates.description
      // Always update required fields if provided
      if (updates.id !== undefined) current.id = updates.id
      if (updates.type !== undefined) current.type = updates.type
      if (updates.label !== undefined) current.label = updates.label
      if (updates.isPrivate !== undefined) current.isPrivate = updates.isPrivate
      draft.value.isDirty = true
    }
  }

  /**
   * Remove a data source
   */
  function removeSource(id: string): void {
    draft.value.sources = draft.value.sources.filter((s) => s.id !== id)
    draft.value.isDirty = true
  }

  // ==========================================================================
  // PROMPT REFINEMENT
  // ==========================================================================

  /**
   * Request AI prompt refinement
   */
  async function refinePrompt(): Promise<PromptSuggestion | null> {
    if (!draft.value.prompt.trim()) return null

    isRefiningPrompt.value = true

    try {
      const response = await $fetch<{
        success: boolean
        data?: PromptSuggestion
        error?: { message: string }
      }>('/api/prompt/refine', {
        method: 'POST',
        body: {
          prompt: draft.value.prompt,
          purpose: draft.value.purpose,
          rulesAndResolution: draft.value.rulesAndResolution,
          sources: draft.value.sources.map((s) => ({
            type: s.type,
            endpoint: s.endpoint,
            description: s.description,
          })),
        },
      })

      if (response.success && response.data) {
        promptSuggestion.value = response.data
        return response.data
      }

      return null
    } catch (error) {
      if (import.meta.dev) console.error('Failed to refine prompt:', error)
      return null
    } finally {
      isRefiningPrompt.value = false
    }
  }

  /**
   * Apply refined prompt suggestion
   */
  function applyPromptSuggestion(): void {
    if (promptSuggestion.value) {
      draft.value.prompt = promptSuggestion.value.refined
      draft.value.promptHash = computedPromptHash.value
      draft.value.isDirty = true
    }
  }

  /**
   * Dismiss prompt suggestion
   */
  function dismissPromptSuggestion(): void {
    promptSuggestion.value = null
  }

  // ==========================================================================
  // EXPORT DATA
  // ==========================================================================

  /**
   * Get form data for submission
   */
  function getSubmissionData() {
    return {
      name: draft.value.name.trim(),
      slug: draft.value.slug || undefined,
      purpose: draft.value.purpose.trim(),
      rulesAndResolution: draft.value.rulesAndResolution.trim(),
      prompt: draft.value.prompt.trim(),
      promptHash: computedPromptHash.value,
      fundraisingGoal: draft.value.fundraisingGoal,
      creatorBond: draft.value.creatorBond,
      endDate: draft.value.endDate ? new Date(draft.value.endDate).toISOString() : '',
      startDate: draft.value.startDate ? new Date(draft.value.startDate).toISOString() : undefined,
      tags: draft.value.tags,
      categories: draft.value.categories,
      imageUrl: draft.value.imageUrl || null,
      bannerUrl: draft.value.bannerUrl || null,
      privacyMode: draft.value.privacyMode,
      consensusThreshold: draft.value.consensusThreshold,
      sources: draft.value.sources,
    }
  }

  // ==========================================================================
  // AUTO-SAVE WATCHER
  // ==========================================================================

  // Auto-save draft when it changes (debounced)
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  watch(
    () => draft.value.isDirty,
    (isDirty) => {
      if (isDirty) {
        if (saveTimeout) clearTimeout(saveTimeout)
        saveTimeout = setTimeout(() => {
          saveDraft()
        }, 2000)
      }
    },
  )

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    draft,
    isLoading,
    isSaving,
    saveError,
    promptSuggestion,
    isRefiningPrompt,

    // Computed
    computedPromptHash,
    isBasicInfoComplete,
    isVerificationComplete,
    isPromptComplete,
    formProgress,
    canSubmit,
    stepValidation,

    // Actions
    loadDraft,
    saveDraft,
    clearDraft,
    updateField,
    setStep,
    nextStep,
    prevStep,

    // Data sources
    addSource,
    updateSource,
    removeSource,

    // Prompt refinement
    refinePrompt,
    applyPromptSuggestion,
    dismissPromptSuggestion,

    // Export
    getSubmissionData,
  }
})
