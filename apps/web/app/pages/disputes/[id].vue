<template>
  <div class="dispute-detail-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/my-disputes"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to My Disputes
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div>
              <h1 class="page-header__title">Dispute Details</h1>
              <p class="page-header__description">View your dispute filing and resolution status</p>
            </div>
            <span
              v-if="dispute"
              class="status-pill"
              :class="`status-pill--${statusConfig.color}`"
            >
              <Icon :name="statusConfig.icon" />
              {{ statusConfig.label }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <div
          v-if="pending"
          class="loading-state"
        >
          <AppSpinner />
          <span>Loading dispute details...</span>
        </div>

        <div
          v-else-if="error"
          class="error-state"
        >
          <Icon name="heroicons:exclamation-triangle" />
          <span>Unable to load dispute details.</span>
        </div>

        <div
          v-else-if="dispute"
          class="dispute-detail__layout"
        >
          <!-- Overview Card -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:flag" />
              Overview
            </h2>
            <div class="detail-card__grid">
              <div>
                <span>Disputer Address</span>
                <code>{{ dispute.disputerAddress }}</code>
              </div>
              <div>
                <span>Stake Amount</span>
                <strong class="detail-card__amount">{{ formattedAmount }}</strong>
              </div>
              <div>
                <span>Dispute Type</span>
                <span
                  class="type-badge"
                  :class="`type-badge--${typeConfig.color}`"
                >
                  <Icon :name="typeConfig.icon" />
                  {{ typeConfig.label }}
                </span>
              </div>
              <div>
                <span>Filed At</span>
                <strong>{{ formatDateTime(dispute.disputedAt) }}</strong>
              </div>
            </div>
          </section>

          <!-- Reason -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:document-text" />
              Reason for Dispute
            </h2>
            <div class="detail-card__reason">
              <p>{{ dispute.reason }}</p>
            </div>
          </section>

          <!-- Evidence -->
          <section
            v-if="dispute.evidence && dispute.evidence.length > 0"
            class="detail-card"
          >
            <h2>
              <Icon name="heroicons:paper-clip" />
              Evidence ({{ dispute.evidence.length }})
            </h2>
            <div class="detail-card__evidence-list">
              <div
                v-for="(item, index) in dispute.evidence"
                :key="index"
                class="detail-card__evidence-item"
              >
                <div class="detail-card__evidence-icon">
                  <Icon :name="getEvidenceIcon(item.type)" />
                </div>
                <div class="detail-card__evidence-content">
                  <span class="detail-card__evidence-type">{{ item.type }}</span>
                  <a
                    v-if="item.type === 'url' || item.type === 'image' || item.type === 'document'"
                    :href="item.content"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="detail-card__evidence-link"
                  >
                    {{ item.content }}
                    <Icon name="heroicons:arrow-top-right-on-square" />
                  </a>
                  <p v-else>{{ item.content }}</p>
                  <span
                    v-if="item.description"
                    class="detail-card__evidence-desc"
                  >
                    {{ item.description }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Campaign Info -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:flag" />
              Campaign
            </h2>
            <NuxtLink
              :to="`/@${dispute.campaignSlug || dispute.campaignId}`"
              class="detail-card__campaign-link"
            >
              <div class="detail-card__campaign-icon">
                <Icon name="heroicons:flag" />
              </div>
              <div>
                <strong>View Campaign</strong>
                <span>{{ dispute.campaignId }}</span>
              </div>
              <Icon name="heroicons:arrow-right" />
            </NuxtLink>
          </section>

          <!-- Resolution (if resolved) -->
          <section
            v-if="dispute.resolutionOutcome"
            class="detail-card"
            :class="{
              'detail-card--success': dispute.resolutionOutcome === 'upheld',
              'detail-card--error': dispute.resolutionOutcome === 'rejected',
              'detail-card--warning': dispute.resolutionOutcome === 'partial',
            }"
          >
            <h2>
              <Icon name="heroicons:scale" />
              Resolution
            </h2>
            <div class="detail-card__resolution">
              <div class="detail-card__resolution-outcome">
                <span
                  class="resolution-badge"
                  :class="`resolution-badge--${dispute.resolutionOutcome}`"
                >
                  <Icon :name="getResolutionIcon(dispute.resolutionOutcome)" />
                  {{ getResolutionLabel(dispute.resolutionOutcome) }}
                </span>
                <span
                  v-if="dispute.resolvedAt"
                  class="detail-card__resolution-date"
                >
                  {{ formatDateTime(dispute.resolvedAt) }}
                </span>
              </div>
              <p
                v-if="dispute.resolutionNotes"
                class="detail-card__resolution-notes"
              >
                {{ dispute.resolutionNotes }}
              </p>
              <div class="detail-card__resolution-stats">
                <div v-if="dispute.stakeReturned !== '0'">
                  <span>Stake Returned</span>
                  <strong class="text-success">{{ formatAmount(dispute.stakeReturned) }}</strong>
                </div>
                <div v-if="dispute.rewardEarned !== '0'">
                  <span>Reward Earned</span>
                  <strong class="text-success">{{ formatAmount(dispute.rewardEarned) }}</strong>
                </div>
                <div v-if="dispute.stakeSlashed !== '0'">
                  <span>Stake Slashed</span>
                  <strong class="text-error">{{ formatAmount(dispute.stakeSlashed) }}</strong>
                </div>
              </div>
            </div>
          </section>

          <!-- Transaction Details -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:link" />
              Transaction Details
            </h2>
            <div class="detail-card__transactions">
              <div class="detail-card__tx">
                <span>Stake Transaction</span>
                <code>{{ dispute.stakeTxHash }}</code>
                <a
                  :href="`https://basescan.org/tx/${dispute.stakeTxHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail-card__tx-link"
                >
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
              </div>
              <div
                v-if="dispute.resolutionTxHash"
                class="detail-card__tx"
              >
                <span>Resolution Transaction</span>
                <code>{{ dispute.resolutionTxHash }}</code>
                <a
                  :href="`https://basescan.org/tx/${dispute.resolutionTxHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail-card__tx-link"
                >
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
              </div>
            </div>
          </section>

          <!-- Timeline -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:clock" />
              Timeline
            </h2>
            <div class="detail-card__timeline">
              <div class="detail-card__timeline-item">
                <div class="detail-card__timeline-dot"></div>
                <div>
                  <strong>Created</strong>
                  <span>{{ formatDateTime(dispute.createdAt) }}</span>
                </div>
              </div>
              <div class="detail-card__timeline-item">
                <div class="detail-card__timeline-dot detail-card__timeline-dot--error"></div>
                <div>
                  <strong>Disputed</strong>
                  <span>{{ formatDateTime(dispute.disputedAt) }}</span>
                </div>
              </div>
              <div
                v-if="dispute.resolvedAt"
                class="detail-card__timeline-item"
              >
                <div
                  class="detail-card__timeline-dot"
                  :class="{
                    'detail-card__timeline-dot--success': dispute.resolutionOutcome === 'upheld',
                    'detail-card__timeline-dot--error': dispute.resolutionOutcome === 'rejected',
                    'detail-card__timeline-dot--warning': dispute.resolutionOutcome === 'partial',
                  }"
                ></div>
                <div>
                  <strong>Resolved</strong>
                  <span>{{ formatDateTime(dispute.resolvedAt) }}</span>
                </div>
              </div>
              <div
                v-if="dispute.expiresAt && !dispute.resolvedAt"
                class="detail-card__timeline-item"
              >
                <div class="detail-card__timeline-dot detail-card__timeline-dot--warning"></div>
                <div>
                  <strong>Expires</strong>
                  <span>{{ formatDateTime(dispute.expiresAt) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Actions -->
          <section
            v-if="hasActions"
            class="detail-card detail-card--actions"
          >
            <h2>
              <Icon name="heroicons:cog-6-tooth" />
              Actions
            </h2>
            <div class="detail-card__action-buttons">
              <button
                v-if="actions.canWithdraw"
                type="button"
                class="btn btn--secondary"
                @click="handleWithdraw"
              >
                <Icon name="heroicons:arrow-uturn-left" />
                Withdraw Dispute
              </button>
              <button
                v-if="actions.canAddEvidence"
                type="button"
                class="btn btn--primary"
                @click="handleAddEvidence"
              >
                <Icon name="heroicons:paper-clip" />
                Add Evidence
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useAsyncData, useSeoMeta } from 'nuxt/app'
import type { DisputerResponse, EvidenceItem, ResolutionOutcome } from '../../types/disputer'
import {
  getDisputerStatusConfig,
  getDisputeTypeConfig,
  formatDisputerAmount,
  getDisputerActions,
} from '../../types/disputer'
import { useDisputers } from '../../composables/useDisputers'
import { PLEDGE_ESCROW_ABI } from '~/config/contracts'
import type { Address } from 'viem'

const route = useRoute()
const disputeId = computed(() => route.params.id as string)

const { getDispute } = useDisputers()

const { data, pending, error } = await useAsyncData(`dispute-${disputeId.value}`, async () => {
  const response = await getDispute(disputeId.value)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error?.message || 'Failed to load dispute')
})

const dispute = computed(() => data.value as DisputerResponse | null)

const statusConfig = computed(() => {
  if (!dispute.value) return { label: '', color: 'neutral', icon: 'heroicons:clock' }
  return getDisputerStatusConfig(dispute.value.status)
})

const typeConfig = computed(() => {
  if (!dispute.value) return { label: '', icon: 'heroicons:flag', color: 'info', description: '' }
  return getDisputeTypeConfig(dispute.value.disputeType)
})

const formattedAmount = computed(() => {
  if (!dispute.value) return '$0.00'
  return formatDisputerAmount(dispute.value.amount)
})

const actions = computed(() => {
  if (!dispute.value) return { canWithdraw: false, canAddEvidence: false, canResolve: false }
  return getDisputerActions(dispute.value.status)
})

const hasActions = computed(() => actions.value.canWithdraw || actions.value.canAddEvidence)

function formatAmount(weiAmount: string): string {
  return formatDisputerAmount(weiAmount)
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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

function getResolutionIcon(outcome: ResolutionOutcome): string {
  const icons: Record<ResolutionOutcome, string> = {
    upheld: 'heroicons:check-circle',
    rejected: 'heroicons:x-circle',
    partial: 'heroicons:minus-circle',
  }
  return icons[outcome]
}

function getResolutionLabel(outcome: ResolutionOutcome): string {
  const labels: Record<ResolutionOutcome, string> = {
    upheld: 'Dispute Upheld',
    rejected: 'Dispute Rejected',
    partial: 'Partially Upheld',
  }
  return labels[outcome]
}

const withdrawing = ref(false)
const submittingEvidence = ref(false)
const actionError = ref<string | null>(null)

async function handleWithdraw() {
  if (!dispute.value) return
  const { address, isCorrectNetwork, switchToCorrectNetwork, getPublicClient, getWalletClient } =
    useWallet()
  if (!address.value) {
    actionError.value = 'Please connect your wallet first.'
    return
  }
  if (!isCorrectNetwork.value) {
    const switched = await switchToCorrectNetwork()
    if (!switched) {
      actionError.value = 'Please switch to the correct network.'
      return
    }
  }

  withdrawing.value = true
  actionError.value = null

  try {
    const api = useApi()
    const campaignRes = await api.get<{ escrowAddress: string | null }>(
      `/campaigns/${dispute.value.campaignId}`,
    )
    const escrowAddress = campaignRes.data?.escrowAddress
    if (!escrowAddress) {
      actionError.value = 'Campaign escrow address not found.'
      return
    }

    const pc = getPublicClient()
    const wc = getWalletClient()
    if (!pc || !wc) {
      actionError.value = 'Wallet client unavailable. Please reconnect.'
      return
    }

    const txHash = await wc.writeContract({
      address: escrowAddress as Address,
      abi: PLEDGE_ESCROW_ABI,
      functionName: 'claimDisputeStake',
      args: [],
      account: address.value,
      chain: pc.chain,
    })
    await pc.waitForTransactionReceipt({ hash: txHash })

    const { updateDispute } = useDisputers()
    await updateDispute(dispute.value.id, { status: 'withdrawn' })
  } catch (error: unknown) {
    const err = error as { shortMessage?: string; message?: string }
    actionError.value = err.shortMessage || err.message || 'Withdraw failed. Please try again.'
  } finally {
    withdrawing.value = false
  }
}

async function handleAddEvidence() {
  if (!dispute.value) return
  submittingEvidence.value = true
  actionError.value = null

  try {
    // Open a file picker and upload evidence
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf,.doc,.docx'

    const file = await new Promise<File | null>((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null)
      input.click()
    })

    if (!file) {
      submittingEvidence.value = false
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('disputeId', dispute.value.id)

    const response = await $fetch<{ success: boolean; data?: { url: string } }>(
      '/api/upload/evidence',
      {
        method: 'POST',
        body: formData,
      },
    )

    if (response.success && response.data) {
      const { updateDispute } = useDisputers()
      await updateDispute(dispute.value.id, {
        evidence: [
          ...(dispute.value.evidence || []),
          {
            type: 'document' as const,
            content: response.data.url,
            submittedAt: new Date().toISOString(),
          },
        ],
      } as Record<string, unknown>)
    }
  } catch (error: unknown) {
    const err = error as { shortMessage?: string; message?: string }
    actionError.value = err.shortMessage || err.message || 'Failed to add evidence.'
  } finally {
    submittingEvidence.value = false
  }
}

useSeoMeta({
  title: 'Dispute Details | PledgeBook',
})
</script>

<style scoped>
.dispute-detail-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1.5rem 0;
}

.page-header__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header__breadcrumb {
  margin-bottom: 0.5rem;
}

.page-header__breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.page-header__breadcrumb-link:hover {
  color: var(--interactive-primary);
}

.page-header__breadcrumb-icon {
  width: 1rem;
  height: 1rem;
}

.page-header__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.page-header__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.page-header__description {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0.25rem 0 0;
}

.page-main {
  padding: 2rem 0;
}

.container-app {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Loading/Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.error-state {
  color: var(--color-error-500);
}

.error-state .icon {
  width: 2rem;
  height: 2rem;
}

/* Layout */
.dispute-detail__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Detail Card */
.detail-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
}

.detail-card--success {
  border-color: var(--color-success-500);
  background-color: color-mix(in oklch, var(--color-success-500) 3%, var(--bg-primary));
}

.detail-card--error {
  border-color: var(--color-error-500);
  background-color: color-mix(in oklch, var(--color-error-500) 3%, var(--bg-primary));
}

.detail-card--warning {
  border-color: var(--color-warning-500);
  background-color: color-mix(in oklch, var(--color-warning-500) 3%, var(--bg-primary));
}

.detail-card h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.detail-card h2 .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-tertiary);
}

.detail-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .detail-card__grid {
    grid-template-columns: 1fr;
  }
}

.detail-card__grid > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-card__grid > div > span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-card__grid > div > strong {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.detail-card__grid > div > code {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  word-break: break-all;
}

.detail-card__amount {
  font-size: var(--text-xl);
  color: var(--color-error-500) !important;
}

/* Type Badge */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.type-badge .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.type-badge--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-600);
}

.type-badge--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  color: var(--color-warning-600);
}

.type-badge--info {
  background-color: color-mix(in oklch, var(--color-info-500) 12%, transparent);
  color: var(--color-info-600);
}

/* Reason */
.detail-card__reason {
  padding: 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.detail-card__reason p {
  margin: 0;
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Evidence */
.detail-card__evidence-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-card__evidence-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.detail-card__evidence-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-tertiary);
}

.detail-card__evidence-icon .icon {
  width: 1rem;
  height: 1rem;
}

.detail-card__evidence-content {
  flex: 1;
  min-width: 0;
}

.detail-card__evidence-type {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.detail-card__evidence-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  color: var(--interactive-primary);
  text-decoration: none;
  word-break: break-all;
}

.detail-card__evidence-link .icon {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
}

.detail-card__evidence-link:hover {
  text-decoration: underline;
}

.detail-card__evidence-content p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.detail-card__evidence-desc {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

/* Campaign Link */
.detail-card__campaign-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.detail-card__campaign-link:hover {
  background-color: var(--surface-hover);
}

.detail-card__campaign-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  color: var(--interactive-primary);
}

.detail-card__campaign-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.detail-card__campaign-link > div {
  flex: 1;
}

.detail-card__campaign-link strong {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.detail-card__campaign-link span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.detail-card__campaign-link > .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

/* Resolution */
.detail-card__resolution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card__resolution-outcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.resolution-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.resolution-badge .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.resolution-badge--upheld {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.resolution-badge--rejected {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.resolution-badge--partial {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.detail-card__resolution-date {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.detail-card__resolution-notes {
  margin: 0;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.detail-card__resolution-stats {
  display: flex;
  gap: 1.5rem;
}

.detail-card__resolution-stats > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-card__resolution-stats span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.detail-card__resolution-stats strong {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}

.text-success {
  color: var(--color-success-500);
}

.text-error {
  color: var(--color-error-500);
}

/* Transactions */
.detail-card__transactions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-card__tx {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.detail-card__tx > span {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.detail-card__tx > code {
  flex: 1;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-card__tx-link {
  flex-shrink: 0;
  color: var(--interactive-primary);
}

.detail-card__tx-link .icon {
  width: 1rem;
  height: 1rem;
}

/* Timeline */
.detail-card__timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 0.5rem;
}

.detail-card__timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-left: 2px solid var(--border-primary);
  margin-left: 0.25rem;
  padding-left: 1rem;
}

.detail-card__timeline-item:first-child {
  padding-top: 0;
}

.detail-card__timeline-item:last-child {
  padding-bottom: 0;
}

.detail-card__timeline-dot {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: var(--border-secondary);
  margin-left: -1.375rem;
  margin-top: 0.25rem;
}

.detail-card__timeline-dot--success {
  background-color: var(--color-success-500);
}

.detail-card__timeline-dot--error {
  background-color: var(--color-error-500);
}

.detail-card__timeline-dot--warning {
  background-color: var(--color-warning-500);
}

.detail-card__timeline-item > div {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-card__timeline-item strong {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.detail-card__timeline-item span {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Actions */
.detail-card--actions {
  background-color: var(--surface-secondary);
}

.detail-card__action-buttons {
  display: flex;
  gap: 0.75rem;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.status-pill .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.status-pill--success {
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-600);
}

.status-pill--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  color: var(--color-warning-600);
}

.status-pill--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-600);
}

.status-pill--info {
  background-color: color-mix(in oklch, var(--color-info-500) 12%, transparent);
  color: var(--color-info-600);
}

.status-pill--neutral {
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn .icon {
  width: 1rem;
  height: 1rem;
}

.btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover {
  background-color: var(--interactive-primary-hover);
}

.btn--secondary {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover {
  background-color: var(--surface-hover);
}
</style>
