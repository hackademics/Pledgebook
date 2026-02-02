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

    <div class="form-slug-wrapper">
      <!-- Prefix -->
      <div class="form-slug-prefix">
        <span class="form-slug-base-url">{{ baseUrl }}</span>
      </div>

      <!-- Input wrapper -->
      <div
        class="form-input-wrapper"
        :class="{ 'form-input-wrapper--has-suffix': loading || available !== null }"
        style="flex: 1; min-width: 0"
      >
        <!-- Input -->
        <input
          :id="inputId"
          ref="inputRef"
          :value="modelValue"
          type="text"
          :name="name"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :maxlength="maxlength"
          :aria-describedby="ariaDescribedBy"
          :aria-invalid="!!error"
          :aria-errormessage="error ? errorId : undefined"
          class="form-input form-slug-input"
          :class="{
            'form-input--error': !!error,
            'form-input--success': available === true,
          }"
          @input="handleInput"
          @blur="$emit('blur', $event)"
          @focus="$emit('focus', $event)"
        />

        <!-- Availability indicator -->
        <div
          v-if="loading || available !== null"
          class="form-input-suffix"
        >
          <AppSpinner
            v-if="loading"
            size="sm"
            class="form-input-loading"
          />
          <Icon
            v-else-if="available === true"
            name="heroicons:check-circle"
            class="form-slug-available"
          />
          <Icon
            v-else-if="available === false"
            name="heroicons:x-circle"
            class="form-slug-unavailable"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div
      v-if="modelValue && showPreview"
      class="form-slug-preview"
    >
      <Icon
        name="heroicons:link"
        class="form-slug-preview-icon"
      />
      <span class="form-slug-preview-url">{{ baseUrl }}{{ modelValue }}</span>
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
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  optional?: boolean
  maxlength?: number
  baseUrl?: string
  available?: boolean | null
  loading?: boolean
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  placeholder: 'my-campaign',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  optional: false,
  maxlength: 100,
  baseUrl: 'pledgebook.com/@',
  available: null,
  loading: false,
  showPreview: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const baseId = useId()

const inputId = computed(() => props.name || `slug-${baseId}`)
const errorId = computed(() => `${inputId.value}-error`)
const hintId = computed(() => `${inputId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint && !props.error) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

/**
 * Convert input to valid slug format
 */
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const slugValue = toSlug(target.value)
  emit('update:modelValue', slugValue)
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus, inputRef })
</script>
