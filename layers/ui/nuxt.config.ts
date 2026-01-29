import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// UI Layer configuration with Nuxt UI
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  css: [join(currentDir, './app/assets/css/main.css')],

  ui: {
    colorMode: true,
    theme: {
      colors: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
  },

  srcDir: 'app',
  future: {
    compatibilityVersion: 4,
  },

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
    },
  },

  typescript: {
    strict: true,
  },
})
