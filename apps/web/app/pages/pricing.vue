<template>
  <div class="pricing-page">
    <!-- Hero Section -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__badge">
            <Icon name="heroicons:sparkles" />
            Simple, Transparent Pricing
          </div>
          <h1 class="page-header__title">Only Pay When You Succeed</h1>
          <p class="page-header__description">
            Pledgebook charges a small fee only on successful campaigns. No upfront costs, no hidden
            fees, no monthly subscriptions.
          </p>
        </div>
      </div>
    </header>

    <!-- Pricing Cards -->
    <section class="pricing-section">
      <div class="container-app">
        <div class="pricing-grid">
          <!-- For Campaign Creators -->
          <div class="pricing-card pricing-card--creator">
            <div class="pricing-card__header">
              <div class="pricing-card__icon">
                <Icon name="heroicons:megaphone" />
              </div>
              <h2 class="pricing-card__title">Campaign Creators</h2>
              <p class="pricing-card__subtitle">Launch your verifiable campaign</p>
            </div>

            <div class="pricing-card__price">
              <span class="pricing-card__price-amount">5%</span>
              <span class="pricing-card__price-unit">of funds raised</span>
            </div>

            <p class="pricing-card__price-note">Only charged on successful campaigns</p>

            <ul class="pricing-card__features">
              <li>
                <Icon name="heroicons:check-circle" />
                Free to create campaigns
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                AI-powered campaign validation
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Automatic baseline capture
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Multi-AI consensus verification
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Smart contract escrow
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Progress updates & evidence upload
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Automatic fund distribution
              </li>
            </ul>

            <NuxtLink
              to="/campaigns/create"
              class="btn btn-primary pricing-card__cta"
            >
              <Icon name="heroicons:plus" />
              Create Campaign
            </NuxtLink>
          </div>

          <!-- For Pledgers -->
          <div class="pricing-card pricing-card--pledger">
            <div class="pricing-card__header">
              <div class="pricing-card__icon">
                <Icon name="heroicons:heart" />
              </div>
              <h2 class="pricing-card__title">Pledgers</h2>
              <p class="pricing-card__subtitle">Support campaigns you believe in</p>
            </div>

            <div class="pricing-card__price">
              <span class="pricing-card__price-amount">0%</span>
              <span class="pricing-card__price-unit">platform fee</span>
            </div>

            <p class="pricing-card__price-note">Only pay blockchain gas fees</p>

            <ul class="pricing-card__features">
              <li>
                <Icon name="heroicons:check-circle" />
                No platform fees on pledges
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Full refund if campaign fails
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Funds earn yield while escrowed
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Transparent verification process
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Dispute filing capability
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                On-chain transaction records
              </li>
            </ul>

            <NuxtLink
              to="/campaigns"
              class="btn btn-secondary pricing-card__cta"
            >
              <Icon name="heroicons:magnifying-glass" />
              Browse Campaigns
            </NuxtLink>
          </div>

          <!-- For Vouchers -->
          <div class="pricing-card pricing-card--voucher">
            <div class="pricing-card__header">
              <div class="pricing-card__icon">
                <Icon name="heroicons:hand-raised" />
              </div>
              <h2 class="pricing-card__title">Vouchers</h2>
              <p class="pricing-card__subtitle">Stake on campaign success</p>
            </div>

            <div class="pricing-card__price">
              <span class="pricing-card__price-amount">0%</span>
              <span class="pricing-card__price-unit">platform fee</span>
            </div>

            <p class="pricing-card__price-note">Earn yield on successful campaigns</p>

            <ul class="pricing-card__features">
              <li>
                <Icon name="heroicons:check-circle" />
                No platform fees on vouches
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Earn share of Aave yield
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Build voucher reputation
              </li>
              <li>
                <Icon name="heroicons:check-circle" />
                Early access to campaigns
              </li>
              <li>
                <Icon
                  name="heroicons:x-circle"
                  class="text-warning"
                />
                Risk: stake may be slashed on failure
              </li>
            </ul>

            <NuxtLink
              to="/campaigns"
              class="btn btn-secondary pricing-card__cta"
            >
              <Icon name="heroicons:chart-bar" />
              Find Opportunities
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Fee Breakdown -->
    <section class="breakdown-section">
      <div class="container-app">
        <h2 class="section-title">Where Do Fees Go?</h2>

        <div class="breakdown-grid">
          <div class="breakdown-card">
            <div class="breakdown-card__percentage">3%</div>
            <h3>Platform Operations</h3>
            <p>
              Infrastructure, AI verification costs, smart contract deployment, and ongoing
              development of the platform.
            </p>
          </div>

          <div class="breakdown-card">
            <div class="breakdown-card__percentage">1%</div>
            <h3>Security Reserve</h3>
            <p>
              Maintained for smart contract audits, bug bounties, and emergency response to protect
              user funds.
            </p>
          </div>

          <div class="breakdown-card">
            <div class="breakdown-card__percentage">1%</div>
            <h3>Community Treasury</h3>
            <p>
              Funds community initiatives, grants for innovative campaigns, and future governance
              mechanisms.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Blockchain Fees -->
    <section class="gas-section">
      <div class="container-app">
        <div class="gas-card">
          <div class="gas-card__content">
            <h2>About Blockchain Gas Fees</h2>
            <p>
              All blockchain transactions require gas fees paid in MATIC (Polygon network).
              Pledgebook does not receive or control these fees — they go to network validators.
            </p>
            <div class="gas-estimates">
              <div class="gas-estimate">
                <span class="gas-estimate__action">Pledge</span>
                <span class="gas-estimate__cost">~$0.01 - $0.05</span>
              </div>
              <div class="gas-estimate">
                <span class="gas-estimate__action">Vouch</span>
                <span class="gas-estimate__cost">~$0.01 - $0.05</span>
              </div>
              <div class="gas-estimate">
                <span class="gas-estimate__action">Claim/Withdraw</span>
                <span class="gas-estimate__cost">~$0.02 - $0.10</span>
              </div>
            </div>
            <p class="gas-note">
              <Icon name="heroicons:information-circle" />
              Gas costs vary based on network congestion. Polygon offers very low fees compared to
              Ethereum mainnet.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq-section">
      <div class="container-app">
        <h2 class="section-title">Frequently Asked Questions</h2>

        <div class="faq-list">
          <details class="faq-item">
            <summary>What if my campaign doesn't reach its funding goal?</summary>
            <p>
              If your campaign fails to achieve its stated goal (as determined by AI consensus), all
              pledged funds are automatically returned to pledgers. No platform fee is charged on
              failed campaigns.
            </p>
          </details>

          <details class="faq-item">
            <summary>When is the 5% fee charged?</summary>
            <p>
              The platform fee is automatically deducted when funds are released to the campaign
              creator upon successful verification. You never pay anything upfront.
            </p>
          </details>

          <details class="faq-item">
            <summary>How does yield generation work?</summary>
            <p>
              Escrowed funds are deposited into Aave V3 on Polygon, earning yield while awaiting
              campaign resolution. On success, yield is distributed to vouchers. On failure, yield
              goes to pledgers.
            </p>
          </details>

          <details class="faq-item">
            <summary>What currencies are accepted?</summary>
            <p>
              Currently, Pledgebook only accepts USDC on the Polygon network. USDC is a
              dollar-pegged stablecoin, providing price stability for both creators and pledgers.
            </p>
          </details>

          <details class="faq-item">
            <summary>Are there any volume discounts?</summary>
            <p>
              We're exploring volume discounts for verified nonprofits and high-volume creators.
              Contact us for enterprise pricing inquiries.
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <h2>Ready to Get Started?</h2>
          <p>Create your first verifiable fundraising campaign today — no upfront costs.</p>
          <div class="cta-actions">
            <NuxtLink
              to="/campaigns/create"
              class="btn btn-primary"
            >
              <Icon name="heroicons:plus" />
              Create Campaign
            </NuxtLink>
            <NuxtLink
              to="/how-it-works"
              class="btn btn-secondary"
            >
              <Icon name="heroicons:play" />
              Learn How It Works
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Pricing | Pledgebook',
  description:
    'Pledgebook pricing: 5% fee on successful campaigns only. No upfront costs, no hidden fees. Pledgers and vouchers pay zero platform fees.',
})
</script>

<style scoped>
.pricing-page {
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
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.page-header__description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Pricing Section */
.pricing-section {
  padding: 4rem 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.pricing-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.pricing-card__header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.pricing-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
}

.pricing-card--creator .pricing-card__icon {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.pricing-card--pledger .pricing-card__icon {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

.pricing-card--voucher .pricing-card__icon {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
}

.pricing-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.pricing-card__subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.pricing-card__price {
  text-align: center;
  margin-bottom: 0.5rem;
}

.pricing-card__price-amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.pricing-card__price-unit {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pricing-card__price-note {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-bottom: 1.5rem;
}

.pricing-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  flex: 1;
}

.pricing-card__features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.pricing-card__features li:last-child {
  border-bottom: none;
}

.pricing-card__features .iconify {
  color: var(--color-green);
  flex-shrink: 0;
}

.pricing-card__features .text-warning {
  color: var(--color-warning) !important;
}

.pricing-card__cta {
  width: 100%;
  justify-content: center;
}

/* Breakdown Section */
.breakdown-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.breakdown-card {
  text-align: center;
  padding: 1.5rem;
}

.breakdown-card__percentage {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.breakdown-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.breakdown-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Gas Section */
.gas-section {
  padding: 4rem 0;
}

.gas-card {
  max-width: 700px;
  margin: 0 auto;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
}

.gas-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.gas-card > .gas-card__content > p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.gas-estimates {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.gas-estimate {
  flex: 1;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.gas-estimate__action {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.gas-estimate__cost {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.gas-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
}

.gas-note .iconify {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* FAQ Section */
.faq-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid var(--border-primary);
}

.faq-item summary {
  padding: 1.25rem 0;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: '+';
  font-size: 1.25rem;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.faq-item[open] summary::after {
  content: '−';
}

.faq-item p {
  color: var(--text-secondary);
  line-height: 1.7;
  padding-bottom: 1.25rem;
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: 4rem 0;
}

.cta-card {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 3rem;
}

.cta-card h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
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
@media (max-width: 992px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .gas-estimates {
    flex-direction: column;
  }

  .cta-card {
    padding: 2rem;
  }
}
</style>
