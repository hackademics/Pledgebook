<template>
  <section class="verification-card">
    <div class="verification-card__header">
      <div>
        <h3 class="verification-card__title">
          <Icon name="heroicons:shield-check" />
          AI Verification
        </h3>
        <p class="verification-card__subtitle">
          Upload baseline and completion evidence for AI-powered verification.
        </p>
      </div>
      <VerificationStatusBadge :status="overallStatus" />
    </div>

    <!-- Progress Steps -->
    <div class="verification-steps">
      <div
        class="verification-step"
        :class="{
          'verification-step--complete': hasBaseline,
          'verification-step--active': !hasBaseline,
        }"
      >
        <div class="verification-step__icon">
          <Icon :name="hasBaseline ? 'heroicons:check-circle-solid' : 'heroicons:camera'" />
        </div>
        <div class="verification-step__content">
          <span class="verification-step__label">Step 1: Baseline</span>
          <span class="verification-step__desc">Initial state photo</span>
        </div>
      </div>
      <div class="verification-step__connector"></div>
      <div
        class="verification-step"
        :class="{
          'verification-step--complete': hasCompletion,
          'verification-step--active': hasBaseline && !hasCompletion,
        }"
      >
        <div class="verification-step__icon">
          <Icon :name="hasCompletion ? 'heroicons:check-circle-solid' : 'heroicons:photo'" />
        </div>
        <div class="verification-step__content">
          <span class="verification-step__label">Step 2: Completion</span>
          <span class="verification-step__desc">Completed pledge photo</span>
        </div>
      </div>
      <div class="verification-step__connector"></div>
      <div
        class="verification-step"
        :class="{
          'verification-step--complete': isVerified,
          'verification-step--active': hasCompletion && !isVerified,
        }"
      >
        <div class="verification-step__icon">
          <Icon :name="isVerified ? 'heroicons:check-circle-solid' : 'heroicons:cpu-chip'" />
        </div>
        <div class="verification-step__content">
          <span class="verification-step__label">Step 3: Verify</span>
          <span class="verification-step__desc">AI verification</span>
        </div>
      </div>
    </div>

    <!-- Evidence Cards -->
    <div class="evidence-grid">
      <!-- Baseline Evidence -->
      <div class="evidence-slot">
        <div class="evidence-slot__header">
          <span class="evidence-slot__title">Baseline Evidence</span>
          <span
            v-if="baselineEvidence"
            class="evidence-slot__status evidence-slot__status--complete"
          >
            <Icon name="heroicons:check" /> Uploaded
          </span>
        </div>
        <div
          v-if="baselineEvidence"
          class="evidence-slot__preview"
        >
          <img
            :src="baselineEvidence.gatewayUrl"
            :alt="baselineEvidence.fileName"
            @error="handleImageError"
          />
          <div class="evidence-slot__meta">
            <code>{{ truncateCid(baselineEvidence.ipfsCid) }}</code>
          </div>
        </div>
        <div
          v-else
          class="evidence-slot__empty"
        >
          <Icon name="heroicons:photo" />
          <span>No baseline uploaded</span>
          <button
            v-if="isCreator"
            type="button"
            class="btn btn--sm btn--secondary"
            :disabled="!hasToken"
            @click="openUploadModal('baseline')"
          >
            Upload Baseline
          </button>
        </div>
      </div>

      <!-- Completion Evidence -->
      <div class="evidence-slot">
        <div class="evidence-slot__header">
          <span class="evidence-slot__title">Completion Evidence</span>
          <span
            v-if="completionEvidence"
            class="evidence-slot__status"
            :class="completionStatusClass"
          >
            <Icon :name="completionStatusIcon" /> {{ completionStatusText }}
          </span>
        </div>
        <div
          v-if="completionEvidence"
          class="evidence-slot__preview"
        >
          <img
            :src="completionEvidence.gatewayUrl"
            :alt="completionEvidence.fileName"
            @error="handleImageError"
          />
          <div class="evidence-slot__meta">
            <code>{{ truncateCid(completionEvidence.ipfsCid) }}</code>
            <span
              v-if="completionEvidence.verificationResult"
              class="evidence-slot__score"
            >
              Score: {{ formatScore(completionEvidence.verificationResult) }}
            </span>
          </div>
        </div>
        <div
          v-else
          class="evidence-slot__empty"
        >
          <Icon name="heroicons:photo" />
          <span>No completion uploaded</span>
          <button
            v-if="isCreator && hasBaseline"
            type="button"
            class="btn btn--sm btn--secondary"
            :disabled="!hasToken"
            @click="openUploadModal('completion')"
          >
            Upload Completion
          </button>
        </div>
      </div>
    </div>

    <!-- Verification Result -->
    <div
      v-if="verificationResult"
      class="verification-result"
      :class="`verification-result--${verificationResult.verdict}`"
    >
      <div class="verification-result__header">
        <Icon
          :name="
            verificationResult.verdict === 'pass'
              ? 'heroicons:check-circle-solid'
              : 'heroicons:x-circle-solid'
          "
        />
        <span>{{
          verificationResult.verdict === 'pass' ? 'Verification Passed' : 'Verification Failed'
        }}</span>
      </div>
      <div class="verification-result__details">
        <div class="verification-result__row">
          <span>Baseline Count</span>
          <strong>{{ verificationResult.result?.baseline_count ?? '—' }}</strong>
        </div>
        <div class="verification-result__row">
          <span>Completion Count</span>
          <strong>{{ verificationResult.result?.completion_count ?? '—' }}</strong>
        </div>
        <div class="verification-result__row">
          <span>Confidence</span>
          <strong>{{ formatPercent(verificationResult.result?.confidence) }}</strong>
        </div>
        <div
          v-if="verificationResult.result?.reasoning"
          class="verification-result__reasoning"
        >
          <span>AI Reasoning</span>
          <p>{{ verificationResult.result.reasoning }}</p>
        </div>
        <div
          v-if="verificationResult.oracle?.transactionHash"
          class="verification-result__tx"
        >
          <span>On-Chain Transaction</span>
          <a
            :href="getExplorerUrl(verificationResult.oracle.transactionHash)"
            target="_blank"
            rel="noreferrer"
          >
            {{ truncateHash(verificationResult.oracle.transactionHash) }}
            <Icon name="heroicons:arrow-top-right-on-square" />
          </a>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div
      v-if="isCreator"
      class="verification-actions"
    >
      <button
        v-if="canVerify"
        type="button"
        class="btn btn--primary"
        :disabled="isVerifying || !hasToken"
        @click="triggerVerification"
      >
        <Icon
          v-if="isVerifying"
          name="heroicons:arrow-path"
          class="animate-spin"
        />
        <Icon
          v-else
          name="heroicons:cpu-chip"
        />
        {{ isVerifying ? 'Verifying...' : 'Run AI Verification' }}
      </button>
      <p
        v-if="!hasToken"
        class="verification-actions__notice"
      >
        <Icon name="heroicons:exclamation-triangle" />
        Complete security check above to enable actions.
      </p>
    </div>

    <!-- Upload Modal -->
    <ImageUploadModal
      :is-open="isModalOpen"
      :campaign-id="campaignId"
      @close="closeModal"
      @upload="handleUpload"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageUploadModal from '../forms/ImageUploadModal.vue'
import VerificationStatusBadge from './VerificationStatusBadge.vue'

interface Evidence {
  evidenceId: string
  ipfsCid: string
  ipfsUrl: string
  gatewayUrl: string
  fileName: string
  evidenceType: 'baseline' | 'completion' | 'general'
  verificationStatus: 'pending' | 'processing' | 'verified' | 'rejected'
  verificationResult?: {
    baseline_count: number
    completion_count: number
    meets_criteria: boolean
    confidence: number
    reasoning: string
  }
}

interface VerificationResponse {
  verdict: 'pass' | 'fail'
  verificationStatus: string
  result?: {
    baseline_count: number
    completion_count: number
    meets_criteria: boolean
    confidence: number
    reasoning: string
  }
  oracle?: {
    success: boolean
    transactionHash?: string
    error?: string
    skipped?: boolean
    skipReason?: string
  }
}

const props = defineProps<{
  campaignId: string
  creatorAddress: string
  baselineEvidenceId?: string | null
  completionEvidenceId?: string | null
  chainId?: number
}>()

const emit = defineEmits<{
  (e: 'verified', result: VerificationResponse): void
  (e: 'evidenceUpdated'): void
}>()

const { hasToken } = useTurnstileToken()
const { address: walletAddress } = useWallet()
const toast = useToast()

// State
const isModalOpen = ref(false)
const uploadType = ref<'baseline' | 'completion'>('baseline')
const isVerifying = ref(false)
const verificationResult = ref<VerificationResponse | null>(null)
const baselineEvidence = ref<Evidence | null>(null)
const completionEvidence = ref<Evidence | null>(null)

// Computed
const isCreator = computed(() => {
  return walletAddress.value?.toLowerCase() === props.creatorAddress?.toLowerCase()
})

const hasBaseline = computed(() => !!props.baselineEvidenceId || !!baselineEvidence.value)
const hasCompletion = computed(() => !!props.completionEvidenceId || !!completionEvidence.value)
const isVerified = computed(() => completionEvidence.value?.verificationStatus === 'verified')

const canVerify = computed(() => {
  return hasBaseline.value && hasCompletion.value && !isVerified.value
})

const overallStatus = computed(() => {
  if (verificationResult.value?.verdict === 'pass') return 'verified'
  if (verificationResult.value?.verdict === 'fail') return 'rejected'
  if (isVerifying.value) return 'processing'
  if (hasCompletion.value) return 'ready'
  if (hasBaseline.value) return 'baseline'
  return 'pending'
})

const completionStatusClass = computed(() => {
  const status = completionEvidence.value?.verificationStatus
  return {
    'evidence-slot__status--complete': status === 'verified',
    'evidence-slot__status--rejected': status === 'rejected',
    'evidence-slot__status--processing': status === 'processing',
    'evidence-slot__status--pending': status === 'pending',
  }
})

const completionStatusText = computed(() => {
  const status = completionEvidence.value?.verificationStatus
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'rejected':
      return 'Rejected'
    case 'processing':
      return 'Processing'
    default:
      return 'Pending'
  }
})

const completionStatusIcon = computed(() => {
  const status = completionEvidence.value?.verificationStatus
  switch (status) {
    case 'verified':
      return 'heroicons:check-circle-solid'
    case 'rejected':
      return 'heroicons:x-circle-solid'
    case 'processing':
      return 'heroicons:arrow-path'
    default:
      return 'heroicons:clock'
  }
})

// Methods
function openUploadModal(type: 'baseline' | 'completion') {
  uploadType.value = type
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleUpload(data: {
  ipfsUrl: string
  cid: string
  gatewayUrl?: string
  evidenceId?: string
}) {
  try {
    // Set the evidence as baseline or completion
    const endpoint = `/api/campaigns/${props.campaignId}/${uploadType.value}`

    await $fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Wallet-Address': walletAddress.value || '',
      },
      body: {
        evidenceId: data.evidenceId,
      },
    })

    // Update local state
    const evidence: Evidence = {
      evidenceId: data.evidenceId || '',
      ipfsCid: data.cid,
      ipfsUrl: data.ipfsUrl,
      gatewayUrl: data.gatewayUrl || '',
      fileName: 'evidence.jpg',
      evidenceType: uploadType.value,
      verificationStatus: 'pending',
    }

    if (uploadType.value === 'baseline') {
      baselineEvidence.value = evidence
    } else {
      completionEvidence.value = evidence
    }

    toast.add({
      title: `${uploadType.value === 'baseline' ? 'Baseline' : 'Completion'} Evidence Set`,
      description: 'Evidence linked to campaign successfully.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    emit('evidenceUpdated')
    closeModal()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to set evidence',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
  }
}

async function triggerVerification() {
  if (!canVerify.value || isVerifying.value) return

  isVerifying.value = true
  verificationResult.value = null

  try {
    const result = await $fetch<{ data: VerificationResponse }>(`/api/cre/verify-completion`, {
      method: 'POST',
      headers: {
        'X-Wallet-Address': walletAddress.value || '',
      },
      body: {
        campaignId: props.campaignId,
      },
    })

    verificationResult.value = result.data

    if (completionEvidence.value) {
      completionEvidence.value.verificationStatus = result.data
        .verificationStatus as Evidence['verificationStatus']
      completionEvidence.value.verificationResult = result.data.result
    }

    toast.add({
      title: result.data.verdict === 'pass' ? 'Verification Passed!' : 'Verification Failed',
      description: result.data.result?.reasoning || 'AI analysis complete.',
      icon: result.data.verdict === 'pass' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle',
      color: result.data.verdict === 'pass' ? 'success' : 'error',
    })

    emit('verified', result.data)
  } catch (error) {
    toast.add({
      title: 'Verification Error',
      description: error instanceof Error ? error.message : 'Failed to run verification',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
  } finally {
    isVerifying.value = false
  }
}

function truncateCid(cid: string): string {
  if (!cid) return ''
  return cid.length > 20 ? `${cid.slice(0, 10)}...${cid.slice(-6)}` : cid
}

function truncateHash(hash: string): string {
  if (!hash) return ''
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`
}

function formatScore(result: Evidence['verificationResult']): string {
  if (!result) return '—'
  return `${result.completion_count}/${result.baseline_count}`
}

function formatPercent(value?: number): string {
  if (value === undefined) return '—'
  return `${Math.round(value * 100)}%`
}

function getExplorerUrl(hash: string): string {
  const chainId = props.chainId || 80002
  const baseUrl =
    chainId === 137 ? 'https://polygonscan.com/tx/' : 'https://amoy.polygonscan.com/tx/'
  return `${baseUrl}${hash}`
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/images/placeholder-evidence.png'
}

// Fetch existing evidence on mount
onMounted(async () => {
  if (props.baselineEvidenceId) {
    try {
      const data = await $fetch<{ data: Evidence }>(`/api/evidence/${props.baselineEvidenceId}`)
      baselineEvidence.value = data.data
    } catch {
      // Evidence not found, that's okay
    }
  }
  if (props.completionEvidenceId) {
    try {
      const data = await $fetch<{ data: Evidence }>(`/api/evidence/${props.completionEvidenceId}`)
      completionEvidence.value = data.data
    } catch {
      // Evidence not found, that's okay
    }
  }
})
</script>

<style scoped>
.verification-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-primary);
}

.verification-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.verification-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.verification-card__subtitle {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-top: 0.25rem;
}

/* Progress Steps */
.verification-steps {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 1rem;
  background: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.verification-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  opacity: 0.5;
}

.verification-step--active,
.verification-step--complete {
  opacity: 1;
}

.verification-step__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--surface-tertiary);
  color: var(--text-secondary);
}

.verification-step--complete .verification-step__icon {
  background: var(--color-success-100);
  color: var(--color-success-600);
}

.verification-step--active .verification-step__icon {
  background: var(--color-primary-100);
  color: var(--color-primary-600);
}

.verification-step__content {
  display: flex;
  flex-direction: column;
}

.verification-step__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.verification-step__desc {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.verification-step__connector {
  width: 2rem;
  height: 2px;
  background: var(--border-secondary);
  flex-shrink: 0;
}

/* Evidence Grid */
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .evidence-grid {
    grid-template-columns: 1fr;
  }
}

.evidence-slot {
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.evidence-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--surface-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.evidence-slot__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.evidence-slot__status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
}

.evidence-slot__status--complete {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.evidence-slot__status--rejected {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.evidence-slot__status--processing {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.evidence-slot__status--pending {
  background: var(--surface-tertiary);
  color: var(--text-secondary);
}

.evidence-slot__preview {
  position: relative;
  aspect-ratio: 4/3;
  background: var(--surface-tertiary);
}

.evidence-slot__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.evidence-slot__meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evidence-slot__meta code {
  font-size: var(--text-xs);
  color: white;
}

.evidence-slot__score {
  font-size: var(--text-xs);
  color: white;
  background: var(--color-primary-600);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.evidence-slot__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--text-tertiary);
  text-align: center;
}

.evidence-slot__empty .iconify {
  font-size: 2rem;
}

/* Verification Result */
.verification-result {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.verification-result--pass {
  border: 1px solid var(--color-success-300);
  background: var(--color-success-50);
}

.verification-result--fail {
  border: 1px solid var(--color-error-300);
  background: var(--color-error-50);
}

.verification-result__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: var(--font-weight-semibold);
}

.verification-result--pass .verification-result__header {
  background: var(--color-success-100);
  color: var(--color-success-800);
}

.verification-result--fail .verification-result__header {
  background: var(--color-error-100);
  color: var(--color-error-800);
}

.verification-result__details {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.verification-result__row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
}

.verification-result__row span {
  color: var(--text-secondary);
}

.verification-result__reasoning {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-secondary);
}

.verification-result__reasoning span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.verification-result__reasoning p {
  margin-top: 0.25rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.verification-result__tx {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.verification-result__tx span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.verification-result__tx a {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-sm);
  color: var(--color-primary-600);
}

/* Actions */
.verification-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.verification-actions__notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--color-warning-600);
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
