<template>
  <div class="community-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__title-row">
            <div class="page-header__text">
              <h1 class="page-header__title">Community</h1>
              <p class="page-header__description">
                Join the Pledgebook community — connect, collaborate, and contribute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <div class="community-grid">
          <a
            v-for="channel in channels"
            :key="channel.name"
            :href="channel.href"
            target="_blank"
            rel="noopener noreferrer"
            class="community-card"
          >
            <div class="community-card__icon">
              <Icon :name="channel.icon" />
            </div>
            <div>
              <h2 class="community-card__title">{{ channel.name }}</h2>
              <p class="community-card__description">{{ channel.description }}</p>
            </div>
            <Icon
              name="heroicons:arrow-top-right-on-square"
              class="community-card__external"
            />
          </a>
        </div>

        <section class="community-section">
          <h2 class="community-section__title">Governance</h2>
          <p class="community-section__description">
            Pledgebook is governed by its community. Participate in proposals, vote on protocol
            upgrades, and help shape the future of decentralized pledging.
          </p>
          <div class="community-section__actions">
            <NuxtLink
              to="/docs"
              class="btn btn--secondary"
            >
              Read the Docs
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Community - Pledgebook',
  description: 'Connect with the Pledgebook community on Discord, GitHub, X, and more.',
})

const channels = [
  {
    name: 'Discord',
    description: 'Chat with other community members, get support, and stay up to date.',
    href: 'https://discord.gg/pledgebook',
    icon: 'simple-icons:discord',
  },
  {
    name: 'GitHub',
    description: 'Explore the source code, report issues, and contribute to development.',
    href: 'https://github.com/pledgebook',
    icon: 'simple-icons:github',
  },
  {
    name: 'X (Twitter)',
    description: 'Follow for announcements, updates, and community highlights.',
    href: 'https://twitter.com/pledgebook',
    icon: 'simple-icons:x',
  },
  {
    name: 'LinkedIn',
    description: 'Connect with the team and follow company updates.',
    href: 'https://linkedin.com/company/pledgebook',
    icon: 'simple-icons:linkedin',
  },
]
</script>

<style scoped>
.community-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.page-main {
  padding: 2rem 0 4rem;
}

.community-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin-bottom: 3rem;
}

.community-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.community-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--interactive-primary);
}

.community-card__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  color: var(--interactive-primary);
}

.community-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.community-card__description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.community-card__external {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  color: var(--text-tertiary);
}

.community-section {
  padding: 2rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.community-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.community-section__description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 48rem;
  margin-bottom: 1.5rem;
}

.community-section__actions {
  display: flex;
  gap: 0.75rem;
}
</style>
