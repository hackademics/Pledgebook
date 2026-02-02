import { ref, computed } from 'vue'

// =============================================================================
// USER SETTINGS COMPOSABLE
// Purpose: Manage user profile data for the account settings page
// Handles fetching, updating, and validation of user settings
// =============================================================================

/**
 * Generic API response type (mirrors ~/types)
 */
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

/**
 * User response type from API (matches server/domains/users/user.schema.ts)
 */
export interface UserResponse {
  address: string
  role: 'user' | 'admin' | 'verifier'
  preferences: UserPreferences
  displayName: string | null
  ensName: string | null
  avatarUrl: string | null
  reputationScore: number
  campaignsCreated: number
  pledgesMade: number
  totalPledged: string
  isActive: boolean
  isBanned: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  lastActiveAt: string | null
}

/**
 * User preferences structure
 */
export interface UserPreferences {
  privacyMode: boolean
  notifications: boolean
}

/**
 * Update user input (matches server schema)
 */
export interface UpdateUserInput {
  displayName?: string | null
  avatarUrl?: string | null
  preferences?: Partial<UserPreferences>
}

/**
 * Form state for settings page
 */
export interface UserSettingsForm {
  displayName: string
  avatarUrl: string
  privacyMode: boolean
  notifications: boolean
}

/**
 * Validation errors object
 */
export interface ValidationErrors {
  displayName?: string
  avatarUrl?: string
}

// =============================================================================
// COMPOSABLE
// =============================================================================

export function useUserSettings() {
  // Form state
  const form = ref<UserSettingsForm>({
    displayName: '',
    avatarUrl: '',
    privacyMode: false,
    notifications: true,
  })

  // Original values for dirty checking
  const originalValues = ref<UserSettingsForm | null>(null)

  // Loading states
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isFetched = ref(false)

  // Error states
  const fetchError = ref<string | null>(null)
  const saveError = ref<string | null>(null)
  const validationErrors = ref<ValidationErrors>({})

  // Success state
  const saveSuccess = ref(false)

  // User data
  const user = ref<UserResponse | null>(null)

  // =============================================================================
  // COMPUTED
  // =============================================================================

  /**
   * Check if form has unsaved changes
   */
  const isDirty = computed(() => {
    if (!originalValues.value) return false
    return (
      form.value.displayName !== originalValues.value.displayName ||
      form.value.avatarUrl !== originalValues.value.avatarUrl ||
      form.value.privacyMode !== originalValues.value.privacyMode ||
      form.value.notifications !== originalValues.value.notifications
    )
  })

  /**
   * Check if form is valid
   */
  const isValid = computed(() => {
    return Object.keys(validationErrors.value).length === 0
  })

  /**
   * Check if save button should be disabled
   */
  const canSave = computed(() => {
    return isDirty.value && isValid.value && !isSaving.value
  })

  // =============================================================================
  // VALIDATION
  // =============================================================================

  /**
   * Validate display name
   */
  function validateDisplayName(value: string): string | undefined {
    if (value && value.length < 2) {
      return 'Display name must be at least 2 characters'
    }
    if (value && value.length > 50) {
      return 'Display name cannot exceed 50 characters'
    }
    return undefined
  }

  /**
   * Validate avatar URL
   */
  function validateAvatarUrl(value: string): string | undefined {
    if (!value) return undefined
    try {
      const url = new URL(value)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Avatar URL must use HTTP or HTTPS'
      }
      if (value.length > 500) {
        return 'Avatar URL cannot exceed 500 characters'
      }
    } catch {
      return 'Invalid URL format'
    }
    return undefined
  }

  /**
   * Validate entire form
   */
  function validateForm(): boolean {
    const errors: ValidationErrors = {}

    const displayNameError = validateDisplayName(form.value.displayName)
    if (displayNameError) errors.displayName = displayNameError

    const avatarUrlError = validateAvatarUrl(form.value.avatarUrl)
    if (avatarUrlError) errors.avatarUrl = avatarUrlError

    validationErrors.value = errors
    return Object.keys(errors).length === 0
  }

  /**
   * Validate single field
   */
  function validateField(field: keyof ValidationErrors) {
    const errors = { ...validationErrors.value }

    if (field === 'displayName') {
      const error = validateDisplayName(form.value.displayName)
      if (error) errors.displayName = error
      else delete errors.displayName
    }

    if (field === 'avatarUrl') {
      const error = validateAvatarUrl(form.value.avatarUrl)
      if (error) errors.avatarUrl = error
      else delete errors.avatarUrl
    }

    validationErrors.value = errors
  }

  // =============================================================================
  // API METHODS
  // =============================================================================

  /**
   * Fetch user data by wallet address
   */
  async function fetchUser(address: string): Promise<void> {
    if (!address) {
      fetchError.value = 'Wallet address is required'
      return
    }

    isLoading.value = true
    fetchError.value = null
    isFetched.value = false

    try {
      // First try to get from the list endpoint with search
      const response = await $fetch<ApiResponse<UserResponse[]>>(
        `/api/users?search=${encodeURIComponent(address.toLowerCase())}&limit=1`,
      )

      if (response.success && response.data && response.data.length > 0) {
        const userData = response.data[0] as UserResponse
        user.value = userData

        // Populate form with user data
        form.value = {
          displayName: userData.displayName || '',
          avatarUrl: userData.avatarUrl || '',
          privacyMode: userData.preferences?.privacyMode ?? false,
          notifications: userData.preferences?.notifications ?? true,
        }

        // Store original values for dirty checking
        originalValues.value = { ...form.value }
        isFetched.value = true
      } else {
        // User doesn't exist yet - set defaults
        user.value = null
        form.value = {
          displayName: '',
          avatarUrl: '',
          privacyMode: false,
          notifications: true,
        }
        originalValues.value = { ...form.value }
        isFetched.value = true
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
      fetchError.value = error instanceof Error ? error.message : 'Failed to load settings'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save user settings
   */
  async function saveSettings(address: string): Promise<boolean> {
    if (!address) {
      saveError.value = 'Wallet address is required'
      return false
    }

    if (!validateForm()) {
      return false
    }

    isSaving.value = true
    saveError.value = null
    saveSuccess.value = false

    try {
      const updateData: UpdateUserInput = {
        displayName: form.value.displayName || null,
        avatarUrl: form.value.avatarUrl || null,
        preferences: {
          privacyMode: form.value.privacyMode,
          notifications: form.value.notifications,
        },
      }

      const response = await $fetch<ApiResponse<UserResponse>>(
        `/api/users/${encodeURIComponent(address.toLowerCase())}`,
        {
          method: 'PATCH',
          body: updateData,
          headers: {
            'X-Wallet-Address': address.toLowerCase(),
          },
        },
      )

      if (response.success && response.data) {
        user.value = response.data

        // Update original values to reflect saved state
        originalValues.value = { ...form.value }
        saveSuccess.value = true

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          saveSuccess.value = false
        }, 3000)

        return true
      } else {
        saveError.value = response.error?.message || 'Failed to save settings'
        return false
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      saveError.value = error instanceof Error ? error.message : 'Failed to save settings'
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Reset form to original values
   */
  function resetForm(): void {
    if (originalValues.value) {
      form.value = { ...originalValues.value }
      validationErrors.value = {}
      saveError.value = null
      saveSuccess.value = false
    }
  }

  /**
   * Clear all state
   */
  function clearState(): void {
    user.value = null
    form.value = {
      displayName: '',
      avatarUrl: '',
      privacyMode: false,
      notifications: true,
    }
    originalValues.value = null
    validationErrors.value = {}
    fetchError.value = null
    saveError.value = null
    saveSuccess.value = false
    isFetched.value = false
  }

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // State
    form,
    user,
    isLoading,
    isSaving,
    isFetched,
    fetchError,
    saveError,
    saveSuccess,
    validationErrors,

    // Computed
    isDirty,
    isValid,
    canSave,

    // Methods
    fetchUser,
    saveSettings,
    resetForm,
    clearState,
    validateField,
    validateForm,
  }
}
