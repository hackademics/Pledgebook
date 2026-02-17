import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUserSettings } from './useUserSettings'

describe('useUserSettings', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('exports expected properties', () => {
    const settings = useUserSettings()
    expect(settings).toHaveProperty('form')
    expect(settings).toHaveProperty('user')
    expect(settings).toHaveProperty('isLoading')
    expect(settings).toHaveProperty('isSaving')
    expect(settings).toHaveProperty('isDirty')
    expect(settings).toHaveProperty('isValid')
    expect(settings).toHaveProperty('canSave')
    expect(settings).toHaveProperty('fetchUser')
    expect(settings).toHaveProperty('saveSettings')
    expect(settings).toHaveProperty('resetForm')
    expect(settings).toHaveProperty('clearState')
    expect(settings).toHaveProperty('validateField')
    expect(settings).toHaveProperty('validateForm')
  })

  it('initializes with default form values', () => {
    const { form, isLoading, isSaving, isDirty } = useUserSettings()
    expect(form.value.displayName).toBe('')
    expect(form.value.avatarUrl).toBe('')
    expect(form.value.privacyMode).toBe(false)
    expect(form.value.notifications).toBe(true)
    expect(isLoading.value).toBe(false)
    expect(isSaving.value).toBe(false)
    expect(isDirty.value).toBe(false)
  })

  it('fetchUser populates form on success', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        {
          address: '0x1234',
          displayName: 'TestUser',
          avatarUrl: 'https://avatar.example.com/test.png',
          preferences: { privacyMode: true, notifications: false },
          role: 'user',
          reputationScore: 100,
          campaignsCreated: 5,
          pledgesMade: 10,
          totalPledged: '1000000',
          isActive: true,
          isBanned: false,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-02',
        },
      ],
    })

    const { fetchUser, form, isFetched } = useUserSettings()
    await fetchUser('0x1234')

    expect(isFetched.value).toBe(true)
    expect(form.value.displayName).toBe('TestUser')
    expect(form.value.avatarUrl).toBe('https://avatar.example.com/test.png')
    expect(form.value.privacyMode).toBe(true)
    expect(form.value.notifications).toBe(false)
  })

  it('fetchUser handles missing user gracefully', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [],
    })

    const { fetchUser, isFetched, user } = useUserSettings()
    await fetchUser('0xunknown')

    expect(isFetched.value).toBe(true)
    expect(user.value).toBeNull()
  })

  it('fetchUser sets error on network failure', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { fetchUser, fetchError } = useUserSettings()
    await fetchUser('0x1234')

    expect(fetchError.value).toBe('Network error')
  })

  it('isDirty tracks form changes', () => {
    const { isDirty } = useUserSettings()

    // Not dirty initially since originalValues is null
    expect(isDirty.value).toBe(false)
  })

  it('validateForm catches invalid display name', () => {
    const { form, validateForm, validationErrors } = useUserSettings()
    form.value.displayName = 'A' // Too short

    const valid = validateForm()

    expect(valid).toBe(false)
    expect(validationErrors.value.displayName).toBeDefined()
  })

  it('validateForm catches invalid avatar URL', () => {
    const { form, validateForm, validationErrors } = useUserSettings()
    form.value.avatarUrl = 'not-a-url'

    const valid = validateForm()

    expect(valid).toBe(false)
    expect(validationErrors.value.avatarUrl).toBeDefined()
  })

  it('validateForm passes with valid data', () => {
    const { form, validateForm, validationErrors } = useUserSettings()
    form.value.displayName = 'ValidUser'
    form.value.avatarUrl = 'https://example.com/avatar.png'

    const valid = validateForm()

    expect(valid).toBe(true)
    expect(Object.keys(validationErrors.value)).toHaveLength(0)
  })

  it('resetForm restores original values', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        {
          address: '0x1234',
          displayName: 'Original',
          avatarUrl: '',
          preferences: { privacyMode: false, notifications: true },
          role: 'user',
          reputationScore: 0,
          campaignsCreated: 0,
          pledgesMade: 0,
          totalPledged: '0',
          isActive: true,
          isBanned: false,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ],
    })

    const { fetchUser, form, resetForm } = useUserSettings()
    await fetchUser('0x1234')

    form.value.displayName = 'Changed'
    resetForm()

    expect(form.value.displayName).toBe('Original')
  })

  it('clearState resets everything', () => {
    const { form, user, clearState, fetchError, saveError } = useUserSettings()
    form.value.displayName = 'Test'
    clearState()

    expect(form.value.displayName).toBe('')
    expect(user.value).toBeNull()
    expect(fetchError.value).toBeNull()
    expect(saveError.value).toBeNull()
  })
})
