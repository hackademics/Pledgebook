// ESLint Configuration - uses shared config from @pledgebook/eslint-config
import { createNuxtConfig } from '@pledgebook/eslint-config/nuxt'

export default createNuxtConfig().append({
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
