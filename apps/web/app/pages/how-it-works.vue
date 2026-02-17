<template>
  <div class="how-it-works-page">
    <!-- Hero Section -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__badge">
            <Icon name="heroicons:play-circle" />
            Step-by-Step Guide
          </div>
          <h1 class="page-header__title">How Pledgebook Works</h1>
          <p class="page-header__description">
            Pledgebook transforms fundraising by releasing funds only when verifiable outcomes are
            achieved. Here's how the journey works for creators, pledgers, and vouchers.
          </p>
        </div>
      </div>
    </header>

    <!-- Quick Overview -->
    <section class="overview-section">
      <div class="container-app">
        <div class="overview-grid">
          <div class="overview-card">
            <div class="overview-card__icon overview-card__icon--create">
              <Icon name="heroicons:document-plus" />
            </div>
            <h3>1. Create</h3>
            <p>Define a measurable goal with verifiable data sources</p>
          </div>
          <div class="overview-card">
            <div class="overview-card__icon overview-card__icon--fund">
              <Icon name="heroicons:banknotes" />
            </div>
            <h3>2. Fund</h3>
            <p>Pledgers contribute USDC held in smart contract escrow</p>
          </div>
          <div class="overview-card">
            <div class="overview-card__icon overview-card__icon--verify">
              <Icon name="heroicons:shield-check" />
            </div>
            <h3>3. Verify</h3>
            <p>AI consensus determines if the goal was achieved</p>
          </div>
          <div class="overview-card">
            <div class="overview-card__icon overview-card__icon--release">
              <Icon name="heroicons:check-circle" />
            </div>
            <h3>4. Release</h3>
            <p>Funds go to creator on success, or return to pledgers</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed Steps -->
    <section class="steps-section">
      <div class="container-app">
        <h2 class="section-title">The Complete Lifecycle</h2>

        <div class="step-timeline">
          <!-- Step 1: Create Campaign -->
          <article class="step-card">
            <div class="step-card__number">1</div>
            <div class="step-card__content">
              <h3 class="step-card__title">Create Your Campaign</h3>
              <p class="step-card__description">
                Campaign creators define a SMART goal — Specific, Measurable, Achievable, Relevant,
                and Time-bound. The key requirement is that the outcome must be verifiable through
                accessible data sources.
              </p>
              <div class="step-card__details">
                <h4>What you'll provide:</h4>
                <ul>
                  <li>Clear goal statement (e.g., "Lose 20 lbs by May 1")</li>
                  <li>Verification method (Fitbit API, medical records, etc.)</li>
                  <li>Fundraising target in USDC</li>
                  <li>Campaign duration and deadline</li>
                  <li>Baseline evidence for "before" state</li>
                </ul>
              </div>
            </div>
          </article>

          <!-- Step 2: AI Validation -->
          <article class="step-card">
            <div class="step-card__number">2</div>
            <div class="step-card__content">
              <h3 class="step-card__title">AI Validation & Approval</h3>
              <p class="step-card__description">
                Our AI system analyzes your campaign for clarity, fraud risk, and verifiability.
                This protects pledgers from impossible or fraudulent campaigns.
              </p>
              <div class="step-card__details">
                <h4>What AI checks:</h4>
                <ul>
                  <li>Is the goal clearly defined and measurable?</li>
                  <li>Are the data sources accessible and reliable?</li>
                  <li>Is the timeline realistic?</li>
                  <li>Are there red flags suggesting fraud?</li>
                  <li>Does it violate any platform policies?</li>
                </ul>
              </div>
            </div>
          </article>

          <!-- Step 3: Baseline Capture -->
          <article class="step-card">
            <div class="step-card__number">3</div>
            <div class="step-card__content">
              <h3 class="step-card__title">Baseline Capture</h3>
              <p class="step-card__description">
                The Chainlink Runtime Environment (CRE) captures an immutable "before" snapshot
                using DECO and Zero-Knowledge Proofs. This ensures fair comparison at verification.
              </p>
              <div class="step-card__details">
                <h4>Privacy protection:</h4>
                <ul>
                  <li>Actual data values never leave the source</li>
                  <li>Only cryptographic proofs are stored</li>
                  <li>Verification possible without exposing sensitive info</li>
                </ul>
              </div>
            </div>
          </article>

          <!-- Step 4: Fundraising -->
          <article class="step-card">
            <div class="step-card__number">4</div>
            <div class="step-card__content">
              <h3 class="step-card__title">Fundraising Period</h3>
              <p class="step-card__description">
                Once approved, your campaign goes live. Supporters can participate as Pledgers or
                Vouchers, each with different risk/reward profiles.
              </p>
              <div class="step-card__details">
                <div class="participant-grid">
                  <div class="participant-card">
                    <h4>
                      <Icon name="heroicons:heart" />
                      Pledgers
                    </h4>
                    <p>
                      Contribute USDC that goes to the creator if the goal is achieved. If the
                      campaign fails, pledgers get their money back (minus gas fees).
                    </p>
                  </div>
                  <div class="participant-card">
                    <h4>
                      <Icon name="heroicons:hand-raised" />
                      Vouchers
                    </h4>
                    <p>
                      Stake USDC as a vote of confidence. On success, vouchers earn yield. On
                      failure, vouchers may be slashed — aligning incentives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <!-- Step 5: Execution -->
          <article class="step-card">
            <div class="step-card__number">5</div>
            <div class="step-card__content">
              <h3 class="step-card__title">Execution Period</h3>
              <p class="step-card__description">
                The creator works toward their goal. All funds remain in escrow on Aave V3, earning
                yield while waiting. Progress updates keep supporters informed.
              </p>
              <div class="step-card__details">
                <h4>During this phase:</h4>
                <ul>
                  <li>Funds earn passive yield in Aave</li>
                  <li>Creator can post progress updates</li>
                  <li>Supporters can file disputes if concerned</li>
                  <li>Smart contracts enforce all rules automatically</li>
                </ul>
              </div>
            </div>
          </article>

          <!-- Step 6: AI Consensus -->
          <article class="step-card">
            <div class="step-card__number">6</div>
            <div class="step-card__content">
              <h3 class="step-card__title">AI Consensus Verification</h3>
              <p class="step-card__description">
                At the deadline, three independent AI providers (Claude, GPT-4, Gemini) analyze the
                evidence and vote on whether the goal was achieved. ≥66% agreement is required.
              </p>
              <div class="step-card__details">
                <h4>Verification process:</h4>
                <ul>
                  <li>Compare final evidence to baseline</li>
                  <li>Each AI votes independently (TRUE/FALSE)</li>
                  <li>Supermajority required for success</li>
                  <li>Results are recorded on-chain</li>
                </ul>
              </div>
            </div>
          </article>

          <!-- Step 7: Resolution -->
          <article class="step-card">
            <div class="step-card__number">7</div>
            <div class="step-card__content">
              <h3 class="step-card__title">Automatic Resolution</h3>
              <p class="step-card__description">
                Based on the AI consensus, smart contracts automatically distribute funds with no
                human intervention required.
              </p>
              <div class="step-card__details">
                <div class="outcome-grid">
                  <div class="outcome-card outcome-card--success">
                    <h4>
                      <Icon name="heroicons:check-circle" />
                      Goal Achieved
                    </h4>
                    <ul>
                      <li>Creator receives pledged funds</li>
                      <li>Vouchers receive their stake + yield</li>
                      <li>Platform takes small fee</li>
                    </ul>
                  </div>
                  <div class="outcome-card outcome-card--failure">
                    <h4>
                      <Icon name="heroicons:x-circle" />
                      Goal Not Achieved
                    </h4>
                    <ul>
                      <li>Pledgers receive full refund</li>
                      <li>Voucher stakes may be slashed</li>
                      <li>Yield goes to pledgers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <h2>Ready to Get Started?</h2>
          <p>Create a campaign with verifiable goals, or explore existing campaigns to support.</p>
          <div class="cta-actions">
            <NuxtLink
              to="/campaigns/create"
              class="btn btn-primary"
            >
              <Icon name="heroicons:plus" />
              Create Campaign
            </NuxtLink>
            <NuxtLink
              to="/campaigns"
              class="btn btn-secondary"
            >
              <Icon name="heroicons:magnifying-glass" />
              Explore Campaigns
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'How It Works | Pledgebook',
  description:
    'Learn how Pledgebook works: create campaigns with verifiable goals, get funded, and release funds only when outcomes are achieved through AI consensus.',
})
</script>

<style scoped>
.how-it-works-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Header */
.page-header {
  padding: 4rem 0 3rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.page-header__content {
  max-width: 700px;
  text-align: center;
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

/* Overview Section */
.overview-section {
  padding: 3rem 0;
  background-color: var(--bg-primary);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.overview-card {
  text-align: center;
  padding: 1.5rem;
}

.overview-card__icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.overview-card__icon--create {
  background-color: var(--color-blue-light);
  color: var(--color-blue);
}

.overview-card__icon--fund {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

.overview-card__icon--verify {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
}

.overview-card__icon--release {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.overview-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.overview-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Steps Section */
.steps-section {
  padding: 4rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 3rem;
}

.step-timeline {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-card {
  display: flex;
  gap: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
}

.step-card__number {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50%;
}

.step-card__content {
  flex: 1;
}

.step-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.step-card__description {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.step-card__details {
  background-color: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.step-card__details h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.step-card__details ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0;
}

.step-card__details li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.25rem;
}

/* Participant Grid */
.participant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.participant-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
}

.participant-card h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.participant-card p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Outcome Grid */
.outcome-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.outcome-card {
  border-radius: 0.5rem;
  padding: 1rem;
}

.outcome-card--success {
  background-color: var(--color-green-light);
  border: 1px solid var(--color-green);
}

.outcome-card--failure {
  background-color: var(--color-red-light);
  border: 1px solid var(--color-red);
}

.outcome-card h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.outcome-card--success h4 {
  color: var(--color-green);
}

.outcome-card--failure h4 {
  color: var(--color-red);
}

.outcome-card ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0;
}

.outcome-card li {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.25rem;
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
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .step-card {
    flex-direction: column;
    padding: 1.5rem;
  }

  .step-card__number {
    align-self: flex-start;
  }

  .participant-grid,
  .outcome-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    padding: 2rem;
  }
}
</style>
