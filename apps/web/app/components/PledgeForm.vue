<template>
  <div class="pledge-form">
    <!-- Header -->
    <div class="pledge-form__header">
      <div class="pledge-form__icon">
        <Icon name="heroicons:bolt" />
      </div>
      <div class="pledge-form__header-text">
        <h2 class="pledge-form__title">Make a Pledge</h2>
        <p class="pledge-form__subtitle">Support this campaign with a contribution</p>
      </div>
    </div>

    <!-- Form Content -->
    <form
      id="pledge-inline-form"
      class="pledge-form__body"
      @submit.prevent="handleSubmit"
    >
      <!-- Amount Section -->
      <div class="pledge-form__section">
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
          <span class="form-field__hint">Minimum $1.00 · USDC only</span>
        </div>

        <!-- Quick Amounts -->
        <div class="pledge-form__quick-amounts">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            class="pledge-form__quick-btn"
            :class="{ 'pledge-form__quick-btn--active': form.amount === amount }"
            @click="form.amount = amount"
          >
            ${{ amount }}
          </button>
        </div>
      </div>

      <!-- Options Section -->
      <div class="pledge-form__section pledge-form__section--options">
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
            <span class="form-field__hint">Visible to the campaign creator</span>
            <span class="form-field__counter">{{ form.message.length }}/280</span>
          </div>
        </div>

        <!-- Anonymous Toggle -->
        <label class="pledge-form__toggle">
          <input
            v-model="form.isAnonymous"
            type="checkbox"
          />
          <span class="pledge-form__toggle-track">
            <span class="pledge-form__toggle-thumb"></span>
          </span>
          <span class="pledge-form__toggle-content">
            <Icon name="heroicons:eye-slash" />
            <span>
              <strong>Pledge anonymously</strong>
              <small>Your name won't be shown publicly</small>
            </span>
          </span>
        </label>
      </div>

      <!-- Summary & Action Section -->
      <div class="pledge-form__section pledge-form__section--action">
        <!-- Transaction Summary -->
        <div class="pledge-form__summary">
          <div class="pledge-form__summary-row">
            <span>Pledge amount</span>
            <span>{{ formattedAmount }}</span>
          </div>
          <div class="pledge-form__summary-row">
            <span>Network fee</span>
            <span class="pledge-form__summary-fee">~$0.01</span>
          </div>
          <div class="pledge-form__summary-row pledge-form__summary-row--total">
            <span>Total</span>
            <span>{{ formattedTotal }}</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pledge-form__actions">
          <div
            v-if="!isWalletConnected"
            class="pledge-form__notice"
          >
            <Icon name="heroicons:wallet" />
            <span>Connect your wallet to continue</span>
          </div>

          <button
            v-if="!isWalletConnected"
            type="button"
            class="btn btn--primary btn--lg btn--full"
            @click="connectWallet"
          >
            <Icon name="heroicons:wallet" />
            Connect Wallet
          </button>
          <button
            v-else
            type="submit"
            class="btn btn--primary btn--lg btn--full"
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

          <p class="pledge-form__escrow-note">
            <Icon name="heroicons:shield-check" />
            Funds held in escrow until campaign outcome is verified
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PledgeFormState } from '../types/pledge'
import { parseAmountToWei } from '../types/pledge'
import { ERC20_ABI, PLEDGE_ESCROW_ABI, getUsdcAddress } from '~/config/contracts'
import type { Address } from 'viem'

interface Props {
  campaignTitle: string
  campaignSlug: string
  campaignId?: string
  escrowAddress?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: [pledgeId: string, txHash: string]
}>()

const router = useRouter()
const amountInput = ref<HTMLInputElement | null>(null)
const {
  isConnected: isWalletConnected,
  connect,
  address,
  isCorrectNetwork,
  switchToCorrectNetwork,
  getPublicClient,
  getWalletClient,
} = useWallet()
const { createPledge } = usePledges()

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
  }).format(numericAmount.value + 0.01)
})

const isFormValid = computed(() => {
  return numericAmount.value > 0 && !errors.amount
})

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
  if (numericAmount.value < 1) {
    errors.amount = 'Minimum pledge is $1.00'
    return false
  }
  return true
}

function resetForm() {
  form.amount = ''
  form.message = ''
  form.isAnonymous = false
  errors.amount = ''
}

async function connectWallet() {
  await connect('metamask')
}

async function handleSubmit() {
  if (!validateAmount() || isSubmitting.value) return
  if (!address.value || !props.escrowAddress || !props.campaignId) {
    errors.amount = 'Wallet not connected or campaign data missing.'
    return
  }

  if (!isCorrectNetwork.value) {
    const switched = await switchToCorrectNetwork()
    if (!switched) {
      errors.amount = 'Please switch to the correct network.'
      return
    }
  }

  isSubmitting.value = true

  try {
    const weiAmount = parseAmountToWei(form.amount)
    const pc = getPublicClient()
    const wc = getWalletClient()

    if (!pc || !wc) {
      errors.amount = 'Wallet client unavailable. Please reconnect.'
      return
    }

    const usdcAddress = getUsdcAddress(pc.chain?.id ?? 80002)
    const escrow = props.escrowAddress as Address

    // Step 1: Approve USDC spend
    const approveHash = await wc.writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [escrow, weiAmount],
      account: address.value,
      chain: pc.chain,
    })
    await pc.waitForTransactionReceipt({ hash: approveHash })

    // Step 2: Call PledgeEscrow.pledge(amount)
    const pledgeHash = await wc.writeContract({
      address: escrow,
      abi: PLEDGE_ESCROW_ABI,
      functionName: 'pledge',
      args: [weiAmount],
      account: address.value,
      chain: pc.chain,
    })
    const receipt = await pc.waitForTransactionReceipt({ hash: pledgeHash })
    const txHash = receipt.transactionHash

    // Step 3: Record pledge in backend
    const response = await createPledge({
      campaignId: props.campaignId,
      amount: weiAmount.toString(),
      txHash,
      message: form.message || null,
      isAnonymous: form.isAnonymous,
      blockNumber: Number(receipt.blockNumber),
    })

    const pledgeId = response.data?.id ?? crypto.randomUUID()

    emit('success', pledgeId, txHash)
    resetForm()

    router.push(`/@${props.campaignSlug}/pledges/${pledgeId}`)
  } catch (error: unknown) {
    const err = error as { shortMessage?: string; message?: string }
    errors.amount = err.shortMessage || err.message || 'Transaction failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.pledge-form {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
}

/* Header */
.pledge-form__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: var(--surface-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.pledge-form__icon {
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

.pledge-form__icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.pledge-form__header-text {
  flex: 1;
  min-width: 0;
}

.pledge-form__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.pledge-form__subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0.125rem 0 0;
}

/* Body */
.pledge-form__body {
  padding: 1.25rem;
  display: grid;
  gap: 1.25rem;
}

/* Responsive grid for wider screens */
@media (min-width: 768px) {
  .pledge-form__body {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .pledge-form__section--action {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .pledge-form__body {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .pledge-form__section--action {
    grid-column: auto;
  }
}

.pledge-form__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Quick Amount Buttons */
.pledge-form__quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pledge-form__quick-btn {
  flex: 1;
  min-width: 4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pledge-form__quick-btn:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
}

.pledge-form__quick-btn--active {
  border-color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  color: var(--interactive-primary);
}

/* Anonymous Toggle */
.pledge-form__toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.pledge-form__toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.pledge-form__toggle-track {
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.375rem;
  background-color: var(--border-primary);
  border-radius: var(--radius-full);
  position: relative;
  transition: background-color var(--transition-fast);
}

.pledge-form__toggle input:checked + .pledge-form__toggle-track {
  background-color: var(--interactive-primary);
}

.pledge-form__toggle-thumb {
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

.pledge-form__toggle input:checked + .pledge-form__toggle-track .pledge-form__toggle-thumb {
  transform: translateX(1.125rem);
}

.pledge-form__toggle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.pledge-form__toggle-content > .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

.pledge-form__toggle-content span {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.pledge-form__toggle-content strong {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.pledge-form__toggle-content small {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Summary */
.pledge-form__summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.pledge-form__summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.pledge-form__summary-fee {
  color: var(--text-tertiary);
}

.pledge-form__summary-row--total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* Actions */
.pledge-form__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pledge-form__notice {
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

.pledge-form__notice .icon {
  width: 1rem;
  height: 1rem;
}

.pledge-form__escrow-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.pledge-form__escrow-note .icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-success-500);
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
  flex: 1;
  border: none;
  padding: 0.625rem 0.75rem;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  background: transparent;
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
  font-family: inherit;
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
  padding: 0.75rem 1.25rem;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.btn--lg .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.btn--full {
  width: 100%;
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
