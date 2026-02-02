<template>
  <div
    class="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
    :class="cardClasses"
  >
    <div
      v-if="$slots.header || title"
      class="mb-4"
    >
      <slot name="header">
        <h3
          v-if="title"
          class="text-lg font-semibold"
        >
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {{ description }}
        </p>
      </slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div
      v-if="$slots.footer"
      class="mt-4 border-t pt-4"
    >
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  description?: string
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
  variant: 'default',
  padding: 'md',
})

const cardClasses = computed(() => {
  const classes: string[] = []

  // Variant styles
  if (props.variant === 'bordered') {
    classes.push('border-2')
  } else if (props.variant === 'elevated') {
    classes.push('shadow-lg')
  }

  // Padding styles
  const paddingMap: Record<NonNullable<Props['padding']>, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }
  classes.push(paddingMap[props.padding!])

  return classes
})
</script>
