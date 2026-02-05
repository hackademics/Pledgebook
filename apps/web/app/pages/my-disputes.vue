<template>
  <div class="my-disputes-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/dashboard"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Dashboard
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div>
              <h1 class="page-header__title">
                <Icon name="heroicons:flag" />
                My Disputes
              </h1>
              <p class="page-header__description">View and manage your campaign disputes</p>
            </div>
            <div class="page-header__stats">
              <div class="page-header__stat">
                <span>Total Filed</span>
                <strong>{{ stats.total }}</strong>
              </div>
              <div class="page-header__stat page-header__stat--warning">
                <span>Pending</span>
                <strong>{{ stats.pending }}</strong>
              </div>
              <div class="page-header__stat page-header__stat--success">
                <span>Upheld</span>
                <strong>{{ stats.upheld }}</strong>
              </div>
              <div class="page-header__stat page-header__stat--error">
                <span>Rejected</span>
                <strong>{{ stats.rejected }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <!-- Filters -->
        <div class="filters-bar">
          <div class="filters-bar__search">
            <Icon name="heroicons:magnifying-glass" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search disputes..."
            />
          </div>
          <div class="filters-bar__filters">
            <select v-model="statusFilter">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Under Investigation</option>
              <option value="upheld">Upheld</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="expired">Expired</option>
            </select>
            <select v-model="typeFilter">
              <option value="">All Types</option>
              <option value="fraud">Fraud</option>
              <option value="misrepresentation">Misrepresentation</option>
              <option value="rule_violation">Rule Violation</option>
              <option value="verification_failure">Verification Failure</option>
              <option value="general">General</option>
            </select>
            <select v-model="sortBy">
              <option value="disputed_at">Date Filed</option>
              <option value="amount">Amount</option>
            </select>
            <button
              type="button"
              class="filters-bar__sort-toggle"
              @click="toggleSortOrder"
            >
              <Icon :name="sortOrder === 'desc' ? 'heroicons:arrow-down' : 'heroicons:arrow-up'" />
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="pending"
          class="loading-state"
        >
          <AppSpinner />
          <span>Loading your disputes...</span>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!disputes || disputes.length === 0"
          class="empty-state"
        >
          <div class="empty-state__icon">
            <Icon name="heroicons:flag" />
          </div>
          <h2>No disputes filed</h2>
          <p>
            You haven't filed any disputes. If you believe a campaign is fraudulent or violates
            platform rules, you can file a dispute.
          </p>
          <NuxtLink
            to="/campaigns"
            class="btn btn--primary"
          >
            <Icon name="heroicons:magnifying-glass" />
            Browse Campaigns
          </NuxtLink>
        </div>

        <!-- Disputes List -->
        <div
          v-else
          class="disputes-grid"
        >
          <DisputeCard
            v-for="dispute in filteredDisputes"
            :key="dispute.id"
            :dispute="dispute"
            show-campaign
            show-actions
            @withdraw="handleWithdraw"
            @add-evidence="handleAddEvidence"
          />
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="pagination"
        >
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <Icon name="heroicons:chevron-left" />
            Previous
          </button>
          <span class="pagination__info"> Page {{ currentPage }} of {{ totalPages }} </span>
          <button
            type="button"
            class="pagination__btn"
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
import { computed, ref, watch } from 'vue'
import { useAsyncData, useSeoMeta } from 'nuxt/app'
import type { DisputerSummary } from '../types/disputer'
import { useDisputers } from '../composables/useDisputers'

// Mock address - replace with actual wallet connection
const walletAddress = ref('0x1234567890abcdef1234567890abcdef12345678')

const { getDisputesByAddress, getDisputeStats } = useDisputers()

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const sortBy = ref('disputed_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = 12

const stats = ref({ total: 0, pending: 0, upheld: 0, rejected: 0 })

// Fetch disputes
const { data: disputesData, pending } = await useAsyncData(
  'my-disputes',
  async () => {
    const [disputesResponse, statsData] = await Promise.all([
      getDisputesByAddress(walletAddress.value, {
        page: currentPage.value,
        limit: 100, // Get all for client-side filtering
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      }),
      getDisputeStats(walletAddress.value),
    ])

    stats.value = statsData

    if (disputesResponse.success && disputesResponse.data) {
      return disputesResponse.data
    }
    return []
  },
  { watch: [currentPage, sortBy, sortOrder] },
)

const disputes = computed(() => disputesData.value || [])

const filteredDisputes = computed(() => {
  let result: DisputerSummary[] = disputes.value

  // Filter by status
  if (statusFilter.value) {
    result = result.filter((d: DisputerSummary) => d.status === statusFilter.value)
  }

  // Filter by type
  if (typeFilter.value) {
    result = result.filter((d: DisputerSummary) => d.disputeType === typeFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (d: DisputerSummary) =>
        d.disputerAddress.toLowerCase().includes(query) ||
        d.campaignId.toLowerCase().includes(query) ||
        d.reason.toLowerCase().includes(query),
    )
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredDisputes.value.length / pageSize)
})

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

function handleWithdraw(dispute: DisputerSummary) {
  console.log('Withdraw dispute:', dispute.id)
}

function handleAddEvidence(dispute: DisputerSummary) {
  console.log('Add evidence to dispute:', dispute.id)
}

// Reset page when filters change
watch([statusFilter, typeFilter, searchQuery], () => {
  currentPage.value = 1
})

useSeoMeta({
  title: 'My Disputes | PledgeBook',
})
</script>

<style scoped>
.my-disputes-page {
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
  gap: 2rem;
  flex-wrap: wrap;
}

.page-header__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.page-header__title .icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-error-500);
}

.page-header__description {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0.25rem 0 0;
}

.page-header__stats {
  display: flex;
  gap: 1.5rem;
}

.page-header__stat {
  text-align: center;
}

.page-header__stat span {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-bottom: 0.125rem;
}

.page-header__stat strong {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.page-header__stat--success strong {
  color: var(--color-success-500);
}

.page-header__stat--warning strong {
  color: var(--color-warning-500);
}

.page-header__stat--error strong {
  color: var(--color-error-500);
}

.page-main {
  padding: 2rem 0;
}

.container-app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters-bar__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 320px;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.filters-bar__search .icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
}

.filters-bar__search input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.filters-bar__search input:focus {
  outline: none;
}

.filters-bar__search input::placeholder {
  color: var(--text-tertiary);
}

.filters-bar__filters {
  display: flex;
  gap: 0.5rem;
}

.filters-bar__filters select {
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
}

.filters-bar__sort-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filters-bar__sort-toggle:hover {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
}

.filters-bar__sort-toggle .icon {
  width: 1rem;
  height: 1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.empty-state__icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--color-error-500) 10%, transparent);
  color: var(--color-error-500);
}

.empty-state__icon .icon {
  width: 2rem;
  height: 2rem;
}

.empty-state h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.empty-state p {
  max-width: 400px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Disputes Grid */
.disputes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--interactive-primary);
  color: var(--interactive-primary);
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__btn .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.pagination__info {
  font-size: var(--text-sm);
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
  text-decoration: none;
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
</style>
