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
   * These match the featured categories from 0011_seed_categories.sql
   */
  const defaultCategories: Category[] = [
    {
      id: 'personal-fitness',
      name: 'Personal Fitness',
      slug: 'personal-fitness',
      icon: 'heroicons:heart',
    },
    {
      id: 'sustainable-living',
      name: 'Sustainable Living',
      slug: 'sustainable-living',
      icon: 'heroicons:globe-alt',
    },
    {
      id: 'startup-launch',
      name: 'Startup Launch',
      slug: 'startup-launch',
      icon: 'heroicons:rocket-launch',
    },
    {
      id: 'nonprofit-fundraising',
      name: 'Nonprofit Fundraising',
      slug: 'nonprofit-fundraising',
      icon: 'heroicons:hand-raised',
    },
    {
      id: 'mental-health-support',
      name: 'Mental Health',
      slug: 'mental-health-support',
      icon: 'heroicons:sparkles',
    },
    {
      id: 'tree-planting',
      name: 'Tree Planting',
      slug: 'tree-planting',
      icon: 'heroicons:globe-alt',
    },
    {
      id: 'renewable-energy',
      name: 'Renewable Energy',
      slug: 'renewable-energy',
      icon: 'heroicons:bolt',
    },
    {
      id: 'community-projects',
      name: 'Community Projects',
      slug: 'community-projects',
      icon: 'heroicons:user-group',
    },
    {
      id: 'education-funding',
      name: 'Education Funding',
      slug: 'education-funding',
      icon: 'heroicons:academic-cap',
    },
    {
      id: 'scientific-research',
      name: 'Scientific Research',
      slug: 'scientific-research',
      icon: 'heroicons:beaker',
    },
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
