import { jwtVerify, SignJWT } from 'jose'
import { randomBytes } from 'node:crypto'
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'

export const SIWE_NONCE_COOKIE = 'siwe_nonce'
export const SIWE_TOKEN_COOKIE = 'siwe_token'

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

function getJwtSecret(event: H3Event): Uint8Array {
  const config = useRuntimeConfig(event)
  if (!config.apiSecret) {
    throw new Error('Missing apiSecret in runtime config')
  }
  return new TextEncoder().encode(config.apiSecret)
}

export function createSiweNonce(): string {
  return randomBytes(16).toString('hex')
}

export async function signSiweSession(event: H3Event, address: string): Promise<string> {
  const secret = getJwtSecret(event)
  return new SignJWT({ sub: address })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret)
}

export async function verifySiweSession(
  event: H3Event,
  token: string,
): Promise<{ address: string } | null> {
  try {
    const secret = getJwtSecret(event)
    const { payload } = await jwtVerify(token, secret)
    if (!payload.sub || typeof payload.sub !== 'string') {
      return null
    }
    return { address: payload.sub }
  } catch {
    return null
  }
}
