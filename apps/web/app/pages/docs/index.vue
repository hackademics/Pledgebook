<template>
  <div class="docs-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Documentation</h1>
          <p class="page-header__description">
            Everything you need to know about using and integrating with Pledgebook.
          </p>
        </div>
      </div>
    </header>

    <!-- Docs Navigation -->
    <section class="docs-section">
      <div class="container-app">
        <div class="docs-grid">
          <!-- Getting Started -->
          <NuxtLink
            to="/help"
            class="docs-card"
          >
            <div class="docs-card__icon docs-card__icon--blue">
              <Icon name="heroicons:rocket-launch" />
            </div>
            <div class="docs-card__content">
              <h2>Getting Started</h2>
              <p>
                New to Pledgebook? Learn the basics of creating campaigns, pledging, and
                verification.
              </p>
            </div>
            <Icon
              name="heroicons:arrow-right"
              class="docs-card__arrow"
            />
          </NuxtLink>

          <!-- How It Works -->
          <NuxtLink
            to="/how-it-works"
            class="docs-card"
          >
            <div class="docs-card__icon docs-card__icon--green">
              <Icon name="heroicons:light-bulb" />
            </div>
            <div class="docs-card__content">
              <h2>How It Works</h2>
              <p>
                Understand the full campaign lifecycle from creation to verification and fund
                release.
              </p>
            </div>
            <Icon
              name="heroicons:arrow-right"
              class="docs-card__arrow"
            />
          </NuxtLink>

          <!-- For Creators -->
          <NuxtLink
            to="/docs/campaigns"
            class="docs-card"
          >
            <div class="docs-card__icon docs-card__icon--purple">
              <Icon name="heroicons:megaphone" />
            </div>
            <div class="docs-card__content">
              <h2>Campaign Guide</h2>
              <p>
                Detailed guide for creators: setting goals, evidence requirements, and best
                practices.
              </p>
            </div>
            <Icon
              name="heroicons:arrow-right"
              class="docs-card__arrow"
            />
          </NuxtLink>

          <!-- API Reference -->
          <NuxtLink
            to="/docs/api"
            class="docs-card"
          >
            <div class="docs-card__icon docs-card__icon--orange">
              <Icon name="heroicons:code-bracket" />
            </div>
            <div class="docs-card__content">
              <h2>API Reference</h2>
              <p>Technical documentation for developers integrating with Pledgebook's API.</p>
            </div>
            <Icon
              name="heroicons:arrow-right"
              class="docs-card__arrow"
            />
          </NuxtLink>

          <!-- Smart Contracts -->
          <a
            href="https://github.com/pledgebook/contracts"
            target="_blank"
            rel="noopener noreferrer"
            class="docs-card"
          >
            <div class="docs-card__icon docs-card__icon--teal">
              <Icon name="heroicons:cube-transparent" />
            </div>
            <div class="docs-card__content">
              <h2>Smart Contracts</h2>
              <p>Open-source smart contract code, audit reports, and deployment addresses.</p>
            </div>
            <Icon
              name="heroicons:arrow-top-right-on-square"
              class="docs-card__arrow"
            />
          </a>

          <!-- Admin Guide -->
          <NuxtLink
            to="/docs/admin"
            class="docs-card"
          >
            <div class="docs-card__icon docs-card__icon--red">
              <Icon name="heroicons:shield-check" />
            </div>
            <div class="docs-card__content">
              <h2>Admin Guide</h2>
              <p>
                Documentation for platform administrators: moderation, disputes, and configuration.
              </p>
            </div>
            <Icon
              name="heroicons:arrow-right"
              class="docs-card__arrow"
            />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="quick-links-section">
      <div class="container-app">
        <h2 class="section-title">Quick Links</h2>
        <div class="quick-links-grid">
          <a
            href="/help#wallet"
            class="quick-link"
          >
            <Icon name="heroicons:wallet" />
            Wallet Setup
          </a>
          <a
            href="/help#verification"
            class="quick-link"
          >
            <Icon name="heroicons:check-badge" />
            Verification FAQ
          </a>
          <a
            href="/pricing"
            class="quick-link"
          >
            <Icon name="heroicons:currency-dollar" />
            Pricing & Fees
          </a>
          <a
            href="/help#disputes"
            class="quick-link"
          >
            <Icon name="heroicons:exclamation-triangle" />
            Dispute Process
          </a>
          <a
            href="/categories"
            class="quick-link"
          >
            <Icon name="heroicons:tag" />
            Campaign Categories
          </a>
          <a
            href="https://polygonscan.com"
            target="_blank"
            rel="noopener noreferrer"
            class="quick-link"
          >
            <Icon name="heroicons:link" />
            View on PolygonScan
          </a>
        </div>
      </div>
    </section>

    <!-- Resources -->
    <section class="resources-section">
      <div class="container-app">
        <h2 class="section-title">Additional Resources</h2>
        <div class="resources-grid">
          <a
            href="https://github.com/pledgebook"
            target="_blank"
            rel="noopener noreferrer"
            class="resource-card"
          >
            <Icon name="simple-icons:github" />
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://discord.gg/pledgebook"
            target="_blank"
            rel="noopener noreferrer"
            class="resource-card"
          >
            <Icon name="simple-icons:discord" />
            <span>Discord Community</span>
          </a>
          <NuxtLink
            to="/roadmap"
            class="resource-card"
          >
            <Icon name="heroicons:map" />
            <span>Product Roadmap</span>
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="resource-card"
          >
            <Icon name="heroicons:envelope" />
            <span>Contact Support</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Documentation | Pledgebook',
  description:
    'Pledgebook documentation: guides for creators, pledgers, developers, and administrators.',
})
</script>

<style scoped>
.docs-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Header */
.page-header {
  padding: 4rem 0 3rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  text-align: center;
}

.page-header__content {
  max-width: 600px;
  margin: 0 auto;
}

.page-header__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.page-header__description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* Section Title */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Docs Section */
.docs-section {
  padding: 4rem 0;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.docs-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.docs-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.docs-card__icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.docs-card__icon--blue {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.docs-card__icon--green {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

.docs-card__icon--purple {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
}

.docs-card__icon--orange {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.docs-card__icon--teal {
  background-color: #d1fae5;
  color: #059669;
}

.docs-card__icon--red {
  background-color: #fee2e2;
  color: #dc2626;
}

.docs-card__content {
  flex: 1;
}

.docs-card__content h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.docs-card__content p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.docs-card__arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.docs-card:hover .docs-card__arrow {
  color: var(--color-primary);
}

/* Quick Links Section */
.quick-links-section {
  padding: 3rem 0;
  background-color: var(--bg-primary);
}

.quick-links-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  max-width: 800px;
  margin: 0 auto;
}

.quick-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.quick-link:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.quick-link .iconify {
  color: var(--color-primary);
}

/* Resources Section */
.resources-section {
  padding: 3rem 0;
}

.resources-grid {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.resource-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.resource-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.resource-card .iconify {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .docs-grid {
    grid-template-columns: 1fr;
    max-width: 450px;
  }

  .quick-links-grid {
    flex-direction: column;
    max-width: 300px;
  }

  .resources-grid {
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>
