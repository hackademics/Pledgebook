<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8">
    <div class="text-center">
      <h1 class="mb-4 text-4xl font-bold">About Pledgebook</h1>
      <p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
        Built with modern best practices and enterprise-grade architecture.
      </p>

      <div class="mb-8 text-left">
        <h2 class="mb-4 text-2xl font-semibold">Tech Stack</h2>
        <ul class="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
          <li>Nuxt 3 with Nuxt 4 compatibility mode</li>
          <li>Vue 3 with Composition API</li>
          <li>TypeScript for type safety</li>
          <li>Pinia for state management</li>
          <li>Turbo for monorepo orchestration</li>
          <li>pnpm workspaces</li>
          <li>ESLint + Prettier for code quality</li>
          <li>Vitest for unit testing</li>
          <li>Husky + lint-staged for Git hooks</li>
        </ul>
      </div>

      <NuxtLink
        to="/"
        class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'About - Pledgebook',
  description: 'Learn about Pledgebook and our technology stack',
})
</script>
