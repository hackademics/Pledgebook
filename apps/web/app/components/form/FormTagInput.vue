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
      class="form-tag-input-wrapper"
      :class="{
        'form-tag-input-wrapper--focused': isFocused,
        'form-tag-input-wrapper--error': !!error,
        'form-tag-input-wrapper--disabled': disabled,
      }"
      @click="focusInput"
    >
      <!-- Tags -->
      <TransitionGroup
        name="tag"
        tag="div"
        class="form-tag-list"
      >
        <span
          v-for="(tag, index) in modelValue"
          :key="tag"
          class="form-tag"
        >
          <span class="form-tag-text">{{ tag }}</span>
          <button
            type="button"
            class="form-tag-remove"
            aria-label="Remove tag"
            :disabled="disabled"
            @click.stop="removeTag(index)"
          >
            <Icon
              name="heroicons:x-mark"
              class="form-tag-remove-icon"
            />
          </button>
        </span>
      </TransitionGroup>

      <!-- Input -->
      <input
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="modelValue.length >= maxTags ? '' : placeholder"
        :disabled="disabled || modelValue.length >= maxTags"
        class="form-tag-input"
        :aria-describedby="ariaDescribedBy"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
        @keydown.,="addTag"
        @blur="handleBlur"
        @focus="isFocused = true"
      />
    </div>

    <!-- Tag count -->
    <div
      v-if="showCount"
      class="form-char-count"
      :class="{ 'form-char-count--warning': modelValue.length >= maxTags }"
    >
      {{ modelValue.length }} / {{ maxTags }} tags
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
  modelValue: string[]
  name?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  optional?: boolean
  maxTags?: number
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  label: '',
  placeholder: 'Type and press Enter',
  hint: '',
  error: '',
  disabled: false,
  required: false,
  optional: false,
  maxTags: 10,
  showCount: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const isFocused = ref(false)
const baseId = useId()

const inputId = computed(() => props.name || `tag-input-${baseId}`)
const errorId = computed(() => `${inputId.value}-error`)
const hintId = computed(() => `${inputId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint && !props.error) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

function addTag() {
  const tag = inputValue.value.trim().toLowerCase().replace(/,/g, '')
  if (!tag) return
  if (props.modelValue.length >= props.maxTags) return
  if (props.modelValue.includes(tag)) {
    inputValue.value = ''
    return
  }

  emit('update:modelValue', [...props.modelValue, tag])
  inputValue.value = ''
}

function removeTag(index: number) {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

function handleBackspace() {
  if (!inputValue.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}

function handleBlur(_event: FocusEvent) {
  isFocused.value = false
  if (inputValue.value.trim()) {
    addTag()
  }
}

function focusInput() {
  inputRef.value?.focus()
}

defineExpose({ inputRef, focusInput })
</script>
