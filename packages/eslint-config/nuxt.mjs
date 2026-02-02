import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import eslintConfigPrettier from 'eslint-config-prettier'

/**
 * Nuxt ESLint configuration for the monorepo
 * Uses Prettier for formatting - ESLint stylistic rules are disabled via eslint-config-prettier
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
  })
    .append({
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
    .append(
      // Disable ESLint stylistic rules that conflict with Prettier
      eslintConfigPrettier,
    )
    .append({
      // Additional stylistic rules to disable that conflict with Prettier
      rules: {
        'arrow-parens': 'off',
        'brace-style': 'off',
        'quote-props': 'off',
        '@stylistic/brace-style': 'off',
        '@stylistic/arrow-parens': 'off',
        '@stylistic/operator-linebreak': 'off',
        '@stylistic/member-delimiter-style': 'off',
        '@stylistic/quote-props': 'off',
        '@stylistic/indent-binary-ops': 'off',
        'vue/multiline-html-element-content-newline': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/html-indent': 'off',
      },
    })
}

export default createNuxtConfig
