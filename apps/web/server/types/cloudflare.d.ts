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

  /** R2 Storage bucket binding (named STORAGE in wrangler.toml) */
  STORAGE: R2Bucket

  /** Workers KV namespace binding */
  KV: KVNamespace

  /** Cache KV namespace binding */
  CACHE?: KVNamespace

  /** Rate limits KV namespace binding */
  RATE_LIMITS?: KVNamespace

  /** Queue producer bindings */
  QUEUE?: Queue<QueueMessage>
  BLOCKCHAIN_EVENTS_QUEUE?: Queue<QueueMessage>
  NOTIFICATIONS_QUEUE?: Queue<QueueMessage>
  AI_VERIFICATION_QUEUE?: Queue<QueueMessage>
  RECEIPTS_QUEUE?: Queue<QueueMessage>
  AUDIT_EVENTS_QUEUE?: Queue<QueueMessage>

  /** Workers AI binding */
  AI: Ai

  /** Static assets binding */
  ASSETS: Fetcher

  /** Environment variables */
  ENVIRONMENT: string
  IPFS_GATEWAY_URL?: string
  IPFS_PINATA_JWT?: string
  NUXT_IPFS_PINATA_SECRET_JWT?: string
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
    auth?: {
      address: string
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
