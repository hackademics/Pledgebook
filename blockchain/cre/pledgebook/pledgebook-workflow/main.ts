import {
  ConsensusAggregationByFields,
  consensusIdenticalAggregation,
  consensusMedianAggregation,
  cre,
  handler,
  identical,
  ignore,
  median,
  ok,
  type HTTPPayload,
  type NodeRuntime,
  type Runtime,
  Runner,
} from '@chainlink/cre-sdk'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EvidenceItem = {
  evidence_id?: string
  type: 'file' | 'url' | 'text' | 'image' | 'video' | 'audio'
  uri: string
  hash?: string
  metadata?: Record<string, string | number | boolean>
}

type CRERequestMetadata = {
  requester?: string
  environment?: 'local' | 'staging' | 'production'
  version?: string
  trace_id?: string
}

type CREValidationInput = {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  evidence?: EvidenceItem[]
  baseline_data?: Record<string, string | number | boolean>
  metadata?: CRERequestMetadata
}

type CREBaselineInput = {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  evidence?: EvidenceItem[]
  metadata?: CRERequestMetadata
}

type CREEvaluationInput = {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  baseline_hash: string
  evidence?: EvidenceItem[]
  metadata?: CRERequestMetadata
}

type CREValidationOutput = {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  summary: string
  prompt_hash: string
  model: string
  created_at: string
}

type CREBaselineOutput = {
  request_id: string
  campaign_id: string
  baseline_summary: string
  baseline_hash: string
  input_prompt_hash: string
  baseline_score: number
  model: string
  created_at: string
}

type CREEvaluationOutput = {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  evaluation_summary: string
  consensus: number
  baseline_hash: string
  prompt_hash: string
  model: string
  created_at: string
}

type CREImageVerificationOutput = {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  evaluation_summary: string
  baseline_detected_count: number
  completion_detected_count: number
  consensus: number
  model: string
  created_at: string
}

type CREImageVerificationInput = {
  request_id: string
  campaign_id: string
  prompt: string
  prompt_hash: string
  baseline_image_url: string
  completion_image_url: string
  verification_criteria: {
    target_text: string
    baseline_count: number
    required_count: number
  }
  metadata?: CRERequestMetadata
}

// ---------------------------------------------------------------------------
// Config with zod validation — catches misconfigured deployments at startup
// ---------------------------------------------------------------------------

const configSchema = z.object({
  http: z.object({
    authorizedKeys: z.array(
      z.object({
        type: z.enum(['KEY_TYPE_ECDSA_EVM', 'KEY_TYPE_UNSPECIFIED']),
        publicKey: z.string(),
      }),
    ),
  }),
  templates: z.object({
    validation: z.string(),
    baseline: z.string(),
    evaluation: z.string(),
    imageVerification: z.string().optional(),
  }),
  endpoints: z.object({
    modelEndpoint: z.string().optional(),
    visionModelEndpoint: z.string().optional(),
    hashStorageUrl: z.string().optional(),
    validationCallbackUrl: z.string().optional(),
    baselineCallbackUrl: z.string().optional(),
    evaluationCallbackUrl: z.string().optional(),
    imageVerificationCallbackUrl: z.string().optional(),
  }),
  consensus: z.object({
    passThreshold: z.number(),
    failThreshold: z.number(),
  }),
  deco: z.object({
    enabled: z.boolean(),
  }),
})

type Config = z.infer<typeof configSchema>

type WorkflowEnvelope =
  | { workflow: 'validation'; data: CREValidationInput }
  | { workflow: 'baseline'; data: CREBaselineInput }
  | { workflow: 'evaluation'; data: CREEvaluationInput }
  | { workflow: 'image-verification'; data: CREImageVerificationInput }

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

// FIX P0-1: runtime.now() ensures all DON nodes share the same timestamp.
// Never use new Date() or Date.now() inside a workflow.
const nowIso = (runtime: Runtime<Config>): string => runtime.now().toISOString()

const decodePayload = (payload: HTTPPayload): WorkflowEnvelope => {
  const decoded = new TextDecoder().decode(payload.input ?? new Uint8Array())
  return JSON.parse(decoded) as WorkflowEnvelope
}

export const applyTemplate = (template: string, values: Record<string, string>): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '')

// FIX P0-3: node:crypto is unavailable in the QuickJS/WASM runtime.
// @noble/hashes is explicitly WASM-compatible and has no Node.js dependencies.
export const hashPrompt = (prompt: string): string =>
  bytesToHex(sha256(new TextEncoder().encode(prompt)))

// P2: append truncation notice so the AI model knows evidence was clipped
const summarizeEvidence = (evidence: EvidenceItem[] | undefined): string => {
  const items = evidence ?? []
  const MAX = 5
  const summary = items
    .slice(0, MAX)
    .map((item) => `${item.type}:${item.uri}`)
    .join(' | ')
  return items.length > MAX ? `${summary} ... (+${items.length - MAX} more)` : summary
}

export const scoreToVerdict = (score: number, config: Config): 'pass' | 'fail' | 'needs_review' => {
  if (score >= config.consensus.passThreshold) return 'pass'
  if (score <= config.consensus.failThreshold) return 'fail'
  return 'needs_review'
}

// ---------------------------------------------------------------------------
// Core scoring — runs inside runInNodeMode on each DON node independently
// ---------------------------------------------------------------------------

const scorePrompt = (
  nodeRuntime: NodeRuntime<Config>,
  prompt: string,
  evidence: EvidenceItem[] | undefined,
): number => {
  const endpoint = nodeRuntime.config.endpoints.modelEndpoint
  if (!endpoint) {
    // Heuristic fallback for simulation / local dev (no real model call)
    return Math.min(1, Math.max(0, prompt.length / 500))
  }

  const http = new cre.capabilities.HTTPClient()
  const response = http
    .sendRequest(nodeRuntime, {
      url: endpoint,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt,
        evidence: (evidence ?? []).map((item) => ({
          type: item.type,
          uri: item.uri,
          metadata: item.metadata ?? {},
        })),
      }),
    })
    .result()

  if (!ok(response)) {
    throw new Error(`Model request failed with status: ${response.statusCode}`)
  }

  const data = JSON.parse(new TextDecoder().decode(response.body ?? new Uint8Array())) as {
    score?: number
  }

  return Math.min(1, Math.max(0, data.score ?? 0.5))
}

const scoreWithConsensus = (
  runtime: Runtime<Config>,
  prompt: string,
  evidence: EvidenceItem[] | undefined,
): number =>
  runtime
    .runInNodeMode(
      (nodeRuntime) => scorePrompt(nodeRuntime, prompt, evidence),
      consensusMedianAggregation<number>(),
    )()
    .result()

// ---------------------------------------------------------------------------
// Callback — fire-and-forget POST to backend.
// FIX P0-2:
//   - cacheSettings.store=true + maxAge ensures exactly ONE real HTTP call
//     across all DON nodes (first node fires, others read from shared cache)
//   - consensusIdenticalAggregation is semantically correct for status codes
//     (all nodes must agree on the same response, not a median)
// ---------------------------------------------------------------------------

const requestCallback = (
  runtime: Runtime<Config>,
  url: string | undefined,
  payload: Record<string, string | number | boolean>,
): void => {
  if (!url) return

  const http = new cre.capabilities.HTTPClient()
  http
    .sendRequest(
      runtime,
      (sender) => {
        const response = sender
          .sendRequest({
            url,
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
            // Single-execution: first node fires real request, others use cache
            cacheSettings: {
              store: true,
              maxAge: '60s', // DurationJson is a string per bufbuild/protobuf
            },
          })
          .result()

        if (!ok(response)) {
          throw new Error(`Callback failed with status: ${response.statusCode}`)
        }

        return response.statusCode
      },
      consensusIdenticalAggregation<number>(),
    )()
    .result()
}

const storePromptHash = (
  runtime: Runtime<Config>,
  requestId: string,
  campaignId: string,
  promptHash: string,
): void => {
  requestCallback(runtime, runtime.config.endpoints.hashStorageUrl, {
    request_id: requestId,
    campaign_id: campaignId,
    prompt_hash: promptHash,
  })
}

const fetchPrivateEvidence = (
  runtime: Runtime<Config>,
  evidence: EvidenceItem[] | undefined,
): void => {
  if (!runtime.config.deco.enabled) return

  const privateEvidence = (evidence ?? []).filter((item) => item.metadata?.private === true)

  if (privateEvidence.length === 0) return

  // ConfidentialHTTPClient.sendRequest takes Runtime (not NodeRuntime) per SDK.
  // The request field maps to a single HTTPRequest (not a batch).
  const confidential = new cre.capabilities.ConfidentialHTTPClient()
  for (const item of privateEvidence) {
    confidential
      .sendRequest(runtime, {
        vaultDonSecrets: [],
        request: {
          url: item.uri,
          method: 'GET',
          bodyString: '',
        },
      })
      .result()
  }
}

// ---------------------------------------------------------------------------
// Workflow handlers
// ---------------------------------------------------------------------------

export const runValidationWorkflow = (
  runtime: Runtime<Config>,
  input: CREValidationInput,
): CREValidationOutput => {
  fetchPrivateEvidence(runtime, input.evidence)

  const prompt = applyTemplate(runtime.config.templates.validation, {
    prompt: input.prompt,
    evidence: summarizeEvidence(input.evidence),
  })
  const promptHash = hashPrompt(prompt)
  const score = scoreWithConsensus(runtime, prompt, input.evidence)
  const verdict = scoreToVerdict(score, runtime.config)

  storePromptHash(runtime, input.request_id, input.campaign_id, promptHash)

  const output: CREValidationOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    verdict,
    confidence: score,
    summary: `Validation completed with verdict ${verdict}.`,
    prompt_hash: promptHash,
    model: runtime.config.endpoints.modelEndpoint ?? 'heuristic',
    created_at: nowIso(runtime), // FIX P0-1: DON-consensus time
  }

  requestCallback(runtime, runtime.config.endpoints.validationCallbackUrl, {
    ...output,
    confidence: output.confidence,
  })

  return output
}

export const runBaselineWorkflow = (
  runtime: Runtime<Config>,
  input: CREBaselineInput,
): CREBaselineOutput => {
  fetchPrivateEvidence(runtime, input.evidence)

  const prompt = applyTemplate(runtime.config.templates.baseline, {
    prompt: input.prompt,
    evidence: summarizeEvidence(input.evidence),
  })

  // P1: actually call the model to get a real baseline signal
  const score = scoreWithConsensus(runtime, prompt, input.evidence)
  const baselineSummary = `Baseline captured (score=${score.toFixed(4)}): ${prompt.slice(0, 160)}`
  const baselineHash = hashPrompt(baselineSummary)

  storePromptHash(runtime, input.request_id, input.campaign_id, baselineHash)

  const output: CREBaselineOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    baseline_summary: baselineSummary,
    baseline_hash: baselineHash,
    input_prompt_hash: input.prompt_hash,
    baseline_score: score,
    model: runtime.config.endpoints.modelEndpoint ?? 'heuristic',
    created_at: nowIso(runtime), // FIX P0-1
  }

  requestCallback(runtime, runtime.config.endpoints.baselineCallbackUrl, {
    ...output,
    baseline_score: output.baseline_score,
  })

  return output
}

export const runEvaluationWorkflow = (
  runtime: Runtime<Config>,
  input: CREEvaluationInput,
): CREEvaluationOutput => {
  fetchPrivateEvidence(runtime, input.evidence)

  const prompt = applyTemplate(runtime.config.templates.evaluation, {
    prompt: input.prompt,
    evidence: summarizeEvidence(input.evidence),
    baseline: input.baseline_hash,
  })

  const score = scoreWithConsensus(runtime, prompt, input.evidence)
  const verdict = scoreToVerdict(score, runtime.config)

  const output: CREEvaluationOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    verdict,
    confidence: score,
    evaluation_summary: `Evaluation completed with verdict ${verdict}.`,
    consensus: score,
    baseline_hash: input.baseline_hash,
    prompt_hash: input.prompt_hash,
    model: runtime.config.endpoints.modelEndpoint ?? 'heuristic',
    created_at: nowIso(runtime), // FIX P0-1
  }

  requestCallback(runtime, runtime.config.endpoints.evaluationCallbackUrl, {
    ...output,
    confidence: output.confidence,
    consensus: output.consensus,
  })

  return output
}

// Vision result type — object consensus via field-level aggregation
type VisionResult = {
  baseline_count: number
  completion_count: number
  meets_criteria: boolean
  confidence: number
  reasoning: string
  score: number
}

// FIX P1: ConsensusAggregationByFields lets each field use the correct
// aggregation strategy. median() for numerics, identical() for booleans/strings.
const visionResultAggregation = ConsensusAggregationByFields<VisionResult>({
  baseline_count: median,
  completion_count: median,
  meets_criteria: identical,
  confidence: median,
  reasoning: ignore, // free-text varies across nodes — don't consensus on it
  score: median,
})

export const runImageVerificationWorkflow = (
  runtime: Runtime<Config>,
  input: CREImageVerificationInput,
): CREImageVerificationOutput => {
  const endpoint = runtime.config.endpoints.visionModelEndpoint
  if (!endpoint) {
    throw new Error('Vision model endpoint not configured')
  }

  const visionRequest = {
    baseline_image_url: input.baseline_image_url,
    completion_image_url: input.completion_image_url,
    verification_criteria: input.verification_criteria,
    campaign_id: input.campaign_id,
    request_id: input.request_id,
  }

  // FIX P1-5: HTTPClient instantiated inside node function, not in outer closure
  const visionResult = runtime
    .runInNodeMode((nodeRuntime): VisionResult => {
      const http = new cre.capabilities.HTTPClient()
      const response = http
        .sendRequest(nodeRuntime, {
          url: endpoint,
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(visionRequest),
        })
        .result()

      if (!ok(response)) {
        throw new Error(`Vision model request failed with status: ${response.statusCode}`)
      }

      const data = JSON.parse(new TextDecoder().decode(response.body ?? new Uint8Array())) as {
        success: boolean
        data: VisionResult
      }

      return data.data
    }, visionResultAggregation)()
    .result()

  const verdict = scoreToVerdict(visionResult.score, runtime.config)

  const output: CREImageVerificationOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    verdict,
    confidence: visionResult.confidence,
    evaluation_summary: visionResult.reasoning,
    baseline_detected_count: visionResult.baseline_count,
    completion_detected_count: visionResult.completion_count,
    consensus: visionResult.score,
    model: endpoint,
    created_at: nowIso(runtime), // FIX P0-1
  }

  requestCallback(runtime, runtime.config.endpoints.imageVerificationCallbackUrl, {
    ...output,
    confidence: output.confidence,
    consensus: output.consensus,
    baseline_detected_count: output.baseline_detected_count,
    completion_detected_count: output.completion_detected_count,
  })

  return output
}

// Common wrapper so the SDK's HandlerFn generic can resolve a single TResult
type WorkflowResult = {
  request_id: string
  campaign_id: string
  workflow_type: string
  created_at: string
  [key: string]: string | number | boolean
}

// ---------------------------------------------------------------------------
// HTTP trigger dispatcher
// ---------------------------------------------------------------------------

const onHttpTrigger = (runtime: Runtime<Config>, payload: HTTPPayload): WorkflowResult => {
  const envelope = decodePayload(payload)

  let result:
    | CREValidationOutput
    | CREBaselineOutput
    | CREEvaluationOutput
    | CREImageVerificationOutput

  switch (envelope.workflow) {
    case 'validation':
      result = runValidationWorkflow(runtime, envelope.data)
      break
    case 'baseline':
      result = runBaselineWorkflow(runtime, envelope.data)
      break
    case 'evaluation':
      result = runEvaluationWorkflow(runtime, envelope.data)
      break
    case 'image-verification':
      result = runImageVerificationWorkflow(runtime, envelope.data)
      break
    default:
      throw new Error('Unsupported workflow type')
  }

  // Flatten into WorkflowResult for SDK serialization
  const flat = result as Record<string, string | number | boolean>
  return {
    request_id: flat['request_id'] as string,
    campaign_id: flat['campaign_id'] as string,
    created_at: flat['created_at'] as string,
    workflow_type: envelope.workflow,
    ...flat,
  }
}

const initWorkflow = (config: Config) => {
  const httpTrigger = new cre.capabilities.HTTPCapability()
  return [
    handler(httpTrigger.trigger({ authorizedKeys: config.http.authorizedKeys }), onHttpTrigger),
  ]
}

export async function main() {
  // P2: configSchema validation — bad config fails fast at startup, not at runtime
  const runner = await Runner.newRunner<Config>({ configSchema })
  await runner.run(initWorkflow)
}
