<template>
  <div class="blog-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <h1 class="page-header__title">Blog</h1>
          <p class="page-header__description">
            News, updates, and insights from the Pledgebook team.
          </p>
        </div>
      </div>
    </header>

    <!-- Coming Soon -->
    <section class="coming-soon-section">
      <div class="container-app">
        <div class="coming-soon-card">
          <Icon name="heroicons:pencil-square" />
          <h2>Coming Soon</h2>
          <p>
            We're working on bringing you insightful content about verifiable crowdfunding,
            blockchain technology, and the future of trust-minimized pledging.
          </p>
          <div class="subscribe-form">
            <p class="subscribe-label">Get notified when we publish:</p>
            <div class="subscribe-input-group">
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                :disabled="subscribed"
              />
              <button
                class="btn btn-primary"
                :disabled="subscribed || !isValidEmail || subscribing"
                @click="subscribe"
              >
                {{ subscribed ? 'Subscribed!' : subscribing ? 'Subscribing...' : 'Subscribe' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Topics -->
    <section class="topics-section">
      <div class="container-app">
        <h2 class="section-title">Topics We'll Cover</h2>
        <div class="topics-grid">
          <div class="topic-card">
            <Icon name="heroicons:shield-check" />
            <h3>Verification Deep Dives</h3>
            <p>How our multi-AI consensus system works and why it matters for trust.</p>
          </div>
          <div class="topic-card">
            <Icon name="heroicons:cube-transparent" />
            <h3>Smart Contract Architecture</h3>
            <p>Technical breakdowns of our escrow system and yield generation.</p>
          </div>
          <div class="topic-card">
            <Icon name="heroicons:user-group" />
            <h3>Creator Success Stories</h3>
            <p>Interviews with creators who achieved their goals through Pledgebook.</p>
          </div>
          <div class="topic-card">
            <Icon name="heroicons:light-bulb" />
            <h3>Web3 Education</h3>
            <p>Guides for newcomers to blockchain, wallets, and DeFi concepts.</p>
          </div>
          <div class="topic-card">
            <Icon name="heroicons:building-office-2" />
            <h3>Industry Analysis</h3>
            <p>Thoughts on crowdfunding, accountability, and the future of fundraising.</p>
          </div>
          <div class="topic-card">
            <Icon name="heroicons:code-bracket" />
            <h3>Engineering Updates</h3>
            <p>Behind-the-scenes looks at our development process and new features.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Social CTA -->
    <section class="social-section">
      <div class="container-app">
        <div class="social-card">
          <h2>Follow Us for Updates</h2>
          <p>Stay connected on social media for the latest news and announcements.</p>
          <div class="social-links">
            <a
              href="https://twitter.com/pledgebook"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
            >
              <Icon name="simple-icons:x" />
              X (Twitter)
            </a>
            <a
              href="https://discord.gg/pledgebook"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
            >
              <Icon name="simple-icons:discord" />
              Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Blog | Pledgebook',
  description:
    'News, updates, and insights about verifiable crowdfunding from the Pledgebook team.',
})

const email = ref('')
const subscribed = ref(false)
const subscribing = ref(false)
const subscribeError = ref('')

const isValidEmail = computed(() => {
  // Simple email validation
  const value = email.value
  return value.includes('@') && value.includes('.') && value.length >= 5
})

async function subscribe() {
  if (!isValidEmail.value || subscribing.value) return

  subscribing.value = true
  subscribeError.value = ''

  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value },
    })
    subscribed.value = true
  } catch {
    subscribeError.value = 'Failed to subscribe. Please try again.'
  } finally {
    subscribing.value = false
  }
}
</script>

<style scoped>
.blog-page {
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
  margin: 0;
}

/* Coming Soon Section */
.coming-soon-section {
  padding: 4rem 0;
}

.coming-soon-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  padding: 3rem;
}

.coming-soon-card > .iconify {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.coming-soon-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.coming-soon-card > p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.subscribe-form {
  border-top: 1px solid var(--border-primary);
  padding-top: 1.5rem;
}

.subscribe-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.subscribe-input-group {
  display: flex;
  gap: 0.5rem;
}

.subscribe-input-group input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.subscribe-input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.subscribe-input-group input::placeholder {
  color: var(--text-tertiary);
}

.subscribe-input-group input:disabled {
  opacity: 0.6;
}

/* Topics Section */
.topics-section {
  padding: 4rem 0;
  background-color: var(--bg-primary);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.topic-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
}

.topic-card .iconify {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.topic-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.topic-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Social Section */
.social-section {
  padding: 4rem 0;
}

.social-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.social-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.social-card > p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.social-link:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .page-header__title {
    font-size: 1.75rem;
  }

  .topics-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .subscribe-input-group {
    flex-direction: column;
  }

  .social-links {
    flex-direction: column;
  }
}
</style>
