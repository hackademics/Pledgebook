import { defineEventHandler, setCookie } from 'h3'
import { sendSuccess } from '../../../utils/response'
import { createSiweNonce, SIWE_NONCE_COOKIE } from '../../../utils/siwe'

const NONCE_TTL_SECONDS = 60 * 10

export default defineEventHandler((event) => {
  const nonce = createSiweNonce()

  setCookie(event, SIWE_NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: NONCE_TTL_SECONDS,
  })

  return sendSuccess(event, { nonce })
})
