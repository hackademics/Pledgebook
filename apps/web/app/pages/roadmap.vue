<template>
  <div class="roadmap-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__badge">
            <Icon name="heroicons:map" />
            Product Roadmap
          </div>
          <h1 class="page-header__title">Building the Future of Verifiable Crowdfunding</h1>
          <p class="page-header__description">
            Our vision for evolving Pledgebook into a fully decentralized, community-governed
            platform.
          </p>
        </div>
      </div>
    </header>

    <!-- Timeline -->
    <section class="timeline-section">
      <div class="container-app">
        <div class="timeline">
          <!-- Phase 1: Foundation -->
          <div class="timeline-phase timeline-phase--completed">
            <div class="timeline-phase__marker">
              <Icon name="heroicons:check" />
            </div>
            <div class="timeline-phase__content">
              <div class="timeline-phase__header">
                <span class="timeline-phase__status timeline-phase__status--completed"
                  >Completed</span
                >
                <span class="timeline-phase__date">Q4 2024</span>
              </div>
              <h2>Phase 1: Foundation</h2>
              <p>Core platform infrastructure and smart contracts.</p>
              <ul class="timeline-phase__items">
                <li>
                  <Icon name="heroicons:check-circle" />
                  Smart contract escrow with Aave V3 yield
                </li>
                <li>
                  <Icon name="heroicons:check-circle" />
                  SIWE (Sign-In with Ethereum) authentication
                </li>
                <li>
                  <Icon name="heroicons:check-circle" />
                  Campaign creation workflow
                </li>
                <li>
                  <Icon name="heroicons:check-circle" />
                  Pledge and vouch functionality
                </li>
                <li>
                  <Icon name="heroicons:check-circle" />
                  Basic AI campaign validation
                </li>
              </ul>
            </div>
          </div>

          <!-- Phase 2: Verification -->
          <div class="timeline-phase timeline-phase--current">
            <div class="timeline-phase__marker">
              <span>2</span>
            </div>
            <div class="timeline-phase__content">
              <div class="timeline-phase__header">
                <span class="timeline-phase__status timeline-phase__status--current"
                  >In Progress</span
                >
                <span class="timeline-phase__date">Q1 2025</span>
              </div>
              <h2>Phase 2: Multi-AI Verification</h2>
              <p>Robust goal verification with AI consensus.</p>
              <ul class="timeline-phase__items">
                <li>
                  <Icon name="heroicons:check-circle" />
                  Multi-model AI consensus (Claude, GPT-4, Gemini)
                </li>
                <li>
                  <Icon name="heroicons:check-circle" />
                  Baseline capture before campaign start
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Evidence upload with IPFS storage
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Dispute filing and resolution workflow
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  On-chain audit trail for all decisions
                </li>
              </ul>
            </div>
          </div>

          <!-- Phase 3: Growth -->
          <div class="timeline-phase timeline-phase--upcoming">
            <div class="timeline-phase__marker">
              <span>3</span>
            </div>
            <div class="timeline-phase__content">
              <div class="timeline-phase__header">
                <span class="timeline-phase__status timeline-phase__status--upcoming"
                  >Upcoming</span
                >
                <span class="timeline-phase__date">Q2 2025</span>
              </div>
              <h2>Phase 3: Platform Growth</h2>
              <p>Expanding features and user experience.</p>
              <ul class="timeline-phase__items">
                <li>
                  <Icon name="heroicons:clock" />
                  Mobile-optimized experience
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Creator profiles and reputation scores
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Campaign analytics dashboard
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Email and push notifications
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Multi-chain support (Base, Arbitrum)
                </li>
              </ul>
            </div>
          </div>

          <!-- Phase 4: Decentralization -->
          <div class="timeline-phase timeline-phase--upcoming">
            <div class="timeline-phase__marker">
              <span>4</span>
            </div>
            <div class="timeline-phase__content">
              <div class="timeline-phase__header">
                <span class="timeline-phase__status timeline-phase__status--upcoming">Planned</span>
                <span class="timeline-phase__date">Q3-Q4 2025</span>
              </div>
              <h2>Phase 4: Decentralization</h2>
              <p>Community governance and full decentralization.</p>
              <ul class="timeline-phase__items">
                <li>
                  <Icon name="heroicons:clock" />
                  DAO governance structure
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Community dispute arbitration
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Decentralized AI verification nodes
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Treasury management by token holders
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Protocol fee redistribution
                </li>
              </ul>
            </div>
          </div>

          <!-- Phase 5: Ecosystem -->
          <div class="timeline-phase timeline-phase--upcoming">
            <div class="timeline-phase__marker">
              <span>5</span>
            </div>
            <div class="timeline-phase__content">
              <div class="timeline-phase__header">
                <span class="timeline-phase__status timeline-phase__status--upcoming">Vision</span>
                <span class="timeline-phase__date">2026+</span>
              </div>
              <h2>Phase 5: Ecosystem Expansion</h2>
              <p>Building the verification ecosystem.</p>
              <ul class="timeline-phase__items">
                <li>
                  <Icon name="heroicons:clock" />
                  API for third-party integrations
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Verification-as-a-service for other platforms
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Cross-platform campaign mirroring
                </li>
                <li>
                  <Icon name="heroicons:clock" />
                  Enterprise and nonprofit partnerships
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <h2>Have Feature Requests?</h2>
          <p>We'd love to hear your ideas for making Pledgebook better.</p>
          <div class="cta-actions">
            <NuxtLink
              to="/contact"
              class="btn btn-primary"
            >
              <Icon name="heroicons:chat-bubble-left-right" />
              Share Feedback
            </NuxtLink>
            <a
              href="https://github.com/pledgebook/pledgebook/discussions"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-secondary"
            >
              <Icon name="simple-icons:github" />
              GitHub Discussions
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Roadmap | Pledgebook',
  description:
    'Explore the Pledgebook product roadmap: from AI verification to full decentralization and community governance.',
})
</script>

<style scoped>
.roadmap-page {
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
  max-width: 650px;
  margin: 0 auto;
}

.page-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.page-header__title {
  font-size: 2.25rem;
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

/* Timeline Section */
.timeline-section {
  padding: 4rem 0;
}

.timeline {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1.25rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--border-primary);
}

.timeline-phase {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-phase:last-child {
  margin-bottom: 0;
}

.timeline-phase__marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-phase--completed .timeline-phase__marker {
  background-color: var(--color-green);
  color: white;
}

.timeline-phase--current .timeline-phase__marker {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 4px var(--color-primary-light);
}

.timeline-phase--upcoming .timeline-phase__marker {
  background-color: var(--bg-primary);
  border: 2px solid var(--border-primary);
  color: var(--text-secondary);
}

.timeline-phase__content {
  flex: 1;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.timeline-phase--current .timeline-phase__content {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.timeline-phase__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.timeline-phase__status {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.timeline-phase__status--completed {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

.timeline-phase__status--current {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.timeline-phase__status--upcoming {
  background-color: var(--bg-secondary);
  color: var(--text-tertiary);
}

.timeline-phase__date {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.timeline-phase__content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.timeline-phase__content > p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.timeline-phase__items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline-phase__items li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.375rem 0;
}

.timeline-phase--completed .timeline-phase__items .iconify,
.timeline-phase__items li .iconify[class*='check'] {
  color: var(--color-green);
}

.timeline-phase__items li .iconify[class*='clock'] {
  color: var(--text-tertiary);
}

/* CTA Section */
.cta-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.cta-card {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.cta-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.cta-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .timeline::before {
    left: 1rem;
  }

  .timeline-phase {
    gap: 1rem;
  }

  .timeline-phase__marker {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }

  .timeline-phase__content {
    padding: 1rem;
  }
}
</style>
