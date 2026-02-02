<template>
  <div class="wallet-connected">
    <button
      type="button"
      class="wallet-connected-btn"
      :aria-expanded="isDropdownOpen"
      aria-haspopup="true"
      @click="toggleDropdown"
    >
      <img
        :src="networkIcon"
        alt="Polygon"
        class="wallet-network-icon"
      />
      <span class="wallet-address">{{ trimmedAddress }}</span>
      <Icon
        name="heroicons:chevron-down"
        class="wallet-chevron"
        :class="{ rotated: isDropdownOpen }"
      />
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isDropdownOpen"
        class="wallet-dropdown"
      >
        <!-- Network Info -->
        <div class="wallet-dropdown-section">
          <div class="wallet-dropdown-label">Connected to</div>
          <div class="wallet-network-info">
            <img
              :src="networkIcon"
              :alt="network"
              class="wallet-dropdown-network-icon"
            />
            <span class="wallet-network-name">{{ network }}</span>
            <img
              v-if="providerIcon"
              :src="providerIcon"
              :alt="provider || ''"
              class="wallet-provider-icon"
            />
          </div>
        </div>

        <!-- Address with Copy -->
        <div class="wallet-dropdown-section">
          <div class="wallet-dropdown-label">Wallet Address</div>
          <div class="wallet-address-row">
            <span class="wallet-address-display">{{ trimmedAddress }}</span>
            <button
              type="button"
              class="wallet-copy-btn"
              :class="{ copied: showCopied }"
              @click="handleCopy"
            >
              <Icon
                :name="showCopied ? 'heroicons:check' : 'heroicons:clipboard-document'"
                class="wallet-copy-icon"
              />
              <span>{{ showCopied ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>
        </div>

        <!-- USDC Balance -->
        <div class="wallet-dropdown-section">
          <div class="wallet-dropdown-label">USDC Balance</div>
          <div class="wallet-balance-row">
            <img
              src="/images/tokens/usdc.svg"
              alt="USDC"
              class="wallet-token-icon"
            />
            <span class="wallet-balance-amount">{{ balance }}</span>
            <span class="wallet-balance-symbol">USDC</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="wallet-dropdown-section wallet-dropdown-links">
          <NuxtLink
            to="/dashboard"
            class="wallet-dropdown-link"
            @click="closeDropdown"
          >
            <Icon
              name="heroicons:squares-2x2"
              class="wallet-dropdown-link-icon"
            />
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="wallet-dropdown-link"
            @click="closeDropdown"
          >
            <Icon
              name="heroicons:cog-6-tooth"
              class="wallet-dropdown-link-icon"
            />
            Account Settings
          </NuxtLink>
        </div>

        <!-- Disconnect Button -->
        <div class="wallet-dropdown-footer">
          <button
            type="button"
            class="wallet-disconnect-btn"
            @click="handleDisconnect"
          >
            <Icon
              name="heroicons:arrow-right-on-rectangle"
              class="wallet-disconnect-icon"
            />
            Disconnect
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop for closing dropdown -->
    <div
      v-if="isDropdownOpen"
      class="wallet-backdrop"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  trimmedAddress: string
  address: string
  network: string
  networkIcon: string
  provider: string | null
  providerIcon: string | null
  balance: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  disconnect: []
  copy: []
}>()

const isDropdownOpen = ref(false)
const showCopied = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.address)
    showCopied.value = true
    emit('copy')
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

function handleDisconnect() {
  closeDropdown()
  emit('disconnect')
}
</script>

<style scoped>
.wallet-connected {
  position: relative;
}

.wallet-connected-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-gray-100, #f3f4f6);
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-900, #111827);
}

:root.dark .wallet-connected-btn {
  background-color: var(--color-gray-800, #1f2937);
  border-color: var(--color-gray-700, #374151);
  color: var(--color-gray-100, #f3f4f6);
}

.wallet-connected-btn:hover {
  background-color: var(--color-gray-200, #e5e7eb);
  border-color: var(--color-gray-300, #d1d5db);
}

:root.dark .wallet-connected-btn:hover {
  background-color: var(--color-gray-700, #374151);
  border-color: var(--color-gray-600, #4b5563);
}

.wallet-network-icon {
  width: 1.25rem;
  height: 1.25rem;
  object-fit: contain;
}

.wallet-address {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
}

.wallet-chevron {
  width: 1rem;
  height: 1rem;
  color: var(--color-gray-500, #6b7280);
  transition: transform 0.2s ease;
}

.wallet-chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.wallet-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 280px;
  background-color: var(--color-white, #ffffff);
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: 1rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
}

:root.dark .wallet-dropdown {
  background-color: var(--color-gray-900, #111827);
  border-color: var(--color-gray-700, #374151);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -4px rgba(0, 0, 0, 0.2);
}

.wallet-dropdown-section {
  padding: 1rem;
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
}

:root.dark .wallet-dropdown-section {
  border-bottom-color: var(--color-gray-800, #1f2937);
}

.wallet-dropdown-section:last-of-type {
  border-bottom: none;
}

.wallet-dropdown-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-gray-500, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.wallet-network-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wallet-dropdown-network-icon {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

.wallet-network-name {
  flex: 1;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
}

:root.dark .wallet-network-name {
  color: var(--color-gray-100, #f3f4f6);
}

.wallet-provider-icon {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

.wallet-address-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.wallet-address-display {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-900, #111827);
}

:root.dark .wallet-address-display {
  color: var(--color-gray-100, #f3f4f6);
}

.wallet-copy-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary-600, #2563eb);
  background-color: var(--color-primary-50, #eff6ff);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

:root.dark .wallet-copy-btn {
  background-color: var(--color-primary-900, #1e3a5f);
  color: var(--color-primary-300, #93c5fd);
}

.wallet-copy-btn:hover {
  background-color: var(--color-primary-100, #dbeafe);
}

:root.dark .wallet-copy-btn:hover {
  background-color: var(--color-primary-800, #1e40af);
}

.wallet-copy-btn.copied {
  background-color: var(--color-green-100, #dcfce7);
  color: var(--color-green-700, #15803d);
}

:root.dark .wallet-copy-btn.copied {
  background-color: var(--color-green-900, #14532d);
  color: var(--color-green-300, #86efac);
}

.wallet-copy-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.wallet-balance-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wallet-token-icon {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

.wallet-balance-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-gray-900, #111827);
}

:root.dark .wallet-balance-amount {
  color: var(--color-gray-100, #f3f4f6);
}

.wallet-balance-symbol {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-500, #6b7280);
}

.wallet-dropdown-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wallet-dropdown-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700, #374151);
  text-decoration: none;
  transition: all 0.15s ease;
}

:root.dark .wallet-dropdown-link {
  color: var(--color-gray-300, #d1d5db);
}

.wallet-dropdown-link:hover {
  background-color: var(--color-gray-100, #f3f4f6);
  color: var(--color-gray-900, #111827);
}

:root.dark .wallet-dropdown-link:hover {
  background-color: var(--color-gray-700, #374151);
  color: var(--color-gray-100, #f3f4f6);
}

.wallet-dropdown-link-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-gray-500, #6b7280);
  flex-shrink: 0;
}

.wallet-dropdown-link:hover .wallet-dropdown-link-icon {
  color: var(--color-primary-500, #3b82f6);
}

.wallet-dropdown-footer {
  padding: 0.75rem 1rem;
  background-color: var(--color-gray-50, #f9fafb);
  border-top: 1px solid var(--color-gray-100, #f3f4f6);
}

:root.dark .wallet-dropdown-footer {
  background-color: var(--color-gray-800, #1f2937);
  border-top-color: var(--color-gray-700, #374151);
}

.wallet-disconnect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-red-600, #dc2626);
  background-color: transparent;
  border: 1px solid var(--color-red-200, #fecaca);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

:root.dark .wallet-disconnect-btn {
  color: var(--color-red-400, #f87171);
  border-color: var(--color-red-800, #991b1b);
}

.wallet-disconnect-btn:hover {
  background-color: var(--color-red-50, #fef2f2);
  border-color: var(--color-red-300, #fca5a5);
}

:root.dark .wallet-disconnect-btn:hover {
  background-color: var(--color-red-900, #7f1d1d);
}

.wallet-disconnect-icon {
  width: 1rem;
  height: 1rem;
}

/* Backdrop */
.wallet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
