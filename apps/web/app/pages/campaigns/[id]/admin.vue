<template>
  <div class="campaign-admin-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              :to="`/campaigns/${resolvedCampaignId}`"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Campaign
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div>
              <h1 class="page-header__title">{{ campaign?.name || 'Campaign' }} — Admin</h1>
              <p class="page-header__description">
                Creator-only dashboard for verification, evidence, and API testing.
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
          <div
            v-if="campaign"
            class="page-header__quick-stats"
          >
            <div class="quick-stat">
              <span>Goal</span>
              <strong>{{ formatUsdcAmount(campaign.fundraisingGoal) }}</strong>
            </div>
            <div class="quick-stat">
              <span>Amount Pledged</span>
              <strong>{{ formatUsdcAmount(campaign.amountPledged) }}</strong>
            </div>
            <div class="quick-stat">
              <span>Progress</span>
              <strong>{{ progressPercent }}%</strong>
            </div>
            <div class="quick-stat">
              <span>End Date</span>
              <strong>{{ formatDate(campaign.endDate) }}</strong>
            </div>
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
          Loading campaign admin...
        </div>

        <div
          v-else-if="campaignError"
          class="error-state"
        >
          <Icon name="heroicons:exclamation-triangle" />
          <span>Unable to load this campaign.</span>
        </div>

        <div
          v-else-if="campaign && !isCreator"
          class="unauthorized-card"
        >
          <Icon name="heroicons:lock-closed" />
          <div>
            <h2>Creator Access Only</h2>
            <p>Connect with the creator wallet to access this admin panel.</p>
            <NuxtLink
              :to="`/campaigns/${resolvedCampaignId}`"
              class="btn btn--secondary"
            >
              Return to Campaign
            </NuxtLink>
          </div>
        </div>

        <div
          v-else-if="campaign"
          class="campaign-admin__layout"
        >
          <section class="detail-card">
            <div class="detail-card__header">
              <h2>Financial Overview</h2>
            </div>
            <div class="detail-card__grid">
              <div>
                <span>Creator Bond</span>
                <strong>{{ formatUsdcAmount(campaign.creatorBond) }}</strong>
                <p class="detail-card__muted">
                  Status: {{ campaign.creatorBond === '0' ? 'Not submitted' : 'Submitted' }}
                </p>
              </div>
              <div>
                <span>Bond Tx Hash</span>
                <code>{{ getOptionalField('creationTxHash') }}</code>
              </div>
              <div>
                <span>Escrow Contract</span>
                <div class="detail-card__link">
                  <span v-if="campaign.escrowAddress">{{
                    truncateHash(campaign.escrowAddress)
                  }}</span>
                  <span v-else>Not deployed</span>
                  <a
                    v-if="campaign.escrowAddress"
                    :href="getExplorerAddressUrl(campaign.escrowAddress)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                    <Icon name="heroicons:arrow-top-right-on-square" />
                  </a>
                </div>
              </div>
              <div>
                <span>Pledges</span>
                <strong>{{ pledges.length }}</strong>
                <p class="detail-card__muted">Total: {{ formatUsdcAmount(totalPledgeAmount) }}</p>
              </div>
              <div>
                <span>Vouches</span>
                <strong>{{ vouchers.length }}</strong>
                <p class="detail-card__muted">Total: {{ formatUsdcAmount(totalVoucherAmount) }}</p>
              </div>
              <div>
                <span>Disputes</span>
                <strong>{{ disputes.length }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <div class="detail-card__header">
              <h2>Activity</h2>
              <div class="tab-group">
                <button
                  type="button"
                  class="tab-button"
                  :class="{ 'tab-button--active': activeTab === 'pledges' }"
                  @click="activeTab = 'pledges'"
                >
                  Pledges
                </button>
                <button
                  type="button"
                  class="tab-button"
                  :class="{ 'tab-button--active': activeTab === 'vouchers' }"
                  @click="activeTab = 'vouchers'"
                >
                  Vouchers
                </button>
                <button
                  type="button"
                  class="tab-button"
                  :class="{ 'tab-button--active': activeTab === 'disputes' }"
                  @click="activeTab = 'disputes'"
                >
                  Disputes
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'pledges'">
              <table class="activity-table">
                <thead>
                  <tr>
                    <th>Pledger</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Message</th>
                    <th>Anonymous</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="pledge in pledges"
                    :key="pledge.id"
                  >
                    <td>{{ truncateHash(pledge.pledgerAddress) }}</td>
                    <td>{{ formatUsdcAmount(pledge.amount) }}</td>
                    <td>{{ formatDate(pledge.pledgedAt) }}</td>
                    <td>{{ getPledgeMessage(pledge) }}</td>
                    <td>{{ pledge.isAnonymous ? 'Yes' : 'No' }}</td>
                  </tr>
                  <tr v-if="!pledges.length">
                    <td
                      colspan="5"
                      class="activity-empty"
                    >
                      No pledges yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="activeTab === 'vouchers'">
              <table class="activity-table">
                <thead>
                  <tr>
                    <th>Voucher</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="voucher in vouchers"
                    :key="voucher.id"
                  >
                    <td>{{ truncateHash(voucher.voucherAddress) }}</td>
                    <td>{{ formatUsdcAmount(voucher.amount) }}</td>
                    <td>
                      <span
                        class="status-pill status-pill--sm"
                        :class="`status-pill--${voucher.status}`"
                      >
                        {{ voucher.status }}
                      </span>
                    </td>
                    <td>{{ formatDate(voucher.vouchedAt) }}</td>
                  </tr>
                  <tr v-if="!vouchers.length">
                    <td
                      colspan="4"
                      class="activity-empty"
                    >
                      No vouchers yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="activeTab === 'disputes'">
              <table class="activity-table">
                <thead>
                  <tr>
                    <th>Disputer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="dispute in disputes"
                    :key="dispute.id"
                  >
                    <td>{{ truncateHash(dispute.disputerAddress) }}</td>
                    <td class="activity-cap">{{ dispute.disputeType }}</td>
                    <td>
                      <span
                        class="status-pill status-pill--sm"
                        :class="`status-pill--${dispute.status}`"
                      >
                        {{ dispute.status }}
                      </span>
                    </td>
                    <td>{{ formatDate(dispute.disputedAt) }}</td>
                    <td>{{ dispute.reason || '—' }}</td>
                  </tr>
                  <tr v-if="!disputes.length">
                    <td
                      colspan="5"
                      class="activity-empty"
                    >
                      No disputes filed.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="detail-card detail-card--split">
            <div class="evidence-column">
              <div class="detail-card__header">
                <h2>Evidence Images</h2>
              </div>
              <div class="evidence-security">
                <h3>Security Check</h3>
                <p class="detail-card__muted">
                  Complete the Turnstile check to enable evidence uploads.
                </p>
                <TurnstileWidget
                  ref="turnstileRef"
                  action="campaign_admin_evidence"
                  @verified="handleTurnstileVerified"
                  @expired="handleTurnstileExpired"
                  @error="handleTurnstileError"
                />
              </div>
              <div class="evidence-stack">
                <div class="evidence-card">
                  <div class="evidence-card__header">
                    <h3>Baseline Evidence</h3>
                    <span
                      v-if="baselineEvidence"
                      class="status-pill status-pill--sm status-pill--active"
                    >
                      Uploaded
                    </span>
                  </div>
                  <div
                    v-if="baselineEvidence"
                    class="evidence-card__content"
                  >
                    <img
                      :src="baselineEvidence.gatewayUrl"
                      :alt="baselineEvidence.fileName"
                    />
                    <div class="evidence-card__meta">
                      <code>{{ baselineEvidence.ipfsCid }}</code>
                      <span>{{ formatDate(baselineEvidence.createdAt) }}</span>
                    </div>
                    <a
                      class="btn btn--secondary btn--sm"
                      :href="baselineEvidence.gatewayUrl"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Full
                    </a>
                  </div>
                  <div
                    v-else
                    class="evidence-card__empty"
                  >
                    <p>No baseline evidence uploaded.</p>
                    <button
                      type="button"
                      class="btn btn--primary btn--sm"
                      :disabled="!hasToken"
                      @click="openUploadModal('baseline')"
                    >
                      Upload Baseline
                    </button>
                  </div>
                </div>

                <div class="evidence-card">
                  <div class="evidence-card__header">
                    <h3>Completion Evidence</h3>
                    <span
                      v-if="completionEvidence"
                      class="status-pill status-pill--sm status-pill--active"
                    >
                      Uploaded
                    </span>
                  </div>
                  <div
                    v-if="completionEvidence"
                    class="evidence-card__content"
                  >
                    <img
                      :src="completionEvidence.gatewayUrl"
                      :alt="completionEvidence.fileName"
                    />
                    <div class="evidence-card__meta">
                      <code>{{ completionEvidence.ipfsCid }}</code>
                      <span>{{ formatDate(completionEvidence.createdAt) }}</span>
                    </div>
                    <a
                      class="btn btn--secondary btn--sm"
                      :href="completionEvidence.gatewayUrl"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Full
                    </a>
                  </div>
                  <div
                    v-else
                    class="evidence-card__empty"
                  >
                    <p>No completion evidence uploaded.</p>
                    <button
                      type="button"
                      class="btn btn--primary btn--sm"
                      :disabled="!hasToken"
                      @click="openUploadModal('completion')"
                    >
                      Upload Completion
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div class="detail-card__header">
                <h2>Verification Config</h2>
              </div>
              <div class="detail-card__stack">
                <div>
                  <span class="detail-card__label">Consensus Prompt</span>
                  <pre class="detail-card__block">{{ consensusPrompt }}</pre>
                </div>
                <div>
                  <span class="detail-card__label">Rules &amp; Resolution</span>
                  <pre class="detail-card__block">{{ campaign.rulesAndResolution }}</pre>
                </div>
                <div v-if="verificationCriteria">
                  <span class="detail-card__label">Verification Criteria</span>
                  <div class="criteria-grid">
                    <div>
                      <span>Target Text</span>
                      <strong>{{ verificationCriteria.targetText }}</strong>
                    </div>
                    <div>
                      <span>Baseline Count</span>
                      <strong>{{ verificationCriteria.baselineCount }}</strong>
                    </div>
                    <div>
                      <span>Required Completion Count</span>
                      <strong>{{ verificationCriteria.requiredCount }}</strong>
                    </div>
                  </div>
                </div>
                <div>
                  <span class="detail-card__label">Prompt Hash</span>
                  <code>{{ campaign.promptHash }}</code>
                </div>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <div class="detail-card__header">
              <div>
                <h2>API Testing</h2>
                <p class="detail-card__muted">
                  Run verification calls before triggering oracle flows.
                </p>
              </div>
            </div>

            <div class="api-panel">
              <div class="api-panel__card">
                <h3>Test Vision API</h3>
                <p>Runs /api/ai/vision-verify with the current evidence.</p>
                <button
                  type="button"
                  class="btn btn--secondary"
                  :disabled="visionLoading || !canRunVisionTest"
                  @click="runVisionTest"
                >
                  {{ visionLoading ? 'Testing...' : 'Test Vision API' }}
                </button>
                <details
                  v-if="visionResponse"
                  class="api-panel__response"
                  open
                >
                  <summary>Vision Response</summary>
                  <pre>{{ formatJson(visionResponse) }}</pre>
                </details>
              </div>

              <div class="api-panel__card">
                <h3>Test Full Verification</h3>
                <p class="api-panel__warning">WARNING: This may trigger on-chain oracle calls.</p>
                <label class="checkbox">
                  <input
                    v-model="fullTestAcknowledged"
                    type="checkbox"
                  />
                  I understand this may trigger on-chain transactions
                </label>
                <button
                  type="button"
                  class="btn btn--danger"
                  :disabled="fullVerifyLoading || !fullTestAcknowledged"
                  @click="runFullVerification"
                >
                  {{ fullVerifyLoading ? 'Running...' : 'Test Full Verification' }}
                </button>
                <details
                  v-if="fullVerificationResponse"
                  class="api-panel__response"
                  open
                >
                  <summary>Verification Response</summary>
                  <pre>{{ formatJson(fullVerificationResponse) }}</pre>
                </details>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <ImageUploadModal
      :is-open="isUploadModalOpen"
      :campaign-id="resolvedCampaignId"
      @close="closeUploadModal"
      @upload="handleEvidenceUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CampaignResponse } from '~~/server/domains/campaigns'
import type { PledgeSummary } from '~/types/pledge'
import type { VoucherSummary } from '~/types/voucher'
import type { DisputerSummary } from '~/types/disputer'
import { formatUsdcAmount } from '~/utils/currency'
import { defaultChain } from '~/config/chains'
import ImageUploadModal from '~/components/forms/ImageUploadModal.vue'
import TurnstileWidget from '~/components/common/TurnstileWidget.vue'

interface EvidenceResponse {
  evidenceId: string
  ipfsCid: string
  ipfsUrl: string
  gatewayUrl: string
  fileName: string
  createdAt: string
}

const route = useRoute()
const toast = useToast()
const { address } = useWallet()
const { setToken, clearToken, hasToken } = useTurnstileToken()

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

const campaignId = computed(() => String(route.params.id || ''))

const {
  data: campaignResponse,
  pending: campaignPending,
  error: campaignError,
} = useFetch(() => `/api/campaigns/${campaignId.value}`)

const campaign = computed(
  () => (campaignResponse.value as { data?: CampaignResponse } | null)?.data,
)

const resolvedCampaignId = computed(() => campaign.value?.id || campaignId.value)

const isCreator = computed(() => {
  if (!campaign.value || !address.value) return false
  return address.value.toLowerCase() === campaign.value.creatorAddress.toLowerCase()
})

const { data: pledgesResponse } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/pledges`,
)
const { data: vouchersResponse } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/vouchers`,
)
const { data: disputesResponse } = useFetch(
  () => `/api/campaigns/${resolvedCampaignId.value}/disputers`,
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

const activeTab = ref<'pledges' | 'vouchers' | 'disputes'>('pledges')

const totalPledgeAmount = computed(() => sumWei(pledges.value.map((item) => item.amount)))
const totalVoucherAmount = computed(() => sumWei(vouchers.value.map((item) => item.amount)))

const progressPercent = computed(() => {
  if (!campaign.value) return 0
  const pledged = Number(campaign.value.amountPledged || '0')
  const goal = Number(campaign.value.fundraisingGoal || '0')
  if (!goal) return 0
  return Math.min(100, Math.round((pledged / goal) * 100))
})

const consensusPrompt = computed(() => campaign.value?.prompt || '')

const verificationCriteria = computed(() => {
  const data = campaign.value?.baselineData as Record<string, unknown> | undefined
  if (!data) return null
  const targetText = (data.targetText || data['target_text']) as string | undefined
  const baselineCount = Number(data.baselineCount || data['baseline_count'] || 1)
  const requiredCount = Number(data.requiredCount || data['required_count'] || 20)
  return {
    targetText: targetText || 'chainlink',
    baselineCount,
    requiredCount,
  }
})

const baselineEvidence = ref<EvidenceResponse | null>(null)
const completionEvidence = ref<EvidenceResponse | null>(null)

const isUploadModalOpen = ref(false)
const uploadType = ref<'baseline' | 'completion'>('baseline')

const visionLoading = ref(false)
const visionResponse = ref<Record<string, unknown> | null>(null)

const fullVerifyLoading = ref(false)
const fullVerificationResponse = ref<Record<string, unknown> | null>(null)
const fullTestAcknowledged = ref(false)

const canRunVisionTest = computed(
  () => !!baselineEvidence.value?.gatewayUrl && !!completionEvidence.value?.gatewayUrl,
)

watch(
  () => campaign.value?.baselineEvidenceId,
  async (id) => {
    if (!id) return
    try {
      const response = await $fetch<{ data: EvidenceResponse }>(`/api/evidence/${id}`)
      baselineEvidence.value = response.data
    } catch {
      baselineEvidence.value = null
    }
  },
  { immediate: true },
)

watch(
  () => campaign.value?.completionEvidenceId,
  async (id) => {
    if (!id) return
    try {
      const response = await $fetch<{ data: EvidenceResponse }>(`/api/evidence/${id}`)
      completionEvidence.value = response.data
    } catch {
      completionEvidence.value = null
    }
  },
  { immediate: true },
)

function openUploadModal(type: 'baseline' | 'completion') {
  uploadType.value = type
  isUploadModalOpen.value = true
}

function closeUploadModal() {
  isUploadModalOpen.value = false
}

async function handleEvidenceUpload(data: { ipfsUrl: string; cid: string; gatewayUrl?: string }) {
  try {
    const evidenceId = (data as { evidenceId?: string }).evidenceId || data.cid
    const response = await $fetch<{ data?: { evidenceId?: string } }>(
      `/api/campaigns/${resolvedCampaignId.value}/${uploadType.value}`,
      {
        method: 'POST',
        headers: {
          'X-Wallet-Address': address.value || '',
        },
        body: {
          evidenceId,
        },
      },
    )

    const evidence: EvidenceResponse = {
      evidenceId: response.data?.evidenceId || evidenceId,
      ipfsCid: data.cid,
      ipfsUrl: data.ipfsUrl,
      gatewayUrl: data.gatewayUrl || data.ipfsUrl,
      fileName: 'evidence.jpg',
      createdAt: new Date().toISOString(),
    }

    if (uploadType.value === 'baseline') {
      baselineEvidence.value = evidence
    } else {
      completionEvidence.value = evidence
    }

    toast.add({
      title: 'Evidence Linked',
      description: `Your ${uploadType.value} evidence was linked to the campaign.`,
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    closeUploadModal()
  } catch (error) {
    toast.add({
      title: 'Upload Failed',
      description: error instanceof Error ? error.message : 'Failed to link evidence.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
  }
}

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

async function runVisionTest() {
  if (!canRunVisionTest.value) return
  visionLoading.value = true
  visionResponse.value = null

  try {
    const response = await $fetch<Record<string, unknown>>('/api/ai/vision-verify', {
      method: 'POST',
      body: {
        baselineImageUrl: baselineEvidence.value?.gatewayUrl,
        completionImageUrl: completionEvidence.value?.gatewayUrl,
        prompt: consensusPrompt.value,
        criteria: verificationCriteria.value || {
          targetText: 'chainlink',
          baselineCount: 1,
          requiredCount: 20,
        },
      },
    })

    visionResponse.value = response
  } catch (error) {
    visionResponse.value = {
      error: error instanceof Error ? error.message : 'Failed to run vision verification.',
    }
  } finally {
    visionLoading.value = false
  }
}

async function runFullVerification() {
  if (!fullTestAcknowledged.value || !campaign.value) return
  fullVerifyLoading.value = true
  fullVerificationResponse.value = null

  try {
    const response = await $fetch<Record<string, unknown>>('/api/cre/verify-completion', {
      method: 'POST',
      headers: {
        'X-Wallet-Address': address.value || '',
      },
      body: {
        campaignId: resolvedCampaignId.value,
      },
    })

    fullVerificationResponse.value = response
  } catch (error) {
    fullVerificationResponse.value = {
      error: error instanceof Error ? error.message : 'Failed to run full verification.',
    }
  } finally {
    fullVerifyLoading.value = false
  }
}

function sumWei(values: string[]): string {
  return values.reduce((acc, value) => acc + BigInt(value || '0'), 0n).toString()
}

function formatDate(value: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function truncateHash(value: string): string {
  if (!value) return '—'
  return value.length > 16 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function getPledgeMessage(pledge: PledgeSummary): string {
  const withMessage = pledge as PledgeSummary & { message?: string | null }
  return withMessage.message || '—'
}

function getExplorerAddressUrl(addressValue: string): string {
  return `${defaultChain.blockExplorers?.default.url}/address/${addressValue}`
}

function getOptionalField(field: string): string {
  const record = campaign.value as CampaignResponse & Record<string, string | null | undefined>
  return record?.[field] || '—'
}
</script>

<style scoped>
.campaign-admin-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem 0 1.5rem;
}

.page-header__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header__breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
}

.page-header__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.page-header__description {
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.page-header__quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.quick-stat {
  background: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: var(--text-sm);
}

.quick-stat span {
  color: var(--text-tertiary);
}

.page-main {
  padding: 1.5rem 0 3rem;
}

.campaign-admin__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detail-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  font-size: var(--text-sm);
}

.detail-card__grid span {
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 0.25rem;
}

.detail-card__muted {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}

.detail-card__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-card__link a {
  color: var(--interactive-primary);
  font-size: var(--text-xs);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.detail-card__stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card__label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.detail-card__block {
  background-color: var(--surface-secondary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.criteria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  font-size: var(--text-sm);
}

.criteria-grid span {
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 0.25rem;
}

.tab-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-button {
  border: 1px solid var(--border-secondary);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  cursor: pointer;
}

.tab-button--active {
  background: var(--interactive-primary);
  color: var(--text-inverse);
  border-color: var(--interactive-primary);
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.activity-table th,
.activity-table td {
  text-align: left;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid var(--border-secondary);
}

.activity-table th {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.activity-empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: 1rem 0;
}

.activity-cap {
  text-transform: capitalize;
}

.detail-card--split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.evidence-security {
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-secondary);
  background: var(--surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evidence-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.evidence-card {
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.evidence-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.evidence-card__content img {
  width: 100%;
  border-radius: var(--radius-md);
  object-fit: cover;
  max-height: 220px;
}

.evidence-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.evidence-card__empty {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.api-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.api-panel__card {
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background-color: var(--surface-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.api-panel__warning {
  color: var(--color-error-600);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.api-panel__response summary {
  cursor: pointer;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.api-panel__response pre {
  background: var(--surface-primary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  white-space: pre-wrap;
  margin-top: 0.5rem;
}

.unauthorized-card {
  padding: 2rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-primary);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.unauthorized-card h2 {
  margin: 0 0 0.25rem;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-xs);
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
.status-pill--rejected,
.status-pill--failed {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.loading-state,
.error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}
</style>
