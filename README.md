# Pledgebook Monorepo

A modern, enterprise-grade monorepo built with Nuxt, Vue 3, and TypeScript.

## 📦 Structure

```
pledgebook/
├── apps/
│   └── web/                 # Main Nuxt application
├── layers/
│   ├── shared/              # Shared utilities, types, and composables
│   └── ui/                  # UI components and styling
├── packages/
│   ├── eslint-config/       # Shared ESLint configuration
│   └── tsconfig/            # Shared TypeScript configuration
├── .vscode/                 # VS Code settings and extensions
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── turbo.json               # Turborepo configuration
└── tsconfig.json            # Base TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build
```

## 📜 Available Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start development servers    |
| `pnpm build`     | Build all packages           |
| `pnpm lint`      | Run ESLint on all packages   |
| `pnpm lint:fix`  | Fix ESLint errors            |
| `pnpm format`    | Format code with Prettier    |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test`      | Run all tests                |
| `pnpm test:unit` | Run unit tests               |
| `pnpm test:e2e`  | Run end-to-end tests         |
| `pnpm clean`     | Clean all build artifacts    |

## 🏗️ Architecture

### Apps

#### `@pledgebook/web`

The main Nuxt application. Features:

- Nuxt 4 compatibility mode
- File-based routing
- Server-side rendering
- i18n support
- Color mode (dark/light themes)

### Layers

#### `@pledgebook/shared`

Shared utilities and types across the monorepo:

- TypeScript types and interfaces
- Validation schemas (Zod)
- Utility functions (formatters, helpers)
- Shared composables

#### `@pledgebook/ui`

UI layer with Nuxt UI:

- Tailwind CSS v4
- Pre-built components (AppCard, AppHeader, AppFooter, etc.)
- Theme configuration
- Design tokens

### Packages

#### `@pledgebook/eslint-config`

Shared ESLint configuration for consistent code style.

#### `@pledgebook/tsconfig`

Shared TypeScript configurations:

- `base.json` - Base configuration
- `nuxt.json` - Nuxt-specific configuration
- `node.json` - Node.js applications

## 🛠️ Development

### Adding a New App

1. Create a new directory in `apps/`
2. Add a `package.json` with the app configuration
3. Add the app to the workspace in `pnpm-workspace.yaml`
4. Run `pnpm install`

### Adding a New Package

1. Create a new directory in `packages/`
2. Add a `package.json` with the package configuration
3. Run `pnpm install`

### Using Workspace Dependencies

Reference workspace packages using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@pledgebook/shared": "workspace:*",
    "@pledgebook/ui": "workspace:*"
  }
}
```

## 🧪 Testing

- **Unit Tests**: Vitest with `@vue/test-utils`
- **Component Tests**: Nuxt Test Utils
- **E2E Tests**: (Add your preferred E2E framework)

```bash
# Run unit tests
pnpm test:unit

# Run tests in watch mode
pnpm --filter @pledgebook/web test:unit:watch
```

## 📝 Code Quality

### Linting & Formatting

- **ESLint**: Code linting with Vue and TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files
- **Commitlint**: Conventional commit message validation

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## 📚 Documentation

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue.js Documentation](https://vuejs.org/guide)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io/motivation)
- [Nuxt UI Documentation](https://ui.nuxt.com)

## 📄 License

UNLICENSED - Private repository
