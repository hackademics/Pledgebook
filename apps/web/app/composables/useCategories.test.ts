import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCategories } from './useCategories'

describe('useCategories', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('falls back to default categories on error', async () => {
    globalThis.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { fetchCategories, categories, defaultCategories, error, loading } = useCategories()

    await fetchCategories()

    expect(loading.value).toBe(false)
    expect(error.value).toBeInstanceOf(Error)
    expect(categories.value).toEqual(defaultCategories)
  })

  it('maps API category fields into display categories', async () => {
    globalThis.$fetch = vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'tech',
          name: 'Tech',
          slug: 'tech',
          icon: 'heroicons:cpu-chip',
          color: '#111111',
          count: 12,
          isActive: true,
        },
      ],
    })

    const { fetchCategories, categories } = useCategories()

    await fetchCategories()

    expect(categories.value).toHaveLength(1)
    expect(categories.value[0]).toMatchObject({
      id: 'tech',
      name: 'Tech',
      slug: 'tech',
      icon: 'heroicons:cpu-chip',
      color: '#111111',
      count: 12,
      isActive: true,
    })
  })
})
