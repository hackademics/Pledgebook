<template>
  <div class="help-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Help Center</h1>
          <p class="page-header__description">
            Find answers to common questions and learn how to get the most out of Pledgebook.
          </p>
          <div class="search-box">
            <Icon name="heroicons:magnifying-glass" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for help..."
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Quick Links -->
    <section class="quick-links-section">
      <div class="container-app">
        <div class="quick-links-grid">
          <NuxtLink
            to="#getting-started"
            class="quick-link-card"
          >
            <Icon name="heroicons:rocket-launch" />
            <span>Getting Started</span>
          </NuxtLink>
          <NuxtLink
            to="#campaigns"
            class="quick-link-card"
          >
            <Icon name="heroicons:megaphone" />
            <span>Campaigns</span>
          </NuxtLink>
          <NuxtLink
            to="#pledging"
            class="quick-link-card"
          >
            <Icon name="heroicons:heart" />
            <span>Pledging</span>
          </NuxtLink>
          <NuxtLink
            to="#wallet"
            class="quick-link-card"
          >
            <Icon name="heroicons:wallet" />
            <span>Wallet & Web3</span>
          </NuxtLink>
          <NuxtLink
            to="#verification"
            class="quick-link-card"
          >
            <Icon name="heroicons:check-badge" />
            <span>Verification</span>
          </NuxtLink>
          <NuxtLink
            to="#disputes"
            class="quick-link-card"
          >
            <Icon name="heroicons:exclamation-triangle" />
            <span>Disputes</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ Sections -->
    <section class="faq-section">
      <div class="container-app">
        <!-- Getting Started -->
        <div
          id="getting-started"
          class="faq-category"
        >
          <h2>
            <Icon name="heroicons:rocket-launch" />
            Getting Started
          </h2>

          <div class="faq-list">
            <details
              v-for="faq in filteredFaqs.gettingStarted"
              :key="faq.question"
              class="faq-item"
            >
              <summary>{{ faq.question }}</summary>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="faq.answer"></div>
            </details>
          </div>
        </div>

        <!-- Campaigns -->
        <div
          id="campaigns"
          class="faq-category"
        >
          <h2>
            <Icon name="heroicons:megaphone" />
            Creating Campaigns
          </h2>

          <div class="faq-list">
            <details
              v-for="faq in filteredFaqs.campaigns"
              :key="faq.question"
              class="faq-item"
            >
              <summary>{{ faq.question }}</summary>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="faq.answer"></div>
            </details>
          </div>
        </div>

        <!-- Pledging -->
        <div
          id="pledging"
          class="faq-category"
        >
          <h2>
            <Icon name="heroicons:heart" />
            Pledging & Vouching
          </h2>

          <div class="faq-list">
            <details
              v-for="faq in filteredFaqs.pledging"
              :key="faq.question"
              class="faq-item"
            >
              <summary>{{ faq.question }}</summary>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="faq.answer"></div>
            </details>
          </div>
        </div>

        <!-- Wallet -->
        <div
          id="wallet"
          class="faq-category"
        >
          <h2>
            <Icon name="heroicons:wallet" />
            Wallet & Web3
          </h2>

          <div class="faq-list">
            <details
              v-for="faq in filteredFaqs.wallet"
              :key="faq.question"
              class="faq-item"
            >
              <summary>{{ faq.question }}</summary>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="faq.answer"></div>
            </details>
          </div>
        </div>

        <!-- Verification -->
        <div
          id="verification"
          class="faq-category"
        >
          <h2>
            <Icon name="heroicons:check-badge" />
            Verification & Consensus
          </h2>

          <div class="faq-list">
            <details
              v-for="faq in filteredFaqs.verification"
              :key="faq.question"
              class="faq-item"
            >
              <summary>{{ faq.question }}</summary>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="faq.answer"></div>
            </details>
          </div>
        </div>

        <!-- Disputes -->
        <div
          id="disputes"
          class="faq-category"
        >
          <h2>
            <Icon name="heroicons:exclamation-triangle" />
            Disputes & Refunds
          </h2>

          <div class="faq-list">
            <details
              v-for="faq in filteredFaqs.disputes"
              :key="faq.question"
              class="faq-item"
            >
              <summary>{{ faq.question }}</summary>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="faq.answer"></div>
            </details>
          </div>
        </div>

        <!-- No Results -->
        <div
          v-if="hasNoResults"
          class="no-results"
        >
          <Icon name="heroicons:magnifying-glass" />
          <h3>No results found</h3>
          <p>
            Try different keywords or <NuxtLink to="/contact">contact our support team</NuxtLink>.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="contact-section">
      <div class="container-app">
        <div class="contact-card">
          <div class="contact-card__content">
            <h2>Still need help?</h2>
            <p>Can't find what you're looking for? Our support team is ready to assist you.</p>
          </div>
          <NuxtLink
            to="/contact"
            class="btn btn-primary"
          >
            <Icon name="heroicons:envelope" />
            Contact Support
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Help Center | Pledgebook',
  description:
    'Get answers to frequently asked questions about campaigns, pledging, verification, and more on Pledgebook.',
})

const searchQuery = ref('')

const faqs = {
  gettingStarted: [
    {
      question: 'What is Pledgebook?',
      answer: `<p>Pledgebook is a decentralized, verification-first crowdfunding platform. Unlike traditional platforms, 
        funds are held in a smart contract escrow and only released when creators achieve their stated goals, 
        as verified by multi-AI consensus.</p>`,
    },
    {
      question: 'How is Pledgebook different from Kickstarter or GoFundMe?',
      answer: `<p>Key differences:</p>
        <ul>
          <li><strong>Verification-first:</strong> Goals must be verifiable before campaigns are approved</li>
          <li><strong>Escrow:</strong> Funds are held in smart contracts, not by the platform</li>
          <li><strong>AI Consensus:</strong> Multiple AI models verify goal achievement</li>
          <li><strong>Automatic refunds:</strong> If goals aren't met, pledgers get refunds automatically</li>
          <li><strong>On-chain transparency:</strong> All transactions are public and auditable</li>
        </ul>`,
    },
    {
      question: 'Do I need cryptocurrency to use Pledgebook?',
      answer: `<p>Yes. Pledgebook runs on the Polygon blockchain and uses USDC (a dollar-pegged stablecoin) for 
        pledges. You'll need a Web3 wallet like MetaMask and some MATIC for gas fees (typically less than $0.10 per transaction).</p>`,
    },
    {
      question: 'Which blockchain does Pledgebook use?',
      answer: `<p>Pledgebook runs on <strong>Polygon</strong> (formerly Matic), an Ethereum Layer 2 network. 
        Polygon offers low gas fees and fast transactions while maintaining Ethereum's security.</p>`,
    },
  ],
  campaigns: [
    {
      question: 'What kind of campaigns can I create?',
      answer: `<p>Campaigns must have <strong>objectively verifiable goals</strong>. Good examples:</p>
        <ul>
          <li>Run a marathon in under 4 hours (tracked by official race timing)</li>
          <li>Launch an open-source project on GitHub with 1,000 stars</li>
          <li>Get accepted into a specific university program</li>
          <li>Complete a certification exam</li>
        </ul>
        <p>Goals like "become a better person" or "make the world happier" are <strong>not</strong> verifiable and won't be approved.</p>`,
    },
    {
      question: 'What is the AI-powered setup assistant?',
      answer: `<p>When creating a campaign, our AI assistant helps you:</p>
        <ul>
          <li>Formulate clear, verifiable goals</li>
          <li>Identify what evidence you'll need to prove achievement</li>
          <li>Set realistic funding targets and timelines</li>
          <li>Improve your campaign description</li>
        </ul>`,
    },
    {
      question: 'What is baseline capture?',
      answer: `<p>Before your campaign goes live, we capture a "baseline" - documented proof of your current state. 
        For example, if your goal is to run a marathon in under 4 hours, we might capture your current best time. 
        This makes verification more reliable.</p>`,
    },
    {
      question: 'What are the platform fees?',
      answer: `<p>Pledgebook charges a <strong>5% fee on successful campaigns only</strong>. If your campaign fails 
        or doesn't reach its goal, you pay nothing. There are no upfront costs to create a campaign.</p>`,
    },
    {
      question: 'How long can a campaign run?',
      answer: `<p>Campaign deadlines depend on your goal. You'll set a deadline during campaign creation. 
        Most campaigns run between 30 days and 1 year. The AI assistant will help you choose an appropriate timeline.</p>`,
    },
  ],
  pledging: [
    {
      question: 'How do I pledge to a campaign?',
      answer: `<p>To pledge:</p>
        <ol>
          <li>Connect your Web3 wallet (MetaMask, WalletConnect, etc.)</li>
          <li>Ensure you have USDC on Polygon</li>
          <li>Navigate to the campaign page</li>
          <li>Click "Pledge" and enter the amount</li>
          <li>Approve the transaction in your wallet</li>
        </ol>`,
    },
    {
      question: 'What is the difference between pledging and vouching?',
      answer: `<p><strong>Pledging:</strong> You contribute funds to support a campaign. If successful, funds go to creator. 
        If failed, you get a full refund.</p>
        <p><strong>Vouching:</strong> You stake your own funds on a campaign's success. If successful, you earn a share of 
        the yield generated. If failed, your stake may be slashed (you lose part of it).</p>`,
    },
    {
      question: 'What happens to my pledge while the campaign is active?',
      answer: `<p>Your pledge is held in a smart contract escrow and deposited into Aave V3 to generate yield. 
        Your principal is always protected - if the campaign fails, you get your full pledge back plus any yield earned.</p>`,
    },
    {
      question: 'Can I cancel my pledge?',
      answer: `<p>Pledges cannot be cancelled while a campaign is active. However, if the campaign fails verification 
        or the creator abandons it, your funds are automatically refunded.</p>`,
    },
  ],
  wallet: [
    {
      question: 'Which wallets are supported?',
      answer: `<p>Pledgebook supports any wallet compatible with WalletConnect, including:</p>
        <ul>
          <li>MetaMask</li>
          <li>Rainbow</li>
          <li>Coinbase Wallet</li>
          <li>Trust Wallet</li>
          <li>And many more</li>
        </ul>`,
    },
    {
      question: 'How do I add Polygon to my wallet?',
      answer: `<p>Most wallets auto-detect Polygon. If not:</p>
        <ul>
          <li><strong>Network Name:</strong> Polygon Mainnet</li>
          <li><strong>RPC URL:</strong> https://polygon-rpc.com</li>
          <li><strong>Chain ID:</strong> 137</li>
          <li><strong>Currency:</strong> MATIC</li>
          <li><strong>Explorer:</strong> https://polygonscan.com</li>
        </ul>`,
    },
    {
      question: 'Where can I get USDC on Polygon?',
      answer: `<p>You can get USDC on Polygon by:</p>
        <ul>
          <li>Bridging from Ethereum using the <a href="https://wallet.polygon.technology" target="_blank">Polygon Bridge</a></li>
          <li>Buying directly on exchanges that support Polygon (Coinbase, Kraken, etc.)</li>
          <li>Swapping other tokens on decentralized exchanges (Uniswap, QuickSwap)</li>
        </ul>`,
    },
    {
      question: 'What are gas fees?',
      answer: `<p>Gas fees are small payments to the blockchain network for processing transactions. 
        On Polygon, fees are typically $0.01-0.10 per transaction, paid in MATIC.</p>`,
    },
  ],
  verification: [
    {
      question: 'How does AI verification work?',
      answer: `<p>When a creator submits evidence of goal completion:</p>
        <ol>
          <li>Multiple AI models (Claude, GPT-4, Gemini) independently analyze the evidence</li>
          <li>Each AI provides a confidence score</li>
          <li>A consensus is reached based on majority agreement</li>
          <li>Results are recorded on-chain for transparency</li>
        </ol>`,
    },
    {
      question: 'What counts as valid evidence?',
      answer: `<p>Valid evidence varies by goal type but generally includes:</p>
        <ul>
          <li>Official certificates or transcripts</li>
          <li>Screenshots with visible timestamps and URLs</li>
          <li>Third-party verification (race results, GitHub stats, etc.)</li>
          <li>Timestamped photos/videos</li>
        </ul>
        <p>Evidence requirements are defined during campaign creation.</p>`,
    },
    {
      question: 'Can verification be disputed?',
      answer: `<p>Yes. After verification, there's a dispute window where pledgers can challenge the result 
        if they believe the evidence is invalid. Disputes are reviewed by the platform team.</p>`,
    },
    {
      question: 'What happens if AI verification is inconclusive?',
      answer: `<p>If AI models cannot reach consensus, the case may be escalated to manual review 
        or the creator may be asked to provide additional evidence.</p>`,
    },
  ],
  disputes: [
    {
      question: 'How do I file a dispute?',
      answer: `<p>To file a dispute:</p>
        <ol>
          <li>Navigate to the campaign page</li>
          <li>Click "File Dispute" (available during dispute window)</li>
          <li>Explain why you believe verification was incorrect</li>
          <li>Provide any supporting evidence</li>
          <li>Submit for review</li>
        </ol>`,
    },
    {
      question: 'What happens during a dispute?',
      answer: `<p>During a dispute:</p>
        <ul>
          <li>Fund distribution is paused</li>
          <li>Our team reviews the original evidence and dispute claim</li>
          <li>Both parties may be contacted for additional information</li>
          <li>A final decision is made within 7-14 days</li>
        </ul>`,
    },
    {
      question: 'When do I get a refund?',
      answer: `<p>Automatic refunds occur when:</p>
        <ul>
          <li>A campaign fails AI verification</li>
          <li>The deadline passes without goal completion</li>
          <li>The creator abandons the campaign</li>
          <li>A dispute is resolved in favor of pledgers</li>
        </ul>
        <p>Refunds are processed automatically by the smart contract.</p>`,
    },
    {
      question: 'How long do refunds take?',
      answer: `<p>Refunds are near-instant once triggered by the smart contract. You'll receive your 
        original pledge plus any yield earned during the escrow period.</p>`,
    },
  ],
}

function matchesSearch(text: string): boolean {
  if (!searchQuery.value.trim()) return true
  return text.toLowerCase().includes(searchQuery.value.toLowerCase())
}

const filteredFaqs = computed(() => {
  const filter = (items: typeof faqs.gettingStarted) =>
    items.filter((faq) => matchesSearch(faq.question) || matchesSearch(faq.answer))

  return {
    gettingStarted: filter(faqs.gettingStarted),
    campaigns: filter(faqs.campaigns),
    pledging: filter(faqs.pledging),
    wallet: filter(faqs.wallet),
    verification: filter(faqs.verification),
    disputes: filter(faqs.disputes),
  }
})

const hasNoResults = computed(() => {
  const values = filteredFaqs.value
  return (
    values.gettingStarted.length === 0 &&
    values.campaigns.length === 0 &&
    values.pledging.length === 0 &&
    values.wallet.length === 0 &&
    values.verification.length === 0 &&
    values.disputes.length === 0
  )
})
</script>

<style scoped>
.help-page {
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
  margin-bottom: 1.5rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.search-box .iconify {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

/* Quick Links */
.quick-links-section {
  padding: 2rem 0;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.quick-links-grid {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-link-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.quick-link-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.quick-link-card .iconify {
  color: var(--color-primary);
}

/* FAQ Section */
.faq-section {
  padding: 3rem 0;
}

.faq-category {
  max-width: 800px;
  margin: 0 auto 3rem;
}

.faq-category h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-primary);
}

.faq-category h2 .iconify {
  color: var(--color-primary);
}

.faq-list {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid var(--border-secondary);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item summary {
  padding: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.faq-item summary:hover {
  background-color: var(--bg-secondary);
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::after {
  content: '+';
  font-size: 1.25rem;
  color: var(--text-tertiary);
}

.faq-item[open] summary::after {
  content: '−';
}

.faq-item div {
  padding: 0 1.25rem 1.25rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.faq-item :deep(p) {
  margin: 0 0 1rem;
}

.faq-item :deep(p:last-child) {
  margin-bottom: 0;
}

.faq-item :deep(ul),
.faq-item :deep(ol) {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
}

.faq-item :deep(li) {
  margin-bottom: 0.5rem;
}

.faq-item :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

.faq-item :deep(a:hover) {
  text-decoration: underline;
}

.faq-item :deep(strong) {
  color: var(--text-primary);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 3rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  max-width: 400px;
  margin: 0 auto;
}

.no-results .iconify {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-results p {
  color: var(--text-secondary);
  margin: 0;
}

.no-results a {
  color: var(--color-primary);
  text-decoration: none;
}

.no-results a:hover {
  text-decoration: underline;
}

/* Contact Section */
.contact-section {
  padding: 3rem 0;
  background-color: var(--bg-primary);
}

.contact-card {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 2rem;
}

.contact-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.contact-card p {
  color: var(--text-secondary);
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

  .quick-links-grid {
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }

  .contact-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
