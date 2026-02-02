# Security Practices (Contracts)

## Key management

- Use dedicated deployer keys with minimal balances.
- Store secrets in an encrypted vault (1Password, AWS Secrets Manager, etc.).
- Never commit `.env` or keystore files.
- Rotate keys regularly and revoke on compromise.

## Deployment hygiene

- Validate chain id before deployment.
- Verify addresses (USDC, Aave Pool, CRE oracle, treasury) via checksum.
- Require explicit confirmation for mainnet.

## Controls

- Pausing is available for emergency response.
- Emergency withdrawals are restricted and only allowed when paused.

## Audits

- Run Slither/Mythril on every PR.
- Maintain a changelog of security-sensitive changes.
