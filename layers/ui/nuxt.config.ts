import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// UI Layer configuration with Nuxt UI
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  // Use absolute path for layer CSS - the ~ alias resolves to consuming app's srcDir
  // which doesn't work for layers. Using join() with currentDir ensures correct resolution.
  css: [join(currentDir, 'app/assets/css/main.css')],

  ui: {
    // Colors are now defined in CSS @theme block, not here
    // colorMode is handled by @nuxtjs/color-mode in web app
  },

  srcDir: 'app',

  vite: {
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      sourcemap: false,
      // Ensure CSS is properly deduplicated and bundled
      cssCodeSplit: false,
    },
    // Deduplicate CSS resolution to prevent duplicate loading
    resolve: {
      dedupe: ['tailwindcss', '@nuxt/ui'],
    },
  },

  typescript: {
    strict: true,
  },
})
