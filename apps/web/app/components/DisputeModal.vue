<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="dispute-modal-overlay"
        @click.self="handleClose"
      >
        <div
          class="dispute-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-modal-title"
          aria-describedby="dispute-modal-subtitle"
        >
          <!-- Header -->
          <div class="dispute-modal__header">
            <div class="dispute-modal__header-content">
              <div class="dispute-modal__icon">
                <Icon name="heroicons:flag" />
              </div>
              <div>
                <h2
                  id="dispute-modal-title"
                  class="dispute-modal__title"
                >
                  File a Dispute
                </h2>
                <p
                  id="dispute-modal-subtitle"
                  class="dispute-modal__subtitle"
                >
                  Report concerns about this campaign
                </p>
              </div>
            </div>
            <button
              type="button"
              class="dispute-modal__close"
              aria-label="Close"
              @click="handleClose"
            >
              <Icon name="heroicons:x-mark" />
            </button>
          </div>

          <!-- Body -->
          <form
            id="dispute-form"
            class="dispute-modal__body"
            @submit.prevent="handleSubmit"
          >
            <!-- Campaign Info -->
            <div class="dispute-modal__campaign">
              <div class="dispute-modal__campaign-icon">
                <Icon name="heroicons:flag" />
              </div>
              <div class="dispute-modal__campaign-info">
                <span class="dispute-modal__campaign-title">
                  {{ campaignTitle }}
                </span>
                <span class="dispute-modal__campaign-meta">
                  Your dispute will be reviewed by moderators
                </span>
              </div>
            </div>

            <!-- Warning Banner -->
            <div class="dispute-modal__warning">
              <Icon name="heroicons:exclamation-triangle" />
              <div>
                <strong>Filing a dispute requires a stake</strong>
                <p>
                  If your dispute is upheld, you'll receive rewards. If rejected, part of your stake
                  may be slashed. Only file disputes with genuine evidence.
                </p>
              </div>
            </div>

            <!-- Dispute Type -->
            <div class="form-field">
              <label class="form-field__label">
                Dispute Type
                <span class="form-field__required">*</span>
              </label>
              <div class="dispute-modal__types">
                <label
                  v-for="type in disputeTypes"
                  :key="type.value"
                  class="dispute-modal__type"
                  :class="{
                    'dispute-modal__type--selected': form.disputeType === type.value,
                    [`dispute-modal__type--${type.color}`]: true,
                  }"
                >
                  <input
                    v-model="form.disputeType"
                    type="radio"
                    :value="type.value"
                    name="disputeType"
                  />
                  <Icon :name="type.icon" />
                  <div>
                    <strong>{{ type.label }}</strong>
                    <small>{{ type.description }}</small>
                  </div>
                </label>
              </div>
            </div>

            <!-- Stake Amount -->
            <div class="form-field">
              <label
                for="dispute-amount"
                class="form-field__label"
              >
                Stake Amount
                <span class="form-field__required">*</span>
              </label>
              <div class="form-field__input-group">
                <span class="form-field__input-prefix">$</span>
                <input
                  id="dispute-amount"
                  ref="amountInput"
                  v-model="form.amount"
                  type="text"
                  inputmode="decimal"
                  class="form-field__input form-field__input--with-prefix"
                  :class="{ 'form-field__input--error': errors.amount }"
                  :aria-invalid="Boolean(errors.amount)"
                  :aria-describedby="errors.amount ? 'dispute-amount-error' : undefined"
                  placeholder="0.00"
                  @input="handleAmountInput"
                />
                <span class="form-field__input-suffix">USDC</span>
              </div>
              <span
                v-if="errors.amount"
                id="dispute-amount-error"
                class="form-field__error"
                aria-live="polite"
              >
                {{ errors.amount }}
              </span>
              <span class="form-field__hint">
                Minimum $25.00 · Higher stakes show stronger conviction
              </span>
            </div>

            <!-- Reason -->
            <div class="form-field">
              <label
                for="dispute-reason"
                class="form-field__label"
              >
                Reason for Dispute
                <span class="form-field__required">*</span>
              </label>
              <textarea
                id="dispute-reason"
                v-model="form.reason"
                class="form-field__textarea"
                :class="{ 'form-field__textarea--error': errors.reason }"
                placeholder="Describe why you believe this campaign should be disputed. Be specific and provide context."
                rows="4"
                maxlength="2000"
              ></textarea>
              <div class="form-field__footer">
                <span
                  v-if="errors.reason"
                  class="form-field__error"
                  >{{ errors.reason }}</span
                >
                <span
                  v-else
                  class="form-field__hint"
                  >Minimum 10 characters</span
                >
                <span class="form-field__counter"> {{ form.reason.length }}/2000 </span>
              </div>
            </div>

            <!-- Evidence -->
            <div class="form-field">
              <label class="form-field__label">
                Evidence
                <span class="form-field__optional">(recommended)</span>
              </label>
              <div class="dispute-modal__evidence">
                <div
                  v-for="(item, index) in form.evidence"
                  :key="index"
                  class="dispute-modal__evidence-item"
                >
                  <Icon :name="getEvidenceIcon(item.type)" />
                  <span
                    >{{ item.content.substring(0, 50)
                    }}{{ item.content.length > 50 ? '...' : '' }}</span
                  >
                  <button
                    type="button"
                    class="dispute-modal__evidence-remove"
                    @click="removeEvidence(index)"
                  >
                    <Icon name="heroicons:x-mark" />
                  </button>
                </div>
                <button
                  v-if="form.evidence.length < 10"
                  type="button"
                  class="dispute-modal__evidence-add"
                  @click="showEvidenceInput = !showEvidenceInput"
                >
                  <Icon name="heroicons:plus" />
                  Add Evidence
                </button>
                <div
                  v-if="showEvidenceInput"
                  class="dispute-modal__evidence-input"
                >
                  <select v-model="newEvidence.type">
                    <option value="url">URL</option>
                    <option value="text">Text</option>
                    <option value="image">Image URL</option>
                    <option value="document">Document URL</option>
                  </select>
                  <input
                    v-model="newEvidence.content"
                    type="text"
                    :placeholder="getEvidencePlaceholder(newEvidence.type)"
                  />
                  <button
                    type="button"
                    class="btn btn--sm"
                    :disabled="!newEvidence.content"
                    @click="addEvidence"
                  >
                    Add
                  </button>
                </div>
              </div>
              <span class="form-field__hint"
                >Add links, screenshots, or documentation supporting your claim</span
              >
            </div>

            <!-- Transaction Summary -->
            <div class="dispute-modal__summary">
              <div class="dispute-modal__summary-row">
                <span>Stake amount</span>
                <span>{{ formattedAmount }}</span>
              </div>
              <div class="dispute-modal__summary-row">
                <span>If upheld</span>
                <span class="dispute-modal__summary-reward">Stake returned + rewards</span>
              </div>
              <div class="dispute-modal__summary-row">
                <span>If rejected</span>
                <span class="dispute-modal__summary-slash">Partial stake slashed</span>
              </div>
              <div class="dispute-modal__summary-row">
                <span>Network fee</span>
                <span class="dispute-modal__summary-fee">~$0.01</span>
              </div>
              <div class="dispute-modal__summary-row dispute-modal__summary-row--total">
                <span>Total stake</span>
                <span>{{ formattedAmount }}</span>
              </div>
            </div>

            <!-- Wallet Notice -->
            <div
              v-if="!isWalletConnected"
              class="dispute-modal__notice"
            >
              <Icon name="heroicons:wallet" />
              <span>Connect your wallet to continue</span>
            </div>
          </form>

          <!-- Footer -->
          <div class="dispute-modal__footer">
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
              form="dispute-form"
              class="btn btn--danger btn--lg"
              :disabled="!isFormValid || isSubmitting"
            >
              <Icon
                v-if="isSubmitting"
                name="heroicons:arrow-path"
                class="animate-spin"
              />
              <Icon
                v-else
                name="heroicons:flag"
              />
              {{ isSubmitting ? 'Processing...' : 'Submit Dispute' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DisputerFormState, DisputeType, EvidenceItem } from '../types/disputer'
import { parseDisputerAmountToWei, getDisputeTypeConfig } from '../types/disputer'
import { useDisputers } from '../composables/useDisputers'

interface Props {
  visible: boolean
  campaignId: string
  campaignTitle: string
  campaignSlug: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [disputeId: string, txHash: string]
}>()

const { createDispute } = useDisputers()

// Form state
const form = reactive<DisputerFormState>({
  amount: '',
  reason: '',
  disputeType: 'general',
  evidence: [],
})

const errors = reactive({
  amount: '',
  reason: '',
})

const isSubmitting = ref(false)
const isWalletConnected = ref(false)
const showEvidenceInput = ref(false)
const newEvidence = reactive<{ type: EvidenceItem['type']; content: string }>({
  type: 'url',
  content: '',
})

const disputeTypes: Array<{
  value: DisputeType
  label: string
  description: string
  icon: string
  color: string
}> = [
  {
    value: 'fraud',
    ...getDisputeTypeConfig('fraud'),
    color: 'error',
  },
  {
    value: 'misrepresentation',
    ...getDisputeTypeConfig('misrepresentation'),
    color: 'warning',
  },
  {
    value: 'rule_violation',
    ...getDisputeTypeConfig('rule_violation'),
    color: 'warning',
  },
  {
    value: 'verification_failure',
    ...getDisputeTypeConfig('verification_failure'),
    color: 'info',
  },
  {
    value: 'general',
    ...getDisputeTypeConfig('general'),
    color: 'info',
  },
]

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

const isFormValid = computed(() => {
  return (
    numericAmount.value >= 25 &&
    form.reason.length >= 10 &&
    form.disputeType &&
    !errors.amount &&
    !errors.reason
  )
})

watch(
  () => props.visible,
  (isVisible: boolean) => {
    if (isVisible) {
      // Focus first interactive element
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
  if (numericAmount.value < 25) {
    errors.amount = 'Minimum stake is $25.00'
    return false
  }
  return true
}

function validateReason() {
  errors.reason = ''
  if (!form.reason) {
    errors.reason = 'Please provide a reason'
    return false
  }
  if (form.reason.length < 10) {
    errors.reason = 'Reason must be at least 10 characters'
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
  form.reason = ''
  form.disputeType = 'general'
  form.evidence = []
  errors.amount = ''
  errors.reason = ''
  showEvidenceInput.value = false
  newEvidence.type = 'url'
  newEvidence.content = ''
}

function connectWallet() {
  isWalletConnected.value = true
}

function getEvidenceIcon(type: EvidenceItem['type']): string {
  const icons: Record<EvidenceItem['type'], string> = {
    url: 'heroicons:link',
    text: 'heroicons:document-text',
    image: 'heroicons:photo',
    document: 'heroicons:document',
  }
  return icons[type]
}

function getEvidencePlaceholder(type: EvidenceItem['type']): string {
  const placeholders: Record<EvidenceItem['type'], string> = {
    url: 'https://example.com/evidence',
    text: 'Describe the evidence...',
    image: 'https://example.com/image.jpg',
    document: 'https://example.com/document.pdf',
  }
  return placeholders[type]
}

function addEvidence() {
  if (newEvidence.content && form.evidence.length < 10) {
    form.evidence.push({
      type: newEvidence.type,
      content: newEvidence.content,
      submittedAt: new Date().toISOString(),
    })
    newEvidence.content = ''
    showEvidenceInput.value = false
  }
}

function removeEvidence(index: number) {
  form.evidence.splice(index, 1)
}

async function handleSubmit() {
  const isAmountValid = validateAmount()
  const isReasonValid = validateReason()

  if (!isAmountValid || !isReasonValid || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const weiAmount = parseDisputerAmountToWei(form.amount)

    // Mock transaction hash
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

    const response = await createDispute({
      campaignId: props.campaignId,
      amount: weiAmount,
      stakeTxHash: txHash,
      reason: form.reason,
      disputeType: form.disputeType,
      evidence: form.evidence,
    })

    if (response.success && response.data) {
      emit('success', response.data.id, txHash)
      emit('update:visible', false)
      resetForm()
    } else {
      errors.reason = response.error?.message || 'Failed to create dispute'
    }
  } catch (error) {
    console.error('Dispute failed:', error)
    errors.reason = 'Transaction failed. Please try again.'
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
.dispute-modal-overlay {
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
.dispute-modal {
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 2rem);
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.dispute-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0;
}

.dispute-modal__header-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.dispute-modal__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-500);
}

.dispute-modal__icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.dispute-modal__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.dispute-modal__subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0.125rem 0 0;
}

.dispute-modal__close {
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

.dispute-modal__close:hover {
  background-color: var(--surface-hover);
  color: var(--text-primary);
}

.dispute-modal__close .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Body */
.dispute-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Campaign Summary */
.dispute-modal__campaign {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.dispute-modal__campaign-icon {
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

.dispute-modal__campaign-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.dispute-modal__campaign-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.dispute-modal__campaign-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dispute-modal__campaign-meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Warning Banner */
.dispute-modal__warning {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  background-color: color-mix(in oklch, var(--color-warning-500) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--color-warning-500) 25%, transparent);
  border-radius: var(--radius-lg);
}

.dispute-modal__warning > .icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-warning-500);
}

.dispute-modal__warning strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.dispute-modal__warning p {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Dispute Types */
.dispute-modal__types {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dispute-modal__type {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dispute-modal__type:hover {
  border-color: var(--border-secondary);
  background-color: var(--surface-secondary);
}

.dispute-modal__type--selected {
  border-color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 5%, transparent);
}

.dispute-modal__type--selected.dispute-modal__type--error {
  border-color: var(--color-error-500);
  background-color: color-mix(in oklch, var(--color-error-500) 5%, transparent);
}

.dispute-modal__type--selected.dispute-modal__type--warning {
  border-color: var(--color-warning-500);
  background-color: color-mix(in oklch, var(--color-warning-500) 5%, transparent);
}

.dispute-modal__type--selected.dispute-modal__type--info {
  border-color: var(--color-info-500);
  background-color: color-mix(in oklch, var(--color-info-500) 5%, transparent);
}

.dispute-modal__type input {
  display: none;
}

.dispute-modal__type > .icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  color: var(--text-tertiary);
}

.dispute-modal__type--selected > .icon {
  color: var(--interactive-primary);
}

.dispute-modal__type--selected.dispute-modal__type--error > .icon {
  color: var(--color-error-500);
}

.dispute-modal__type--selected.dispute-modal__type--warning > .icon {
  color: var(--color-warning-500);
}

.dispute-modal__type--selected.dispute-modal__type--info > .icon {
  color: var(--color-info-500);
}

.dispute-modal__type strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.dispute-modal__type small {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 0.125rem;
}

/* Evidence */
.dispute-modal__evidence {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dispute-modal__evidence-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dispute-modal__evidence-item > .icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

.dispute-modal__evidence-item > span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dispute-modal__evidence-remove {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.dispute-modal__evidence-remove:hover {
  color: var(--color-error-500);
  background-color: color-mix(in oklch, var(--color-error-500) 10%, transparent);
}

.dispute-modal__evidence-remove .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.dispute-modal__evidence-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem;
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
  background: transparent;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dispute-modal__evidence-add:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
}

.dispute-modal__evidence-add .icon {
  width: 1rem;
  height: 1rem;
}

.dispute-modal__evidence-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.dispute-modal__evidence-input select,
.dispute-modal__evidence-input input {
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.dispute-modal__evidence-input select {
  width: 100px;
}

.dispute-modal__evidence-input input {
  flex: 1;
}

.dispute-modal__evidence-input .btn--sm {
  padding: 0.5rem 0.75rem;
  font-size: var(--text-sm);
}

/* Transaction Summary */
.dispute-modal__summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.dispute-modal__summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dispute-modal__summary-reward {
  color: var(--color-success-500);
}

.dispute-modal__summary-slash {
  color: var(--color-error-500);
}

.dispute-modal__summary-fee {
  color: var(--text-tertiary);
}

.dispute-modal__summary-row--total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* Wallet Notice */
.dispute-modal__notice {
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

.dispute-modal__notice .icon {
  width: 1rem;
  height: 1rem;
}

/* Footer */
.dispute-modal__footer {
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
  min-height: 100px;
  font-family: inherit;
}

.form-field__textarea:focus {
  outline: none;
  border-color: var(--interactive-primary);
}

.form-field__textarea--error {
  border-color: var(--color-error-500);
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

.btn--danger {
  background-color: var(--color-error-500);
  color: var(--text-inverse);
}

.btn--danger:hover:not(:disabled) {
  background-color: var(--color-error-600);
}

.btn--danger:disabled {
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

.modal-enter-active .dispute-modal,
.modal-leave-active .dispute-modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .dispute-modal,
.modal-leave-to .dispute-modal {
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
