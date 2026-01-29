import { defineEventHandler, getMethod, readBody, createError } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'

/**
 * Example D1 Database API Route
 * Demonstrates querying and inserting data with D1
 */
export default defineEventHandler(async (event) => {
  const { DB } = useCloudflare(event)

  const method = getMethod(event)

  if (method === 'GET') {
    // Example: Fetch all records
    const result = await DB.prepare('SELECT * FROM example_table LIMIT 10').all()
    return {
      success: true,
      data: result.results,
      meta: result.meta,
    }
  }

  if (method === 'POST') {
    // Example: Insert a record
    const body = await readBody(event)
    const result = await DB.prepare('INSERT INTO example_table (name, value) VALUES (?, ?)')
      .bind(body.name, body.value)
      .run()

    return {
      success: result.success,
      meta: result.meta,
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
