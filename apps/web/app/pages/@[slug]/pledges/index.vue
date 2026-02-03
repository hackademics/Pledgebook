<template>
  <div class="pledges-list-page">
    <!-- Header Bar -->
    <header class="pledges-header">
      <div class="container-app">
        <div class="pledges-header__row">
          <NuxtLink
            :to="`/@${campaignSlug}`"
            class="pledges-header__back"
          >
            <Icon name="heroicons:arrow-left" />
            <span>Back to Campaign</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="pledges-main">
      <div class="container-app">
        <!-- Main Grid -->
        <div class="pledges-grid">
          <!-- Left Column: Pledges List -->
          <div class="pledges-grid__main">
            <!-- Page Header -->
            <div class="pledges-page-header">
              <div class="pledges-page-header__content">
                <h1 class="pledges-page-header__title">All Pledges</h1>
                <p class="pledges-page-header__subtitle">
                  {{ totalPledges }} supporters have contributed {{ totalAmount }} to this campaign
                </p>
              </div>
            </div>

            <!-- Filters -->
            <div class="pledges-filters">
              <div class="pledges-filters__search">
                <Icon name="heroicons:magnifying-glass" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search pledgers..."
                  class="pledges-filters__input"
                />
              </div>
              <div class="pledges-filters__sort">
                <select
                  v-model="sortBy"
                  class="pledges-filters__select"
                >
                  <option value="pledged_at">Most Recent</option>
                  <option value="amount">Highest Amount</option>
                </select>
              </div>
            </div>

            <div
              v-if="searchQuery || sortBy !== 'pledged_at'"
              class="pledges-filters__chips"
            >
              <span
                v-if="searchQuery"
                class="filter-chip"
              >
                Search: "{{ searchQuery }}"
              </span>
              <span
                v-if="sortBy !== 'pledged_at'"
                class="filter-chip"
              >
                Sort: {{ sortLabel }}
              </span>
              <button
                type="button"
                class="filter-chip filter-chip--action"
                @click="resetFilters"
              >
                Clear
              </button>
            </div>

            <!-- Pledges List -->
            <div class="pledges-list">
              <NuxtLink
                v-for="(pledge, index) in filteredPledges"
                :key="pledge.id"
                :to="`/@${campaignSlug}/pledges/${pledge.id}`"
                class="pledge-card"
              >
                <span class="pledge-card__rank">{{ index + 1 }}</span>
                <div class="pledge-card__avatar">
                  {{ pledge.isAnonymous ? '?' : pledge.initials }}
                </div>
                <div class="pledge-card__info">
                  <span class="pledge-card__name">
                    {{ pledge.isAnonymous ? 'Anonymous' : pledge.name }}
                  </span>
                  <span class="pledge-card__meta">
                    <Icon name="heroicons:clock" />
                    {{ formatTimeAgo(pledge.pledgedAt) }}
                  </span>
                </div>
                <div class="pledge-card__amount">
                  <span class="pledge-card__value">{{ formatAmount(pledge.amount) }}</span>
                  <span
                    class="pledge-card__status"
                    :class="`pledge-card__status--${pledge.status}`"
                  >
                    {{ getStatusLabel(pledge.status) }}
                  </span>
                </div>
                <a
                  v-if="pledge.txHash"
                  :href="`https://basescan.org/tx/${pledge.txHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pledge-card__tx-link"
                  title="View transaction on Basescan"
                  @click.stop
                >
                  <Icon name="heroicons:arrow-top-right-on-square" />
                </a>
                <span class="pledge-card__chevron">
                  <Icon name="heroicons:chevron-right" />
                </span>
              </NuxtLink>

              <!-- Empty State -->
              <div
                v-if="filteredPledges.length === 0"
                class="pledges-empty"
              >
                <Icon name="heroicons:banknotes" />
                <h3>No pledges yet</h3>
                <p>Be the first to support this campaign!</p>
                <NuxtLink
                  :to="`/@${campaignSlug}`"
                  class="btn btn--primary"
                >
                  <Icon name="heroicons:bolt" />
                  Make a Pledge
                </NuxtLink>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="pledges-pagination"
            >
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <Icon name="heroicons:chevron-left" />
                Previous
              </button>
              <span class="pledges-pagination__info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                Next
                <Icon name="heroicons:chevron-right" />
              </button>
            </div>
          </div>

          <!-- Right Column: Sidebar -->
          <aside class="pledges-grid__sidebar">
            <!-- Campaign Summary -->
            <div class="sidebar-card">
              <NuxtLink
                :to="`/@${campaignSlug}`"
                class="campaign-summary"
              >
                <img
                  :src="campaign.coverImage"
                  :alt="campaign.title"
                  class="campaign-summary__image"
                />
                <div class="campaign-summary__content">
                  <h3 class="campaign-summary__title">{{ campaign.title }}</h3>
                  <span class="campaign-summary__creator">
                    <Icon name="heroicons:user-circle" />
                    {{ campaign.creator }}
                  </span>
                </div>
              </NuxtLink>
              <div class="campaign-summary__progress">
                <div class="campaign-summary__bar">
                  <div
                    class="campaign-summary__fill"
                    :style="{ width: `${campaign.progress}%` }"
                  ></div>
                </div>
                <div class="campaign-summary__stats">
                  <span class="campaign-summary__raised">{{ campaign.pledged }}</span>
                  <span class="campaign-summary__goal">of {{ campaign.goal }}</span>
                </div>
              </div>
              <a
                v-if="campaign.escrowAddress"
                :href="`https://basescan.org/address/${campaign.escrowAddress}`"
                target="_blank"
                rel="noopener noreferrer"
                class="campaign-summary__escrow"
              >
                <Icon name="heroicons:shield-check" />
                <span>View Escrow Contract</span>
                <Icon name="heroicons:arrow-top-right-on-square" />
              </a>
            </div>

            <!-- Stats Card -->
            <div class="sidebar-card">
              <h3 class="sidebar-card__title">Pledge Statistics</h3>
              <div class="stats-grid">
                <div class="stats-item">
                  <Icon name="heroicons:users" />
                  <div>
                    <span class="stats-item__value">{{ totalPledges }}</span>
                    <span class="stats-item__label">Pledgers</span>
                  </div>
                </div>
                <div class="stats-item">
                  <Icon name="heroicons:banknotes" />
                  <div>
                    <span class="stats-item__value">{{ totalAmount }}</span>
                    <span class="stats-item__label">Raised</span>
                  </div>
                </div>
                <div class="stats-item">
                  <Icon name="heroicons:calculator" />
                  <div>
                    <span class="stats-item__value">{{ avgPledge }}</span>
                    <span class="stats-item__label">Avg Pledge</span>
                  </div>
                </div>
                <div class="stats-item">
                  <Icon name="heroicons:clock" />
                  <div>
                    <span class="stats-item__value">{{ campaign.daysLeft }}d</span>
                    <span class="stats-item__label">Remaining</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Card -->
            <div class="sidebar-card sidebar-card--cta">
              <Icon
                name="heroicons:bolt"
                class="sidebar-card__icon"
              />
              <h3 class="sidebar-card__title">Support This Campaign</h3>
              <p class="sidebar-card__text">
                Join {{ totalPledges }} other supporters in making a difference.
              </p>
              <NuxtLink
                :to="`/@${campaignSlug}`"
                class="btn btn--primary btn--full"
              >
                <Icon name="heroicons:bolt" />
                Make a Pledge
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSeoMeta } from 'nuxt/app'
import { formatPledgeAmount, getPledgeStatusConfig } from '../../../types/pledge'
import type { PledgeStatus } from '../../../types/pledge'

const route = useRoute()
const campaignSlug = route.params.slug as string

useSeoMeta({
  title: 'All Pledges | Pledgebook',
  description: 'View all pledges and supporters for this campaign.',
})

// Campaign data - replace with actual API call
const campaign = {
  title: 'Clean Water Access Initiative',
  creator: 'Amina A.',
  coverImage:
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80',
  pledged: '$318,450',
  goal: '$450,000',
  progress: 71,
  daysLeft: 28,
  status: 'Active',
  escrowAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE21',
}

// State
const searchQuery = ref('')
const sortBy = ref('pledged_at')
const currentPage = ref(1)
const perPage = 20

interface PledgeListItem {
  id: string
  name: string
  initials: string
  amount: string
  status: PledgeStatus
  pledgedAt: string
  isAnonymous: boolean
  txHash: string
}

// Mock data - replace with actual API call
const pledges = ref<PledgeListItem[]>([
  {
    id: 'pledge-1',
    name: 'Serena W.',
    initials: 'SW',
    amount: '18200000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-31T10:00:00Z',
    isAnonymous: false,
    txHash: '0x9a3f5c8b7d1e4b6c2f0a6e3d9b8c7f1a4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9',
  },
  {
    id: 'pledge-2',
    name: 'Atlas Capital',
    initials: 'AC',
    amount: '12500000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-31T07:00:00Z',
    isAnonymous: false,
    txHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  },
  {
    id: 'pledge-3',
    name: 'Anonymous',
    initials: '?',
    amount: '10000000000',
    status: 'confirmed' as PledgeStatus,
    pledgedAt: '2026-01-30T15:00:00Z',
    isAnonymous: true,
    txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
  },
  {
    id: 'pledge-4',
    name: 'Nia R.',
    initials: 'NR',
    amount: '6900000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-30T12:00:00Z',
    isAnonymous: false,
    txHash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
  },
  {
    id: 'pledge-5',
    name: 'Kaito Labs',
    initials: 'KL',
    amount: '5300000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-30T09:00:00Z',
    isAnonymous: false,
    txHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
  },
  {
    id: 'pledge-6',
    name: 'Liam C.',
    initials: 'LC',
    amount: '4800000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-29T14:00:00Z',
    isAnonymous: false,
    txHash: '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
  },
  {
    id: 'pledge-7',
    name: 'Maya P.',
    initials: 'MP',
    amount: '3500000000',
    status: 'confirmed' as PledgeStatus,
    pledgedAt: '2026-01-29T11:00:00Z',
    isAnonymous: false,
    txHash: '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
  },
  {
    id: 'pledge-8',
    name: 'James O.',
    initials: 'JO',
    amount: '2500000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-28T16:00:00Z',
    isAnonymous: false,
    txHash: '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
  },
  {
    id: 'pledge-9',
    name: 'Civic Impact DAO',
    initials: 'CI',
    amount: '2000000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-28T10:00:00Z',
    isAnonymous: false,
    txHash: '0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
  },
  {
    id: 'pledge-10',
    name: 'Anonymous',
    initials: '?',
    amount: '1500000000',
    status: 'pending' as PledgeStatus,
    pledgedAt: '2026-01-28T08:00:00Z',
    isAnonymous: true,
    txHash: '0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
  },
])

// Computed
const totalPledges = computed(() => pledges.value.length)

const totalAmount = computed(() => {
  const sum = pledges.value.reduce((acc, pledge) => acc + BigInt(pledge.amount), BigInt(0))
  return formatPledgeAmount(sum.toString())
})

const avgPledge = computed(() => {
  if (pledges.value.length === 0) return '$0'
  const sum = pledges.value.reduce((acc, pledge) => acc + BigInt(pledge.amount), BigInt(0))
  const avg = sum / BigInt(pledges.value.length)
  return formatPledgeAmount(avg.toString())
})

const filteredPledges = computed(() => {
  let result = [...pledges.value]

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (pledge) => !pledge.isAnonymous && pledge.name.toLowerCase().includes(query),
    )
  }

  // Sort
  if (sortBy.value === 'amount') {
    result.sort((a, b) => Number(BigInt(b.amount) - BigInt(a.amount)))
  } else {
    result.sort((a, b) => new Date(b.pledgedAt).getTime() - new Date(a.pledgedAt).getTime())
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredPledges.value.length / perPage))
const sortLabel = computed(() => (sortBy.value === 'amount' ? 'Highest Amount' : 'Most Recent'))

// Methods
function formatAmount(weiAmount: string): string {
  return formatPledgeAmount(weiAmount)
}

function getStatusLabel(status: PledgeStatus): string {
  return getPledgeStatusConfig(status).label
}

function resetFilters() {
  searchQuery.value = ''
  sortBy.value = 'pledged_at'
  currentPage.value = 1
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.pledges-list-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Header */
.pledges-header {
  position: sticky;
  top: var(--header-total-height);
  z-index: 50;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0.625rem 0;
}

.pledges-header__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pledges-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.pledges-header__back:hover {
  color: var(--text-primary);
}

.pledges-header__back .icon {
  width: 1rem;
  height: 1rem;
}

/* Main Content */
.pledges-main {
  padding: 1.5rem 0 3rem;
}

/* Main Grid */
.pledges-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .pledges-grid {
    grid-template-columns: minmax(0, 1fr) 300px;
    align-items: start;
  }
}

.pledges-grid__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pledges-grid__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: calc(var(--header-total-height) + 3.5rem);
}

@media (max-width: 1023px) {
  .pledges-grid__sidebar {
    order: -1;
  }
}

/* Page Header */
.pledges-page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pledges-page-header__content {
  flex: 1;
}

.pledges-page-header__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.pledges-page-header__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.pledges-page-header__stats {
  display: flex;
  gap: 1.5rem;
}

.pledges-stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: center;
}

.pledges-stat__value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.pledges-stat__label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Filters */
.pledges-filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.pledges-filters__search {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.pledges-filters__search .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.pledges-filters__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--text-primary);
  outline: none;
}

.pledges-filters__input::placeholder {
  color: var(--text-tertiary);
}

.pledges-filters__select {
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
}

.pledges-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  border: 1px solid var(--border-primary);
}

.filter-chip--action {
  cursor: pointer;
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  color: var(--interactive-primary);
  border-color: transparent;
}

/* Pledges List */
.pledges-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pledge-card {
  display: grid;
  grid-template-columns: 1.5rem 2.5rem 1fr auto auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.875rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: border-color var(--transition-fast);
}

.pledge-card:hover {
  border-color: var(--border-hover);
}

.pledge-card__rank {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-tertiary);
  text-align: center;
}

.pledge-card__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--interactive-primary) 14%, transparent);
  color: var(--interactive-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pledge-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.pledge-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pledge-card__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.pledge-card__meta .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.pledge-card__amount {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.pledge-card__value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.pledge-card__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1875rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.pledge-card__status--active {
  color: var(--color-success-700);
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
}

.pledge-card__status--confirmed {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
}

.pledge-card__status--pending {
  color: var(--color-warning-700);
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
}

.pledge-card__status--released {
  color: var(--color-success-700);
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
}

.pledge-card__status--refunded {
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
}

.pledge-card__status--failed {
  color: var(--color-error-600);
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
}

.pledge-card__tx-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.pledge-card__tx-link .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.pledge-card__tx-link:hover {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
}

.pledge-card__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.pledge-card__chevron .icon {
  width: 1rem;
  height: 1rem;
}

.pledge-card:hover .pledge-card__chevron {
  color: var(--text-secondary);
}

/* Empty State */
.pledges-empty {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.pledges-empty > .icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.pledges-empty h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.pledges-empty p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

/* Pagination */
.pledges-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pledges-pagination__info {
  font-size: var(--text-sm);
  color: var(--text-secondary);
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

.btn--secondary:hover:not(:disabled) {
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}

.btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--full {
  width: 100%;
}

/* Sidebar Cards */
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
  color: var(--interactive-primary);
  margin-bottom: 0.5rem;
}

.sidebar-card--cta {
  text-align: center;
  padding: 1.25rem 1rem;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 8%, var(--bg-primary)),
    var(--bg-primary)
  );
  border-color: color-mix(in oklch, var(--interactive-primary) 25%, var(--border-primary));
}

.sidebar-card--cta .sidebar-card__title {
  margin-bottom: 0.25rem;
}

/* Campaign Summary */
.campaign-summary {
  display: flex;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 0.75rem;
}

.campaign-summary__image {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.campaign-summary__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.campaign-summary__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-summary__creator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.campaign-summary__creator .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.campaign-summary__progress {
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-primary);
}

.campaign-summary__bar {
  height: 4px;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.campaign-summary__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--interactive-primary), var(--interactive-primary-hover));
  border-radius: var(--radius-full);
}

.campaign-summary__stats {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.campaign-summary__raised {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--interactive-primary);
}

.campaign-summary__goal {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.campaign-summary__escrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.campaign-summary__escrow .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.campaign-summary__escrow .icon:first-child {
  color: var(--color-success-600);
}

.campaign-summary__escrow .icon:last-child {
  color: var(--text-tertiary);
}

.campaign-summary__escrow:hover {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 8%, transparent);
}

.campaign-summary__escrow:hover .icon:last-child {
  color: var(--interactive-primary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.stats-item > .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.stats-item > div {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  min-width: 0;
}

.stats-item__value {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.stats-item__label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
}
</style>
