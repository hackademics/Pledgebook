import type { QueueMessage } from '../types/cloudflare'

/**
 * Queue Consumer Handler
 *
 * This module exports a queue handler that processes messages from Cloudflare Queues.
 * It is automatically invoked when messages are available in the queue.
 *
 * Note: Queue consumers run as separate worker invocations, not as part of HTTP requests.
 * This plugin only registers the hook when running in a Cloudflare environment.
 */

export default defineNitroPlugin((nitroApp) => {
  // Only register queue consumer when running in Cloudflare (production or wrangler dev)
  // Skip during regular nuxt dev to avoid hanging
  if (import.meta.dev && !process.env.CF_PAGES) {
    return
  }

  // Register queue consumer hook
  // @ts-expect-error Cloudflare queue hook is not typed in Nitro yet
  nitroApp.hooks.hook(
    'cloudflare:queue',
    async ({ batch }: { batch: MessageBatch<QueueMessage> }) => {
      console.log(`Processing ${batch.messages.length} messages from queue: ${batch.queue}`)

      for (const message of batch.messages) {
        try {
          await processMessage(message.body)
          message.ack()
        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error)
          message.retry()
        }
      }
    }
  )
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
