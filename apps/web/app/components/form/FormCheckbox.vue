<template>
  <div class="form-checkbox-field">
    <div class="form-checkbox-wrapper">
      <input
        :id="checkboxId"
        ref="checkboxRef"
        type="checkbox"
        :name="name"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        class="form-checkbox"
        :class="{ 'form-checkbox--error': !!error }"
        @change="handleChange"
      />
      <label
        :for="checkboxId"
        class="form-checkbox-label"
        :class="{ 'form-checkbox-label--disabled': disabled }"
      >
        <span class="form-checkbox-label-text">
          <slot>{{ label }}</slot>
        </span>
        <span
          v-if="hint"
          class="form-checkbox-hint"
        >
          {{ hint }}
        </span>
      </label>
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
  modelValue?: boolean
  name?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  name: '',
  label: '',
  hint: '',
  error: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxRef = ref<HTMLInputElement | null>(null)
const baseId = useId()

const checkboxId = computed(() => props.name || `checkbox-${baseId}`)
const errorId = computed(() => `${checkboxId.value}-error`)
const hintId = computed(() => `${checkboxId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

defineExpose({ checkboxRef })
</script>
