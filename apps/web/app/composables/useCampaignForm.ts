import { ref, reactive, computed, watch } from 'vue'
import type { CreateCampaignInput } from '../../server/domains/campaigns'

// =============================================================================
// USE CAMPAIGN FORM COMPOSABLE
// Purpose: Manage campaign form state, validation, and submission
// =============================================================================

interface FormField<T> {
  value: T
  error: string
  touched: boolean
  dirty: boolean
}

interface CampaignFormState {
  name: FormField<string>
  slug: FormField<string>
  purpose: FormField<string>
  rulesAndResolution: FormField<string>
  prompt: FormField<string>
  fundraisingGoal: FormField<string>
  endDate: FormField<string>
  startDate: FormField<string>
  tags: FormField<string[]>
  categories: FormField<string[]>
  imageUrl: FormField<string>
  bannerUrl: FormField<string>
  privacyMode: FormField<boolean>
  consensusThreshold: FormField<number>
}

interface SubmitState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
  attemptCount: number
}

// Validation rules
const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  slug: {
    required: false,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/,
  },
  purpose: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
  rulesAndResolution: {
    required: true,
    minLength: 10,
    maxLength: 2000,
  },
  prompt: {
    required: true,
    minLength: 20,
    maxLength: 5000,
  },
  fundraisingGoal: {
    required: true,
    minValue: 1,
  },
  endDate: {
    required: true,
    futureOnly: true,
  },
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

/**
 * Create a form field with default values
 */
function createField<T>(defaultValue: T): FormField<T> {
  return {
    value: defaultValue,
    error: '',
    touched: false,
    dirty: false,
  }
}

export function useCampaignForm() {
  // Form state
  const form = reactive<CampaignFormState>({
    name: createField(''),
    slug: createField(''),
    purpose: createField(''),
    rulesAndResolution: createField(''),
    prompt: createField(''),
    fundraisingGoal: createField(''),
    endDate: createField(''),
    startDate: createField(''),
    tags: createField<string[]>([]),
    categories: createField<string[]>([]),
    imageUrl: createField(''),
    bannerUrl: createField(''),
    privacyMode: createField(false),
    consensusThreshold: createField(0.66),
  })

  // Submission state
  const submitState = reactive<SubmitState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
    attemptCount: 0,
  })

  // Slug availability checking
  const slugChecking = ref(false)
  const slugAvailable = ref<boolean | null>(null)
  let slugCheckTimeout: ReturnType<typeof setTimeout> | null = null

  // Auto-generate slug from name
  const autoGenerateSlug = ref(true)

  watch(
    () => form.name.value,
    (newName) => {
      if (autoGenerateSlug.value && !form.slug.dirty) {
        form.slug.value = generateSlug(newName)
        checkSlugAvailability(form.slug.value)
      }
    },
  )

  // Watch for manual slug changes
  watch(
    () => form.slug.value,
    (newSlug) => {
      if (form.slug.dirty) {
        checkSlugAvailability(newSlug)
      }
    },
  )

  /**
   * Check if slug is available (debounced)
   */
  async function checkSlugAvailability(slug: string) {
    if (slugCheckTimeout) {
      clearTimeout(slugCheckTimeout)
    }

    if (!slug || slug.length < 3) {
      slugAvailable.value = null
      return
    }

    slugChecking.value = true
    slugAvailable.value = null

    slugCheckTimeout = setTimeout(async () => {
      try {
        // Mock API call - replace with real endpoint
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Simulate some slugs being taken
        const takenSlugs = ['test', 'demo', 'campaign', 'example']
        slugAvailable.value = !takenSlugs.includes(slug)
      } catch {
        slugAvailable.value = null
      } finally {
        slugChecking.value = false
      }
    }, 300)
  }

  /**
   * Validate a single field
   */
  function validateField(fieldName: keyof CampaignFormState): string {
    const field = form[fieldName]
    const rules = VALIDATION_RULES[fieldName as keyof typeof VALIDATION_RULES]

    if (!rules) return ''

    // Required check
    if ('required' in rules && rules.required) {
      if (fieldName === 'tags' || fieldName === 'categories') {
        // Array fields don't need to be checked for required
      } else if (typeof field.value === 'string' && !field.value.trim()) {
        return `${formatFieldName(fieldName)} is required`
      } else if (
        typeof field.value === 'number' &&
        (Number.isNaN(field.value) || field.value === 0)
      ) {
        return `${formatFieldName(fieldName)} is required`
      }
    }

    // String length checks
    if (typeof field.value === 'string') {
      if ('minLength' in rules && field.value.length > 0 && field.value.length < rules.minLength!) {
        return `${formatFieldName(fieldName)} must be at least ${rules.minLength} characters`
      }
      if ('maxLength' in rules && field.value.length > rules.maxLength!) {
        return `${formatFieldName(fieldName)} must not exceed ${rules.maxLength} characters`
      }
      if ('pattern' in rules && field.value && !rules.pattern!.test(field.value)) {
        return `${formatFieldName(fieldName)} contains invalid characters`
      }
    }

    // Future date check
    if ('futureOnly' in rules && rules.futureOnly && field.value) {
      const date = new Date(field.value as string)
      if (date <= new Date()) {
        return `${formatFieldName(fieldName)} must be in the future`
      }
    }

    // Min value check for currency
    if ('minValue' in rules && fieldName === 'fundraisingGoal') {
      const wei = BigInt((field.value as string) || '0')
      const minWei = BigInt(rules.minValue! * 1e6) // USDC has 6 decimals
      if (wei < minWei) {
        return `${formatFieldName(fieldName)} must be at least $${rules.minValue}`
      }
    }

    return ''
  }

  /**
   * Format field name for display in error messages
   */
  function formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  /**
   * Validate all fields
   */
  function validateAll(): boolean {
    let isValid = true
    const fieldNames = Object.keys(form) as (keyof CampaignFormState)[]

    for (const fieldName of fieldNames) {
      const error = validateField(fieldName)
      form[fieldName].error = error
      form[fieldName].touched = true
      if (error) {
        isValid = false
      }
    }

    // Additional slug availability check
    if (form.slug.value && slugAvailable.value === false) {
      form.slug.error = 'This URL is already taken'
      isValid = false
    }

    return isValid
  }

  /**
   * Touch a field (mark as interacted)
   */
  function touchField(fieldName: keyof CampaignFormState) {
    form[fieldName].touched = true
    form[fieldName].error = validateField(fieldName)
  }

  /**
   * Mark field as dirty (user modified)
   */
  function dirtyField(fieldName: keyof CampaignFormState) {
    form[fieldName].dirty = true
    if (fieldName === 'slug') {
      autoGenerateSlug.value = false
    }
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    const fieldNames = Object.keys(form) as (keyof CampaignFormState)[]
    for (const fieldName of fieldNames) {
      const field = form[fieldName]
      if (Array.isArray(field.value)) {
        field.value = [] as never
      } else if (typeof field.value === 'boolean') {
        field.value = false as never
      } else if (typeof field.value === 'number') {
        field.value = (fieldName === 'consensusThreshold' ? 0.66 : 0) as never
      } else {
        field.value = '' as never
      }
      field.error = ''
      field.touched = false
      field.dirty = false
    }

    autoGenerateSlug.value = true
    slugAvailable.value = null

    submitState.isSubmitting = false
    submitState.isSuccess = false
    submitState.error = null
    submitState.attemptCount = 0
  }

  /**
   * Get form data for submission
   */
  function getFormData(): CreateCampaignInput {
    return {
      name: form.name.value.trim(),
      slug: form.slug.value || undefined,
      purpose: form.purpose.value.trim(),
      rulesAndResolution: form.rulesAndResolution.value.trim(),
      prompt: form.prompt.value.trim(),
      fundraisingGoal: form.fundraisingGoal.value,
      endDate: new Date(form.endDate.value).toISOString(),
      startDate: form.startDate.value ? new Date(form.startDate.value).toISOString() : undefined,
      tags: form.tags.value,
      categories: form.categories.value,
      imageUrl: form.imageUrl.value || null,
      bannerUrl: form.bannerUrl.value || null,
      privacyMode: form.privacyMode.value,
      consensusThreshold: form.consensusThreshold.value,
    }
  }

  /**
   * Submit the form
   */
  async function submitForm(): Promise<boolean> {
    // Prevent double submission
    if (submitState.isSubmitting) {
      return false
    }

    submitState.attemptCount++
    submitState.error = null

    // Validate all fields
    if (!validateAll()) {
      // Find first error and focus
      const fieldNames = Object.keys(form) as (keyof CampaignFormState)[]
      for (const fieldName of fieldNames) {
        if (form[fieldName].error) {
          // Scroll to first error field
          const element = document.querySelector(`[name="${fieldName}"]`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          break
        }
      }
      return false
    }

    submitState.isSubmitting = true

    try {
      const formData = getFormData()

      // Mock API call - replace with real submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful submission
      console.log('Form submitted:', formData)

      submitState.isSuccess = true
      return true
    } catch (error) {
      submitState.error =
        error instanceof Error ? error.message : 'An error occurred while submitting'
      return false
    } finally {
      submitState.isSubmitting = false
    }
  }

  // Computed properties
  const isFormValid = computed(() => {
    const fieldNames = Object.keys(form) as (keyof CampaignFormState)[]
    return fieldNames.every((fieldName) => !validateField(fieldName))
  })

  const hasErrors = computed(() => {
    const fieldNames = Object.keys(form) as (keyof CampaignFormState)[]
    return fieldNames.some((fieldName) => form[fieldName].error)
  })

  const isDirty = computed(() => {
    const fieldNames = Object.keys(form) as (keyof CampaignFormState)[]
    return fieldNames.some((fieldName) => form[fieldName].dirty)
  })

  const formProgress = computed(() => {
    const requiredFields: (keyof CampaignFormState)[] = [
      'name',
      'purpose',
      'rulesAndResolution',
      'prompt',
      'fundraisingGoal',
      'endDate',
    ]
    const completed = requiredFields.filter((fieldName) => {
      const value = form[fieldName].value
      if (typeof value === 'string') return value.trim().length > 0
      if (typeof value === 'number') return value > 0
      return false
    })
    return Math.round((completed.length / requiredFields.length) * 100)
  })

  return {
    // Form state
    form,
    submitState,

    // Slug state
    slugChecking,
    slugAvailable,
    autoGenerateSlug,

    // Methods
    validateField,
    validateAll,
    touchField,
    dirtyField,
    resetForm,
    getFormData,
    submitForm,
    checkSlugAvailability,
    generateSlug,

    // Computed
    isFormValid,
    hasErrors,
    isDirty,
    formProgress,
  }
}
