<template>
  <div
    class="flex items-center justify-center"
    :class="containerClasses"
    role="status"
    aria-label="Loading"
  >
    <svg
      class="animate-spin"
      :class="spinnerClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span
      v-if="text"
      class="ml-2"
    >
      {{ text }}
    </span>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  size?: Size
  text?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  text: undefined,
  fullscreen: false,
})

const spinnerClasses = computed(() => {
  const sizeMap: Record<Size, string> = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }
  return sizeMap[props.size!]
})

const containerClasses = computed(() => {
  if (props.fullscreen) {
    return 'fixed inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm'
  }
  return ''
})
</script>
