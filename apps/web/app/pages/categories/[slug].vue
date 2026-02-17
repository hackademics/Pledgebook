<template>
  <div class="category-detail-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/categories"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              All Categories
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div class="page-header__text">
              <h1 class="page-header__title">
                {{ category?.name ?? 'Category' }}
              </h1>
              <p
                v-if="category?.description"
                class="page-header__description"
              >
                {{ category.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <!-- Loading state -->
        <div
          v-if="pending"
          class="category-detail__loading"
        >
          <Icon
            name="heroicons:arrow-path"
            class="animate-spin"
          />
          <span>Loading campaigns...</span>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="category-detail__empty"
        >
          <Icon name="heroicons:exclamation-triangle" />
          <h2>Failed to load campaigns</h2>
          <p>{{ error.message }}</p>
          <button
            type="button"
            class="btn btn--primary"
            @click="refresh()"
          >
            Try Again
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="campaigns.length === 0"
          class="category-detail__empty"
        >
          <Icon name="heroicons:folder-open" />
          <h2>No campaigns yet</h2>
          <p>Be the first to create a campaign in this category.</p>
          <NuxtLink
            to="/campaigns/create"
            class="btn btn--primary"
          >
            Create Campaign
          </NuxtLink>
        </div>

        <!-- Campaign grid -->
        <div
          v-else
          class="category-detail__grid"
        >
          <article
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="campaign-card"
          >
            <NuxtLink :to="`/@${campaign.slug}`">
              <div class="campaign-card__header">
                <span class="campaign-card__status">{{ campaign.status }}</span>
              </div>
              <h3 class="campaign-card__title">{{ campaign.name }}</h3>
              <p class="campaign-card__description">{{ campaign.description }}</p>
              <div class="campaign-card__footer">
                <span class="campaign-card__meta">
                  {{ formatAmount(campaign.amountPledged) }} pledged
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { formatUsdcAmount } from '~/utils/currency'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Fetch category details
const { data: categoryResponse } = await useAsyncData(`category-${slug.value}`, () =>
  $fetch<{
    success: boolean
    data: Array<{ id: string; name: string; slug: string; description?: string }>
  }>('/api/categories', {
    params: { search: slug.value, limit: 1 },
  }),
)

const category = computed(() => categoryResponse.value?.data?.[0] ?? null)

// Fetch campaigns in this category
const {
  data: campaignsResponse,
  pending,
  error,
  refresh,
} = await useAsyncData(`category-campaigns-${slug.value}`, () =>
  $fetch<{
    success: boolean
    data: Array<{
      id: string
      name: string
      slug: string
      description?: string
      status: string
      amountPledged?: string
    }>
  }>('/api/campaigns', {
    params: { category: slug.value, limit: 20 },
  }),
)

const campaigns = computed(() => campaignsResponse.value?.data ?? [])

function formatAmount(weiAmount?: string): string {
  if (!weiAmount) return '$0.00'
  return formatUsdcAmount(weiAmount)
}

useSeoMeta({
  title: () => `${category.value?.name ?? 'Category'} Campaigns - Pledgebook`,
  description: () =>
    category.value?.description ?? `Browse campaigns in the ${slug.value} category.`,
})
</script>

<style scoped>
.category-detail-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-main {
  padding: 2rem 0 4rem;
}

.category-detail__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 0;
  color: var(--text-tertiary);
}

.category-detail__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  text-align: center;
  color: var(--text-secondary);
}

.category-detail__empty h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-detail__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.campaign-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  transition: box-shadow 0.15s ease;
}

.campaign-card:hover {
  box-shadow: var(--shadow-md);
}

.campaign-card a {
  text-decoration: none;
  color: inherit;
}

.campaign-card__header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}

.campaign-card__status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  color: var(--interactive-primary);
}

.campaign-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.campaign-card__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-card__footer {
  border-top: 1px solid var(--border-primary);
  padding-top: 0.75rem;
}

.campaign-card__meta {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
