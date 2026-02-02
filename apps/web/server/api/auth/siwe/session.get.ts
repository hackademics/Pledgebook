import { defineEventHandler, getCookie } from 'h3'
import { sendSuccess } from '../../../utils/response'
import { SIWE_TOKEN_COOKIE, verifySiweSession } from '../../../utils/siwe'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SIWE_TOKEN_COOKIE)

  if (!token) {
    return sendSuccess(event, { authenticated: false, address: null })
  }

  const auth = await verifySiweSession(event, token)
  if (!auth) {
    return sendSuccess(event, { authenticated: false, address: null })
  }

  return sendSuccess(event, { authenticated: true, address: auth.address })
})
