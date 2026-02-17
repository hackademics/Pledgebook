<template>
  <div class="contact-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Contact Us</h1>
          <p class="page-header__description">
            Have questions, feedback, or need help? We'd love to hear from you.
          </p>
        </div>
      </div>
    </header>

    <!-- Contact Options -->
    <section class="contact-section">
      <div class="container-app">
        <div class="contact-grid">
          <!-- Support -->
          <div class="contact-card">
            <div class="contact-card__icon contact-card__icon--support">
              <Icon name="heroicons:lifebuoy" />
            </div>
            <h2>Support</h2>
            <p>
              Need help with your campaign, pledge, or account? Our support team is here to help.
            </p>
            <a
              href="mailto:support@pledgebook.io"
              class="contact-card__link"
            >
              <Icon name="heroicons:envelope" />
              support@pledgebook.io
            </a>
            <p class="contact-card__note">Response time: 24-48 hours</p>
          </div>

          <!-- Partnerships -->
          <div class="contact-card">
            <div class="contact-card__icon contact-card__icon--partnerships">
              <Icon name="heroicons:building-office-2" />
            </div>
            <h2>Partnerships</h2>
            <p>Interested in integrating with Pledgebook or exploring strategic partnerships?</p>
            <a
              href="mailto:partnerships@pledgebook.io"
              class="contact-card__link"
            >
              <Icon name="heroicons:envelope" />
              partnerships@pledgebook.io
            </a>
            <p class="contact-card__note">For business inquiries only</p>
          </div>

          <!-- Press -->
          <div class="contact-card">
            <div class="contact-card__icon contact-card__icon--press">
              <Icon name="heroicons:newspaper" />
            </div>
            <h2>Press & Media</h2>
            <p>Media inquiries, interview requests, or need our press kit and brand assets?</p>
            <a
              href="mailto:press@pledgebook.io"
              class="contact-card__link"
            >
              <Icon name="heroicons:envelope" />
              press@pledgebook.io
            </a>
            <NuxtLink
              to="/press"
              class="contact-card__secondary-link"
            >
              View Press Kit →
            </NuxtLink>
          </div>

          <!-- Security -->
          <div class="contact-card">
            <div class="contact-card__icon contact-card__icon--security">
              <Icon name="heroicons:shield-check" />
            </div>
            <h2>Security</h2>
            <p>
              Found a vulnerability? Report it responsibly through our security disclosure program.
            </p>
            <a
              href="mailto:security@pledgebook.io"
              class="contact-card__link"
            >
              <Icon name="heroicons:envelope" />
              security@pledgebook.io
            </a>
            <p class="contact-card__note">PGP key available on request</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Community -->
    <section class="community-section">
      <div class="container-app">
        <h2 class="section-title">Join Our Community</h2>
        <p class="section-subtitle">
          Connect with creators, pledgers, and the Pledgebook team on our social channels.
        </p>

        <div class="social-grid">
          <a
            href="https://twitter.com/pledgebook"
            target="_blank"
            rel="noopener noreferrer"
            class="social-card"
          >
            <Icon name="simple-icons:x" />
            <span>X (Twitter)</span>
          </a>
          <a
            href="https://discord.gg/pledgebook"
            target="_blank"
            rel="noopener noreferrer"
            class="social-card"
          >
            <Icon name="simple-icons:discord" />
            <span>Discord</span>
          </a>
          <a
            href="https://github.com/pledgebook"
            target="_blank"
            rel="noopener noreferrer"
            class="social-card"
          >
            <Icon name="simple-icons:github" />
            <span>GitHub</span>
          </a>
          <a
            href="https://t.me/pledgebook"
            target="_blank"
            rel="noopener noreferrer"
            class="social-card"
          >
            <Icon name="simple-icons:telegram" />
            <span>Telegram</span>
          </a>
        </div>
      </div>
    </section>

    <!-- FAQ CTA -->
    <section class="faq-cta-section">
      <div class="container-app">
        <div class="faq-cta-card">
          <Icon name="heroicons:question-mark-circle" />
          <div class="faq-cta-content">
            <h3>Looking for quick answers?</h3>
            <p>Check out our Help Center for FAQs and step-by-step guides.</p>
          </div>
          <NuxtLink
            to="/help"
            class="btn btn-primary"
          >
            Visit Help Center
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Office Info -->
    <section class="info-section">
      <div class="container-app">
        <div class="info-grid">
          <div class="info-card">
            <h3>Registered Address</h3>
            <p>
              Pledgebook Foundation<br />
              123 Blockchain Lane<br />
              Web3 City, WC 12345<br />
              United States
            </p>
          </div>
          <div class="info-card">
            <h3>Legal</h3>
            <p>
              For legal inquiries, subpoenas, or formal correspondence, please send to our
              registered address or email
              <a href="mailto:legal@pledgebook.io">legal@pledgebook.io</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contact Us | Pledgebook',
  description:
    'Get in touch with the Pledgebook team. Support, partnerships, press inquiries, and security disclosures.',
})
</script>

<style scoped>
.contact-page {
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

/* Contact Section */
.contact-section {
  padding: 4rem 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.contact-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
}

.contact-card__icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.contact-card__icon--support {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.contact-card__icon--partnerships {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
}

.contact-card__icon--press {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

.contact-card__icon--security {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.contact-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.contact-card p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.contact-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.contact-card__link:hover {
  opacity: 0.8;
}

.contact-card__note {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0.5rem 0 0;
}

.contact-card__secondary-link {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-card__secondary-link:hover {
  color: var(--color-primary);
}

/* Community Section */
.community-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
  text-align: center;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.social-grid {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.social-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.social-card .iconify {
  font-size: 1.25rem;
}

/* FAQ CTA Section */
.faq-cta-section {
  padding: 4rem 0;
}

.faq-cta-card {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
}

.faq-cta-card > .iconify {
  font-size: 2.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.faq-cta-content {
  flex: 1;
}

.faq-cta-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.faq-cta-content p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Info Section */
.info-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 700px;
  margin: 0 auto;
}

.info-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.info-card p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.info-card a {
  color: var(--color-primary);
  text-decoration: none;
}

.info-card a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .faq-cta-card {
    flex-direction: column;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
