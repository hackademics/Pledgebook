import { defineEventHandler, getMethod, getQuery, readBody, createError } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'

/**
 * Example KV Store API Route
 * Demonstrates get/put operations with Workers KV
 */
export default defineEventHandler(async (event) => {
  const { KV } = useCloudflare(event)

  const method = getMethod(event)
  const query = getQuery(event)
  const key = query.key as string

  if (!key) {
    throw createError({
      statusCode: 400,
      message: 'Key parameter is required',
    })
  }

  if (method === 'GET') {
    // Get value from KV
    const value = await KV.get(key)
    const metadata = await KV.getWithMetadata(key)

    return {
      success: true,
      key,
      value,
      metadata: metadata.metadata,
    }
  }

  if (method === 'PUT') {
    // Store value in KV
    const body = await readBody(event)

    await KV.put(key, JSON.stringify(body.value), {
      expirationTtl: body.ttl || 3600, // Default 1 hour
      metadata: { updatedAt: new Date().toISOString() },
    })

    return {
      success: true,
      key,
      message: 'Value stored successfully',
    }
  }

  if (method === 'DELETE') {
    // Delete value from KV
    await KV.delete(key)

    return {
      success: true,
      key,
      message: 'Value deleted successfully',
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
