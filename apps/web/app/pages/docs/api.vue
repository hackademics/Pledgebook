<template>
  <div class="docs-api-page">
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
        <h1 class="page-header__title">API Reference</h1>
        <p class="page-header__description">
          Technical documentation for developers integrating with the Pledgebook API.
        </p>
        <div class="api-status">
          <span class="api-status__badge api-status__badge--preview">Preview</span>
          <span class="api-status__text">API is in preview. Breaking changes may occur.</span>
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
                <li><a href="#authentication">Authentication</a></li>
                <li><a href="#endpoints">Endpoints</a></li>
                <li><a href="#campaigns">Campaigns</a></li>
                <li><a href="#pledges">Pledges</a></li>
                <li><a href="#verification">Verification</a></li>
                <li><a href="#errors">Error Handling</a></li>
                <li><a href="#rate-limits">Rate Limits</a></li>
              </ul>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="docs-main">
            <section id="overview">
              <h2>Overview</h2>
              <p>
                The Pledgebook API provides programmatic access to campaign data, pledge
                information, and verification status. The API is RESTful and returns JSON responses.
              </p>
              <div class="info-box">
                <Icon name="heroicons:information-circle" />
                <p>
                  The public API is currently in preview. For early access, contact
                  <a href="mailto:api@pledgebook.io">api@pledgebook.io</a>.
                </p>
              </div>
              <h3>Base URL</h3>
              <div class="code-block">
                <code>https://api.pledgebook.io/v1</code>
              </div>
            </section>

            <section id="authentication">
              <h2>Authentication</h2>
              <p>
                API requests require an API key passed in the <code>Authorization</code> header.
              </p>
              <div class="code-block">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <p>
                For wallet-authenticated endpoints (creating pledges, claiming funds), you'll also
                need to include a signed message proving wallet ownership.
              </p>
            </section>

            <section id="endpoints">
              <h2>Endpoints Overview</h2>
              <div class="endpoints-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span class="method method--get">GET</span></td>
                      <td><code>/campaigns</code></td>
                      <td>List all active campaigns</td>
                    </tr>
                    <tr>
                      <td><span class="method method--get">GET</span></td>
                      <td><code>/campaigns/:id</code></td>
                      <td>Get campaign details</td>
                    </tr>
                    <tr>
                      <td><span class="method method--get">GET</span></td>
                      <td><code>/campaigns/:id/pledges</code></td>
                      <td>List pledges for a campaign</td>
                    </tr>
                    <tr>
                      <td><span class="method method--get">GET</span></td>
                      <td><code>/campaigns/:id/verification</code></td>
                      <td>Get verification status</td>
                    </tr>
                    <tr>
                      <td><span class="method method--get">GET</span></td>
                      <td><code>/users/:address</code></td>
                      <td>Get user profile</td>
                    </tr>
                    <tr>
                      <td><span class="method method--get">GET</span></td>
                      <td><code>/categories</code></td>
                      <td>List campaign categories</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="campaigns">
              <h2>Campaigns</h2>
              <h3>List Campaigns</h3>
              <div class="endpoint-header">
                <span class="method method--get">GET</span>
                <code>/campaigns</code>
              </div>
              <p>Returns a paginated list of active campaigns.</p>
              <h4>Query Parameters</h4>
              <div class="params-table">
                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>page</code></td>
                      <td>integer</td>
                      <td>Page number (default: 1)</td>
                    </tr>
                    <tr>
                      <td><code>limit</code></td>
                      <td>integer</td>
                      <td>Results per page (default: 20, max: 100)</td>
                    </tr>
                    <tr>
                      <td><code>category</code></td>
                      <td>string</td>
                      <td>Filter by category slug</td>
                    </tr>
                    <tr>
                      <td><code>status</code></td>
                      <td>string</td>
                      <td>Filter by status: active, verified, failed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4>Response</h4>
              <div class="code-block code-block--json">
                <pre>
{
  "data": [
    {
      "id": "campaign_abc123",
      "title": "Run a marathon in under 4 hours",
      "creator": "0x1234...5678",
      "goal_amount": "5000.00",
      "pledged_amount": "3250.00",
      "deadline": "2025-06-01T00:00:00Z",
      "status": "active",
      "category": "fitness",
      "created_at": "2025-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}</pre
                >
              </div>
            </section>

            <section id="pledges">
              <h2>Pledges</h2>
              <h3>Get Campaign Pledges</h3>
              <div class="endpoint-header">
                <span class="method method--get">GET</span>
                <code>/campaigns/:id/pledges</code>
              </div>
              <p>Returns pledges for a specific campaign.</p>
              <h4>Response</h4>
              <div class="code-block code-block--json">
                <pre>
{
  "data": [
    {
      "id": "pledge_xyz789",
      "pledger": "0xabcd...efgh",
      "amount": "100.00",
      "tx_hash": "0x...",
      "created_at": "2025-01-20T15:30:00Z"
    }
  ],
  "total_pledged": "3250.00",
  "pledger_count": 45
}</pre
                >
              </div>
            </section>

            <section id="verification">
              <h2>Verification</h2>
              <h3>Get Verification Status</h3>
              <div class="endpoint-header">
                <span class="method method--get">GET</span>
                <code>/campaigns/:id/verification</code>
              </div>
              <p>Returns the current verification status and AI consensus results.</p>
              <h4>Response</h4>
              <div class="code-block code-block--json">
                <pre>
{
  "status": "verified",
  "consensus": {
    "result": "success",
    "confidence": 0.95,
    "models": ["claude", "gpt4", "gemini"],
    "votes": {
      "success": 3,
      "failure": 0
    }
  },
  "evidence_cid": "Qm...",
  "verified_at": "2025-02-01T10:00:00Z"
}</pre
                >
              </div>
            </section>

            <section id="errors">
              <h2>Error Handling</h2>
              <p>The API uses standard HTTP status codes and returns error details in JSON.</p>
              <div class="code-block code-block--json">
                <pre>
{
  "error": {
    "code": "CAMPAIGN_NOT_FOUND",
    "message": "Campaign with ID 'abc123' not found",
    "status": 404
  }
}</pre
                >
              </div>
              <h3>Common Error Codes</h3>
              <div class="params-table">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>UNAUTHORIZED</code></td>
                      <td>401</td>
                      <td>Missing or invalid API key</td>
                    </tr>
                    <tr>
                      <td><code>FORBIDDEN</code></td>
                      <td>403</td>
                      <td>Insufficient permissions</td>
                    </tr>
                    <tr>
                      <td><code>NOT_FOUND</code></td>
                      <td>404</td>
                      <td>Resource not found</td>
                    </tr>
                    <tr>
                      <td><code>RATE_LIMITED</code></td>
                      <td>429</td>
                      <td>Too many requests</td>
                    </tr>
                    <tr>
                      <td><code>INTERNAL_ERROR</code></td>
                      <td>500</td>
                      <td>Server error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="rate-limits">
              <h2>Rate Limits</h2>
              <p>API requests are rate limited to ensure fair usage:</p>
              <ul>
                <li><strong>Free tier:</strong> 100 requests per minute</li>
                <li><strong>Authenticated:</strong> 1,000 requests per minute</li>
                <li><strong>Enterprise:</strong> Custom limits available</li>
              </ul>
              <p>Rate limit info is returned in response headers:</p>
              <div class="code-block">
                <code>X-RateLimit-Limit: 1000</code><br />
                <code>X-RateLimit-Remaining: 985</code><br />
                <code>X-RateLimit-Reset: 1706800000</code>
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'API Reference | Pledgebook Documentation',
  description:
    'Technical API documentation for developers integrating with Pledgebook. REST API endpoints for campaigns, pledges, and verification.',
})
</script>

<style scoped>
.docs-api-page {
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

.api-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.api-status__badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.api-status__badge--preview {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.api-status__text {
  font-size: 0.875rem;
  color: var(--text-tertiary);
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
  margin: 1.25rem 0 0.5rem;
}

.docs-main p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.docs-main ul {
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.docs-main code {
  background-color: var(--bg-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: 'Fira Code', monospace;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 0.75rem;
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-box .iconify {
  color: var(--color-primary);
  flex-shrink: 0;
  font-size: 1.25rem;
}

.info-box p {
  margin: 0;
  font-size: 0.875rem;
}

.info-box a {
  color: var(--color-primary);
}

/* Code Block */
.code-block {
  background-color: #1e1e1e;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.code-block code,
.code-block pre {
  color: #d4d4d4;
  background: none;
  padding: 0;
  font-family: 'Fira Code', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
}

.code-block pre {
  margin: 0;
}

/* Endpoint Header */
.endpoint-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.endpoint-header code {
  background: none;
  padding: 0;
  font-size: 0.9375rem;
}

/* Method Badge */
.method {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
}

.method--get {
  background-color: var(--color-green-light);
  color: var(--color-green);
}

.method--post {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.method--delete {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Tables */
.endpoints-table,
.params-table {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.endpoints-table table,
.params-table table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  overflow: hidden;
}

.endpoints-table th,
.params-table th {
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

.endpoints-table td,
.params-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.endpoints-table tr:last-child td,
.params-table tr:last-child td {
  border-bottom: none;
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
}
</style>
