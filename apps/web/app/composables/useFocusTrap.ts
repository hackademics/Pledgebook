import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, isActive: Ref<boolean>) {
  const previouslyFocusedElement = ref<HTMLElement | null>(null)

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
  }

  function focusFirstElement() {
    const focusable = getFocusableElements()
    const first = focusable[0]
    if (first) {
      first.focus()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isActive.value || !containerRef.value) return
    if (event.key !== 'Tab') return

    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const firstElement = focusable[0]
    const lastElement = focusable[focusable.length - 1]
    const activeElement = document.activeElement

    if (!firstElement || !lastElement) return

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (activeElement === firstElement || !containerRef.value.contains(activeElement)) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: moving forwards
      if (activeElement === lastElement || !containerRef.value.contains(activeElement)) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  function activate() {
    previouslyFocusedElement.value = document.activeElement as HTMLElement | null
    nextTick(() => {
      focusFirstElement()
    })
  }

  function deactivate() {
    if (previouslyFocusedElement.value) {
      previouslyFocusedElement.value.focus()
      previouslyFocusedElement.value = null
    }
  }

  watch(isActive, (active) => {
    if (active) {
      activate()
    } else {
      deactivate()
    }
  })

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    if (isActive.value) {
      activate()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    focusFirstElement,
    getFocusableElements,
  }
}
