import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

/**
 * Nuxt ESLint configuration for the monorepo
 */
export function createNuxtConfig(options = {}) {
  return createConfigForNuxt({
    features: {
      tooling: true,
      stylistic: {
        semi: false,
        quotes: 'single',
      },
    },
    ...options,
  }).append({
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  })
}

export default createNuxtConfig
