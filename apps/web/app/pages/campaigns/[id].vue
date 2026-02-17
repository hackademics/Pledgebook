<template>
  <div class="campaign-detail-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/campaigns"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Campaigns
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div>
              <h1 class="page-header__title">
                {{ campaign?.name || 'Campaign' }}
              </h1>
              <p class="page-header__description">
                {{ campaign?.purpose || 'Campaign details and verification results.' }}
              </p>
            </div>
            <span
              v-if="campaign"
              class="status-pill"
              :class="`status-pill--${campaign.status}`"
            >
              {{ campaign.status }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <div
          v-if="campaignPending"
          class="loading-state"
        >
          Loading campaign...
        </div>

        <div
          v-else-if="campaignError"
          class="error-state"
        >
          <Icon name="heroicons:exclamation-triangle" />
          <span>Unable to load this campaign.</span>
        </div>

        <div
          v-else-if="campaign"
          class="campaign-detail__layout"
        >
          <section class="detail-card">
            <h2>Overview</h2>
            <div class="detail-card__grid">
              <div>
                <span>Creator</span>
                <code>{{ campaign.creatorAddress }}</code>
              </div>
              <div>
                <span>Goal</span>
                <strong>{{ formatAmount(campaign.fundraisingGoal) }} USDC</strong>
              </div>
              <div>
                <span>Amount Pledged</span>
                <strong>{{ formatAmount(campaign.amountPledged) }} USDC</strong>
              </div>
              <div>
                <span>End Date</span>
                <strong>{{ formatDate(campaign.endDate) }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <h2>Verification Setup</h2>
            <p>{{ campaign.rulesAndResolution }}</p>
            <div class="detail-card__grid">
              <div>
                <span>Privacy Mode</span>
                <strong>{{ campaign.privacyMode ? 'Enabled' : 'Disabled' }}</strong>
              </div>
              <div>
                <span>Consensus Threshold</span>
                <strong>{{ Math.round(campaign.consensusThreshold * 100) }}%</strong>
              </div>
              <div>
                <span>Verified</span>
                <strong>{{ campaign.isVerified ? 'Yes' : 'No' }}</strong>
              </div>
              <div>
                <span>Disputed</span>
                <strong>{{ campaign.isDisputed ? 'Yes' : 'No' }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <h2>Hashes & Results</h2>
            <div class="detail-card__hashes">
              <div>
                <span>Prompt Hash</span>
                <code>{{ campaign.promptHash }}</code>
              </div>
              <div>
                <span>Baseline Data</span>
                <pre>{{ formatJson(campaign.baselineData) }}</pre>
              </div>
              <div>
                <span>Consensus Results</span>
                <p class="detail-card__muted">
                  Consensus results will appear after CRE evaluation completes.
                </p>
              </div>
            </div>
          </section>

          <section class="detail-card detail-card--split">
            <div>
              <h2>Security Check</h2>
              <p class="detail-card__muted">
                Complete this check before pledging, vouching, disputing, or uploading evidence.
              </p>
              <TurnstileWidget
                ref="turnstileRef"
                action="campaign_action"
                @verified="handleTurnstileVerified"
                @expired="handleTurnstileExpired"
                @error="handleTurnstileError"
              />
            </div>
            <div class="detail-card__summary">
              <Icon name="heroicons:shield-check" />
              <span>{{ hasToken ? 'Verified' : 'Not verified yet' }}</span>
            </div>
          </section>

          <EvidenceUploadCard :campaign-id="resolvedCampaignId" />

          <section class="detail-card">
            <h2>Wallet Actions</h2>
            <div class="action-grid">
              <form
                class="action-card"
                @submit.prevent="submitPledge"
              >
                <h3>Pledge</h3>
                <label>
                  Amount (wei)
                  <input
                    v-model="pledgeForm.amount"
                    type="text"
                    required
                  />
                </label>
                <label>
                  Transaction Hash
                  <input
                    v-model="pledgeForm.txHash"
                    type="text"
                    required
                  />
                </label>
                <label>
                  Message
                  <textarea
                    v-model="pledgeForm.message"
                    rows="2"
                  ></textarea>
                </label>
                <label class="checkbox">
                  <input
                    v-model="pledgeForm.isAnonymous"
                    type="checkbox"
                  />
                  Anonymous pledge
                </label>
                <button
                  type="submit"
                  class="btn btn--primary"
                  :disabled="pledgeSubmitting"
                >
                  {{ pledgeSubmitting ? 'Submitting...' : 'Submit Pledge' }}
                </button>
              </form>

              <div class="action-card action-card--modal">
                <h3>
                  <Icon name="heroicons:shield-check" />
                  Vouch for Campaign
                </h3>
                <p class="action-card__description">
                  Stake your reputation to endorse this campaign's legitimacy.
                </p>
                <button
                  type="button"
                  class="btn btn--success"
                  :disabled="!hasToken"
                  @click="showVouchModal = true"
                >
                  <Icon name="heroicons:hand-thumb-up" />
                  Vouch Now
                </button>
              </div>

              <div class="action-card action-card--modal">
                <h3>
                  <Icon name="heroicons:flag" />
                  File a Dispute
                </h3>
                <p class="action-card__description">
                  Report concerns about this campaign's legitimacy or rule violations.
                </p>
                <button
                  type="button"
                  class="btn btn--danger"
                  :disabled="!hasToken"
                  @click="showDisputeModal = true"
                >
                  <Icon name="heroicons:exclamation-triangle" />
                  File Dispute
                </button>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <div class="detail-card__header">
              <h2>Campaign Activity</h2>
            </div>
            <div class="activity-grid">
              <div class="activity-column">
                <div class="activity-column__header">
                  <Icon name="heroicons:banknotes" />
                  <h3>Pledges</h3>
                  <span class="activity-count">{{ pledges.length }}</span>
                </div>
                <ul v-if="pledges.length">
                  <li
                    v-for="pledge in pledges"
                    :key="pledge.id"
                  >
                    <span class="activity-amount">{{ formatAmount(pledge.amount) }} wei</span>
                    <span class="activity-date">{{ formatDate(pledge.pledgedAt) }}</span>
                  </li>
                </ul>
                <p
                  v-else
                  class="activity-empty"
                >
                  No pledges yet
                </p>
              </div>

              <div class="activity-column">
                <div class="activity-column__header">
                  <Icon name="heroicons:shield-check" />
                  <h3>Vouches</h3>
                  <span class="activity-count">{{ vouchers.length }}</span>
                  <NuxtLink
                    v-if="vouchers.length"
                    :to="`/campaigns/${resolvedCampaignId}/vouchers`"
                    class="activity-link"
                  >
                    View all
                  </NuxtLink>
                </div>
                <ul v-if="vouchers.length">
                  <li
                    v-for="voucher in vouchers"
                    :key="voucher.id"
                  >
                    <NuxtLink
                      :to="`/vouchers/${voucher.id}`"
                      class="activity-item-link"
                    >
                      <span class="activity-amount">{{ formatAmount(voucher.amount) }} wei</span>
                      <span
                        class="status-pill status-pill--sm"
                        :class="`status-pill--${voucher.status}`"
                      >
                        {{ voucher.status }}
                      </span>
                    </NuxtLink>
                  </li>
                </ul>
                <p
                  v-else
                  class="activity-empty"
                >
                  No vouches yet
                </p>
              </div>

              <div class="activity-column">
                <div class="activity-column__header">
                  <Icon name="heroicons:flag" />
                  <h3>Disputes</h3>
                  <span class="activity-count">{{ disputes.length }}</span>
                  <NuxtLink
                    v-if="disputes.length"
                    :to="`/campaigns/${resolvedCampaignId}/disputes`"
                    class="activity-link"
                  >
                    View all
                  </NuxtLink>
                </div>
                <ul v-if="disputes.length">
                  <li
                    v-for="dispute in disputes"
                    :key="dispute.id"
                  >
                    <NuxtLink
                      :to="`/disputes/${dispute.id}`"
                      class="activity-item-link"
                    >
                      <span class="activity-type">{{ dispute.disputeType }}</span>
                      <span
                        class="status-pill status-pill--sm"
                        :class="`status-pill--${dispute.status}`"
                      >
                        {{ dispute.status }}
                      </span>
                    </NuxtLink>
                  </li>
                </ul>
                <p
                  v-else
                  class="activity-empty"
                >
                  No disputes filed
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Vouch Modal -->
    <VouchModal
      v-if="campaign"
      v-model:visible="showVouchModal"
      :campaign-id="resolvedCampaignId"
      :campaign-title="campaign.name"
      :campaign-slug="campaign.slug || ''"
      @success="handleVouchSuccess"
    />

    <!-- Dispute Modal -->
    <DisputeModal
      v-if="campaign"
      v-model:visible="showDisputeModal"
      :campaign-id="resolvedCampaignId"
      :campaign-title="campaign.name"
      :campaign-slug="campaign.slug || ''"
      @success="handleDisputeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CampaignResponse } from '~~/server/domains/campaigns'
import type { PledgeSummary } from '~/types/pledge'
import type { VoucherSummary } from '~/types/voucher'
import type { DisputerSummary } from '~/types/disputer'
import TurnstileWidget from '../../components/common/TurnstileWidget.vue'
import EvidenceUploadCard from '../../components/evidence/EvidenceUploadCard.vue'
import VouchModal from '../../components/VouchModal.vue'
import DisputeModal from '../../components/DisputeModal.vue'

const route = useRoute()
const toast = useToast()
const { isConnected, address } = useWallet()
const { token: turnstileToken, hasToken, setToken, clearToken } = useTurnstileToken()

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const campaignId = computed(() => String(route.params.id || ''))

// Modal states
const showVouchModal = ref(false)
const showDisputeModal = ref(false)

const {
  data: campaignResponse,
  pending: campaignPending,
  error: campaignError,
  refresh: refreshCampaign,
} = useFetch(() => `/api/campaigns/${campaignId.value}`)

const campaign = computed(
  () => (campaignResponse.value as { data?: CampaignResponse } | null)?.data,
)
const resolvedCampaignId = computed(() => campaign.value?.id || campaignId.value)

const { data: pledgesResponse, refresh: refreshPledges } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/pledges?limit=5`,
)
const { data: vouchersResponse, refresh: refreshVouchers } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/vouchers?limit=5`,
)
const { data: disputesResponse, refresh: refreshDisputes } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/disputers?limit=5`,
)

const pledges = computed(
  () =>
    ((pledgesResponse.value as { data?: PledgeSummary[] } | null)?.data || []) as PledgeSummary[],
)
const vouchers = computed(
  () =>
    ((vouchersResponse.value as { data?: VoucherSummary[] } | null)?.data ||
      []) as VoucherSummary[],
)
const disputes = computed(
  () =>
    ((disputesResponse.value as { data?: DisputerSummary[] } | null)?.data ||
      []) as DisputerSummary[],
)

const pledgeForm = ref({
  amount: '',
  txHash: '',
  message: '',
  isAnonymous: false,
})

const pledgeSubmitting = ref(false)

function handleTurnstileVerified(token: string): void {
  setToken(token)
}

function handleTurnstileExpired(): void {
  clearToken()
  toast.add({
    title: 'Verification Expired',
    description: 'Please complete the security check again.',
    icon: 'i-heroicons-exclamation-triangle',
    color: 'warning',
  })
}

function handleTurnstileError(message: string): void {
  toast.add({
    title: 'Verification Error',
    description: message,
    icon: 'i-heroicons-exclamation-circle',
    color: 'error',
  })
}

function ensureWalletAndToken(): boolean {
  if (!isConnected.value || !address.value) {
    toast.add({
      title: 'Wallet Required',
      description: 'Connect your wallet to perform this action.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning',
    })
    return false
  }

  if (!turnstileToken.value) {
    toast.add({
      title: 'Verification Required',
      description: 'Complete the security check before submitting.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning',
    })
    return false
  }

  return true
}

function buildHeaders() {
  return {
    'X-Wallet-Address': address.value || '',
    'x-turnstile-token': turnstileToken.value || '',
  }
}

async function submitPledge(): Promise<void> {
  if (!ensureWalletAndToken()) return
  pledgeSubmitting.value = true

  try {
    await $fetch('/api/pledges', {
      method: 'POST',
      headers: buildHeaders(),
      body: {
        campaignId: resolvedCampaignId.value,
        amount: pledgeForm.value.amount,
        txHash: pledgeForm.value.txHash,
        message: pledgeForm.value.message || null,
        isAnonymous: pledgeForm.value.isAnonymous,
      },
    })

    toast.add({
      title: 'Pledge Submitted',
      description: 'Your pledge has been recorded.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    pledgeForm.value = { amount: '', txHash: '', message: '', isAnonymous: false }
    turnstileRef.value?.reset()
    clearToken()
    refreshPledges()
  } catch (error) {
    toast.add({
      title: 'Pledge Failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  } finally {
    pledgeSubmitting.value = false
  }
}

function handleVouchSuccess(): void {
  showVouchModal.value = false
  refreshVouchers()
  refreshCampaign()
  turnstileRef.value?.reset()
  clearToken()
}

function handleDisputeSuccess(): void {
  showDisputeModal.value = false
  refreshDisputes()
  refreshCampaign()
  turnstileRef.value?.reset()
  clearToken()
}

function formatAmount(value: string): string {
  return Number(value || '0').toLocaleString()
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

function formatJson(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2)
}
</script>

<style scoped>
.campaign-detail__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

.detail-card {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  font-size: var(--text-sm);
}

.detail-card__grid span {
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 0.25rem;
}

.detail-card__hashes code,
.detail-card__grid code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  word-break: break-all;
}

.detail-card__hashes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-card__hashes pre {
  background-color: var(--surface-secondary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.detail-card--split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  align-items: center;
}

.detail-card__summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.detail-card__muted {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-secondary);
}

.action-card label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.action-card--modal {
  text-align: center;
  align-items: center;
}

.action-card--modal h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.action-card--modal h3 .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.action-card__description {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.btn--success {
  background-color: var(--color-success-500);
  color: var(--text-inverse);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-fast);
}

.btn--success:hover:not(:disabled) {
  background-color: var(--color-success-600);
}

.btn--success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--danger {
  background-color: var(--color-error-500);
  color: var(--text-inverse);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-fast);
}

.btn--danger:hover:not(:disabled) {
  background-color: var(--color-error-600);
}

.btn--danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--success .icon,
.btn--danger .icon {
  width: 1rem;
  height: 1rem;
}

.action-card input,
.action-card textarea,
.action-card select {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-primary);
  color: var(--text-primary);
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  font-size: var(--text-xs);
}

.activity-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-column__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-secondary);
}

.activity-column__header .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

.activity-column__header h3 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.activity-count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
}

.activity-link {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--interactive-primary);
  text-decoration: none;
}

.activity-link:hover {
  text-decoration: underline;
}

.activity-grid ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-grid li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.activity-item-link {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.375rem 0.5rem;
  margin: -0.375rem -0.5rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: background-color var(--transition-fast);
}

.activity-item-link:hover {
  background-color: var(--surface-secondary);
}

.activity-item-link:hover .activity-amount,
.activity-item-link:hover .activity-type {
  color: var(--interactive-primary);
}

.activity-amount {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.activity-type {
  text-transform: capitalize;
  color: var(--text-primary);
}

.activity-date {
  color: var(--text-tertiary);
}

.activity-empty {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-style: italic;
  margin: 0;
  padding: 0.5rem 0;
}

.detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  text-transform: capitalize;
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

.status-pill--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
}

.status-pill--active {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.status-pill--pending {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.status-pill--slashed,
.status-pill--rejected {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.status-pill--released,
.status-pill--upheld {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.loading-state,
.error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}
</style>
