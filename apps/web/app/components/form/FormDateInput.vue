<template>
  <div class="form-field">
    <FormLabel
      v-if="label"
      :html-for="inputId"
      :required="required"
      :optional="optional"
      :disabled="disabled"
    >
      {{ label }}
    </FormLabel>

    <div
      class="form-input-wrapper"
      :class="{
        'form-input-wrapper--has-prefix': prefixIcon,
        'form-input-wrapper--has-suffix': true,
      }"
    >
      <!-- Prefix icon -->
      <div
        v-if="prefixIcon"
        class="form-input-prefix"
      >
        <Icon
          :name="prefixIcon"
          class="form-input-addon-icon"
        />
      </div>

      <!-- Input -->
      <input
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="showTime ? 'datetime-local' : 'date'"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="minDate"
        :max="maxDate"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="!!error"
        :aria-errormessage="error ? errorId : undefined"
        class="form-input form-date-input"
        :class="{
          'form-input--error': !!error,
          'form-input--success': success,
        }"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Single Calendar icon -->
      <div class="form-input-suffix form-date-trigger">
        <Icon
          name="heroicons:calendar"
          class="form-input-addon-icon"
        />
      </div>
    </div>

    <!-- Relative time display -->
    <div
      v-if="modelValue && showRelative"
      class="form-date-relative"
    >
      <Icon
        name="heroicons:clock"
        class="form-date-relative-icon"
      />
      <span>{{ relativeTime }}</span>
    </div>

    <!-- Hint -->
    <FormHint
      v-if="hint && !error"
      :hint-id="hintId"
    >
      {{ hint }}
    </FormHint>

    <!-- Error -->
    <FormError
      :message="error"
      :error-id="errorId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'

interface Props {
  modelValue?: string
  name?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  optional?: boolean
  success?: boolean
  showTime?: boolean
  showRelative?: boolean
  minDate?: string
  maxDate?: string
  prefixIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  optional: false,
  success: false,
  showTime: true,
  showRelative: true,
  minDate: '',
  maxDate: '',
  prefixIcon: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const baseId = useId()

const inputId = computed(() => props.name || `date-${baseId}`)
const errorId = computed(() => `${inputId.value}-error`)
const hintId = computed(() => `${inputId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint && !props.error) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

/**
 * Calculate relative time from now
 */
const relativeTime = computed(() => {
  if (!props.modelValue) return ''

  const date = new Date(props.modelValue)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays < 7) {
    return `In ${diffDays} days`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `In ${months} month${months > 1 ? 's' : ''}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `In ${years} year${years > 1 ? 's' : ''}`
  }
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus, inputRef })
</script>
