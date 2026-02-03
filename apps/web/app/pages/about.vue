<template>
  <div class="about-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__badge">
            <span class="page-header__badge-dot"></span>
            Incentivized Fundraising • Results First
          </div>
          <h1 class="page-header__title">How Pledgebook Turns Promises Into Proof</h1>
          <p class="page-header__description">
            A verifiable fundraising platform where funds are released only when outcomes are
            achieved. Smart contracts escrow USDC, AI consensus verifies results, and privacy is
            protected with DECO + ZKPs.
          </p>
          <div class="page-header__actions">
            <NuxtLink
              to="/campaigns/create"
              class="btn btn-primary"
            >
              <Icon name="heroicons:plus" />
              Start a Campaign
            </NuxtLink>
            <NuxtLink
              to="/campaigns"
              class="btn btn-secondary"
            >
              <Icon name="heroicons:globe-alt" />
              Explore Campaigns
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Key Features Grid -->
    <section class="features-section">
      <div class="container-app">
        <div class="features-grid">
          <article class="feature-card feature-card--verification">
            <div class="feature-card__icon">
              <Icon name="heroicons:shield-check" />
            </div>
            <div class="feature-card__content">
              <h3 class="feature-card__title">Multi-AI Consensus</h3>
              <p class="feature-card__subtitle">Claude • Grok • Gemini</p>
              <p class="feature-card__description">
                Three independent AI providers vote on outcomes. ≥66% agreement required for
                verification.
              </p>
            </div>
          </article>
          <article class="feature-card feature-card--funds">
            <div class="feature-card__icon">
              <Icon name="heroicons:banknotes" />
            </div>
            <div class="feature-card__content">
              <h3 class="feature-card__title">USDC + Aave Yield</h3>
              <p class="feature-card__subtitle">Escrowed, interest-bearing</p>
              <p class="feature-card__description">
                Funds deposited to Aave V3 earn passive yield while awaiting campaign resolution.
              </p>
            </div>
          </article>
          <article class="feature-card feature-card--privacy">
            <div class="feature-card__icon">
              <Icon name="heroicons:lock-closed" />
            </div>
            <div class="feature-card__content">
              <h3 class="feature-card__title">DECO + ZK Proofs</h3>
              <p class="feature-card__subtitle">Prove outcomes without exposure</p>
              <p class="feature-card__description">
                Zero-knowledge cryptography verifies private data without revealing actual values.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- What is Pledgebook Section -->
    <section class="intro-section">
      <div class="container-app">
        <div class="intro-card">
          <h2 class="intro-card__title">What is Pledgebook?</h2>
          <p class="intro-card__description">
            Pledgebook is a revolutionary fundraising platform that fundamentally changes how
            donations work. Instead of giving money based on <strong>promises</strong> of future
            results, donors pledge funds that are only released when
            <strong>verifiable goals are achieved</strong>.
          </p>
          <div class="intro-pillars">
            <div class="intro-pillar intro-pillar--result">
              <div class="intro-pillar__icon">
                <Icon name="heroicons:check-badge" />
              </div>
              <h3 class="intro-pillar__title">Result-Based</h3>
              <p class="intro-pillar__description">
                Funds are released only when goals are proven complete
              </p>
            </div>
            <div class="intro-pillar intro-pillar--trustless">
              <div class="intro-pillar__icon">
                <Icon name="heroicons:shield-check" />
              </div>
              <h3 class="intro-pillar__title">Trustless</h3>
              <p class="intro-pillar__description">
                AI and blockchain verify outcomes — no blind trust required
              </p>
            </div>
            <div class="intro-pillar intro-pillar--yield">
              <div class="intro-pillar__icon">
                <Icon name="heroicons:currency-dollar" />
              </div>
              <h3 class="intro-pillar__title">Yield-Generating</h3>
              <p class="intro-pillar__description">
                Escrowed funds earn interest while awaiting verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- At a Glance Summary -->
    <section class="glance-section">
      <div class="container-app">
        <div class="glance-card">
          <h2 class="glance-card__title">At a Glance: The 6-Step Lifecycle</h2>
          <div class="glance-steps">
            <div class="glance-step">
              <span class="glance-step__number">1</span>
              <div class="glance-step__content">
                <h4>Create</h4>
                <p>Define a SMART goal with verifiable data sources</p>
              </div>
            </div>
            <div class="glance-step">
              <span class="glance-step__number">2</span>
              <div class="glance-step__content">
                <h4>Validate</h4>
                <p>AI analyzes for clarity, fraud risk, and measurability</p>
              </div>
            </div>
            <div class="glance-step">
              <span class="glance-step__number">3</span>
              <div class="glance-step__content">
                <h4>Baseline</h4>
                <p>CRE captures immutable "before" snapshot with proofs</p>
              </div>
            </div>
            <div class="glance-step">
              <span class="glance-step__number">4</span>
              <div class="glance-step__content">
                <h4>Participate</h4>
                <p>Pledge, Vouch, or Dispute with aligned incentives</p>
              </div>
            </div>
            <div class="glance-step">
              <span class="glance-step__number">5</span>
              <div class="glance-step__content">
                <h4>Evaluate</h4>
                <p>Multi-AI consensus votes TRUE/FALSE at deadline</p>
              </div>
            </div>
            <div class="glance-step">
              <span class="glance-step__number">6</span>
              <div class="glance-step__content">
                <h4>Resolve</h4>
                <p>Smart contracts auto-release or refund funds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Tabbed Content -->
    <section class="tabs-section">
      <div class="container-app">
        <UTabs
          :items="tabItems"
          class="tabs-container"
        >
          <!-- How It Works Tab -->
          <template #how-it-works>
            <div class="tab-content">
              <h3 class="tab-content__title">The Pledgebook Lifecycle</h3>

              <!-- Timeline -->
              <div class="timeline">
                <!-- Step 1: Create -->
                <div class="timeline-item">
                  <div class="timeline-item__marker">1</div>
                  <div class="timeline-item__card">
                    <h4 class="timeline-item__title">
                      <span class="text-accent">Create</span> — Define Your Campaign
                    </h4>
                    <p class="timeline-item__description">
                      Campaign creators define <strong>SMART goals</strong> (Specific, Measurable,
                      Achievable, Relevant, Time-bound) with clear verification criteria. Our AI
                      assistant helps refine vague goals into verifiable objectives.
                    </p>
                    <div class="timeline-item__example">
                      <p class="timeline-item__example-label">Example Goals:</p>
                      <ul class="timeline-item__example-list">
                        <li
                          class="timeline-item__example-item timeline-item__example-item--success"
                        >
                          <Icon name="heroicons:check-circle" />
                          "Lose 20 lbs by May 1, 2026 — verified via Fitbit API"
                        </li>
                        <li
                          class="timeline-item__example-item timeline-item__example-item--success"
                        >
                          <Icon name="heroicons:check-circle" />
                          "Increase test scores by 15% — verified via school transcript"
                        </li>
                        <li
                          class="timeline-item__example-item timeline-item__example-item--success"
                        >
                          <Icon name="heroicons:check-circle" />
                          "Reduce district crime by 10% — verified via FBI UCR data"
                        </li>
                        <li class="timeline-item__example-item timeline-item__example-item--error">
                          <Icon name="heroicons:x-circle" />
                          "Make the world a better place" — too vague, rejected
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Validate -->
                <div class="timeline-item">
                  <div class="timeline-item__marker">2</div>
                  <div class="timeline-item__card">
                    <h4 class="timeline-item__title">
                      <span class="text-accent">Validate</span> — AI Reviews &amp; Approves
                    </h4>
                    <p class="timeline-item__description">
                      The <strong>ValidationWorkflow</strong> runs via Chainlink CRE. Multiple AI
                      providers (Claude, Grok, Gemini) analyze your campaign for fraud, policy
                      compliance, and verifiability.
                    </p>
                    <div class="timeline-item__grid">
                      <div class="timeline-item__grid-card timeline-item__grid-card--success">
                        <p class="timeline-item__grid-label">
                          <Icon name="heroicons:check" />
                          What AI Checks
                        </p>
                        <ul class="timeline-item__grid-list">
                          <li>SMART criteria compliance</li>
                          <li>Fraud detection signals</li>
                          <li>Data source availability</li>
                          <li>Policy violations</li>
                        </ul>
                      </div>
                      <div class="timeline-item__grid-card timeline-item__grid-card--info">
                        <p class="timeline-item__grid-label">
                          <Icon name="heroicons:lock-closed" />
                          Creator Bond
                        </p>
                        <p class="timeline-item__grid-text">
                          Creators stake a bond (min $10 USDC) as proof of legitimacy. This bond is
                          forfeited if the campaign fails or is fraudulent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Baseline -->
                <div class="timeline-item">
                  <div class="timeline-item__marker">3</div>
                  <div class="timeline-item__card">
                    <h4 class="timeline-item__title">
                      <span class="text-accent">Baseline</span> — Capture Starting State
                    </h4>
                    <p class="timeline-item__description">
                      The <strong>BaselineWorkflow</strong> captures an immutable "before" snapshot.
                      For private data, <strong>DECO</strong> technology creates zero-knowledge
                      proofs that verify values without exposing them.
                    </p>
                    <div class="timeline-item__example">
                      <p class="timeline-item__example-text">
                        <strong>Example:</strong> For a weight loss campaign, the system proves
                        "starting weight = X" without revealing the actual number. Only the hash
                        (keccak256) is stored on-chain with the ZKP proof.
                      </p>
                    </div>
                    <div class="timeline-item__code">
                      <code
                        >Storage: { baselineHash: '0x...', proofType: 'DECO_ZKP', zkProof: '...'
                        }</code
                      >
                    </div>
                  </div>
                </div>

                <!-- Step 4: Participate -->
                <div class="timeline-item">
                  <div class="timeline-item__marker">4</div>
                  <div class="timeline-item__card">
                    <h4 class="timeline-item__title">
                      <span class="text-accent">Participate</span> — Pledge, Vouch, or Dispute
                    </h4>
                    <p class="timeline-item__description">
                      Three ways to participate in campaigns, each with aligned economic incentives:
                    </p>
                    <div class="timeline-item__actors">
                      <div class="actor-card actor-card--pledger">
                        <div class="actor-card__icon">
                          <Icon name="heroicons:banknotes" />
                        </div>
                        <h5 class="actor-card__title">Pledgers</h5>
                        <p class="actor-card__description">
                          Donate USDC to support goals. Funds are escrowed in
                          <code>PledgeEscrow.sol</code> and deposited to Aave V3 for yield. Released
                          on success; refunded + yield on failure.
                        </p>
                      </div>
                      <div class="actor-card actor-card--voucher">
                        <div class="actor-card__icon">
                          <Icon name="heroicons:hand-raised" />
                        </div>
                        <h5 class="actor-card__title">Vouchers</h5>
                        <p class="actor-card__description">
                          Stake funds to endorse legitimacy via <code>vouch()</code>. Earn yield
                          bonus on success; 50% slashed (VOUCHER_SLASH_BPS = 5000) if campaign is
                          fraudulent.
                        </p>
                      </div>
                      <div class="actor-card actor-card--disputer">
                        <div class="actor-card__icon">
                          <Icon name="heroicons:exclamation-triangle" />
                        </div>
                        <h5 class="actor-card__title">Disputers</h5>
                        <p class="actor-card__description">
                          Challenge suspected fraud via <code>dispute()</code>. Earn forfeited bonds
                          if fraud confirmed; 50% slashed if dispute is frivolous.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 5: Evaluate -->
                <div class="timeline-item">
                  <div class="timeline-item__marker">5</div>
                  <div class="timeline-item__card">
                    <h4 class="timeline-item__title">
                      <span class="text-accent">Evaluate</span> — AI Consensus Verification
                    </h4>
                    <p class="timeline-item__description">
                      At the campaign end date, the <strong>EvaluationWorkflow</strong> triggers via
                      Chainlink CRE's time-based trigger. Multiple AI models independently evaluate
                      evidence and vote TRUE/FALSE.
                    </p>
                    <div class="consensus-demo">
                      <div class="consensus-demo__header">
                        <span class="consensus-demo__label">Consensus Threshold</span>
                        <span class="consensus-demo__value">≥ 66% Agreement (BFT)</span>
                      </div>
                      <div class="consensus-demo__providers">
                        <div class="consensus-demo__provider consensus-demo__provider--claude">
                          <span class="consensus-demo__provider-name">Claude</span>
                          <Icon name="heroicons:cpu-chip" />
                        </div>
                        <div class="consensus-demo__provider consensus-demo__provider--grok">
                          <span class="consensus-demo__provider-name">Grok</span>
                          <Icon name="heroicons:cpu-chip" />
                        </div>
                        <div class="consensus-demo__provider consensus-demo__provider--gemini">
                          <span class="consensus-demo__provider-name">Gemini</span>
                          <Icon name="heroicons:cpu-chip" />
                        </div>
                      </div>
                      <p class="consensus-demo__note">
                        Each AI independently evaluates and returns:
                        <code
                          >{ result: boolean, reasoning: string, sourcesCited: array,
                          integrityCheck: boolean }</code
                        >
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Step 6: Release/Refund -->
                <div class="timeline-item timeline-item--final">
                  <div class="timeline-item__marker timeline-item__marker--success">6</div>
                  <div class="timeline-item__card">
                    <h4 class="timeline-item__title">
                      <span class="text-success">Release</span> or
                      <span class="text-danger">Refund</span>
                    </h4>
                    <p class="timeline-item__description">
                      CRE calls <code>verifyAndRelease(success, promptHash)</code> on the smart
                      contract. Funds are automatically distributed based on the verified outcome:
                    </p>
                    <div class="timeline-item__outcomes">
                      <div class="outcome-card outcome-card--success">
                        <h5 class="outcome-card__title">
                          <Icon name="heroicons:check-circle" />
                          On Success
                        </h5>
                        <ul class="outcome-card__list">
                          <li>Creator receives pledged funds + bond + yield share</li>
                          <li>Vouchers receive stake + pro-rata yield bonus</li>
                          <li>Disputers forfeit their stakes</li>
                          <li>1% platform fee (TREASURY_FEE) to treasury</li>
                        </ul>
                      </div>
                      <div class="outcome-card outcome-card--failure">
                        <h5 class="outcome-card__title">
                          <Icon name="heroicons:x-circle" />
                          On Failure
                        </h5>
                        <ul class="outcome-card__list">
                          <li>Pledgers receive full refund + pro-rata yield</li>
                          <li>Creator bond forfeited to treasury/disputers</li>
                          <li>Vouchers slashed 50% (VOUCHER_SLASH_BPS)</li>
                          <li>Disputers receive stake + share of forfeitures</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Technology Tab -->
          <template #technology>
            <div class="tab-content">
              <h3 class="tab-content__title">Technology Stack</h3>

              <div class="tech-grid">
                <!-- Blockchain Layer -->
                <article class="tech-card">
                  <div class="tech-card__header">
                    <div class="tech-card__icon tech-card__icon--blockchain">
                      <Icon name="heroicons:cube-transparent" />
                    </div>
                    <h4 class="tech-card__title">Blockchain Layer</h4>
                  </div>
                  <div class="tech-card__content">
                    <div class="tech-item">
                      <h5 class="tech-item__title">Polygon Network</h5>
                      <p class="tech-item__description">
                        Low-cost, high-speed transactions on Ethereum's leading Layer 2 solution.
                        All funds managed by audited smart contracts.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">Smart Contracts</h5>
                      <p class="tech-item__description">
                        <code>CampaignFactory.sol</code> deploys per-campaign
                        <code>PledgeEscrow.sol</code> contracts. Factory pattern enables scalable
                        campaign creation with isolated fund management.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">USDC Stablecoin</h5>
                      <p class="tech-item__description">
                        All pledges denominated in USDC (bridged USDC.e) for stability. No exposure
                        to crypto volatility — $100 pledge stays ~$100.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">Aave V3 Integration</h5>
                      <p class="tech-item__description">
                        Escrowed funds auto-deposited to Aave Polygon V3 pool. Yield tracked via
                        aToken balance: <code>yield = aToken.balanceOf(this) - totalPrincipal</code>
                      </p>
                    </div>
                  </div>
                </article>

                <!-- Oracle & Verification -->
                <article class="tech-card">
                  <div class="tech-card__header">
                    <div class="tech-card__icon tech-card__icon--oracle">
                      <Icon name="heroicons:link" />
                    </div>
                    <h4 class="tech-card__title">Oracle &amp; Verification</h4>
                  </div>
                  <div class="tech-card__content">
                    <div class="tech-item">
                      <h5 class="tech-item__title">Chainlink CRE</h5>
                      <p class="tech-item__description">
                        Chainlink Runtime Environment orchestrates verification. WASM runtime for
                        secure off-chain compute, parallel API/AI calls, BFT aggregation.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">BFT Consensus</h5>
                      <p class="tech-item__description">
                        Byzantine Fault Tolerant consensus with ≥66% threshold (<code
                          >consensusThreshold: 0.66</code
                        >). Aggregates results via <code>consensusMedianAggregation</code>.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">Three-Workflow System</h5>
                      <div class="tech-item__workflow">
                        <span class="workflow-step">ValidationWorkflow</span>
                        <Icon name="heroicons:arrow-right" />
                        <span class="workflow-step">BaselineWorkflow</span>
                        <Icon name="heroicons:arrow-right" />
                        <span class="workflow-step">EvaluationWorkflow</span>
                      </div>
                    </div>
                  </div>
                </article>

                <!-- Privacy Technology -->
                <article class="tech-card">
                  <div class="tech-card__header">
                    <div class="tech-card__icon tech-card__icon--privacy">
                      <Icon name="heroicons:lock-closed" />
                    </div>
                    <h4 class="tech-card__title">Privacy Technology</h4>
                  </div>
                  <div class="tech-card__content">
                    <div class="tech-item">
                      <h5 class="tech-item__title">DECO (Decentralized Oracle)</h5>
                      <p class="tech-item__description">
                        Privacy-preserving API fetches via TLS. Proves data from private sources
                        (Fitbit, bank statements, transcripts) without exposing values.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">Zero-Knowledge Proofs</h5>
                      <p class="tech-item__description">
                        Circom circuits generate Groth16 proofs. Verify statements like "weight
                        decreased by ≥20 lbs" without revealing actual values.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">ZKP Circuit Catalog</h5>
                      <div class="tech-item__circuits">
                        <code>delta_increase_gte</code>
                        <code>delta_decrease_gte</code>
                        <code>ratio_increase_gte</code>
                        <code>within_range</code>
                      </div>
                      <p class="tech-item__description">
                        Each proof bound to <code>campaignIdHash + promptHash</code> to prevent
                        replay.
                      </p>
                    </div>
                  </div>
                </article>

                <!-- AI System -->
                <article class="tech-card">
                  <div class="tech-card__header">
                    <div class="tech-card__icon tech-card__icon--ai">
                      <Icon name="heroicons:cpu-chip" />
                    </div>
                    <h4 class="tech-card__title">AI System</h4>
                  </div>
                  <div class="tech-card__content">
                    <div class="tech-item">
                      <h5 class="tech-item__title">Multi-Provider Consensus</h5>
                      <p class="tech-item__description">
                        Three independent AI providers vote on outcomes. No single AI can manipulate
                        results; parallel <code>ComputeStep</code> calls in CRE.
                      </p>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">AI Providers</h5>
                      <div class="tech-item__providers">
                        <span class="provider-badge provider-badge--claude">Anthropic Claude</span>
                        <span class="provider-badge provider-badge--grok">Grok</span>
                        <span class="provider-badge provider-badge--gemini">Google Gemini</span>
                      </div>
                    </div>
                    <div class="tech-item">
                      <h5 class="tech-item__title">Immutable Prompts</h5>
                      <p class="tech-item__description">
                        All prompts hashed (keccak256) and stored on-chain + IPFS. Anyone can verify
                        exact criteria. CRE logs all executions with input hashes.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </template>

          <!-- Use Cases Tab -->
          <template #use-cases>
            <div class="tab-content">
              <h3 class="tab-content__title">Use Cases</h3>

              <div class="use-cases-list">
                <!-- Political Campaigns -->
                <article class="use-case-card use-case-card--political">
                  <div class="use-case-card__icon">
                    <Icon name="heroicons:building-library" />
                  </div>
                  <div class="use-case-card__content">
                    <h4 class="use-case-card__title">Political Campaign Promises</h4>
                    <p class="use-case-card__description">
                      Hold politicians accountable to their campaign promises. Donors pledge funds
                      that are only released when promised policies are enacted or measurable
                      outcomes are achieved.
                    </p>
                    <div class="use-case-card__example">
                      <h5>Example Campaign</h5>
                      <p>
                        <strong>Goal:</strong> "Reduce district crime rate by 15% by December 2026"
                      </p>
                      <p>
                        <strong>Data Source:</strong> FBI Uniform Crime Reporting (UCR) public API
                      </p>
                      <p>
                        <strong>Verification:</strong> AI compares baseline crime statistics to
                        end-date data, calculates percentage change, votes TRUE/FALSE.
                      </p>
                    </div>
                    <div class="use-case-card__tags">
                      <span class="use-case-tag">Crime Reduction</span>
                      <span class="use-case-tag">Job Creation</span>
                      <span class="use-case-tag">Infrastructure</span>
                      <span class="use-case-tag">Policy Enactment</span>
                    </div>
                  </div>
                </article>

                <!-- Educational Achievement -->
                <article class="use-case-card use-case-card--education">
                  <div class="use-case-card__icon">
                    <Icon name="heroicons:academic-cap" />
                  </div>
                  <div class="use-case-card__content">
                    <h4 class="use-case-card__title">Educational Improvement &amp; Achievement</h4>
                    <p class="use-case-card__description">
                      Support students, teachers, and schools with outcome-based funding.
                      Scholarships released upon graduation, grade improvements verified through
                      transcripts.
                    </p>
                    <div class="use-case-card__example">
                      <h5>Example Campaign</h5>
                      <p><strong>Goal:</strong> "Raise GPA from 2.5 to 3.5 by end of semester"</p>
                      <p><strong>Data Source:</strong> School transcript API (private, via DECO)</p>
                      <p>
                        <strong>Privacy:</strong> ZKP proves "GPA increased by ≥1.0" without
                        revealing actual grades. Student privacy fully protected.
                      </p>
                    </div>
                    <div class="use-case-card__tags">
                      <span class="use-case-tag">GPA Improvement</span>
                      <span class="use-case-tag">Graduation</span>
                      <span class="use-case-tag">Test Scores</span>
                      <span class="use-case-tag">Attendance</span>
                    </div>
                  </div>
                </article>

                <!-- Personal Physical Accomplishments -->
                <article class="use-case-card use-case-card--fitness">
                  <div class="use-case-card__icon">
                    <Icon name="heroicons:heart" />
                  </div>
                  <div class="use-case-card__content">
                    <h4 class="use-case-card__title">Personal Physical Accomplishments</h4>
                    <p class="use-case-card__description">
                      Get community support for fitness goals, marathons, weight loss, or athletic
                      achievements. Verified through wearables, apps, and photo evidence.
                    </p>
                    <div class="use-case-card__example">
                      <h5>Example Campaign</h5>
                      <p><strong>Goal:</strong> "Run 500 miles tracked by Strava by end date"</p>
                      <p><strong>Data Sources:</strong> Strava GPS data (public profile)</p>
                      <p>
                        <strong>Verification:</strong> CRE fetches total mileage via HttpStep, AI
                        validates cumulative distance against the target.
                      </p>
                    </div>
                    <div class="use-case-card__tags">
                      <span class="use-case-tag">Weight Loss</span>
                      <span class="use-case-tag">Endurance Goals</span>
                      <span class="use-case-tag">Strava Tracking</span>
                      <span class="use-case-tag">Fitness Milestones</span>
                    </div>
                  </div>
                </article>

                <!-- Sustainability & Impact -->
                <article class="use-case-card use-case-card--sustainability">
                  <div class="use-case-card__icon">
                    <Icon name="heroicons:globe-americas" />
                  </div>
                  <div class="use-case-card__content">
                    <h4 class="use-case-card__title">Sustainability &amp; Impact</h4>
                    <p class="use-case-card__description">
                      Fund verified environmental outcomes with trusted NGO receipts and public
                      audit trails.
                    </p>
                    <div class="use-case-card__example">
                      <h5>Example Campaign</h5>
                      <p>
                        <strong>Goal:</strong> "Plant 100 trees verified by Ecosia or OneTreePlanted
                        receipt"
                      </p>
                      <p><strong>Data Sources:</strong> Verified NGO receipt + public report URL</p>
                      <p>
                        <strong>Verification:</strong> AI validates receipt authenticity and count,
                        cross-referencing public posting via image OCR.
                      </p>
                    </div>
                    <div class="use-case-card__tags">
                      <span class="use-case-tag">Tree Planting</span>
                      <span class="use-case-tag">Carbon Impact</span>
                      <span class="use-case-tag">NGO Receipts</span>
                    </div>
                  </div>
                </article>

                <!-- Open Source & Productivity -->
                <article class="use-case-card use-case-card--tech">
                  <div class="use-case-card__icon">
                    <Icon name="heroicons:code-bracket" />
                  </div>
                  <div class="use-case-card__content">
                    <h4 class="use-case-card__title">Open Source &amp; Productivity</h4>
                    <p class="use-case-card__description">
                      Reward measurable public contributions to open-source and personal learning
                      goals.
                    </p>
                    <div class="use-case-card__example">
                      <h5>Example Campaigns</h5>
                      <ul>
                        <li>
                          <strong>Goal:</strong> "Complete 100 GitHub commits on open-source repo by
                          end date"
                        </li>
                        <li>
                          <strong>Verification:</strong> GitHub API commit count on public repo
                        </li>
                        <li>
                          <strong>Goal:</strong> "Read 12 books and post reviews on Goodreads"
                        </li>
                        <li>
                          <strong>Verification:</strong> Goodreads public review links + count
                        </li>
                      </ul>
                    </div>
                    <div class="use-case-card__tags">
                      <span class="use-case-tag">GitHub Commits</span>
                      <span class="use-case-tag">Goodreads Reviews</span>
                      <span class="use-case-tag">Public APIs</span>
                    </div>
                  </div>
                </article>

                <!-- Personal Energy Goals -->
                <article class="use-case-card use-case-card--energy">
                  <div class="use-case-card__icon">
                    <Icon name="heroicons:bolt" />
                  </div>
                  <div class="use-case-card__content">
                    <h4 class="use-case-card__title">Personal Energy Goals</h4>
                    <p class="use-case-card__description">
                      Incentivize household sustainability improvements with verifiable utility
                      data.
                    </p>
                    <div class="use-case-card__example">
                      <h5>Example Campaign</h5>
                      <p><strong>Goal:</strong> "Reduce monthly electricity usage by 20%"</p>
                      <p><strong>Data Sources:</strong> Utility bill PDFs (DECO + ZKP proof)</p>
                      <p>
                        <strong>Verification:</strong> ZKP proves month-over-month reduction meets
                        target using <code>ratio_increase_gte</code> circuit.
                      </p>
                    </div>
                    <div class="use-case-card__tags">
                      <span class="use-case-tag">Energy Reduction</span>
                      <span class="use-case-tag">Utility Proofs</span>
                      <span class="use-case-tag">ZK Privacy</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </template>

          <!-- Rules & Goals Tab -->
          <template #rules-goals>
            <div class="tab-content">
              <h3 class="tab-content__title">Rules &amp; Goals: The SMART Framework</h3>

              <p class="tab-content__intro">
                Pledgebook enforces strict goal standards to ensure every campaign is objectively
                verifiable. Vague or unmeasurable goals are automatically rejected by the
                <strong>ValidationWorkflow</strong>. This protects both donors and creators.
              </p>

              <!-- SMART Criteria -->
              <div class="smart-grid">
                <div class="smart-card smart-card--specific">
                  <div class="smart-card__letter">S</div>
                  <h4 class="smart-card__title">Specific</h4>
                  <p class="smart-card__description">Clear, well-defined objective</p>
                </div>
                <div class="smart-card smart-card--measurable">
                  <div class="smart-card__letter">M</div>
                  <h4 class="smart-card__title">Measurable</h4>
                  <p class="smart-card__description">Quantifiable success criteria</p>
                </div>
                <div class="smart-card smart-card--achievable">
                  <div class="smart-card__letter">A</div>
                  <h4 class="smart-card__title">Achievable</h4>
                  <p class="smart-card__description">Realistic given timeframe</p>
                </div>
                <div class="smart-card smart-card--relevant">
                  <div class="smart-card__letter">R</div>
                  <h4 class="smart-card__title">Relevant</h4>
                  <p class="smart-card__description">Meaningful to stakeholders</p>
                </div>
                <div class="smart-card smart-card--timebound">
                  <div class="smart-card__letter">T</div>
                  <h4 class="smart-card__title">Time-bound</h4>
                  <p class="smart-card__description">Clear start and end dates</p>
                </div>
              </div>

              <!-- Goal Examples -->
              <h4 class="section-subtitle">Goal Quality Examples</h4>
              <div class="goal-examples">
                <div class="goal-example goal-example--success">
                  <Icon name="heroicons:check-circle" />
                  <div class="goal-example__content">
                    <p class="goal-example__goal">
                      "Lose 20 pounds by May 1, 2026 — verified via weekly Fitbit weigh-ins"
                    </p>
                    <p class="goal-example__reason">
                      <strong>Why it works:</strong> Specific amount, clear date, verifiable data
                      source, realistic timeline.
                    </p>
                  </div>
                </div>
                <div class="goal-example goal-example--success">
                  <Icon name="heroicons:check-circle" />
                  <div class="goal-example__content">
                    <p class="goal-example__goal">
                      "Reduce city homelessness by 25% by end of 2026 — verified via HUD census
                      data"
                    </p>
                    <p class="goal-example__reason">
                      <strong>Why it works:</strong> Quantifiable metric, public data source,
                      relevant to community.
                    </p>
                  </div>
                </div>
                <div class="goal-example goal-example--error">
                  <Icon name="heroicons:x-circle" />
                  <div class="goal-example__content">
                    <p class="goal-example__goal">"Make the world a better place"</p>
                    <p class="goal-example__reason">
                      <strong>Why it fails:</strong> Vague, unmeasurable, no timeframe, no data
                      source. Auto-rejected.
                    </p>
                  </div>
                </div>
                <div class="goal-example goal-example--error">
                  <Icon name="heroicons:x-circle" />
                  <div class="goal-example__content">
                    <p class="goal-example__goal">"Get healthier"</p>
                    <p class="goal-example__reason">
                      <strong>Why it fails:</strong> No specific metric. AI suggests: "Lower blood
                      pressure to 120/80" or "Run 5K under 30 minutes."
                    </p>
                  </div>
                </div>
              </div>

              <!-- Verification Sources -->
              <h4 class="section-subtitle">Supported Verification Sources</h4>
              <div class="sources-grid">
                <div class="source-card">
                  <div class="source-card__icon">
                    <Icon name="heroicons:globe-alt" />
                  </div>
                  <h5 class="source-card__title">Public APIs</h5>
                  <p class="source-card__description">
                    Government data, weather, stock prices, sports statistics, public records
                  </p>
                </div>
                <div class="source-card">
                  <div class="source-card__icon">
                    <Icon name="heroicons:lock-closed" />
                  </div>
                  <h5 class="source-card__title">Private APIs (DECO)</h5>
                  <p class="source-card__description">
                    Fitbit, health apps, bank statements, school transcripts — privacy-preserved
                  </p>
                </div>
                <div class="source-card">
                  <div class="source-card__icon">
                    <Icon name="heroicons:camera" />
                  </div>
                  <h5 class="source-card__title">Image/OCR</h5>
                  <p class="source-card__description">
                    Scale photos, certificates, race bibs, documents — AI vision analysis
                  </p>
                </div>
                <div class="source-card">
                  <div class="source-card__icon">
                    <Icon name="heroicons:document-text" />
                  </div>
                  <h5 class="source-card__title">Documents</h5>
                  <p class="source-card__description">
                    PDF reports, official letters, contracts — uploaded to IPFS
                  </p>
                </div>
                <div class="source-card">
                  <div class="source-card__icon">
                    <Icon name="heroicons:link" />
                  </div>
                  <h5 class="source-card__title">Web URLs</h5>
                  <p class="source-card__description">
                    News articles, registry entries, public announcements
                  </p>
                </div>
                <div class="source-card">
                  <div class="source-card__icon">
                    <Icon name="heroicons:map-pin" />
                  </div>
                  <h5 class="source-card__title">GPS/Location</h5>
                  <p class="source-card__description">
                    Strava, running apps, location check-ins for physical challenges
                  </p>
                </div>
              </div>

              <!-- Prompt Types -->
              <h4 class="section-subtitle">CRE Prompt Types (Immutably Hashed)</h4>
              <p class="section-description">
                Pledgebook uses three immutable prompt types in CRE workflows. Each is stored on
                IPFS and hashed on-chain (keccak256) to prevent tampering.
              </p>
              <div class="prompts-grid">
                <div class="prompt-card">
                  <h5 class="prompt-card__title">Validation Prompt</h5>
                  <p class="prompt-card__description">
                    Ensures goals are SMART and verifiable. Rejects vague or unverifiable claims.
                  </p>
                  <div class="prompt-card__output">
                    <code>Output: { accepted, reasons, suggestions, refinedPrompt }</code>
                  </div>
                </div>
                <div class="prompt-card">
                  <h5 class="prompt-card__title">Baseline Prompt</h5>
                  <p class="prompt-card__description">
                    Captures the "before" state from sources. Generates ZKP proofs if privacy mode
                    enabled.
                  </p>
                  <div class="prompt-card__output">
                    <code>Output: { baselineValue, valueHash, zkProof?, valid, reasoning }</code>
                  </div>
                </div>
                <div class="prompt-card">
                  <h5 class="prompt-card__title">Evaluation Prompt</h5>
                  <p class="prompt-card__description">
                    Compares baseline to current evidence and returns TRUE/FALSE with reasoning.
                  </p>
                  <div class="prompt-card__output">
                    <code>Output: { result, reasoning, sourcesCited, integrityCheck }</code>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Fraud Prevention Tab -->
          <template #fraud-prevention>
            <div class="tab-content">
              <h3 class="tab-content__title">Fraud Prevention &amp; Trust Mechanisms</h3>

              <p class="tab-content__intro">
                Pledgebook uses economic incentives and cryptographic verification to make fraud
                <strong>economically irrational</strong> and
                <strong>technically detectable</strong>.
              </p>

              <div class="fraud-grid">
                <!-- Creator Bonds -->
                <article class="fraud-card">
                  <div class="fraud-card__header">
                    <div class="fraud-card__icon fraud-card__icon--bond">
                      <Icon name="heroicons:lock-closed" />
                    </div>
                    <h4 class="fraud-card__title">Creator Bonds</h4>
                  </div>
                  <p class="fraud-card__description">
                    Every creator stakes minimum $10 USDC (<code>MIN_BOND = 10e6</code>) as proof of
                    legitimacy:
                  </p>
                  <ul class="fraud-card__list">
                    <li class="fraud-card__item fraud-card__item--success">
                      <Icon name="heroicons:check" />
                      Returned + yield on successful campaign completion
                    </li>
                    <li class="fraud-card__item fraud-card__item--error">
                      <Icon name="heroicons:x-mark" />
                      Forfeited to treasury if campaign fails or is fraudulent
                    </li>
                    <li class="fraud-card__item fraud-card__item--warning">
                      <Icon name="heroicons:arrow-right" />
                      Distributed to disputers if fraud is proven
                    </li>
                  </ul>
                </article>

                <!-- Voucher System -->
                <article class="fraud-card">
                  <div class="fraud-card__header">
                    <div class="fraud-card__icon fraud-card__icon--vouch">
                      <Icon name="heroicons:hand-raised" />
                    </div>
                    <h4 class="fraud-card__title">Voucher System</h4>
                  </div>
                  <p class="fraud-card__description">
                    Vouchers stake funds to endorse a campaign's legitimacy:
                  </p>
                  <ul class="fraud-card__list">
                    <li class="fraud-card__item fraud-card__item--success">
                      <Icon name="heroicons:check" />
                      Stake returned + yield bonus on success
                    </li>
                    <li class="fraud-card__item fraud-card__item--error">
                      <Icon name="heroicons:x-mark" />
                      50% slashed if fraudulent (<code>VOUCHER_SLASH_BPS = 5000</code>)
                    </li>
                    <li class="fraud-card__item fraud-card__item--info">
                      <Icon name="heroicons:information-circle" />
                      Creates community accountability layer
                    </li>
                  </ul>
                </article>

                <!-- Dispute Mechanism -->
                <article class="fraud-card">
                  <div class="fraud-card__header">
                    <div class="fraud-card__icon fraud-card__icon--dispute">
                      <Icon name="heroicons:exclamation-triangle" />
                    </div>
                    <h4 class="fraud-card__title">Dispute Mechanism</h4>
                  </div>
                  <p class="fraud-card__description">
                    Anyone can challenge a campaign during the dispute window (7 days
                    post-deadline):
                  </p>
                  <ul class="fraud-card__list">
                    <li class="fraud-card__item fraud-card__item--success">
                      <Icon name="heroicons:check" />
                      Stake returned + share of forfeited bonds if fraud confirmed
                    </li>
                    <li class="fraud-card__item fraud-card__item--error">
                      <Icon name="heroicons:x-mark" />
                      50% slashed if frivolous (<code>DISPUTER_SLASH_BPS = 5000</code>)
                    </li>
                    <li class="fraud-card__item fraud-card__item--warning">
                      <Icon name="heroicons:arrow-right" />
                      10% threshold triggers "Disputed" status for enhanced review
                    </li>
                  </ul>
                </article>

                <!-- Flash Loan Protection -->
                <article class="fraud-card">
                  <div class="fraud-card__header">
                    <div class="fraud-card__icon fraud-card__icon--flash">
                      <Icon name="heroicons:bolt" />
                    </div>
                    <h4 class="fraud-card__title">Flash Loan Protection</h4>
                  </div>
                  <p class="fraud-card__description">
                    Smart contracts protect against flash loan manipulation:
                  </p>
                  <ul class="fraud-card__list">
                    <li class="fraud-card__item fraud-card__item--info">
                      <Icon name="heroicons:shield-check" />
                      Pledge snapshot taken at first post-deadline dispute
                    </li>
                    <li class="fraud-card__item fraud-card__item--info">
                      <Icon name="heroicons:shield-check" />
                      Threshold calculated against snapshot, not current balance
                    </li>
                    <li class="fraud-card__item fraud-card__item--info">
                      <Icon name="heroicons:shield-check" />
                      Prevents last-minute pledge manipulation attacks
                    </li>
                  </ul>
                </article>

                <!-- AI Fraud Detection (full width) -->
                <article class="fraud-card fraud-card--wide">
                  <div class="fraud-card__header">
                    <div class="fraud-card__icon fraud-card__icon--ai">
                      <Icon name="heroicons:cpu-chip" />
                    </div>
                    <h4 class="fraud-card__title">AI-Powered Fraud Detection</h4>
                  </div>
                  <div class="fraud-card__columns">
                    <div class="fraud-card__column">
                      <h5>Pre-Approval Scanning</h5>
                      <p>Before any campaign goes live, AI analyzes for:</p>
                      <ul>
                        <li>Scam patterns and Ponzi indicators</li>
                        <li>Unrealistic promises</li>
                        <li>Policy violations (illegal content, hate speech)</li>
                        <li>Unverifiable claims</li>
                        <li>Historical fraud patterns</li>
                      </ul>
                    </div>
                    <div class="fraud-card__column">
                      <h5>Verification Integrity</h5>
                      <p>During evaluation, AI performs:</p>
                      <ul>
                        <li>Timestamp verification on evidence</li>
                        <li>Metadata integrity checks</li>
                        <li>Cross-source corroboration</li>
                        <li>Hash consistency validation</li>
                        <li>Manipulation detection</li>
                      </ul>
                    </div>
                  </div>
                </article>
              </div>

              <!-- Economics of Honesty -->
              <div class="economics-card">
                <h4 class="economics-card__title">The Economics of Honesty</h4>
                <p class="economics-card__description">
                  Pledgebook creates a system where honesty is the most profitable strategy for all
                  participants.
                </p>
                <div class="economics-grid">
                  <div class="economics-item">
                    <div class="economics-item__icon">
                      <Icon name="heroicons:user" />
                    </div>
                    <h5 class="economics-item__title">Creators</h5>
                    <p class="economics-item__description">
                      Fraud = lose bond + reputation. Success = funds + yield + credibility.
                    </p>
                  </div>
                  <div class="economics-item">
                    <div class="economics-item__icon">
                      <Icon name="heroicons:users" />
                    </div>
                    <h5 class="economics-item__title">Vouchers</h5>
                    <p class="economics-item__description">
                      Backing fraud = 50% loss. Backing winners = bonus returns.
                    </p>
                  </div>
                  <div class="economics-item">
                    <div class="economics-item__icon">
                      <Icon name="heroicons:magnifying-glass" />
                    </div>
                    <h5 class="economics-item__title">Disputers</h5>
                    <p class="economics-item__description">
                      False claims = 50% loss. Catching fraud = bounty rewards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Get Started Tab -->
          <template #get-started>
            <div class="tab-content">
              <h3 class="tab-content__title">Get Started with Pledgebook</h3>

              <div class="get-started-grid">
                <!-- For Creators -->
                <article class="get-started-card get-started-card--creator">
                  <h4 class="get-started-card__title">For Campaign Creators</h4>
                  <ol class="get-started-card__steps">
                    <li class="get-started-step">
                      <span class="get-started-step__number">1</span>
                      <div class="get-started-step__content">
                        <h5>Connect Your Wallet</h5>
                        <p>Use MetaMask or WalletConnect to connect your Polygon wallet.</p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">2</span>
                      <div class="get-started-step__content">
                        <h5>Define Your SMART Goal</h5>
                        <p>Our AI assistant helps refine your goal into a verifiable objective.</p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">3</span>
                      <div class="get-started-step__content">
                        <h5>Add Data Sources</h5>
                        <p>
                          Connect APIs, upload evidence sources, or specify public data endpoints.
                        </p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">4</span>
                      <div class="get-started-step__content">
                        <h5>Post Your Bond</h5>
                        <p>Stake minimum $10 USDC to prove legitimacy and go live.</p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">5</span>
                      <div class="get-started-step__content">
                        <h5>Achieve &amp; Get Verified</h5>
                        <p>
                          Complete your goal — AI verification happens automatically at deadline.
                        </p>
                      </div>
                    </li>
                  </ol>
                  <NuxtLink
                    to="/campaigns/create"
                    class="btn btn-primary"
                  >
                    Create a Campaign
                    <Icon name="heroicons:arrow-right" />
                  </NuxtLink>
                </article>

                <!-- For Donors -->
                <article class="get-started-card get-started-card--donor">
                  <h4 class="get-started-card__title">For Donors &amp; Supporters</h4>
                  <ol class="get-started-card__steps">
                    <li class="get-started-step">
                      <span class="get-started-step__number">1</span>
                      <div class="get-started-step__content">
                        <h5>Browse Campaigns</h5>
                        <p>
                          Explore verified campaigns across politics, education, and personal goals.
                        </p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">2</span>
                      <div class="get-started-step__content">
                        <h5>Review Verification Criteria</h5>
                        <p>
                          See exactly how success will be measured — prompts are public and
                          immutable.
                        </p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">3</span>
                      <div class="get-started-step__content">
                        <h5>Pledge USDC</h5>
                        <p>Your funds are escrowed and earn yield while awaiting verification.</p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">4</span>
                      <div class="get-started-step__content">
                        <h5>Track Progress</h5>
                        <p>Monitor campaign status and see evidence as it's submitted.</p>
                      </div>
                    </li>
                    <li class="get-started-step">
                      <span class="get-started-step__number">5</span>
                      <div class="get-started-step__content">
                        <h5>Automatic Resolution</h5>
                        <p>
                          Funds released on success, or refunded (+ yield) on failure. No action
                          needed.
                        </p>
                      </div>
                    </li>
                  </ol>
                  <NuxtLink
                    to="/campaigns"
                    class="btn btn-success"
                  >
                    Explore Campaigns
                    <Icon name="heroicons:arrow-right" />
                  </NuxtLink>
                </article>
              </div>

              <!-- FAQ -->
              <div class="faq-section">
                <h4 class="faq-section__title">Frequently Asked Questions</h4>
                <div class="faq-list">
                  <details class="faq-item">
                    <summary class="faq-item__question">
                      What happens if the goal isn't achieved?
                      <Icon name="heroicons:chevron-down" />
                    </summary>
                    <p class="faq-item__answer">
                      Pledgers receive a full refund of their pledge plus any yield earned during
                      the escrow period. The creator's bond is forfeited to the treasury (or
                      disputers if fraud was flagged).
                    </p>
                  </details>
                  <details class="faq-item">
                    <summary class="faq-item__question">
                      How is private data protected?
                      <Icon name="heroicons:chevron-down" />
                    </summary>
                    <p class="faq-item__answer">
                      DECO technology creates zero-knowledge proofs that verify statements about
                      private data (like "weight decreased by 20 lbs") without revealing actual
                      values. Only cryptographic hashes are stored on-chain — raw private data is
                      never exposed.
                    </p>
                  </details>
                  <details class="faq-item">
                    <summary class="faq-item__question">
                      What if I disagree with the AI verdict?
                      <Icon name="heroicons:chevron-down" />
                    </summary>
                    <p class="faq-item__answer">
                      You can file a dispute within 7 days of the deadline by staking funds. This
                      triggers enhanced AI review with additional scrutiny. If the dispute is
                      upheld, you earn rewards; if frivolous, 50% of your stake is slashed.
                    </p>
                  </details>
                  <details class="faq-item">
                    <summary class="faq-item__question">
                      Why USDC instead of ETH or other crypto?
                      <Icon name="heroicons:chevron-down" />
                    </summary>
                    <p class="faq-item__answer">
                      USDC is a stablecoin pegged to the US dollar, eliminating volatility risk. A
                      $100 pledge stays worth ~$100 throughout the campaign, ensuring creators
                      receive predictable funding and donors aren't exposed to crypto price swings.
                    </p>
                  </details>
                  <details class="faq-item">
                    <summary class="faq-item__question">
                      How does the yield work?
                      <Icon name="heroicons:chevron-down" />
                    </summary>
                    <p class="faq-item__answer">
                      All escrowed funds are automatically deposited into Aave V3, a battle-tested
                      DeFi lending protocol. The yield earned is distributed to the appropriate
                      parties based on campaign outcome: to creators/vouchers on success, or to
                      pledgers/disputers on failure.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container-app">
        <div class="cta-card">
          <h2 class="cta-card__title">Ready to Transform How You Fundraise?</h2>
          <p class="cta-card__description">
            Join the movement toward accountable, result-based giving. Whether you're a creator with
            ambitious goals or a donor who wants their contribution to count, Pledgebook is where
            achievement meets reward.
          </p>
          <div class="cta-card__actions">
            <NuxtLink
              to="/campaigns/create"
              class="btn btn-white"
            >
              Create a Campaign
            </NuxtLink>
            <NuxtLink
              to="/campaigns"
              class="btn btn-outline-white"
            >
              Explore Campaigns
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Note -->
    <section class="footer-note">
      <div class="container-app">
        <p class="footer-note__text">
          Pledgebook is built on Polygon, secured by Chainlink, and powered by multi-AI consensus.
          All smart contracts are audited and open-source.
        </p>
        <div class="footer-note__links">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/campaigns">Campaigns</NuxtLink>
          <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app'

useSeoMeta({
  title: 'How It Works - Pledgebook | Incentivized Fundraising Platform',
  description:
    'Learn how Pledgebook revolutionizes fundraising with result-based donations, AI verification, blockchain escrow, and zero-knowledge privacy. Truth over trust.',
  ogTitle: 'How Pledgebook Works - Incentivized Fundraising',
  ogDescription:
    "The world's first platform where donations are released only when goals are verified. Powered by AI consensus, blockchain, and ZKP privacy.",
})

const tabItems = [
  {
    label: 'How It Works',
    slot: 'how-it-works',
    icon: 'i-heroicons-play-circle',
  },
  {
    label: 'Technology',
    slot: 'technology',
    icon: 'i-heroicons-cpu-chip',
  },
  {
    label: 'Use Cases',
    slot: 'use-cases',
    icon: 'i-heroicons-light-bulb',
  },
  {
    label: 'Rules & Goals',
    slot: 'rules-goals',
    icon: 'i-heroicons-clipboard-document-check',
  },
  {
    label: 'Fraud Prevention',
    slot: 'fraud-prevention',
    icon: 'i-heroicons-shield-check',
  },
  {
    label: 'Get Started',
    slot: 'get-started',
    icon: 'i-heroicons-rocket-launch',
  },
]
</script>

<style scoped>
/* =============================================================================
   ABOUT PAGE STYLES
   Follows design patterns from dashboard, campaigns/create, and @[slug] pages
   Uses CSS variables from the design system
   ============================================================================= */

.about-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* -----------------------------------------------------------------------------
   Page Header
   ----------------------------------------------------------------------------- */

.page-header {
  background: linear-gradient(
    to bottom,
    var(--bg-primary),
    color-mix(in oklch, var(--interactive-primary) 5%, var(--bg-primary))
  );
  border-bottom: 1px solid var(--border-primary);
  padding: 3rem 0 4rem;
}

.page-header__content {
  max-width: 48rem;
  text-align: center;
  margin: 0 auto;
}

.page-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
  margin-bottom: 1.5rem;
}

.page-header__badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--interactive-primary);
  border-radius: var(--radius-full);
}

.page-header__title {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .page-header__title {
    font-size: var(--text-5xl);
  }
}

.page-header__description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: 2rem;
}

.page-header__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* -----------------------------------------------------------------------------
   Buttons (consistent with other pages)
   ----------------------------------------------------------------------------- */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.btn-primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background-color: var(--interactive-primary-hover);
}

.btn-secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background-color: var(--surface-hover);
}

.btn-success {
  background-color: var(--color-success-600);
  color: var(--text-inverse);
}

.btn-success:hover {
  background-color: var(--color-success-700);
}

.btn-white {
  background-color: white;
  color: var(--interactive-primary);
}

.btn-white:hover {
  background-color: var(--color-gray-100);
}

.btn-outline-white {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline-white:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* -----------------------------------------------------------------------------
   Features Section
   ----------------------------------------------------------------------------- */

.features-section {
  padding: 3rem 0;
  margin-top: -2rem;
}

.features-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.feature-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.feature-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.feature-card__icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.feature-card--verification .feature-card__icon {
  background-color: color-mix(in oklch, var(--color-blue-500) 15%, transparent);
  color: var(--color-blue-600);
}

.feature-card--funds .feature-card__icon {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.feature-card--privacy .feature-card__icon {
  background-color: color-mix(in oklch, var(--color-purple-500) 15%, transparent);
  color: var(--color-purple-600);
}

.feature-card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.feature-card__subtitle {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 0.125rem;
}

.feature-card__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 0.5rem;
  line-height: var(--leading-relaxed);
}

/* -----------------------------------------------------------------------------
   Intro Section
   ----------------------------------------------------------------------------- */

.intro-section {
  padding: 3rem 0;
}

.intro-card {
  max-width: 56rem;
  margin: 0 auto;
  text-align: center;
}

.intro-card__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.intro-card__description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 42rem;
  margin: 0 auto 2rem;
}

.intro-pillars {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.intro-pillar {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  text-align: center;
}

.intro-pillar--result {
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
}

.intro-pillar--trustless {
  background-color: color-mix(in oklch, var(--color-success-500) 10%, transparent);
}

.intro-pillar--yield {
  background-color: color-mix(in oklch, var(--color-purple-500) 10%, transparent);
}

.intro-pillar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto 0.75rem;
  border-radius: var(--radius-full);
}

.intro-pillar__icon svg {
  width: 1.75rem;
  height: 1.75rem;
}

.intro-pillar--result .intro-pillar__icon {
  background-color: color-mix(in oklch, var(--interactive-primary) 20%, transparent);
  color: var(--interactive-primary);
}

.intro-pillar--trustless .intro-pillar__icon {
  background-color: color-mix(in oklch, var(--color-success-500) 20%, transparent);
  color: var(--color-success-600);
}

.intro-pillar--yield .intro-pillar__icon {
  background-color: color-mix(in oklch, var(--color-purple-500) 20%, transparent);
  color: var(--color-purple-600);
}

.intro-pillar__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.intro-pillar__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

/* -----------------------------------------------------------------------------
   At a Glance Section
   ----------------------------------------------------------------------------- */

.glance-section {
  padding: 2rem 0 3rem;
}

.glance-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.glance-card__title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.glance-steps {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.glance-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.glance-step__number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.glance-step__content h4 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.glance-step__content p {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 0.25rem;
  line-height: var(--leading-relaxed);
}

/* -----------------------------------------------------------------------------
   Tabs Section
   ----------------------------------------------------------------------------- */

.tabs-section {
  padding: 2rem 0 4rem;
}

.tabs-container {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.tab-content {
  padding: 1.5rem 0;
}

.tab-content__title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.tab-content__intro {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 48rem;
  margin-bottom: 2rem;
}

/* -----------------------------------------------------------------------------
   Timeline (How It Works)
   ----------------------------------------------------------------------------- */

.timeline {
  position: relative;
  padding-left: 3rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.875rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: color-mix(in oklch, var(--interactive-primary) 30%, transparent);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item__marker {
  position: absolute;
  left: -3rem;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  z-index: 1;
}

.timeline-item__marker--success {
  background-color: var(--color-success-600);
}

.timeline-item__card {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.timeline-item__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.timeline-item__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: 1rem;
}

.timeline-item__example {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.timeline-item__example-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.timeline-item__example-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.timeline-item__example-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.timeline-item__example-item svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.timeline-item__example-item--success svg {
  color: var(--color-success-500);
}

.timeline-item__example-item--error svg {
  color: var(--color-error-500);
}

.timeline-item__example-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.timeline-item__code {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.timeline-item__code code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.timeline-item__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.timeline-item__grid-card {
  padding: 1rem;
  border-radius: var(--radius-md);
}

.timeline-item__grid-card--success {
  background-color: color-mix(in oklch, var(--color-success-500) 10%, transparent);
}

.timeline-item__grid-card--info {
  background-color: color-mix(in oklch, var(--color-blue-500) 10%, transparent);
}

.timeline-item__grid-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.timeline-item__grid-label svg {
  width: 1rem;
  height: 1rem;
}

.timeline-item__grid-card--success .timeline-item__grid-label svg {
  color: var(--color-success-500);
}

.timeline-item__grid-card--info .timeline-item__grid-label svg {
  color: var(--color-blue-500);
}

.timeline-item__grid-list {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.timeline-item__grid-list li {
  margin-top: 0.25rem;
}

.timeline-item__grid-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

/* Actor Cards */
.timeline-item__actors {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.actor-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.actor-card--pledger {
  border-color: color-mix(in oklch, var(--interactive-primary) 30%, transparent);
}

.actor-card--voucher {
  border-color: color-mix(in oklch, var(--color-success-500) 30%, transparent);
}

.actor-card--disputer {
  border-color: color-mix(in oklch, var(--color-error-500) 30%, transparent);
}

.actor-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  margin-bottom: 0.5rem;
}

.actor-card__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.actor-card--pledger .actor-card__icon {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.actor-card--voucher .actor-card__icon {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.actor-card--disputer .actor-card__icon {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.actor-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.actor-card__description {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.5rem;
  line-height: var(--leading-relaxed);
}

.actor-card__description code {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  background-color: var(--surface-secondary);
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-sm);
}

/* Consensus Demo */
.consensus-demo {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.consensus-demo__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.consensus-demo__label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.consensus-demo__value {
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  color: var(--interactive-primary);
}

.consensus-demo__providers {
  display: flex;
  gap: 0.5rem;
}

.consensus-demo__provider {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
}

.consensus-demo__provider svg {
  width: 1.25rem;
  height: 1.25rem;
}

.consensus-demo__provider--claude {
  background-color: color-mix(in oklch, var(--color-blue-500) 15%, transparent);
  color: var(--color-blue-600);
}

.consensus-demo__provider--grok {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.consensus-demo__provider--gemini {
  background-color: color-mix(in oklch, var(--color-purple-500) 15%, transparent);
  color: var(--color-purple-600);
}

.consensus-demo__provider-name {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.consensus-demo__note {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 0.75rem;
}

.consensus-demo__note code {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
}

/* Outcome Cards */
.timeline-item__outcomes {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.outcome-card {
  padding: 1rem;
  border-radius: var(--radius-md);
}

.outcome-card--success {
  background-color: color-mix(in oklch, var(--color-success-500) 10%, transparent);
}

.outcome-card--failure {
  background-color: color-mix(in oklch, var(--color-error-500) 10%, transparent);
}

.outcome-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: 0.5rem;
}

.outcome-card__title svg {
  width: 1.125rem;
  height: 1.125rem;
}

.outcome-card--success .outcome-card__title {
  color: var(--color-success-700);
}

.outcome-card--failure .outcome-card__title {
  color: var(--color-error-700);
}

.outcome-card__list {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.outcome-card__list li {
  margin-top: 0.25rem;
}

/* Text Utilities */
.text-accent {
  color: var(--interactive-primary);
}

.text-success {
  color: var(--color-success-600);
}

.text-danger {
  color: var(--color-error-600);
}

/* -----------------------------------------------------------------------------
   Technology Grid
   ----------------------------------------------------------------------------- */

.tech-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.tech-card {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.tech-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.tech-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
}

.tech-card__icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.tech-card__icon--blockchain {
  background-color: color-mix(in oklch, var(--color-purple-500) 15%, transparent);
  color: var(--color-purple-600);
}

.tech-card__icon--oracle {
  background-color: color-mix(in oklch, var(--color-blue-500) 15%, transparent);
  color: var(--color-blue-600);
}

.tech-card__icon--privacy {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.tech-card__icon--ai {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.tech-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.tech-card__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tech-item__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.tech-item__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-top: 0.25rem;
}

.tech-item__description code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background-color: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.tech-item__workflow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.workflow-step {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background-color: var(--bg-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
}

.tech-item__workflow svg {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-tertiary);
}

.tech-item__circuits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.tech-item__circuits code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background-color: var(--bg-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.tech-item__providers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.provider-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
}

.provider-badge--claude {
  background-color: color-mix(in oklch, var(--color-blue-500) 15%, transparent);
  color: var(--color-blue-700);
}

.provider-badge--grok {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-700);
}

.provider-badge--gemini {
  background-color: color-mix(in oklch, var(--color-purple-500) 15%, transparent);
  color: var(--color-purple-700);
}

/* -----------------------------------------------------------------------------
   Use Cases
   ----------------------------------------------------------------------------- */

.use-cases-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.use-case-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.use-case-card__icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.use-case-card__icon svg {
  width: 1.75rem;
  height: 1.75rem;
}

.use-case-card--political .use-case-card__icon {
  color: var(--color-blue-600);
}

.use-case-card--education .use-case-card__icon {
  color: var(--color-success-600);
}

.use-case-card--fitness .use-case-card__icon {
  color: var(--color-purple-600);
}

.use-case-card--sustainability .use-case-card__icon {
  color: var(--color-emerald-600);
}

.use-case-card--tech .use-case-card__icon {
  color: var(--color-gray-600);
}

.use-case-card--energy .use-case-card__icon {
  color: var(--color-warning-600);
}

.use-case-card--political {
  border-color: color-mix(in oklch, var(--color-blue-500) 30%, transparent);
  background-color: color-mix(in oklch, var(--color-blue-500) 5%, transparent);
}

.use-case-card--political .use-case-card__icon {
  background-color: color-mix(in oklch, var(--color-blue-500) 15%, transparent);
}

.use-case-card--education {
  border-color: color-mix(in oklch, var(--color-success-500) 30%, transparent);
  background-color: color-mix(in oklch, var(--color-success-500) 5%, transparent);
}

.use-case-card--education .use-case-card__icon {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
}

.use-case-card--fitness {
  border-color: color-mix(in oklch, var(--color-purple-500) 30%, transparent);
  background-color: color-mix(in oklch, var(--color-purple-500) 5%, transparent);
}

.use-case-card--fitness .use-case-card__icon {
  background-color: color-mix(in oklch, var(--color-purple-500) 15%, transparent);
}

.use-case-card--sustainability {
  border-color: color-mix(in oklch, var(--color-emerald-500) 30%, transparent);
  background-color: color-mix(in oklch, var(--color-emerald-500) 5%, transparent);
}

.use-case-card--sustainability .use-case-card__icon {
  background-color: color-mix(in oklch, var(--color-emerald-500) 15%, transparent);
}

.use-case-card--tech {
  border-color: color-mix(in oklch, var(--color-gray-500) 30%, transparent);
  background-color: color-mix(in oklch, var(--color-gray-500) 5%, transparent);
}

.use-case-card--tech .use-case-card__icon {
  background-color: color-mix(in oklch, var(--color-gray-500) 15%, transparent);
}

.use-case-card--energy {
  border-color: color-mix(in oklch, var(--color-warning-500) 30%, transparent);
  background-color: color-mix(in oklch, var(--color-warning-500) 5%, transparent);
}

.use-case-card--energy .use-case-card__icon {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
}

.use-case-card__title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.use-case-card__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: 1rem;
}

.use-case-card__example {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.use-case-card__example h5 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.use-case-card__example p,
.use-case-card__example li {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.use-case-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.use-case-tag {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  padding: 0.25rem 0.75rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .use-case-card {
    flex-direction: column;
  }
}

/* -----------------------------------------------------------------------------
   SMART Framework
   ----------------------------------------------------------------------------- */

.smart-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin-bottom: 2rem;
}

.smart-card {
  padding: 1rem;
  border-radius: var(--radius-xl);
  text-align: center;
}

.smart-card--specific {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-error-500) 10%, transparent),
    color-mix(in oklch, var(--color-error-500) 5%, transparent)
  );
}

.smart-card--measurable {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-warning-500) 10%, transparent),
    color-mix(in oklch, var(--color-warning-500) 5%, transparent)
  );
}

.smart-card--achievable {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-amber-500) 10%, transparent),
    color-mix(in oklch, var(--color-amber-500) 5%, transparent)
  );
}

.smart-card--relevant {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-success-500) 10%, transparent),
    color-mix(in oklch, var(--color-success-500) 5%, transparent)
  );
}

.smart-card--timebound {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--color-blue-500) 10%, transparent),
    color-mix(in oklch, var(--color-blue-500) 5%, transparent)
  );
}

.smart-card__letter {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
}

.smart-card--specific .smart-card__letter {
  color: var(--color-error-600);
}
.smart-card--measurable .smart-card__letter {
  color: var(--color-warning-600);
}
.smart-card--achievable .smart-card__letter {
  color: var(--color-amber-600);
}
.smart-card--relevant .smart-card__letter {
  color: var(--color-success-600);
}
.smart-card--timebound .smart-card__letter {
  color: var(--color-blue-600);
}

.smart-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-top: 0.25rem;
}

.smart-card__description {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 0.375rem;
}

/* Section Subtitles */
.section-subtitle {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 48rem;
}

/* Goal Examples */
.goal-examples {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.goal-example {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid;
}

.goal-example svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.goal-example--success {
  background-color: color-mix(in oklch, var(--color-success-500) 8%, transparent);
  border-color: color-mix(in oklch, var(--color-success-500) 25%, transparent);
}

.goal-example--success svg {
  color: var(--color-success-500);
}

.goal-example--error {
  background-color: color-mix(in oklch, var(--color-error-500) 8%, transparent);
  border-color: color-mix(in oklch, var(--color-error-500) 25%, transparent);
}

.goal-example--error svg {
  color: var(--color-error-500);
}

.goal-example__goal {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.goal-example__reason {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Sources Grid */
.sources-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 2rem;
}

.source-card {
  padding: 1rem;
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.source-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  color: var(--interactive-primary);
  margin-bottom: 0.75rem;
}

.source-card__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.source-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.source-card__description {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 0.375rem;
  line-height: var(--leading-relaxed);
}

/* Prompts Grid */
.prompts-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.prompt-card {
  padding: 1.25rem;
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.prompt-card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.prompt-card__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: 0.75rem;
}

.prompt-card__output {
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
}

.prompt-card__output code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* -----------------------------------------------------------------------------
   Fraud Prevention
   ----------------------------------------------------------------------------- */

.fraud-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.fraud-card {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.fraud-card--wide {
  grid-column: 1 / -1;
}

.fraud-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.fraud-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
}

.fraud-card__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.fraud-card__icon--bond {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.fraud-card__icon--vouch {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.fraud-card__icon--dispute {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.fraud-card__icon--flash {
  background-color: color-mix(in oklch, var(--color-purple-500) 15%, transparent);
  color: var(--color-purple-600);
}

.fraud-card__icon--ai {
  background-color: color-mix(in oklch, var(--color-blue-500) 15%, transparent);
  color: var(--color-blue-600);
}

.fraud-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.fraud-card__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.fraud-card__description code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background-color: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.fraud-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fraud-card__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.fraud-card__item svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.fraud-card__item--success svg {
  color: var(--color-success-500);
}
.fraud-card__item--error svg {
  color: var(--color-error-500);
}
.fraud-card__item--warning svg {
  color: var(--color-warning-500);
}
.fraud-card__item--info svg {
  color: var(--color-blue-500);
}

.fraud-card__columns {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.fraud-card__column h5 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.fraud-card__column p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.fraud-card__column ul {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.fraud-card__column li {
  margin-top: 0.25rem;
}

/* Economics Card */
.economics-card {
  margin-top: 2rem;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 10%, transparent),
    color-mix(in oklch, var(--color-purple-500) 10%, transparent)
  );
  border-radius: var(--radius-xl);
  text-align: center;
}

.economics-card__title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.economics-card__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.economics-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.economics-item {
  text-align: center;
}

.economics-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-full);
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
  margin: 0 auto 0.75rem;
}

.economics-item__icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.economics-item__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.economics-item__description {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* -----------------------------------------------------------------------------
   Get Started
   ----------------------------------------------------------------------------- */

.get-started-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  margin-bottom: 2.5rem;
}

.get-started-card {
  padding: 2rem;
  background-color: var(--bg-primary);
  border: 2px solid;
  border-radius: var(--radius-xl);
}

.get-started-card--creator {
  border-color: color-mix(in oklch, var(--interactive-primary) 30%, transparent);
}

.get-started-card--donor {
  border-color: color-mix(in oklch, var(--color-success-500) 30%, transparent);
}

.get-started-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: 1.5rem;
}

.get-started-card--creator .get-started-card__title {
  color: var(--interactive-primary);
}

.get-started-card--donor .get-started-card__title {
  color: var(--color-success-600);
}

.get-started-card__steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.get-started-step {
  display: flex;
  gap: 1rem;
}

.get-started-step__number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.get-started-card--creator .get-started-step__number {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.get-started-card--donor .get-started-step__number {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.get-started-step__content h5 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.get-started-step__content p {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: 0.125rem;
}

/* FAQ Section */
.faq-section__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.faq-item__question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  cursor: pointer;
  list-style: none;
}

.faq-item__question::-webkit-details-marker {
  display: none;
}

.faq-item__question svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
  transition: transform var(--transition-fast);
}

.faq-item[open] .faq-item__question svg {
  transform: rotate(180deg);
}

.faq-item__answer {
  padding: 0 1rem 1rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

/* -----------------------------------------------------------------------------
   CTA Section
   ----------------------------------------------------------------------------- */

.cta-section {
  padding: 3rem 0;
}

.cta-card {
  background: linear-gradient(135deg, var(--interactive-primary), var(--color-purple-600));
  border-radius: var(--radius-2xl);
  padding: 3rem 2rem;
  text-align: center;
}

.cta-card__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: white;
  margin-bottom: 0.75rem;
}

.cta-card__description {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.85);
  max-width: 36rem;
  margin: 0 auto 2rem;
  line-height: var(--leading-relaxed);
}

.cta-card__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* -----------------------------------------------------------------------------
   Footer Note
   ----------------------------------------------------------------------------- */

.footer-note {
  padding: 2rem 0;
  text-align: center;
}

.footer-note__text {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.footer-note__links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.footer-note__links a {
  font-size: var(--text-sm);
  color: var(--interactive-primary);
  text-decoration: none;
}

.footer-note__links a:hover {
  text-decoration: underline;
}

/* -----------------------------------------------------------------------------
   Container
   ----------------------------------------------------------------------------- */

.container-app {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container-app {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container-app {
    padding: 0 2rem;
  }
}
</style>
