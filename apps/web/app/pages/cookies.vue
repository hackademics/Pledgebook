<template>
  <div class="legal-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Cookie Policy</h1>
          <p class="page-header__description">Last updated: {{ lastUpdated }}</p>
        </div>
      </div>
    </header>

    <main class="legal-content">
      <div class="container-app">
        <div class="legal-card">
          <section class="legal-section">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help
              websites remember your preferences, understand how you use the site, and provide a
              better user experience.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. How We Use Cookies</h2>
            <p>
              Pledgebook uses cookies for essential functionality and to improve your experience. We
              do not use cookies for advertising or tracking across other websites.
            </p>
          </section>

          <section class="legal-section">
            <h2>3. Types of Cookies We Use</h2>

            <h3>3.1 Essential Cookies</h3>
            <p>
              These cookies are necessary for the Platform to function and cannot be disabled. They
              include:
            </p>
            <div class="cookie-table-wrapper">
              <table class="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>siwe_token</code></td>
                    <td>Authentication session (Sign-In with Ethereum)</td>
                    <td>7 days</td>
                  </tr>
                  <tr>
                    <td><code>color_mode</code></td>
                    <td>Theme preference (light/dark mode)</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td><code>__cf_bm</code></td>
                    <td>Cloudflare bot protection</td>
                    <td>30 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.2 Functionality Cookies</h3>
            <p>These cookies remember your preferences and choices to provide enhanced features:</p>
            <div class="cookie-table-wrapper">
              <table class="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>locale</code></td>
                    <td>Language preference</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td><code>campaign_draft</code></td>
                    <td>Auto-save campaign creation progress</td>
                    <td>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3.3 Analytics Cookies</h3>
            <p>
              We use privacy-focused analytics to understand how users interact with the Platform:
            </p>
            <div class="cookie-table-wrapper">
              <table class="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>cf_analytics</code></td>
                    <td>Cloudflare Web Analytics (privacy-preserving)</td>
                    <td>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="legal-section">
            <h2>4. Local Storage</h2>
            <p>In addition to cookies, we use browser local storage for:</p>
            <ul>
              <li>Caching campaign data for faster loading</li>
              <li>Storing draft campaign content</li>
              <li>Remembering UI preferences</li>
              <li>Wallet connection state</li>
            </ul>
            <p>Local storage data remains on your device until you clear your browser data.</p>
          </section>

          <section class="legal-section">
            <h2>5. Third-Party Cookies</h2>
            <p>Our Platform may include limited third-party services that set their own cookies:</p>
            <ul>
              <li><strong>Cloudflare:</strong> Security, performance, and analytics</li>
              <li><strong>Turnstile:</strong> Bot protection (challenge cookies)</li>
            </ul>
            <p>We do not use third-party advertising cookies or social media tracking pixels.</p>
          </section>

          <section class="legal-section">
            <h2>6. Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Note that disabling essential
              cookies may prevent you from using certain features of the Platform.
            </p>
            <p>Common browser cookie settings:</p>
            <ul>
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Chrome</a
                >
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Firefox</a
                >
              </li>
              <li>
                <a
                  href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Safari</a
                >
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Edge</a
                >
              </li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>7. Do Not Track</h2>
            <p>
              We respect Do Not Track (DNT) browser signals. When DNT is enabled, we minimize data
              collection to only what is essential for Platform functionality.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted on this
              page with an updated "Last updated" date.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Contact Us</h2>
            <p>If you have questions about our use of cookies, please contact us at:</p>
            <p>
              <strong>Email:</strong>
              <a href="mailto:privacy@pledgebook.io">privacy@pledgebook.io</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = 'February 5, 2026'

useSeoMeta({
  title: 'Cookie Policy | Pledgebook',
  description:
    'Learn about how Pledgebook uses cookies and similar technologies to provide and improve our decentralized fundraising platform.',
})
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  padding: 4rem 0 2rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.page-header__content {
  max-width: 800px;
}

.page-header__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header__description {
  font-size: 1rem;
  color: var(--text-secondary);
}

.legal-content {
  padding: 2rem 0 4rem;
}

.legal-card {
  max-width: 800px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
}

.legal-section {
  margin-bottom: 2rem;
}

.legal-section:last-child {
  margin-bottom: 0;
}

.legal-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.legal-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5rem 0 0.75rem;
}

.legal-section p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.legal-section ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.legal-section li {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

.legal-section a {
  color: var(--color-primary);
  text-decoration: underline;
}

.legal-section a:hover {
  color: var(--color-primary-hover);
}

.cookie-table-wrapper {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.cookie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.cookie-table th,
.cookie-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid var(--border-primary);
}

.cookie-table th {
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.cookie-table td {
  color: var(--text-secondary);
}

.cookie-table code {
  background-color: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0 1.5rem;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .legal-card {
    padding: 1.5rem;
  }

  .legal-section h2 {
    font-size: 1.25rem;
  }

  .cookie-table {
    font-size: 0.75rem;
  }

  .cookie-table th,
  .cookie-table td {
    padding: 0.5rem;
  }
}
</style>
