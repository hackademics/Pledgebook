<template>
  <div class="partners-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__badge">
            <Icon name="heroicons:puzzle-piece" />
            Partners & Integrations
          </div>
          <h1 class="page-header__title">Built on Trusted Infrastructure</h1>
          <p class="page-header__description">
            Pledgebook integrates with leading blockchain protocols and services to provide a
            secure, reliable crowdfunding experience.
          </p>
        </div>
      </div>
    </header>

    <!-- Technology Partners -->
    <section class="partners-section">
      <div class="container-app">
        <h2 class="section-title">Technology Partners</h2>
        <div class="partners-grid">
          <div class="partner-card">
            <div class="partner-card__logo">
              <Icon name="simple-icons:polygon" />
            </div>
            <h3>Polygon</h3>
            <p>
              Our smart contracts run on Polygon, an Ethereum Layer 2 providing fast, low-cost
              transactions with Ethereum-grade security.
            </p>
          </div>

          <div class="partner-card">
            <div class="partner-card__logo">
              <Icon name="simple-icons:aave" />
            </div>
            <h3>Aave</h3>
            <p>
              Escrowed funds are deposited into Aave V3 to generate yield while campaigns are
              active, maximizing value for all participants.
            </p>
          </div>

          <div class="partner-card">
            <div class="partner-card__logo">
              <Icon name="heroicons:currency-dollar" />
            </div>
            <h3>USDC (Circle)</h3>
            <p>
              USDC provides dollar-stability for pledges, eliminating crypto volatility risk for
              both creators and pledgers.
            </p>
          </div>

          <div class="partner-card">
            <div class="partner-card__logo">
              <Icon name="simple-icons:cloudflare" />
            </div>
            <h3>Cloudflare</h3>
            <p>
              Our infrastructure runs on Cloudflare Workers, providing global edge deployment,
              security, and reliability.
            </p>
          </div>

          <div class="partner-card">
            <div class="partner-card__logo">
              <Icon name="simple-icons:ipfs" />
            </div>
            <h3>IPFS</h3>
            <p>
              Campaign evidence and verification records are stored on IPFS for permanent,
              decentralized, tamper-proof storage.
            </p>
          </div>

          <div class="partner-card">
            <div class="partner-card__logo">
              <Icon name="heroicons:cpu-chip" />
            </div>
            <h3>Multi-AI Providers</h3>
            <p>
              Claude (Anthropic), GPT-4 (OpenAI), and Gemini (Google) power our consensus
              verification system.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Become a Partner -->
    <section class="become-partner-section">
      <div class="container-app">
        <div class="become-partner-card">
          <div class="become-partner-content">
            <h2>Become a Partner</h2>
            <p>
              We're always looking to work with organizations aligned with our mission of
              transparent, accountable crowdfunding.
            </p>
            <ul class="partnership-types">
              <li>
                <Icon name="heroicons:building-office-2" />
                <div>
                  <strong>Nonprofits & NGOs</strong>
                  <span>Special onboarding and reduced fees for verified nonprofits</span>
                </div>
              </li>
              <li>
                <Icon name="heroicons:server-stack" />
                <div>
                  <strong>DeFi Protocols</strong>
                  <span>Integrate additional yield strategies or payment options</span>
                </div>
              </li>
              <li>
                <Icon name="heroicons:cube-transparent" />
                <div>
                  <strong>Web3 Projects</strong>
                  <span>Co-market campaigns or integrate verification services</span>
                </div>
              </li>
              <li>
                <Icon name="heroicons:academic-cap" />
                <div>
                  <strong>Research Institutions</strong>
                  <span>Collaborate on AI verification and accountability research</span>
                </div>
              </li>
            </ul>
          </div>
          <div class="become-partner-action">
            <a
              href="mailto:partnerships@pledgebook.io"
              class="btn btn-primary"
            >
              <Icon name="heroicons:envelope" />
              Contact Partnerships
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Integration Options -->
    <section class="integration-section">
      <div class="container-app">
        <h2 class="section-title">Integration Options</h2>
        <div class="integration-grid">
          <div class="integration-card">
            <Icon name="heroicons:code-bracket" />
            <h3>API Access</h3>
            <p>
              Programmatic access to campaign data, verification status, and pledge information.
              Perfect for dashboards and analytics.
            </p>
            <span class="integration-status integration-status--coming">Coming Q2 2025</span>
          </div>
          <div class="integration-card">
            <Icon name="heroicons:link" />
            <h3>Embed Widgets</h3>
            <p>
              Embed campaign progress, pledge buttons, or verification badges directly on your
              website.
            </p>
            <span class="integration-status integration-status--coming">Coming Q2 2025</span>
          </div>
          <div class="integration-card">
            <Icon name="heroicons:bell" />
            <h3>Webhooks</h3>
            <p>
              Real-time notifications for campaign events: new pledges, verification updates, goal
              completion.
            </p>
            <span class="integration-status integration-status--coming">Coming Q3 2025</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <h2>Ready to Integrate?</h2>
          <p>Let's discuss how Pledgebook can work with your organization or project.</p>
          <a
            href="mailto:partnerships@pledgebook.io"
            class="btn btn-primary"
          >
            <Icon name="heroicons:chat-bubble-left-right" />
            Start a Conversation
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Partners & Integrations | Pledgebook',
  description:
    'Learn about Pledgebook technology partners including Polygon, Aave, and USDC. Explore partnership and integration opportunities.',
})
</script>

<style scoped>
.partners-page {
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

/* Section Title */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
}

/* Partners Section */
.partners-section {
  padding: 4rem 0;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.partner-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.partner-card__logo {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: var(--color-primary);
}

.partner-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.partner-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Become Partner Section */
.become-partner-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.become-partner-card {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.become-partner-content {
  flex: 1;
}

.become-partner-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.become-partner-content > p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.partnership-types {
  list-style: none;
  padding: 0;
  margin: 0;
}

.partnership-types li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-secondary);
}

.partnership-types li:last-child {
  border-bottom: none;
}

.partnership-types .iconify {
  color: var(--color-primary);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.partnership-types strong {
  display: block;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.partnership-types span {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.become-partner-action {
  flex-shrink: 0;
}

/* Integration Section */
.integration-section {
  padding: 4rem 0;
}

.integration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.integration-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.integration-card .iconify {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.integration-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.integration-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.integration-status {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.integration-status--coming {
  background-color: var(--bg-secondary);
  color: var(--text-tertiary);
}

.integration-status--available {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

/* CTA Section */
.cta-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.cta-card {
  max-width: 500px;
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

/* Responsive */
@media (max-width: 992px) {
  .partners-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .partners-grid {
    grid-template-columns: 1fr;
    max-width: 350px;
  }

  .become-partner-card {
    flex-direction: column;
    text-align: center;
  }

  .partnership-types li {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .integration-grid {
    grid-template-columns: 1fr;
    max-width: 350px;
  }
}
</style>
