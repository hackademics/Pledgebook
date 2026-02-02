<template>
  <p
    :id="hintId"
    class="form-hint"
  >
    <slot></slot>
  </p>
</template>

<script setup lang="ts">
interface Props {
  hintId?: string
}

withDefaults(defineProps<Props>(), {
  hintId: undefined,
})
</script>
