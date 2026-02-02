<template>
  <div class="turnstile-widget">
    <div
      ref="container"
      class="turnstile-widget__container"
    ></div>
    <p
      v-if="error"
      class="turnstile-widget__error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          action?: string
          theme?: 'light' | 'dark'
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface Props {
  siteKey?: string
  action?: string
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
})

const emit = defineEmits<{
  verified: [token: string]
  expired: []
  error: [message: string]
}>()

const runtimeConfig = useRuntimeConfig()
const container = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)
const error = ref<string | null>(null)

const isLocalhost = computed(() => {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
})

const resolvedSiteKey = computed(() => {
  if (props.siteKey) {
    return props.siteKey
  }

  if (isLocalhost.value) {
    return (
      runtimeConfig.public.turnstileSiteKeyLocal ||
      runtimeConfig.public.turnstileSiteKey ||
      '1x00000000000000000000AA'
    )
  }

  return runtimeConfig.public.turnstileSiteKey || ''
})

function ensureTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.turnstile) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile-script]') as HTMLScriptElement
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstileScript = 'true'
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Failed to load Turnstile')))
    document.head.appendChild(script)
  })
}

function renderWidget(): void {
  if (!container.value || !window.turnstile) {
    return
  }

  widgetId.value = window.turnstile.render(container.value, {
    sitekey: resolvedSiteKey.value,
    action: props.action,
    theme: props.theme,
    callback: (token: string) => {
      emit('verified', token)
    },
    'expired-callback': () => {
      emit('expired')
    },
    'error-callback': () => {
      emit('error', 'Turnstile verification failed. Please try again.')
    },
  })
}

function reset(): void {
  if (window.turnstile && widgetId.value) {
    window.turnstile.reset(widgetId.value)
  }
}

defineExpose({ reset })

onMounted(async () => {
  if (!resolvedSiteKey.value) {
    error.value = 'Turnstile site key is not configured.'
    emit('error', error.value)
    return
  }

  try {
    await ensureTurnstileScript()
    renderWidget()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load Turnstile.'
    emit('error', error.value)
  }
})

onBeforeUnmount(() => {
  if (window.turnstile && widgetId.value) {
    window.turnstile.remove(widgetId.value)
  }
})
</script>

<style scoped>
.turnstile-widget {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.turnstile-widget__container {
  min-height: 65px;
}

.turnstile-widget__error {
  font-size: var(--text-xs);
  color: var(--color-error-600);
}
</style>
