<template>
  <div class="docs-admin-page">
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
        <h1 class="page-header__title">Admin Guide</h1>
        <p class="page-header__description">
          Documentation for platform administrators: moderation, disputes, and configuration.
        </p>
        <div class="access-notice">
          <Icon name="heroicons:shield-check" />
          <span>This documentation is for authorized administrators only.</span>
        </div>
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
                <li><a href="#access">Admin Access</a></li>
                <li><a href="#campaigns">Campaign Review</a></li>
                <li><a href="#disputes">Dispute Resolution</a></li>
                <li><a href="#users">User Management</a></li>
                <li><a href="#verification">Manual Verification</a></li>
                <li><a href="#config">Configuration</a></li>
              </ul>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="docs-main">
            <section id="overview">
              <h2>Overview</h2>
              <p>
                Platform administrators have special privileges to moderate content, resolve
                disputes, and manage platform configuration. Admin actions are logged for
                accountability.
              </p>
              <div class="warning-box">
                <Icon name="heroicons:exclamation-triangle" />
                <p>
                  <strong>Important:</strong> Admin actions affect user funds and trust. Always
                  follow the documented procedures and document your reasoning.
                </p>
              </div>
            </section>

            <section id="access">
              <h2>Admin Access</h2>
              <p>
                Admin access is controlled via wallet address allowlist. Admins authenticate using
                SIWE (Sign-In with Ethereum) like regular users.
              </p>

              <h3>Becoming an Admin</h3>
              <p>
                Admin addresses are managed in the platform configuration. To add or remove admins,
                an existing admin must update the allowlist.
              </p>

              <h3>Admin Dashboard</h3>
              <p>Access the admin dashboard at <code>/admin</code> when authenticated.</p>
              <div class="admin-features">
                <div class="admin-feature">
                  <Icon name="heroicons:queue-list" />
                  <span>Pending campaign reviews</span>
                </div>
                <div class="admin-feature">
                  <Icon name="heroicons:exclamation-triangle" />
                  <span>Open disputes</span>
                </div>
                <div class="admin-feature">
                  <Icon name="heroicons:users" />
                  <span>User management</span>
                </div>
                <div class="admin-feature">
                  <Icon name="heroicons:cog-6-tooth" />
                  <span>Platform configuration</span>
                </div>
              </div>
            </section>

            <section id="campaigns">
              <h2>Campaign Review</h2>
              <p>
                Some campaigns may require manual review, especially when AI validation is
                inconclusive or the goal is complex.
              </p>

              <h3>Review Criteria</h3>
              <ul>
                <li><strong>Verifiability:</strong> Can the goal be objectively verified?</li>
                <li><strong>Clarity:</strong> Is the goal clearly stated?</li>
                <li><strong>Evidence plan:</strong> Is the evidence type appropriate?</li>
                <li><strong>Compliance:</strong> Does it violate any policies?</li>
              </ul>

              <h3>Review Actions</h3>
              <div class="actions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>When to Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Approve</strong></td>
                      <td>Campaign meets all criteria and is ready for funding</td>
                    </tr>
                    <tr>
                      <td><strong>Request Changes</strong></td>
                      <td>Minor issues that the creator can fix</td>
                    </tr>
                    <tr>
                      <td><strong>Reject</strong></td>
                      <td>Unverifiable goal or policy violation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="disputes">
              <h2>Dispute Resolution</h2>
              <p>
                Disputes occur when pledgers challenge a verification result. Admins review evidence
                and make final determinations.
              </p>

              <h3>Dispute Workflow</h3>
              <ol>
                <li>Pledger files dispute with reason and evidence</li>
                <li>Funds are paused from release</li>
                <li>Admin reviews original evidence and dispute claim</li>
                <li>Admin may request additional information</li>
                <li>Admin makes final determination</li>
                <li>Funds released or returned based on decision</li>
              </ol>

              <h3>Resolution Options</h3>
              <div class="resolution-cards">
                <div class="resolution-card resolution-card--green">
                  <h4>Uphold Verification</h4>
                  <p>
                    The original AI verification was correct. Funds are released to creator (minus
                    platform fee).
                  </p>
                </div>
                <div class="resolution-card resolution-card--red">
                  <h4>Overturn Verification</h4>
                  <p>
                    The dispute is valid. Campaign is marked as failed and funds are returned to
                    pledgers.
                  </p>
                </div>
                <div class="resolution-card resolution-card--yellow">
                  <h4>Partial Resolution</h4>
                  <p>
                    In rare cases, a partial resolution may be appropriate. Document reasoning
                    thoroughly.
                  </p>
                </div>
              </div>

              <div class="info-box">
                <Icon name="heroicons:clock" />
                <p>
                  Target resolution time: 7-14 days. Complex cases may require longer. Keep
                  disputants informed of progress.
                </p>
              </div>
            </section>

            <section id="users">
              <h2>User Management</h2>
              <p>Admins can take actions on user accounts when necessary.</p>

              <h3>Available Actions</h3>
              <ul>
                <li>
                  <strong>Ban user:</strong> Prevents the address from creating campaigns or
                  pledging. Use for fraud or serious policy violations.
                </li>
                <li><strong>Unban user:</strong> Restore a previously banned address.</li>
                <li>
                  <strong>View history:</strong> See all campaigns, pledges, and disputes for an
                  address.
                </li>
              </ul>

              <div class="warning-box">
                <Icon name="heroicons:exclamation-triangle" />
                <p>
                  Banning only affects platform features. It cannot freeze funds in smart
                  contracts—users can always withdraw their own pledges.
                </p>
              </div>
            </section>

            <section id="verification">
              <h2>Manual Verification</h2>
              <p>
                In cases where AI consensus fails or is contested, admins may need to manually
                verify goal achievement.
              </p>

              <h3>When to Use</h3>
              <ul>
                <li>AI models cannot reach consensus</li>
                <li>Evidence type is not supported by AI</li>
                <li>Creator requests manual review</li>
                <li>Dispute requires human judgment</li>
              </ul>

              <h3>Process</h3>
              <ol>
                <li>Review all submitted evidence thoroughly</li>
                <li>Cross-reference with baseline capture</li>
                <li>Verify authenticity (check for manipulation)</li>
                <li>Document your verification process</li>
                <li>Record decision with detailed reasoning</li>
              </ol>
            </section>

            <section id="config">
              <h2>Configuration</h2>
              <p>
                Platform configuration is managed through environment variables and admin settings.
              </p>

              <h3>Admin-Configurable Settings</h3>
              <ul>
                <li><strong>Admin allowlist:</strong> Wallet addresses with admin privileges</li>
                <li><strong>Category management:</strong> Add/edit campaign categories</li>
                <li><strong>Fee configuration:</strong> Platform fee percentage</li>
                <li><strong>AI provider weights:</strong> Consensus algorithm parameters</li>
              </ul>

              <h3>Environment Variables</h3>
              <p>
                Critical configuration (API keys, contract addresses) is managed via environment
                variables. See <code>.env.example</code> for required values.
              </p>
            </section>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Admin Guide | Pledgebook Documentation',
  description:
    'Administrator documentation for Pledgebook: campaign moderation, dispute resolution, user management, and configuration.',
})
</script>

<style scoped>
.docs-admin-page {
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
  margin-bottom: 1rem;
}

.access-notice {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.access-notice .iconify {
  flex-shrink: 0;
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

.docs-main code {
  background-color: var(--bg-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Fira Code', monospace;
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

/* Admin Features */
.admin-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}

.admin-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.admin-feature .iconify {
  color: var(--color-primary);
  font-size: 1.25rem;
}

/* Actions Table */
.actions-table {
  overflow-x: auto;
  margin: 1rem 0;
}

.actions-table table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  overflow: hidden;
}

.actions-table th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  background-color: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.actions-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.actions-table tr:last-child td {
  border-bottom: none;
}

/* Resolution Cards */
.resolution-cards {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}

.resolution-card {
  border-radius: 0.5rem;
  padding: 1rem;
}

.resolution-card--green {
  background-color: var(--color-green-light);
  border: 1px solid var(--color-green);
}

.resolution-card--red {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
}

.resolution-card--yellow {
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
}

.resolution-card h4 {
  margin: 0 0 0.25rem;
}

.resolution-card p {
  font-size: 0.875rem;
  margin: 0;
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

  .admin-features {
    grid-template-columns: 1fr;
  }
}
</style>
