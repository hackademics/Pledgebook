// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable Nuxt 4 compatibility mode

  // Extend shared layer and UI layer
  extends: ['@pledgebook/shared', '@pledgebook/ui'],

  // Modules
  modules: [
    '@nuxt/devtools',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  // Development tools
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Pledgebook',
      meta: [
        { name: 'description', content: 'Pledgebook Application' },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Color mode configuration
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  // Runtime config
  runtimeConfig: {
    // Server-side only
    apiSecret: '',
    // Public (exposed to client)
    public: {
      apiBase: '',
      appName: 'Pledgebook',
    },
  },

  // Use the new app directory structure
  srcDir: 'app',
  serverDir: 'server',
  future: {
    compatibilityVersion: 4,
  },

  // Compatibility
  compatibilityDate: '2025-01-29',

  // Build optimizations
  nitro: {
    compressPublicAssets: true,
    minify: true,
  },

  // Vite configuration
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Run separately with `pnpm typecheck`
    shim: false,
  },

  // ESLint integration
  eslint: {
    config: {
      standalone: false,
    },
  },

  // i18n configuration
  i18n: {
    locales: [{ code: 'en', language: 'en-US', file: 'en.json', name: 'English' }],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales',
    strategy: 'prefix_except_default',
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp', 'avif'],
  },
})
