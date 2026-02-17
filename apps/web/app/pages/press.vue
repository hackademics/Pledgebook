<template>
  <div class="press-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Press & Media</h1>
          <p class="page-header__description">
            Resources for journalists and media covering Pledgebook.
          </p>
        </div>
      </div>
    </header>

    <!-- Press Kit -->
    <section class="press-kit-section">
      <div class="container-app">
        <div class="press-kit-card">
          <div class="press-kit-card__content">
            <h2>Press Kit</h2>
            <p>
              Download our press kit containing logos, brand guidelines, product screenshots, and
              key facts about Pledgebook.
            </p>
            <ul class="press-kit-list">
              <li>
                <Icon name="heroicons:photo" />
                Logos (SVG, PNG, various sizes)
              </li>
              <li>
                <Icon name="heroicons:document-text" />
                Brand guidelines
              </li>
              <li>
                <Icon name="heroicons:device-phone-mobile" />
                Product screenshots
              </li>
              <li>
                <Icon name="heroicons:presentation-chart-bar" />
                Company fact sheet
              </li>
            </ul>
          </div>
          <div class="press-kit-card__action">
            <a
              href="/press-kit.zip"
              class="btn btn-primary"
            >
              <Icon name="heroicons:arrow-down-tray" />
              Download Press Kit
            </a>
            <p class="press-kit-note">Last updated: January 2025</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Pledgebook -->
    <section class="about-section">
      <div class="container-app">
        <h2 class="section-title">About Pledgebook</h2>
        <div class="about-content">
          <div class="about-text">
            <p class="about-boilerplate">
              <strong>Pledgebook</strong> is a verification-first crowdfunding platform built on
              blockchain technology. Unlike traditional crowdfunding platforms where funds are
              released to creators immediately, Pledgebook holds funds in smart contract escrow
              until campaign goals are verified through multi-AI consensus.
            </p>
            <p>
              Founded in 2024, Pledgebook aims to bring accountability and transparency to
              fundraising by leveraging decentralized infrastructure. Campaign goals must be
              objectively verifiable, and creators only receive funds when they prove they've
              achieved what they promised.
            </p>
            <p>
              The platform runs on Polygon and uses USDC for transactions. Escrowed funds generate
              yield through Aave V3, benefiting pledgers and vouchers while campaigns are active.
            </p>
          </div>
          <div class="about-facts">
            <h3>Key Facts</h3>
            <dl class="facts-list">
              <dt>Founded</dt>
              <dd>2024</dd>
              <dt>Headquarters</dt>
              <dd>Remote-first</dd>
              <dt>Blockchain</dt>
              <dd>Polygon (Ethereum L2)</dd>
              <dt>Currency</dt>
              <dd>USDC</dd>
              <dt>Verification</dt>
              <dd>Multi-AI Consensus</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent News -->
    <section class="news-section">
      <div class="container-app">
        <h2 class="section-title">Recent News</h2>
        <div class="news-grid">
          <div class="news-card news-card--placeholder">
            <Icon name="heroicons:newspaper" />
            <p>Press coverage coming soon.</p>
            <p class="news-card__note">
              Be the first to write about us! <a href="mailto:press@pledgebook.io">Get in touch</a>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="contact-section">
      <div class="container-app">
        <div class="contact-grid">
          <div class="contact-card">
            <h3>Media Inquiries</h3>
            <p>For interviews, comments, or story collaboration, contact our press team.</p>
            <a
              href="mailto:press@pledgebook.io"
              class="contact-link"
            >
              <Icon name="heroicons:envelope" />
              press@pledgebook.io
            </a>
          </div>
          <div class="contact-card">
            <h3>Speaking Requests</h3>
            <p>Interested in having our team speak at your event or podcast?</p>
            <a
              href="mailto:press@pledgebook.io?subject=Speaking%20Request"
              class="contact-link"
            >
              <Icon name="heroicons:microphone" />
              Request a Speaker
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Brand Guidelines Summary -->
    <section class="brand-section">
      <div class="container-app">
        <h2 class="section-title">Brand Guidelines</h2>
        <div class="brand-cards">
          <div class="brand-card">
            <h3>Name</h3>
            <p>
              Always write as <strong>Pledgebook</strong> (one word, capital P). Never "Pledge Book"
              or "pledge book".
            </p>
          </div>
          <div class="brand-card">
            <h3>Logo Usage</h3>
            <p>
              Maintain clear space around the logo equal to the height of the 'P'. Don't stretch,
              rotate, or alter colors.
            </p>
          </div>
          <div class="brand-card">
            <h3>Description</h3>
            <p>
              Short: "Verification-first crowdfunding on blockchain."<br />
              Long: "A decentralized platform where funds are only released when goals are
              verified."
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Press & Media | Pledgebook',
  description:
    'Press resources for Pledgebook: press kit, brand guidelines, company facts, and media contact information.',
})
</script>

<style scoped>
.press-page {
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
}

/* Press Kit Section */
.press-kit-section {
  padding: 4rem 0;
}

.press-kit-card {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
}

.press-kit-card__content {
  flex: 1;
}

.press-kit-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.press-kit-card > .press-kit-card__content > p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.press-kit-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.press-kit-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.375rem 0;
}

.press-kit-list .iconify {
  color: var(--color-primary);
}

.press-kit-card__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.press-kit-note {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

/* About Section */
.about-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.about-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.about-text p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.about-text p:last-child {
  margin-bottom: 0;
}

.about-boilerplate {
  font-size: 1.0625rem;
}

.about-facts {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.about-facts h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.facts-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}

.facts-list dt {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.facts-list dd {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  margin: 0;
}

/* News Section */
.news-section {
  padding: 4rem 0;
}

.news-grid {
  max-width: 600px;
  margin: 0 auto;
}

.news-card--placeholder {
  text-align: center;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 3rem;
}

.news-card--placeholder .iconify {
  font-size: 2.5rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.news-card--placeholder p {
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.news-card__note {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.news-card__note a {
  color: var(--color-primary);
  text-decoration: none;
}

.news-card__note a:hover {
  text-decoration: underline;
}

/* Contact Section */
.contact-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 700px;
  margin: 0 auto;
}

.contact-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.contact-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.contact-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

/* Brand Section */
.brand-section {
  padding: 4rem 0;
}

.brand-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.brand-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.brand-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.brand-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .press-kit-card {
    flex-direction: column;
  }

  .about-content {
    grid-template-columns: 1fr;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .brand-cards {
    grid-template-columns: 1fr;
  }
}
</style>
