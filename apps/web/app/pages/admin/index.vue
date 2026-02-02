<template>
  <div class="admin-dashboard-page">
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
            <div class="page-header__text">
              <h1 class="page-header__title">Admin Overview</h1>
              <p class="page-header__description">
                A snapshot of platform health, campaign activity, and governance tasks.
              </p>
            </div>
            <div class="page-header__actions">
              <NuxtLink
                to="/admin/review"
                class="btn btn--primary"
              >
                <Icon name="heroicons:clipboard-document-check" />
                Review Submissions
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <div class="admin-dashboard__grid">
          <section class="admin-dashboard__stats">
            <article class="admin-dashboard__stat-card">
              <div class="admin-dashboard__stat-icon">
                <Icon name="heroicons:inbox" />
              </div>
              <div>
                <p class="admin-dashboard__stat-label">Pending reviews</p>
                <h3 class="admin-dashboard__stat-value">24</h3>
              </div>
              <NuxtLink
                to="/admin/review"
                class="admin-dashboard__stat-link"
              >
                View queue
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
            </article>

            <article class="admin-dashboard__stat-card">
              <div class="admin-dashboard__stat-icon admin-dashboard__stat-icon--success">
                <Icon name="heroicons:shield-check" />
              </div>
              <div>
                <p class="admin-dashboard__stat-label">Verified campaigns</p>
                <h3 class="admin-dashboard__stat-value">312</h3>
              </div>
              <NuxtLink
                to="/campaigns"
                class="admin-dashboard__stat-link"
              >
                Browse campaigns
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
            </article>

            <article class="admin-dashboard__stat-card">
              <div class="admin-dashboard__stat-icon admin-dashboard__stat-icon--warning">
                <Icon name="heroicons:exclamation-triangle" />
              </div>
              <div>
                <p class="admin-dashboard__stat-label">Disputes open</p>
                <h3 class="admin-dashboard__stat-value">7</h3>
              </div>
              <button
                type="button"
                class="admin-dashboard__stat-link"
              >
                Review disputes
                <Icon name="heroicons:arrow-right" />
              </button>
            </article>

            <article class="admin-dashboard__stat-card">
              <div class="admin-dashboard__stat-icon admin-dashboard__stat-icon--info">
                <Icon name="heroicons:megaphone" />
              </div>
              <div>
                <p class="admin-dashboard__stat-label">Featured slots</p>
                <h3 class="admin-dashboard__stat-value">4</h3>
              </div>
              <button
                type="button"
                class="admin-dashboard__stat-link"
              >
                Manage highlights
                <Icon name="heroicons:arrow-right" />
              </button>
            </article>
          </section>

          <section class="admin-dashboard__panel">
            <div class="admin-dashboard__panel-header">
              <div>
                <h2>Operational Summary</h2>
                <p>Key metrics and alerts for governance teams.</p>
              </div>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
              >
                Export
              </button>
            </div>
            <div class="admin-dashboard__panel-grid">
              <div class="admin-dashboard__panel-card">
                <h3>Funding velocity</h3>
                <p class="admin-dashboard__panel-value">$1.4M</p>
                <p class="admin-dashboard__panel-caption">Total pledged this week</p>
              </div>
              <div class="admin-dashboard__panel-card">
                <h3>Average approval time</h3>
                <p class="admin-dashboard__panel-value">14h</p>
                <p class="admin-dashboard__panel-caption">Median review to approval</p>
              </div>
              <div class="admin-dashboard__panel-card">
                <h3>CRE workflow status</h3>
                <p class="admin-dashboard__panel-value">Stable</p>
                <p class="admin-dashboard__panel-caption">Last run 32 minutes ago</p>
              </div>
            </div>
          </section>

          <section class="admin-dashboard__panel">
            <div class="admin-dashboard__panel-header">
              <div>
                <h2>Admin Quick Links</h2>
                <p>Jump to frequent governance workflows.</p>
              </div>
            </div>
            <div class="admin-dashboard__links">
              <NuxtLink
                to="/admin/review"
                class="admin-dashboard__link-card"
              >
                <div>
                  <h3>Campaign Review</h3>
                  <p>Approve or decline new submissions.</p>
                </div>
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
              <NuxtLink
                to="/admin/ai-testing"
                class="admin-dashboard__link-card"
              >
                <div>
                  <h3>AI Prompt Testing</h3>
                  <p>Test and debug AI prompts.</p>
                </div>
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
              <NuxtLink
                to="/campaigns"
                class="admin-dashboard__link-card"
              >
                <div>
                  <h3>Campaign Directory</h3>
                  <p>Inspect live and completed campaigns.</p>
                </div>
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
              <NuxtLink
                to="/dashboard"
                class="admin-dashboard__link-card"
              >
                <div>
                  <h3>User Activity</h3>
                  <p>Monitor pledges, vouches, and disputes.</p>
                </div>
                <Icon name="heroicons:arrow-right" />
              </NuxtLink>
            </div>
          </section>

          <aside class="admin-dashboard__sidebar">
            <div class="helper-card">
              <h3 class="helper-card__title">Governance Checklist</h3>
              <ul class="helper-card__list">
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Verify data sources for submitted campaigns</span>
                </li>
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Confirm CRE callbacks for approvals</span>
                </li>
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Monitor disputes before funding releases</span>
                </li>
              </ul>
            </div>
            <div class="helper-card helper-card--support">
              <div class="admin-dashboard__support">
                <Icon
                  name="heroicons:question-mark-circle"
                  class="admin-dashboard__support-icon"
                />
                <div>
                  <h4>Need help?</h4>
                  <p>Review admin documentation or reach out to governance.</p>
                  <div class="admin-dashboard__support-links">
                    <NuxtLink to="/docs/admin">Admin Docs</NuxtLink>
                    <NuxtLink to="/community">Community</NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Admin Overview - Pledgebook',
  description: 'Admin dashboard overview for platform health, review queues, and governance tasks.',
})
</script>

<style scoped>
.admin-dashboard-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem 0;
}

.page-header__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-header__breadcrumb {
  display: flex;
  align-items: center;
}

.page-header__breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.page-header__breadcrumb-link:hover {
  color: var(--text-primary);
}

.page-header__breadcrumb-icon {
  width: 1rem;
  height: 1rem;
}

.page-header__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header__text {
  flex: 1;
  min-width: 16rem;
}

.page-header__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin-bottom: 0.25rem;
}

.page-header__description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 36rem;
}

.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.page-main {
  padding: 1.5rem 0 3rem;
}

.admin-dashboard__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .admin-dashboard__grid {
    grid-template-columns: minmax(0, 1fr) 20rem;
    gap: 2rem;
  }
}

@media (min-width: 1280px) {
  .admin-dashboard__grid {
    grid-template-columns: minmax(0, 1fr) 22rem;
    gap: 2.5rem;
  }
}

.admin-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.admin-dashboard__stat-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-dashboard__stat-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--interactive-primary) 14%, transparent);
  color: var(--interactive-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-dashboard__stat-icon--success {
  background-color: color-mix(in oklch, var(--color-success-500) 16%, transparent);
  color: var(--color-success-600);
}

.admin-dashboard__stat-icon--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 16%, transparent);
  color: var(--color-warning-600);
}

.admin-dashboard__stat-icon--info {
  background-color: color-mix(in oklch, var(--interactive-primary) 16%, transparent);
  color: var(--interactive-primary);
}

.admin-dashboard__stat-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0;
}

.admin-dashboard__stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.admin-dashboard__stat-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--interactive-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.admin-dashboard__panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-dashboard__panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-dashboard__panel-header h2 {
  margin: 0 0 0.25rem;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.admin-dashboard__panel-header p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.admin-dashboard__panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.admin-dashboard__panel-card {
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.admin-dashboard__panel-card h3 {
  margin: 0 0 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.admin-dashboard__panel-value {
  margin: 0 0 0.25rem;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.admin-dashboard__panel-caption {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.admin-dashboard__links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.admin-dashboard__link-card {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: inherit;
  background-color: var(--surface-secondary);
  transition: all var(--transition-fast) ease-out;
}

.admin-dashboard__link-card:hover {
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}

.admin-dashboard__link-card h3 {
  margin: 0 0 0.25rem;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.admin-dashboard__link-card p {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.admin-dashboard__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.helper-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.helper-card__title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.helper-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.helper-card__list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.helper-card__list-item svg {
  width: 1rem;
  height: 1rem;
  color: var(--color-success-500);
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.admin-dashboard__support {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.admin-dashboard__support-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--interactive-primary);
}

.admin-dashboard__support h4 {
  margin: 0 0 0.25rem;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.admin-dashboard__support p {
  margin: 0 0 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.admin-dashboard__support-links {
  display: flex;
  gap: 0.75rem;
  font-size: var(--text-xs);
}

.admin-dashboard__support-links a {
  color: var(--interactive-primary);
}

.btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
}

.btn--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--surface-hover);
}

.btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-xs);
}
</style>
