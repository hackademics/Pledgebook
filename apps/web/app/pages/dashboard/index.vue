<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header-content">
          <div class="page-header-text">
            <div class="page-header-greeting">
              <span class="greeting-text">{{ greeting }},</span>
              <span
                v-if="isConnected"
                class="greeting-name"
              >
                {{ userRecord?.displayName || userRecord?.ensName || trimmedAddress }}
              </span>
              <span
                v-else
                class="greeting-name"
                >Guest</span
              >
            </div>
            <p class="page-description">
              Track your campaigns, pledges, vouches, and disputes in one place.
            </p>
          </div>
          <div class="page-header-actions">
            <NuxtLink
              to="/campaigns/create"
              class="btn btn-primary"
            >
              <Icon
                name="heroicons:plus"
                class="btn-icon"
              />
              Create Campaign
            </NuxtLink>
            <NuxtLink
              to="/campaigns"
              class="btn btn-secondary"
            >
              <Icon
                name="heroicons:globe-alt"
                class="btn-icon"
              />
              Explore
            </NuxtLink>
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              class="btn btn-ghost"
            >
              <Icon
                name="heroicons:shield-check"
                class="btn-icon"
              />
              Admin
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-main">
      <div class="container-app">
        <!-- Empty State: Connect Wallet -->
        <section
          v-if="!isConnected"
          class="dashboard-empty"
        >
          <div class="dashboard-empty-card">
            <div class="dashboard-empty-illustration">
              <Icon
                name="heroicons:wallet"
                class="dashboard-empty-icon"
              />
            </div>
            <div class="dashboard-empty-content">
              <h2 class="dashboard-empty-title">Connect your wallet to get started</h2>
              <p class="dashboard-empty-description">
                Your personalized dashboard shows campaigns, pledges, vouches, and disputes tied to
                your wallet address.
              </p>
              <div class="dashboard-empty-features">
                <div class="dashboard-empty-feature">
                  <Icon name="heroicons:flag" />
                  <span>Track campaign progress</span>
                </div>
                <div class="dashboard-empty-feature">
                  <Icon name="heroicons:banknotes" />
                  <span>Monitor pledges & earnings</span>
                </div>
                <div class="dashboard-empty-feature">
                  <Icon name="heroicons:hand-thumb-up" />
                  <span>Manage your vouches</span>
                </div>
                <div class="dashboard-empty-feature">
                  <Icon name="heroicons:bell" />
                  <span>Stay notified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Dashboard Content (when connected) -->
        <div
          v-else
          class="dashboard-layout"
        >
          <!-- Stats Overview Grid -->
          <section class="dashboard-stats">
            <article class="stat-card stat-card--featured">
              <div class="stat-card-header">
                <div class="stat-card-icon">
                  <Icon name="heroicons:sparkles" />
                </div>
                <span class="stat-badge">Score</span>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label">Reputation</p>
                <h3 class="stat-card-value">
                  {{ userPending ? '—' : formatNumber(userRecord?.reputationScore ?? 0) }}
                </h3>
                <p class="stat-card-hint">Built from verified outcomes</p>
              </div>
            </article>

            <article class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon stat-card-icon--success">
                  <Icon name="heroicons:flag" />
                </div>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label">Campaigns Created</p>
                <h3 class="stat-card-value">{{ campaignsMeta?.total ?? 0 }}</h3>
                <div class="stat-breakdown">
                  <span class="stat-breakdown-item stat-breakdown-item--active">
                    <span class="stat-dot"></span>
                    {{ activeCampaignsCount }} active
                  </span>
                  <span class="stat-breakdown-item stat-breakdown-item--complete">
                    <span class="stat-dot"></span>
                    {{ completedCampaignsCount }} complete
                  </span>
                </div>
              </div>
              <NuxtLink
                to="/campaigns/create"
                class="stat-card-link"
              >
                Create new
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
            </article>

            <article class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon stat-card-icon--info">
                  <Icon name="heroicons:banknotes" />
                </div>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label">Total Pledged</p>
                <h3 class="stat-card-value stat-card-value--mono">
                  {{ formatAmount(userRecord?.totalPledged ?? totalPledgedFromList) }}
                  <span class="stat-unit">wei</span>
                </h3>
                <div class="stat-breakdown">
                  <span class="stat-breakdown-item stat-breakdown-item--active">
                    <span class="stat-dot"></span>
                    {{ activePledgesCount }} active
                  </span>
                  <span class="stat-breakdown-item"> {{ pledgesMeta?.total ?? 0 }} total </span>
                </div>
              </div>
            </article>

            <article class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon stat-card-icon--warning">
                  <Icon name="heroicons:hand-thumb-up" />
                </div>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label">Active Vouches</p>
                <h3 class="stat-card-value">{{ activeVouchesCount }}</h3>
                <p class="stat-card-hint">{{ vouchersMeta?.total ?? 0 }} total vouches</p>
              </div>
            </article>

            <article class="stat-card">
              <div class="stat-card-header">
                <div class="stat-card-icon stat-card-icon--danger">
                  <Icon name="heroicons:exclamation-triangle" />
                </div>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label">Open Disputes</p>
                <h3 class="stat-card-value">{{ pendingDisputesCount }}</h3>
                <p class="stat-card-hint">{{ disputesMeta?.total ?? 0 }} filed</p>
              </div>
            </article>

            <article class="stat-card stat-card--wallet">
              <div class="stat-card-header">
                <div class="stat-card-icon">
                  <Icon name="heroicons:wallet" />
                </div>
                <span class="stat-badge stat-badge--success">Connected</span>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label">Wallet Balance</p>
                <h3 class="stat-card-value stat-card-value--mono">
                  {{ balance || '0.00' }}
                  <span class="stat-unit">USDC</span>
                </h3>
                <p class="stat-card-address">{{ address }}</p>
              </div>
            </article>
          </section>

          <!-- Main Dashboard Grid -->
          <div class="dashboard-main">
            <!-- Primary Column -->
            <div class="dashboard-primary">
              <!-- Your Campaigns Panel -->
              <section class="dashboard-panel">
                <div class="dashboard-panel-header">
                  <div>
                    <h2 class="dashboard-panel-title">Your Campaigns</h2>
                    <p class="dashboard-panel-description">
                      Track progress, funding, and status updates
                    </p>
                  </div>
                  <NuxtLink
                    to="/campaigns"
                    class="btn btn-secondary btn-sm"
                  >
                    View all
                  </NuxtLink>
                </div>

                <div
                  v-if="campaignsPending"
                  class="dashboard-panel-loading"
                >
                  <AppSpinner />
                  <span>Loading campaigns…</span>
                </div>

                <div
                  v-else-if="createdCampaigns.length === 0"
                  class="dashboard-panel-empty"
                >
                  <Icon name="heroicons:flag" />
                  <div>
                    <h3>No campaigns yet</h3>
                    <p>Launch your first campaign to start raising pledges.</p>
                  </div>
                  <NuxtLink
                    to="/campaigns/create"
                    class="btn btn-primary btn-sm"
                  >
                    Create campaign
                  </NuxtLink>
                </div>

                <ul
                  v-else
                  class="dashboard-list"
                >
                  <li
                    v-for="campaign in createdCampaigns"
                    :key="campaign.id"
                    class="dashboard-list-item"
                  >
                    <div class="dashboard-list-content">
                      <NuxtLink
                        :to="`/@${campaign.slug || campaign.id}`"
                        class="dashboard-list-title"
                      >
                        {{ campaign.name }}
                      </NuxtLink>
                      <p class="dashboard-list-meta">
                        Goal {{ formatAmount(campaign.fundraisingGoal) }} wei • Ends
                        {{ formatDate(campaign.endDate) }}
                      </p>
                    </div>
                    <div class="dashboard-list-aside">
                      <span
                        class="status-pill"
                        :class="`status-pill--${campaign.status}`"
                      >
                        {{ campaign.status }}
                      </span>
                      <div class="campaign-progress-mini">
                        <div class="campaign-progress-track">
                          <div
                            class="campaign-progress-fill"
                            :style="{
                              width: `${getFundingPercent(campaign.amountPledged, campaign.fundraisingGoal)}%`,
                            }"
                          ></div>
                        </div>
                        <span class="campaign-progress-label">
                          {{ getFundingPercent(campaign.amountPledged, campaign.fundraisingGoal) }}%
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </section>

              <!-- Support Activity Panel -->
              <section class="dashboard-panel">
                <div class="dashboard-panel-header">
                  <div>
                    <h2 class="dashboard-panel-title">Support Activity</h2>
                    <p class="dashboard-panel-description">Recent pledges and vouches</p>
                  </div>
                </div>

                <div class="dashboard-split">
                  <!-- Pledges Column -->
                  <div class="dashboard-split-column">
                    <div class="dashboard-split-header">
                      <Icon name="heroicons:banknotes" />
                      <span>Recent Pledges</span>
                    </div>
                    <div
                      v-if="pledgesPending"
                      class="dashboard-panel-loading dashboard-panel-loading--sm"
                    >
                      <AppSpinner size="sm" />
                      <span>Loading…</span>
                    </div>
                    <ul
                      v-else-if="pledges.length"
                      class="dashboard-list dashboard-list--compact"
                    >
                      <li
                        v-for="pledge in pledges"
                        :key="pledge.id"
                        class="dashboard-list-item"
                      >
                        <div class="dashboard-list-content">
                          <p class="dashboard-list-title">{{ formatAmount(pledge.amount) }} wei</p>
                          <p class="dashboard-list-meta">{{ formatDate(pledge.pledgedAt) }}</p>
                        </div>
                        <span
                          class="status-pill status-pill--sm"
                          :class="`status-pill--${pledge.status}`"
                        >
                          {{ pledge.status }}
                        </span>
                      </li>
                    </ul>
                    <div
                      v-else
                      class="dashboard-panel-empty dashboard-panel-empty--compact"
                    >
                      <Icon name="heroicons:banknotes" />
                      <span>No pledges yet</span>
                    </div>
                  </div>

                  <!-- Vouches Column -->
                  <div class="dashboard-split-column">
                    <div class="dashboard-split-header">
                      <Icon name="heroicons:hand-thumb-up" />
                      <span>Recent Vouches</span>
                      <NuxtLink
                        to="/my-vouches"
                        class="dashboard-split-link"
                      >
                        View all
                      </NuxtLink>
                    </div>
                    <div
                      v-if="vouchersPending"
                      class="dashboard-panel-loading dashboard-panel-loading--sm"
                    >
                      <AppSpinner size="sm" />
                      <span>Loading…</span>
                    </div>
                    <ul
                      v-else-if="vouchers.length"
                      class="dashboard-list dashboard-list--compact"
                    >
                      <li
                        v-for="voucher in vouchers"
                        :key="voucher.id"
                        class="dashboard-list-item dashboard-list-item--clickable"
                      >
                        <NuxtLink
                          :to="`/vouchers/${voucher.id}`"
                          class="dashboard-list-link"
                        >
                          <div class="dashboard-list-content">
                            <p class="dashboard-list-title">
                              {{ formatAmount(voucher.amount) }} wei
                            </p>
                            <p class="dashboard-list-meta">{{ formatDate(voucher.vouchedAt) }}</p>
                          </div>
                          <span
                            class="status-pill status-pill--sm"
                            :class="`status-pill--${voucher.status}`"
                          >
                            {{ voucher.status }}
                          </span>
                        </NuxtLink>
                      </li>
                    </ul>
                    <div
                      v-else
                      class="dashboard-panel-empty dashboard-panel-empty--compact"
                    >
                      <Icon name="heroicons:hand-thumb-up" />
                      <span>No vouches yet</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Disputes Panel -->
              <section class="dashboard-panel">
                <div class="dashboard-panel-header">
                  <div>
                    <h2 class="dashboard-panel-title">Disputes & Challenges</h2>
                    <p class="dashboard-panel-description">Monitor status and required actions</p>
                  </div>
                  <NuxtLink
                    to="/my-disputes"
                    class="btn btn-secondary btn-sm"
                  >
                    View all
                  </NuxtLink>
                </div>

                <div
                  v-if="disputesPending"
                  class="dashboard-panel-loading"
                >
                  <AppSpinner />
                  <span>Loading disputes…</span>
                </div>

                <ul
                  v-else-if="disputes.length"
                  class="dashboard-list"
                >
                  <li
                    v-for="dispute in disputes"
                    :key="dispute.id"
                    class="dashboard-list-item dashboard-list-item--clickable"
                  >
                    <NuxtLink
                      :to="`/disputes/${dispute.id}`"
                      class="dashboard-list-link"
                    >
                      <div class="dashboard-list-content">
                        <p class="dashboard-list-title">
                          {{ capitalize(dispute.disputeType) }} dispute
                        </p>
                        <p class="dashboard-list-meta">
                          {{ truncateText(dispute.reason, 90) }}
                        </p>
                      </div>
                      <div class="dashboard-list-aside">
                        <span
                          class="status-pill"
                          :class="`status-pill--${dispute.status}`"
                        >
                          {{ dispute.status }}
                        </span>
                        <span class="dashboard-list-date">
                          {{ formatDate(dispute.disputedAt) }}
                        </span>
                      </div>
                    </NuxtLink>
                  </li>
                </ul>

                <div
                  v-else
                  class="dashboard-panel-empty"
                >
                  <Icon name="heroicons:shield-check" />
                  <div>
                    <h3>No disputes filed</h3>
                    <p>All your campaigns are in good standing.</p>
                  </div>
                </div>
              </section>
            </div>

            <!-- Sidebar -->
            <aside class="dashboard-sidebar">
              <!-- Account Summary Card -->
              <div class="sidebar-card">
                <h3 class="sidebar-card-title">
                  <Icon name="heroicons:user-circle" />
                  Account Summary
                </h3>
                <ul class="sidebar-summary">
                  <li>
                    <span class="sidebar-summary-label">Wallet</span>
                    <strong class="sidebar-summary-value sidebar-summary-value--mono">
                      {{ address }}
                    </strong>
                  </li>
                  <li>
                    <span class="sidebar-summary-label">Display name</span>
                    <strong class="sidebar-summary-value">
                      {{ userRecord?.displayName || userRecord?.ensName || 'Not set' }}
                    </strong>
                  </li>
                  <li>
                    <span class="sidebar-summary-label">Member since</span>
                    <strong class="sidebar-summary-value">
                      {{ userRecord?.createdAt ? formatDate(userRecord.createdAt) : '—' }}
                    </strong>
                  </li>
                  <li>
                    <span class="sidebar-summary-label">Campaigns created</span>
                    <strong class="sidebar-summary-value">
                      {{ userRecord?.campaignsCreated ?? campaignsMeta?.total ?? 0 }}
                    </strong>
                  </li>
                  <li>
                    <span class="sidebar-summary-label">Pledges made</span>
                    <strong class="sidebar-summary-value">
                      {{ userRecord?.pledgesMade ?? pledgesMeta?.total ?? 0 }}
                    </strong>
                  </li>
                </ul>
              </div>

              <!-- Upcoming Deadlines Card -->
              <div class="sidebar-card">
                <h3 class="sidebar-card-title">
                  <Icon name="heroicons:clock" />
                  Upcoming Deadlines
                </h3>
                <div
                  v-if="expiringCampaigns.length"
                  class="sidebar-deadlines"
                >
                  <div
                    v-for="campaign in expiringCampaigns"
                    :key="campaign.id"
                    class="sidebar-deadline-item"
                  >
                    <div class="sidebar-deadline-content">
                      <p class="sidebar-deadline-name">{{ campaign.name }}</p>
                      <span class="sidebar-deadline-date">
                        Ends {{ formatDate(campaign.endDate) }}
                      </span>
                    </div>
                    <NuxtLink
                      :to="`/@${campaign.slug || campaign.id}`"
                      class="sidebar-deadline-link"
                    >
                      View
                    </NuxtLink>
                  </div>
                </div>
                <p
                  v-else
                  class="sidebar-card-empty"
                >
                  No campaigns ending in the next 7 days.
                </p>
              </div>

              <!-- Quick Actions Card -->
              <div class="sidebar-card sidebar-card--accent">
                <h3 class="sidebar-card-title">
                  <Icon name="heroicons:bolt" />
                  Quick Actions
                </h3>
                <div class="sidebar-actions">
                  <NuxtLink
                    to="/campaigns/create"
                    class="sidebar-action-link"
                  >
                    <Icon name="heroicons:plus" />
                    Draft a campaign
                  </NuxtLink>
                  <NuxtLink
                    to="/campaigns"
                    class="sidebar-action-link"
                  >
                    <Icon name="heroicons:globe-alt" />
                    Explore campaigns
                  </NuxtLink>
                  <button
                    type="button"
                    class="sidebar-action-link"
                  >
                    <Icon name="heroicons:document-arrow-down" />
                    Download report
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useSeoMeta } from 'nuxt/app'
import { useWallet } from '../../composables/useWallet'
import { capitalize, formatDate, formatNumber, truncateText } from '../../utils/formatters'

// SEO Meta
useSeoMeta({
  title: 'Dashboard - Pledgebook',
  description:
    'Track your campaigns, pledges, vouches, and disputes with a single view of your on-chain activity.',
})

// Wallet connection
const { isConnected, address, trimmedAddress, balance } = useWallet()

// Greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

// Fetch admin config from API
type AdminConfigResponse = {
  data?: {
    allowlist?: string[]
  }
}

type ApiMeta = {
  total?: number
}

type ApiListResponse<T> = {
  data?: T[]
  meta?: ApiMeta
}

type UserRecord = {
  displayName?: string
  ensName?: string
  reputationScore?: number
  totalPledged?: string
  campaignsCreated?: number
  pledgesMade?: number
  createdAt?: string
}

type Campaign = {
  id: string
  name: string
  slug?: string
  fundraisingGoal: string
  amountPledged: string
  endDate: string
  status: string
}

type Pledge = {
  id: string
  amount: string
  pledgedAt: string
  status: string
}

type Voucher = {
  id: string
  amount: string
  vouchedAt: string
  status: string
}

type Dispute = {
  id: string
  disputeType: string
  reason: string
  status: string
  disputedAt: string
}

const { data: adminConfig } = await useFetch<AdminConfigResponse>('/api/admin/config')

const adminAllowlist = computed(() => adminConfig.value?.data?.allowlist || [])

const isAdmin = computed(() => {
  if (!isConnected.value || !address.value) return false
  return adminAllowlist.value.includes(address.value.toLowerCase())
})

// User record
const { data: userResponse, pending: userPending } = useFetch<ApiListResponse<UserRecord>>(
  () => `/api/users?search=${encodeURIComponent(address.value || '')}&limit=1`,
)

// Campaigns data
const { data: campaignsResponse, pending: campaignsPending } = useFetch<ApiListResponse<Campaign>>(
  () =>
    `/api/campaigns?creatorAddress=${address.value || ''}&limit=6&sortBy=created_at&sortOrder=desc`,
)

const { data: campaignsActiveResponse } = useFetch<ApiListResponse<Campaign>>(
  () => `/api/campaigns?creatorAddress=${address.value || ''}&status=active&limit=1`,
)

const { data: campaignsCompleteResponse } = useFetch<ApiListResponse<Campaign>>(
  () => `/api/campaigns?creatorAddress=${address.value || ''}&status=complete&limit=1`,
)

// Pledges data
const { data: pledgesResponse, pending: pledgesPending } = useFetch<ApiListResponse<Pledge>>(
  () =>
    `/api/pledges?pledgerAddress=${address.value || ''}&limit=5&sortBy=pledged_at&sortOrder=desc`,
)

// Vouchers data
const { data: vouchersResponse, pending: vouchersPending } = useFetch<ApiListResponse<Voucher>>(
  () =>
    `/api/vouchers?voucherAddress=${address.value || ''}&limit=5&sortBy=vouched_at&sortOrder=desc`,
)

// Disputes data
const { data: disputesResponse, pending: disputesPending } = useFetch<ApiListResponse<Dispute>>(
  () =>
    `/api/disputers?disputerAddress=${address.value || ''}&limit=5&sortBy=disputed_at&sortOrder=desc`,
)

// Active counts
const { data: activePledgesResponse } = useFetch<ApiListResponse<Pledge>>(
  () => `/api/pledges?pledgerAddress=${address.value || ''}&status=active&limit=1`,
)

const { data: activeVouchesResponse } = useFetch<ApiListResponse<Voucher>>(
  () => `/api/vouchers?voucherAddress=${address.value || ''}&status=active&limit=1`,
)

const { data: pendingDisputesResponse } = useFetch<ApiListResponse<Dispute>>(
  () => `/api/disputers?disputerAddress=${address.value || ''}&status=pending&limit=1`,
)

const { data: activeDisputesResponse } = useFetch<ApiListResponse<Dispute>>(
  () => `/api/disputers?disputerAddress=${address.value || ''}&status=active&limit=1`,
)

// Computed values
const userRecord = computed(() => userResponse.value?.data?.[0])
const campaignsMeta = computed(() => campaignsResponse.value?.meta)
const pledgesMeta = computed(() => pledgesResponse.value?.meta)
const vouchersMeta = computed(() => vouchersResponse.value?.meta)
const disputesMeta = computed(() => disputesResponse.value?.meta)

const createdCampaigns = computed(() => campaignsResponse.value?.data || [])
const pledges = computed(() => pledgesResponse.value?.data || [])
const vouchers = computed(() => vouchersResponse.value?.data || [])
const disputes = computed(() => disputesResponse.value?.data || [])

const activeCampaignsCount = computed(() => campaignsActiveResponse.value?.meta?.total ?? 0)
const completedCampaignsCount = computed(() => campaignsCompleteResponse.value?.meta?.total ?? 0)
const activePledgesCount = computed(() => activePledgesResponse.value?.meta?.total ?? 0)
const activeVouchesCount = computed(() => activeVouchesResponse.value?.meta?.total ?? 0)
const pendingDisputesCount = computed(
  () =>
    (pendingDisputesResponse.value?.meta?.total ?? 0) +
    (activeDisputesResponse.value?.meta?.total ?? 0),
)

const totalPledgedFromList = computed(() => {
  if (!pledges.value.length) return '0'
  return pledges.value
    .reduce((sum: bigint, pledge: { amount: string }) => sum + BigInt(pledge.amount), 0n)
    .toString()
})

const expiringCampaigns = computed(() => {
  if (!createdCampaigns.value.length) return []
  const now = Date.now()
  return createdCampaigns.value
    .filter((campaign: { endDate: string; status: string }) => {
      if (campaign.status !== 'active') return false
      const endDate = new Date(campaign.endDate).getTime()
      const daysRemaining = (endDate - now) / (1000 * 60 * 60 * 24)
      return daysRemaining <= 7 && daysRemaining >= 0
    })
    .slice(0, 3)
})

// Utility functions
function formatAmount(value: string): string {
  return Number(value || '0').toLocaleString()
}

function getFundingPercent(amount: string, goal: string): number {
  try {
    const pledged = BigInt(amount || '0')
    const target = BigInt(goal || '0')
    if (target === 0n) return 0
    return Number((pledged * 10000n) / target) / 100
  } catch {
    return 0
  }
}
</script>

<style scoped>
/* =============================================================================
   DASHBOARD PAGE STYLES
   Follows established patterns from campaigns and admin pages
   ============================================================================= */

.dashboard-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Page Header */
.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 2rem 0;
}

.page-header-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .page-header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.page-header-greeting {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.greeting-text {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.greeting-name {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--interactive-primary);
}

.page-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 36rem;
}

.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-sm);
}

/* Main Content */
.page-main {
  padding: 2rem 0 3rem;
}

/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* =============================================================================
   EMPTY STATE
   ============================================================================= */

.dashboard-empty {
  padding: 2rem 0;
}

.dashboard-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem 2rem;
  border-radius: var(--radius-xl);
  border: 1px dashed var(--border-primary);
  background-color: var(--surface-primary);
  text-align: center;
}

@media (min-width: 768px) {
  .dashboard-empty-card {
    flex-direction: row;
    text-align: left;
    padding: 3rem;
  }
}

.dashboard-empty-illustration {
  width: 5rem;
  height: 5rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 15%, transparent),
    color-mix(in oklch, var(--interactive-primary) 8%, transparent)
  );
  flex-shrink: 0;
}

.dashboard-empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--interactive-primary);
}

.dashboard-empty-content {
  flex: 1;
}

.dashboard-empty-title {
  margin: 0 0 0.5rem;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-empty-description {
  margin: 0 0 1.5rem;
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 32rem;
}

.dashboard-empty-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .dashboard-empty-features {
    grid-template-columns: repeat(4, 1fr);
  }
}

.dashboard-empty-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dashboard-empty-feature svg {
  width: 1rem;
  height: 1rem;
  color: var(--interactive-primary);
  flex-shrink: 0;
}

/* =============================================================================
   STATS GRID
   ============================================================================= */

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

@media (min-width: 1024px) {
  .dashboard-stats {
    grid-template-columns: repeat(6, 1fr);
  }
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
  background-color: var(--surface-primary);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.stat-card--featured {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 8%, var(--surface-primary)),
    var(--surface-primary)
  );
  border-color: color-mix(in oklch, var(--interactive-primary) 25%, var(--border-primary));
}

.stat-card--wallet {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-success-500) 6%, var(--surface-primary)),
    var(--surface-primary)
  );
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.stat-card-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 1.125rem;
}

.stat-card-icon--success {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.stat-card-icon--info {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.stat-card-icon--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.stat-card-icon--danger {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.stat-badge {
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  background-color: var(--surface-secondary);
  color: var(--text-tertiary);
}

.stat-badge--success {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.stat-card-body {
  flex: 1;
}

.stat-card-label {
  margin: 0 0 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-card-value {
  margin: 0 0 0.25rem;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-card-value--mono {
  font-family: var(--font-mono);
  font-feature-settings: 'tnum' 1;
}

.stat-unit {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

.stat-card-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.stat-card-address {
  margin: 0;
  font-size: var(--text-2xs);
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  word-break: break-all;
}

.stat-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.stat-breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.stat-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--radius-full);
  background-color: var(--text-muted);
}

.stat-breakdown-item--active .stat-dot {
  background-color: var(--color-success-500);
}

.stat-breakdown-item--complete .stat-dot {
  background-color: var(--interactive-primary);
}

.stat-card-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding-top: 0.75rem;
  margin-top: auto;
  border-top: 1px solid var(--border-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.stat-card-link:hover {
  color: var(--interactive-primary-hover);
}

.stat-card-link svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* =============================================================================
   MAIN DASHBOARD GRID
   ============================================================================= */

.dashboard-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard-main {
    grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  }
}

.dashboard-primary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* =============================================================================
   PANELS
   ============================================================================= */

.dashboard-panel {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
  background-color: var(--surface-primary);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dashboard-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-panel-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-panel-description {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dashboard-panel-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.dashboard-panel-loading--sm {
  padding: 0.5rem 0;
}

.dashboard-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.dashboard-panel-empty svg {
  width: 2rem;
  height: 2rem;
  color: var(--text-muted);
}

.dashboard-panel-empty h3 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-panel-empty p {
  margin: 0;
  font-size: var(--text-sm);
}

.dashboard-panel-empty--compact {
  flex-direction: row;
  padding: 1rem 0;
  gap: 0.5rem;
  font-size: var(--text-sm);
}

.dashboard-panel-empty--compact svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* =============================================================================
   LISTS
   ============================================================================= */

.dashboard-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.dashboard-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-secondary);
}

.dashboard-list-item:first-child {
  padding-top: 0;
}

.dashboard-list-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.dashboard-list--compact .dashboard-list-item {
  padding: 0.75rem 0;
}

.dashboard-list-content {
  min-width: 0;
  flex: 1;
}

.dashboard-list-title {
  display: block;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

a.dashboard-list-title:hover {
  color: var(--interactive-primary);
}

.dashboard-list-meta {
  margin: 0.25rem 0 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.dashboard-list-aside {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  flex-shrink: 0;
}

.dashboard-list-date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Campaign Progress Mini */
.campaign-progress-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campaign-progress-track {
  width: 80px;
  height: 5px;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.campaign-progress-fill {
  height: 100%;
  background-color: var(--interactive-primary);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.campaign-progress-label {
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  min-width: 2.5rem;
  text-align: right;
}

/* =============================================================================
   SPLIT LAYOUT
   ============================================================================= */

.dashboard-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .dashboard-split {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dashboard-split-column {
  display: flex;
  flex-direction: column;
}

.dashboard-split-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dashboard-split-header svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

.dashboard-split-link {
  margin-left: auto;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.dashboard-split-link:hover {
  color: var(--interactive-primary-hover);
  text-decoration: underline;
}

.dashboard-list-item--clickable {
  padding: 0;
}

.dashboard-list-item--clickable:hover {
  background-color: var(--surface-secondary);
}

.dashboard-list-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 0;
  text-decoration: none;
  color: inherit;
}

.dashboard-list-link:hover .dashboard-list-title {
  color: var(--interactive-primary);
}

/* =============================================================================
   STATUS PILLS
   ============================================================================= */

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

.status-pill--sm {
  padding: 0.125rem 0.5rem;
  font-size: var(--text-2xs);
}

.status-pill--active,
.status-pill--approved,
.status-pill--confirmed {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.status-pill--pending,
.status-pill--submitted {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.status-pill--failed,
.status-pill--rejected,
.status-pill--slashed {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.status-pill--complete,
.status-pill--released {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.status-pill--draft {
  background-color: var(--surface-secondary);
  color: var(--text-tertiary);
}

/* =============================================================================
   SIDEBAR
   ============================================================================= */

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card {
  padding: 1.25rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
  background-color: var(--surface-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card--accent {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 8%, var(--surface-primary)),
    color-mix(in oklch, var(--color-accent-500) 5%, var(--surface-primary))
  );
  border-color: transparent;
}

.sidebar-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.sidebar-card-title svg {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-tertiary);
}

.sidebar-card-empty {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Sidebar Summary */
.sidebar-summary {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-summary li {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sidebar-summary-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.sidebar-summary-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  word-break: break-word;
}

.sidebar-summary-value--mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

/* Sidebar Deadlines */
.sidebar-deadlines {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-deadline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.sidebar-deadline-content {
  min-width: 0;
  flex: 1;
}

.sidebar-deadline-name {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-deadline-date {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.sidebar-deadline-link {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
  text-decoration: none;
  flex-shrink: 0;
}

.sidebar-deadline-link:hover {
  text-decoration: underline;
}

/* Sidebar Actions */
.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-action-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  background-color: rgba(255, 255, 255, 0.5);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all var(--transition-fast);
}

.sidebar-action-link:hover {
  background-color: rgba(255, 255, 255, 0.75);
}

.sidebar-action-link svg {
  width: 1rem;
  height: 1rem;
  color: var(--interactive-primary);
}

/* Dark mode adjustments for sidebar actions */
.dark .sidebar-action-link {
  background-color: var(--surface-secondary);
}

.dark .sidebar-action-link:hover {
  background-color: var(--surface-hover);
}
</style>
