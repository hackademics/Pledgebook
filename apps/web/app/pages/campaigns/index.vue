<template>
  <div class="campaigns-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header-content">
          <div class="page-header-text">
            <h1 class="page-title">
              <template v-if="activeCategoryData">
                {{ activeCategoryData.name }} Campaigns
              </template>
              <template v-else> Campaigns </template>
            </h1>
            <p class="page-description">
              <template v-if="activeCategoryData">
                Explore {{ activeCategoryData.name.toLowerCase() }} campaigns making a difference.
              </template>
              <template v-else>
                Discover campaigns making a difference. Support causes you believe in with
                verifiable outcomes.
              </template>
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
          </div>
        </div>
      </div>
    </header>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="container-app">
        <div class="filters-bar-content">
          <div class="filters-left">
            <!-- Active Category Tag -->
            <div
              v-if="activeCategoryData"
              class="active-filter-tag"
            >
              <Icon
                :name="activeCategoryData.icon || 'heroicons:tag'"
                class="active-filter-icon"
              />
              <span>{{ activeCategoryData.name }}</span>
              <button
                type="button"
                class="active-filter-clear"
                aria-label="Clear category filter"
                @click="clearCategoryFilter"
              >
                <Icon name="heroicons:x-mark" />
              </button>
            </div>

            <!-- Status Filter Pills -->
            <div class="filter-pills">
              <button
                v-for="filter in statusFilters"
                :key="filter.value"
                type="button"
                class="filter-pill"
                :class="{ active: activeStatus === filter.value }"
                @click="setStatusFilter(filter.value)"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
          <div class="filters-right">
            <div class="sort-select">
              <select
                v-model="sortBy"
                class="form-select form-select-sm"
                @change="handleSortChange"
              >
                <option value="newest">Newest First</option>
                <option value="ending-soon">Ending Soon</option>
                <option value="most-pledged">Most Pledged</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaigns Grid -->
    <main class="page-main">
      <div class="container-app">
        <!-- Loading State -->
        <div
          v-if="pending"
          class="campaigns-loading"
        >
          <AppSpinner />
          <span>Loading campaigns...</span>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="campaigns-error"
        >
          <Icon
            name="heroicons:exclamation-triangle"
            class="campaigns-error-icon"
          />
          <h3>Failed to load campaigns</h3>
          <p>{{ error.message }}</p>
          <button
            type="button"
            class="btn btn-secondary"
            @click="refresh"
          >
            Try Again
          </button>
        </div>

        <!-- Campaigns Grid -->
        <div
          v-else-if="campaigns.length > 0"
          class="campaigns-grid"
        >
          <article
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="campaign-card"
          >
            <div class="campaign-header">
              <span class="campaign-category">{{ getCategoryDisplay(campaign.categories) }}</span>
              <span
                class="campaign-status"
                :class="`campaign-status--${campaign.status.toLowerCase()}`"
              >
                {{ campaign.status }}
              </span>
            </div>
            <h3 class="campaign-title">
              <NuxtLink :to="`/campaigns/${campaign.slug || campaign.id}`">
                {{ campaign.name }}
              </NuxtLink>
            </h3>
            <p class="campaign-description">
              {{ campaign.purpose }}
            </p>

            <div class="campaign-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${getProgress(campaign)}%` }"
                ></div>
              </div>
              <div class="progress-stats">
                <span class="progress-amount">{{ formatUSDC(campaign.amountPledged) }} USDC</span>
                <span class="progress-percent">{{ getProgress(campaign) }}%</span>
              </div>
            </div>

            <div class="campaign-footer">
              <div class="campaign-meta">
                <Icon
                  name="heroicons:users"
                  class="meta-icon"
                />
                <span>{{ campaign.pledgeCount || 0 }} pledges</span>
              </div>
              <div class="campaign-meta">
                <Icon
                  name="heroicons:clock"
                  class="meta-icon"
                />
                <span>{{ getDaysLeft(campaign.endDate) }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="empty-state"
        >
          <Icon
            name="heroicons:megaphone"
            class="empty-state-icon"
          />
          <h3 class="empty-state-title">
            <template v-if="activeCategoryData">
              No {{ activeCategoryData.name.toLowerCase() }} campaigns found
            </template>
            <template v-else> No campaigns found </template>
          </h3>
          <p class="empty-state-description">
            <template v-if="activeCategoryData">
              Be the first to create a campaign in this category.
            </template>
            <template v-else>
              Be the first to create a campaign and start making a difference.
            </template>
          </p>
          <NuxtLink
            to="/campaigns/create"
            class="btn btn-primary"
          >
            Create Campaign
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div
          v-if="meta && meta.totalPages > 1"
          class="pagination"
        >
          <button
            type="button"
            class="pagination-btn"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="heroicons:chevron-left" />
            Previous
          </button>
          <span class="pagination-info"> Page {{ currentPage }} of {{ meta.totalPages }} </span>
          <button
            type="button"
            class="pagination-btn"
            :disabled="currentPage >= meta.totalPages"
            @click="goToPage(currentPage + 1)"
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategories } from '~/composables/useCategories'

// =============================================================================
// TYPES
// =============================================================================

interface CampaignSummary {
  id: string
  name: string
  slug: string | null
  purpose: string
  status: string
  categories: string | null
  fundraisingGoal: string
  amountPledged: string
  pledgeCount: number
  endDate: string
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// =============================================================================
// COMPOSABLES
// =============================================================================

const route = useRoute()
const router = useRouter()
const { displayCategories, fetchCategories, setActiveCategory } = useCategories()

// =============================================================================
// STATE
// =============================================================================

const activeStatus = ref('all')
const sortBy = ref('newest')
const currentPage = ref(1)

// =============================================================================
// COMPUTED
// =============================================================================

/**
 * Get active category from URL query parameter
 */
const activeCategory = computed(() => {
  return (route.query.category as string) || null
})

/**
 * Get active category data object
 */
const activeCategoryData = computed(() => {
  if (!activeCategory.value) return null
  return displayCategories.value.find((c) => c.slug === activeCategory.value) || null
})

/**
 * Build API URL with all filters
 */
const apiUrl = computed(() => {
  const params = new URLSearchParams()

  params.set('page', currentPage.value.toString())
  params.set('limit', '12')

  // Status filter
  if (activeStatus.value !== 'all') {
    params.set('status', activeStatus.value)
  }

  // Category filter
  if (activeCategory.value) {
    params.set('category', activeCategory.value)
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      params.set('sortBy', 'created_at')
      params.set('sortOrder', 'desc')
      break
    case 'ending-soon':
      params.set('sortBy', 'end_date')
      params.set('sortOrder', 'asc')
      break
    case 'most-pledged':
      params.set('sortBy', 'amount_pledged')
      params.set('sortOrder', 'desc')
      break
  }

  return `/api/campaigns?${params.toString()}`
})

// =============================================================================
// SEO META
// =============================================================================

useSeoMeta({
  title: computed(() =>
    activeCategoryData.value
      ? `${activeCategoryData.value.name} Campaigns - Pledgebook`
      : 'Campaigns - Pledgebook',
  ),
  description: computed(() =>
    activeCategoryData.value
      ? `Explore ${activeCategoryData.value.name.toLowerCase()} campaigns on Pledgebook. Support causes with verifiable outcomes.`
      : 'Discover campaigns on Pledgebook. Support causes with verifiable outcomes and build trust in the community.',
  ),
})

// =============================================================================
// DATA FETCHING
// =============================================================================

const {
  data: response,
  pending,
  error,
  refresh,
} = useFetch<ApiResponse<CampaignSummary[]>>(apiUrl, {
  watch: [apiUrl],
})

const campaigns = computed(() => response.value?.data || [])
const meta = computed(() => response.value?.meta)

// =============================================================================
// CONSTANTS
// =============================================================================

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
]

// =============================================================================
// METHODS
// =============================================================================

/**
 * Clear category filter
 */
function clearCategoryFilter() {
  router.push({ path: '/campaigns', query: { ...route.query, category: undefined } })
}

/**
 * Set status filter
 */
function setStatusFilter(status: string) {
  activeStatus.value = status
  currentPage.value = 1
}

/**
 * Handle sort change
 */
function handleSortChange() {
  currentPage.value = 1
}

/**
 * Navigate to a page
 */
function goToPage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Get category display name from JSON string
 */
function getCategoryDisplay(categories: string | null): string {
  if (!categories) return 'General'
  try {
    const parsed = JSON.parse(categories)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Find category name from displayCategories
      const cat = displayCategories.value.find((c) => c.id === parsed[0] || c.slug === parsed[0])
      return cat?.name || parsed[0]
    }
  } catch {
    return 'General'
  }
  return 'General'
}

/**
 * Calculate campaign progress percentage
 */
function getProgress(campaign: CampaignSummary): number {
  try {
    const pledged = BigInt(campaign.amountPledged || '0')
    const goal = BigInt(campaign.fundraisingGoal || '0')
    if (goal === 0n) return 0
    const progress = Number((pledged * 100n) / goal)
    return Math.min(progress, 100)
  } catch {
    return 0
  }
}

/**
 * Format USDC amount (6 decimals)
 */
function formatUSDC(amount: string): string {
  try {
    const value = BigInt(amount || '0')
    const usdc = Number(value) / 1e6
    return usdc.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  } catch {
    return '0'
  }
}

/**
 * Get days left from end date
 */
function getDaysLeft(endDate: string): string {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return '1 day left'
  if (days < 7) return `${days} days left`
  if (days < 30) return `${Math.floor(days / 7)} weeks left`
  return `${Math.floor(days / 30)} months left`
}

// =============================================================================
// WATCHERS
// =============================================================================

// Sync active category with useCategories composable
watch(
  activeCategory,
  (category) => {
    setActiveCategory(category)
  },
  { immediate: true },
)

// Reset page when category changes
watch(activeCategory, () => {
  currentPage.value = 1
})

// =============================================================================
// LIFECYCLE
// =============================================================================

// Fetch categories on mount
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* =============================================================================
   CAMPAIGNS LIST PAGE STYLES
   ============================================================================= */

.campaigns-page {
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

@media (min-width: 640px) {
  .page-header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 0.375rem;
}

.page-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 36rem;
}

.page-header-actions {
  flex-shrink: 0;
}

/* Filters Bar */
.filters-bar {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0.75rem 0;
}

.filters-bar-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .filters-bar-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.filter-pills {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background-color: transparent;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.filter-pill:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.filter-pill.active {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
}

.form-select-sm {
  padding: 0.375rem 2rem 0.375rem 0.625rem;
  font-size: var(--text-sm);
}

/* Main Content */
.page-main {
  padding: 2rem 0;
}

/* Campaigns Grid */
.campaigns-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .campaigns-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .campaigns-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Campaign Card */
.campaign-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  transition: all var(--transition-fast);
}

.campaign-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.campaign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.campaign-category {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

.campaign-status {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.campaign-status--active {
  color: var(--color-success-600);
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
}

.campaign-status--completed {
  color: var(--text-tertiary);
  background-color: var(--surface-secondary);
}

.campaign-status--upcoming {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
}

.campaign-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: var(--leading-snug);
}

.campaign-title a {
  color: inherit;
  transition: color var(--transition-fast);
}

.campaign-title a:hover {
  color: var(--interactive-primary);
}

.campaign-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Progress Bar */
.campaign-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 0.375rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: var(--interactive-primary);
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
}

.progress-amount {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.progress-percent {
  color: var(--text-tertiary);
}

/* Campaign Footer */
.campaign-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary);
}

.campaign-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.meta-icon {
  width: 1rem;
  height: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state-icon {
  width: 4rem;
  height: 4rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 24rem;
}

/* =============================================================================
   ACTIVE FILTER TAG
   ============================================================================= */

.filters-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem 0.375rem 0.75rem;
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  border: 1px solid color-mix(in oklch, var(--interactive-primary) 25%, transparent);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
}

.active-filter-icon {
  width: 1rem;
  height: 1rem;
}

.active-filter-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background-color: transparent;
  color: var(--interactive-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.active-filter-clear:hover {
  background-color: color-mix(in oklch, var(--interactive-primary) 20%, transparent);
}

.active-filter-clear svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* =============================================================================
   LOADING & ERROR STATES
   ============================================================================= */

.campaigns-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.campaigns-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
}

.campaigns-error-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-error-500);
}

.campaigns-error h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.campaigns-error p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* =============================================================================
   PAGINATION
   ============================================================================= */

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 1rem;
  height: 1rem;
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
