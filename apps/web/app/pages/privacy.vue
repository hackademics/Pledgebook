<template>
  <div class="legal-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Privacy Policy</h1>
          <p class="page-header__description">Last updated: {{ lastUpdated }}</p>
        </div>
      </div>
    </header>

    <main class="legal-content">
      <div class="container-app">
        <div class="legal-card">
          <section class="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Pledgebook ("we," "our," or "us"). We are committed to protecting your
              privacy and ensuring the security of your personal information. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use
              our decentralized fundraising platform.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Information We Collect</h2>

            <h3>2.1 Wallet Information</h3>
            <p>
              When you connect your cryptocurrency wallet to Pledgebook, we collect your public
              wallet address. We use Sign-In with Ethereum (SIWE) for authentication, which does not
              require sharing private keys.
            </p>

            <h3>2.2 Campaign Data</h3>
            <p>
              When you create or participate in campaigns, we collect information you provide,
              including:
            </p>
            <ul>
              <li>Campaign titles, descriptions, and goals</li>
              <li>Evidence and verification data (stored on IPFS)</li>
              <li>Transaction records and pledge amounts</li>
            </ul>

            <h3>2.3 Automatically Collected Information</h3>
            <p>We automatically collect certain information when you access our platform:</p>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and settings</li>
              <li>Usage patterns and interaction data</li>
              <li>Cloudflare analytics data</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide, maintain, and improve our platform</li>
              <li>Process transactions and pledges</li>
              <li>Verify campaign outcomes using AI consensus</li>
              <li>Communicate with you about your campaigns and pledges</li>
              <li>Detect and prevent fraud, abuse, or security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Data Storage and Security</h2>

            <h3>4.1 Blockchain Data</h3>
            <p>
              Transaction data, smart contract interactions, and pledge information are stored on
              the Polygon blockchain. This data is public, immutable, and cannot be deleted.
            </p>

            <h3>4.2 Off-Chain Data</h3>
            <p>
              Off-chain data is stored using Cloudflare D1 (SQLite), R2 (object storage), and IPFS
              for decentralized file storage. We implement industry-standard security measures to
              protect this data.
            </p>

            <h3>4.3 Privacy-Preserving Verification</h3>
            <p>
              We use DECO (Decentralized Oracle) and Zero-Knowledge Proofs to verify private data
              without exposing the underlying values. This allows verification of outcomes while
              maintaining your privacy.
            </p>
          </section>

          <section class="legal-section">
            <h2>5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Cloudflare:</strong> Hosting, CDN, and security</li>
              <li><strong>Pinata/IPFS:</strong> Decentralized file storage</li>
              <li><strong>Polygon:</strong> Blockchain network for transactions</li>
              <li><strong>Aave:</strong> DeFi yield generation for escrowed funds</li>
              <li>
                <strong>AI Providers:</strong> Anthropic, OpenAI, and Google for consensus
                verification
              </li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of off-chain data (blockchain data cannot be deleted)</li>
              <li>Object to processing of your information</li>
              <li>Data portability</li>
            </ul>
            <p>
              To exercise these rights, please contact us at
              <a href="mailto:privacy@pledgebook.io">privacy@pledgebook.io</a>.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Cookies and Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. See our
              <NuxtLink to="/cookies">Cookie Policy</NuxtLink> for more details.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Pledgebook is not intended for users under 18 years of age. We do not knowingly
              collect information from children.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the "Last
              updated" date.
            </p>
          </section>

          <section class="legal-section">
            <h2>10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
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
  title: 'Privacy Policy | Pledgebook',
  description:
    'Learn how Pledgebook collects, uses, and protects your personal information on our decentralized fundraising platform.',
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
}
</style>
