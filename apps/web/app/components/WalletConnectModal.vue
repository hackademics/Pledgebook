<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="wallet-modal-overlay"
          @click.self="handleClose"
        >
          <Transition name="scale">
            <div
              v-if="isOpen"
              class="wallet-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wallet-modal-title"
            >
              <!-- Modal Header -->
              <div class="wallet-modal-header">
                <h2
                  id="wallet-modal-title"
                  class="wallet-modal-title"
                >
                  {{ isConnecting ? 'Connecting...' : 'Connect your wallet' }}
                </h2>
                <button
                  v-if="!isConnecting"
                  type="button"
                  class="wallet-modal-close"
                  aria-label="Close modal"
                  @click="handleClose"
                >
                  <Icon
                    name="heroicons:x-mark"
                    class="wallet-modal-close-icon"
                  />
                </button>
              </div>

              <!-- Connecting State -->
              <div
                v-if="isConnecting"
                class="wallet-connecting"
              >
                <div class="wallet-connecting-spinner">
                  <Icon
                    name="heroicons:arrow-path"
                    class="wallet-spinner-icon"
                  />
                </div>
                <p class="wallet-connecting-text">
                  Please confirm in your {{ connectingProvider }} wallet...
                </p>
                <button
                  type="button"
                  class="wallet-cancel-btn"
                  @click="handleClose"
                >
                  Cancel
                </button>
              </div>

              <!-- Error State -->
              <div
                v-else-if="error"
                class="wallet-error"
              >
                <div class="wallet-error-icon-wrapper">
                  <Icon
                    name="heroicons:exclamation-triangle"
                    class="wallet-error-icon"
                  />
                </div>
                <p class="wallet-error-text">
                  {{ error }}
                </p>
                <button
                  type="button"
                  class="wallet-retry-btn"
                  @click="clearError"
                >
                  Try Again
                </button>
              </div>

              <!-- Normal State -->
              <template v-else>
                <!-- Terms Checkbox -->
                <div class="wallet-modal-terms">
                  <label class="wallet-terms-label">
                    <input
                      v-model="termsAccepted"
                      type="checkbox"
                      class="wallet-terms-checkbox"
                    />
                    <span class="wallet-terms-checkmark">
                      <Icon
                        v-if="termsAccepted"
                        name="heroicons:check"
                        class="wallet-terms-check-icon"
                      />
                    </span>
                    <span class="wallet-terms-text">
                      I accept the Pledgebook
                      <NuxtLink
                        to="/terms"
                        class="wallet-terms-link"
                        @click.stop
                      >
                        Terms of Service
                      </NuxtLink>
                    </span>
                  </label>
                </div>

                <!-- Network Info -->
                <div class="wallet-network-info">
                  <Icon
                    name="heroicons:information-circle"
                    class="wallet-network-info-icon"
                  />
                  <span class="wallet-network-info-text">
                    You will be connected to <strong>Polygon Amoy Testnet</strong>
                  </span>
                </div>

                <!-- Wallet Providers -->
                <div class="wallet-providers">
                  <button
                    v-for="provider in walletProviders"
                    :key="provider.id"
                    type="button"
                    class="wallet-provider-btn"
                    :class="{ disabled: !termsAccepted }"
                    :disabled="!termsAccepted"
                    :aria-disabled="!termsAccepted"
                    @click="selectProvider(provider.id)"
                  >
                    <div class="wallet-provider-icon">
                      <img
                        :src="provider.icon"
                        :alt="provider.name"
                        class="wallet-provider-img"
                      />
                    </div>
                    <span class="wallet-provider-name">{{ provider.name }}</span>
                  </button>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  isConnecting?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isConnecting: false,
  error: null,
})

const emit = defineEmits<{
  close: []
  'select-provider': [providerId: string]
  'clear-error': []
}>()

const termsAccepted = ref(false)
const connectingProvider = ref<string>('')

// Reset terms checkbox when modal closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      termsAccepted.value = false
      connectingProvider.value = ''
    }
  },
)

interface WalletProvider {
  id: string
  name: string
  icon: string
}

const walletProviders: WalletProvider[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/images/wallets/metamask.svg',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/images/wallets/coinbase.svg',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/images/wallets/walletconnect.svg',
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: '/images/wallets/rabby.svg',
  },
]

function selectProvider(providerId: string) {
  if (termsAccepted.value) {
    const provider = walletProviders.find((p) => p.id === providerId)
    connectingProvider.value = provider?.name || providerId
    emit('select-provider', providerId)
  }
}

function handleClose() {
  if (!props.isConnecting) {
    emit('close')
  }
}

function clearError() {
  emit('clear-error')
}
</script>

<style scoped>
/* Modal Overlay */
.wallet-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Modal Container */
.wallet-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  background-color: var(--color-white, #ffffff);
  border-radius: 1rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

:root.dark .wallet-modal {
  background-color: var(--color-gray-900, #111827);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Modal Header */
.wallet-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
}

.wallet-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
  margin: 0;
}

:root.dark .wallet-modal-title {
  color: var(--color-gray-100, #f3f4f6);
}

.wallet-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--color-gray-500, #6b7280);
  transition: all 0.15s ease;
}

.wallet-modal-close:hover {
  background-color: var(--color-gray-100, #f3f4f6);
  color: var(--color-gray-700, #374151);
}

:root.dark .wallet-modal-close:hover {
  background-color: var(--color-gray-800, #1f2937);
  color: var(--color-gray-300, #d1d5db);
}

.wallet-modal-close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Terms Section */
.wallet-modal-terms {
  padding: 0 1.5rem 1.5rem;
}

.wallet-terms-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.wallet-terms-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.wallet-terms-checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border: 2px solid var(--color-gray-300, #d1d5db);
  border-radius: 0.25rem;
  background-color: var(--color-white, #ffffff);
  transition: all 0.15s ease;
}

:root.dark .wallet-terms-checkmark {
  border-color: var(--color-gray-600, #4b5563);
  background-color: var(--color-gray-800, #1f2937);
}

.wallet-terms-checkbox:checked + .wallet-terms-checkmark {
  background-color: var(--color-primary-500, #3b82f6);
  border-color: var(--color-primary-500, #3b82f6);
}

.wallet-terms-check-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: white;
}

.wallet-terms-text {
  font-size: 0.875rem;
  color: var(--color-gray-700, #374151);
}

:root.dark .wallet-terms-text {
  color: var(--color-gray-300, #d1d5db);
}

.wallet-terms-link {
  color: var(--color-primary-500, #3b82f6);
  text-decoration: none;
  font-weight: 500;
}

.wallet-terms-link:hover {
  text-decoration: underline;
}

/* Network Info */
.wallet-network-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1.5rem 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-primary-50, #eff6ff);
  border-radius: 0.5rem;
  border: 1px solid var(--color-primary-200, #bfdbfe);
}

:root.dark .wallet-network-info {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.wallet-network-info-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary-500, #3b82f6);
  flex-shrink: 0;
}

.wallet-network-info-text {
  font-size: 0.75rem;
  color: var(--color-primary-700, #1d4ed8);
}

:root.dark .wallet-network-info-text {
  color: var(--color-primary-300, #93c5fd);
}

.wallet-network-info-text strong {
  font-weight: 600;
}

/* Connecting State */
.wallet-connecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 2.5rem;
  text-align: center;
}

.wallet-connecting-spinner {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.wallet-spinner-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-primary-500, #3b82f6);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.wallet-connecting-text {
  font-size: 0.875rem;
  color: var(--color-gray-600, #4b5563);
  margin: 0 0 1.5rem;
}

:root.dark .wallet-connecting-text {
  color: var(--color-gray-400, #9ca3af);
}

.wallet-cancel-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700, #374151);
  background-color: var(--color-gray-100, #f3f4f6);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.wallet-cancel-btn:hover {
  background-color: var(--color-gray-200, #e5e7eb);
}

:root.dark .wallet-cancel-btn {
  color: var(--color-gray-300, #d1d5db);
  background-color: var(--color-gray-800, #1f2937);
}

:root.dark .wallet-cancel-btn:hover {
  background-color: var(--color-gray-700, #374151);
}

/* Error State */
.wallet-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 2.5rem;
  text-align: center;
}

.wallet-error-icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-red-100, #fee2e2);
  border-radius: 50%;
  margin-bottom: 1rem;
}

:root.dark .wallet-error-icon-wrapper {
  background-color: rgba(239, 68, 68, 0.2);
}

.wallet-error-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-red-500, #ef4444);
}

.wallet-error-text {
  font-size: 0.875rem;
  color: var(--color-gray-600, #4b5563);
  margin: 0 0 1.5rem;
  max-width: 280px;
}

:root.dark .wallet-error-text {
  color: var(--color-gray-400, #9ca3af);
}

.wallet-retry-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background-color: var(--color-primary-500, #3b82f6);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.wallet-retry-btn:hover {
  background-color: var(--color-primary-600, #2563eb);
}

/* Wallet Providers Grid */
.wallet-providers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.wallet-provider-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: none;
  background-color: transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wallet-provider-btn:not(.disabled):hover {
  background-color: var(--color-gray-100, #f3f4f6);
}

:root.dark .wallet-provider-btn:not(.disabled):hover {
  background-color: var(--color-gray-800, #1f2937);
}

.wallet-provider-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.wallet-provider-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.wallet-provider-btn:not(.disabled):hover .wallet-provider-icon {
  transform: scale(1.1);
}

.wallet-provider-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.wallet-provider-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary-500, #3b82f6);
  text-align: center;
  line-height: 1.2;
}

.wallet-provider-btn.disabled .wallet-provider-name {
  color: var(--color-gray-400, #9ca3af);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .wallet-providers {
    grid-template-columns: repeat(2, 1fr);
  }

  .wallet-provider-btn {
    padding: 1.25rem 0.75rem;
  }
}
</style>
