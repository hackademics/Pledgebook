<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="vouch-modal-overlay"
        @click.self="handleClose"
      >
        <div
          ref="modalRef"
          class="vouch-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vouch-modal-title"
          aria-describedby="vouch-modal-subtitle"
        >
          <!-- Header -->
          <div class="vouch-modal__header">
            <div class="vouch-modal__header-content">
              <div class="vouch-modal__icon">
                <Icon name="heroicons:shield-check" />
              </div>
              <div>
                <h2
                  id="vouch-modal-title"
                  class="vouch-modal__title"
                >
                  Vouch for Campaign
                </h2>
                <p
                  id="vouch-modal-subtitle"
                  class="vouch-modal__subtitle"
                >
                  Stake your reputation to endorse this campaign
                </p>
              </div>
            </div>
            <button
              type="button"
              class="vouch-modal__close"
              aria-label="Close"
              @click="handleClose"
            >
              <Icon name="heroicons:x-mark" />
            </button>
          </div>

          <!-- Body -->
          <form
            id="vouch-form"
            class="vouch-modal__body"
            @submit.prevent="handleSubmit"
          >
            <!-- Campaign Info -->
            <div class="vouch-modal__campaign">
              <div class="vouch-modal__campaign-icon">
                <Icon name="heroicons:flag" />
              </div>
              <div class="vouch-modal__campaign-info">
                <span class="vouch-modal__campaign-title">
                  {{ campaignTitle }}
                </span>
                <span class="vouch-modal__campaign-meta">
                  Your stake will be held until campaign resolution
                </span>
              </div>
            </div>

            <!-- Info Banner -->
            <div class="vouch-modal__info">
              <Icon name="heroicons:information-circle" />
              <div>
                <strong>What does vouching mean?</strong>
                <p>
                  By vouching, you stake funds to signal trust in this campaign. If the campaign
                  succeeds, you'll earn rewards. If it's found fraudulent, your stake may be
                  slashed.
                </p>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="form-field">
              <label
                for="vouch-amount"
                class="form-field__label"
              >
                Stake Amount
                <span class="form-field__required">*</span>
              </label>
              <div class="form-field__input-group">
                <span class="form-field__input-prefix">$</span>
                <input
                  id="vouch-amount"
                  ref="amountInput"
                  v-model="form.amount"
                  type="text"
                  inputmode="decimal"
                  class="form-field__input form-field__input--with-prefix"
                  :class="{ 'form-field__input--error': errors.amount }"
                  :aria-invalid="Boolean(errors.amount)"
                  :aria-describedby="errors.amount ? 'vouch-amount-error' : undefined"
                  placeholder="0.00"
                  @input="handleAmountInput"
                />
                <span class="form-field__input-suffix">USDC</span>
              </div>
              <span
                v-if="errors.amount"
                id="vouch-amount-error"
                class="form-field__error"
                aria-live="polite"
              >
                {{ errors.amount }}
              </span>
              <span class="form-field__hint">
                Minimum $10.00 · Higher stakes earn more rewards
              </span>
              <div class="vouch-modal__quick-amounts">
                <button
                  v-for="amount in quickAmounts"
                  :key="amount"
                  type="button"
                  class="vouch-modal__quick-btn"
                  :class="{ 'vouch-modal__quick-btn--active': form.amount === amount }"
                  @click="form.amount = amount"
                >
                  ${{ amount }}
                </button>
              </div>
            </div>

            <!-- Endorsement Message -->
            <div class="form-field">
              <label
                for="vouch-message"
                class="form-field__label"
              >
                Endorsement Message
                <span class="form-field__optional">(optional)</span>
              </label>
              <textarea
                id="vouch-message"
                v-model="form.endorsementMessage"
                class="form-field__textarea"
                placeholder="Why do you trust this campaign?"
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="form-field__footer">
                <span class="form-field__hint"> Publicly visible endorsement </span>
                <span class="form-field__counter"> {{ form.endorsementMessage.length }}/500 </span>
              </div>
            </div>

            <!-- Expiration Date (optional) -->
            <div class="form-field">
              <label
                for="vouch-expires"
                class="form-field__label"
              >
                Vouch Expiration
                <span class="form-field__optional">(optional)</span>
              </label>
              <input
                id="vouch-expires"
                v-model="form.expiresAt"
                type="datetime-local"
                class="form-field__input"
                :min="minExpirationDate"
              />
              <span class="form-field__hint">
                Leave empty for indefinite vouching until campaign resolution
              </span>
            </div>

            <!-- Transaction Summary -->
            <div class="vouch-modal__summary">
              <div class="vouch-modal__summary-row">
                <span>Stake amount</span>
                <span>{{ formattedAmount }}</span>
              </div>
              <div class="vouch-modal__summary-row">
                <span>Potential reward</span>
                <span class="vouch-modal__summary-reward">~{{ potentialReward }}</span>
              </div>
              <div class="vouch-modal__summary-row">
                <span>Network fee</span>
                <span class="vouch-modal__summary-fee">~$0.01</span>
              </div>
              <div class="vouch-modal__summary-row vouch-modal__summary-row--total">
                <span>Total stake</span>
                <span>{{ formattedAmount }}</span>
              </div>
              <p class="vouch-modal__summary-note">
                Stakes are locked until campaign resolution. Rewards and slashing depend on outcome.
              </p>
            </div>

            <!-- Risk Warning -->
            <div class="vouch-modal__warning">
              <Icon name="heroicons:exclamation-triangle" />
              <span>Your stake may be slashed if the campaign is found fraudulent.</span>
            </div>

            <!-- Wallet Notice -->
            <div
              v-if="!isWalletConnected"
              class="vouch-modal__notice"
            >
              <Icon name="heroicons:wallet" />
              <span>Connect your wallet to continue</span>
            </div>
          </form>

          <!-- Footer -->
          <div class="vouch-modal__footer">
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
              form="vouch-form"
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
                name="heroicons:shield-check"
              />
              {{ isSubmitting ? 'Processing...' : 'Confirm Vouch' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch, toRef } from 'vue'
import type { VoucherFormState } from '../types/voucher'
import { parseVoucherAmountToWei } from '../types/voucher'
import { useVouchers } from '../composables/useVouchers'
import { ERC20_ABI, PLEDGE_ESCROW_ABI, getUsdcAddress } from '~/config/contracts'
import { useFocusTrap } from '~/composables/useFocusTrap'
import type { Address } from 'viem'

interface Props {
  visible: boolean
  campaignId: string
  campaignTitle: string
  campaignSlug: string
  escrowAddress?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [voucherId: string, txHash: string]
}>()

const { createVoucher } = useVouchers()
const {
  isConnected: isWalletConnected,
  connect,
  address,
  isCorrectNetwork,
  switchToCorrectNetwork,
  getPublicClient,
  getWalletClient,
} = useWallet()
const amountInput = ref<HTMLInputElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)

// Focus trap for accessibility
const visibleRef = toRef(props, 'visible')
useFocusTrap(modalRef, visibleRef)

// Form state
const form = reactive<VoucherFormState>({
  amount: '',
  endorsementMessage: '',
  expiresAt: '',
})

const errors = reactive({
  amount: '',
})

const isSubmitting = ref(false)

const quickAmounts = ['50', '100', '250', '500', '1000']

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

const potentialReward = computed(() => {
  // Estimate ~5% reward on stake
  const reward = numericAmount.value * 0.05
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(reward)
})

const minExpirationDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1) // Minimum 1 day from now
  return date.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
  return numericAmount.value >= 10 && !errors.amount
})

watch(
  () => props.visible,
  (isVisible: boolean) => {
    if (isVisible) {
      nextTick(() => amountInput.value?.focus())
    }
  },
)

// Methods
function handleAmountInput(event: Event) {
  const input = event.target as HTMLInputElement
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
  if (numericAmount.value < 10) {
    errors.amount = 'Minimum stake is $10.00'
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
  form.endorsementMessage = ''
  form.expiresAt = ''
  errors.amount = ''
}

async function connectWallet() {
  await connect('metamask')
}

async function handleSubmit() {
  if (!validateAmount() || isSubmitting.value) return
  if (!address.value || !props.escrowAddress) {
    errors.amount = 'Wallet not connected or escrow address missing.'
    return
  }

  // Ensure correct network
  if (!isCorrectNetwork.value) {
    const switched = await switchToCorrectNetwork()
    if (!switched) {
      errors.amount = 'Please switch to the correct network.'
      return
    }
  }

  isSubmitting.value = true

  try {
    const weiAmount = parseVoucherAmountToWei(form.amount)
    const pc = getPublicClient()
    const wc = getWalletClient()

    if (!pc || !wc) {
      errors.amount = 'Wallet client unavailable. Please reconnect.'
      return
    }

    const usdcAddress = getUsdcAddress(pc.chain?.id ?? 80002)
    const escrow = props.escrowAddress as Address

    // Step 1: Approve USDC spend by escrow contract
    const approveHash = await wc.writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [escrow, BigInt(weiAmount)],
      account: address.value,
      chain: pc.chain,
    })
    await pc.waitForTransactionReceipt({ hash: approveHash })

    // Step 2: Call PledgeEscrow.vouch(amount)
    const vouchHash = await wc.writeContract({
      address: escrow,
      abi: PLEDGE_ESCROW_ABI,
      functionName: 'vouch',
      args: [BigInt(weiAmount)],
      account: address.value,
      chain: pc.chain,
    })
    const receipt = await pc.waitForTransactionReceipt({ hash: vouchHash })
    const txHash = receipt.transactionHash

    // Step 3: Record voucher in backend
    const response = await createVoucher({
      campaignId: props.campaignId,
      amount: weiAmount,
      stakeTxHash: txHash,
      endorsementMessage: form.endorsementMessage || null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    })

    if (response.success && response.data) {
      emit('success', response.data.id, txHash)
      emit('update:visible', false)
      resetForm()
    } else {
      errors.amount = response.error?.message || 'Failed to create voucher'
    }
  } catch (error: unknown) {
    const err = error as { shortMessage?: string; message?: string }
    errors.amount = err.shortMessage || err.message || 'Transaction failed. Please try again.'
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
.vouch-modal-overlay {
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
.vouch-modal {
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 2rem);
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.vouch-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.vouch-modal__header-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.vouch-modal__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-500);
}

.vouch-modal__icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.vouch-modal__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.vouch-modal__subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0.125rem 0 0;
}

.vouch-modal__close {
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

.vouch-modal__close:hover {
  background-color: var(--surface-hover);
  color: var(--text-primary);
}

.vouch-modal__close .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Body */
.vouch-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Campaign Summary */
.vouch-modal__campaign {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.vouch-modal__campaign-icon {
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

.vouch-modal__campaign-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.vouch-modal__campaign-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.vouch-modal__campaign-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vouch-modal__campaign-meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Info Banner */
.vouch-modal__info {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  background-color: color-mix(in oklch, var(--color-info-500) 8%, transparent);
  border: 1px solid color-mix(in oklch, var(--color-info-500) 20%, transparent);
  border-radius: var(--radius-lg);
}

.vouch-modal__info > .icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-info-500);
}

.vouch-modal__info strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.vouch-modal__info p {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Quick Amount Buttons */
.vouch-modal__quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.vouch-modal__quick-btn {
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

.vouch-modal__quick-btn:hover {
  border-color: var(--color-success-500);
  color: var(--color-success-500);
}

.vouch-modal__quick-btn--active {
  border-color: var(--color-success-500);
  background-color: color-mix(in oklch, var(--color-success-500) 10%, transparent);
  color: var(--color-success-500);
}

/* Transaction Summary */
.vouch-modal__summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.vouch-modal__summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.vouch-modal__summary-reward {
  color: var(--color-success-500);
}

.vouch-modal__summary-fee {
  color: var(--text-tertiary);
}

.vouch-modal__summary-row--total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.vouch-modal__summary-note {
  margin: 0.5rem 0 0;
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

/* Warning Banner */
.vouch-modal__warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: color-mix(in oklch, var(--color-warning-500) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--color-warning-500) 20%, transparent);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--color-warning-600);
}

.vouch-modal__warning .icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

/* Wallet Notice */
.vouch-modal__notice {
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

.vouch-modal__notice .icon {
  width: 1rem;
  height: 1rem;
}

/* Footer */
.vouch-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-primary);
  background-color: var(--surface-secondary);
}

/* Form Fields */
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
  border-color: var(--color-success-500);
}

.form-field__input-prefix,
.form-field__input-suffix {
  padding: 0 0.75rem;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
}

.form-field__input {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-success-500);
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
  min-height: 80px;
  font-family: inherit;
}

.form-field__textarea:focus {
  outline: none;
  border-color: var(--color-success-500);
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
  background-color: var(--color-success-500);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-success-600);
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

.modal-enter-active .vouch-modal,
.modal-leave-active .vouch-modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .vouch-modal,
.modal-leave-to .vouch-modal {
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
