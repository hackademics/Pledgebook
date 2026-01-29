<template>
  <footer class="border-t bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="grid gap-8 md:grid-cols-4">
        <div>
          <slot name="brand">
            <h3 class="text-lg font-semibold">
              {{ title }}
            </h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ description }}
            </p>
          </slot>
        </div>

        <slot name="links" />
      </div>

      <div class="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © {{ currentYear }} {{ title }}. All rights reserved.
        </p>

        <div class="flex gap-4">
          <slot name="social" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Pledgebook',
  description: 'Your enterprise-grade application',
})

const currentYear = computed(() => new Date().getFullYear())
</script>
