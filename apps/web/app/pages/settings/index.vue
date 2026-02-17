<template>
  <div class="settings-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header-content">
          <div class="page-header-text">
            <div class="page-header-breadcrumb">
              <NuxtLink
                to="/dashboard"
                class="breadcrumb-link"
              >
                <Icon
                  name="heroicons:arrow-left"
                  class="breadcrumb-icon"
                />
                Dashboard
              </NuxtLink>
            </div>
            <h1 class="page-title">Account Settings</h1>
            <p class="page-description">
              Manage your profile, preferences, and account information.
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-main">
      <div class="container-app">
        <!-- Empty State: Not Connected -->
        <section
          v-if="!isConnected"
          class="settings-empty"
        >
          <div class="settings-empty-card">
            <div class="settings-empty-illustration">
              <Icon
                name="heroicons:wallet"
                class="settings-empty-icon"
              />
            </div>
            <div class="settings-empty-content">
              <h2 class="settings-empty-title">Connect your wallet to access settings</h2>
              <p class="settings-empty-description">
                Your account settings are tied to your wallet address. Connect your wallet to view
                and update your profile.
              </p>
              <button
                type="button"
                class="btn btn-primary"
                @click="openWalletModal"
              >
                <Icon
                  name="heroicons:wallet"
                  class="btn-icon"
                />
                Connect Wallet
              </button>
            </div>
          </div>
        </section>

        <!-- Settings Content (when connected) -->
        <div
          v-else
          class="settings-layout"
        >
          <!-- Sidebar Navigation -->
          <aside class="settings-sidebar">
            <nav class="settings-nav">
              <button
                type="button"
                class="settings-nav-item"
                :class="{ 'settings-nav-item--active': activeSection === 'profile' }"
                @click="activeSection = 'profile'"
              >
                <Icon
                  name="heroicons:user-circle"
                  class="settings-nav-icon"
                />
                Profile
              </button>
              <button
                type="button"
                class="settings-nav-item"
                :class="{ 'settings-nav-item--active': activeSection === 'preferences' }"
                @click="activeSection = 'preferences'"
              >
                <Icon
                  name="heroicons:cog-6-tooth"
                  class="settings-nav-icon"
                />
                Preferences
              </button>
              <button
                type="button"
                class="settings-nav-item"
                :class="{ 'settings-nav-item--active': activeSection === 'account' }"
                @click="activeSection = 'account'"
              >
                <Icon
                  name="heroicons:shield-check"
                  class="settings-nav-icon"
                />
                Account
              </button>
            </nav>

            <!-- Account Summary Card (Sidebar) -->
            <div class="settings-sidebar-card">
              <div class="settings-sidebar-header">
                <div class="settings-sidebar-avatar">
                  <img
                    v-if="user?.avatarUrl"
                    :src="user.avatarUrl"
                    :alt="user.displayName || 'Avatar'"
                    class="settings-avatar-img"
                  />
                  <Icon
                    v-else
                    name="heroicons:user-circle"
                    class="settings-avatar-placeholder"
                  />
                </div>
                <div class="settings-sidebar-info">
                  <p class="settings-sidebar-name">
                    {{ user?.displayName || user?.ensName || 'Anonymous' }}
                  </p>
                  <p class="settings-sidebar-address">{{ trimmedAddress }}</p>
                </div>
              </div>
              <div class="settings-sidebar-stats">
                <div class="settings-sidebar-stat">
                  <span class="settings-sidebar-stat-value">{{ user?.reputationScore ?? 0 }}</span>
                  <span class="settings-sidebar-stat-label">Reputation</span>
                </div>
                <div class="settings-sidebar-stat">
                  <span class="settings-sidebar-stat-value">{{ user?.campaignsCreated ?? 0 }}</span>
                  <span class="settings-sidebar-stat-label">Campaigns</span>
                </div>
                <div class="settings-sidebar-stat">
                  <span class="settings-sidebar-stat-value">{{ user?.pledgesMade ?? 0 }}</span>
                  <span class="settings-sidebar-stat-label">Pledges</span>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Settings Panel -->
          <div class="settings-main">
            <!-- Loading State -->
            <div
              v-if="isLoading"
              class="settings-loading"
            >
              <AppSpinner />
              <span>Loading settings...</span>
            </div>

            <!-- Error State -->
            <div
              v-else-if="fetchError"
              class="settings-error"
            >
              <Icon
                name="heroicons:exclamation-triangle"
                class="settings-error-icon"
              />
              <div>
                <h3 class="settings-error-title">Failed to load settings</h3>
                <p class="settings-error-message">{{ fetchError }}</p>
              </div>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="retryFetch"
              >
                Retry
              </button>
            </div>

            <!-- Settings Form -->
            <form
              v-else
              class="settings-form"
              @submit.prevent="handleSave"
            >
              <!-- Success Alert -->
              <Transition name="fade">
                <div
                  v-if="saveSuccess"
                  class="settings-alert settings-alert--success"
                >
                  <Icon
                    name="heroicons:check-circle"
                    class="settings-alert-icon"
                  />
                  <span>Your settings have been saved successfully.</span>
                </div>
              </Transition>

              <!-- Error Alert -->
              <Transition name="fade">
                <div
                  v-if="saveError"
                  class="settings-alert settings-alert--error"
                >
                  <Icon
                    name="heroicons:exclamation-circle"
                    class="settings-alert-icon"
                  />
                  <span>{{ saveError }}</span>
                  <button
                    type="button"
                    class="settings-alert-dismiss"
                    @click="saveError = null"
                  >
                    <Icon name="heroicons:x-mark" />
                  </button>
                </div>
              </Transition>

              <!-- Profile Section -->
              <section
                v-show="activeSection === 'profile'"
                class="settings-section"
              >
                <div class="settings-section-header">
                  <Icon
                    name="heroicons:user-circle"
                    class="settings-section-icon"
                  />
                  <div>
                    <h2 class="settings-section-title">Profile Information</h2>
                    <p class="settings-section-description">
                      Customize how others see you on Pledgebook.
                    </p>
                  </div>
                </div>

                <div class="settings-section-content">
                  <!-- Wallet Address (Read-only) -->
                  <div class="form-field">
                    <label class="form-field__label">Wallet Address</label>
                    <div class="form-field__readonly">
                      <span class="form-field__readonly-value">{{ address }}</span>
                      <button
                        type="button"
                        class="form-field__copy-btn"
                        :class="{ copied: showCopied }"
                        @click="copyAddress"
                      >
                        <Icon
                          :name="showCopied ? 'heroicons:check' : 'heroicons:clipboard-document'"
                        />
                        {{ showCopied ? 'Copied!' : 'Copy' }}
                      </button>
                    </div>
                    <span class="form-field__hint">
                      Your wallet address is your unique identity on Pledgebook.
                    </span>
                  </div>

                  <!-- ENS Name (Read-only if available) -->
                  <div
                    v-if="user?.ensName"
                    class="form-field"
                  >
                    <label class="form-field__label">ENS Name</label>
                    <div class="form-field__readonly">
                      <span class="form-field__readonly-value form-field__readonly-value--ens">
                        <Icon
                          name="heroicons:globe-alt"
                          class="form-field__ens-icon"
                        />
                        {{ user.ensName }}
                      </span>
                    </div>
                    <span class="form-field__hint">
                      Your ENS name is automatically resolved from the blockchain.
                    </span>
                  </div>

                  <!-- Display Name -->
                  <div class="form-field">
                    <div class="form-field__header">
                      <label
                        for="displayName"
                        class="form-field__label"
                      >
                        Display Name
                        <span class="form-field__optional">(optional)</span>
                      </label>
                    </div>
                    <input
                      id="displayName"
                      v-model="form.displayName"
                      type="text"
                      class="form-field__input"
                      :class="{ 'form-field__input--error': validationErrors.displayName }"
                      placeholder="Enter a display name"
                      maxlength="50"
                      @blur="validateField('displayName')"
                    />
                    <div class="form-field__footer">
                      <span
                        v-if="validationErrors.displayName"
                        class="form-field__error"
                      >
                        <Icon
                          name="heroicons:exclamation-circle"
                          class="form-field__error-icon"
                        />
                        {{ validationErrors.displayName }}
                      </span>
                      <span
                        v-else
                        class="form-field__hint"
                      >
                        This name will be displayed instead of your wallet address.
                      </span>
                      <span class="form-field__counter">{{ form.displayName.length }}/50</span>
                    </div>
                  </div>

                  <!-- Avatar URL -->
                  <div class="form-field">
                    <div class="form-field__header">
                      <label
                        for="avatarUrl"
                        class="form-field__label"
                      >
                        Avatar URL
                        <span class="form-field__optional">(optional)</span>
                      </label>
                    </div>
                    <div class="form-field__with-preview">
                      <div class="form-field__input-wrapper">
                        <input
                          id="avatarUrl"
                          v-model="form.avatarUrl"
                          type="url"
                          class="form-field__input"
                          :class="{ 'form-field__input--error': validationErrors.avatarUrl }"
                          placeholder="https://example.com/avatar.jpg"
                          maxlength="500"
                          @blur="validateField('avatarUrl')"
                        />
                      </div>
                      <div class="form-field__preview">
                        <img
                          v-if="form.avatarUrl && !validationErrors.avatarUrl"
                          :src="form.avatarUrl"
                          alt="Avatar preview"
                          class="form-field__preview-img"
                          @error="handleAvatarError"
                        />
                        <Icon
                          v-else
                          name="heroicons:photo"
                          class="form-field__preview-placeholder"
                        />
                      </div>
                    </div>
                    <div class="form-field__footer">
                      <span
                        v-if="validationErrors.avatarUrl"
                        class="form-field__error"
                      >
                        <Icon
                          name="heroicons:exclamation-circle"
                          class="form-field__error-icon"
                        />
                        {{ validationErrors.avatarUrl }}
                      </span>
                      <span
                        v-else
                        class="form-field__hint"
                      >
                        Provide a URL to your profile picture. Supports JPG, PNG, GIF, and WebP.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Preferences Section -->
              <section
                v-show="activeSection === 'preferences'"
                class="settings-section"
              >
                <div class="settings-section-header">
                  <Icon
                    name="heroicons:cog-6-tooth"
                    class="settings-section-icon"
                  />
                  <div>
                    <h2 class="settings-section-title">Preferences</h2>
                    <p class="settings-section-description">
                      Control how Pledgebook works for you.
                    </p>
                  </div>
                </div>

                <div class="settings-section-content">
                  <!-- Notifications Toggle -->
                  <div class="settings-toggle-field">
                    <div class="settings-toggle-content">
                      <div class="settings-toggle-icon-wrapper settings-toggle-icon-wrapper--info">
                        <Icon
                          name="heroicons:bell"
                          class="settings-toggle-icon"
                        />
                      </div>
                      <div class="settings-toggle-text">
                        <label
                          for="notifications"
                          class="settings-toggle-label"
                        >
                          Email Notifications
                        </label>
                        <p class="settings-toggle-description">
                          Receive email updates about your campaigns, pledges, and account activity.
                        </p>
                      </div>
                    </div>
                    <label class="settings-switch">
                      <input
                        id="notifications"
                        v-model="form.notifications"
                        type="checkbox"
                        class="settings-switch-input"
                      />
                      <span class="settings-switch-slider"></span>
                    </label>
                  </div>

                  <!-- Privacy Mode Toggle -->
                  <div class="settings-toggle-field">
                    <div class="settings-toggle-content">
                      <div
                        class="settings-toggle-icon-wrapper settings-toggle-icon-wrapper--warning"
                      >
                        <Icon
                          name="heroicons:eye-slash"
                          class="settings-toggle-icon"
                        />
                      </div>
                      <div class="settings-toggle-text">
                        <label
                          for="privacyMode"
                          class="settings-toggle-label"
                        >
                          Privacy Mode
                        </label>
                        <p class="settings-toggle-description">
                          Hide your display name and avatar from public profiles. Your activity will
                          still be visible, but personal details will be hidden.
                        </p>
                      </div>
                    </div>
                    <label class="settings-switch">
                      <input
                        id="privacyMode"
                        v-model="form.privacyMode"
                        type="checkbox"
                        class="settings-switch-input"
                      />
                      <span class="settings-switch-slider"></span>
                    </label>
                  </div>
                </div>
              </section>

              <!-- Account Section -->
              <section
                v-show="activeSection === 'account'"
                class="settings-section"
              >
                <div class="settings-section-header">
                  <Icon
                    name="heroicons:shield-check"
                    class="settings-section-icon"
                  />
                  <div>
                    <h2 class="settings-section-title">Account Information</h2>
                    <p class="settings-section-description">
                      View your account details and statistics.
                    </p>
                  </div>
                </div>

                <div class="settings-section-content">
                  <!-- Account Stats Grid -->
                  <div class="settings-stats-grid">
                    <div class="settings-stat-card">
                      <div class="settings-stat-icon settings-stat-icon--primary">
                        <Icon name="heroicons:sparkles" />
                      </div>
                      <div class="settings-stat-content">
                        <span class="settings-stat-label">Reputation Score</span>
                        <span class="settings-stat-value">{{ user?.reputationScore ?? 0 }}</span>
                        <span class="settings-stat-hint">Built from verified outcomes</span>
                      </div>
                    </div>

                    <div class="settings-stat-card">
                      <div class="settings-stat-icon settings-stat-icon--success">
                        <Icon name="heroicons:flag" />
                      </div>
                      <div class="settings-stat-content">
                        <span class="settings-stat-label">Campaigns Created</span>
                        <span class="settings-stat-value">{{ user?.campaignsCreated ?? 0 }}</span>
                        <span class="settings-stat-hint">Total campaigns you've launched</span>
                      </div>
                    </div>

                    <div class="settings-stat-card">
                      <div class="settings-stat-icon settings-stat-icon--info">
                        <Icon name="heroicons:banknotes" />
                      </div>
                      <div class="settings-stat-content">
                        <span class="settings-stat-label">Pledges Made</span>
                        <span class="settings-stat-value">{{ user?.pledgesMade ?? 0 }}</span>
                        <span class="settings-stat-hint">Times you've supported others</span>
                      </div>
                    </div>

                    <div class="settings-stat-card">
                      <div class="settings-stat-icon settings-stat-icon--accent">
                        <Icon name="heroicons:currency-dollar" />
                      </div>
                      <div class="settings-stat-content">
                        <span class="settings-stat-label">Total Pledged</span>
                        <span class="settings-stat-value settings-stat-value--mono">
                          {{ formatTotalPledged(user?.totalPledged) }}
                        </span>
                        <span class="settings-stat-hint">Total amount contributed</span>
                      </div>
                    </div>
                  </div>

                  <!-- Account Details -->
                  <div class="settings-account-details">
                    <h3 class="settings-account-details-title">Account Details</h3>
                    <dl class="settings-account-list">
                      <div class="settings-account-item">
                        <dt>Account Status</dt>
                        <dd>
                          <span
                            class="status-badge"
                            :class="{
                              'status-badge--success': user?.isActive && !user?.isBanned,
                              'status-badge--error': user?.isBanned,
                              'status-badge--warning': !user?.isActive,
                            }"
                          >
                            {{ user?.isBanned ? 'Banned' : user?.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </dd>
                      </div>
                      <div class="settings-account-item">
                        <dt>Role</dt>
                        <dd>
                          <span class="role-badge">
                            {{ capitalize(user?.role ?? 'user') }}
                          </span>
                        </dd>
                      </div>
                      <div class="settings-account-item">
                        <dt>Member Since</dt>
                        <dd>{{ user?.createdAt ? formatDate(user.createdAt) : '—' }}</dd>
                      </div>
                      <div class="settings-account-item">
                        <dt>Last Login</dt>
                        <dd>{{ user?.lastLoginAt ? formatDate(user.lastLoginAt) : '—' }}</dd>
                      </div>
                      <div class="settings-account-item">
                        <dt>Last Active</dt>
                        <dd>{{ user?.lastActiveAt ? formatDate(user.lastActiveAt) : '—' }}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <!-- Form Actions -->
              <div class="settings-actions">
                <div class="settings-actions-left">
                  <Transition name="fade">
                    <span
                      v-if="isDirty"
                      class="settings-actions-hint"
                    >
                      <Icon
                        name="heroicons:exclamation-circle"
                        class="settings-actions-hint-icon"
                      />
                      You have unsaved changes
                    </span>
                  </Transition>
                </div>
                <div class="settings-actions-right">
                  <button
                    type="button"
                    class="btn btn-ghost"
                    :disabled="!isDirty || isSaving"
                    @click="resetForm"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="!canSave"
                  >
                    <AppSpinner
                      v-if="isSaving"
                      size="sm"
                      class="btn-spinner"
                    />
                    <Icon
                      v-else
                      name="heroicons:check"
                      class="btn-icon"
                    />
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { capitalize, formatDate } from '~/utils/formatters'

// =============================================================================
// SEO META
// =============================================================================
useSeoMeta({
  title: 'Account Settings - Pledgebook',
  description: 'Manage your Pledgebook profile, preferences, and account information.',
})

// =============================================================================
// COMPOSABLES
// =============================================================================
const { isConnected, address, trimmedAddress } = useWallet()

const {
  form,
  user,
  isLoading,
  isSaving,
  isFetched,
  fetchError,
  saveError,
  saveSuccess,
  validationErrors,
  isDirty,
  canSave,
  fetchUser,
  saveSettings,
  resetForm,
  validateField,
} = useUserSettings()

// =============================================================================
// STATE
// =============================================================================
const activeSection = ref<'profile' | 'preferences' | 'account'>('profile')
const showCopied = ref(false)

// =============================================================================
// METHODS
// =============================================================================

/**
 * Open wallet connect modal
 */
function openWalletModal() {
  window.dispatchEvent(new CustomEvent('open-wallet-modal'))
}

/**
 * Copy wallet address to clipboard
 */
async function copyAddress() {
  if (!address.value) return
  try {
    await navigator.clipboard.writeText(address.value)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (error) {
    if (import.meta.dev) console.error('Failed to copy address:', error)
  }
}

/**
 * Handle form submission
 */
async function handleSave() {
  if (!address.value) return
  await saveSettings(address.value)
}

/**
 * Retry fetching user data
 */
function retryFetch() {
  if (address.value) {
    fetchUser(address.value)
  }
}

/**
 * Handle avatar image load error
 */
function handleAvatarError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

/**
 * Format total pledged amount
 */
function formatTotalPledged(value: string | undefined): string {
  if (!value || value === '0') return '0'
  const num = Number(value)
  if (num >= 1e18) return `${(num / 1e18).toFixed(2)} ETH`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toLocaleString()
}

// =============================================================================
// WATCHERS
// =============================================================================

// Fetch user data when wallet connects
watch(
  [isConnected, address],
  ([connected, addr]) => {
    if (connected && addr && !isFetched.value) {
      fetchUser(addr)
    }
  },
  { immediate: true },
)

// =============================================================================
// LIFECYCLE
// =============================================================================
onMounted(() => {
  if (isConnected.value && address.value) {
    fetchUser(address.value)
  }
})
</script>

<style scoped>
/* =============================================================================
   SETTINGS PAGE STYLES
   Follows established patterns from dashboard and campaigns pages
   ============================================================================= */

.settings-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* =============================================================================
   PAGE HEADER
   ============================================================================= */

.page-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 2rem 0;
}

.page-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-header-breadcrumb {
  margin-bottom: 0.5rem;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumb-link:hover {
  color: var(--interactive-primary);
}

.breadcrumb-icon {
  width: 1rem;
  height: 1rem;
}

.page-title {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.page-description {
  margin: 0.375rem 0 0;
  font-size: var(--text-base);
  color: var(--text-secondary);
}

/* =============================================================================
   MAIN CONTENT
   ============================================================================= */

.page-main {
  padding: 2rem 0 3rem;
}

/* =============================================================================
   EMPTY STATE
   ============================================================================= */

.settings-empty {
  padding: 2rem 0;
}

.settings-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem 2rem;
  border-radius: var(--radius-xl);
  border: 1px dashed var(--border-primary);
  background-color: var(--surface-primary);
  text-align: center;
}

@media (min-width: 768px) {
  .settings-empty-card {
    flex-direction: row;
    text-align: left;
    padding: 3rem;
  }
}

.settings-empty-illustration {
  width: 5rem;
  height: 5rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--interactive-primary) 15%, transparent),
    color-mix(in oklch, var(--interactive-primary) 8%, transparent)
  );
  flex-shrink: 0;
}

.settings-empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--interactive-primary);
}

.settings-empty-content {
  flex: 1;
}

.settings-empty-title {
  margin: 0 0 0.5rem;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.settings-empty-description {
  margin: 0 0 1.5rem;
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 32rem;
}

/* =============================================================================
   SETTINGS LAYOUT
   ============================================================================= */

.settings-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .settings-layout {
    grid-template-columns: 280px 1fr;
  }
}

/* =============================================================================
   SIDEBAR
   ============================================================================= */

.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .settings-sidebar {
    position: sticky;
    top: calc(var(--header-total-height) + 1.5rem);
    align-self: start;
  }
}

.settings-nav {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  padding: 0.375rem;
  border-radius: var(--radius-xl);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
}

@media (min-width: 1024px) {
  .settings-nav {
    flex-direction: column;
    padding: 0.5rem;
  }
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
  justify-content: center;
}

@media (min-width: 1024px) {
  .settings-nav-item {
    flex: initial;
    justify-content: flex-start;
  }
}

.settings-nav-item:hover {
  background-color: var(--surface-hover);
  color: var(--text-primary);
}

.settings-nav-item--active {
  background-color: var(--interactive-primary);
  color: white;
}

.settings-nav-item--active:hover {
  background-color: var(--interactive-primary-hover);
  color: white;
}

.settings-nav-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

/* Sidebar Card */
.settings-sidebar-card {
  padding: 1.25rem;
  border-radius: var(--radius-xl);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  display: none;
}

@media (min-width: 1024px) {
  .settings-sidebar-card {
    display: block;
  }
}

.settings-sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-secondary);
  margin-bottom: 1rem;
}

.settings-sidebar-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-full);
  overflow: hidden;
  background-color: var(--surface-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings-avatar-placeholder {
  width: 2rem;
  height: 2rem;
  color: var(--text-tertiary);
}

.settings-sidebar-info {
  min-width: 0;
}

.settings-sidebar-name {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-sidebar-address {
  margin: 0.125rem 0 0;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-tertiary);
}

.settings-sidebar-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.settings-sidebar-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.5rem;
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
}

.settings-sidebar-stat-value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.settings-sidebar-stat-label {
  font-size: var(--text-2xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* =============================================================================
   MAIN SETTINGS PANEL
   ============================================================================= */

.settings-main {
  min-width: 0;
}

/* Loading State */
.settings-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  border-radius: var(--radius-xl);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

/* Error State */
.settings-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  border-radius: var(--radius-xl);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  text-align: center;
}

.settings-error-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-error-500);
}

.settings-error-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.settings-error-message {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* =============================================================================
   FORM & SECTIONS
   ============================================================================= */

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
}

.settings-section-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-secondary);
  margin-bottom: 1.5rem;
}

.settings-section-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--interactive-primary);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.settings-section-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.settings-section-description {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.settings-section-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* =============================================================================
   ALERTS
   ============================================================================= */

.settings-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.settings-alert--success {
  background-color: color-mix(in oklch, var(--color-success-500) 10%, transparent);
  color: var(--color-success-600);
  border: 1px solid color-mix(in oklch, var(--color-success-500) 25%, transparent);
}

.settings-alert--error {
  background-color: color-mix(in oklch, var(--color-error-500) 10%, transparent);
  color: var(--color-error-600);
  border: 1px solid color-mix(in oklch, var(--color-error-500) 25%, transparent);
}

.settings-alert-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.settings-alert-dismiss {
  margin-left: auto;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.settings-alert-dismiss:hover {
  opacity: 1;
}

.settings-alert-dismiss svg {
  width: 1rem;
  height: 1rem;
}

/* =============================================================================
   FORM FIELDS
   ============================================================================= */

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-field__label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-field__optional {
  font-weight: var(--font-weight-normal);
  color: var(--text-tertiary);
}

.form-field__input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.form-field__input::placeholder {
  color: var(--text-muted);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--interactive-primary) 15%, transparent);
}

.form-field__input--error {
  border-color: var(--color-error-500);
}

.form-field__input--error:focus {
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-error-500) 15%, transparent);
}

.form-field__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.form-field__hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.form-field__error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-xs);
  color: var(--color-error-600);
}

.form-field__error-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.form-field__counter {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* Read-only field */
.form-field__readonly {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
}

.form-field__readonly-value {
  flex: 1;
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  word-break: break-all;
}

.form-field__readonly-value--ens {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-sans);
  color: var(--interactive-primary);
}

.form-field__ens-icon {
  width: 1rem;
  height: 1rem;
}

.form-field__copy-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--surface-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.form-field__copy-btn:hover {
  background-color: var(--surface-hover);
  color: var(--text-primary);
}

.form-field__copy-btn.copied {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.form-field__copy-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Avatar preview field */
.form-field__with-preview {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.form-field__input-wrapper {
  flex: 1;
}

.form-field__preview {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-field__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-field__preview-placeholder {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-muted);
}

/* =============================================================================
   TOGGLE FIELDS
   ============================================================================= */

.settings-toggle-field {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
}

.settings-toggle-content {
  display: flex;
  gap: 0.875rem;
  flex: 1;
}

.settings-toggle-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-toggle-icon-wrapper--info {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.settings-toggle-icon-wrapper--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.settings-toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.settings-toggle-text {
  flex: 1;
}

.settings-toggle-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  cursor: pointer;
}

.settings-toggle-description {
  margin: 0.25rem 0 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Switch Toggle */
.settings-switch {
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.settings-switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.settings-switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.settings-switch-slider::before {
  content: '';
  position: absolute;
  height: 1rem;
  width: 1rem;
  left: 0.1875rem;
  bottom: 0.1875rem;
  background-color: var(--text-tertiary);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.settings-switch-input:checked + .settings-switch-slider {
  background-color: var(--interactive-primary);
  border-color: var(--interactive-primary);
}

.settings-switch-input:checked + .settings-switch-slider::before {
  background-color: white;
  transform: translateX(1.25rem);
}

.settings-switch-input:focus + .settings-switch-slider {
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--interactive-primary) 15%, transparent);
}

/* =============================================================================
   STATS GRID
   ============================================================================= */

.settings-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.settings-stat-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
}

.settings-stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-stat-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.settings-stat-icon--primary {
  background-color: color-mix(in oklch, var(--interactive-primary) 15%, transparent);
  color: var(--interactive-primary);
}

.settings-stat-icon--success {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.settings-stat-icon--info {
  background-color: color-mix(in oklch, var(--color-accent-500) 15%, transparent);
  color: var(--color-accent-600);
}

.settings-stat-icon--accent {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

.settings-stat-content {
  flex: 1;
  min-width: 0;
}

.settings-stat-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.settings-stat-value {
  display: block;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0.125rem 0;
}

.settings-stat-value--mono {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
}

.settings-stat-hint {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* =============================================================================
   ACCOUNT DETAILS
   ============================================================================= */

.settings-account-details {
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-secondary);
}

.settings-account-details-title {
  margin: 0 0 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.settings-account-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.settings-account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--border-secondary);
}

.settings-account-item:last-child {
  border-bottom: none;
}

.settings-account-item dt {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.settings-account-item dd {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: capitalize;
}

.status-badge--success {
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  color: var(--color-success-600);
}

.status-badge--error {
  background-color: color-mix(in oklch, var(--color-error-500) 15%, transparent);
  color: var(--color-error-600);
}

.status-badge--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 15%, transparent);
  color: var(--color-warning-600);
}

/* Role Badge */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

/* =============================================================================
   FORM ACTIONS
   ============================================================================= */

.settings-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-xl);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  position: sticky;
  bottom: 1rem;
  box-shadow: var(--shadow-md);
}

.settings-actions-left {
  flex: 1;
}

.settings-actions-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  color: var(--color-warning-600);
}

.settings-actions-hint-icon {
  width: 1rem;
  height: 1rem;
}

.settings-actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-spinner {
  margin-right: 0.375rem;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* =============================================================================
   TRANSITIONS
   ============================================================================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
