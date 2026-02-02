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
        'form-input-wrapper--has-prefix': $slots.prefix || prefixIcon,
        'form-input-wrapper--has-suffix': $slots.suffix || suffixIcon || showClear,
      }"
    >
      <!-- Prefix -->
      <div
        v-if="$slots.prefix || prefixIcon"
        class="form-input-prefix"
      >
        <slot name="prefix">
          <Icon
            v-if="prefixIcon"
            :name="prefixIcon"
            class="form-input-addon-icon"
          />
        </slot>
      </div>

      <!-- Input -->
      <input
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="!!error"
        :aria-errormessage="error ? errorId : undefined"
        class="form-input"
        :class="{
          'form-input--error': !!error,
          'form-input--success': success,
          'form-input--loading': loading,
        }"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown.enter="$emit('enter', $event)"
      />

      <!-- Suffix / Loading / Clear -->
      <div
        v-if="$slots.suffix || suffixIcon || showClear || loading"
        class="form-input-suffix"
      >
        <AppSpinner
          v-if="loading"
          size="sm"
          class="form-input-loading"
        />
        <button
          v-else-if="showClear && modelValue"
          type="button"
          class="form-input-clear"
          aria-label="Clear input"
          @click="handleClear"
        >
          <Icon
            name="heroicons:x-mark"
            class="form-input-addon-icon"
          />
        </button>
        <slot
          v-else
          name="suffix"
        >
          <Icon
            v-if="suffixIcon"
            :name="suffixIcon"
            class="form-input-addon-icon"
          />
        </slot>
      </div>
    </div>

    <!-- Hint + Character count row -->
    <div
      v-if="(hint && !error) || (showCharCount && maxlength)"
      class="form-field-footer"
    >
      <FormHint
        v-if="hint && !error"
        :hint-id="hintId"
      >
        {{ hint }}
      </FormHint>
      <span v-else></span>
      <div
        v-if="showCharCount && maxlength"
        class="form-char-count"
        :class="{ 'form-char-count--warning': charCountWarning }"
      >
        {{ charCount }} / {{ maxlength }}
      </div>
    </div>

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
  modelValue?: string | number
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'datetime-local'
  name?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  optional?: boolean
  loading?: boolean
  success?: boolean
  showClear?: boolean
  showCharCount?: boolean
  minlength?: number | undefined
  maxlength?: number | undefined
  min?: number | string | undefined
  max?: number | string | undefined
  step?: number | string | undefined
  autocomplete?: string
  prefixIcon?: string
  suffixIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  name: '',
  label: '',
  placeholder: '',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  optional: false,
  loading: false,
  success: false,
  showClear: false,
  showCharCount: false,
  minlength: undefined,
  maxlength: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  autocomplete: '',
  prefixIcon: '',
  suffixIcon: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  enter: [event: KeyboardEvent]
  clear: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const baseId = useId()

const inputId = computed(() => props.name || `input-${baseId}`)
const errorId = computed(() => `${inputId.value}-error`)
const hintId = computed(() => `${inputId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint && !props.error) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

const charCount = computed(() => String(props.modelValue || '').length)
const charCountWarning = computed(() => {
  if (!props.maxlength) return false
  return charCount.value >= props.maxlength * 0.9
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

function focus() {
  inputRef.value?.focus()
}

function blur() {
  inputRef.value?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>
