import { defineNitroPlugin } from 'nitropack/runtime'
import type { QueueMessage } from '../types/cloudflare'
import type { NitroApp } from 'nitropack/types'
import { useRuntimeConfig } from '#imports'

/**
 * Queue Consumer Handler
 *
 * This module exports a queue handler that processes messages from Cloudflare Queues.
 * It is automatically invoked when messages are available in the queue.
 *
 * Note: Queue consumers run as separate worker invocations, not as part of HTTP requests.
 * This plugin only registers the hook when running in a Cloudflare environment.
 */

export default defineNitroPlugin((nitroApp: NitroApp) => {
  // Only register queue consumer when running in Cloudflare (production or wrangler dev)
  // Skip during regular nuxt dev to avoid hanging
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore import.meta.dev is valid in Vite/Nitro
  if (import.meta.dev) {
    return
  }

  // Register queue consumer hook
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Cloudflare queue hook is not typed in Nitro yet
  nitroApp.hooks.hook('cloudflare:queue', async ({ batch }: { batch: MessageBatch<unknown> }) => {
    console.log(`Processing ${batch.messages.length} messages from queue: ${batch.queue}`)

    for (const message of batch.messages) {
      try {
        await processMessage(message.body as QueueMessage)
        message.ack()
      } catch (error) {
        console.error(`Failed to process message ${message.id}:`, error)
        message.retry()
      }
    }
  })
})

async function processMessage(message: QueueMessage): Promise<void> {
  console.log(`Processing message type: ${message.type}`)

  switch (message.type) {
    case 'email':
      await handleEmailMessage(message.payload)
      break

    case 'notification':
      await handleNotificationMessage(message.payload)
      break

    case 'analytics':
      await handleAnalyticsMessage(message.payload)
      break

    case 'ipfs-pin':
      await handleIpfsPinMessage(message.payload)
      break

    case 'ocr':
      await handleOcrMessage(message.payload)
      break

    default:
      console.warn(`Unknown message type: ${message.type}`)
  }
}

async function handleEmailMessage(payload: Record<string, unknown>): Promise<void> {
  // Implement email sending logic
  console.log('Processing email:', payload)
}

async function handleNotificationMessage(payload: Record<string, unknown>): Promise<void> {
  // Implement notification logic
  console.log('Processing notification:', payload)
}

async function handleAnalyticsMessage(payload: Record<string, unknown>): Promise<void> {
  // Implement analytics processing logic
  console.log('Processing analytics:', payload)
}

async function handleIpfsPinMessage(payload: Record<string, unknown>): Promise<void> {
  const cid = typeof payload.cid === 'string' ? payload.cid : ''
  if (!cid) {
    console.warn('IPFS pin message missing CID')
    return
  }

  const config = useRuntimeConfig()
  const pinataJwt = config.ipfsPinataJwt
  if (!pinataJwt) {
    console.warn('Pinata JWT not configured; skipping pinByHash')
    return
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hashToPin: cid }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pinata pinByHash failed: ${response.status} ${errorText}`)
  }

  console.log('Pinned CID to IPFS via Pinata:', cid)
}

async function handleOcrMessage(payload: Record<string, unknown>): Promise<void> {
  // Placeholder for OCR processing via queue consumer
  console.log('Processing OCR task:', payload)
}
