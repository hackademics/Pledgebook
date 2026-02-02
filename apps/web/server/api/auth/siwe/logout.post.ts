import { defineEventHandler, setCookie } from 'h3'
import { sendSuccess } from '../../../utils/response'
import { SIWE_NONCE_COOKIE, SIWE_TOKEN_COOKIE } from '../../../utils/siwe'

export default defineEventHandler((event) => {
  setCookie(event, SIWE_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  setCookie(event, SIWE_NONCE_COOKIE, '', {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return sendSuccess(event, { success: true })
})
