import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['node_modules', 'artifacts', 'cache', 'coverage', 'typechain-types', 'dist'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
]
