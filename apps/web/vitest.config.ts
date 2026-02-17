import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    include: ['app/**/*.{test,spec}.{js,ts}', 'server/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
      exclude: ['app/**/*.{test,spec}.ts', 'server/**/*.{test,spec}.ts', 'app/**/*.d.ts'],
    },
  },
})
