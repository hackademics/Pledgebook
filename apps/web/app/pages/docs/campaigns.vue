<template>
  <div class="docs-campaigns-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <NuxtLink
          to="/docs"
          class="back-link"
        >
          <Icon name="heroicons:arrow-left" />
          Back to Docs
        </NuxtLink>
        <h1 class="page-header__title">Campaign Creator Guide</h1>
        <p class="page-header__description">
          Everything you need to know about creating successful, verifiable campaigns.
        </p>
      </div>
    </header>

    <!-- Content -->
    <section class="docs-content">
      <div class="container-app">
        <div class="docs-layout">
          <!-- Sidebar -->
          <aside class="docs-sidebar">
            <nav>
              <h3>Contents</h3>
              <ul>
                <li><a href="#overview">Overview</a></li>
                <li><a href="#requirements">Requirements</a></li>
                <li><a href="#goals">Setting Goals</a></li>
                <li><a href="#evidence">Evidence Types</a></li>
                <li><a href="#funding">Funding Strategy</a></li>
                <li><a href="#timeline">Timeline</a></li>
                <li><a href="#updates">Progress Updates</a></li>
                <li><a href="#verification">Verification</a></li>
                <li><a href="#best-practices">Best Practices</a></li>
              </ul>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="docs-main">
            <section id="overview">
              <h2>Overview</h2>
              <p>
                Pledgebook campaigns are fundamentally different from traditional crowdfunding.
                Instead of receiving funds immediately, your pledged funds are held in escrow until
                you prove you've achieved your stated goal.
              </p>
              <p>
                This approach creates accountability and trust—pledgers know their money only goes
                to creators who deliver on their promises.
              </p>
              <div class="key-points">
                <div class="key-point">
                  <Icon name="heroicons:check-circle" />
                  <span>Goals must be objectively verifiable</span>
                </div>
                <div class="key-point">
                  <Icon name="heroicons:check-circle" />
                  <span>Funds are held in smart contract escrow</span>
                </div>
                <div class="key-point">
                  <Icon name="heroicons:check-circle" />
                  <span>AI consensus determines goal achievement</span>
                </div>
                <div class="key-point">
                  <Icon name="heroicons:check-circle" />
                  <span>5% fee only on successful campaigns</span>
                </div>
              </div>
            </section>

            <section id="requirements">
              <h2>Campaign Requirements</h2>
              <p>Before creating a campaign, ensure you meet these requirements:</p>
              <ul>
                <li><strong>Web3 wallet:</strong> You need a connected wallet (MetaMask, etc.)</li>
                <li><strong>Verifiable goal:</strong> Your goal must be objectively provable</li>
                <li><strong>Evidence plan:</strong> Know how you'll prove achievement</li>
                <li><strong>Realistic timeline:</strong> Set an achievable deadline</li>
              </ul>
              <div class="warning-box">
                <Icon name="heroicons:exclamation-triangle" />
                <p>
                  Campaigns with vague, subjective, or unverifiable goals will be rejected during
                  the AI validation phase.
                </p>
              </div>
            </section>

            <section id="goals">
              <h2>Setting Verifiable Goals</h2>
              <p>
                The key to a successful campaign is a goal that can be objectively verified. Ask
                yourself: "How would an independent observer confirm I achieved this?"
              </p>

              <h3>Good Goals (Verifiable)</h3>
              <div class="examples-grid">
                <div class="example example--good">
                  <Icon name="heroicons:check-circle" />
                  <div>
                    <strong>Complete a certified marathon in under 4 hours</strong>
                    <span>Verified via official race results with name and time</span>
                  </div>
                </div>
                <div class="example example--good">
                  <Icon name="heroicons:check-circle" />
                  <div>
                    <strong>Publish an open-source project with 500+ GitHub stars</strong>
                    <span>Verified via public GitHub repository statistics</span>
                  </div>
                </div>
                <div class="example example--good">
                  <Icon name="heroicons:check-circle" />
                  <div>
                    <strong>Pass the AWS Solutions Architect exam</strong>
                    <span>Verified via official certification credential</span>
                  </div>
                </div>
                <div class="example example--good">
                  <Icon name="heroicons:check-circle" />
                  <div>
                    <strong>Get accepted to a specific graduate program</strong>
                    <span>Verified via official admission letter</span>
                  </div>
                </div>
              </div>

              <h3>Bad Goals (Not Verifiable)</h3>
              <div class="examples-grid">
                <div class="example example--bad">
                  <Icon name="heroicons:x-circle" />
                  <div>
                    <strong>"Become a better person"</strong>
                    <span>Subjective, no objective measurement</span>
                  </div>
                </div>
                <div class="example example--bad">
                  <Icon name="heroicons:x-circle" />
                  <div>
                    <strong>"Help my community"</strong>
                    <span>Vague, no specific outcome defined</span>
                  </div>
                </div>
                <div class="example example--bad">
                  <Icon name="heroicons:x-circle" />
                  <div>
                    <strong>"Learn to code"</strong>
                    <span>No clear completion criteria</span>
                  </div>
                </div>
                <div class="example example--bad">
                  <Icon name="heroicons:x-circle" />
                  <div>
                    <strong>"Run more often"</strong>
                    <span>No specific target or measurement</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="evidence">
              <h2>Evidence Types</h2>
              <p>
                During campaign setup, you'll specify what evidence you'll provide. Common types:
              </p>
              <div class="evidence-grid">
                <div class="evidence-card">
                  <Icon name="heroicons:document-text" />
                  <h4>Official Documents</h4>
                  <p>Certificates, transcripts, letters, official race results</p>
                </div>
                <div class="evidence-card">
                  <Icon name="heroicons:globe-alt" />
                  <h4>Public URLs</h4>
                  <p>GitHub repos, published articles, public profiles</p>
                </div>
                <div class="evidence-card">
                  <Icon name="heroicons:photo" />
                  <h4>Timestamped Media</h4>
                  <p>Photos/videos with visible dates or metadata</p>
                </div>
                <div class="evidence-card">
                  <Icon name="heroicons:link" />
                  <h4>Third-Party APIs</h4>
                  <p>Fitness trackers, GitHub API, verified data sources</p>
                </div>
              </div>
            </section>

            <section id="funding">
              <h2>Funding Strategy</h2>
              <h3>Setting Your Funding Goal</h3>
              <ul>
                <li>Request what you actually need, plus the 5% platform fee</li>
                <li>Consider any tools, resources, or support costs</li>
                <li>Be transparent about how funds will be used</li>
              </ul>

              <h3>Minimum and Maximum Pledges</h3>
              <p>
                You can set optional minimum and maximum pledge amounts per pledger. This can help
                manage your pledger community.
              </p>

              <div class="info-box">
                <Icon name="heroicons:light-bulb" />
                <p>
                  <strong>Tip:</strong> Smaller funding goals are easier to hit and build
                  credibility. Start small with your first campaign.
                </p>
              </div>
            </section>

            <section id="timeline">
              <h2>Campaign Timeline</h2>
              <p>Your campaign has two key phases:</p>

              <div class="timeline-cards">
                <div class="timeline-card">
                  <div class="timeline-card__number">1</div>
                  <div class="timeline-card__content">
                    <h4>Funding Phase</h4>
                    <p>
                      The period when pledgers can contribute. Typically 7-30 days. Ends when
                      deadline passes or funding goal is reached.
                    </p>
                  </div>
                </div>
                <div class="timeline-card">
                  <div class="timeline-card__number">2</div>
                  <div class="timeline-card__content">
                    <h4>Execution Phase</h4>
                    <p>
                      The time you have to achieve your goal. Length depends on your goal—could be
                      weeks, months, or even a year.
                    </p>
                  </div>
                </div>
              </div>

              <div class="warning-box">
                <Icon name="heroicons:clock" />
                <p>
                  If you don't submit verification evidence by your deadline, the campaign fails and
                  funds are returned to pledgers.
                </p>
              </div>
            </section>

            <section id="updates">
              <h2>Progress Updates</h2>
              <p>
                Keep your pledgers engaged with regular progress updates. This builds trust and can
                attract new pledgers.
              </p>
              <ul>
                <li>Post updates at least monthly for long campaigns</li>
                <li>Share milestones, challenges, and learnings</li>
                <li>Include photos or evidence of progress when possible</li>
                <li>Respond to pledger comments and questions</li>
              </ul>
            </section>

            <section id="verification">
              <h2>Verification Process</h2>
              <p>When you're ready to claim success:</p>
              <ol>
                <li>Upload your evidence to the campaign page</li>
                <li>Evidence is stored permanently on IPFS</li>
                <li>Multiple AI models analyze your evidence</li>
                <li>Consensus is reached (success or failure)</li>
                <li>Results are recorded on-chain</li>
                <li>If successful, a dispute window opens</li>
                <li>After the window, funds are released (minus 5% fee)</li>
              </ol>
            </section>

            <section id="best-practices">
              <h2>Best Practices</h2>
              <div class="best-practices-grid">
                <div class="best-practice">
                  <Icon name="heroicons:check-badge" />
                  <h4>Be Specific</h4>
                  <p>Define exact metrics and outcomes, not vague aspirations.</p>
                </div>
                <div class="best-practice">
                  <Icon name="heroicons:document-check" />
                  <h4>Plan Evidence Early</h4>
                  <p>Know exactly how you'll prove achievement before starting.</p>
                </div>
                <div class="best-practice">
                  <Icon name="heroicons:chat-bubble-left-right" />
                  <h4>Communicate Often</h4>
                  <p>Regular updates build trust and keep pledgers engaged.</p>
                </div>
                <div class="best-practice">
                  <Icon name="heroicons:clock" />
                  <h4>Set Realistic Timelines</h4>
                  <p>Give yourself enough time, but not so much that urgency is lost.</p>
                </div>
                <div class="best-practice">
                  <Icon name="heroicons:shield-check" />
                  <h4>Be Honest</h4>
                  <p>Transparency about challenges builds more trust than silence.</p>
                </div>
                <div class="best-practice">
                  <Icon name="heroicons:rocket-launch" />
                  <h4>Start Small</h4>
                  <p>Your first campaign builds credibility for bigger ones.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <h2>Ready to Create Your Campaign?</h2>
          <p>Our AI-powered setup assistant will guide you through the process.</p>
          <NuxtLink
            to="/campaigns/create"
            class="btn btn-primary"
          >
            <Icon name="heroicons:plus" />
            Create Campaign
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Campaign Creator Guide | Pledgebook Documentation',
  description:
    'Complete guide for creating successful, verifiable campaigns on Pledgebook. Goals, evidence, funding, and best practices.',
})
</script>

<style scoped>
.docs-campaigns-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* Header */
.page-header {
  padding: 3rem 0;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 1rem;
}

.back-link:hover {
  color: var(--color-primary);
}

.page-header__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-header__description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Docs Layout */
.docs-content {
  padding: 2rem 0;
}

.docs-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
}

/* Sidebar */
.docs-sidebar {
  position: sticky;
  top: 2rem;
  align-self: start;
}

.docs-sidebar h3 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.docs-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.docs-sidebar li {
  margin-bottom: 0.25rem;
}

.docs-sidebar a {
  display: block;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.docs-sidebar a:hover {
  color: var(--color-primary);
}

/* Main Content */
.docs-main section {
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--border-primary);
}

.docs-main section:last-child {
  border-bottom: none;
}

.docs-main h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.docs-main h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5rem 0 0.75rem;
}

.docs-main h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1rem 0 0.5rem;
}

.docs-main p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.docs-main ul,
.docs-main ol {
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.docs-main li {
  margin-bottom: 0.5rem;
}

.docs-main strong {
  color: var(--text-primary);
}

/* Key Points */
.key-points {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
}

.key-point {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.key-point .iconify {
  color: var(--color-green);
  flex-shrink: 0;
}

/* Info/Warning Boxes */
.info-box,
.warning-box {
  display: flex;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

.info-box {
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
}

.info-box .iconify {
  color: var(--color-primary);
}

.warning-box {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
}

.warning-box .iconify {
  color: var(--color-warning);
}

.info-box .iconify,
.warning-box .iconify {
  flex-shrink: 0;
  font-size: 1.25rem;
}

.info-box p,
.warning-box p {
  margin: 0;
  font-size: 0.875rem;
}

/* Examples Grid */
.examples-grid {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0;
}

.example {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
}

.example--good {
  background-color: var(--color-green-light);
}

.example--bad {
  background-color: #fee2e2;
}

.example .iconify {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.example--good .iconify {
  color: var(--color-green);
}

.example--bad .iconify {
  color: #dc2626;
}

.example strong {
  display: block;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

.example span {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Evidence Grid */
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.evidence-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
}

.evidence-card .iconify {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.evidence-card h4 {
  margin: 0 0 0.25rem;
}

.evidence-card p {
  font-size: 0.8125rem;
  margin: 0;
}

/* Timeline Cards */
.timeline-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.timeline-card {
  display: flex;
  gap: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
}

.timeline-card__number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.timeline-card__content h4 {
  margin: 0 0 0.25rem;
}

.timeline-card__content p {
  font-size: 0.875rem;
  margin: 0;
}

/* Best Practices Grid */
.best-practices-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.best-practice {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
}

.best-practice .iconify {
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.best-practice h4 {
  margin: 0 0 0.25rem;
}

.best-practice p {
  font-size: 0.8125rem;
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: 3rem 0;
  background-color: var(--bg-primary);
}

.cta-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.cta-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.cta-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: static;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-primary);
  }

  .docs-sidebar ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .docs-sidebar li {
    margin: 0;
  }

  .key-points,
  .evidence-grid,
  .best-practices-grid {
    grid-template-columns: 1fr;
  }
}
</style>
