import { computed, ref } from 'vue'
import { SiweMessage } from 'siwe'
import { getAddress, type Address, type WalletClient } from 'viem'
import type { ApiResponse } from '~/types'

type SiweSessionResponse = {
  authenticated: boolean
  address: string | null
}

type SiweNonceResponse = {
  nonce: string
}

type SiweVerifyResponse = {
  address: string
  token: string
}

export function useSiwe() {
  const sessionAddress = ref<string | null>(null)
  const isAuthenticating = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!sessionAddress.value)

  async function checkSession(): Promise<boolean> {
    try {
      const response = await $fetch<ApiResponse<SiweSessionResponse>>('/api/auth/siwe/session')
      if (response.success && response.data?.authenticated && response.data.address) {
        sessionAddress.value = response.data.address
        return true
      }
    } catch (err) {
      if (import.meta.dev) console.error('SIWE session check failed:', err)
    }

    sessionAddress.value = null
    return false
  }

  async function signIn(options: {
    address: Address
    chainId: number
    walletClient: WalletClient
    statement?: string
  }): Promise<boolean> {
    if (isAuthenticating.value) return false
    isAuthenticating.value = true
    error.value = null

    try {
      const nonceResponse = await $fetch<ApiResponse<SiweNonceResponse>>('/api/auth/siwe/nonce')
      if (!nonceResponse.success || !nonceResponse.data?.nonce) {
        throw new Error('Failed to fetch SIWE nonce')
      }

      const message = new SiweMessage({
        domain: window.location.host,
        address: getAddress(options.address),
        statement: options.statement || 'Sign in to Pledgebook.',
        uri: window.location.origin,
        version: '1',
        chainId: options.chainId,
        nonce: nonceResponse.data.nonce,
        issuedAt: new Date().toISOString(),
      })

      const preparedMessage = message.prepareMessage()
      const checksummedAddress = getAddress(options.address)
      const signature = await options.walletClient.signMessage({
        account: checksummedAddress,
        message: preparedMessage,
      })

      const verifyResponse = await $fetch<ApiResponse<SiweVerifyResponse>>(
        '/api/auth/siwe/verify',
        {
          method: 'POST',
          body: {
            message: preparedMessage,
            signature,
          },
        },
      )

      if (!verifyResponse.success || !verifyResponse.data?.address) {
        throw new Error('SIWE verification failed')
      }

      sessionAddress.value = verifyResponse.data.address
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SIWE sign-in failed'
      error.value = message
      if (import.meta.dev) console.error('SIWE sign-in failed:', err)
      return false
    } finally {
      isAuthenticating.value = false
    }
  }

  async function signOut(): Promise<void> {
    try {
      await $fetch('/api/auth/siwe/logout', { method: 'POST' })
    } catch (err) {
      if (import.meta.dev) console.error('SIWE sign-out failed:', err)
    } finally {
      sessionAddress.value = null
    }
  }

  return {
    sessionAddress,
    isAuthenticated,
    isAuthenticating,
    error,
    checkSession,
    signIn,
    signOut,
  }
}
