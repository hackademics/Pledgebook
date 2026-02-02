# @pledgebook/web

The main Nuxt application for Pledgebook.

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## CRE Callback Verification

Use the script below to confirm CRE callback logs on staging/testnet.

```bash
API_BASE=https://staging.pledgebook.example \
REQUEST_ID=00000000-0000-0000-0000-000000000000 \
pnpm cre:verify-callback
```

Optional environment variables:

- `POLL_INTERVAL_MS` (default: 5000)
- `TIMEOUT_MS` (default: 120000)

## Project Structure

```
app/
├── assets/          # Static assets (CSS, images)
├── components/      # Vue components
├── composables/     # Vue composables
├── layouts/         # Layout components
├── locales/         # i18n translation files
├── middleware/      # Route middleware
├── pages/           # File-based routing
├── plugins/         # Nuxt plugins
└── utils/           # Utility functions

server/
├── api/            # API routes
├── middleware/     # Server middleware
├── plugins/        # Nitro plugins
└── utils/          # Server utilities
```

## Features

- ✅ Nuxt 4 compatibility mode
- ✅ TypeScript strict mode
- ✅ Vue 3 Composition API
- ✅ Pinia state management
- ✅ VueUse utilities
- ✅ i18n internationalization
- ✅ Color mode (dark/light)
- ✅ Image optimization
- ✅ ESLint + Prettier
- ✅ Vitest for testing
