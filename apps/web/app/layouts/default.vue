<template>
  <div class="app-layout">
    <!-- Sticky Header -->
    <AppHeader
      :blur="headerBlur"
      :wallet-ready="isReady"
      :wallet-connected="isConnected"
      :wallet-address="address || ''"
      :wallet-trimmed-address="trimmedAddress"
      :wallet-network="network"
      :wallet-network-icon="networkIcon"
      :wallet-provider="provider"
      :wallet-provider-icon="providerIcon"
      :wallet-balance="balance"
      @connect-wallet="handleConnectWallet"
      @disconnect-wallet="handleDisconnectWallet"
    />

    <!-- Main Content Area -->
    <main class="app-main">
      <slot></slot>
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Wallet Connect Modal -->
    <WalletConnectModal
      :is-open="isWalletModalOpen"
      :is-connecting="isConnecting"
      :error="walletError"
      @close="closeWalletModal"
      @select-provider="handleSelectProvider"
      @clear-error="clearWalletError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { WalletProvider } from '~/composables/useWallet'

// Header blur effect on scroll
const headerBlur = ref(false)

// Wallet state
const {
  isReady,
  isConnected,
  isConnecting,
  address,
  trimmedAddress,
  network,
  networkIcon,
  provider,
  providerIcon,
  balance,
  chainId,
  error,
  connect,
  disconnect,
  getWalletClient,
} = useWallet()

const { sessionAddress, error: siweError, checkSession, signIn, signOut } = useSiwe()

// Wallet modal state
const isWalletModalOpen = ref(false)
const walletError = ref<string | null>(null)

// Watch for errors from the wallet composable
watch(error, (newError) => {
  if (newError) {
    walletError.value = newError
  }
})

watch([address, sessionAddress], ([walletAddress, sessionAddr]) => {
  if (!sessionAddr) return
  if (!walletAddress) {
    void signOut()
    return
  }

  if (sessionAddr.toLowerCase() !== walletAddress.toLowerCase()) {
    void signOut()
  }
})

function handleScroll() {
  headerBlur.value = window.scrollY > 20
}

// Wallet connection handler
function handleConnectWallet() {
  walletError.value = null
  isWalletModalOpen.value = true
}

function closeWalletModal() {
  if (!isConnecting.value) {
    isWalletModalOpen.value = false
    walletError.value = null
  }
}

function clearWalletError() {
  walletError.value = null
}

async function handleSelectProvider(providerId: string) {
  walletError.value = null
  const success = await connect(providerId as WalletProvider)
  if (success) {
    let signedIn = true
    if (address.value && chainId.value) {
      const walletClient = getWalletClient()
      if (walletClient) {
        signedIn = await signIn({
          address: address.value,
          chainId: chainId.value,
          walletClient,
        })
        if (!signedIn) {
          walletError.value = siweError.value || 'SIWE sign-in failed'
        }
      }
    }
    if (signedIn) {
      closeWalletModal()
    }
  } else {
    // Error is set by the wallet composable
    walletError.value = error.value
  }
}

async function handleDisconnectWallet() {
  disconnect()
  await signOut()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('open-wallet-modal', handleConnectWallet)
  handleScroll() // Initial check
})

onMounted(async () => {
  await checkSession()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('open-wallet-modal', handleConnectWallet)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
