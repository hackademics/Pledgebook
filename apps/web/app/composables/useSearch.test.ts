import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useSearch } from './useSearch'

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears results for short queries', async () => {
    const { updateQuery, results, isOpen } = useSearch()

    updateQuery('b')
    await nextTick()

    expect(results.value).toEqual([])
    expect(isOpen.value).toBe(false)
  })

  it('debounces and returns filtered mock results', async () => {
    const { updateQuery, results, isOpen } = useSearch()

    updateQuery('bitcoin')
    await vi.runAllTimersAsync()
    await nextTick()

    expect(isOpen.value).toBe(true)
    expect(results.value.some((result) => result.title.toLowerCase().includes('bitcoin'))).toBe(
      true,
    )
  })

  it('manages recent searches with max length and uniqueness', () => {
    const { addToRecentSearches, recentSearches } = useSearch()

    addToRecentSearches('alpha')
    addToRecentSearches('beta')
    addToRecentSearches('alpha')
    addToRecentSearches('gamma')
    addToRecentSearches('delta')
    addToRecentSearches('epsilon')
    addToRecentSearches('zeta')

    expect(recentSearches.value[0]).toBe('zeta')
    expect(recentSearches.value).toContain('alpha')
    expect(recentSearches.value.length).toBe(5)
  })
})
