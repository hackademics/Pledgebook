import { describe, expect, it } from 'bun:test'
import { z } from 'zod'
import {
  applyTemplate,
  hashPrompt,
  runBaselineWorkflow,
  runEvaluationWorkflow,
  runImageVerificationWorkflow,
  runValidationWorkflow,
  scoreToVerdict,
} from '../main'

// ---------------------------------------------------------------------------
// Runtime stub
// ---------------------------------------------------------------------------

type RuntimeStub<TConfig> = {
  config: TConfig
  runInNodeMode: <T>(
    fn: (nr: RuntimeStub<TConfig>) => T,
    _agg: unknown,
  ) => () => { result: () => T }
  log: (...args: unknown[]) => void
  now: () => Date
  callCapability: () => never
  report: () => { result: () => unknown }
  getSecret: () => { result: () => { value: string } }
}

const FIXED_NOW = new Date('2026-01-01T00:00:00.000Z')

const makeRuntime = (scoreOverride?: number) => {
  const config = {
    http: {
      authorizedKeys: [] as Array<{
        type: 'KEY_TYPE_ECDSA_EVM' | 'KEY_TYPE_UNSPECIFIED'
        publicKey: string
      }>,
    },
    templates: {
      validation: 'Validate: {{prompt}} Evidence: {{evidence}}',
      baseline: 'Baseline: {{prompt}} Evidence: {{evidence}}',
      evaluation: 'Evaluate: {{prompt}} Baseline: {{baseline}} Evidence: {{evidence}}',
    },
    endpoints: {
      modelEndpoint: undefined as string | undefined,
      visionModelEndpoint: undefined as string | undefined,
      hashStorageUrl: undefined as string | undefined,
      validationCallbackUrl: undefined as string | undefined,
      baselineCallbackUrl: undefined as string | undefined,
      evaluationCallbackUrl: undefined as string | undefined,
      imageVerificationCallbackUrl: undefined as string | undefined,
    },
    consensus: { passThreshold: 0.66, failThreshold: 0.33 },
    deco: { enabled: false },
  }

  const stub: RuntimeStub<typeof config> = {
    config,
    runInNodeMode: (fn, _agg) => () => ({
      result: () =>
        scoreOverride !== undefined ? (scoreOverride as ReturnType<typeof fn>) : fn(stub),
    }),
    log: () => {},
    now: () => FIXED_NOW,
    callCapability: () => {
      throw new Error('Not used in tests')
    },
    report: () => ({ result: () => ({}) }),
    getSecret: () => ({ result: () => ({ value: 'test-secret' }) }),
  }

  return { config, stub }
}

const { stub: runtime } = makeRuntime(0.9)

const validationInput = {
  request_id: '11111111-1111-1111-1111-111111111111',
  campaign_id: '22222222-2222-2222-2222-222222222222',
  prompt: 'Verify that the project delivered the promised milestones.',
  prompt_hash: '0xdeadbeef',
  evidence: [{ type: 'url' as const, uri: 'https://example.com/report' }],
}

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe('determinism', () => {
  it('hashPrompt produces deterministic 64-char hex', () => {
    const h1 = hashPrompt('zkp-hash-fixture')
    const h2 = hashPrompt('zkp-hash-fixture')
    expect(h1).toHaveLength(64)
    expect(h1).toBe(h2)
  })

  it('hashPrompt differs for different inputs', () => {
    expect(hashPrompt('a')).not.toBe(hashPrompt('b'))
  })

  it('runtime.now() returns fixed timestamp (not wall clock)', () => {
    expect(runtime.now().toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })

  it('created_at uses runtime.now(), not new Date()', () => {
    const output = runValidationWorkflow(runtime, validationInput)
    expect(output.created_at).toBe('2026-01-01T00:00:00.000Z')
  })
})

// ---------------------------------------------------------------------------
// Verdict thresholds
// ---------------------------------------------------------------------------

describe('scoreToVerdict', () => {
  const { config } = makeRuntime()

  it('returns pass at threshold', () => {
    expect(scoreToVerdict(0.66, config)).toBe('pass')
  })

  it('returns pass above threshold', () => {
    expect(scoreToVerdict(1.0, config)).toBe('pass')
  })

  it('returns fail at threshold', () => {
    expect(scoreToVerdict(0.33, config)).toBe('fail')
  })

  it('returns fail below threshold', () => {
    expect(scoreToVerdict(0.0, config)).toBe('fail')
  })

  it('returns needs_review in the middle', () => {
    expect(scoreToVerdict(0.5, config)).toBe('needs_review')
  })
})

// ---------------------------------------------------------------------------
// Heuristic fallback (no modelEndpoint configured)
// ---------------------------------------------------------------------------

describe('heuristic fallback', () => {
  it('short prompt scores fail', () => {
    const { stub } = makeRuntime() // no score override → real fn path
    const output = runValidationWorkflow(stub, {
      ...validationInput,
      prompt: 'short', // 5 chars → 5/500 = 0.01 → fail
    })
    expect(output.verdict).toBe('fail')
  })

  it('long prompt scores pass', () => {
    const { stub } = makeRuntime()
    const longPrompt = 'x'.repeat(400) // 400/500 = 0.8 → pass
    const output = runValidationWorkflow(stub, {
      ...validationInput,
      prompt: longPrompt,
    })
    expect(output.verdict).toBe('pass')
  })
})

// ---------------------------------------------------------------------------
// Template engine
// ---------------------------------------------------------------------------

describe('applyTemplate', () => {
  it('substitutes known keys', () => {
    expect(applyTemplate('Hello {{name}}!', { name: 'world' })).toBe('Hello world!')
  })

  it('leaves unknown keys empty', () => {
    expect(applyTemplate('{{missing}}', {})).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Workflow output schemas
// ---------------------------------------------------------------------------

const validationSchema = z.object({
  request_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  verdict: z.enum(['pass', 'fail', 'needs_review']),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  prompt_hash: z.string().length(64),
  model: z.string(),
  created_at: z.string().datetime(),
})

const baselineSchema = z.object({
  request_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  baseline_summary: z.string().min(1),
  baseline_hash: z.string().length(64),
  baseline_score: z.number().min(0).max(1),
  model: z.string(),
  created_at: z.string().datetime(),
})

const evaluationSchema = z.object({
  request_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  verdict: z.enum(['pass', 'fail', 'needs_review']),
  confidence: z.number().min(0).max(1),
  evaluation_summary: z.string().min(1),
  baseline_hash: z.string().length(64),
  model: z.string(),
  created_at: z.string().datetime(),
})

describe('CRE workflow schemas', () => {
  it('validation output matches schema', () => {
    validationSchema.parse(runValidationWorkflow(runtime, validationInput))
  })

  it('baseline output matches schema', () => {
    baselineSchema.parse(
      runBaselineWorkflow(runtime, {
        request_id: validationInput.request_id,
        campaign_id: validationInput.campaign_id,
        prompt: validationInput.prompt,
        prompt_hash: validationInput.prompt_hash,
        evidence: validationInput.evidence,
      }),
    )
  })

  it('evaluation output matches schema', () => {
    const baseline = runBaselineWorkflow(runtime, {
      request_id: validationInput.request_id,
      campaign_id: validationInput.campaign_id,
      prompt: validationInput.prompt,
      prompt_hash: validationInput.prompt_hash,
      evidence: validationInput.evidence,
    })
    evaluationSchema.parse(
      runEvaluationWorkflow(runtime, {
        request_id: validationInput.request_id,
        campaign_id: validationInput.campaign_id,
        prompt: validationInput.prompt,
        prompt_hash: validationInput.prompt_hash,
        baseline_hash: baseline.baseline_hash,
        evidence: validationInput.evidence,
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// Full flow: validation → baseline → evaluation
// ---------------------------------------------------------------------------

describe('full flow', () => {
  it('baseline_hash propagates from baseline into evaluation output', () => {
    const baseline = runBaselineWorkflow(runtime, {
      request_id: validationInput.request_id,
      campaign_id: validationInput.campaign_id,
      prompt: validationInput.prompt,
      prompt_hash: validationInput.prompt_hash,
      evidence: validationInput.evidence,
    })

    const evaluation = runEvaluationWorkflow(runtime, {
      request_id: validationInput.request_id,
      campaign_id: validationInput.campaign_id,
      prompt: validationInput.prompt,
      prompt_hash: validationInput.prompt_hash,
      baseline_hash: baseline.baseline_hash,
      evidence: validationInput.evidence,
    })

    expect(evaluation.baseline_hash).toBe(baseline.baseline_hash)
  })

  it('baseline now calls the model and embeds score in hash', () => {
    const { stub } = makeRuntime(0.75)
    const baseline = runBaselineWorkflow(stub, {
      request_id: validationInput.request_id,
      campaign_id: validationInput.campaign_id,
      prompt: validationInput.prompt,
      prompt_hash: validationInput.prompt_hash,
    })
    expect(baseline.baseline_score).toBe(0.75)
    expect(baseline.baseline_summary).toContain('0.7500')
  })
})

// ---------------------------------------------------------------------------
// Image verification
// ---------------------------------------------------------------------------

describe('image verification', () => {
  it('throws when visionModelEndpoint is not configured', () => {
    expect(() =>
      runImageVerificationWorkflow(runtime, {
        request_id: validationInput.request_id,
        campaign_id: validationInput.campaign_id,
        prompt: 'verify image',
        prompt_hash: '0xdeadbeef',
        baseline_image_url: 'https://example.com/before.jpg',
        completion_image_url: 'https://example.com/after.jpg',
        verification_criteria: {
          target_text: 'banner',
          baseline_count: 0,
          required_count: 1,
        },
      }),
    ).toThrow('Vision model endpoint not configured')
  })

  it('returns correct structure when vision model responds', () => {
    const { config, stub: base } = makeRuntime()
    config.endpoints.visionModelEndpoint = 'https://vision.example.com/verify'

    const visionStub = {
      ...base,
      runInNodeMode: (_fn: unknown, _agg: unknown) => () => ({
        result: () => ({
          baseline_count: 0,
          completion_count: 1,
          meets_criteria: true,
          confidence: 0.95,
          reasoning: 'Banner detected in completion image.',
          score: 0.9,
        }),
      }),
    }

    const output = runImageVerificationWorkflow(visionStub as typeof base, {
      request_id: validationInput.request_id,
      campaign_id: validationInput.campaign_id,
      prompt: 'verify banner placement',
      prompt_hash: '0xdeadbeef',
      baseline_image_url: 'https://example.com/before.jpg',
      completion_image_url: 'https://example.com/after.jpg',
      verification_criteria: {
        target_text: 'banner',
        baseline_count: 0,
        required_count: 1,
      },
    })

    expect(output.verdict).toBe('pass')
    expect(output.confidence).toBe(0.95)
    expect(output.baseline_detected_count).toBe(0)
    expect(output.completion_detected_count).toBe(1)
    expect(output.created_at).toBe('2026-01-01T00:00:00.000Z')
  })
})
