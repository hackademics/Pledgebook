#!/usr/bin/env node

const baseUrl = process.env.API_BASE ?? process.env.NUXT_PUBLIC_API_BASE
const requestId = process.env.REQUEST_ID
const intervalMs = Number(process.env.POLL_INTERVAL_MS ?? 5000)
const timeoutMs = Number(process.env.TIMEOUT_MS ?? 120000)

if (!baseUrl || !requestId) {
  console.error('Missing required env vars: API_BASE (or NUXT_PUBLIC_API_BASE) and REQUEST_ID')
  process.exit(1)
}

const statusUrl = new URL('/api/cre/status', baseUrl)
statusUrl.searchParams.set('request_id', requestId)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const poll = async () => {
  const res = await fetch(statusUrl.toString(), {
    headers: { 'content-type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Status endpoint failed: ${res.status} ${res.statusText}`)
  }

  const payload = await res.json()

  if (!payload?.data?.available) {
    return { status: 'unavailable', logs: [] }
  }

  const logs = Array.isArray(payload.data.logs) ? payload.data.logs : []
  const successLog = logs.find((log) => log?.status === 'success')

  if (successLog) {
    return { status: 'success', logs }
  }

  return { status: 'pending', logs }
}

const run = async () => {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      const result = await poll()
      if (result.status === 'success') {
        console.log('CRE callback confirmed via audit log.')
        process.exit(0)
      }

      if (result.status === 'unavailable') {
        console.log('CRE status endpoint unavailable (missing bindings). Retrying...')
      }
      else {
        const latest = result.logs[0]
        if (latest) {
          console.log(`CRE callback pending. Latest log: ${latest.action} (${latest.status})`)
        }
        else {
          console.log('CRE callback pending. No logs yet.')
        }
      }
    }
    catch (error) {
      console.error(`Polling error: ${error?.message ?? String(error)}`)
    }

    await sleep(intervalMs)
  }

  console.error('Timed out waiting for CRE callback logs.')
  process.exit(1)
}

run()
