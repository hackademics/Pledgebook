import { defineNitroPlugin } from 'nitropack/runtime'
import type { QueueMessage } from '../types/cloudflare'
import type { NitroApp } from 'nitropack/types'
import { useRuntimeConfig } from '#imports'
import { createLogger } from '../utils/logger'

const logger = createLogger('QueueConsumer')

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
    logger.info('Processing queue batch', { count: batch.messages.length, queue: batch.queue })

    for (const message of batch.messages) {
      try {
        await processMessage(message.body as QueueMessage)
        message.ack()
      } catch (error) {
        logger.error('Failed to process message', { messageId: message.id, error: String(error) })
        message.retry()
      }
    }
  })
})

async function processMessage(message: QueueMessage): Promise<void> {
  logger.debug('Processing message', { type: message.type })

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
      logger.warn('Unknown message type', { type: message.type })
  }
}

async function handleEmailMessage(payload: Record<string, unknown>): Promise<void> {
  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey as string | undefined
  if (!resendApiKey) {
    logger.warn('Resend API key not configured; skipping email send')
    return
  }

  const to = typeof payload.to === 'string' ? payload.to : ''
  const subject = typeof payload.subject === 'string' ? payload.subject : ''
  const html = typeof payload.html === 'string' ? payload.html : ''

  if (!to || !subject) {
    logger.warn('Email message missing required fields', { to: !!to, subject: !!subject })
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: typeof payload.from === 'string' ? payload.from : 'Pledgebook <noreply@pledgebook.io>',
      to,
      subject,
      html: html || `<p>${subject}</p>`,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend email send failed: ${response.status} ${errorText}`)
  }

  logger.info('Email sent successfully', { to: to.replace(/(.{2}).*(@.*)/, '$1***$2'), subject })
}

async function handleNotificationMessage(payload: Record<string, unknown>): Promise<void> {
  const config = useRuntimeConfig()
  const notificationEndpoint = config.notificationWebhookUrl as string | undefined

  const userId = typeof payload.userId === 'string' ? payload.userId : ''
  const title = typeof payload.title === 'string' ? payload.title : ''
  const body = typeof payload.body === 'string' ? payload.body : ''
  const type = typeof payload.notificationType === 'string' ? payload.notificationType : 'general'

  if (!userId || !title) {
    logger.warn('Notification message missing required fields', {
      userId: !!userId,
      title: !!title,
    })
    return
  }

  // If a webhook endpoint is configured, forward the notification
  if (notificationEndpoint) {
    const response = await fetch(notificationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, type, timestamp: new Date().toISOString() }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Notification webhook failed: ${response.status} ${errorText}`)
    }
  }

  logger.info('Notification processed', { userId: userId.substring(0, 8) + '...', type })
}

async function handleAnalyticsMessage(payload: Record<string, unknown>): Promise<void> {
  const config = useRuntimeConfig()
  const analyticsEndpoint = config.analyticsEndpoint as string | undefined

  const event = typeof payload.event === 'string' ? payload.event : 'unknown'
  const properties = typeof payload.properties === 'object' ? payload.properties : {}

  if (analyticsEndpoint) {
    const response = await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties,
        timestamp:
          typeof payload.timestamp === 'string' ? payload.timestamp : new Date().toISOString(),
        source: 'pledgebook-queue',
      }),
    })

    if (!response.ok) {
      logger.warn('Analytics endpoint returned error', { status: response.status, event })
    }
  }

  logger.info('Analytics event processed', { event })
}

async function handleIpfsPinMessage(payload: Record<string, unknown>): Promise<void> {
  const cid = typeof payload.cid === 'string' ? payload.cid : ''
  if (!cid) {
    logger.warn('IPFS pin message missing CID')
    return
  }

  const config = useRuntimeConfig()
  const pinataJwt = config.ipfsPinataJwt
  if (!pinataJwt) {
    logger.warn('Pinata JWT not configured; skipping pinByHash')
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

  logger.info('Pinned CID to IPFS via Pinata', { cid })
}

async function handleOcrMessage(payload: Record<string, unknown>): Promise<void> {
  const config = useRuntimeConfig()
  const imageUrl = typeof payload.imageUrl === 'string' ? payload.imageUrl : ''
  const campaignId = typeof payload.campaignId === 'string' ? payload.campaignId : ''
  const disputeId = typeof payload.disputeId === 'string' ? payload.disputeId : ''

  if (!imageUrl) {
    logger.warn('OCR message missing imageUrl')
    return
  }

  // Use AI SDK to extract text from image
  const anthropicApiKey = config.anthropicApiKey as string | undefined
  if (!anthropicApiKey) {
    logger.warn('Anthropic API key not configured; skipping OCR processing')
    return
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: imageUrl },
              },
              {
                type: 'text',
                text: 'Extract all visible text from this image. Return the text exactly as it appears, preserving numbers and formatting. If this is a measurement (scale, meter reading, etc.), clearly identify the primary value.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Anthropic API OCR failed: ${response.status} ${errorText}`)
    }

    const result = (await response.json()) as { content?: Array<{ text?: string }> }
    const extractedText = result.content?.[0]?.text || ''

    logger.info('OCR extraction complete', {
      campaignId,
      disputeId,
      textLength: extractedText.length,
    })
  } catch (error) {
    logger.error('OCR processing failed', { imageUrl, error: String(error) })
    throw error
  }
}
