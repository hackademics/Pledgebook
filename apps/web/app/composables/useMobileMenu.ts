import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useScrollLock } from '@vueuse/core'

/**
 * Composable for mobile menu state management
 * Handles opening, closing, and body scroll locking
 */
export function useMobileMenu() {
  const isOpen = ref(false)
  const activeSection = ref<string | undefined>()
  const route = useRoute()

  // Lock body scroll when menu is open
  const scrollLock = useScrollLock(typeof document !== 'undefined' ? document.body : null, false)

  /**
   * Open mobile menu
   */
  function open() {
    isOpen.value = true
    scrollLock.value = true
  }

  /**
   * Close mobile menu
   */
  function close() {
    isOpen.value = false
    scrollLock.value = false
    activeSection.value = undefined
  }

  /**
   * Toggle mobile menu
   */
  function toggle() {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * Set active section (for accordions/submenus)
   */
  function setActiveSection(section?: string) {
    activeSection.value = section
  }

  /**
   * Toggle section
   */
  function toggleSection(section: string) {
    if (activeSection.value === section) {
      activeSection.value = undefined
    } else {
      activeSection.value = section
    }
  }

  // Close menu on route change
  watch(
    () => route.path,
    () => {
      close()
    },
  )

  // Handle escape key
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen.value) {
        close()
      }
    })
  }

  return {
    isOpen,
    activeSection,
    open,
    close,
    toggle,
    setActiveSection,
    toggleSection,
  }
}
