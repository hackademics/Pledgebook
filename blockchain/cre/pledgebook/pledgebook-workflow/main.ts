import {
  consensusMedianAggregation,
  cre,
  handler,
  ok,
  type HTTPPayload,
  type NodeRuntime,
  type Runtime,
  Runner,
} from '@chainlink/cre-sdk'
import { createHash } from 'node:crypto'

type EvidenceItem = {
  evidence_id?: string
  type: 'file' | 'url' | 'text' | 'image' | 'video' | 'audio'
  uri: string
  hash?: string
  metadata?: Record<string, unknown>
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
  baseline_data?: Record<string, unknown>
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
  signals?: Record<string, unknown>
  model?: string
  created_at?: string
}

type CREBaselineOutput = {
  request_id: string
  campaign_id: string
  baseline_summary: string
  baseline_hash: string
  signals?: Record<string, unknown>
  model?: string
  created_at?: string
}

type CREEvaluationOutput = {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  evaluation_summary: string
  consensus?: number
  signals?: Record<string, unknown>
  model?: string
  created_at?: string
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

type CREImageVerificationOutput = {
  request_id: string
  campaign_id: string
  verdict: 'pass' | 'fail' | 'needs_review'
  confidence: number
  evaluation_summary: string
  baseline_analysis: {
    detected_count: number
    confidence: number
  }
  completion_analysis: {
    detected_count: number
    confidence: number
  }
  consensus?: number
  model?: string
  created_at?: string
}

type Config = {
  http: {
    authorizedKeys: Array<{
      type: 'KEY_TYPE_ECDSA_EVM' | 'KEY_TYPE_UNSPECIFIED'
      publicKey: string
    }>
  }
  templates: {
    validation: string
    baseline: string
    evaluation: string
    imageVerification?: string
  }
  endpoints: {
    modelEndpoint?: string
    visionModelEndpoint?: string
    hashStorageUrl?: string
    validationCallbackUrl?: string
    baselineCallbackUrl?: string
    evaluationCallbackUrl?: string
    imageVerificationCallbackUrl?: string
  }
  consensus: {
    passThreshold: number
    failThreshold: number
  }
  deco: {
    enabled: boolean
  }
}

type WorkflowEnvelope =
  | { workflow: 'validation'; data: CREValidationInput }
  | { workflow: 'baseline'; data: CREBaselineInput }
  | { workflow: 'evaluation'; data: CREEvaluationInput }
  | { workflow: 'image-verification'; data: CREImageVerificationInput }

const nowIso = () => new Date().toISOString()

const decodePayload = (payload: HTTPPayload): WorkflowEnvelope => {
  const decoded = new TextDecoder().decode(payload.input ?? new Uint8Array())
  return JSON.parse(decoded) as WorkflowEnvelope
}

export const applyTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '')

export const hashPrompt = (prompt: string) => createHash('sha256').update(prompt).digest('hex')

const summarizeEvidence = (evidence: EvidenceItem[] | undefined) =>
  (evidence ?? [])
    .map((item) => `${item.type}:${item.uri}`)
    .slice(0, 5)
    .join(' | ')

export const scoreToVerdict = (score: number, config: Config) => {
  if (score >= config.consensus.passThreshold) return 'pass'
  if (score <= config.consensus.failThreshold) return 'fail'
  return 'needs_review'
}

const scoreWithConsensus = async (
  runtime: Runtime<Config>,
  prompt: string,
  evidence: EvidenceItem[] | undefined,
) => {
  const scorer = runtime.runInNodeMode(
    (nodeRuntime) => scorePrompt(nodeRuntime, prompt, evidence),
    consensusMedianAggregation<number>(),
  )

  return scorer().result()
}

const scorePrompt = async (
  nodeRuntime: NodeRuntime<Config>,
  prompt: string,
  evidence: EvidenceItem[] | undefined,
) => {
  const endpoint = nodeRuntime.config.endpoints.modelEndpoint
  if (!endpoint) {
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

const requestCallback = (
  runtime: Runtime<Config>,
  url: string | undefined,
  payload: Record<string, unknown>,
) => {
  if (!url) return

  const http = new cre.capabilities.HTTPClient()
  const send = http.sendRequest(
    runtime,
    (sender) => {
      const response = sender
        .sendRequest({
          url,
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
        .result()

      if (!ok(response)) {
        throw new Error(`Callback failed with status: ${response.statusCode}`)
      }

      return Number(response.statusCode)
    },
    consensusMedianAggregation<number>(),
  )

  send().result()
}

const storePromptHash = (
  runtime: Runtime<Config>,
  requestId: string,
  campaignId: string,
  promptHash: string,
) => {
  requestCallback(runtime, runtime.config.endpoints.hashStorageUrl, {
    request_id: requestId,
    campaign_id: campaignId,
    prompt_hash: promptHash,
  })
}

const fetchPrivateEvidence = (runtime: Runtime<Config>, evidence: EvidenceItem[] | undefined) => {
  if (!runtime.config.deco.enabled) return

  const privateEvidence = (evidence ?? []).filter(
    (item) => item.metadata && item.metadata.private === true,
  )

  if (privateEvidence.length === 0) return

  const confidential = new cre.capabilities.ConfidentialHTTPClient()
  const requestPayload = {
    vaultDonSecrets: [],
    input: {
      requests: privateEvidence.map((item) => ({
        url: item.uri,
        method: 'GET',
        body: '',
        headers: [],
        publicTemplateValues: {},
        customCertBundle: '',
      })),
    },
  }

  confidential
    .sendRequests(
      runtime,
      (sender) => {
        sender.sendRequests(requestPayload).result()
        return 1
      },
      consensusMedianAggregation<number>(),
    )
    .result()
}

export const runValidationWorkflow = async (
  runtime: Runtime<Config>,
  input: CREValidationInput,
): Promise<CREValidationOutput> => {
  fetchPrivateEvidence(runtime, input.evidence)

  const prompt = applyTemplate(runtime.config.templates.validation, {
    prompt: input.prompt,
    evidence: summarizeEvidence(input.evidence),
  })
  const promptHash = hashPrompt(prompt)
  const score = await scoreWithConsensus(runtime, prompt, input.evidence)
  const verdict = scoreToVerdict(score, runtime.config)

  storePromptHash(runtime, input.request_id, input.campaign_id, promptHash)

  const output: CREValidationOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    verdict,
    confidence: score,
    summary: `Validation completed with verdict ${verdict}.`,
    signals: {
      prompt_hash: promptHash,
    },
    model: runtime.config.endpoints.modelEndpoint ?? 'heuristic',
    created_at: nowIso(),
  }

  requestCallback(runtime, runtime.config.endpoints.validationCallbackUrl, output)

  return output
}

export const runBaselineWorkflow = async (
  runtime: Runtime<Config>,
  input: CREBaselineInput,
): Promise<CREBaselineOutput> => {
  fetchPrivateEvidence(runtime, input.evidence)

  const prompt = applyTemplate(runtime.config.templates.baseline, {
    prompt: input.prompt,
    evidence: summarizeEvidence(input.evidence),
  })
  const baselineSummary = `Baseline captured: ${prompt.slice(0, 180)}`
  const baselineHash = hashPrompt(baselineSummary)

  storePromptHash(runtime, input.request_id, input.campaign_id, baselineHash)

  const output: CREBaselineOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    baseline_summary: baselineSummary,
    baseline_hash: baselineHash,
    signals: {
      prompt_hash: input.prompt_hash,
    },
    model: runtime.config.endpoints.modelEndpoint ?? 'heuristic',
    created_at: nowIso(),
  }

  requestCallback(runtime, runtime.config.endpoints.baselineCallbackUrl, output)

  return output
}

export const runEvaluationWorkflow = async (
  runtime: Runtime<Config>,
  input: CREEvaluationInput,
): Promise<CREEvaluationOutput> => {
  fetchPrivateEvidence(runtime, input.evidence)

  const prompt = applyTemplate(runtime.config.templates.evaluation, {
    prompt: input.prompt,
    evidence: summarizeEvidence(input.evidence),
    baseline: input.baseline_hash,
  })

  const score = await scoreWithConsensus(runtime, prompt, input.evidence)
  const verdict = scoreToVerdict(score, runtime.config)

  const output: CREEvaluationOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    verdict,
    confidence: score,
    evaluation_summary: `Evaluation completed with verdict ${verdict}.`,
    consensus: score,
    signals: {
      baseline_hash: input.baseline_hash,
      prompt_hash: input.prompt_hash,
    },
    model: runtime.config.endpoints.modelEndpoint ?? 'heuristic',
    created_at: nowIso(),
  }

  requestCallback(runtime, runtime.config.endpoints.evaluationCallbackUrl, output)

  return output
}

export const runImageVerificationWorkflow = async (
  runtime: Runtime<Config>,
  input: CREImageVerificationInput,
): Promise<CREImageVerificationOutput> => {
  const endpoint = runtime.config.endpoints.visionModelEndpoint
  if (!endpoint) {
    throw new Error('Vision model endpoint not configured')
  }

  // Call the vision model endpoint with image URLs
  const visionRequest = {
    baseline_image_url: input.baseline_image_url,
    completion_image_url: input.completion_image_url,
    verification_criteria: input.verification_criteria,
    campaign_id: input.campaign_id,
    request_id: input.request_id,
  }

  const http = new cre.capabilities.HTTPClient()
  const visionScore = runtime.runInNodeMode(
    (nodeRuntime) => {
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
        data: {
          baseline_count: number
          completion_count: number
          meets_criteria: boolean
          confidence: number
          reasoning: string
          score: number
        }
      }

      return data.data
    },
    consensusMedianAggregation<{
      baseline_count: number
      completion_count: number
      meets_criteria: boolean
      confidence: number
      reasoning: string
      score: number
    }>(),
  )

  const visionResult = visionScore().result()
  const verdict = scoreToVerdict(visionResult.score, runtime.config)

  const output: CREImageVerificationOutput = {
    request_id: input.request_id,
    campaign_id: input.campaign_id,
    verdict,
    confidence: visionResult.confidence,
    evaluation_summary: visionResult.reasoning,
    baseline_analysis: {
      detected_count: visionResult.baseline_count,
      confidence: visionResult.confidence,
    },
    completion_analysis: {
      detected_count: visionResult.completion_count,
      confidence: visionResult.confidence,
    },
    consensus: visionResult.score,
    model: endpoint,
    created_at: nowIso(),
  }

  requestCallback(runtime, runtime.config.endpoints.imageVerificationCallbackUrl, output)

  return output
}

const onHttpTrigger = async (
  runtime: Runtime<Config>,
  payload: HTTPPayload,
): Promise<
  CREValidationOutput | CREBaselineOutput | CREEvaluationOutput | CREImageVerificationOutput
> => {
  const envelope = decodePayload(payload)

  switch (envelope.workflow) {
    case 'validation':
      return runValidationWorkflow(runtime, envelope.data)
    case 'baseline':
      return runBaselineWorkflow(runtime, envelope.data)
    case 'evaluation':
      return runEvaluationWorkflow(runtime, envelope.data)
    case 'image-verification':
      return runImageVerificationWorkflow(runtime, envelope.data)
    default:
      throw new Error('Unsupported workflow type')
  }
}

const initWorkflow = (config: Config) => {
  const httpTrigger = new cre.capabilities.HTTPCapability()

  return [
    handler(httpTrigger.trigger({ authorizedKeys: config.http.authorizedKeys }), onHttpTrigger),
  ]
}

export async function main() {
  const runner = await Runner.newRunner<Config>()
  await runner.run(initWorkflow)
}
