# MASTERPLAN — Deployment Runbook

## Purpose

Provide a deterministic, step-by-step deployment process for the MVP across contracts, CRE workflows, and Cloudflare infrastructure.

---

## Environments

- **local**: developer laptops, local hardhat node, wrangler dev
- **testnet**: Polygon Amoy (or current testnet), Cloudflare staging
- **mainnet**: Polygon mainnet, Cloudflare production

---

## Pre-Flight Checklist

### Secrets & Keys

- Wallet deployer key (hardware wallet preferred for mainnet)
- CRE workflow keys + API keys
- IPFS pinning provider key
- Cloudflare API token (least privilege)
- Aave Pool address + USDC address

### Configuration

- Verify `promptHash` hashing scheme (keccak256)
- Verify D1 migrations applied and schema versioned
- Verify chain ID and RPC endpoints
- Verify CRE callback address (oracle)

---

## Step 1 — Deploy Smart Contracts

### 1.1 Run Preflight Script

- Validate env vars
- Validate Aave + USDC addresses
- Validate CRE oracle address

### 1.2 Deploy Factory

- Deploy `CampaignFactory`
- Capture factory address

### 1.3 Deploy Escrow Template

- Ensure factory can deploy `PledgeEscrow`

### 1.4 Verify on Explorer

- Verify source
- Confirm constructor params

---

## Step 2 — Deploy CRE Workflows

### 2.1 Configure Secrets

- AI providers keys
- DECO keys
- IPFS pinning keys

### 2.2 Deploy Workflows

- `ValidationWorkflow`
- `BaselineWorkflow`
- `EvaluationWorkflow`

### 2.3 Bind Callbacks

- Confirm callback uses factory escrow address
- Confirm `creOracle` in contract matches CRE

---

## Step 3 — Deploy Cloudflare Infrastructure

### 3.1 D1

- Apply migrations
- Confirm schema matches master plan

### 3.2 Workers

- Deploy API worker
- Deploy queue workers
- Deploy cron triggers

### 3.3 R2, KV, Queues

- Create buckets
- Verify bindings in wrangler config

### 3.4 Pages

- Deploy Nuxt 4 frontend
- Validate environment bindings

---

## Step 4 — Post-Deploy Verification

### Smoke Tests

- Create campaign (draft)
- Run CRE validation
- Create escrow on-chain
- Pledge, vouch, dispute
- Trigger evaluation and callback

### Observability

- Verify Logs, Analytics, Logpush
- Verify alerts in SIEM

---

## Rollback Plan

- Disable new campaign creation
- Revert Workers deployment
- Pause contracts (if emergency controls enabled)
- Rotate secrets

---

## Maintenance Cadence

- Weekly: review logs + metrics
- Monthly: update dependencies
- Quarterly: security review + penetration test
