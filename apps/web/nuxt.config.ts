// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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

  // Development tools - disabled to test if causing layout shift
  devtools: { enabled: false },

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

  // CSS - defined here only (not in layers) to prevent duplicate loading
  css: ['~/assets/css/main.css'],

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

  // Disable dev server logs streaming to prevent hydration flicker
  features: {
    devLogs: false,
    inlineStyles: true,
  },

  // Compatibility
  compatibilityDate: '2025-01-29',

  // Build optimizations
  nitro: {
    // NOTE: Do NOT set preset here - it breaks local development!
    // Use NITRO_PRESET=cloudflare-pages during build or in package.json scripts
    compressPublicAssets: true,
    minify: true,

    // Enable Cloudflare bindings in local development
    modules: ['nitro-cloudflare-dev'],

    // Output configuration for Cloudflare Pages
    output: {
      dir: '.output',
      publicDir: '.output/public',
    },

    // Route rules for caching static assets
    routeRules: {
      // Cache fonts for 1 year (immutable, content-hashed filenames)
      '/_fonts/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Cache Nuxt assets for 1 year (immutable, content-hashed filenames)
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Cache static files for 1 day
      '/manifest.json': {
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      },
      '/robots.txt': {
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      },
    },

    // Cloudflare bindings configuration
    cloudflare: {
      pages: {
        // Disable auto-generated asset routes to avoid long paths exceeding 100 char limit
        // Instead, use simple glob patterns that we specify explicitly
        defaultRoutes: false,
        routes: {
          version: 1,
          include: ['/*'],
          exclude: ['/_fonts/*', '/_nuxt/*', '/manifest.json', '/robots.txt'],
        },
      },
      // Enable local development bindings using wrangler.toml
      wrangler: {
        configPath: './wrangler.toml',
        persistDir: '.wrangler/state',
      },
    },

    // Disable auto-generated public assets in routes to avoid long paths
    publicAssets: [
      {
        dir: '../public',
        baseURL: '/',
      },
    ],
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

  // Fonts optimization - with fallback metrics to prevent layout shift (CLS)
  fonts: {
    defaults: {
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
      preload: false,
      // Define fallback fonts - @nuxt/fonts will auto-adjust their metrics
      // to match the primary font, preventing layout shift when fonts load
      fallbacks: {
        'sans-serif': ['Arial', 'Helvetica Neue', 'sans-serif'],
        monospace: ['Courier New', 'monospace'],
      },
    },
    // Define font families with preload for critical fonts
    families: [
      {
        name: 'Inter',
        weights: [400, 600],
        preload: true,
        // Fallbacks will have metrics adjusted to match Inter
        fallbacks: ['Arial', 'Helvetica Neue', 'sans-serif'],
      },
      {
        name: 'JetBrains Mono',
        weights: [400],
        preload: false,
        fallbacks: ['Courier New', 'monospace'],
      },
    ],
    experimental: {
      processCSSVariables: true,
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
