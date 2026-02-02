<template>
  <div
    class="form-section"
    :class="{
      'form-section--compact': compact,
      'form-section--bordered': bordered,
      'form-section--disabled': disabled,
    }"
  >
    <div
      v-if="title || description"
      class="form-section-header"
    >
      <div
        v-if="icon"
        class="form-section-icon"
      >
        <Icon
          :name="icon"
          class="form-section-icon-svg"
        />
      </div>
      <div class="form-section-text">
        <h3
          v-if="title"
          class="form-section-title"
        >
          {{ title }}
          <span
            v-if="optional"
            class="form-section-optional"
          >
            (optional)
          </span>
        </h3>
        <p
          v-if="description"
          class="form-section-description"
        >
          {{ description }}
        </p>
      </div>
    </div>
    <fieldset
      class="form-section-content"
      :disabled="disabled"
    >
      <slot></slot>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string | undefined
  description?: string | undefined
  icon?: string | undefined
  compact?: boolean
  bordered?: boolean
  optional?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: '',
  compact: false,
  bordered: false,
  optional: false,
  disabled: false,
})
</script>
