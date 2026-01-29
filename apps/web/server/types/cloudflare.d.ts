/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Bindings Type Definitions
 *
 * These types define the bindings available in your Cloudflare Workers environment.
 * Update these types to match your wrangler.toml configuration.
 */

export interface CloudflareBindings {
  /** D1 Database binding */
  DB: D1Database

  /** R2 Storage bucket binding */
  R2: R2Bucket

  /** Workers KV namespace binding */
  KV: KVNamespace

  /** Queue producer binding */
  QUEUE: Queue<QueueMessage>

  /** Workers AI binding */
  AI: Ai

  /** Static assets binding */
  ASSETS: Fetcher

  /** Environment variables */
  ENVIRONMENT: string
}

/**
 * Queue message payload type
 * Define the structure of messages sent to your queue
 */
export interface QueueMessage {
  type: string
  payload: Record<string, unknown>
  timestamp: number
}

/**
 * Extend the H3Event context to include Cloudflare bindings
 */
declare module 'h3' {
  interface H3EventContext {
    cloudflare?: {
      env: CloudflareBindings
      context: ExecutionContext
    }
  }
}

/**
 * Extend Nitro's runtime config
 */
declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'cloudflare:scheduled': (event: ScheduledEvent) => void | Promise<void>
  }
}

export {}
