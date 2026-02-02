<template>
  <Transition name="form-error">
    <p
      v-if="message"
      :id="errorId"
      class="form-error"
      role="alert"
      aria-live="polite"
    >
      <Icon
        name="heroicons:exclamation-circle"
        class="form-error-icon"
        aria-hidden="true"
      />
      <span class="form-error-text">{{ message }}</span>
    </p>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  errorId?: string
}

withDefaults(defineProps<Props>(), {
  message: undefined,
  errorId: undefined,
})
</script>
