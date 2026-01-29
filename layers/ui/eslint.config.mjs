// ESLint Configuration for UI layer
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      semi: false,
      quotes: 'single',
    },
  },
})
