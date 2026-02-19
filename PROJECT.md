# Pledgebook

## Overview

Outcome-verified fundraising platform. Funds released based on AI-verified proof of milestone completion. Built for Chainlink Hackathon.

## Stack

- **Frontend:** Nuxt 4 (Vue 3, TypeScript, Nuxt UI, Tailwind v4)
- **Auth:** SIWE (Sign In With Ethereum)
- **Blockchain:** Solidity smart contracts
- **Oracle/Consensus:** Chainlink CRE for multi-node AI verification
- **Infrastructure:** Cloudflare (Workers, D1, Queues)
- **Monorepo:** Turborepo + pnpm workspaces

## Structure

```
pledgebook/
├── apps/web/              # Nuxt application
│   ├── components/        # Vue components
│   ├── pages/             # File-based routing
│   └── server/            # Nitro API routes
│       └── api/           # REST endpoints (campaigns, pledges, vouches, disputers)
├── blockchain/
│   ├── contracts/         # Solidity smart contracts
│   └── cre/               # Chainlink CRE workflows
├── packages/
│   ├── eslint-config/     # Shared linting
│   └── tsconfig/          # Shared TS configs
└── .docs/                 # Documentation
```

## Key Commands

```bash
pnpm install          # Install deps
pnpm dev              # Start dev servers
pnpm build            # Build all
pnpm test             # Run tests
pnpm lint             # Lint check
```

## Domain Concepts

- **Campaign:** Fundraising goal with defined milestones
- **Pledge:** Contribution held in escrow
- **Vouch:** Endorsement of campaign/creator
- **Dispute:** Challenge to claimed milestone completion
- **Outcome Verification:** AI consensus via Chainlink CRE

## Current Status

Repo: https://github.com/hackademics/Pledgebook.git

- [x] Monorepo structure
- [x] Nuxt app scaffolding
- [x] SIWE authentication
- [x] API CRUD (campaigns, pledges, vouches, disputes, categories)
- [x] Cloudflare integration
- [ ] Smart contract finalization
- [ ] CRE workflow completion
- [ ] UI polish
- [ ] Hackathon submission

---

_This file is context for coding agents. Keep it current._
