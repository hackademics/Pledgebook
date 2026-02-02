<template>
  <div class="form-field">
    <FormLabel
      v-if="label"
      :html-for="selectId"
      :required="required"
      :optional="optional"
      :disabled="disabled"
    >
      {{ label }}
    </FormLabel>

    <div class="form-select-wrapper">
      <select
        :id="selectId"
        ref="selectRef"
        :value="modelValue"
        :name="name"
        :disabled="disabled"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="!!error"
        :aria-errormessage="error ? errorId : undefined"
        class="form-select"
        :class="{
          'form-select--error': !!error,
          'form-select--placeholder': !modelValue,
        }"
        @change="handleChange"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
        <option
          v-if="placeholder"
          value=""
          disabled
          :selected="!modelValue"
        >
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="form-select-chevron">
        <Icon
          name="heroicons:chevron-down"
          class="form-select-chevron-icon"
        />
      </div>
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

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  name?: string | undefined
  label?: string | undefined
  placeholder?: string | undefined
  hint?: string | undefined
  error?: string | undefined
  disabled?: boolean
  required?: boolean
  optional?: boolean
  options: SelectOption[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  placeholder: 'Select an option',
  hint: '',
  error: '',
  disabled: false,
  required: false,
  optional: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const selectRef = ref<HTMLSelectElement | null>(null)
const baseId = useId()

const selectId = computed(() => props.name || `select-${baseId}`)
const errorId = computed(() => `${selectId.value}-error`)
const hintId = computed(() => `${selectId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint && !props.error) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

function focus() {
  selectRef.value?.focus()
}

defineExpose({ focus, selectRef })
</script>
