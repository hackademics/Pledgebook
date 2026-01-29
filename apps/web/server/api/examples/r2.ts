import {
  defineEventHandler,
  getMethod,
  getQuery,
  getHeader,
  setHeader,
  readRawBody,
  createError,
} from 'h3'
import { useCloudflare } from '../../utils/cloudflare'

/**
 * Example R2 Storage API Route
 * Demonstrates file upload/download with R2
 */
export default defineEventHandler(async (event) => {
  const { R2 } = useCloudflare(event)

  const method = getMethod(event)
  const query = getQuery(event)
  const key = query.key as string

  if (method === 'GET') {
    if (!key) {
      // List objects in bucket
      const objects = await R2.list({ limit: 100 })
      return {
        success: true,
        objects: objects.objects.map((obj) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          etag: obj.etag,
        })),
        truncated: objects.truncated,
      }
    }

    // Get specific object
    const object = await R2.get(key)

    if (!object) {
      throw createError({
        statusCode: 404,
        message: 'Object not found',
      })
    }

    // Return file with appropriate headers
    setHeader(event, 'Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
    setHeader(event, 'ETag', object.etag)

    return object.body
  }

  if (method === 'PUT') {
    if (!key) {
      throw createError({
        statusCode: 400,
        message: 'Key parameter is required for upload',
      })
    }

    // Get the raw body for file upload
    const body = await readRawBody(event)

    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'Request body is required',
      })
    }

    const contentType = getHeader(event, 'content-type') || 'application/octet-stream'

    await R2.put(key, body, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    })

    return {
      success: true,
      key,
      message: 'File uploaded successfully',
    }
  }

  if (method === 'DELETE') {
    if (!key) {
      throw createError({
        statusCode: 400,
        message: 'Key parameter is required for deletion',
      })
    }

    await R2.delete(key)

    return {
      success: true,
      key,
      message: 'File deleted successfully',
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
