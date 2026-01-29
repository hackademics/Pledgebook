import type { ApiResponse, PaginationParams } from '../types'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API fetch composable with built-in error handling and typing
 */
export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  /**
   * Generic fetch wrapper
   */
  async function fetchApi<T>(
    endpoint: string,
    options: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const fetchOptions: NitroFetchOptions<NitroFetchRequest> = {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }
      if (options.body) {
        fetchOptions.body = options.body
      }
      const response = await $fetch<ApiResponse<T>>(`${baseURL}${endpoint}`, fetchOptions)
      return response
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'An error occurred',
        },
      }
    }
  }

  /**
   * GET request
   */
  function get<T>(endpoint: string, params?: PaginationParams) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return fetchApi<T>(`${endpoint}${query}`, { method: 'GET' })
  }

  /**
   * POST request
   */
  function post<T>(endpoint: string, body: unknown) {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: body,
    })
  }

  /**
   * PUT request
   */
  function put<T>(endpoint: string, body: unknown) {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      body: body,
    })
  }

  /**
   * PATCH request
   */
  function patch<T>(endpoint: string, body: unknown) {
    return fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: body,
    })
  }

  /**
   * DELETE request
   */
  function del<T>(endpoint: string) {
    return fetchApi<T>(endpoint, { method: 'DELETE' })
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    fetchApi,
  }
}
