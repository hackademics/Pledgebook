import type { ApiResponse, PaginationParams } from '../types'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface FetchApiOptions {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * API fetch composable with built-in error handling, typing, and request cancellation
 */
export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = (config.public.apiBase as string) || '/api'
  const normalizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL

  // Track active abort controllers for cleanup
  const activeControllers = new Set<AbortController>()

  /**
   * Create an abort controller for request cancellation
   */
  function createAbortController(): AbortController {
    const controller = new AbortController()
    activeControllers.add(controller)
    return controller
  }

  /**
   * Cancel all active requests
   */
  function cancelAllRequests(): void {
    activeControllers.forEach((controller) => {
      controller.abort()
    })
    activeControllers.clear()
  }

  /**
   * Generic fetch wrapper
   */
  async function fetchApi<T>(
    endpoint: string,
    options: FetchApiOptions = {},
  ): Promise<ApiResponse<T>> {
    const controller = options.signal ? null : createAbortController()
    const signal = options.signal || controller?.signal

    try {
      const fetchOptions: NitroFetchOptions<NitroFetchRequest> = {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal,
      }
      if (options.body) {
        fetchOptions.body = options.body
      }
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
      const response = await $fetch<ApiResponse<T>>(
        `${normalizedBase}${normalizedEndpoint}`,
        fetchOptions,
      )
      return response
    } catch (error) {
      // Don't report aborted requests as errors
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'REQUEST_CANCELLED',
            message: 'Request was cancelled',
          },
        }
      }
      // Use structured error response instead of console.error
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'An error occurred',
        },
      }
    } finally {
      if (controller) {
        activeControllers.delete(controller)
      }
    }
  }

  /**
   * GET request
   */
  function get<T>(endpoint: string, params?: PaginationParams, signal?: AbortSignal) {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
    return fetchApi<T>(`${endpoint}${query}`, { method: 'GET', signal })
  }

  /**
   * POST request
   */
  function post<T>(endpoint: string, body: unknown, signal?: AbortSignal) {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: body,
      signal,
    })
  }

  /**
   * PUT request
   */
  function put<T>(endpoint: string, body: unknown, signal?: AbortSignal) {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      body: body,
      signal,
    })
  }

  /**
   * PATCH request
   */
  function patch<T>(endpoint: string, body: unknown, signal?: AbortSignal) {
    return fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: body,
      signal,
    })
  }

  /**
   * DELETE request
   */
  function del<T>(endpoint: string, signal?: AbortSignal) {
    return fetchApi<T>(endpoint, { method: 'DELETE', signal })
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    fetchApi,
    createAbortController,
    cancelAllRequests,
  }
}
