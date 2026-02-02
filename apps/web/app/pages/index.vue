<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container-app">
        <div class="hero-content">
          <div class="hero-badge">
            <Icon
              name="heroicons:sparkles"
              class="hero-badge-icon"
            />
            <span>Trusted by 10,000+ community members</span>
          </div>
          <h1 class="hero-title">
            Make Pledges.<br />
            <span class="hero-title-accent">Build Trust.</span>
          </h1>
          <p class="hero-description">
            The decentralized platform where communities create transparent pledges, vouchers
            validate commitments, and everyone stays accountable.
          </p>
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
              <span class="stat-label">Total Pledged</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">1,234</span>
              <span class="stat-label">Active Campaigns</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">98.5%</span>
              <span class="stat-label">Success Rate</span>
            </div>
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
          <article
            v-for="campaign in featuredCampaigns"
            :key="campaign.id"
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
          </article>
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
  title: 'Pledgebook - Make Pledges. Build Trust.',
  description:
    'The decentralized platform where communities create transparent pledges, vouchers validate commitments, and everyone stays accountable.',
})

// Mock featured campaigns data
const featuredCampaigns = [
  {
    id: '1',
    title: 'Community Garden Initiative',
    description: 'Transform vacant lots into thriving community gardens across the city.',
    category: 'Environment',
    status: 'Active',
    pledged: 45000,
    progress: 75,
    vouchers: 156,
    daysLeft: 14,
  },
  {
    id: '2',
    title: 'Youth Tech Education Fund',
    description: 'Provide coding bootcamps and mentorship for underserved youth.',
    category: 'Education',
    status: 'Active',
    pledged: 28500,
    progress: 57,
    vouchers: 89,
    daysLeft: 21,
  },
  {
    id: '3',
    title: 'Local Food Bank Expansion',
    description: 'Expand food bank capacity to serve 500 more families weekly.',
    category: 'Social',
    status: 'Active',
    pledged: 62000,
    progress: 88,
    vouchers: 234,
    daysLeft: 7,
  },
  {
    id: '4',
    title: 'Clean Water Access Project',
    description: 'Install water filtration systems in rural communities.',
    category: 'Health',
    status: 'Active',
    pledged: 18750,
    progress: 42,
    vouchers: 67,
    daysLeft: 30,
  },
]

// Categories data
const categories = [
  {
    id: 'environment',
    name: 'Environment',
    slug: 'environment',
    icon: 'heroicons:globe-alt',
    color: '#10b981',
    count: 234,
  },
  {
    id: 'education',
    name: 'Education',
    slug: 'education',
    icon: 'heroicons:academic-cap',
    color: '#6366f1',
    count: 189,
  },
  {
    id: 'health',
    name: 'Health',
    slug: 'health',
    icon: 'heroicons:heart',
    color: '#ef4444',
    count: 156,
  },
  {
    id: 'technology',
    name: 'Technology',
    slug: 'technology',
    icon: 'heroicons:cpu-chip',
    color: '#3b82f6',
    count: 312,
  },
  {
    id: 'social',
    name: 'Social Impact',
    slug: 'social',
    icon: 'heroicons:users',
    color: '#f59e0b',
    count: 278,
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    slug: 'arts',
    icon: 'heroicons:paint-brush',
    color: '#ec4899',
    count: 145,
  },
]

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

/* Hero Section */
.hero-section {
  padding: 3rem 0 2rem;
}

@media (min-width: 1024px) {
  .hero-section {
    padding: 4rem 0 3rem;
  }
}

.hero-content {
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  border-radius: 9999px;
  margin-bottom: 1.5rem;
}

.hero-badge-icon {
  width: 1rem;
  height: 1rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 3.5rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 4rem;
  }
}

.hero-title-accent {
  background: linear-gradient(
    135deg,
    var(--interactive-primary) 0%,
    var(--interactive-primary-hover) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

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
  font-size: 0.8125rem;
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
