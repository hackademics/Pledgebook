<template>
  <div class="voucher-detail-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/my-vouches"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to My Vouches
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div>
              <h1 class="page-header__title">Voucher Details</h1>
              <p class="page-header__description">
                View your voucher endorsement and stake information
              </p>
            </div>
            <span
              v-if="voucher"
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
          <span>Loading voucher details...</span>
        </div>

        <div
          v-else-if="error"
          class="error-state"
        >
          <Icon name="heroicons:exclamation-triangle" />
          <span>Unable to load voucher details.</span>
        </div>

        <div
          v-else-if="voucher"
          class="voucher-detail__layout"
        >
          <!-- Overview Card -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:shield-check" />
              Overview
            </h2>
            <div class="detail-card__grid">
              <div>
                <span>Voucher Address</span>
                <code>{{ voucher.voucherAddress }}</code>
              </div>
              <div>
                <span>Stake Amount</span>
                <strong class="detail-card__amount">{{ formattedAmount }}</strong>
              </div>
              <div>
                <span>Vouched At</span>
                <strong>{{ formatDateTime(voucher.vouchedAt) }}</strong>
              </div>
              <div>
                <span>Status</span>
                <span
                  class="status-badge"
                  :class="`status-badge--${statusConfig.color}`"
                >
                  {{ statusConfig.label }}
                </span>
              </div>
            </div>
          </section>

          <!-- Endorsement Message -->
          <section
            v-if="voucher.endorsementMessage"
            class="detail-card"
          >
            <h2>
              <Icon name="heroicons:chat-bubble-left-right" />
              Endorsement Message
            </h2>
            <blockquote class="detail-card__quote">"{{ voucher.endorsementMessage }}"</blockquote>
          </section>

          <!-- Campaign Info -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:flag" />
              Campaign
            </h2>
            <NuxtLink
              :to="`/@${voucher.campaignSlug || voucher.campaignId}`"
              class="detail-card__campaign-link"
            >
              <div class="detail-card__campaign-icon">
                <Icon name="heroicons:flag" />
              </div>
              <div>
                <strong>View Campaign</strong>
                <span>{{ voucher.campaignId }}</span>
              </div>
              <Icon name="heroicons:arrow-right" />
            </NuxtLink>
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
                <code>{{ voucher.stakeTxHash }}</code>
                <a
                  :href="`https://basescan.org/tx/${voucher.stakeTxHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail-card__tx-link"
                >
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
              </div>
              <div
                v-if="voucher.releaseTxHash"
                class="detail-card__tx"
              >
                <span>Release Transaction</span>
                <code>{{ voucher.releaseTxHash }}</code>
                <a
                  :href="`https://basescan.org/tx/${voucher.releaseTxHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail-card__tx-link"
                >
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
              </div>
              <div
                v-if="voucher.slashTxHash"
                class="detail-card__tx detail-card__tx--error"
              >
                <span>Slash Transaction</span>
                <code>{{ voucher.slashTxHash }}</code>
                <a
                  :href="`https://basescan.org/tx/${voucher.slashTxHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail-card__tx-link"
                >
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
              </div>
            </div>
          </section>

          <!-- Rewards & Slashing -->
          <section class="detail-card">
            <h2>
              <Icon name="heroicons:banknotes" />
              Rewards & Slashing
            </h2>
            <div class="detail-card__grid detail-card__grid--3">
              <div class="detail-card__stat detail-card__stat--success">
                <span>Reward Earned</span>
                <strong>{{ formatAmount(voucher.rewardEarned) }}</strong>
              </div>
              <div class="detail-card__stat">
                <span>Reward Claimed</span>
                <strong>{{ formatAmount(voucher.rewardClaimed) }}</strong>
              </div>
              <div
                v-if="voucher.slashAmount && voucher.slashAmount !== '0'"
                class="detail-card__stat detail-card__stat--error"
              >
                <span>Slashed</span>
                <strong>{{ formatAmount(voucher.slashAmount) }}</strong>
              </div>
            </div>
            <p
              v-if="voucher.slashReason"
              class="detail-card__slash-reason"
            >
              <Icon name="heroicons:exclamation-triangle" />
              <span>{{ voucher.slashReason }}</span>
            </p>
          </section>

          <!-- Timestamps -->
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
                  <span>{{ formatDateTime(voucher.createdAt) }}</span>
                </div>
              </div>
              <div class="detail-card__timeline-item">
                <div class="detail-card__timeline-dot detail-card__timeline-dot--success"></div>
                <div>
                  <strong>Vouched</strong>
                  <span>{{ formatDateTime(voucher.vouchedAt) }}</span>
                </div>
              </div>
              <div
                v-if="voucher.releasedAt"
                class="detail-card__timeline-item"
              >
                <div class="detail-card__timeline-dot detail-card__timeline-dot--success"></div>
                <div>
                  <strong>Released</strong>
                  <span>{{ formatDateTime(voucher.releasedAt) }}</span>
                </div>
              </div>
              <div
                v-if="voucher.slashedAt"
                class="detail-card__timeline-item"
              >
                <div class="detail-card__timeline-dot detail-card__timeline-dot--error"></div>
                <div>
                  <strong>Slashed</strong>
                  <span>{{ formatDateTime(voucher.slashedAt) }}</span>
                </div>
              </div>
              <div
                v-if="voucher.expiresAt"
                class="detail-card__timeline-item"
              >
                <div class="detail-card__timeline-dot detail-card__timeline-dot--warning"></div>
                <div>
                  <strong>Expires</strong>
                  <span>{{ formatDateTime(voucher.expiresAt) }}</span>
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
                Withdraw Stake
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
import type { VoucherResponse } from '../../types/voucher'
import { getVoucherStatusConfig, formatVoucherAmount, getVoucherActions } from '../../types/voucher'
import { useVouchers } from '../../composables/useVouchers'
import { PLEDGE_ESCROW_ABI } from '~/config/contracts'
import type { Address } from 'viem'

const route = useRoute()
const voucherId = computed(() => route.params.id as string)

const { getVoucher } = useVouchers()

const { data, pending, error } = await useAsyncData(`voucher-${voucherId.value}`, async () => {
  const response = await getVoucher(voucherId.value)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error?.message || 'Failed to load voucher')
})

const voucher = computed(() => data.value as VoucherResponse | null)

const statusConfig = computed(() => {
  if (!voucher.value) return { label: '', color: 'neutral', icon: 'heroicons:clock' }
  return getVoucherStatusConfig(voucher.value.status)
})

const formattedAmount = computed(() => {
  if (!voucher.value) return '$0.00'
  return formatVoucherAmount(voucher.value.amount)
})

const actions = computed(() => {
  if (!voucher.value) return { canWithdraw: false, canRelease: false, canSlash: false }
  return getVoucherActions(voucher.value.status)
})

const hasActions = computed(() => actions.value.canWithdraw)

function formatAmount(weiAmount: string): string {
  return formatVoucherAmount(weiAmount)
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

const withdrawing = ref(false)
const actionError = ref<string | null>(null)

async function handleWithdraw() {
  if (!voucher.value) return
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
      `/campaigns/${voucher.value.campaignId}`,
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
      functionName: 'claimVoucher',
      args: [],
      account: address.value,
      chain: pc.chain,
    })
    await pc.waitForTransactionReceipt({ hash: txHash })

    const { updateVoucher } = useVouchers()
    await updateVoucher(voucher.value.id, { status: 'withdrawn' })
  } catch (error: unknown) {
    const err = error as { shortMessage?: string; message?: string }
    actionError.value = err.shortMessage || err.message || 'Withdraw failed. Please try again.'
  } finally {
    withdrawing.value = false
  }
}

useSeoMeta({
  title: 'Voucher Details | PledgeBook',
})
</script>

<style scoped>
.voucher-detail-page {
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
.voucher-detail__layout {
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

.detail-card__grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 640px) {
  .detail-card__grid,
  .detail-card__grid--3 {
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
  color: var(--color-success-500) !important;
}

/* Quote */
.detail-card__quote {
  margin: 0;
  padding: 1rem;
  background-color: var(--surface-secondary);
  border-left: 3px solid var(--color-success-500);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-style: italic;
  color: var(--text-secondary);
  line-height: 1.6;
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

.detail-card__tx--error {
  background-color: color-mix(in oklch, var(--color-error-500) 8%, transparent);
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

/* Stats */
.detail-card__stat {
  padding: 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  text-align: center;
}

.detail-card__stat--success {
  background-color: color-mix(in oklch, var(--color-success-500) 8%, transparent);
}

.detail-card__stat--success strong {
  color: var(--color-success-500) !important;
}

.detail-card__stat--error {
  background-color: color-mix(in oklch, var(--color-error-500) 8%, transparent);
}

.detail-card__stat--error strong {
  color: var(--color-error-500) !important;
}

.detail-card__stat span {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
}

.detail-card__stat strong {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.detail-card__slash-reason {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0.75rem;
  background-color: color-mix(in oklch, var(--color-error-500) 8%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-error-600);
}

.detail-card__slash-reason .icon {
  flex-shrink: 0;
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

/* Status Badge (inline) */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge--success {
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-600);
}

.status-badge--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  color: var(--color-warning-600);
}

.status-badge--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-600);
}

.status-badge--info {
  background-color: color-mix(in oklch, var(--color-info-500) 12%, transparent);
  color: var(--color-info-600);
}

.status-badge--neutral {
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

.btn--secondary {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover {
  background-color: var(--surface-hover);
}
</style>
