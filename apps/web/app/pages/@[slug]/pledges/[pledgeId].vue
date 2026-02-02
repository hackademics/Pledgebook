<template>
  <div class="pledge-receipt-page">
    <!-- Header Bar -->
    <header class="receipt-header">
      <div class="container-app">
        <div class="receipt-header__row">
          <NuxtLink
            :to="`/@${campaignSlug}`"
            class="receipt-header__back"
          >
            <Icon name="heroicons:arrow-left" />
            <span>Back to Campaign</span>
          </NuxtLink>
          <div class="receipt-header__actions">
            <button
              type="button"
              class="btn btn--ghost btn--sm"
              @click="copyLink"
            >
              <Icon name="heroicons:link" />
              <span class="btn__label-desktop">Copy Link</span>
            </button>
            <button
              type="button"
              class="btn btn--ghost btn--sm"
              @click="shareReceipt"
            >
              <Icon name="heroicons:share" />
              <span class="btn__label-desktop">Share</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="receipt-main">
      <div class="container-app">
        <div class="receipt-content">
          <div
            v-if="toastMessage"
            class="receipt-toast"
            role="status"
            aria-live="polite"
          >
            <Icon name="heroicons:check-circle" />
            <span>{{ toastMessage }}</span>
          </div>
          <!-- Success Animation -->
          <div
            v-if="pledge.status === 'confirmed' || pledge.status === 'active'"
            class="receipt-success"
          >
            <div class="receipt-success__icon">
              <Icon name="heroicons:check-circle" />
            </div>
            <h1 class="receipt-success__title">Pledge Confirmed!</h1>
            <p class="receipt-success__message">Thank you for supporting this campaign</p>
          </div>

          <!-- Pending State -->
          <div
            v-else-if="pledge.status === 'pending'"
            class="receipt-pending"
          >
            <div class="receipt-pending__icon">
              <Icon name="heroicons:clock" />
            </div>
            <h1 class="receipt-pending__title">Confirming Transaction...</h1>
            <p class="receipt-pending__message">
              Waiting for {{ 3 - pledge.confirmations }} more confirmation(s)
            </p>
            <div class="receipt-pending__progress">
              <div
                class="receipt-pending__bar"
                :style="{ width: `${(pledge.confirmations / 3) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Receipt Card -->
          <div class="receipt-card">
            <div class="receipt-card__header">
              <div class="receipt-card__badge">
                <Icon :name="statusConfig.icon" />
                {{ statusConfig.label }}
              </div>
              <span class="receipt-card__date">
                {{ formatDate(pledge.pledgedAt) }}
              </span>
            </div>

            <div class="receipt-card__amount">
              <span class="receipt-card__amount-label">Amount Pledged</span>
              <span class="receipt-card__amount-value">
                {{ formattedAmount }}
              </span>
            </div>

            <div class="receipt-card__divider"></div>

            <!-- Campaign Info -->
            <div class="receipt-card__campaign">
              <img
                :src="campaign.coverImage"
                :alt="campaign.title"
                class="receipt-card__campaign-image"
              />
              <div class="receipt-card__campaign-info">
                <span class="receipt-card__campaign-label">Campaign</span>
                <NuxtLink
                  :to="`/@${campaignSlug}`"
                  class="receipt-card__campaign-title"
                >
                  {{ campaign.title }}
                </NuxtLink>
                <span class="receipt-card__campaign-creator"> by {{ campaign.creator }} </span>
              </div>
            </div>

            <div class="receipt-card__divider"></div>

            <!-- Transaction Details -->
            <div class="receipt-card__details">
              <h3 class="receipt-card__section-title">Transaction Details</h3>
              <div class="receipt-card__detail">
                <span class="receipt-card__detail-label">Transaction Hash</span>
                <a
                  :href="explorerLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="receipt-card__detail-link"
                >
                  {{ truncatedTxHash }}
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
              </div>
              <div
                v-if="pledge.blockNumber"
                class="receipt-card__detail"
              >
                <span class="receipt-card__detail-label">Block Number</span>
                <span class="receipt-card__detail-value">
                  {{ pledge.blockNumber.toLocaleString() }}
                </span>
              </div>
              <div class="receipt-card__detail">
                <span class="receipt-card__detail-label">Confirmations</span>
                <span class="receipt-card__detail-value"> {{ pledge.confirmations }} / 3 </span>
              </div>
              <div class="receipt-card__detail">
                <span class="receipt-card__detail-label">Network</span>
                <span class="receipt-card__detail-value"> Base (Mainnet) </span>
              </div>
            </div>

            <!-- Message -->
            <div
              v-if="pledge.message"
              class="receipt-card__message"
            >
              <h3 class="receipt-card__section-title">Your Message</h3>
              <p class="receipt-card__message-text">"{{ pledge.message }}"</p>
            </div>

            <!-- Yield Info -->
            <div
              v-if="pledge.yieldEarned !== '0'"
              class="receipt-card__yield"
            >
              <div class="receipt-card__yield-info">
                <Icon name="heroicons:sparkles" />
                <div>
                  <span class="receipt-card__yield-label">Yield Earned</span>
                  <span class="receipt-card__yield-value">
                    {{ formatYield(pledge.yieldEarned) }}
                  </span>
                </div>
              </div>
              <span class="receipt-card__yield-note">
                Yield accrues while funds are in escrow
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="receipt-actions">
            <NuxtLink
              :to="`/@${campaignSlug}`"
              class="btn btn--secondary"
            >
              <Icon name="heroicons:arrow-left" />
              Back to Campaign
            </NuxtLink>
            <NuxtLink
              :to="`/@${campaignSlug}/pledges`"
              class="btn btn--ghost"
            >
              View All Pledges
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSeoMeta } from 'nuxt/app'
import { getPledgeStatusConfig, formatPledgeAmount } from '../../../types/pledge'
import type { PledgeStatus } from '../../../types/pledge'

const route = useRoute()
const campaignSlug = route.params.slug as string
const pledgeId = route.params.pledgeId as string

useSeoMeta({
  title: 'Pledge Receipt | Pledgebook',
  description: 'View your pledge transaction details and receipt.',
})

// Mock data - replace with actual API call
const pledge = reactive({
  id: pledgeId,
  campaignId: campaignSlug,
  pledgerAddress: '0x1234567890abcdef1234567890abcdef12345678',
  amount: '100000000', // 100 USDC in wei (6 decimals)
  message: 'Happy to support this important initiative!',
  status: 'confirmed' as PledgeStatus,
  txHash: '0x9a3f5c8b7d1e4b6c2f0a6e3d9b8c7f1a4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9',
  blockNumber: 18432567,
  blockTimestamp: '2026-01-31T12:00:00Z',
  confirmations: 3,
  confirmedAt: '2026-01-31T12:05:00Z',
  releaseTxHash: null,
  refundTxHash: null,
  releasedAt: null,
  refundedAt: null,
  yieldEarned: '150000', // 0.15 USDC
  yieldClaimed: '0',
  isAnonymous: false,
  createdAt: '2026-01-31T12:00:00Z',
  pledgedAt: '2026-01-31T12:00:00Z',
})

const campaign = reactive({
  title: 'Clean Water Access Initiative',
  creator: 'Amina A.',
  coverImage:
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80',
})

const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

// Computed
const statusConfig = computed(() => getPledgeStatusConfig(pledge.status))

const formattedAmount = computed(() => formatPledgeAmount(pledge.amount))

const truncatedTxHash = computed(() => {
  const hash = pledge.txHash
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
})

const explorerLink = computed(() => {
  return `https://basescan.org/tx/${pledge.txHash}`
})

// Methods
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatYield(weiAmount: string): string {
  return formatPledgeAmount(weiAmount, 4)
}

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2200)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showToast('Link copied')
  } catch {
    showToast('Unable to copy link')
  }
}

async function shareReceipt() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Pledge Receipt',
        text: `I just pledged ${formattedAmount.value} to ${campaign.title}!`,
        url: window.location.href,
      })
      showToast('Shared successfully')
    } catch {
      showToast('Share cancelled')
    }
    return
  }
  await copyLink()
}
</script>

<style scoped>
.pledge-receipt-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Header */
.receipt-header {
  position: sticky;
  top: var(--header-total-height);
  z-index: 50;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0.625rem 0;
}

.receipt-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.receipt-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.receipt-header__back:hover {
  color: var(--text-primary);
}

.receipt-header__back .icon {
  width: 1rem;
  height: 1rem;
}

.receipt-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Main Content */
.receipt-main {
  padding: 2rem 0 3rem;
}

.receipt-content {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.receipt-toast {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-full);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  box-shadow: var(--shadow-sm);
  align-self: flex-start;
}

.receipt-toast .icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-success-600);
}

/* Success State */
.receipt-success {
  text-align: center;
  padding: 1rem 0;
}

.receipt-success__icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.receipt-success__icon .icon {
  width: 2.5rem;
  height: 2.5rem;
}

.receipt-success__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.receipt-success__message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Pending State */
.receipt-pending {
  text-align: center;
  padding: 1rem 0;
}

.receipt-pending__icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
  animation: pulse 2s ease-in-out infinite;
}

.receipt-pending__icon .icon {
  width: 2.5rem;
  height: 2.5rem;
}

.receipt-pending__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.receipt-pending__message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.receipt-pending__progress {
  width: 100%;
  max-width: 200px;
  height: 4px;
  margin: 0 auto;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.receipt-pending__bar {
  height: 100%;
  background-color: var(--color-warning-500);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Receipt Card */
.receipt-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.receipt-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.receipt-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.receipt-card__badge .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.receipt-card__date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.receipt-card__amount {
  text-align: center;
  padding: 1rem 0;
}

.receipt-card__amount-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.25rem;
}

.receipt-card__amount-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--interactive-primary);
  line-height: 1.1;
}

.receipt-card__divider {
  height: 1px;
  background-color: var(--border-primary);
}

/* Campaign Info */
.receipt-card__campaign {
  display: flex;
  gap: 0.875rem;
  align-items: center;
}

.receipt-card__campaign-image {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.receipt-card__campaign-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.receipt-card__campaign-label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.receipt-card__campaign-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.receipt-card__campaign-title:hover {
  color: var(--interactive-primary);
}

.receipt-card__campaign-creator {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Transaction Details */
.receipt-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.receipt-card__section-title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0 0 0.25rem;
}

.receipt-card__detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.receipt-card__detail-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.receipt-card__detail-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.receipt-card__detail-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
  font-family: var(--font-mono);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.receipt-card__detail-link:hover {
  opacity: 0.8;
}

.receipt-card__detail-link .icon {
  width: 0.75rem;
  height: 0.75rem;
}

/* Message */
.receipt-card__message {
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.receipt-card__message-text {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-style: italic;
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Yield Info */
.receipt-card__yield {
  padding: 0.875rem 1rem;
  background-color: color-mix(in oklch, var(--interactive-primary) 8%, transparent);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.receipt-card__yield-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.receipt-card__yield-info > .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--interactive-primary);
}

.receipt-card__yield-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.receipt-card__yield-value {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--interactive-primary);
}

.receipt-card__yield-note {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Actions */
.receipt-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  text-decoration: none;
}

.btn .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.btn--sm {
  padding: 0.375rem 0.625rem;
  font-size: var(--text-xs);
}

.btn--sm .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.btn--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover {
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}

.btn--ghost {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn--ghost:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.btn__label-desktop {
  display: none;
}

@media (min-width: 640px) {
  .btn__label-desktop {
    display: inline;
  }
}
</style>
