# Secrets Strategy

## Principles

- Never commit secrets to the repo.
- Use environment-specific secret stores for production and staging.
- Keep non-sensitive config in versioned files (e.g., wrangler.toml [vars]).
- Rotate credentials on schedule or after any exposure.

## Cloudflare Workers

- Store sensitive values using Wrangler secrets per environment.
- Keep non-sensitive values in wrangler.toml [vars].
- For local development, use a .dev.vars file (gitignored) or your shell environment.

Recommended secret categories:

- Authentication: SIWE JWT secret, session signing keys
- Bot protection: Turnstile secret key
- External services: IPFS pinning tokens, notification provider keys
- CRE callbacks or API tokens (if applicable)

## CRE workflows

- Define required secret names in blockchain/cre/pledgebook/secrets.yaml.
- Store secrets in the CRE environment (staging/production) using the CRE CLI or dashboard.
- Do not embed keys in workflow configs or source files.

## Contract deployment

- Use .env files locally (never committed).
- Store production deployer keys in a secure vault with limited access.
- Prefer hardware wallets and minimal-fund deployer accounts for mainnet.
