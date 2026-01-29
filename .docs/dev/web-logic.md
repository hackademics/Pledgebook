# PledgeBook Product Development Document (Continued)

## Phase 8: Web Layer Technology Integration and Ecosystem Support

**Objective**: Coalesce the web layer technologies into a unified framework that supports the PledgeBook ecosystem, enabling seamless interaction with blockchain, CRE workflows, and funds management. This phase describes each technology's role in the Nuxt-based frontend, focusing on how they facilitate campaign creation, pledging, verification, auditing, tracking, and distribution from the web perspective. The web layer acts as the user gateway, ensuring responsive, secure, and efficient experiences while integrating with backend infrastructure (D1, R2, KV, etc.) for data persistence and real-time features.

**Deliverables**:

- Detailed description of each technology's fit and implementation.
- Integration patterns for ecosystem support (e.g., how routing enables navigation, how stores track sessions).
- Code snippets for key configurations.

**Standards, Patterns, Conventions, and Best Practices**:

- **Integration Focus**: Each technology must support core ecosystem functions (campaigns, pledging, verification) with minimal redundancy; use composables for cross-feature logic. Carmack: "Integrate simply; test interactions early to avoid bloat."
- **Web Layer Role**: Handles UI rendering, user input validation, API calls to Workers, real-time updates via polling/KV, and wallet-based auth; offloads heavy logic to CRE/contracts.
- **Responsiveness**: Tailwind mobile-first; test with Playwright responsive views.
- **Security**: JWT for sessions, encryption for sensitive data; no client-side secrets.
- **Testing Gate**: Playwright E2E for full flows; Vitest for isolated tech integrations.

### 8.1: Nuxt 4 (Core Framework)

Nuxt 4 serves as the foundation for the web application, providing SSR/SSG for fast loads, auto-imports for productivity, and Nitro for server-side logic. It supports the ecosystem by enabling dynamic routing for campaign views, composables for blockchain interactions (e.g., pledge submission), and layouts for consistent navigation. For PledgeBook, Nuxt handles campaign form rendering, real-time pledge tracking via polling, and SEO for public campaign discovery.

**Implementation Fit**:

- SSR for initial campaign data load from D1.
- Hybrid rendering for my-campaigns page (static list + dynamic updates).
- Example `nuxt.config.ts` snippet:
  ```ts
  export default defineNuxtConfig({
    ssr: true,
    nitro: { preset: 'cloudflare-pages' },
    app: { head: { charset: 'utf-8', viewport: 'width=device-width, initial-scale=1' } },
  })
  ```

### 8.2: Nuxt UI (Component Library)

Nuxt UI provides pre-built, customizable components (UButton, UCard, UForm) that align with Tailwind for consistent, beautiful UIs. It supports the ecosystem by enabling reusable elements for forms (campaign creation), tables (audit logs), and modals (pledge confirmation). For PledgeBook, it ensures elegant dashboards for tracking pledges and consensus results.

**Implementation Fit**:

- Used in CampaignForm.vue for validation UI.
- Theme customization in `nuxt.config.ts`:
  ```ts
  ui: { primary: 'blue', gray: 'cool' },
  ```

### 8.3: Tailwind 4 CSS (Styling System)

Tailwind 4 offers utility-first CSS with BEM in custom files for maintainable styling. It supports the ecosystem by providing responsive grids for campaign lists, color schemes for status indicators (green for success), and theming for dark mode. For PledgeBook, it ensures mobile/desktop views for pledge tracking.

**Implementation Fit**:

- Custom BEM in `assets/css/components.css` for .campaign-card.
- Config in `tailwind.config.js`:
  ```js
  module.exports = {
    theme: { extend: { colors: { primary: '#2563eb' } } },
  }
  ```

### 8.4: TypeScript (Typing System)

TypeScript enforces strict typing across the app, supporting the ecosystem by defining schemas (Campaign, Pledge) shared with backend. For PledgeBook, it prevents errors in form validation and API calls.

**Implementation Fit**:

- `tsconfig.json` with strict: true.
- Example: `type Campaign = z.infer<typeof CampaignSchema>;`

### 8.5: Cloudflare Pages (Hosting Platform)

Cloudflare Pages hosts the Nuxt app with global CDN for fast delivery. It supports the ecosystem by serving SSR pages for campaign details and integrating with D1/R2 for data.

**Implementation Fit**:

- Build command: `pnpm --filter web build`; output .output.
- Env vars in dashboard for staging/prod.

### 8.6: D1 (Database)

D1 provides SQL storage for off-chain metadata (campaigns, pledges). It supports the ecosystem by enabling fast queries for lists/audits, syncing with on-chain events.

**Implementation Fit**:

- Schema as in previous phases; queries in Nitro routes.
- Migration with Wrangler: `wrangler d1 migrations apply`.

### 8.7: R2 (File Storage)

R2 stores non-immutable files (images). It supports the ecosystem by hosting campaign avatars, integrated with NuxtImg for optimization.

**Implementation Fit**:

- Upload in API routes: `await event.context.cloudflare.env.R2.put(key, file)`.

### 8.8: KV (Key-Value Store)

KV handles sessions/cache for real-time data (e.g., pledge totals). It supports the ecosystem by storing user sessions for quick auth checks.

**Implementation Fit**:

- In middleware: `await event.context.cloudflare.env.KV.get('session:' + wallet)`.

### 8.9: Durable Objects (Real-Time)

Durable Objects enable persistent state for real-time (e.g., live pledge updates). It supports the ecosystem by coordinating multi-user monitoring.

**Implementation Fit**:

- Worker class for CampaignObject; subscribe via WebSockets in Nuxt.

### 8.10: Cache (Caching Layer)

Cloudflare Cache API caches API responses/pages. It supports the ecosystem by speeding up campaign list loads.

**Implementation Fit**:

- In Workers: `await caches.default.put(request, response)`.

### 8.11: Queues (Async Tasks)

Queues handle background jobs (e.g., email notifications on consensus). It supports the ecosystem by async processing dispute triggers.

**Implementation Fit**:

- Producer: `await event.context.cloudflare.env.QUEUE.send(msg)`.

### 8.12: Email Integration (Workers Email)

Workers Email sends notifications (e.g., "Campaign approved"). It supports the ecosystem by engaging users on updates.

**Implementation Fit**:

- Use MailChannels or SendGrid via Workers; call from queues.

### 8.13: Web 3 Wallet Integration (Wagmi/Reown)

Wagmi + Reown enforces wallet-based auth. It supports the ecosystem by securing pledges/ownership.

**Implementation Fit**:

- Plugin for connect; SIWE in middleware.

### 8.14: Sessions, Wallets for Security/Authentication/Accounts

Sessions in KV/Pinia with JWT for auth. It supports the ecosystem by RBAC (user/admin).

**Implementation Fit**:

- `useAuth` composable validates JWT.

### 8.15: Wrangler (CLI Tool)

Wrangler manages local/staging/prod (D1 migrations, deployments). It supports the ecosystem by simulating Cloudflare env locally.

**Implementation Fit**:

- `wrangler dev` for local Workers.

### 8.16: Local/Staging/Prod Environments

Local (Wrangler miniflare), staging/prod on Cloudflare. It supports the ecosystem by testing flows before mainnet.

**Implementation Fit**:

- Env vars: .env.local for dev; dashboard for prod.

### 8.17: Migrations (D1 Schema Changes)

Wrangler migrations for D1. It supports the ecosystem by evolving schemas.

**Implementation Fit**:

- `wrangler d1 migrations apply`.

### 8.18: Deployments (Cloudflare Pages)

Git-integrated deploys. It supports the ecosystem by continuous delivery.

**Implementation Fit**:

- Push to main → auto-deploy.

### 8.19: Middleware (Route Guards)

Middleware enforces auth/RBAC. It supports the ecosystem by protecting sensitive pages.

**Implementation Fit**:

- `defineNuxtMiddleware` for wallet check.

### 8.20: Utils (Composables)

Composables for reusable logic (useApi). It supports the ecosystem by abstracting API calls.

**Implementation Fit**:

- `useFetch` wrappers.

### 8.21: Testing (Vitest/Playwright)

Vitest for unit, Playwright for E2E. It supports the ecosystem by verifying flows.

**Implementation Fit**:

- `playwright.config.ts` with webServer.

### 8.22: Bundling of Assets (Vite/Nitro)

Vite bundles; Nitro compresses. It supports the ecosystem by optimizing loads.

**Implementation Fit**:

- `vite.config.ts` for plugins.

### 8.23: Routing (File-Based)

Dynamic routes for slugs. It supports the ecosystem by clean URLs.

**Implementation Fit**:

- `[slug].vue` for campaigns.

### 8.24: JWT (Auth Tokens)

JWT for session validation. It supports the ecosystem by secure auth.

**Implementation Fit**:

- Generate in API, store in KV.

### 8.25: Encryption (Web Crypto)

Encrypt sensitive data. It supports the ecosystem by protecting private proofs.

**Implementation Fit**:

- `crypto.subtle.encrypt` in composables.

### 8.26: Composables (Reusable Logic)

Custom hooks like useAuth. It supports the ecosystem by modular code.

**Implementation Fit**:

- Auto-imported.

### 8.27: Plugins (App Extensions)

Plugins for wallet. It supports the ecosystem by global setup.

**Implementation Fit**:

- `plugins/wallet.client.ts`.

### 8.28: Stores (Pinia)

State for campaigns/sessions. It supports the ecosystem by reactive data.

**Implementation Fit**:

- `stores/campaign.ts`.

### 8.29: App Config (app.vue)

Root app with head. It supports the ecosystem by base setup.

**Implementation Fit**:

- useHead for defaults.

### 8.30: Nuxt 4 Config (nuxt.config.ts)

Modules, runtimeConfig. It supports the ecosystem by app-wide settings.

**Implementation Fit**:

- As in previous.

### 8.31: Playwright Config (playwright.config.ts)

E2E config. It supports the ecosystem by automated tests.

**Implementation Fit**:

- webServer command: 'pnpm dev:web'.

### 8.32: TypeScript Config (tsconfig.json)

Strict typing. It supports the ecosystem by error prevention.

**Implementation Fit**:

- "strict": true.

### 8.33: Vite Config (vite.config.ts)

Build optimizations. It supports the ecosystem by bundling.

**Implementation Fit**:

- Plugins for tree-shake.

### 8.34: Pinia (State Management)

Global state. It supports the ecosystem by reactive sessions.

**Implementation Fit**:

- defineStore.

### 8.35: PNPM (Package Manager)

Workspaces for monorepo. It supports the ecosystem by dependency management.

**Implementation Fit**:

- pnpm-workspace.yaml.

### 8.36: Packages (Dependencies)

Core libs like Zod. It supports the ecosystem by feature enablement.

**Implementation Fit**:

- pnpm add from root.

**Validation Gate**: Full deploy to staging; test all integrations; no errors.

This completes the web layer overview. Ready for implementation or next phase?
