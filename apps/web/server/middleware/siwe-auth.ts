import { defineEventHandler, getCookie, getHeader } from 'h3'
import { SIWE_TOKEN_COOKIE, verifySiweSession } from '../utils/siwe'

export default defineEventHandler(async (event) => {
  const cookieToken = getCookie(event, SIWE_TOKEN_COOKIE)
  const authHeader = getHeader(event, 'authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  const token = cookieToken || bearerToken

  if (!token) {
    return
  }

  const auth = await verifySiweSession(event, token)
  if (auth) {
    event.context.auth = auth
  }
})
