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

    <div class="form-input-wrapper form-input-wrapper--has-prefix form-input-wrapper--has-suffix">
      <!-- Currency Symbol -->
      <div class="form-input-prefix">
        <span class="form-currency-symbol">{{ currencySymbol }}</span>
      </div>

      <!-- Input -->
      <input
        :id="inputId"
        ref="inputRef"
        :value="displayValue"
        type="text"
        inputmode="decimal"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="!!error"
        :aria-errormessage="error ? errorId : undefined"
        class="form-input form-currency-input"
        :class="{
          'form-input--error': !!error,
          'form-input--success': success,
        }"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Currency Code -->
      <div class="form-input-suffix">
        <span class="form-currency-code">{{ currency }}</span>
      </div>
    </div>

    <!-- Converted value display -->
    <div
      v-if="showConversion && convertedValue"
      class="form-currency-conversion"
    >
      <Icon
        name="heroicons:arrow-right"
        class="form-currency-conversion-icon"
      />
      <span>≈ {{ convertedValue }}</span>
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
  modelValue?: string // Wei as string
  name?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  optional?: boolean
  success?: boolean
  currency?: string
  currencySymbol?: string
  decimals?: number
  showConversion?: boolean
  convertedValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: '',
  label: '',
  placeholder: '0.00',
  hint: '',
  error: '',
  disabled: false,
  readonly: false,
  required: false,
  optional: false,
  success: false,
  currency: 'USDC',
  currencySymbol: '$',
  decimals: 6,
  showConversion: false,
  convertedValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string] // Wei as string
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const baseId = useId()

const inputId = computed(() => props.name || `currency-${baseId}`)
const errorId = computed(() => `${inputId.value}-error`)
const hintId = computed(() => `${inputId.value}-hint`)

const ariaDescribedBy = computed(() => {
  const ids: string[] = []
  if (props.hint && !props.error) ids.push(hintId.value)
  if (props.error) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

/**
 * Convert wei string to display value
 */
const displayValue = computed(() => {
  if (!props.modelValue || props.modelValue === '0') return ''
  try {
    const wei = BigInt(props.modelValue)
    const divisor = BigInt(10 ** props.decimals)
    const whole = wei / divisor
    const remainder = wei % divisor
    const remainderStr = remainder.toString().padStart(props.decimals, '0')
    // Remove trailing zeros
    const trimmedRemainder = remainderStr.replace(/0+$/, '')
    if (trimmedRemainder) {
      return `${whole}.${trimmedRemainder}`
    }
    return whole.toString()
  } catch {
    return ''
  }
})

/**
 * Convert display value to wei string
 */
function toWei(value: string): string {
  if (!value || value === '.') return '0'

  const parts = value.split('.')
  const whole = parts[0] || '0'
  let fraction = parts[1] || ''

  // Pad or truncate fraction to correct decimals
  if (fraction.length > props.decimals) {
    fraction = fraction.slice(0, props.decimals)
  } else {
    fraction = fraction.padEnd(props.decimals, '0')
  }

  const weiStr = whole + fraction
  // Remove leading zeros
  return weiStr.replace(/^0+/, '') || '0'
}

/**
 * Format input to only allow valid currency input
 */
function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  let formatted = value.replace(/[^\d.]/g, '')

  // Only allow one decimal point
  const parts = formatted.split('.')
  if (parts.length > 2) {
    formatted = parts[0] + '.' + parts.slice(1).join('')
  }

  // Limit decimal places
  if (parts[1] && parts[1].length > props.decimals) {
    formatted = parts[0] + '.' + parts[1].slice(0, props.decimals)
  }

  return formatted
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const formatted = formatCurrencyInput(target.value)
  target.value = formatted
  emit('update:modelValue', toWei(formatted))
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus, inputRef })
</script>
