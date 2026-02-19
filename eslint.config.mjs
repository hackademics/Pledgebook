import { createNuxtConfig } from '@pledgebook/eslint-config/nuxt'

// Allow self-closing void elements (input, br, etc.)
// Formatting is handled by Prettier - no need for @stylistic rules here
export default createNuxtConfig()
  .append({
    ignores: [
      'blockchain/**/tmp.js',
      'packages/**/tmp.js',
      '**/pledgebook-workflow/tmp.js',
    ],
  })
  .append({
    rules: {
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any',
            normal: 'never',
            component: 'always',
          },
        },
      ],
    },
  })
