<template>
  <div class="campaign-page">
    <!-- Compact Header Bar -->
    <header class="campaign-header">
      <div class="container-app">
        <div class="campaign-header__row">
          <NuxtLink
            to="/campaigns"
            class="campaign-header__back"
          >
            <Icon name="heroicons:arrow-left" />
            <span>Campaigns</span>
          </NuxtLink>
          <div class="campaign-header__status">
            <span class="status-badge status-badge--success">
              <Icon name="heroicons:check-badge" />
              {{ campaign.statusLabel }}
            </span>
            <span class="campaign-header__deadline">
              <Icon name="heroicons:clock" />
              {{ campaign.daysLeft }}d left
            </span>
          </div>
          <div class="campaign-header__actions">
            <button
              type="button"
              class="btn btn--ghost btn--sm"
            >
              <Icon name="heroicons:share" />
              <span class="btn__label-desktop">Share</span>
            </button>
            <button
              type="button"
              class="btn btn--secondary btn--sm"
            >
              <Icon name="heroicons:star" />
              <span class="btn__label-desktop">Watch</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="campaign-main">
      <div class="container-app">
        <!-- Main Content Grid -->
        <div class="campaign-grid">
          <!-- Left Column: Core Content -->
          <div class="campaign-grid__main">
            <!-- Pledge Form Section -->
            <section class="campaign-pledge-section">
              <PledgeForm
                :campaign-title="campaign.title"
                :campaign-slug="route.params.slug as string"
                :campaign-id="rawCampaign?.id"
                :escrow-address="rawCampaign?.escrowAddress ?? undefined"
              />
            </section>

            <!-- Hero Section: Title + Progress -->
            <section class="campaign-hero">
              <div class="campaign-hero__media">
                <img
                  :src="campaign.coverImage"
                  :alt="campaign.title"
                  @error="handleImageError"
                />
                <div class="campaign-hero__overlay">
                  <div class="campaign-hero__category">
                    <Icon name="heroicons:heart" />
                    {{ campaign.tags[0] }}
                  </div>
                </div>
              </div>
              <div class="campaign-hero__content">
                <div class="campaign-hero__meta">
                  <span class="campaign-hero__creator">
                    <Icon name="heroicons:user-circle" />
                    {{ campaign.creator }}
                  </span>
                  <span class="campaign-hero__location">
                    <Icon name="heroicons:map-pin" />
                    {{ campaign.location }}
                  </span>
                </div>
                <h1 class="campaign-hero__title">
                  {{ campaign.title }}
                </h1>
                <p class="campaign-hero__subtitle">
                  {{ campaign.subtitle }}
                </p>

                <!-- Progress Card -->
                <div class="progress-card">
                  <div class="progress-card__bar">
                    <div
                      class="progress-card__fill"
                      :style="{ width: `${campaign.progress}%` }"
                    ></div>
                  </div>
                  <div class="progress-card__stats">
                    <div class="progress-card__stat progress-card__stat--primary">
                      <span class="progress-card__value">{{ campaign.pledged }}</span>
                      <span class="progress-card__label">of {{ campaign.goal }}</span>
                    </div>
                    <div class="progress-card__stat">
                      <span class="progress-card__value">{{ campaign.progress }}%</span>
                      <span class="progress-card__label">funded</span>
                    </div>
                    <div class="progress-card__stat">
                      <span class="progress-card__value">{{ campaign.pledgers }}</span>
                      <span class="progress-card__label">pledgers</span>
                    </div>
                    <div class="progress-card__stat">
                      <span class="progress-card__value">{{ campaign.vouchers }}</span>
                      <span class="progress-card__label">vouchers</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <!-- The Pledge (What) -->
            <section class="card">
              <div class="card__header">
                <div class="card__icon card__icon--accent">
                  <Icon name="heroicons:flag" />
                </div>
                <div>
                  <h2 class="card__title">The Pledge</h2>
                  <p class="card__subtitle">What the creator commits to accomplish</p>
                </div>
              </div>
              <blockquote class="pledge-statement">
                {{ campaign.pledgeStatement }}
              </blockquote>
              <div class="pledge-tags">
                <span
                  v-for="tag in campaign.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </section>

            <!-- Verification (How) -->
            <section class="card">
              <div class="card__header">
                <div class="card__icon card__icon--success">
                  <Icon name="heroicons:shield-check" />
                </div>
                <div>
                  <h2 class="card__title">How It's Verified</h2>
                  <p class="card__subtitle">AI consensus determines outcome</p>
                </div>
                <span class="pill pill--muted">{{ campaign.consensusModel }}</span>
              </div>

              <div class="verification-grid">
                <div class="verification-item">
                  <span class="verification-item__label">Consensus Threshold</span>
                  <span class="verification-item__value">{{ campaign.consensus }}</span>
                </div>
                <div class="verification-item">
                  <span class="verification-item__label">Verification State</span>
                  <span class="verification-item__value">{{ campaign.verificationState }}</span>
                </div>
                <div class="verification-item">
                  <span class="verification-item__label">Proof of Impact</span>
                  <span class="verification-item__value">{{ campaign.proof }}</span>
                </div>
                <div class="verification-item">
                  <span class="verification-item__label">Privacy Mode</span>
                  <span class="verification-item__value">{{ campaign.privacy }}</span>
                </div>
              </div>

              <div class="consensus-prompt">
                <div class="consensus-prompt__header">
                  <span class="consensus-prompt__label">Consensus Prompt</span>
                  <code class="consensus-prompt__hash">
                    {{ campaign.promptHash.slice(0, 16) }}...{{ campaign.promptHash.slice(-8) }}
                  </code>
                </div>
                <p class="consensus-prompt__text">
                  {{ campaign.consensusPrompt }}
                </p>
              </div>
            </section>

            <!-- Data Sources -->
            <section class="card">
              <div class="card__header">
                <div class="card__icon">
                  <Icon name="heroicons:circle-stack" />
                </div>
                <div>
                  <h2 class="card__title">Data Sources</h2>
                  <p class="card__subtitle">Evidence used for verification</p>
                </div>
              </div>
              <div class="sources-list">
                <div
                  v-for="source in campaign.dataSources"
                  :key="source.label"
                  class="source-item"
                >
                  <div class="source-item__icon">
                    <Icon :name="getSourceIcon(source.type)" />
                  </div>
                  <div class="source-item__content">
                    <span class="source-item__name">{{ source.label }}</span>
                    <span class="source-item__detail">{{ source.detail }}</span>
                  </div>
                  <span class="pill pill--sm">{{ source.type }}</span>
                </div>
              </div>
            </section>

            <!-- Top Pledgers -->
            <section class="card">
              <div class="card__header">
                <div class="card__icon">
                  <Icon name="heroicons:users" />
                </div>
                <div>
                  <h2 class="card__title">Top Pledgers</h2>
                  <p class="card__subtitle">{{ campaign.pledgers }} supporters</p>
                </div>
                <NuxtLink
                  :to="`/@${route.params.slug}/pledges`"
                  class="btn btn--ghost btn--sm"
                >
                  View all
                </NuxtLink>
              </div>
              <div class="pledger-list">
                <NuxtLink
                  v-for="(donor, index) in donors"
                  :key="donor.id"
                  :to="`/@${route.params.slug}/pledges/${donor.id}`"
                  class="pledger-item"
                >
                  <span class="pledger-item__rank">{{ index + 1 }}</span>
                  <div class="pledger-item__avatar">
                    {{ donor.initials }}
                  </div>
                  <div class="pledger-item__info">
                    <span class="pledger-item__name">{{ donor.name }}</span>
                    <span class="pledger-item__note">{{ donor.note }}</span>
                  </div>
                  <div class="pledger-item__amount">
                    <span class="pledger-item__value">{{ donor.amount }}</span>
                    <span class="pledger-item__time">{{ donor.time }}</span>
                  </div>
                  <span class="pledger-item__chevron">
                    <Icon name="heroicons:chevron-right" />
                  </span>
                </NuxtLink>
              </div>
            </section>
          </div>

          <!-- Right Column: Sidebar -->
          <aside class="campaign-grid__sidebar">
            <!-- Pledge CTA Card -->
            <div class="sidebar-card sidebar-card--pledge">
              <div class="pledge-cta__header">
                <div class="pledge-cta__amount">
                  <span class="pledge-cta__value">{{ campaign.pledged }}</span>
                  <span class="pledge-cta__goal">of {{ campaign.goal }} goal</span>
                </div>
                <span class="pledge-cta__percent">{{ campaign.progress }}%</span>
              </div>
              <div class="pledge-cta__bar">
                <div
                  class="pledge-cta__fill"
                  :style="{ width: `${campaign.progress}%` }"
                ></div>
              </div>
              <div class="pledge-cta__meta">
                <span class="pledge-cta__stat">
                  <Icon name="heroicons:users" />
                  {{ campaign.pledgers }} pledgers
                </span>
                <span class="pledge-cta__stat">
                  <Icon name="heroicons:clock" />
                  {{ campaign.daysLeft }}d left
                </span>
              </div>
              <p class="pledge-cta__note">
                <Icon name="heroicons:shield-check" />
                Funds held in escrow until verified
              </p>
              <a
                v-if="campaign.escrowAddress"
                :href="`https://basescan.org/address/${campaign.escrowAddress}`"
                target="_blank"
                rel="noopener noreferrer"
                class="pledge-cta__escrow"
              >
                <Icon name="heroicons:lock-closed" />
                <span>View Escrow Contract</span>
                <Icon name="heroicons:arrow-top-right-on-square" />
              </a>
            </div>

            <!-- Quick Stats -->
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">Campaign Snapshot</h3>
              <div class="snapshot-grid">
                <div class="snapshot-item">
                  <Icon name="heroicons:signal" />
                  <div>
                    <span class="snapshot-item__label">Status</span>
                    <span class="snapshot-item__value">{{ campaign.state }}</span>
                  </div>
                </div>
                <div class="snapshot-item">
                  <Icon name="heroicons:calendar" />
                  <div>
                    <span class="snapshot-item__label">Deadline</span>
                    <span class="snapshot-item__value">{{ campaign.daysLeft }} days</span>
                  </div>
                </div>
                <div class="snapshot-item">
                  <Icon name="heroicons:hand-thumb-up" />
                  <div>
                    <span class="snapshot-item__label">Vouchers</span>
                    <span class="snapshot-item__value">{{ campaign.vouchers }}</span>
                  </div>
                </div>
                <div class="snapshot-item">
                  <Icon name="heroicons:exclamation-triangle" />
                  <div>
                    <span class="snapshot-item__label">Disputes</span>
                    <span class="snapshot-item__value">{{ campaign.disputes }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Vouchers -->
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">Recent Vouchers</h3>
              <div class="voucher-list">
                <div
                  v-for="voucher in vouchers"
                  :key="voucher.id"
                  class="voucher-item"
                >
                  <div class="voucher-item__info">
                    <span class="voucher-item__name">{{ voucher.name }}</span>
                    <span class="voucher-item__note">{{ voucher.note }}</span>
                  </div>
                  <span class="voucher-item__amount">{{ voucher.amount }}</span>
                </div>
              </div>
              <button
                type="button"
                class="btn btn--secondary btn--full sidebar-card__btn"
                @click="showVouchModal = true"
              >
                <Icon name="heroicons:shield-check" />
                Vouch for Campaign
              </button>
            </div>

            <!-- Report Concerns -->
            <div class="sidebar-card sidebar-card--warning">
              <h3 class="sidebar-card__title">Have Concerns?</h3>
              <p class="sidebar-card__text">
                If you believe this campaign is fraudulent or misleading, you can file a dispute.
              </p>
              <button
                type="button"
                class="btn btn--ghost btn--full sidebar-card__btn sidebar-card__btn--danger"
                @click="showDisputeModal = true"
              >
                <Icon name="heroicons:flag" />
                File a Dispute
              </button>
            </div>

            <!-- CTA Card -->
            <div class="sidebar-card sidebar-card--cta">
              <Icon
                name="heroicons:document-magnifying-glass"
                class="sidebar-card__icon"
              />
              <h3 class="sidebar-card__title">Evidence Log</h3>
              <p class="sidebar-card__text">
                Review verification history, disputes, and on-chain transactions.
              </p>
              <button
                type="button"
                class="btn btn--secondary btn--full"
              >
                <Icon name="heroicons:arrow-top-right-on-square" />
                View Evidence
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <!-- Vouch Modal -->
    <VouchModal
      v-model:visible="showVouchModal"
      :campaign-id="rawCampaign.id"
      :campaign-title="campaign.title"
      :campaign-slug="route.params.slug as string"
      :escrow-address="rawCampaign.escrowAddress ?? undefined"
      @success="handleVouchSuccess"
    />

    <!-- Dispute Modal -->
    <DisputeModal
      v-model:visible="showDisputeModal"
      :campaign-id="rawCampaign.id"
      :campaign-title="campaign.title"
      :campaign-slug="route.params.slug as string"
      :escrow-address="rawCampaign.escrowAddress ?? undefined"
      @success="handleDisputeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSeoMeta, useAsyncData, createError } from 'nuxt/app'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Modal state
const showVouchModal = ref(false)
const showDisputeModal = ref(false)

// Fallback image for missing campaign images
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=80'

// Fetch campaign data from API
const { data: campaignResponse, error: campaignError } = await useAsyncData(
  `campaign-${slug.value}`,
  () =>
    $fetch<{
      success: boolean
      data: {
        id: string
        name: string
        slug: string
        purpose: string
        rulesAndResolution: string
        prompt: string
        promptHash: string
        status: string
        baselineData: Record<string, unknown>
        privacyMode: boolean
        consensusThreshold: number
        creatorAddress: string
        creatorBond: string
        amountPledged: string
        fundraisingGoal: string
        tags: string[]
        categories: string[]
        imageUrl: string | null
        bannerUrl: string | null
        isVerified: boolean
        isDisputed: boolean
        escrowAddress: string | null
        startDate: string | null
        endDate: string
        pledgeCount: number
        uniquePledgers: number
        voucherCount: number
        disputerCount: number
      }
    }>(`/api/campaigns/${slug.value}`),
)

// Handle campaign not found
if (campaignError.value || !campaignResponse.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Campaign not found',
    message: `The campaign "${slug.value}" could not be found.`,
  })
}

const rawCampaign = campaignResponse.value.data

// Transform API response to template format
const campaign = computed(() => {
  const c = rawCampaign
  const pledged = Number(c.amountPledged ?? 0) / 1e6 // wei to USDC
  const goal = Number(c.fundraisingGoal ?? 1) / 1e6
  const progress = goal > 0 ? Math.min(Math.round((pledged / goal) * 100), 100) : 0
  const daysLeft = c.endDate
    ? Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000))
    : 0
  const avgPledge = c.uniquePledgers > 0 ? Math.round(pledged / c.uniquePledgers) : 0

  // Determine status label based on campaign state
  let statusLabel = c.status.charAt(0).toUpperCase() + c.status.slice(1)
  if (c.isVerified && c.status === 'active') {
    statusLabel = 'Verified & Active'
  } else if (c.isDisputed) {
    statusLabel = 'Disputed'
  }

  return {
    title: c.name,
    subtitle: c.purpose,
    statusLabel,
    state: c.status,
    creator: c.creatorAddress
      ? `${c.creatorAddress.slice(0, 6)}...${c.creatorAddress.slice(-4)}`
      : 'Unknown',
    location: 'Global', // Could be extracted from baselineData if available
    daysLeft,
    pledged: `$${pledged.toLocaleString()}`,
    goal: `$${goal.toLocaleString()}`,
    progress,
    pledgers: c.uniquePledgers,
    avgPledge: `$${avgPledge.toLocaleString()}`,
    vouchers: c.voucherCount,
    disputes: c.disputerCount,
    consensus: `${Math.round(c.consensusThreshold * 100)}% multi-AI consensus`,
    consensusModel: 'Consensus prompt v2.1',
    verificationState: c.isVerified ? 'Verified · CRE monitoring' : 'Pending verification',
    proof: 'Evidence-based verification',
    privacy: c.privacyMode ? 'ZKP enabled' : 'Public',
    escrowAddress: c.escrowAddress ?? '0x0000000000000000000000000000000000000000',
    pledgeStatement: c.rulesAndResolution,
    promptHash: c.promptHash,
    consensusPrompt: c.prompt,
    dataSources: [
      {
        label: 'Verification Data',
        detail: 'Data sources for campaign verification.',
        type: 'Public API',
      },
    ],
    coverImage: getValidImageUrl(c.imageUrl) ?? getValidImageUrl(c.bannerUrl) ?? FALLBACK_IMAGE,
    about: c.purpose,
    tags: c.tags.length > 0 ? c.tags : c.categories.length > 0 ? c.categories : ['General'],
  }
})

/**
 * Validate image URL - returns null for invalid local paths
 */
function getValidImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  // If it's an external URL (starts with http/https), use it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Local paths starting with /images/campaigns/ don't exist - return null
  if (url.startsWith('/images/campaigns/')) {
    return null
  }
  return url
}

useSeoMeta({
  title: `${campaign.value.title} - Campaign Details | Pledgebook`,
  description: campaign.value.subtitle,
})

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // Check if we haven't already set the fallback (comparing by URL pattern since img.src is absolute)
  if (!img.src.includes('unsplash.com/photo-1504893524553')) {
    img.src = FALLBACK_IMAGE
  }
}

function getSourceIcon(type: string): string {
  const icons: Record<string, string> = {
    'Public API': 'heroicons:globe-alt',
    'Government data': 'heroicons:building-library',
    'Image + OCR': 'heroicons:photo',
  }
  return icons[type] || 'heroicons:document'
}

// TODO: Fetch real pledges/donors from API when endpoint is available
const donors = ref([
  {
    id: 'pledge-1',
    name: 'Anonymous',
    initials: 'AN',
    amount: '$0',
    time: 'Recently',
    note: 'Pledge data coming soon.',
  },
])

// TODO: Fetch real vouchers from API when endpoint is available
const vouchers = ref([
  {
    id: 'voucher-1',
    name: 'Voucher data',
    amount: '$0',
    note: 'Coming soon',
  },
])

// Modal success handlers
function handleVouchSuccess(voucherId: string, txHash: string) {
  // TODO: Refresh vouchers list and show success notification
  console.log('Vouch submitted:', voucherId, txHash)
}

function handleDisputeSuccess(disputeId: string, txHash: string) {
  // TODO: Show success notification and potentially redirect to dispute page
  console.log('Dispute submitted:', disputeId, txHash)
}
</script>

<style scoped>
/* =============================================================================
   CAMPAIGN DETAIL PAGE - Refined Layout & Design
   ============================================================================= */

.campaign-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* -----------------------------------------------------------------------------
   Header Bar - Compact, balanced layout
   ----------------------------------------------------------------------------- */

.campaign-header {
  position: sticky;
  top: var(--header-total-height);
  z-index: 50;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0.625rem 0;
}

.campaign-header__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.campaign-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  flex-shrink: 0;
}

.campaign-header__back:hover {
  color: var(--text-primary);
}

.campaign-header__back .icon {
  width: 1rem;
  height: 1rem;
}

.campaign-header__status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.campaign-header__deadline {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.campaign-header__deadline .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.campaign-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-badge .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.status-badge--success {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

/* -----------------------------------------------------------------------------
   Main Content Area
   ----------------------------------------------------------------------------- */

.campaign-main {
  padding: 1.25rem 0 3rem;
}

/* -----------------------------------------------------------------------------
   Pledge Form Section - Inline pledge form at top of content
   ----------------------------------------------------------------------------- */

.campaign-pledge-section {
  margin-bottom: 1.5rem;
}

/* -----------------------------------------------------------------------------
   Hero Section - Image + Key Info (inside main column)
   ----------------------------------------------------------------------------- */

.campaign-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .campaign-hero {
    grid-template-columns: 200px 1fr;
    gap: 1rem;
    align-items: start;
  }
}

@media (min-width: 1024px) {
  .campaign-hero {
    grid-template-columns: 220px 1fr;
  }
}

.campaign-hero__media {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background-color: var(--surface-secondary);
}

@media (min-width: 768px) {
  .campaign-hero__media {
    aspect-ratio: 1;
    height: auto;
    max-height: 200px;
  }
}

.campaign-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.campaign-hero__overlay {
  position: absolute;
  top: 0.625rem;
  left: 0.625rem;
}

.campaign-hero__category {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.campaign-hero__category .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.campaign-hero__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.campaign-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.campaign-hero__creator,
.campaign-hero__location {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.campaign-hero__creator .icon,
.campaign-hero__location .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.campaign-hero__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin: 0;
}

@media (min-width: 768px) {
  .campaign-hero__title {
    font-size: var(--text-3xl);
  }
}

.campaign-hero__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 48rem;
}

/* Hero CTA */
.campaign-hero__cta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

/* Progress Card */
.progress-card {
  margin-top: auto;
  padding: 0.875rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.progress-card__bar {
  height: 6px;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-card__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--interactive-primary), var(--interactive-primary-hover));
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.progress-card__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1rem;
}

@media (min-width: 640px) {
  .progress-card__stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

.progress-card__stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.progress-card__stat--primary {
  grid-column: span 2;
}

@media (min-width: 640px) {
  .progress-card__stat--primary {
    grid-column: span 1;
  }
}

.progress-card__value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.progress-card__stat--primary .progress-card__value {
  font-size: var(--text-xl);
  color: var(--interactive-primary);
}

.progress-card__label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* -----------------------------------------------------------------------------
   Content Grid - Main + Sidebar
   ----------------------------------------------------------------------------- */

.campaign-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 1024px) {
  .campaign-grid {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 1.5rem;
    align-items: start;
  }
}

.campaign-grid__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campaign-grid__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: calc(var(--header-total-height) + 3.5rem);
}

/* -----------------------------------------------------------------------------
   Card Component
   ----------------------------------------------------------------------------- */

.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
}

.card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card__icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
  color: var(--text-tertiary);
}

.card__icon .icon {
  width: 1rem;
  height: 1rem;
}

.card__icon--accent {
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  color: var(--interactive-primary);
}

.card__icon--success {
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-600);
}

.card__header > div:not(.card__icon) {
  flex: 1;
  min-width: 0;
}

.card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.card__subtitle {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0.125rem 0 0;
}

.card__header .btn {
  margin-left: auto;
  flex-shrink: 0;
}

/* -----------------------------------------------------------------------------
   Pledge Statement
   ----------------------------------------------------------------------------- */

.pledge-statement {
  margin: 0;
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-left: 3px solid var(--interactive-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}

.pledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.875rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* -----------------------------------------------------------------------------
   Pill Component
   ----------------------------------------------------------------------------- */

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.pill--muted {
  background-color: var(--surface-secondary);
  color: var(--text-tertiary);
}

.pill--sm {
  padding: 0.1875rem 0.5rem;
  font-size: 0.5625rem;
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  color: var(--interactive-primary);
}

/* -----------------------------------------------------------------------------
   Verification Grid
   ----------------------------------------------------------------------------- */

.verification-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .verification-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.verification-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.verification-item__label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.verification-item__value {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  line-height: 1.3;
}

/* Consensus Prompt */
.consensus-prompt {
  padding: 0.875rem 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.consensus-prompt__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.consensus-prompt__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.consensus-prompt__hash {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  background-color: var(--bg-primary);
  padding: 0.1875rem 0.375rem;
  border-radius: var(--radius-sm);
}

.consensus-prompt__text {
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* -----------------------------------------------------------------------------
   Sources List
   ----------------------------------------------------------------------------- */

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.source-item__icon {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
}

.source-item__icon .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.source-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.source-item__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.source-item__detail {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: 1.4;
}

/* -----------------------------------------------------------------------------
   Pledger List
   ----------------------------------------------------------------------------- */

.pledger-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.pledger-item {
  display: grid;
  grid-template-columns: 1.25rem 2.25rem 1fr auto auto;
  gap: 0.625rem;
  align-items: center;
  padding: 0.5rem 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.pledger-item:hover {
  background-color: var(--surface-hover);
}

.pledger-item__rank {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-tertiary);
  text-align: center;
}

.pledger-item__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--interactive-primary) 14%, transparent);
  color: var(--interactive-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pledger-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  min-width: 0;
}

.pledger-item__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pledger-item__note {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pledger-item__amount {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
}

.pledger-item__value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.pledger-item__time {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

.pledger-item__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.pledger-item__chevron .icon {
  width: 1rem;
  height: 1rem;
}

.pledger-item:hover .pledger-item__chevron {
  color: var(--text-secondary);
}

/* -----------------------------------------------------------------------------
   Sidebar Cards
   ----------------------------------------------------------------------------- */

.sidebar-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1rem;
}

.sidebar-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.sidebar-card__text {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  margin: 0 0 0.75rem;
}

.sidebar-card__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.sidebar-card--cta {
  text-align: center;
  padding: 1.25rem 1rem;
}

.sidebar-card--cta .sidebar-card__title {
  margin-bottom: 0.25rem;
}

/* Warning Card Variant */
.sidebar-card--warning {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-warning-500) 8%, var(--bg-primary)),
    var(--bg-primary)
  );
  border-color: color-mix(in oklch, var(--color-warning-500) 25%, var(--border-primary));
}

.sidebar-card--warning .sidebar-card__icon {
  color: var(--color-warning-500);
}

/* Sidebar Card Buttons */
.sidebar-card__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-card__btn:hover {
  background-color: var(--surface-tertiary);
  border-color: var(--border-secondary);
}

.sidebar-card__btn .icon {
  width: 1rem;
  height: 1rem;
}

.sidebar-card__btn--primary {
  color: white;
  background-color: var(--interactive-primary);
  border-color: var(--interactive-primary);
}

.sidebar-card__btn--primary:hover {
  background-color: var(--interactive-primary-hover);
  border-color: var(--interactive-primary-hover);
}

.sidebar-card__btn--danger {
  color: white;
  background-color: var(--color-error-500);
  border-color: var(--color-error-500);
}

.sidebar-card__btn--danger:hover {
  background-color: var(--color-error-600);
  border-color: var(--color-error-600);
}

/* Pledge CTA Card */
.sidebar-card--pledge {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 8%, var(--bg-primary)),
    var(--bg-primary)
  );
  border-color: color-mix(in oklch, var(--interactive-primary) 25%, var(--border-primary));
}

.pledge-cta__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}

.pledge-cta__amount {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.pledge-cta__value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--interactive-primary);
  line-height: 1.1;
}

.pledge-cta__goal {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.pledge-cta__percent {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  background-color: var(--surface-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
}

.pledge-cta__bar {
  height: 6px;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.pledge-cta__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--interactive-primary), var(--interactive-primary-hover));
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.pledge-cta__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.875rem;
}

.pledge-cta__stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.pledge-cta__stat .icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-tertiary);
}

.pledge-cta__note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0.75rem 0 0;
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

.pledge-cta__note .icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-success-500);
}

.pledge-cta__escrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.pledge-cta__escrow .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.pledge-cta__escrow .icon:first-child {
  color: var(--color-success-600);
}

.pledge-cta__escrow .icon:last-child {
  color: var(--text-tertiary);
}

.pledge-cta__escrow:hover {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 8%, transparent);
}

.pledge-cta__escrow:hover .icon:last-child {
  color: var(--interactive-primary);
}

/* Snapshot Grid */
.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.snapshot-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.snapshot-item > .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.snapshot-item > div {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  min-width: 0;
}

.snapshot-item__label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

.snapshot-item__value {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* Voucher List */
.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.voucher-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.voucher-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  min-width: 0;
}

.voucher-item__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.voucher-item__note {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}

.voucher-item__amount {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--interactive-primary);
  flex-shrink: 0;
}

/* -----------------------------------------------------------------------------
   Button Component (scoped overrides)
   ----------------------------------------------------------------------------- */

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

.btn--sm {
  padding: 0.375rem 0.625rem;
  font-size: var(--text-xs);
}

.btn--sm .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.btn--lg {
  padding: 0.75rem 1.5rem;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 8px color-mix(in oklch, var(--interactive-primary) 30%, transparent);
}

.btn--lg .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.btn--lg:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in oklch, var(--interactive-primary) 40%, transparent);
}

.btn--full {
  width: 100%;
}

.btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover {
  background-color: var(--interactive-primary-hover);
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
