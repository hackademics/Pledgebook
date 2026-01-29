<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8">
    <div class="text-center">
      <h1 class="mb-4 text-4xl font-bold">Welcome to Pledgebook</h1>
      <p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
        Your enterprise-grade Nuxt monorepo is ready!
      </p>

      <div class="mb-8 grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border p-6">
          <Icon
            name="heroicons:cube"
            class="mx-auto mb-4 h-12 w-12 text-blue-500"
          />
          <h3 class="mb-2 text-lg font-semibold">Modular Architecture</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Built with Nuxt layers and pnpm workspaces
          </p>
        </div>
        <div class="rounded-lg border p-6">
          <Icon
            name="heroicons:bolt"
            class="mx-auto mb-4 h-12 w-12 text-yellow-500"
          />
          <h3 class="mb-2 text-lg font-semibold">Blazing Fast</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Optimized builds with Turbo and Vite
          </p>
        </div>
        <div class="rounded-lg border p-6">
          <Icon
            name="heroicons:shield-check"
            class="mx-auto mb-4 h-12 w-12 text-green-500"
          />
          <h3 class="mb-2 text-lg font-semibold">Type Safe</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Full TypeScript support throughout</p>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <NuxtLink
          to="/about"
          class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Learn More
        </NuxtLink>
        <a
          href="https://nuxt.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Documentation
        </a>
      </div>
    </div>

    <div class="mt-12 text-sm text-gray-500">
      <p>
        Counter: {{ count }}
        <button
          class="ml-2 rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          @click="increment"
        >
          +1
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { count, increment } = useCounter()

useSeoMeta({
  title: 'Home - Pledgebook',
  description: 'Welcome to Pledgebook, your enterprise-grade Nuxt application',
})
</script>
