<template>
  <div class="legal-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Terms of Service</h1>
          <p class="page-header__description">Last updated: {{ lastUpdated }}</p>
        </div>
      </div>
    </header>

    <main class="legal-content">
      <div class="container-app">
        <div class="legal-card">
          <section class="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Pledgebook ("Platform"), you agree to be bound by these Terms of
              Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.
            </p>
            <p>
              Pledgebook is a decentralized fundraising platform that uses blockchain technology,
              smart contracts, and AI-based verification. You acknowledge that you understand the
              risks associated with cryptocurrency and blockchain technology.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Eligibility</h2>
            <p>To use Pledgebook, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Have a compatible cryptocurrency wallet</li>
              <li>Have legal capacity to enter into binding agreements</li>
              <li>Not be prohibited by law from using cryptocurrency or blockchain services</li>
              <li>Not be located in a sanctioned jurisdiction</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Platform Services</h2>

            <h3>3.1 Campaign Creation</h3>
            <p>
              Users can create fundraising campaigns with verifiable goals. Campaigns must have
              clear, measurable outcomes that can be verified through available data sources. We
              reserve the right to reject or remove campaigns that violate our guidelines.
            </p>

            <h3>3.2 Pledging</h3>
            <p>
              Users can pledge USDC to campaigns. Pledged funds are held in smart contract escrow on
              the Polygon blockchain. Funds are released to the campaign creator only if the
              campaign goal is verified as achieved. Otherwise, funds are returned to pledgers.
            </p>

            <h3>3.3 Vouching</h3>
            <p>
              Users can vouch for campaigns by staking USDC. If the campaign succeeds, vouchers earn
              a portion of the yield generated. If the campaign fails, vouched funds may be slashed
              as a penalty for vouching for an unsuccessful campaign.
            </p>

            <h3>3.4 Disputes</h3>
            <p>
              Users can file disputes against campaigns they believe are fraudulent or have not met
              their stated goals. Dispute resolution is handled through our verification process and
              may involve human review.
            </p>

            <h3>3.5 AI Verification</h3>
            <p>
              Campaign outcomes are verified using multi-AI consensus (multiple independent AI
              providers). While we strive for accuracy, AI verification may not be perfect. The
              consensus threshold and verification methods are disclosed for each campaign.
            </p>
          </section>

          <section class="legal-section">
            <h2>4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information when creating campaigns</li>
              <li>Not create fraudulent, misleading, or deceptive campaigns</li>
              <li>Not use the Platform for illegal activities</li>
              <li>Maintain the security of your wallet and private keys</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not attempt to manipulate or exploit the verification system</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Fees</h2>
            <p>
              Pledgebook charges a platform fee on successful campaigns. The current fee structure
              is displayed during campaign creation. Additionally, blockchain network fees (gas
              fees) apply to all on-chain transactions and are paid by the user initiating the
              transaction.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Risks and Disclaimers</h2>

            <h3>6.1 Cryptocurrency Risks</h3>
            <p>
              You acknowledge that cryptocurrency values can be volatile. The value of USDC or other
              assets may fluctuate. We are not responsible for any losses due to market conditions.
            </p>

            <h3>6.2 Smart Contract Risks</h3>
            <p>
              While our smart contracts are audited, no software is completely free from bugs or
              vulnerabilities. You acknowledge the inherent risks of interacting with smart
              contracts.
            </p>

            <h3>6.3 Verification Limitations</h3>
            <p>
              AI-based verification, while advanced, may not be perfect. We do not guarantee 100%
              accuracy in outcome verification. Disputes may arise and will be handled according to
              our dispute resolution process.
            </p>

            <h3>6.4 No Financial Advice</h3>
            <p>
              Nothing on this Platform constitutes financial, investment, or legal advice. You
              should consult with appropriate professionals before making any financial decisions.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Intellectual Property</h2>
            <p>
              The Platform, its design, features, and content are owned by Pledgebook and protected
              by intellectual property laws. You retain ownership of content you submit but grant us
              a license to use it for Platform operations.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul>
              <li>Create campaigns for illegal purposes</li>
              <li>Engage in money laundering or terrorist financing</li>
              <li>Circumvent security measures or exploit vulnerabilities</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Spam, harass, or abuse other users</li>
              <li>Manipulate votes, reviews, or verification outcomes</li>
              <li>Use bots or automated tools without authorization</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Platform at any time for violation of
              these Terms or for any other reason at our discretion. Upon termination, you remain
              bound by provisions that by their nature should survive, including ownership,
              disclaimers, and limitations of liability.
            </p>
          </section>

          <section class="legal-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PLEDGEBOOK AND ITS AFFILIATES SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
              ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          <section class="legal-section">
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which Pledgebook operates, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section class="legal-section">
            <h2>12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be announced on the
              Platform. Your continued use after changes constitutes acceptance of the modified
              Terms.
            </p>
          </section>

          <section class="legal-section">
            <h2>13. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p>
              <strong>Email:</strong>
              <a href="mailto:legal@pledgebook.io">legal@pledgebook.io</a>
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
  title: 'Terms of Service | Pledgebook',
  description:
    'Read the Terms of Service for using Pledgebook, the decentralized fundraising platform with verifiable outcomes.',
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
