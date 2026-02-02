<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="pledge-modal-overlay"
        @click.self="handleClose"
      >
        <div
          class="pledge-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pledge-modal-title"
          aria-describedby="pledge-modal-subtitle"
        >
          <!-- Header -->
          <div class="pledge-modal__header">
            <div class="pledge-modal__header-content">
              <div class="pledge-modal__icon">
                <Icon name="heroicons:bolt" />
              </div>
              <div>
                <h2
                  id="pledge-modal-title"
                  class="pledge-modal__title"
                >
                  Make a Pledge
                </h2>
                <p
                  id="pledge-modal-subtitle"
                  class="pledge-modal__subtitle"
                >
                  Support this campaign with a contribution
                </p>
              </div>
            </div>
            <button
              type="button"
              class="pledge-modal__close"
              aria-label="Close"
              @click="handleClose"
            >
              <Icon name="heroicons:x-mark" />
            </button>
          </div>

          <!-- Body -->
          <form
            id="pledge-form"
            class="pledge-modal__body"
            @submit.prevent="handleSubmit"
          >
            <!-- Campaign Info -->
            <div class="pledge-modal__campaign">
              <div class="pledge-modal__campaign-icon">
                <Icon name="heroicons:flag" />
              </div>
              <div class="pledge-modal__campaign-info">
                <span class="pledge-modal__campaign-title">
                  {{ campaignTitle }}
                </span>
                <span class="pledge-modal__campaign-meta">
                  Your pledge will be held in escrow until campaign outcome
                </span>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="form-field">
              <label
                for="pledge-amount"
                class="form-field__label"
              >
                Pledge Amount
                <span class="form-field__required">*</span>
              </label>
              <div class="form-field__input-group">
                <span class="form-field__input-prefix">$</span>
                <input
                  id="pledge-amount"
                  ref="amountInput"
                  v-model="form.amount"
                  type="text"
                  inputmode="decimal"
                  class="form-field__input form-field__input--with-prefix"
                  :class="{ 'form-field__input--error': errors.amount }"
                  :aria-invalid="Boolean(errors.amount)"
                  :aria-describedby="errors.amount ? 'pledge-amount-error' : undefined"
                  placeholder="0.00"
                  @input="handleAmountInput"
                />
                <span class="form-field__input-suffix">USDC</span>
              </div>
              <span
                v-if="errors.amount"
                id="pledge-amount-error"
                class="form-field__error"
                aria-live="polite"
              >
                {{ errors.amount }}
              </span>
              <span class="form-field__hint"> Minimum $1.00 · USDC only </span>
              <div class="pledge-modal__quick-amounts">
                <button
                  v-for="amount in quickAmounts"
                  :key="amount"
                  type="button"
                  class="pledge-modal__quick-btn"
                  :class="{ 'pledge-modal__quick-btn--active': form.amount === amount }"
                  @click="form.amount = amount"
                >
                  ${{ amount }}
                </button>
              </div>
            </div>

            <!-- Message Input -->
            <div class="form-field">
              <label
                for="pledge-message"
                class="form-field__label"
              >
                Message
                <span class="form-field__optional">(optional)</span>
              </label>
              <textarea
                id="pledge-message"
                v-model="form.message"
                class="form-field__textarea"
                placeholder="Add a note to your pledge..."
                rows="2"
                maxlength="280"
              ></textarea>
              <div class="form-field__footer">
                <span class="form-field__hint"> Visible to the campaign creator </span>
                <span class="form-field__counter"> {{ form.message.length }}/280 </span>
              </div>
            </div>

            <!-- Anonymous Toggle -->
            <label class="pledge-modal__toggle">
              <input
                v-model="form.isAnonymous"
                type="checkbox"
              />
              <span class="pledge-modal__toggle-track">
                <span class="pledge-modal__toggle-thumb"></span>
              </span>
              <span class="pledge-modal__toggle-content">
                <Icon name="heroicons:eye-slash" />
                <span>
                  <strong>Pledge anonymously</strong>
                  <small>Your name won't be shown publicly</small>
                </span>
              </span>
            </label>

            <!-- Transaction Summary -->
            <div class="pledge-modal__summary">
              <div class="pledge-modal__summary-row">
                <span>Pledge amount</span>
                <span>{{ formattedAmount }}</span>
              </div>
              <div class="pledge-modal__summary-row">
                <span>Network fee</span>
                <span class="pledge-modal__summary-fee">~$0.01</span>
              </div>
              <div class="pledge-modal__summary-row pledge-modal__summary-row--total">
                <span>Total</span>
                <span>{{ formattedTotal }}</span>
              </div>
              <p class="pledge-modal__summary-note">Network fees are estimates and may vary.</p>
            </div>

            <!-- Wallet Notice -->
            <div
              v-if="!isWalletConnected"
              class="pledge-modal__notice"
            >
              <Icon name="heroicons:wallet" />
              <span>Connect your wallet to continue</span>
            </div>
          </form>

          <!-- Footer -->
          <div class="pledge-modal__footer">
            <button
              type="button"
              class="btn btn--secondary"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              v-if="!isWalletConnected"
              type="button"
              class="btn btn--primary"
              @click="connectWallet"
            >
              <Icon name="heroicons:wallet" />
              Connect Wallet
            </button>
            <button
              v-else
              type="submit"
              form="pledge-form"
              class="btn btn--primary btn--lg"
              :disabled="!isFormValid || isSubmitting"
            >
              <Icon
                v-if="isSubmitting"
                name="heroicons:arrow-path"
                class="animate-spin"
              />
              <Icon
                v-else
                name="heroicons:bolt"
              />
              {{ isSubmitting ? 'Processing...' : 'Confirm Pledge' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { PledgeFormState } from '../types/pledge'
import { parseAmountToWei } from '../types/pledge'

interface Props {
  visible: boolean
  campaignTitle: string
  campaignSlug: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [pledgeId: string, txHash: string]
}>()

const router = useRouter()
const amountInput = ref<HTMLInputElement | null>(null)
const lastActiveElement = ref<HTMLElement | null>(null)

// Form state
const form = reactive<PledgeFormState>({
  amount: '',
  message: '',
  isAnonymous: false,
})

const errors = reactive({
  amount: '',
})

const isSubmitting = ref(false)
const isWalletConnected = ref(false) // TODO: Replace with actual wallet state

const quickAmounts = ['25', '50', '100', '250', '500']

// Computed
const numericAmount = computed(() => {
  const cleaned = form.amount.replace(/[^0-9.]/g, '')
  return Number.parseFloat(cleaned) || 0
})

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericAmount.value)
})

const formattedTotal = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericAmount.value + 0.01) // Adding estimated gas fee
})

const isFormValid = computed(() => {
  return numericAmount.value > 0 && !errors.amount
})

watch(
  () => props.visible,
  (isVisible: boolean) => {
    if (isVisible) {
      lastActiveElement.value = document.activeElement as HTMLElement | null
      nextTick(() => amountInput.value?.focus())
      return
    }
    if (lastActiveElement.value) {
      lastActiveElement.value.focus()
      lastActiveElement.value = null
    }
  },
)

// Methods
function handleAmountInput(event: Event) {
  const input = event.target as HTMLInputElement
  // Allow only numbers and one decimal point
  input.value = input.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  form.amount = input.value
  validateAmount()
}

function validateAmount() {
  errors.amount = ''
  if (!form.amount) {
    errors.amount = 'Please enter an amount'
    return false
  }
  if (numericAmount.value <= 0) {
    errors.amount = 'Amount must be greater than 0'
    return false
  }
  if (numericAmount.value < 1) {
    errors.amount = 'Minimum pledge is $1.00'
    return false
  }
  return true
}

function handleClose() {
  if (!isSubmitting.value) {
    emit('update:visible', false)
    resetForm()
  }
}

function resetForm() {
  form.amount = ''
  form.message = ''
  form.isAnonymous = false
  errors.amount = ''
}

function connectWallet() {
  // TODO: Integrate with wallet connection
  isWalletConnected.value = true
}

async function handleSubmit() {
  if (!validateAmount() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // TODO: Integrate with smart contract
    // 1. Call PledgeEscrow.pledge() on-chain
    // 2. Wait for transaction confirmation
    // 3. Create pledge record in backend

    parseAmountToWei(form.amount)

    // Simulate transaction for now
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock transaction hash
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    const pledgeId = crypto.randomUUID()

    emit('success', pledgeId, txHash)
    emit('update:visible', false)
    resetForm()

    // Navigate to receipt page
    router.push(`/@${props.campaignSlug}/pledges/${pledgeId}`)
  } catch (error) {
    console.error('Pledge failed:', error)
    errors.amount = 'Transaction failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.visible) {
      handleClose()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => window.removeEventListener('keydown', handleEscape))
})
</script>

<style scoped>
/* Modal Overlay */
.pledge-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: var(--bg-overlay);
  backdrop-filter: blur(4px);
}

/* Modal Container */
.pledge-modal {
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 2rem);
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.pledge-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.pledge-modal__header-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.pledge-modal__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  color: var(--interactive-primary);
}

.pledge-modal__icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.pledge-modal__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.pledge-modal__subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0.125rem 0 0;
}

.pledge-modal__close {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pledge-modal__close:hover {
  background-color: var(--surface-hover);
  color: var(--text-primary);
}

.pledge-modal__close .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Body */
.pledge-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Campaign Summary */
.pledge-modal__campaign {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.pledge-modal__campaign-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background-color: color-mix(in oklch, var(--interactive-primary) 14%, transparent);
  color: var(--interactive-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pledge-modal__campaign-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.pledge-modal__campaign-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.pledge-modal__campaign-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pledge-modal__campaign-meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Quick Amount Buttons */
.pledge-modal__quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.pledge-modal__quick-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pledge-modal__quick-btn:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
}

.pledge-modal__quick-btn--active {
  border-color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  color: var(--interactive-primary);
}

/* Anonymous Toggle */
.pledge-modal__toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.pledge-modal__toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.pledge-modal__toggle-track {
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.375rem;
  background-color: var(--border-primary);
  border-radius: var(--radius-full);
  position: relative;
  transition: background-color var(--transition-fast);
}

.pledge-modal__toggle input:checked + .pledge-modal__toggle-track {
  background-color: var(--interactive-primary);
}

.pledge-modal__toggle-thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.125rem;
  height: 1.125rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.pledge-modal__toggle input:checked + .pledge-modal__toggle-track .pledge-modal__toggle-thumb {
  transform: translateX(1.125rem);
}

.pledge-modal__toggle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.pledge-modal__toggle-content > .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

.pledge-modal__toggle-content span {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.pledge-modal__toggle-content strong {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.pledge-modal__toggle-content small {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Transaction Summary */
.pledge-modal__summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.pledge-modal__summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.pledge-modal__summary-fee {
  color: var(--text-tertiary);
}

.pledge-modal__summary-row--total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.pledge-modal__summary-note {
  margin: 0.5rem 0 0;
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

/* Wallet Notice */
.pledge-modal__notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--color-warning-600);
}

.pledge-modal__notice .icon {
  width: 1rem;
  height: 1rem;
}

/* Footer */
.pledge-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-primary);
  background-color: var(--surface-secondary);
}

/* Form Fields (reuse existing styles) */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-field__required {
  color: var(--color-error-500);
}

.form-field__optional {
  font-weight: var(--font-weight-normal);
  color: var(--text-tertiary);
}

.form-field__input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.form-field__input-group:focus-within {
  border-color: var(--interactive-primary);
}

.form-field__input-prefix,
.form-field__input-suffix {
  padding: 0 0.75rem;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
}

.form-field__input--with-prefix {
  border: none;
  padding: 0.625rem 0.75rem;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.form-field__input--with-prefix:focus {
  outline: none;
}

.form-field__input--error {
  border-color: var(--color-error-500);
}

.form-field__textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  resize: vertical;
  min-height: 60px;
}

.form-field__textarea:focus {
  outline: none;
  border-color: var(--interactive-primary);
}

.form-field__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-field__hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.form-field__counter {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.form-field__error {
  font-size: var(--text-xs);
  color: var(--color-error-500);
}

/* Button overrides */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.btn--lg {
  padding: 0.625rem 1.25rem;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.btn--lg .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover {
  background-color: var(--surface-hover);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .pledge-modal,
.modal-leave-active .pledge-modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .pledge-modal,
.modal-leave-to .pledge-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.animate-spin {
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
</style>
