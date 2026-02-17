import { describe, it, expect } from 'vitest'
import { useTurnstileToken } from './useTurnstileToken'

describe('useTurnstileToken', () => {
  it('initializes with null token', () => {
    const { token, hasToken } = useTurnstileToken()
    expect(token.value).toBeNull()
    expect(hasToken.value).toBe(false)
  })

  it('setToken updates token and hasToken', () => {
    const { token, hasToken, setToken } = useTurnstileToken()

    setToken('test-token-123')

    expect(token.value).toBe('test-token-123')
    expect(hasToken.value).toBe(true)
  })

  it('clearToken resets to null', () => {
    const { token, hasToken, setToken, clearToken } = useTurnstileToken()

    setToken('test-token-123')
    expect(hasToken.value).toBe(true)

    clearToken()

    expect(token.value).toBeNull()
    expect(hasToken.value).toBe(false)
  })

  it('setToken with null clears the token', () => {
    const { token, hasToken, setToken } = useTurnstileToken()

    setToken('test-token')
    setToken(null)

    expect(token.value).toBeNull()
    expect(hasToken.value).toBe(false)
  })
})
