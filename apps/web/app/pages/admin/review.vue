<template>
  <div class="admin-review-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/dashboard"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Dashboard
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div class="page-header__text">
              <h1 class="page-header__title">Admin Review</h1>
              <p class="page-header__description">
                Review submitted campaigns, verify eligibility, and publish trusted outcomes.
              </p>
            </div>
            <div class="page-header__actions">
              <div class="page-header__stats">
                <div class="page-header__stat">
                  <span class="page-header__stat-label">Submitted</span>
                  <span class="page-header__stat-value">{{ pendingCount }}</span>
                </div>
                <div class="page-header__stat">
                  <span class="page-header__stat-label">Featured</span>
                  <span class="page-header__stat-value">{{ featuredCount }}</span>
                </div>
                <div class="page-header__stat">
                  <span class="page-header__stat-label">Verified</span>
                  <span class="page-header__stat-value">{{ verifiedCount }}</span>
                </div>
              </div>
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                :disabled="pending"
                @click="refresh"
              >
                <Icon name="heroicons:arrow-path" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <Transition
          name="slide-down"
          mode="out-in"
        >
          <div
            v-if="!isConnected"
            class="admin-review-banner"
          >
            <div class="admin-review-banner__content">
              <div class="admin-review-banner__text">
                <Icon
                  name="heroicons:exclamation-triangle"
                  class="admin-review-banner__icon"
                />
                <span>Connect your wallet to access admin review tools.</span>
              </div>
              <button
                type="button"
                class="btn btn--primary btn--sm"
                @click="handleConnectWallet"
              >
                <Icon name="heroicons:wallet" />
                Connect Wallet
              </button>
            </div>
          </div>

          <div
            v-else-if="!allowlistConfigured"
            class="admin-review-banner admin-review-banner--info"
          >
            <div class="admin-review-banner__content">
              <div class="admin-review-banner__text">
                <Icon
                  name="heroicons:exclamation-triangle"
                  class="admin-review-banner__icon"
                />
                <span>Admin allowlist is not configured. Update the environment settings.</span>
              </div>
              <NuxtLink
                to="/docs/admin"
                class="btn btn--secondary btn--sm"
              >
                Review Docs
              </NuxtLink>
            </div>
          </div>

          <div
            v-else-if="!isAllowed"
            class="admin-review-banner admin-review-banner--error"
          >
            <div class="admin-review-banner__content">
              <div class="admin-review-banner__text">
                <Icon
                  name="heroicons:lock-closed"
                  class="admin-review-banner__icon"
                />
                <span>Access denied. Your wallet is not on the admin allowlist.</span>
              </div>
              <NuxtLink
                to="/dashboard"
                class="btn btn--secondary btn--sm"
              >
                Return to Dashboard
              </NuxtLink>
            </div>
          </div>

          <div
            v-else
            class="page-main__layout admin-review__layout"
          >
            <section class="admin-review__primary">
              <div class="admin-review__stats-grid">
                <div class="admin-review__stat-card">
                  <div class="admin-review__stat-icon">
                    <Icon name="heroicons:clipboard-document-check" />
                  </div>
                  <div>
                    <p class="admin-review__stat-label">Pending submissions</p>
                    <h3 class="admin-review__stat-value">{{ pendingCount }}</h3>
                  </div>
                </div>
                <div class="admin-review__stat-card">
                  <div class="admin-review__stat-icon admin-review__stat-icon--featured">
                    <Icon name="heroicons:star" />
                  </div>
                  <div>
                    <p class="admin-review__stat-label">Featured</p>
                    <h3 class="admin-review__stat-value">{{ featuredCount }}</h3>
                  </div>
                </div>
                <div class="admin-review__stat-card">
                  <div class="admin-review__stat-icon admin-review__stat-icon--verified">
                    <Icon name="heroicons:shield-check" />
                  </div>
                  <div>
                    <p class="admin-review__stat-label">Verified</p>
                    <h3 class="admin-review__stat-value">{{ verifiedCount }}</h3>
                  </div>
                </div>
              </div>

              <div
                v-if="pending"
                class="admin-review__state"
              >
                <AppSpinner />
                <span>Loading campaigns...</span>
              </div>

              <div
                v-else-if="error"
                class="admin-review__state admin-review__state--error"
              >
                <Icon name="heroicons:exclamation-circle" />
                <span>Failed to load campaigns. Please try again.</span>
                <button
                  type="button"
                  class="btn btn--secondary btn--sm"
                  @click="refresh"
                >
                  Retry
                </button>
              </div>

              <div
                v-else-if="campaigns.length === 0"
                class="admin-review__empty"
              >
                <Icon name="heroicons:inbox" />
                <div>
                  <h3>No campaigns to review</h3>
                  <p>You're all caught up. New submissions will appear here.</p>
                </div>
              </div>

              <div
                v-else
                class="admin-review__list"
              >
                <article
                  v-for="campaign in campaigns"
                  :key="campaign.id"
                  class="admin-review__card"
                >
                  <div class="admin-review__card-header">
                    <div>
                      <div class="admin-review__badges">
                        <span class="admin-review__badge">{{ campaign.status }}</span>
                        <span
                          v-if="hasPendingChanges(campaign)"
                          class="admin-review__badge admin-review__badge--warning"
                        >
                          Unsaved changes
                        </span>
                      </div>
                      <h3 class="admin-review__title">{{ campaign.name }}</h3>
                      <p class="admin-review__subtitle">{{ campaign.purpose }}</p>
                    </div>
                    <div class="admin-review__card-actions">
                      <NuxtLink
                        :to="`/campaigns/${campaign.slug || campaign.id}`"
                        class="btn btn--secondary btn--sm"
                      >
                        View
                      </NuxtLink>
                    </div>
                  </div>

                  <div class="admin-review__fields">
                    <div class="form-field">
                      <label
                        class="form-label"
                        :for="`status-${campaign.id}`"
                      >
                        <span class="form-label-text">Status</span>
                      </label>
                      <div class="form-select-wrapper">
                        <select
                          :id="`status-${campaign.id}`"
                          v-model="adminEdits[campaign.id].status"
                          class="form-select"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="approved">Approved</option>
                          <option value="active">Active</option>
                          <option value="complete">Complete</option>
                          <option value="failed">Failed</option>
                          <option value="disputed">Disputed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <div class="form-select-chevron">
                          <Icon
                            name="heroicons:chevron-down"
                            class="form-select-chevron-icon"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="admin-review__toggles">
                      <div class="form-checkbox-field">
                        <div class="form-checkbox-wrapper">
                          <input
                            :id="`featured-${campaign.id}`"
                            v-model="adminEdits[campaign.id].isFeatured"
                            type="checkbox"
                            class="form-checkbox"
                          />
                          <label
                            :for="`featured-${campaign.id}`"
                            class="form-checkbox-label"
                          >
                            <span class="form-checkbox-label-text">Featured</span>
                          </label>
                        </div>
                      </div>
                      <div class="form-checkbox-field">
                        <div class="form-checkbox-wrapper">
                          <input
                            :id="`showcased-${campaign.id}`"
                            v-model="adminEdits[campaign.id].isShowcased"
                            type="checkbox"
                            class="form-checkbox"
                          />
                          <label
                            :for="`showcased-${campaign.id}`"
                            class="form-checkbox-label"
                          >
                            <span class="form-checkbox-label-text">Showcased</span>
                          </label>
                        </div>
                      </div>
                      <div class="form-checkbox-field">
                        <div class="form-checkbox-wrapper">
                          <input
                            :id="`verified-${campaign.id}`"
                            v-model="adminEdits[campaign.id].isVerified"
                            type="checkbox"
                            class="form-checkbox"
                          />
                          <label
                            :for="`verified-${campaign.id}`"
                            class="form-checkbox-label"
                          >
                            <span class="form-checkbox-label-text">Verified</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="admin-review__actions">
                    <div class="admin-review__meta">
                      <span>Review before publishing</span>
                    </div>
                    <button
                      type="button"
                      class="btn btn--primary"
                      :disabled="campaignSubmitting === campaign.id"
                      @click="submitUpdate(campaign.id)"
                    >
                      {{ campaignSubmitting === campaign.id ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </article>
              </div>
            </section>

            <aside class="page-main__sidebar">
              <div class="helper-card">
                <h3 class="helper-card__title">Review Checklist</h3>
                <ul class="helper-card__list">
                  <li class="helper-card__list-item">
                    <Icon name="heroicons:check-circle" />
                    <span>Validate sources and SMART goal clarity</span>
                  </li>
                  <li class="helper-card__list-item">
                    <Icon name="heroicons:check-circle" />
                    <span>Confirm timelines and funding requirements</span>
                  </li>
                  <li class="helper-card__list-item">
                    <Icon name="heroicons:check-circle" />
                    <span>Flag risks or missing evidence</span>
                  </li>
                </ul>
              </div>
              <div class="helper-card">
                <h3 class="helper-card__title">Status Guide</h3>
                <div class="admin-review__status-guide">
                  <div>
                    <span class="admin-review__badge">Submitted</span>
                    <p>Awaiting admin verification and baseline capture.</p>
                  </div>
                  <div>
                    <span class="admin-review__badge admin-review__badge--success">Approved</span>
                    <p>Accepted for publish; baseline snapshot is in progress.</p>
                  </div>
                  <div>
                    <span class="admin-review__badge admin-review__badge--info">Active</span>
                    <p>Campaign live and accepting pledges.</p>
                  </div>
                </div>
              </div>
              <div class="helper-card helper-card--support">
                <div class="admin-review__support">
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="admin-review__support-icon"
                  />
                  <div>
                    <h4>Need another approver?</h4>
                    <p>Coordinate with the governance team before final approval.</p>
                    <div class="admin-review__support-links">
                      <NuxtLink to="/community">Community</NuxtLink>
                      <NuxtLink to="/docs/admin">Admin Docs</NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

const { isConnected, address } = useWallet()
const toast = useToast()

// Fetch admin config from API (server has access to Wrangler env vars)
const { data: adminConfig } = await useFetch('/api/admin/config')

const adminAllowlist = computed(() => adminConfig.value?.data?.allowlist || [])
const allowlistConfigured = computed(() => adminConfig.value?.data?.configured || false)
const isAllowed = computed(() => {
  if (!isConnected.value || !address.value) return false
  return adminAllowlist.value.includes(address.value.toLowerCase())
})

const { data, pending, error, refresh } = useFetch(() =>
  isAllowed.value ? '/api/campaigns?status=submitted&limit=50' : null,
)

const campaigns = computed(() => data.value?.data || [])

const pendingCount = computed(() => campaigns.value.length)
const featuredCount = computed(
  () => campaigns.value.filter((campaign) => campaign.isFeatured).length,
)
const verifiedCount = computed(
  () => campaigns.value.filter((campaign) => campaign.isVerified).length,
)

type CampaignSummary = {
  id: string
  name: string
  purpose: string
  slug?: string
  status: string
  isFeatured: boolean
  isShowcased: boolean
  isVerified: boolean
}

const adminEdits = reactive<
  Record<
    string,
    {
      status: string
      isFeatured: boolean
      isShowcased: boolean
      isVerified: boolean
    }
  >
>({})

watch(campaigns, (value: CampaignSummary[]) => {
  value.forEach((campaign) => {
    if (!adminEdits[campaign.id]) {
      adminEdits[campaign.id] = {
        status: campaign.status,
        isFeatured: campaign.isFeatured,
        isShowcased: campaign.isShowcased,
        isVerified: campaign.isVerified,
      }
    }
  })
})

const campaignSubmitting = ref<string | null>(null)

function handleConnectWallet(): void {
  const event = new CustomEvent('open-wallet-modal')
  window.dispatchEvent(event)
}

function hasPendingChanges(campaign: CampaignSummary): boolean {
  const edits = adminEdits[campaign.id]
  if (!edits) return false
  return (
    edits.status !== campaign.status ||
    edits.isFeatured !== campaign.isFeatured ||
    edits.isShowcased !== campaign.isShowcased ||
    edits.isVerified !== campaign.isVerified
  )
}

async function submitUpdate(campaignId: string): Promise<void> {
  if (!address.value) return
  const payload = adminEdits[campaignId]
  campaignSubmitting.value = campaignId

  try {
    await $fetch(`/api/campaigns/${campaignId}/admin`, {
      method: 'PATCH',
      headers: {
        'X-Wallet-Address': address.value,
      },
      body: payload,
    })

    toast.add({
      title: 'Campaign Updated',
      description: 'Changes saved successfully.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })

    await refresh()
  } catch (error) {
    toast.add({
      title: 'Update Failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  } finally {
    campaignSubmitting.value = null
  }
}
</script>

<style scoped>
.admin-review-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem 0;
}

.page-header__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-header__breadcrumb {
  display: flex;
  align-items: center;
}

.page-header__breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.page-header__breadcrumb-link:hover {
  color: var(--text-primary);
}

.page-header__breadcrumb-icon {
  width: 1rem;
  height: 1rem;
}

.page-header__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header__text {
  flex: 1;
  min-width: 16rem;
}

.page-header__title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin-bottom: 0.375rem;
}

.page-header__description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 36rem;
}

.page-header__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
}

.page-header__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.page-header__stat {
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 0.5rem 0.75rem;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: left;
}

.page-header__stat-label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.page-header__stat-value {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .page-header__actions {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: auto;
    gap: 0.75rem;
  }

  .page-header__stats {
    justify-content: flex-end;
    width: auto;
  }

  .page-header__stat {
    text-align: right;
  }
}

.page-main {
  padding: 1.5rem 0 3rem;
}

.page-main__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .page-main__layout {
    grid-template-columns: minmax(0, 1fr) 20rem;
    gap: 2rem;
  }
}

@media (min-width: 1280px) {
  .page-main__layout {
    grid-template-columns: minmax(0, 1fr) 22rem;
    gap: 2.5rem;
  }
}

.page-main__sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .page-main__sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: calc(var(--header-total-height, 64px) + 1rem);
  }
}

.admin-review-banner {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  border: 1px solid color-mix(in oklch, var(--color-warning-500) 30%, transparent);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
}

.btn--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--surface-hover);
}

.admin-review-banner--info {
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  border-color: color-mix(in oklch, var(--interactive-primary) 30%, transparent);
}

.admin-review-banner--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  border-color: color-mix(in oklch, var(--color-error-500) 30%, transparent);
}

.admin-review-banner__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-review-banner__text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.admin-review-banner__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: inherit;
}

.admin-review__stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.admin-review__stat-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-review__stat-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--interactive-primary) 14%, transparent);
  color: var(--interactive-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-review__stat-icon--featured {
  background-color: color-mix(in oklch, var(--color-warning-500) 16%, transparent);
  color: var(--color-warning-600);
}

.admin-review__stat-icon--verified {
  background-color: color-mix(in oklch, var(--color-success-500) 16%, transparent);
  color: var(--color-success-600);
}

.admin-review__stat-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin: 0 0 0.125rem;
}

.admin-review__stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.admin-review__state {
  margin-top: 1.5rem;
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-primary);
  background-color: var(--surface-secondary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.admin-review__state--error {
  border-color: color-mix(in oklch, var(--color-error-500) 30%, transparent);
  color: var(--text-primary);
}

.admin-review__empty {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.admin-review__empty h3 {
  margin: 0 0 0.25rem;
  color: var(--text-primary);
}

.admin-review__list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.admin-review__card {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-review__card-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.admin-review__title {
  margin: 0.5rem 0 0.25rem;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.admin-review__subtitle {
  margin: 0;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.admin-review__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.admin-review__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

.admin-review__badge--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 18%, transparent);
  color: var(--color-warning-700);
}

.admin-review__badge--success {
  background-color: color-mix(in oklch, var(--color-success-500) 18%, transparent);
  color: var(--color-success-700);
}

.admin-review__badge--info {
  background-color: color-mix(in oklch, var(--interactive-primary) 18%, transparent);
  color: var(--interactive-primary);
}

.admin-review__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.admin-review__toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  align-content: start;
}

.admin-review__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-review__meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.helper-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.helper-card__title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.helper-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.helper-card__list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.helper-card__list-item svg {
  width: 1rem;
  height: 1rem;
  color: var(--color-success-500);
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.admin-review__status-guide {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.admin-review__status-guide p {
  margin: 0.25rem 0 0;
}

.admin-review__support {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.admin-review__support-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--interactive-primary);
}

.admin-review__support h4 {
  margin: 0 0 0.25rem;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.admin-review__support p {
  margin: 0 0 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.admin-review__support-links {
  display: flex;
  gap: 0.75rem;
  font-size: var(--text-xs);
}

.admin-review__support-links a {
  color: var(--interactive-primary);
}

.btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-xs);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
