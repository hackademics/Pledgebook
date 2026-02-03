<template>
  <div class="my-pledges-page">
    <!-- Header Bar -->
    <header class="my-pledges-header">
      <div class="container-app">
        <div class="my-pledges-header__row">
          <NuxtLink
            to="/dashboard"
            class="my-pledges-header__back"
          >
            <Icon name="heroicons:arrow-left" />
            <span>Dashboard</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="my-pledges-main">
      <div class="container-app">
        <!-- Page Header -->
        <div class="my-pledges-page-header">
          <div class="my-pledges-page-header__content">
            <h1 class="my-pledges-page-header__title">My Pledges</h1>
            <p class="my-pledges-page-header__subtitle">
              Track all your contributions and their verification status
            </p>
          </div>
          <div class="my-pledges-page-header__stats">
            <div class="my-pledges-stat">
              <span class="my-pledges-stat__value">{{ totalPledges }}</span>
              <span class="my-pledges-stat__label">Total Pledges</span>
            </div>
            <div class="my-pledges-stat">
              <span class="my-pledges-stat__value">{{ totalAmount }}</span>
              <span class="my-pledges-stat__label">Total Contributed</span>
            </div>
            <div class="my-pledges-stat">
              <span class="my-pledges-stat__value">{{ activePledges }}</span>
              <span class="my-pledges-stat__label">Active</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="my-pledges-filters">
          <div class="my-pledges-filters__tabs">
            <button
              type="button"
              class="filter-tab"
              :class="{ 'filter-tab--active': statusFilter === 'all' }"
              @click="statusFilter = 'all'"
            >
              All
            </button>
            <button
              type="button"
              class="filter-tab"
              :class="{ 'filter-tab--active': statusFilter === 'active' }"
              @click="statusFilter = 'active'"
            >
              Active
            </button>
            <button
              type="button"
              class="filter-tab"
              :class="{ 'filter-tab--active': statusFilter === 'pending' }"
              @click="statusFilter = 'pending'"
            >
              Pending
            </button>
            <button
              type="button"
              class="filter-tab"
              :class="{ 'filter-tab--active': statusFilter === 'released' }"
              @click="statusFilter = 'released'"
            >
              Released
            </button>
            <button
              type="button"
              class="filter-tab"
              :class="{ 'filter-tab--active': statusFilter === 'refunded' }"
              @click="statusFilter = 'refunded'"
            >
              Refunded
            </button>
          </div>
          <div class="my-pledges-filters__sort">
            <select
              v-model="sortBy"
              class="my-pledges-filters__select"
            >
              <option value="pledged_at">Most Recent</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>
        </div>

        <!-- Pledges List -->
        <div class="my-pledges-list">
          <NuxtLink
            v-for="pledge in filteredPledges"
            :key="pledge.id"
            :to="`/@${pledge.campaignSlug}/pledges/${pledge.id}`"
            class="my-pledge-card"
          >
            <div class="my-pledge-card__campaign">
              <img
                :src="pledge.campaignImage"
                :alt="pledge.campaignTitle"
                class="my-pledge-card__image"
              />
              <div class="my-pledge-card__info">
                <span class="my-pledge-card__title">{{ pledge.campaignTitle }}</span>
                <span class="my-pledge-card__creator">
                  <Icon name="heroicons:user-circle" />
                  {{ pledge.campaignCreator }}
                </span>
              </div>
            </div>
            <div class="my-pledge-card__details">
              <div class="my-pledge-card__amount">
                <span class="my-pledge-card__value">{{ formatAmount(pledge.amount) }}</span>
                <span
                  class="my-pledge-card__status"
                  :class="`my-pledge-card__status--${pledge.status}`"
                >
                  {{ getStatusLabel(pledge.status) }}
                </span>
              </div>
              <span class="my-pledge-card__date">
                <Icon name="heroicons:clock" />
                {{ formatTimeAgo(pledge.pledgedAt) }}
              </span>
            </div>
            <span class="my-pledge-card__chevron">
              <Icon name="heroicons:chevron-right" />
            </span>
          </NuxtLink>

          <!-- Empty State -->
          <div
            v-if="filteredPledges.length === 0"
            class="my-pledges-empty"
          >
            <Icon name="heroicons:banknotes" />
            <h3>No pledges found</h3>
            <p v-if="statusFilter === 'all'">
              You haven't made any pledges yet. Discover campaigns to support!
            </p>
            <p v-else>No {{ statusFilter }} pledges found.</p>
            <NuxtLink
              to="/campaigns"
              class="btn btn--primary"
            >
              <Icon name="heroicons:magnifying-glass" />
              Explore Campaigns
            </NuxtLink>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="my-pledges-pagination"
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
          <span class="my-pledges-pagination__info">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSeoMeta } from 'nuxt/app'
import { formatPledgeAmount, getPledgeStatusConfig } from '../types/pledge'
import type { PledgeStatus } from '../types/pledge'

useSeoMeta({
  title: 'My Pledges | Pledgebook',
  description: 'View and track all your pledges and contributions.',
})

// State
const statusFilter = ref<'all' | PledgeStatus>('all')
const sortBy = ref('pledged_at')
const currentPage = ref(1)
const perPage = 10

interface MyPledge {
  id: string
  campaignSlug: string
  campaignTitle: string
  campaignCreator: string
  campaignImage: string
  amount: string
  status: PledgeStatus
  pledgedAt: string
}

// Mock data - replace with actual API call
const pledges = ref<MyPledge[]>([
  {
    id: 'pledge-1',
    campaignSlug: 'clean-water-initiative',
    campaignTitle: 'Clean Water Access Initiative',
    campaignCreator: 'Amina A.',
    campaignImage:
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=400&q=80',
    amount: '5000000000',
    status: 'active' as PledgeStatus,
    pledgedAt: '2026-01-31T10:00:00Z',
  },
  {
    id: 'pledge-2',
    campaignSlug: 'reforestation-project',
    campaignTitle: 'Amazon Reforestation Project',
    campaignCreator: 'EcoFund DAO',
    campaignImage:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
    amount: '2500000000',
    status: 'confirmed' as PledgeStatus,
    pledgedAt: '2026-01-28T15:00:00Z',
  },
  {
    id: 'pledge-3',
    campaignSlug: 'education-for-all',
    campaignTitle: 'Education for All Initiative',
    campaignCreator: 'Learn Foundation',
    campaignImage:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
    amount: '1000000000',
    status: 'released' as PledgeStatus,
    pledgedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'pledge-4',
    campaignSlug: 'solar-energy-villages',
    campaignTitle: 'Solar Energy for Remote Villages',
    campaignCreator: 'Green Power Co.',
    campaignImage:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80',
    amount: '3000000000',
    status: 'pending' as PledgeStatus,
    pledgedAt: '2026-02-01T12:00:00Z',
  },
])

// Computed
const totalPledges = computed(() => pledges.value.length)

const activePledges = computed(
  () => pledges.value.filter((p) => p.status === 'active' || p.status === 'confirmed').length,
)

const totalAmount = computed(() => {
  const sum = pledges.value.reduce((acc, pledge) => acc + BigInt(pledge.amount), BigInt(0))
  return formatPledgeAmount(sum.toString())
})

const filteredPledges = computed(() => {
  let result = [...pledges.value]

  // Filter by status
  if (statusFilter.value !== 'all') {
    result = result.filter((pledge) => pledge.status === statusFilter.value)
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

// Methods
function formatAmount(weiAmount: string): string {
  return formatPledgeAmount(weiAmount)
}

function getStatusLabel(status: PledgeStatus): string {
  return getPledgeStatusConfig(status).label
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
.my-pledges-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Header */
.my-pledges-header {
  position: sticky;
  top: var(--header-total-height);
  z-index: 50;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0.625rem 0;
}

.my-pledges-header__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.my-pledges-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.my-pledges-header__back:hover {
  color: var(--text-primary);
}

.my-pledges-header__back .icon {
  width: 1rem;
  height: 1rem;
}

/* Main Content */
.my-pledges-main {
  padding: 1.5rem 0 3rem;
}

/* Page Header */
.my-pledges-page-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .my-pledges-page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.my-pledges-page-header__content {
  flex: 1;
}

.my-pledges-page-header__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.my-pledges-page-header__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.my-pledges-page-header__stats {
  display: flex;
  gap: 1.5rem;
}

.my-pledges-stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: center;
}

.my-pledges-stat__value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.my-pledges-stat__label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Filters */
.my-pledges-filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.my-pledges-filters__tabs {
  display: flex;
  gap: 0.25rem;
  background-color: var(--surface-secondary);
  padding: 0.25rem;
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.filter-tab {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab--active {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.my-pledges-filters__select {
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
}

/* Pledges List */
.my-pledges-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.my-pledge-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: border-color var(--transition-fast);
}

.my-pledge-card:hover {
  border-color: var(--border-hover);
}

.my-pledge-card__campaign {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.my-pledge-card__image {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.my-pledge-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.my-pledge-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.my-pledge-card__creator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.my-pledge-card__creator .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.my-pledge-card__details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.my-pledge-card__amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.my-pledge-card__value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.my-pledge-card__status {
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

.my-pledge-card__status--active {
  color: var(--color-success-700);
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
}

.my-pledge-card__status--confirmed {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
}

.my-pledge-card__status--pending {
  color: var(--color-warning-700);
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
}

.my-pledge-card__status--released {
  color: var(--color-success-700);
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
}

.my-pledge-card__status--refunded {
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
}

.my-pledge-card__status--failed {
  color: var(--color-error-600);
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
}

.my-pledge-card__date {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.my-pledge-card__date .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.my-pledge-card__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.my-pledge-card__chevron .icon {
  width: 1rem;
  height: 1rem;
}

.my-pledge-card:hover .my-pledge-card__chevron {
  color: var(--text-secondary);
}

/* Empty State */
.my-pledges-empty {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.my-pledges-empty > .icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.my-pledges-empty h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.my-pledges-empty p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

/* Pagination */
.my-pledges-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.my-pledges-pagination__info {
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

/* Responsive */
@media (max-width: 640px) {
  .my-pledge-card {
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
  }

  .my-pledge-card__chevron {
    display: none;
  }

  .my-pledge-card__image {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
