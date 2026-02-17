<template>
  <div class="create-campaign-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/campaigns"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Campaigns
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div class="page-header__text">
              <h1 class="page-header__title">Create Campaign</h1>
              <p class="page-header__description">
                Build a verifiable, SMART-goal campaign that donors can trust. Our AI-powered
                consensus ensures transparent outcomes.
              </p>
            </div>
            <div class="page-header__progress">
              <div class="progress-ring">
                <svg
                  viewBox="0 0 36 36"
                  class="progress-ring__svg"
                >
                  <path
                    class="progress-ring__bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="progress-ring__fill"
                    :stroke-dasharray="`${campaignStore.formProgress}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="progress-ring__text">{{ campaignStore.formProgress }}%</span>
              </div>
              <span class="progress-ring__label">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Wallet Connection Banner -->
    <Transition name="slide-down">
      <div
        v-if="!isConnected"
        class="wallet-banner"
      >
        <div class="container-app">
          <div class="wallet-banner__content">
            <div class="wallet-banner__text">
              <Icon
                name="heroicons:exclamation-triangle"
                class="wallet-banner__icon"
              />
              <span>Connect your wallet to create and submit a campaign</span>
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
      </div>
    </Transition>

    <!-- Main Content -->
    <main class="page-main">
      <div class="container-app">
        <div class="page-main__layout">
          <!-- Form Column -->
          <div class="page-main__form">
            <CampaignForm
              @submit="handleSubmit"
              @save-draft="handleSaveDraft"
            />
          </div>

          <!-- Helper Column -->
          <aside class="page-main__sidebar">
            <!-- Security Check -->
            <div class="helper-card">
              <h3 class="helper-card__title">Security Check</h3>
              <p class="helper-card__description">
                Verify you're human to protect campaign submissions and uploads.
              </p>
              <TurnstileWidget
                ref="turnstileRef"
                action="campaign_submit"
                @verified="handleTurnstileVerified"
                @expired="handleTurnstileExpired"
                @error="handleTurnstileError"
              />
            </div>

            <!-- How It Works -->
            <div class="helper-card">
              <h3 class="helper-card__title">How Verification Works</h3>
              <div class="helper-card__steps">
                <div class="helper-step">
                  <div class="helper-step__number">1</div>
                  <div class="helper-step__content">
                    <h4>Submit Campaign</h4>
                    <p>Your prompt is hashed (keccak256) and stored on IPFS for immutability</p>
                  </div>
                </div>
                <div class="helper-step">
                  <div class="helper-step__number">2</div>
                  <div class="helper-step__content">
                    <h4>Baseline Captured</h4>
                    <p>CRE captures initial data from your sources (APIs, images) at approval</p>
                  </div>
                </div>
                <div class="helper-step">
                  <div class="helper-step__number">3</div>
                  <div class="helper-step__content">
                    <h4>AI Consensus</h4>
                    <p>Multiple AI providers (Claude, Gemini, Grok) vote on outcomes</p>
                  </div>
                </div>
                <div class="helper-step">
                  <div class="helper-step__number">4</div>
                  <div class="helper-step__content">
                    <h4>Funds Released</h4>
                    <p>≥66% TRUE consensus triggers automatic fund distribution</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- SMART Goals Tips -->
            <div class="helper-card">
              <h3 class="helper-card__title">SMART Goal Tips</h3>
              <ul class="helper-card__list">
                <li class="helper-card__list-item helper-card__list-item--success">
                  <Icon name="heroicons:check-circle" />
                  <span>Use specific, measurable targets (e.g., "lose 50 lbs")</span>
                </li>
                <li class="helper-card__list-item helper-card__list-item--success">
                  <Icon name="heroicons:check-circle" />
                  <span>Include verifiable data sources (APIs, documents)</span>
                </li>
                <li class="helper-card__list-item helper-card__list-item--success">
                  <Icon name="heroicons:check-circle" />
                  <span>Set realistic, time-bound deadlines</span>
                </li>
                <li class="helper-card__list-item helper-card__list-item--error">
                  <Icon name="heroicons:x-circle" />
                  <span>Avoid vague goals like "make the world better"</span>
                </li>
                <li class="helper-card__list-item helper-card__list-item--error">
                  <Icon name="heroicons:x-circle" />
                  <span>Don't use subjective or unprovable claims</span>
                </li>
              </ul>
            </div>

            <!-- Data Source Examples -->
            <div class="helper-card">
              <h3 class="helper-card__title">Data Source Examples</h3>
              <div class="helper-card__examples">
                <div class="helper-example">
                  <div class="helper-example__header">
                    <Icon name="heroicons:globe-alt" />
                    <span>Public API</span>
                  </div>
                  <p>FBI UCR, Census data, public statistics - no auth needed</p>
                </div>
                <div class="helper-example">
                  <div class="helper-example__header">
                    <Icon name="heroicons:lock-closed" />
                    <span>Private API (DECO/ZKP)</span>
                  </div>
                  <p>Fitbit, Strava, bank APIs - keys encrypted, ZKP verification</p>
                </div>
                <div class="helper-example">
                  <div class="helper-example__header">
                    <Icon name="heroicons:photo" />
                    <span>Image OCR</span>
                  </div>
                  <p>Scale photos, receipts, documents - AI extracts values</p>
                </div>
              </div>
            </div>

            <!-- Need Help -->
            <div class="helper-card helper-card--support">
              <div class="helper-support">
                <Icon
                  name="heroicons:question-mark-circle"
                  class="helper-support__icon"
                />
                <div class="helper-support__content">
                  <h4>Need Help?</h4>
                  <p>Check our documentation or reach out to the community</p>
                  <div class="helper-support__links">
                    <NuxtLink to="/docs/campaigns">Documentation</NuxtLink>
                    <NuxtLink to="/community">Community</NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <!-- Success Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSuccessModal"
          class="success-overlay"
        >
          <div class="success-modal">
            <div class="success-modal__icon">
              <Icon name="heroicons:check-circle" />
            </div>
            <h2 class="success-modal__title">Campaign Submitted!</h2>
            <p class="success-modal__description">
              Your campaign has been submitted for review. You'll receive a notification once it's
              approved and the baseline data has been captured.
            </p>
            <div class="success-modal__details">
              <div class="success-modal__detail">
                <span>Campaign ID</span>
                <code>{{ submittedCampaign?.id?.slice(0, 8) }}...</code>
              </div>
              <div class="success-modal__detail">
                <span>Prompt Hash</span>
                <code>{{ submittedCampaign?.promptHash?.slice(0, 16) }}...</code>
              </div>
              <div class="success-modal__detail">
                <span>Status</span>
                <span class="success-modal__badge">Pending Review</span>
              </div>
            </div>
            <div class="success-modal__actions">
              <NuxtLink
                :to="`/@${submittedCampaign?.slug || submittedCampaign?.id}`"
                class="btn btn--primary"
              >
                View Campaign
              </NuxtLink>
              <button
                type="button"
                class="btn btn--secondary"
                @click="handleCreateAnother"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import CampaignForm from '../../components/forms/CampaignForm.vue'
import TurnstileWidget from '../../components/common/TurnstileWidget.vue'

// =============================================================================
// PAGE META
// =============================================================================

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Create Campaign - Pledgebook',
  description:
    'Create a verifiable, SMART-goal campaign on Pledgebook. Define your goals, set AI verification criteria, and start receiving pledges.',
})

// =============================================================================
// COMPOSABLES & STORES
// =============================================================================

const { isConnected, address } = useWallet()
const campaignStore = useCampaignStore()
const toast = useToast()
const _router = useRouter()
const { token: turnstileToken, setToken, clearToken } = useTurnstileToken()

// =============================================================================
// STATE
// =============================================================================

const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const submittedCampaign = ref<{
  id: string
  slug?: string
  promptHash: string
} | null>(null)

// =============================================================================
// METHODS
// =============================================================================

function handleConnectWallet(): void {
  // Emit to parent/layout to open wallet modal
  // This is handled by the layout component
  const event = new CustomEvent('open-wallet-modal')
  window.dispatchEvent(event)
}

function handleTurnstileVerified(token: string): void {
  setToken(token)
}

function handleTurnstileExpired(): void {
  clearToken()
  toast.add({
    title: 'Verification Expired',
    description: 'Please complete the Turnstile check again.',
    icon: 'i-heroicons-exclamation-triangle',
    color: 'warning',
  })
}

function handleTurnstileError(message: string): void {
  toast.add({
    title: 'Verification Error',
    description: message,
    icon: 'i-heroicons-exclamation-circle',
    color: 'error',
  })
}

async function handleSubmit(
  data: ReturnType<typeof campaignStore.getSubmissionData>,
): Promise<void> {
  if (!isConnected.value || !address.value) {
    toast.add({
      title: 'Wallet Required',
      description: 'Please connect your wallet to submit a campaign.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning',
    })
    return
  }

  if (!turnstileToken.value) {
    toast.add({
      title: 'Verification Required',
      description: 'Please complete the Turnstile check before submitting.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning',
    })
    return
  }

  isSubmitting.value = true

  try {
    // Submit to API
    const response = await $fetch<{
      success: boolean
      data?: {
        id: string
        slug: string
        promptHash: string
      }
      error?: { message: string }
    }>('/api/campaigns/create', {
      method: 'POST',
      headers: {
        'X-Wallet-Address': address.value,
        'x-turnstile-token': turnstileToken.value,
      },
      body: data,
    })

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create campaign')
    }

    // Success!
    submittedCampaign.value = response.data || null
    showSuccessModal.value = true

    // Clear draft
    campaignStore.clearDraft()
    clearToken()
    turnstileRef.value?.reset()

    toast.add({
      title: 'Campaign Submitted',
      description: 'Your campaign is now pending review.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })
  } catch (error) {
    if (import.meta.dev) console.error('Failed to submit campaign:', error)
    toast.add({
      title: 'Submission Failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

function handleSaveDraft(): void {
  // Draft is auto-saved by the store, feedback is provided via UI state
}

function handleCreateAnother(): void {
  showSuccessModal.value = false
  submittedCampaign.value = null
  campaignStore.clearDraft()
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// =============================================================================
// UNSAVED CHANGES WARNING
// =============================================================================

function handleBeforeUnload(event: BeforeUnloadEvent): void {
  if (campaignStore.draft.isDirty && !showSuccessModal.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
/* =============================================================================
   CREATE CAMPAIGN PAGE STYLES
   ============================================================================= */

.create-campaign-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* -----------------------------------------------------------------------------
   Page Header
   ----------------------------------------------------------------------------- */

.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1.5rem 0;
}

.page-header__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  align-items: flex-start;
  gap: 1.5rem;
}

.page-header__text {
  flex: 1;
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

/* Progress Ring */
.page-header__progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.progress-ring {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
}

.progress-ring__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring__bg {
  fill: none;
  stroke: var(--border-primary);
  stroke-width: 3;
}

.progress-ring__fill {
  fill: none;
  stroke: var(--interactive-primary);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-ring__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.progress-ring__label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* -----------------------------------------------------------------------------
   Wallet Banner
   ----------------------------------------------------------------------------- */

.wallet-banner {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  border-bottom: 1px solid color-mix(in oklch, var(--color-warning-500) 30%, transparent);
  padding: 0.75rem 0;
}

.wallet-banner__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.wallet-banner__text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.wallet-banner__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-warning-600);
}

/* -----------------------------------------------------------------------------
   Main Content
   ----------------------------------------------------------------------------- */

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

.page-main__form {
  min-width: 0;
}

/* -----------------------------------------------------------------------------
   Sidebar / Helper Cards
   ----------------------------------------------------------------------------- */

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

/* Helper Steps */
.helper-card__steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.helper-step {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
}

.helper-step__number {
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.helper-step__content h4 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.helper-step__content p {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
}

/* Helper List */
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
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.helper-card__list-item--success svg {
  color: var(--color-success-500);
}

.helper-card__list-item--error svg {
  color: var(--color-error-500);
}

/* Helper Examples */
.helper-card__examples {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.helper-example {
  padding: 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.helper-example__header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.helper-example__header svg {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--interactive-primary);
}

.helper-example p {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
}

/* Helper Support */
.helper-card--support {
  background: linear-gradient(135deg, var(--surface-secondary) 0%, var(--bg-primary) 100%);
}

.helper-support {
  display: flex;
  gap: 0.75rem;
}

.helper-support__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--interactive-primary);
  flex-shrink: 0;
}

.helper-support__content h4 {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.helper-support__content p {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.helper-support__links {
  display: flex;
  gap: 0.75rem;
}

.helper-support__links a {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--interactive-primary);
}

.helper-support__links a:hover {
  text-decoration: underline;
}

/* -----------------------------------------------------------------------------
   Success Modal
   ----------------------------------------------------------------------------- */

.success-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.success-modal {
  width: 100%;
  max-width: 28rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.success-modal__icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  border-radius: var(--radius-full);
}

.success-modal__icon svg {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-success-500);
}

.success-modal__title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.success-modal__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: var(--leading-relaxed);
}

.success-modal__details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.success-modal__detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.success-modal__detail > span:first-child {
  color: var(--text-secondary);
}

.success-modal__detail code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-primary);
}

.success-modal__badge {
  padding: 0.25rem 0.5rem;
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-warning-600);
}

.success-modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

/* -----------------------------------------------------------------------------
   Buttons (copied from campaign-form.css for consistency)
   ----------------------------------------------------------------------------- */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn svg {
  width: 1rem;
  height: 1rem;
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

.btn--sm {
  padding: 0.5rem 0.75rem;
  font-size: var(--text-xs);
}

/* -----------------------------------------------------------------------------
   Transitions
   ----------------------------------------------------------------------------- */

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
