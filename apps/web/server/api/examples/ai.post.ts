import { defineEventHandler, readBody, createError } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'

/**
 * Example Workers AI API Route
 * Demonstrates text generation with Workers AI
 */
export default defineEventHandler(async (event) => {
  const { AI } = useCloudflare(event)

  const body = await readBody(event)

  if (!body.prompt) {
    throw createError({
      statusCode: 400,
      message: 'Prompt is required',
    })
  }

  const model = body.model || '@cf/meta/llama-3.1-8b-instruct'

  // Run AI inference
  const response = await AI.run(model, {
    prompt: body.prompt,
    max_tokens: body.maxTokens || 256,
    temperature: body.temperature || 0.7,
  })

  return {
    success: true,
    model,
    response,
  }
})
