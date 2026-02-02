<template>
  <label
    :for="htmlFor"
    class="form-label"
    :class="{
      'form-label--required': required,
      'form-label--disabled': disabled,
    }"
  >
    <span class="form-label-text">
      <slot></slot>
    </span>
    <span
      v-if="required"
      class="form-label-required"
      aria-hidden="true"
    >
      *
    </span>
    <span
      v-if="optional"
      class="form-label-optional"
    >
      (optional)
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  htmlFor?: string | undefined
  required?: boolean
  optional?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  htmlFor: '',
  required: false,
  optional: false,
  disabled: false,
})
</script>
