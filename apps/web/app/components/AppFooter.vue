<template>
  <footer class="app-footer">
    <!-- Main Footer Content -->
    <div class="footer-main">
      <div class="container-app">
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <NuxtLink
              to="/"
              class="footer-logo"
            >
              <div class="footer-logo-icon">
                <Icon
                  name="heroicons:book-open"
                  class="footer-logo-svg"
                />
              </div>
              <span class="footer-logo-text">Pledgebook</span>
            </NuxtLink>

            <p class="footer-tagline">
              {{ tagline }}
            </p>

            <!-- Social Links -->
            <div class="footer-social">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.href"
                :aria-label="social.ariaLabel || social.name"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  :name="social.icon"
                  class="social-icon"
                />
              </a>
            </div>
          </div>

          <!-- Link Columns -->
          <div
            v-for="section in footerSections"
            :key="section.title"
            class="footer-section"
          >
            <h4 class="footer-section-title">
              {{ section.title }}
            </h4>
            <ul class="footer-links">
              <li
                v-for="link in section.links"
                :key="link.label"
              >
                <NuxtLink
                  v-if="link.to"
                  :to="link.to"
                  class="footer-link"
                >
                  {{ link.label }}
                  <span
                    v-if="link.badge"
                    class="footer-link-badge"
                    >{{ link.badge }}</span
                  >
                </NuxtLink>
                <a
                  v-else-if="link.href"
                  :href="link.href"
                  class="footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ link.label }}
                  <Icon
                    name="heroicons:arrow-top-right-on-square"
                    class="external-icon"
                  />
                </a>
              </li>
            </ul>
          </div>

          <!-- Newsletter Column -->
          <div class="footer-newsletter">
            <h4 class="footer-section-title">Stay Updated</h4>
            <p class="newsletter-desc">Get the latest updates on new features and announcements.</p>
            <form
              class="newsletter-form"
              @submit.prevent="handleNewsletterSubmit"
            >
              <div class="newsletter-input-wrapper">
                <input
                  v-model="email"
                  type="email"
                  class="newsletter-input"
                  placeholder="Enter your email"
                  required
                />
                <button
                  type="submit"
                  class="newsletter-btn"
                  :disabled="isSubscribing"
                >
                  <Icon
                    v-if="isSubscribing"
                    name="heroicons:arrow-path"
                    class="newsletter-btn-icon animate-spin"
                  />
                  <Icon
                    v-else
                    name="heroicons:arrow-right"
                    class="newsletter-btn-icon"
                  />
                </button>
              </div>
              <p
                v-if="subscriptionMessage"
                class="newsletter-message"
                :class="{ success: subscriptionSuccess }"
              >
                {{ subscriptionMessage }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container-app">
        <div class="footer-bottom-inner">
          <!-- Copyright -->
          <p class="footer-copyright">© {{ currentYear }} Pledgebook. All rights reserved.</p>

          <!-- Legal Links -->
          <nav class="footer-legal">
            <NuxtLink
              to="/privacy"
              class="legal-link"
            >
              Privacy Policy
            </NuxtLink>
            <span class="legal-divider">·</span>
            <NuxtLink
              to="/terms"
              class="legal-link"
            >
              Terms of Service
            </NuxtLink>
            <span class="legal-divider">·</span>
            <NuxtLink
              to="/cookies"
              class="legal-link"
            >
              Cookie Policy
            </NuxtLink>
          </nav>

          <!-- Theme & Language -->
          <div class="footer-settings">
            <ClientOnly>
              <button
                type="button"
                class="settings-btn"
                @click="toggleColorMode"
              >
                <Icon
                  :name="colorModeIcon"
                  class="settings-icon"
                />
                <span>{{ colorModeLabel }}</span>
              </button>
              <template #fallback>
                <button
                  type="button"
                  class="settings-btn"
                  disabled
                >
                  <Icon
                    name="heroicons:sun"
                    class="settings-icon"
                  />
                  <span>Theme</span>
                </button>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FooterSection, SocialLink } from '~/types'

// Props
interface Props {
  tagline?: string
}

withDefaults(defineProps<Props>(), {
  tagline: 'The decentralized platform for transparent pledges and community accountability.',
})

// Current year
const currentYear = computed(() => new Date().getFullYear())

// Color mode - use Nuxt's built-in composable for proper SSR handling
const colorMode = useColorMode()
const colorModeIcon = computed(() => {
  return colorMode.value === 'dark' ? 'heroicons:sun' : 'heroicons:moon'
})
const colorModeLabel = computed(() => {
  return colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode'
})

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Footer sections with navigation links
const footerSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Campaigns', to: '/campaigns' },
      { label: 'Categories', to: '/categories' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Roadmap', to: '/roadmap', badge: 'Soon' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/docs' },
      { label: 'API Reference', to: '/docs/api' },
      { label: 'Help Center', to: '/help' },
      { label: 'Community', href: 'https://discord.gg/pledgebook' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers', badge: 'Hiring' },
      { label: 'Press Kit', to: '/press' },
      { label: 'Contact', to: '/contact' },
      { label: 'Partners', to: '/partners' },
    ],
  },
]

// Social links
const socialLinks: SocialLink[] = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/pledgebook',
    icon: 'simple-icons:x',
    ariaLabel: 'Follow us on X (Twitter)',
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/pledgebook',
    icon: 'simple-icons:discord',
    ariaLabel: 'Join our Discord community',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/pledgebook',
    icon: 'simple-icons:github',
    ariaLabel: 'View our GitHub repository',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/pledgebook',
    icon: 'simple-icons:linkedin',
    ariaLabel: 'Follow us on LinkedIn',
  },
]

// Newsletter
const email = ref('')
const isSubscribing = ref(false)
const subscriptionMessage = ref('')
const subscriptionSuccess = ref(false)

async function handleNewsletterSubmit() {
  if (!email.value) return

  isSubscribing.value = true
  subscriptionMessage.value = ''

  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value },
    })

    subscriptionSuccess.value = true
    subscriptionMessage.value = 'Thanks for subscribing!'
    email.value = ''

    // Clear message after 5 seconds
    setTimeout(() => {
      subscriptionMessage.value = ''
    }, 5000)
  } catch {
    subscriptionSuccess.value = false
    subscriptionMessage.value = 'Something went wrong. Please try again.'
  } finally {
    isSubscribing.value = false
  }
}
</script>

<style scoped>
/* Footer Structure */
.app-footer {
  margin-top: auto;
  background-color: var(--surface-secondary);
  border-top: 1px solid var(--border-primary);
}

/* Main Footer */
.footer-main {
  padding: 3rem 0 2.5rem;
}

.footer-grid {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1.5fr repeat(3, 1fr) 1.25fr;
    gap: 2rem;
  }
}

/* Brand Column */
.footer-brand {
  grid-column: 1 / -1;
}

@media (min-width: 1024px) {
  .footer-brand {
    grid-column: auto;
  }
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.footer-logo-icon {
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

.footer-logo-svg {
  width: 1.375rem;
  height: 1.375rem;
  color: white;
}

.footer-logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.footer-tagline {
  font-size: 0.875rem;
  line-height: 1.625;
  color: var(--text-secondary);
  max-width: 20rem;
  margin-bottom: 1.25rem;
}

/* Social Links */
.footer-social {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--text-tertiary);
  background-color: var(--surface-hover);
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.social-link:hover {
  color: var(--text-primary);
  background-color: var(--surface-active);
}

.social-icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* Footer Sections */
.footer-section {
  min-width: 0;
}

.footer-section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--text-primary);
}

.footer-link-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 12%, transparent);
  border-radius: 9999px;
}

.external-icon {
  width: 0.75rem;
  height: 0.75rem;
  opacity: 0.5;
}

/* Newsletter */
.footer-newsletter {
  grid-column: 1 / -1;
}

@media (min-width: 1024px) {
  .footer-newsletter {
    grid-column: auto;
  }
}

.newsletter-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.newsletter-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.newsletter-input {
  flex: 1;
  min-width: 0;
  height: 2.5rem;
  padding: 0 0.875rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.newsletter-input::placeholder {
  color: var(--text-muted);
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--border-focus) 15%, transparent);
}

.newsletter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: white;
  background-color: var(--interactive-primary);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.newsletter-btn:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
}

.newsletter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.newsletter-message {
  font-size: 0.8125rem;
  color: var(--color-error-500);
}

.newsletter-message.success {
  color: var(--color-success-500);
}

/* Footer Bottom */
.footer-bottom {
  padding: 1.25rem 0;
  border-top: 1px solid var(--border-primary);
}

.footer-bottom-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .footer-bottom-inner {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-copyright {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: center;
}

.footer-legal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.legal-link {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.legal-link:hover {
  color: var(--text-primary);
}

.legal-divider {
  color: var(--text-muted);
}

.footer-settings {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  background-color: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.settings-btn:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}

.settings-icon {
  width: 1rem;
  height: 1rem;
}

/* Animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
