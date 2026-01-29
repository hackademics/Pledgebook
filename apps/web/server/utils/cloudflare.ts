import type { H3Event } from 'h3'
import type { CloudflareBindings } from '../types/cloudflare'

/**
 * Get Cloudflare bindings from the H3 event context
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const { DB, KV, R2, QUEUE, AI } = useCloudflare(event)
 *
 *   // Use D1 database
 *   const users = await DB.prepare('SELECT * FROM users').all()
 *
 *   // Use KV store
 *   await KV.put('key', 'value')
 *
 *   // Use R2 storage
 *   await R2.put('file.txt', 'content')
 *
 *   // Send to queue
 *   await QUEUE.send({ type: 'email', payload: {}, timestamp: Date.now() })
 *
 *   // Use Workers AI
 *   const response = await AI.run('@cf/meta/llama-3.1-8b-instruct', { prompt: 'Hello' })
 * })
 * ```
 */
export function useCloudflare(event: H3Event): CloudflareBindings {
  const cloudflare = event.context.cloudflare

  if (!cloudflare) {
    throw new Error(
      'Cloudflare bindings not available. Ensure you are running with wrangler or deployed to Cloudflare.'
    )
  }

  return cloudflare.env
}

/**
 * Get the Cloudflare execution context
 * Useful for waitUntil() and passThroughOnException()
 */
export function useExecutionContext(event: H3Event): ExecutionContext {
  const cloudflare = event.context.cloudflare

  if (!cloudflare) {
    throw new Error(
      'Cloudflare context not available. Ensure you are running with wrangler or deployed to Cloudflare.'
    )
  }

  return cloudflare.context
}

/**
 * Safely get Cloudflare bindings, returns null if not available
 * Useful for code that needs to work in both Cloudflare and local dev environments
 */
export function useCloudflareOptional(event: H3Event): CloudflareBindings | null {
  return event.context.cloudflare?.env ?? null
}

/**
 * Check if running in Cloudflare environment
 */
export function isCloudflareEnvironment(event: H3Event): boolean {
  return !!event.context.cloudflare
}
