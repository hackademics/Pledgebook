<template>
  <header
    class="header-sticky"
    :class="{ 'header-blur': blur }"
  >
    <!-- Top Row: Logo, Search, Actions -->
    <div class="header-top">
      <div class="container-app">
        <div class="header-top-inner">
          <!-- Logo -->
          <div class="header-logo">
            <NuxtLink
              to="/"
              class="logo-link"
              aria-label="Pledgebook Home"
            >
              <div class="logo-icon">
                <Icon
                  name="heroicons:book-open"
                  class="logo-icon-svg"
                />
              </div>
              <span class="logo-text">Pledgebook</span>
            </NuxtLink>
          </div>

          <!-- Search (Desktop) -->
          <div class="header-search">
            <div class="search-container">
              <Icon
                name="heroicons:magnifying-glass"
                class="search-icon"
              />
              <input
                v-model="searchQuery"
                type="text"
                class="input-search"
                :placeholder="searchPlaceholder"
                @focus="handleSearchFocus"
                @blur="handleSearchBlur"
                @input="handleSearchInput"
              />
              <kbd
                v-if="!searchQuery && !searchFocused"
                class="search-shortcut"
              >
                /
              </kbd>
              <button
                v-if="searchQuery"
                type="button"
                class="search-clear"
                aria-label="Clear search"
                @click="clearSearch"
              >
                <Icon
                  name="heroicons:x-mark"
                  class="search-clear-icon"
                />
              </button>
            </div>

            <!-- Search Dropdown -->
            <Transition name="fade">
              <div
                v-if="showSearchDropdown"
                class="search-dropdown"
              >
                <div
                  v-if="searchLoading"
                  class="search-loading"
                >
                  <AppSpinner size="sm" />
                  <span>Searching...</span>
                </div>
                <template v-else-if="searchResults.length > 0">
                  <NuxtLink
                    v-for="result in searchResults"
                    :key="result.id"
                    :to="result.url"
                    class="search-result"
                  >
                    <div class="search-result-content">
                      <span class="search-result-title">{{ result.title }}</span>
                      <span
                        v-if="result.description"
                        class="search-result-desc"
                        >{{ result.description }}</span
                      >
                    </div>
                    <span class="search-result-type">{{ result.type }}</span>
                  </NuxtLink>
                </template>
                <div
                  v-else-if="searchQuery.length >= 2"
                  class="search-empty"
                >
                  No results found for "{{ searchQuery }}"
                </div>
              </div>
            </Transition>
          </div>

          <!-- Actions -->
          <div class="header-actions">
            <!-- Wallet Button Container with fade transition -->
            <Transition
              name="wallet-fade"
              mode="out-in"
            >
              <!-- Loading placeholder while checking wallet status -->
              <div
                v-if="!walletReady"
                class="wallet-placeholder"
              >
                <div class="wallet-placeholder-inner"></div>
              </div>

              <!-- Connected Wallet Button -->
              <WalletButton
                v-else-if="walletConnected"
                :trimmed-address="walletTrimmedAddress"
                :address="walletAddress"
                :network="walletNetwork"
                :network-icon="walletNetworkIcon"
                :provider="walletProvider"
                :provider-icon="walletProviderIcon"
                :balance="walletBalance"
                @disconnect="$emit('disconnect-wallet')"
              />

              <!-- Connect Wallet Button -->
              <button
                v-else
                type="button"
                class="btn btn-primary wallet-btn"
                @click="$emit('connect-wallet')"
              >
                <Icon
                  name="heroicons:wallet"
                  class="btn-icon"
                />
                <span class="wallet-text">Connect Wallet</span>
              </button>
            </Transition>

            <!-- Mobile Menu Toggle -->
            <button
              type="button"
              class="action-btn mobile-menu-btn"
              :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
              :aria-expanded="mobileMenuOpen"
              @click="toggleMobileMenu"
            >
              <Icon
                :name="mobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'"
                class="action-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Category Navigation -->
    <nav
      class="header-nav"
      aria-label="Category navigation"
    >
      <div class="container-app">
        <div class="header-nav-inner">
          <!-- Trending & New Pills -->
          <div class="nav-featured">
            <NuxtLink
              to="/?filter=trending"
              class="category-pill"
              :class="{ active: activeFilter === 'trending' }"
            >
              <Icon
                name="heroicons:arrow-trending-up"
                class="category-icon"
              />
              Trending
            </NuxtLink>
            <NuxtLink
              to="/?filter=new"
              class="category-pill"
              :class="{ active: activeFilter === 'new' }"
            >
              New
            </NuxtLink>
          </div>

          <!-- Divider -->
          <div class="nav-divider"></div>

          <!-- Scrollable Categories -->
          <div
            ref="categoriesScrollRef"
            class="nav-categories"
          >
            <div class="nav-categories-inner">
              <NuxtLink
                v-for="category in displayCategories"
                :key="category.id"
                :to="`/campaigns?category=${category.slug}`"
                class="category-pill"
                :class="{ active: activeCategory === category.id }"
              >
                {{ category.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Scroll Fade Indicators -->
          <div
            v-if="canScrollLeft"
            class="scroll-fade scroll-fade-left"
          ></div>
          <div
            v-if="canScrollRight"
            class="scroll-fade scroll-fade-right"
          ></div>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        @click="closeMobileMenu"
      ></div>
    </Transition>

    <!-- Mobile Slide-Out Panel -->
    <Transition name="slide-right">
      <div
        v-if="mobileMenuOpen"
        class="mobile-panel"
      >
        <!-- Panel Header with Logo -->
        <div class="mobile-panel-header">
          <NuxtLink
            to="/"
            class="mobile-logo-link"
            @click="closeMobileMenu"
          >
            <div class="mobile-logo-icon">
              <Icon
                name="heroicons:book-open"
                class="mobile-logo-icon-svg"
              />
            </div>
            <span class="mobile-logo-text">Pledgebook.com</span>
          </NuxtLink>
          <button
            type="button"
            class="mobile-close-btn"
            aria-label="Close menu"
            @click="closeMobileMenu"
          >
            <Icon
              name="heroicons:x-mark"
              class="mobile-close-icon"
            />
          </button>
        </div>

        <!-- Main Navigation -->
        <nav class="mobile-nav">
          <NuxtLink
            to="/"
            class="mobile-nav-item"
            :class="{ active: route.path === '/' }"
            @click="closeMobileMenu"
          >
            <Icon
              name="heroicons:home"
              class="mobile-nav-icon"
            />
            <span>Home</span>
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="mobile-nav-item"
            :class="{ active: route.path === '/about' }"
            @click="closeMobileMenu"
          >
            <Icon
              name="heroicons:question-mark-circle"
              class="mobile-nav-icon"
            />
            <span>How It Works</span>
          </NuxtLink>
          <NuxtLink
            to="/campaigns/create"
            class="mobile-nav-item"
            :class="{ active: route.path === '/campaigns/create' }"
            @click="closeMobileMenu"
          >
            <Icon
              name="heroicons:plus-circle"
              class="mobile-nav-icon"
            />
            <span>Create Campaign</span>
          </NuxtLink>
          <NuxtLink
            to="/my-campaigns"
            class="mobile-nav-item"
            :class="{ active: route.path === '/my-campaigns' }"
            @click="closeMobileMenu"
          >
            <Icon
              name="heroicons:megaphone"
              class="mobile-nav-icon"
            />
            <span>My Campaigns</span>
          </NuxtLink>
          <NuxtLink
            to="/my-pledges"
            class="mobile-nav-item"
            :class="{ active: route.path === '/my-pledges' }"
            @click="closeMobileMenu"
          >
            <Icon
              name="heroicons:hand-raised"
              class="mobile-nav-icon"
            />
            <span>My Pledges</span>
          </NuxtLink>
        </nav>

        <!-- Connect Wallet Button (only show when ready and not connected) -->
        <div
          v-if="walletReady && !walletConnected"
          class="mobile-wallet-section"
        >
          <button
            type="button"
            class="btn btn-primary mobile-wallet-btn"
            @click="
              () => {
                $emit('connect-wallet')
                closeMobileMenu()
              }
            "
          >
            <Icon
              name="heroicons:wallet"
              class="btn-icon"
            />
            Connect Wallet
          </button>
        </div>

        <!-- Categories Chips -->
        <div class="mobile-categories-section">
          <h3 class="mobile-section-title">Categories</h3>
          <div class="mobile-categories-chips">
            <NuxtLink
              v-for="category in displayCategories"
              :key="category.id"
              :to="`/campaigns?category=${category.slug}`"
              class="mobile-category-chip"
              @click="closeMobileMenu"
            >
              {{ category.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { useCategories } from '~/composables/useCategories'
import { useSearch } from '~/composables/useSearch'

// Props
interface Props {
  blur?: boolean
  searchPlaceholder?: string
  walletReady?: boolean
  walletConnected?: boolean
  walletAddress?: string
  walletTrimmedAddress?: string
  walletNetwork?: string
  walletNetworkIcon?: string
  walletProvider?: string | null
  walletProviderIcon?: string | null
  walletBalance?: string
}

withDefaults(defineProps<Props>(), {
  blur: false,
  searchPlaceholder: 'Search Pledgebook',
  walletReady: false,
  walletConnected: false,
  walletAddress: '',
  walletTrimmedAddress: '',
  walletNetwork: 'Polygon',
  walletNetworkIcon: '/images/networks/polygon.svg',
  walletProvider: null,
  walletProviderIcon: null,
  walletBalance: '0.00',
})

// Emits
defineEmits<{
  'connect-wallet': []
  'disconnect-wallet': []
}>()

// Route
const route = useRoute()

// Color mode
const colorMode = useColorMode()
const _colorModeIcon = computed(() => {
  return colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'
})

function _toggleColorMode() {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Categories
const { displayCategories, activeCategory, fetchCategories } = useCategories()

// Search
const {
  query: searchQuery,
  results: searchResults,
  loading: searchLoading,
  clearSearch,
} = useSearch()
const searchFocused = ref(false)
const showSearchDropdown = computed(() => searchFocused.value && searchQuery.value.length >= 2)

function handleSearchFocus() {
  searchFocused.value = true
}

function handleSearchBlur() {
  // Delay to allow clicking on results
  setTimeout(() => {
    searchFocused.value = false
  }, 200)
}

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
}

// Active filter from query
const activeFilter = computed(() => {
  return (route.query.filter as string) || null
})

// Mobile menu
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Scroll detection for categories
const categoriesScrollRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollIndicators() {
  const el = categoriesScrollRef.value
  if (!el) return

  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
}

// Keyboard shortcut for search
function handleKeydown(event: KeyboardEvent) {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
    event.preventDefault()
    const searchInput = document.querySelector('.input-search') as HTMLInputElement
    if (searchInput) searchInput.focus()
  }

  if (event.key === 'Escape' && mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Lifecycle
onMounted(() => {
  fetchCategories()
  updateScrollIndicators()

  const scrollEl = categoriesScrollRef.value
  if (scrollEl) {
    scrollEl.addEventListener('scroll', updateScrollIndicators)
  }

  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updateScrollIndicators)
})

onUnmounted(() => {
  const scrollEl = categoriesScrollRef.value
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', updateScrollIndicators)
  }

  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateScrollIndicators)
})
</script>

<style scoped>
/* Header Structure */
.header-sticky {
  position: sticky;
  top: 0;
  z-index: 200;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.header-blur {
  backdrop-filter: blur(12px);
  background-color: color-mix(in oklch, var(--bg-primary) 85%, transparent);
}

/* Top Row */
.header-top {
  height: 3.5rem; /* 56px */
  margin-top: 0.75rem;
  border-bottom: 1px solid var(--border-secondary);
}

.header-top-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 1rem;
}

/* Logo */
.header-logo {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: opacity 0.15s ease;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(
    135deg,
    var(--interactive-primary) 0%,
    var(--interactive-primary-hover) 100%
  );
  border-radius: 0.5rem;
}

.logo-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* Search */
.header-search {
  flex: 1;
  max-width: 28rem;
  position: relative;
  display: none;
}

@media (min-width: 768px) {
  .header-search {
    display: block;
  }
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-muted);
  pointer-events: none;
}

.input-search {
  width: 100%;
  height: 2.5rem;
  padding: 0 2.5rem 0 2.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--surface-secondary);
  border: 1px solid transparent;
  border-radius: 0.75rem;
  transition: all 0.15s ease;
}

.input-search::placeholder {
  color: var(--text-muted);
}

.input-search:hover {
  background-color: var(--surface-hover);
}

.input-search:focus {
  outline: none;
  background-color: var(--surface-primary);
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--border-focus) 15%, transparent);
}

.search-shortcut {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background-color: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: 0.25rem;
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-clear:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.search-clear-icon {
  width: 1rem;
  height: 1rem;
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 100;
}

.search-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: background-color 0.1s ease;
}

.search-result:hover {
  background-color: var(--surface-hover);
}

.search-result-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.search-result-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-type {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background-color: var(--surface-secondary);
  border-radius: 0.25rem;
}

.search-empty {
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Wallet Button Fade Transition */
.wallet-fade-enter-active,
.wallet-fade-leave-active {
  transition: opacity 0.2s ease;
}

.wallet-fade-enter-from,
.wallet-fade-leave-to {
  opacity: 0;
}

/* Wallet Placeholder (shown while checking connection) */
.wallet-placeholder {
  display: none;
  height: 2.25rem;
  /* Match the Connect Wallet button width */
  min-width: 2.25rem;
}

@media (min-width: 640px) {
  .wallet-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    /* At sm breakpoint, button only shows icon */
    min-width: 2.25rem;
  }
}

@media (min-width: 768px) {
  .wallet-placeholder {
    /* At md+ breakpoint, button shows icon + text "Connect Wallet" */
    min-width: 9rem;
  }
}

.wallet-placeholder-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--surface-secondary) 25%,
    var(--surface-hover) 50%,
    var(--surface-secondary) 75%
  );
  background-size: 200% 100%;
  border-radius: 0.5rem;
  animation: wallet-shimmer 1.5s infinite;
}

@keyframes wallet-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.wallet-btn {
  display: none;
  height: 2.25rem;
  padding: 0 0.875rem;
  font-size: 0.8125rem;
}

@media (min-width: 640px) {
  .wallet-btn {
    display: flex;
  }
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.wallet-text {
  display: none;
}

@media (min-width: 768px) {
  .wallet-text {
    display: inline;
  }
}

.mobile-menu-btn {
  display: flex;
}

/* Navigation Row */
.header-nav {
  height: 2.75rem; /* 44px */
  padding: 0.5rem 0;
  position: relative;
}

.header-nav-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.5rem;
  position: relative;
}

.nav-featured {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.nav-divider {
  width: 1px;
  height: 1.25rem;
  background-color: var(--border-primary);
  flex-shrink: 0;
  margin: 0 0.5rem;
}

.nav-categories {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-categories::-webkit-scrollbar {
  display: none;
}

.nav-categories-inner {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 1rem;
}

/* Category Pills */
.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: transparent;
  border-radius: 9999px;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.1s ease;
  cursor: pointer;
  user-select: none;
}

.category-pill:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.category-pill.active {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
}

.category-pill.active:hover {
  background-color: color-mix(in oklch, var(--interactive-primary) 18%, transparent);
}

.category-icon {
  width: 1rem;
  height: 1rem;
}

/* Scroll Fade Indicators */
.scroll-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3rem;
  pointer-events: none;
  z-index: 10;
}

.scroll-fade-left {
  left: 6rem;
  background: linear-gradient(to right, var(--bg-primary), transparent);
}

.scroll-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--bg-primary), transparent);
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--bg-overlay);
  z-index: 150;
}

/* Mobile Slide-Out Panel */
.mobile-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 320px;
  background-color: var(--bg-primary);
  z-index: 200;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

/* Panel Header */
.mobile-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.mobile-logo-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: var(--text-primary);
}

.mobile-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: linear-gradient(
    135deg,
    var(--interactive-primary) 0%,
    var(--interactive-primary-hover) 100%
  );
  border-radius: 0.5rem;
}

.mobile-logo-icon-svg {
  width: 1.375rem;
  height: 1.375rem;
  color: white;
}

.mobile-logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.mobile-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mobile-close-btn:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.mobile-close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Mobile Navigation */
.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
}

.mobile-nav-item:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.mobile-nav-item.active {
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 8%, transparent);
}

.mobile-nav-icon {
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
}

/* Mobile Wallet Section */
.mobile-wallet-section {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-primary);
}

.mobile-wallet-btn {
  width: 100%;
  height: 2.875rem;
  justify-content: center;
  font-size: 0.9375rem;
}

/* Mobile Categories Section */
.mobile-categories-section {
  padding: 1.25rem;
  flex: 1;
}

.mobile-section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.875rem;
}

.mobile-categories-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mobile-category-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--surface-secondary);
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mobile-category-chip:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
