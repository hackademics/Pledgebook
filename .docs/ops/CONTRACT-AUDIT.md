# Phase 10 — Contract Audit Tools

## Scope

Run automated static analysis on contracts and include results in CI.

## Tools

- Slither
- Mythril

## Local Usage

- pnpm --filter @pledgebook/contracts analyze:slither
- pnpm --filter @pledgebook/contracts analyze:mythril

## CI

- GitHub Actions workflow: .github/workflows/contracts.yml
- Runs Slither and Mythril on every PR touching contracts

## Acceptance Criteria

- CI produces Slither and Mythril reports without errors.
- Findings reviewed and triaged before merge.
