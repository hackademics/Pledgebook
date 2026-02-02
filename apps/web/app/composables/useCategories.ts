import { ref, computed } from 'vue'
import type { Category } from '~/types'

/**
 * Composable for managing campaign categories
 * Used in header navigation for category tabs
 */
export function useCategories() {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const activeCategory = ref<string | null>(null)

  /**
   * Default categories for initial render and fallback
   */
  const defaultCategories: Category[] = [
    { id: 'politics', name: 'Politics', slug: 'politics', icon: 'heroicons:building-library' },
    { id: 'sports', name: 'Sports', slug: 'sports', icon: 'heroicons:trophy' },
    { id: 'crypto', name: 'Crypto', slug: 'crypto', icon: 'heroicons:currency-dollar' },
    { id: 'finance', name: 'Finance', slug: 'finance', icon: 'heroicons:chart-bar' },
    { id: 'geopolitics', name: 'Geopolitics', slug: 'geopolitics', icon: 'heroicons:globe-alt' },
    { id: 'earnings', name: 'Earnings', slug: 'earnings', icon: 'heroicons:banknotes' },
    { id: 'tech', name: 'Tech', slug: 'tech', icon: 'heroicons:cpu-chip' },
    { id: 'culture', name: 'Culture', slug: 'culture', icon: 'heroicons:sparkles' },
    { id: 'world', name: 'World', slug: 'world', icon: 'heroicons:globe-americas' },
    { id: 'economy', name: 'Economy', slug: 'economy', icon: 'heroicons:presentation-chart-line' },
    { id: 'climate', name: 'Climate & Science', slug: 'climate-science', icon: 'heroicons:beaker' },
    { id: 'elections', name: 'Elections', slug: 'elections', icon: 'heroicons:hand-raised' },
  ]

  /**
   * Fetch categories from API
   */
  async function fetchCategories() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: Category[] }>(
        '/api/categories/active',
      )

      if (response.success && response.data) {
        categories.value = response.data.map((cat) => {
          const category: Category = {
            id: cat.id,
            name: cat.name,
            slug: cat.slug || cat.id,
          }
          if (cat.icon) category.icon = cat.icon
          if (cat.color) category.color = cat.color
          if (cat.count !== undefined) category.count = cat.count
          if (cat.isActive !== undefined) category.isActive = cat.isActive
          return category
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to fetch categories')
      // Fall back to default categories on error
      categories.value = defaultCategories
    } finally {
      loading.value = false
    }
  }

  /**
   * Get the display categories (fetched or defaults)
   */
  const displayCategories = computed(() => {
    return categories.value.length > 0 ? categories.value : defaultCategories
  })

  /**
   * Set active category
   */
  function setActiveCategory(categoryId: string | null) {
    activeCategory.value = categoryId
  }

  /**
   * Check if a category is active
   */
  function isCategoryActive(categoryId: string): boolean {
    return activeCategory.value === categoryId
  }

  return {
    categories,
    displayCategories,
    loading,
    error,
    activeCategory,
    defaultCategories,
    fetchCategories,
    setActiveCategory,
    isCategoryActive,
  }
}
