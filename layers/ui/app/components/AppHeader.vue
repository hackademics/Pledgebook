<template>
  <header class="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-4">
        <slot name="logo">
          <NuxtLink
            to="/"
            class="text-xl font-bold"
          >
            {{ title }}
          </NuxtLink>
        </slot>

        <nav
          v-if="$slots.nav"
          class="hidden md:flex"
        >
          <slot name="nav" />
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <slot name="actions" />

        <button
          class="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          aria-label="Toggle menu"
          @click="toggleMobileMenu"
        >
          <Icon
            name="heroicons:bars-3"
            class="h-6 w-6"
          />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div
        v-if="mobileMenuOpen"
        class="border-t bg-white dark:bg-gray-950 md:hidden"
      >
        <nav class="container mx-auto px-4 py-4">
          <slot name="mobile-nav">
            <slot name="nav" />
          </slot>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Pledgebook',
})

const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Close mobile menu on route change
const route = useRoute()
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  }
)
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
