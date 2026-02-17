import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { SearchResult } from '~/types'

/**
 * Composable for search functionality
 * Handles search input, debouncing, and results
 */
export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const isOpen = ref(false)
  const recentSearches = ref<string[]>([])

  // Minimum characters to trigger search
  const MIN_SEARCH_LENGTH = 2

  /**
   * Check if search should be triggered
   */
  const shouldSearch = computed(() => query.value.trim().length >= MIN_SEARCH_LENGTH)

  /**
   * Has active results
   */
  const hasResults = computed(() => results.value.length > 0)

  /**
   * Perform search (debounced)
   */
  const performSearch = useDebounceFn(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < MIN_SEARCH_LENGTH) {
      results.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{
        success: boolean
        data: Array<{
          id: string
          name: string
          description?: string
          slug: string
          category?: string
          imageUrl?: string
        }>
      }>('/api/campaigns', {
        params: { search: searchQuery, limit: 10 },
      })

      if (response.success && response.data) {
        results.value = response.data.map((campaign) => ({
          id: campaign.id,
          title: campaign.name,
          description: campaign.description,
          type: 'campaign' as const,
          url: `/@${campaign.slug}`,
          image: campaign.imageUrl,
        }))
      } else {
        results.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Search failed')
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)

  /**
   * Update search query and trigger search
   */
  function updateQuery(value: string) {
    query.value = value
    if (shouldSearch.value) {
      performSearch(value)
    } else {
      results.value = []
    }
  }

  /**
   * Clear search
   */
  function clearSearch() {
    query.value = ''
    results.value = []
    isOpen.value = false
  }

  /**
   * Open search dropdown
   */
  function openSearch() {
    isOpen.value = true
  }

  /**
   * Close search dropdown
   */
  function closeSearch() {
    isOpen.value = false
  }

  /**
   * Add to recent searches
   */
  function addToRecentSearches(term: string) {
    if (!term.trim()) return

    const maxRecent = 5
    const filtered = recentSearches.value.filter((s) => s !== term)
    recentSearches.value = [term, ...filtered].slice(0, maxRecent)

    // Persist to localStorage
    if (import.meta.client) {
      localStorage.setItem('pledgebook_recent_searches', JSON.stringify(recentSearches.value))
    }
  }

  /**
   * Load recent searches from localStorage
   */
  function loadRecentSearches() {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem('pledgebook_recent_searches')
        if (stored) {
          recentSearches.value = JSON.parse(stored)
        }
      } catch {
        recentSearches.value = []
      }
    }
  }

  /**
   * Clear recent searches
   */
  function clearRecentSearches() {
    recentSearches.value = []
    if (import.meta.client) {
      localStorage.removeItem('pledgebook_recent_searches')
    }
  }

  // Watch for query changes to update open state
  watch(query, (newQuery) => {
    if (newQuery.length >= MIN_SEARCH_LENGTH) {
      isOpen.value = true
    }
  })

  return {
    query,
    results,
    loading,
    error,
    isOpen,
    recentSearches,
    shouldSearch,
    hasResults,
    updateQuery,
    clearSearch,
    openSearch,
    closeSearch,
    performSearch,
    addToRecentSearches,
    loadRecentSearches,
    clearRecentSearches,
  }
}
