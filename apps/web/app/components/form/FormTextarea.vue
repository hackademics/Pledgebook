<template>
  <div class="form-field">
    <FormLabel
      v-if="label"
      :html-for="textareaId"
      :required="required"
      :optional="optional"
      :disabled="disabled"
    >
      {{ label }}
    </FormLabel>

    <div class="form-textarea-wrapper">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        :rows="rows"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="!!error"
        :aria-errormessage="error ? errorId : undefined"
        class="form-textarea"
        :class="{
          'form-textarea--error': !!error,
          'form-textarea--success': success,
          'form-textarea--resize-none': resize === 'none',
          'form-textarea--resize-vertical': resize === 'vertical',
          'form-textarea--resize-horizontal': resize === 'horizontal',
        }"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      ></textarea>
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
  modelValue?: string
  name?: string | undefined
  label?: string | undefined
  placeholder?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  optional?: boolean
  success?: boolean
  showCharCount?: boolean
  minlength?: number | undefined
  maxlength?: number | undefined
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  placeholder: '',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  optional: false,
  success: false,
  showCharCount: false,
  minlength: undefined,
  maxlength: undefined,
  rows: 4,
  resize: 'vertical',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const baseId = useId()

const textareaId = computed(() => props.name || `textarea-${baseId}`)
const errorId = computed(() => `${textareaId.value}-error`)
const hintId = computed(() => `${textareaId.value}-hint`)

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
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function focus() {
  textareaRef.value?.focus()
}

function blur() {
  textareaRef.value?.blur()
}

defineExpose({ focus, blur, textareaRef })
</script>
