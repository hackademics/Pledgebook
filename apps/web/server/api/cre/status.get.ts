import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { parseQuery, sendSuccess } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { useCloudflareOptional } from '../../utils/cloudflare'

const querySchema = z.object({
  request_id: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, querySchema)
    const cloudflare = useCloudflareOptional(event)

    if (!cloudflare) {
      return sendSuccess(event, {
        available: false,
        reason: 'cloudflare-bindings-missing',
        request_id: query.request_id,
      })
    }

    const { DB } = cloudflare
    const result = await DB.prepare(
      `
      SELECT
        log_id,
        action,
        status,
        entity_id,
        details,
        created_at
      FROM audit_log
      WHERE request_id = ?
        AND action = 'cre_callback'
      ORDER BY created_at DESC
      LIMIT 20
    `,
    )
      .bind(query.request_id)
      .all()

    return sendSuccess(event, {
      available: true,
      request_id: query.request_id,
      logs: result.results ?? [],
    })
  } catch (error) {
    throw handleError(error)
  }
})
