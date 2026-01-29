import { defineEventHandler, readBody, createError } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'

/**
 * Example Queue API Route
 * Demonstrates sending messages to a Cloudflare Queue
 */
export default defineEventHandler(async (event) => {
  const { QUEUE } = useCloudflare(event)

  const body = await readBody(event)

  if (!body.type) {
    throw createError({
      statusCode: 400,
      message: 'Message type is required',
    })
  }

  // Send message to queue
  await QUEUE.send({
    type: body.type,
    payload: body.payload || {},
    timestamp: Date.now(),
  })

  return {
    success: true,
    message: 'Message queued successfully',
    type: body.type,
  }
})
