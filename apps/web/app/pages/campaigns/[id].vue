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

              <form
                class="action-card"
                @submit.prevent="submitVoucher"
              >
                <h3>Vouch</h3>
                <label>
                  Amount (wei)
                  <input
                    v-model="voucherForm.amount"
                    type="text"
                    required
                  />
                </label>
                <label>
                  Stake Tx Hash
                  <input
                    v-model="voucherForm.stakeTxHash"
                    type="text"
                    required
                  />
                </label>
                <label>
                  Endorsement
                  <textarea
                    v-model="voucherForm.endorsementMessage"
                    rows="2"
                  ></textarea>
                </label>
                <label>
                  Expiration (optional)
                  <input
                    v-model="voucherForm.expiresAt"
                    type="datetime-local"
                  />
                </label>
                <button
                  type="submit"
                  class="btn btn--primary"
                  :disabled="voucherSubmitting"
                >
                  {{ voucherSubmitting ? 'Submitting...' : 'Submit Voucher' }}
                </button>
              </form>

              <form
                class="action-card"
                @submit.prevent="submitDispute"
              >
                <h3>Dispute</h3>
                <label>
                  Amount (wei)
                  <input
                    v-model="disputeForm.amount"
                    type="text"
                    required
                  />
                </label>
                <label>
                  Stake Tx Hash
                  <input
                    v-model="disputeForm.stakeTxHash"
                    type="text"
                    required
                  />
                </label>
                <label>
                  Reason
                  <textarea
                    v-model="disputeForm.reason"
                    rows="3"
                    required
                  ></textarea>
                </label>
                <label>
                  Dispute Type
                  <select v-model="disputeForm.disputeType">
                    <option value="general">General</option>
                    <option value="fraud">Fraud</option>
                    <option value="misrepresentation">Misrepresentation</option>
                    <option value="rule_violation">Rule Violation</option>
                    <option value="verification_failure">Verification Failure</option>
                  </select>
                </label>
                <label>
                  Evidence URL or Note (optional)
                  <input
                    v-model="disputeForm.evidence"
                    type="text"
                  />
                </label>
                <button
                  type="submit"
                  class="btn btn--primary"
                  :disabled="disputeSubmitting"
                >
                  {{ disputeSubmitting ? 'Submitting...' : 'Submit Dispute' }}
                </button>
              </form>
            </div>
          </section>

          <section class="detail-card">
            <h2>Recent Activity</h2>
            <div class="activity-grid">
              <div>
                <h3>Pledges</h3>
                <ul>
                  <li
                    v-for="pledge in pledges"
                    :key="pledge.id"
                  >
                    <span>{{ pledge.amount }} wei</span>
                    <span>{{ formatDate(pledge.pledgedAt) }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3>Vouches</h3>
                <ul>
                  <li
                    v-for="voucher in vouchers"
                    :key="voucher.id"
                  >
                    <span>{{ voucher.amount }} wei</span>
                    <span>{{ formatDate(voucher.vouchedAt) }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3>Disputes</h3>
                <ul>
                  <li
                    v-for="dispute in disputes"
                    :key="dispute.id"
                  >
                    <span>{{ dispute.disputeType }}</span>
                    <span>{{ formatDate(dispute.disputedAt) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TurnstileWidget from '../../components/common/TurnstileWidget.vue'
import EvidenceUploadCard from '../../components/evidence/EvidenceUploadCard.vue'

const route = useRoute()
const toast = useToast()
const { isConnected, address } = useWallet()
const { token: turnstileToken, hasToken, setToken, clearToken } = useTurnstileToken()

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const campaignId = computed(() => String(route.params.id || ''))

const {
  data: campaignResponse,
  pending: campaignPending,
  error: campaignError,
} = useFetch(() => `/api/campaigns/${campaignId.value}`)

const campaign = computed(() => campaignResponse.value?.data)
const resolvedCampaignId = computed(() => campaign.value?.id || campaignId.value)

const { data: pledgesResponse } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/pledges?limit=5`,
)
const { data: vouchersResponse } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/vouchers?limit=5`,
)
const { data: disputesResponse } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/disputers?limit=5`,
)

const pledges = computed(() => pledgesResponse.value?.data || [])
const vouchers = computed(() => vouchersResponse.value?.data || [])
const disputes = computed(() => disputesResponse.value?.data || [])

const pledgeForm = ref({
  amount: '',
  txHash: '',
  message: '',
  isAnonymous: false,
})
const voucherForm = ref({
  amount: '',
  stakeTxHash: '',
  endorsementMessage: '',
  expiresAt: '',
})
const disputeForm = ref({
  amount: '',
  stakeTxHash: '',
  reason: '',
  disputeType: 'general',
  evidence: '',
})

const pledgeSubmitting = ref(false)
const voucherSubmitting = ref(false)
const disputeSubmitting = ref(false)

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

async function submitVoucher(): Promise<void> {
  if (!ensureWalletAndToken()) return
  voucherSubmitting.value = true

  try {
    await $fetch('/api/vouchers', {
      method: 'POST',
      headers: buildHeaders(),
      body: {
        campaignId: resolvedCampaignId.value,
        amount: voucherForm.value.amount,
        stakeTxHash: voucherForm.value.stakeTxHash,
        endorsementMessage: voucherForm.value.endorsementMessage || null,
        expiresAt: voucherForm.value.expiresAt
          ? new Date(voucherForm.value.expiresAt).toISOString()
          : null,
      },
    })

    toast.add({
      title: 'Voucher Submitted',
      description: 'Your endorsement has been recorded.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    voucherForm.value = { amount: '', stakeTxHash: '', endorsementMessage: '', expiresAt: '' }
    turnstileRef.value?.reset()
    clearToken()
  } catch (error) {
    toast.add({
      title: 'Voucher Failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  } finally {
    voucherSubmitting.value = false
  }
}

async function submitDispute(): Promise<void> {
  if (!ensureWalletAndToken()) return
  disputeSubmitting.value = true

  try {
    const evidence = disputeForm.value.evidence
      ? [
          {
            type: disputeForm.value.evidence.startsWith('http') ? 'url' : 'text',
            content: disputeForm.value.evidence,
            submittedAt: new Date().toISOString(),
          },
        ]
      : []

    await $fetch('/api/disputers', {
      method: 'POST',
      headers: buildHeaders(),
      body: {
        campaignId: resolvedCampaignId.value,
        amount: disputeForm.value.amount,
        stakeTxHash: disputeForm.value.stakeTxHash,
        reason: disputeForm.value.reason,
        disputeType: disputeForm.value.disputeType,
        evidence,
      },
    })

    toast.add({
      title: 'Dispute Submitted',
      description: 'Your dispute has been recorded.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    disputeForm.value = {
      amount: '',
      stakeTxHash: '',
      reason: '',
      disputeType: 'general',
      evidence: '',
    }
    turnstileRef.value?.reset()
    clearToken()
  } catch (error) {
    toast.add({
      title: 'Dispute Failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  } finally {
    disputeSubmitting.value = false
  }
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

.loading-state,
.error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}
</style>
