<template>
  <div class="careers-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__badge">
            <Icon name="heroicons:briefcase" />
            Join Our Team
          </div>
          <h1 class="page-header__title">Build the Future of Verifiable Crowdfunding</h1>
          <p class="page-header__description">
            We're a small, remote team passionate about bringing transparency and accountability to
            fundraising through blockchain and AI.
          </p>
        </div>
      </div>
    </header>

    <!-- Values -->
    <section class="values-section">
      <div class="container-app">
        <h2 class="section-title">Our Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <Icon name="heroicons:eye" />
            <h3>Transparency First</h3>
            <p>
              We believe in radical transparency—in our code, our processes, and our communication.
            </p>
          </div>
          <div class="value-card">
            <Icon name="heroicons:shield-check" />
            <h3>Trust Through Verification</h3>
            <p>
              We're building systems that replace trust with verification, making accountability
              automatic.
            </p>
          </div>
          <div class="value-card">
            <Icon name="heroicons:users" />
            <h3>User Empowerment</h3>
            <p>
              Users own their data, their funds, and their decisions. We're just the infrastructure.
            </p>
          </div>
          <div class="value-card">
            <Icon name="heroicons:rocket-launch" />
            <h3>Ship & Iterate</h3>
            <p>
              We move fast, ship often, and learn from real-world feedback. Perfection comes through
              iteration.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Open Positions -->
    <section class="positions-section">
      <div class="container-app">
        <h2 class="section-title">Open Positions</h2>

        <div class="positions-list">
          <!-- No open positions -->
          <div class="no-positions-card">
            <Icon name="heroicons:inbox" />
            <h3>No Open Positions</h3>
            <p>
              We don't have any open positions right now, but we're always interested in meeting
              talented people. Send us your resume and we'll keep you in mind for future
              opportunities.
            </p>
            <a
              href="mailto:careers@pledgebook.io"
              class="btn btn-primary"
            >
              <Icon name="heroicons:envelope" />
              Send Your Resume
            </a>
          </div>

          <!-- Example position template (hidden, for future use) -->
          <!-- 
          <div class="position-card">
            <div class="position-card__header">
              <h3>Senior Solidity Developer</h3>
              <span class="position-card__type">Full-time • Remote</span>
            </div>
            <p class="position-card__description">
              We're looking for an experienced Solidity developer to help build and audit our
              smart contract infrastructure.
            </p>
            <div class="position-card__tags">
              <span class="tag">Solidity</span>
              <span class="tag">Hardhat</span>
              <span class="tag">Security</span>
            </div>
            <a href="mailto:careers@pledgebook.io" class="btn btn-secondary">
              Apply Now
            </a>
          </div>
          -->
        </div>
      </div>
    </section>

    <!-- Perks -->
    <section class="perks-section">
      <div class="container-app">
        <h2 class="section-title">Why Join Pledgebook?</h2>
        <div class="perks-grid">
          <div class="perk-card">
            <Icon name="heroicons:globe-alt" />
            <h3>Fully Remote</h3>
            <p>Work from anywhere in the world. We're distributed across multiple time zones.</p>
          </div>
          <div class="perk-card">
            <Icon name="heroicons:clock" />
            <h3>Flexible Hours</h3>
            <p>Set your own schedule. We care about output, not hours logged.</p>
          </div>
          <div class="perk-card">
            <Icon name="heroicons:currency-dollar" />
            <h3>Competitive Pay</h3>
            <p>Salary in fiat or crypto—your choice. Plus equity in the project.</p>
          </div>
          <div class="perk-card">
            <Icon name="heroicons:academic-cap" />
            <h3>Learning Budget</h3>
            <p>Annual budget for conferences, courses, and books to help you grow.</p>
          </div>
          <div class="perk-card">
            <Icon name="heroicons:heart" />
            <h3>Health & Wellness</h3>
            <p>Comprehensive health coverage and wellness stipend for US employees.</p>
          </div>
          <div class="perk-card">
            <Icon name="heroicons:sun" />
            <h3>Generous PTO</h3>
            <p>Unlimited vacation policy with a 3-week minimum. Rest is productive.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="contact-section">
      <div class="container-app">
        <div class="contact-card">
          <h2>Let's Connect</h2>
          <p>
            Don't see a role that fits? Reach out anyway. We're always looking for exceptional
            people who share our mission.
          </p>
          <a
            href="mailto:careers@pledgebook.io"
            class="btn btn-primary"
          >
            <Icon name="heroicons:envelope" />
            careers@pledgebook.io
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Careers | Pledgebook',
  description:
    'Join the Pledgebook team. Help us build the future of verifiable, accountable crowdfunding.',
})
</script>

<style scoped>
.careers-page {
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

/* Values Section */
.values-section {
  padding: 4rem 0;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.value-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.value-card .iconify {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.value-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.value-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Positions Section */
.positions-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.positions-list {
  max-width: 600px;
  margin: 0 auto;
}

.no-positions-card {
  text-align: center;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 3rem;
}

.no-positions-card .iconify {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.no-positions-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.no-positions-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.position-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.position-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.position-card__header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.position-card__type {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.position-card__description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.position-card__tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 0.25rem;
}

/* Perks Section */
.perks-section {
  padding: 4rem 0;
}

.perks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.perk-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.perk-card .iconify {
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.perk-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.perk-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Contact Section */
.contact-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.contact-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.contact-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.contact-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 992px) {
  .values-grid {
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

  .values-grid {
    grid-template-columns: 1fr;
    max-width: 350px;
  }

  .perks-grid {
    grid-template-columns: 1fr;
    max-width: 350px;
  }
}
</style>
