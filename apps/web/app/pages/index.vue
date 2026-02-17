<template>
  <div class="home-page">
    <!-- Hero Section — Narrative Flow -->
    <section class="hero-section">
      <div
        class="hero-glow"
        aria-hidden="true"
      ></div>
      <div class="container-app">
        <!-- The Hook -->
        <div class="hero-hook">
          <h1 class="hero-headline">
            Turn Promises into Proof.<br />
            <span class="hero-headline-accent">Fund Verified Results.</span>
          </h1>
          <p class="hero-subline">
            Pledgebook uses blockchain verification to ensure donated funds are unlocked only when
            goals are proven complete — accountability that rewards execution.
          </p>
        </div>

        <!-- The Value Flow -->
        <div class="value-flow">
          <div class="flow-card">
            <div class="flow-card-number">01</div>
            <div class="flow-card-icon-wrap">
              <Icon
                name="heroicons:fire"
                class="flow-card-icon"
              />
            </div>
            <h3 class="flow-card-title">Set Ambitious Goals</h3>
            <p class="flow-card-desc">
              Individuals define measurable goals they're committed to achieving — fitness,
              education, career, community impact.
            </p>
            <span class="flow-card-role">For Achievers</span>
          </div>

          <div
            class="flow-connector"
            aria-hidden="true"
          >
            <Icon
              name="heroicons:arrow-long-right"
              class="flow-connector-icon flow-connector-h"
            />
            <Icon
              name="heroicons:arrow-long-down"
              class="flow-connector-icon flow-connector-v"
            />
          </div>

          <div class="flow-card flow-card-center">
            <div class="flow-card-number">02</div>
            <div class="flow-card-icon-wrap flow-card-icon-accent">
              <Icon
                name="heroicons:shield-check"
                class="flow-card-icon"
              />
            </div>
            <h3 class="flow-card-title">Verify On-Chain</h3>
            <p class="flow-card-desc">
              Blockchain-powered verification provides undeniable proof that goals were completed —
              no disputes, no ambiguity.
            </p>
            <span class="flow-card-role flow-card-role-accent">The Trust Layer</span>
          </div>

          <div
            class="flow-connector"
            aria-hidden="true"
          >
            <Icon
              name="heroicons:arrow-long-right"
              class="flow-connector-icon flow-connector-h"
            />
            <Icon
              name="heroicons:arrow-long-down"
              class="flow-connector-icon flow-connector-v"
            />
          </div>

          <div class="flow-card">
            <div class="flow-card-number">03</div>
            <div class="flow-card-icon-wrap">
              <Icon
                name="heroicons:banknotes"
                class="flow-card-icon"
              />
            </div>
            <h3 class="flow-card-title">Unlock Funding</h3>
            <p class="flow-card-desc">
              Donated funds are released only when verified results are delivered — donors invest in
              outcomes, not promises.
            </p>
            <span class="flow-card-role">For Donors</span>
          </div>
        </div>

        <!-- Reinforcement -->
        <div class="hero-reinforce">
          <Icon
            name="heroicons:lock-closed"
            class="reinforce-icon"
          />
          <span>Donors fund with confidence. Achievers earn through execution.</span>
        </div>

        <!-- CTAs -->
        <div class="hero-actions">
          <NuxtLink
            to="/campaigns"
            class="btn btn-primary hero-btn"
          >
            <Icon
              name="heroicons:rocket-launch"
              class="btn-icon"
            />
            Explore Campaigns
          </NuxtLink>
          <NuxtLink
            to="/how-it-works"
            class="btn btn-secondary hero-btn"
          >
            How It Works
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">$2.5M+</span>
            <span class="stat-label">Funded Through Results</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">1,234</span>
            <span class="stat-label">Active Campaigns</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">98.5%</span>
            <span class="stat-label">Goal Completion Rate</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Campaigns Section -->
    <section class="campaigns-section">
      <div class="container-app">
        <div class="section-header">
          <h2 class="section-title">Featured Campaigns</h2>
          <NuxtLink
            to="/campaigns"
            class="section-link"
          >
            View all
            <Icon
              name="heroicons:arrow-right"
              class="section-link-icon"
            />
          </NuxtLink>
        </div>

        <!-- Campaign Cards Grid -->
        <div class="campaigns-grid">
          <NuxtLink
            v-for="campaign in featuredCampaigns"
            :key="campaign.id"
            :to="`/@${campaign.slug}`"
            class="campaign-card"
          >
            <div class="campaign-header">
              <span class="campaign-category">{{ campaign.category }}</span>
              <span class="campaign-status">{{ campaign.status }}</span>
            </div>
            <h3 class="campaign-title">
              {{ campaign.title }}
            </h3>
            <p class="campaign-description">
              {{ campaign.description }}
            </p>

            <div class="campaign-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${campaign.progress}%` }"
                ></div>
              </div>
              <div class="progress-stats">
                <span class="progress-amount">${{ campaign.pledged.toLocaleString() }}</span>
                <span class="progress-percent">{{ campaign.progress }}%</span>
              </div>
            </div>

            <div class="campaign-footer">
              <div class="campaign-meta">
                <Icon
                  name="heroicons:users"
                  class="meta-icon"
                />
                <span>{{ campaign.vouchers }} vouchers</span>
              </div>
              <div class="campaign-meta">
                <Icon
                  name="heroicons:clock"
                  class="meta-icon"
                />
                <span>{{ campaign.daysLeft }} days left</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="container-app">
        <div class="section-header">
          <h2 class="section-title">Browse by Category</h2>
        </div>

        <div class="categories-grid">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="category-card"
          >
            <div
              class="category-icon-wrapper"
              :style="{ backgroundColor: category.color }"
            >
              <Icon
                :name="category.icon"
                class="category-icon"
              />
            </div>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.count }} campaigns</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-section">
      <div class="container-app">
        <div class="section-header section-header-centered">
          <h2 class="section-title">How Pledgebook Works</h2>
          <p class="section-description">
            A simple, transparent process to create accountability and build trust.
          </p>
        </div>

        <div class="steps-grid">
          <div
            v-for="(step, index) in steps"
            :key="step.title"
            class="step-card"
          >
            <div class="step-number">
              {{ index + 1 }}
            </div>
            <div class="step-icon-wrapper">
              <Icon
                :name="step.icon"
                class="step-icon"
              />
            </div>
            <h3 class="step-title">
              {{ step.title }}
            </h3>
            <p class="step-description">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">Ready to make a pledge?</h2>
            <p class="cta-description">
              Join thousands of community members building trust and accountability together.
            </p>
          </div>
          <div class="cta-actions">
            <button
              type="button"
              class="btn btn-primary cta-btn"
            >
              <Icon
                name="heroicons:wallet"
                class="btn-icon"
              />
              Connect Wallet
            </button>
            <NuxtLink
              to="/campaigns/create"
              class="btn btn-secondary cta-btn"
            >
              Start a Campaign
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// SEO Meta
useSeoMeta({
  title: 'Pledgebook — Turn Promises into Proof. Fund Verified Results.',
  description:
    'Pledgebook uses blockchain verification to ensure donated funds are unlocked only when goals are proven complete. Accountability that rewards execution.',
})

// Fetch featured campaigns from API
const { data: featuredResponse } = await useAsyncData('featured-campaigns', () =>
  $fetch<{
    success: boolean
    data: Array<{
      id: string
      name: string
      purpose?: string
      description?: string
      category?: string
      categories?: string[]
      status: string
      amountPledged?: string
      fundraisingGoal?: string
      voucherCount?: number
      pledgeCount?: number
      endDate?: string
      slug: string
    }>
  }>('/api/campaigns/featured'),
)

const featuredCampaigns = computed(() => {
  const campaigns = featuredResponse.value?.data ?? []
  return campaigns.map((c) => {
    const pledged = Number(c.amountPledged ?? 0) / 1e6 // wei to USDC
    const goal = Number(c.fundraisingGoal ?? 1) / 1e6
    const progress = goal > 0 ? Math.min(Math.round((pledged / goal) * 100), 100) : 0
    const daysLeft = c.endDate
      ? Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000))
      : 0
    return {
      id: c.id,
      title: c.name,
      description: c.description ?? c.purpose ?? '',
      category: c.category ?? 'General',
      status: c.status ?? 'Active',
      pledged: Math.round(pledged),
      progress,
      vouchers: c.voucherCount ?? 0,
      daysLeft,
      slug: c.slug,
    }
  })
})

// Fetch categories from API
const { data: categoriesResponse } = await useAsyncData('home-categories', () =>
  $fetch<{
    success: boolean
    data: Array<{
      id: string
      name: string
      slug: string
      icon?: string
      color?: string
      campaignCount?: number
    }>
  }>('/api/categories', {
    params: { isActive: true, limit: 6, sortBy: 'campaign_count', sortOrder: 'desc' },
  }),
)

const CATEGORY_ICONS: Record<string, string> = {
  'personal-fitness': 'heroicons:heart',
  'sustainable-living': 'heroicons:globe-alt',
  'startup-launch': 'heroicons:rocket-launch',
  'nonprofit-fundraising': 'heroicons:hand-raised',
  'mental-health-support': 'heroicons:sparkles',
  'tree-planting': 'heroicons:globe-alt',
  'renewable-energy': 'heroicons:bolt',
  'community-projects': 'heroicons:user-group',
  'education-funding': 'heroicons:academic-cap',
  'scientific-research': 'heroicons:beaker',
  'shelter-housing': 'heroicons:home',
  'food-security': 'heroicons:cake',
  'animal-rescue': 'heroicons:heart',
  'environmental-cleanup': 'heroicons:globe-alt',
}

const CATEGORY_COLORS: Record<string, string> = {
  'personal-fitness': '#ef4444',
  'sustainable-living': '#10b981',
  'startup-launch': '#6366f1',
  'nonprofit-fundraising': '#f59e0b',
  'mental-health-support': '#ec4899',
  'tree-planting': '#22c55e',
  'renewable-energy': '#3b82f6',
  'community-projects': '#8b5cf6',
  'education-funding': '#6366f1',
  'scientific-research': '#0ea5e9',
  'shelter-housing': '#f97316',
  'food-security': '#84cc16',
  'animal-rescue': '#f43f5e',
  'environmental-cleanup': '#14b8a6',
}

const categories = computed(() => {
  const cats = categoriesResponse.value?.data ?? []
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || CATEGORY_ICONS[c.slug] || 'heroicons:tag',
    color: c.color || CATEGORY_COLORS[c.slug] || '#6366f1',
    count: c.campaignCount ?? 0,
  }))
})

// How it works steps
const steps = [
  {
    title: 'Create a Pledge',
    description: 'Define your commitment with clear goals, timeline, and accountability measures.',
    icon: 'heroicons:document-plus',
  },
  {
    title: 'Get Vouchers',
    description: 'Community members vouch for your pledge, adding credibility and trust.',
    icon: 'heroicons:user-group',
  },
  {
    title: 'Track Progress',
    description: 'Provide updates and evidence of your progress towards the pledge goal.',
    icon: 'heroicons:chart-bar',
  },
  {
    title: 'Build Reputation',
    description: 'Successful pledges build your reputation and unlock new opportunities.',
    icon: 'heroicons:star',
  },
]
</script>

<style scoped>
/* Page Layout */
.home-page {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding-bottom: 4rem;
}

@media (min-width: 1024px) {
  .home-page {
    gap: 5rem;
    padding-bottom: 5rem;
  }
}

/* Hero Section — Narrative Flow */
.hero-section {
  position: relative;
  padding: 3rem 0 2rem;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .hero-section {
    padding: 4.5rem 0 3rem;
  }
}

/* Background glow effect */
.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 70%;
  background:
    radial-gradient(
      ellipse at 30% 50%,
      color-mix(in oklch, var(--interactive-primary) 8%, transparent) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse at 70% 50%,
      color-mix(in oklch, var(--color-accent-400, oklch(0.68 0.18 195)) 6%, transparent) 0%,
      transparent 70%
    );
  pointer-events: none;
  z-index: 0;
}

.hero-section .container-app {
  position: relative;
  z-index: 1;
}

/* The Hook */
.hero-hook {
  text-align: center;
  max-width: 52rem;
  margin: 0 auto 3rem;
}

.hero-headline {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

@media (min-width: 640px) {
  .hero-headline {
    font-size: 3.25rem;
  }
}

@media (min-width: 1024px) {
  .hero-headline {
    font-size: 4rem;
  }
}

.hero-headline-accent {
  background: linear-gradient(
    135deg,
    var(--interactive-primary) 0%,
    var(--color-accent-400, oklch(0.68 0.18 195)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subline {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  max-width: 40rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .hero-subline {
    font-size: 1.125rem;
  }
}

/* Value Flow — 3-card visual narrative */
.value-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .value-flow {
    flex-direction: row;
    align-items: stretch;
    gap: 0;
  }
}

/* Flow Cards */
.flow-card {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.flow-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

/* Center card (The Trust Layer) gets visual emphasis */
.flow-card-center {
  border-color: color-mix(in oklch, var(--interactive-primary) 40%, var(--border-primary));
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--interactive-primary) 4%, var(--surface-primary)) 0%,
    var(--surface-primary) 100%
  );
}

.flow-card-center:hover {
  border-color: var(--interactive-primary);
  box-shadow: 0 8px 24px -4px color-mix(in oklch, var(--interactive-primary) 15%, transparent);
}

.flow-card-number {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.flow-card-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  margin-bottom: 1rem;
}

.flow-card-icon-accent {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
}

.flow-card-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--interactive-primary);
}

.flow-card-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
}

.flow-card-desc {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-tertiary);
  flex: 1;
  margin-bottom: 1rem;
}

.flow-card-role {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--border-primary);
  border-radius: 9999px;
}

.flow-card-role-accent {
  color: var(--interactive-primary);
  border-color: color-mix(in oklch, var(--interactive-primary) 30%, transparent);
  background-color: color-mix(in oklch, var(--interactive-primary) 5%, transparent);
}

/* Flow Connectors */
.flow-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-connector-icon {
  color: var(--text-muted);
  width: 1.5rem;
  height: 1.5rem;
}

/* Mobile: vertical arrows; Desktop: horizontal */
.flow-connector-h {
  display: none;
}

.flow-connector-v {
  display: block;
}

@media (min-width: 768px) {
  .flow-connector {
    width: 2.5rem;
  }

  .flow-connector-h {
    display: block;
  }

  .flow-connector-v {
    display: none;
  }
}

/* Reinforcement pill */
.hero-reinforce {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  margin: 0 auto 2rem;
  max-width: fit-content;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 9999px;
}

.reinforce-icon {
  width: 1rem;
  height: 1rem;
  color: var(--interactive-primary);
  flex-shrink: 0;
}

/* Hero Actions */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.hero-btn {
  height: 2.75rem;
  padding: 0 1.25rem;
  font-size: 0.9375rem;
}

/* Hero Stats */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

@media (min-width: 640px) {
  .hero-stats {
    gap: 2rem;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

@media (min-width: 640px) {
  .stat-value {
    font-size: 1.75rem;
  }
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 2.5rem;
  background-color: var(--border-primary);
  display: none;
}

@media (min-width: 640px) {
  .stat-divider {
    display: block;
  }
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-header-centered {
  flex-direction: column;
  text-align: center;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

@media (min-width: 640px) {
  .section-title {
    font-size: 1.75rem;
  }
}

.section-description {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 32rem;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--interactive-primary);
  text-decoration: none;
  transition: gap 0.15s ease;
}

.section-link:hover {
  gap: 0.5rem;
}

.section-link-icon {
  width: 1rem;
  height: 1rem;
}

/* Campaigns Section */
.campaigns-section {
  padding: 0;
}

.campaigns-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .campaigns-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .campaigns-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Campaign Card */
.campaign-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  transition: all 0.15s ease;
}

.campaign-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.campaign-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.campaign-category {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.campaign-status {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-success-600);
}

.campaign-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.campaign-description {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* Progress Bar */
.campaign-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 0.375rem;
  background-color: var(--surface-secondary);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--interactive-primary) 0%,
    var(--interactive-primary-hover) 100%
  );
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-amount {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-percent {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--interactive-primary);
}

/* Campaign Footer */
.campaign-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-secondary);
}

.campaign-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.meta-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* Categories Section */
.categories-section {
  padding: 0;
}

.categories-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 640px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  text-decoration: none;
  text-align: center;
  transition: all 0.15s ease;
}

.category-card:hover {
  border-color: var(--border-hover);
  background-color: var(--surface-hover);
}

.category-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
}

.category-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* How It Works Section */
.how-section {
  padding: 2rem 0;
  background-color: var(--surface-secondary);
  margin-left: calc(-1 * var(--container-padding));
  margin-right: calc(-1 * var(--container-padding));
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}

@media (min-width: 1024px) {
  .how-section {
    padding: 3rem 0;
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
    border-radius: 1rem;
  }
}

.steps-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  margin-top: 2rem;
}

@media (min-width: 640px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.step-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  position: relative;
}

.step-number {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  border-radius: 9999px;
}

.step-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.step-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--interactive-primary);
}

.step-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.step-description {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  line-height: 1.5;
}

/* CTA Section */
.cta-section {
  padding: 0;
}

.cta-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    var(--interactive-primary) 0%,
    var(--interactive-primary-hover) 100%
  );
  border-radius: 1rem;
}

@media (min-width: 768px) {
  .cta-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 2.5rem 3rem;
  }
}

.cta-content {
  max-width: 32rem;
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .cta-title {
    font-size: 1.75rem;
  }
}

.cta-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cta-btn {
  height: 2.75rem;
  padding: 0 1.25rem;
}

.cta-btn.btn-primary {
  background-color: white;
  color: var(--interactive-primary);
}

.cta-btn.btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.cta-btn.btn-secondary {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cta-btn.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
