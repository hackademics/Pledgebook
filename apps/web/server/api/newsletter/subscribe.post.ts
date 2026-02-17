import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createLogger } from '../../utils/logger'
import { useCloudflare } from '../../utils/cloudflare'

const logger = createLogger('newsletter')

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter.
 * Persists to D1 (with KV dedup cache) and optionally sends a welcome email via queue.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = subscribeSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    const { DB, KV, QUEUE } = useCloudflare(event)

    // Quick dedup check via KV cache
    const cacheKey = `newsletter:${normalizedEmail}`
    const existing = await KV.get(cacheKey)
    if (existing) {
      return sendSuccess(event, { subscribed: true, message: 'Already subscribed' })
    }

    // Ensure the newsletter_subscribers table exists (idempotent)
    await DB.prepare(
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
        unsubscribed_at TEXT,
        source TEXT DEFAULT 'blog'
      )`,
    ).run()

    // Insert into D1 (ignore duplicates)
    const result = await DB.prepare(
      `INSERT OR IGNORE INTO newsletter_subscribers (email, source) VALUES (?, ?)`,
    )
      .bind(normalizedEmail, 'blog')
      .run()

    // Cache in KV for fast dedup (24h TTL)
    await KV.put(cacheKey, '1', { expirationTtl: 86400 })

    const isNew = result.meta?.changes === 1

    // Queue a welcome email if this is a new subscriber
    if (isNew && QUEUE) {
      try {
        await QUEUE.send({
          type: 'email',
          payload: {
            to: normalizedEmail,
            subject: 'Welcome to Pledgebook!',
            body: "Thanks for subscribing to the Pledgebook newsletter. We'll keep you updated on new features, campaigns, and insights about verifiable crowdfunding.",
          },
          timestamp: Date.now(),
        })
      } catch (queueError) {
        // Non-blocking — subscription still succeeds
        logger.warn('Failed to queue welcome email', { error: String(queueError) })
      }
    }

    logger.info('Newsletter subscription', {
      email: normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
      isNew,
    })

    return sendSuccess(event, {
      subscribed: true,
      message: isNew ? 'Successfully subscribed' : 'Already subscribed',
    })
  } catch (error) {
    throw handleError(error)
  }
})
