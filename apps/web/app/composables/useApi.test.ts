import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApi } from './useApi'

describe('useApi', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('exports CRUD methods', () => {
    const api = useApi()
    expect(api).toHaveProperty('get')
    expect(api).toHaveProperty('post')
    expect(api).toHaveProperty('put')
    expect(api).toHaveProperty('patch')
    expect(api).toHaveProperty('delete')
    expect(api).toHaveProperty('cancelAllRequests')
  })

  it('get calls $fetch with correct URL', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: '1' },
    })

    const api = useApi()
    const result = await api.get('/campaigns/123')

    expect(globalThis.$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/campaigns/123'),
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result.success).toBe(true)
  })

  it('post sends body and method POST', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 'new' },
    })

    const api = useApi()
    const body = { name: 'Test Campaign' }
    await api.post('/campaigns', body)

    expect(globalThis.$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/campaigns'),
      expect.objectContaining({
        method: 'POST',
        body,
      }),
    )
  })

  it('handles error responses gracefully', async () => {
    ;(globalThis.$fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const api = useApi()

    await expect(api.get('/nonexistent')).rejects.toThrow()
  })

  it('cancelAllRequests does not throw', () => {
    const api = useApi()
    expect(() => api.cancelAllRequests()).not.toThrow()
  })
})
