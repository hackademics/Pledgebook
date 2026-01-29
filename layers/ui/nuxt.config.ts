// UI Layer configuration with Nuxt UI
// NOTE: CSS is intentionally NOT defined here to prevent duplicate loading
// CSS should be defined only in the consuming app (apps/web)
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

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
      // Enable CSS code splitting for better performance
      cssCodeSplit: true,
      // Optimize CSS minification
      cssMinify: 'lightningcss',
      // Reduce CSS chunk size
      rollupOptions: {
        output: {
          // Separate CSS into smaller chunks
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return '_nuxt/css/[name]-[hash][extname]'
            }
            return '_nuxt/[name]-[hash][extname]'
          },
        },
      },
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
