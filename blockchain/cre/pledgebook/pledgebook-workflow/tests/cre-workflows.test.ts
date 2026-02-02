import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import {
  hashPrompt,
  runBaselineWorkflow,
  runEvaluationWorkflow,
  runValidationWorkflow,
} from '../main'

type RuntimeStub<TConfig> = {
  config: TConfig
  runInNodeMode: () => () => { result: () => number }
  log: () => void
  now: () => Date
  callCapability: () => never
  report: () => { result: () => unknown }
  getSecret: () => { result: () => unknown }
}

const config = {
  http: { authorizedKeys: [] },
  templates: {
    validation: 'Validate: {{prompt}} Evidence: {{evidence}}',
    baseline: 'Baseline: {{prompt}} Evidence: {{evidence}}',
    evaluation: 'Evaluate: {{prompt}} Baseline: {{baseline}} Evidence: {{evidence}}',
  },
  endpoints: {
    modelEndpoint: undefined,
    hashStorageUrl: undefined,
    validationCallbackUrl: undefined,
    baselineCallbackUrl: undefined,
    evaluationCallbackUrl: undefined,
  },
  consensus: { passThreshold: 0.66, failThreshold: 0.33 },
  deco: { enabled: false },
}

const runtime: RuntimeStub<typeof config> = {
  config,
  runInNodeMode: () => () => ({ result: () => 0.9 }),
  log: () => {},
  now: () => new Date(),
  callCapability: () => {
    throw new Error('Not used in tests')
  },
  report: () => ({ result: () => ({}) }),
  getSecret: () => ({ result: () => ({}) }),
}

const validationInput = {
  request_id: '11111111-1111-1111-1111-111111111111',
  campaign_id: '22222222-2222-2222-2222-222222222222',
  prompt: 'Verify that the project delivered the promised milestones.',
  prompt_hash: '0xdeadbeef',
  evidence: [{ type: 'url' as const, uri: 'https://example.com/report' }],
}

describe('CRE workflows', () => {
  it('mocks AI responses with schema validation', async () => {
    const output = await runValidationWorkflow(runtime, validationInput)

    const schema = z.object({
      request_id: z.string().uuid(),
      campaign_id: z.string().uuid(),
      verdict: z.enum(['pass', 'fail', 'needs_review']),
      confidence: z.number().min(0).max(1),
      summary: z.string().min(1),
    })

    schema.parse(output)
  })

  it('simulates validation → baseline → evaluation flow', async () => {
    const validation = await runValidationWorkflow(runtime, validationInput)
    const baseline = await runBaselineWorkflow(runtime, {
      request_id: validation.request_id,
      campaign_id: validation.campaign_id,
      prompt: validationInput.prompt,
      prompt_hash: validationInput.prompt_hash,
      evidence: validationInput.evidence,
    })

    const evaluation = await runEvaluationWorkflow(runtime, {
      request_id: validation.request_id,
      campaign_id: validation.campaign_id,
      prompt: validationInput.prompt,
      prompt_hash: validationInput.prompt_hash,
      baseline_hash: baseline.baseline_hash,
      evidence: validationInput.evidence,
    })

    expect(evaluation.signals?.baseline_hash).toBe(baseline.baseline_hash)
  })

  it('generates deterministic prompt hashes', () => {
    const hash = hashPrompt('zkp-hash-fixture')
    expect(hash).toHaveLength(64)
  })
})
