import { computed } from 'vue'

export function useTurnstileToken() {
  const token = useState<string | null>('turnstile-token', () => null)

  const hasToken = computed(() => Boolean(token.value))

  function setToken(value: string | null): void {
    token.value = value
  }

  function clearToken(): void {
    token.value = null
  }

  return {
    token,
    hasToken,
    setToken,
    clearToken,
  }
}
