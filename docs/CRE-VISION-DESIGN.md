# CRE Vision AI Integration Design

## Overview

Enhance the CRE workflow to support image-based verification for the Pledgebook demo.

## Demo Scenario

- **Baseline:** Photo of paper with "chainlink" written 1 time
- **Completion:** Photo of paper with "chainlink" written 20 times
- **Verification:** AI compares both images and confirms completion criteria met

---

## Architecture

```
┌─────────────────┐
│ Frontend        │
│ Submit Evidence │
└────────┬────────┘
         │ POST /api/campaigns/[id]/completion
         ▼
┌─────────────────┐
│ Nuxt API        │
│ completion.ts   │
└────────┬────────┘
         │ POST /api/cre/verify-completion
         ▼
┌─────────────────┐
│ CRE Trigger API │
│ verify-completion.post.ts │
└────────┬────────┘
         │ HTTP POST to CRE workflow
         ▼
┌─────────────────────────────────────────┐
│           CRE WORKFLOW                  │
│  ┌─────────────────────────────────┐    │
│  │ 1. Fetch baseline image (IPFS) │    │
│  │ 2. Fetch completion image (IPFS)│    │
│  │ 3. Build vision AI prompt       │    │
│  │ 4. Call vision model endpoint   │    │
│  │ 5. Aggregate consensus          │    │
│  │ 6. Callback with result         │    │
│  └─────────────────────────────────┘    │
└────────┬────────────────────────────────┘
         │ POST callback to evaluation endpoint
         ▼
┌─────────────────┐
│ Evaluation API  │
│ evaluation.post.ts │
└────────┬────────┘
         │ Update DB + trigger contract
         ▼
┌─────────────────┐
│ Smart Contract  │
│ verifyAndRelease│
└─────────────────┘
```

---

## New Workflow Type: `image-verification`

### Input Schema

```typescript
type CREImageVerificationInput = {
  request_id: string
  campaign_id: string
  prompt: string // "Verify 'chainlink' written 20 times"
  prompt_hash: string
  baseline_image_url: string // IPFS gateway URL
  completion_image_url: string // IPFS gateway URL
  verification_criteria: {
    target_text: string // "chainlink"
    baseline_count: number // 1
    required_count: number // 20
  }
  metadata?: CRERequestMetadata
}
```

### Output Schema

```typescript
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
```

---

## Vision AI Prompt Template

```
You are an AI verifier for a pledge campaign. Your task is to compare two images and verify completion of a pledge.

BASELINE IMAGE: [Image 1]
This shows the initial state before the pledge was completed.

COMPLETION IMAGE: [Image 2]
This should show the completed pledge.

VERIFICATION CRITERIA:
- Target text: "{{target_text}}"
- Baseline should show approximately {{baseline_count}} instance(s)
- Completion should show at least {{required_count}} instances

INSTRUCTIONS:
1. Count the number of times "{{target_text}}" appears in the BASELINE image
2. Count the number of times "{{target_text}}" appears in the COMPLETION image
3. Verify the completion count meets or exceeds {{required_count}}

Respond with JSON:
{
  "baseline_count": <number>,
  "completion_count": <number>,
  "meets_criteria": <boolean>,
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}
```

---

## Model Endpoint Options

### Option A: OpenAI GPT-4 Vision (Recommended for Demo)

```
POST https://api.openai.com/v1/chat/completions
Model: gpt-4-vision-preview
```

### Option B: Anthropic Claude Vision

```
POST https://api.anthropic.com/v1/messages
Model: claude-3-opus-20240229
```

### Option C: Custom Proxy (for CRE)

Create a simple proxy endpoint that:

1. Receives image URLs + prompt from CRE
2. Calls OpenAI/Anthropic with proper auth
3. Returns structured response

**Recommended:** Option C - gives us control over API keys and response formatting.

---

## Implementation Files

### 1. Vision Model Proxy Endpoint

`apps/web/server/api/ai/vision-verify.post.ts`

- Accepts baseline_url, completion_url, criteria
- Calls vision AI
- Returns structured verification result

### 2. CRE Trigger Endpoint

`apps/web/server/api/cre/verify-completion.post.ts`

- Accepts campaignId
- Fetches baseline/completion evidence from DB
- Constructs CRE request payload
- Triggers CRE workflow

### 3. CRE Workflow Update

`blockchain/cre/pledgebook/pledgebook-workflow/main.ts`

- Add `runImageVerificationWorkflow` function
- Handle new `image-verification` workflow type
- Call model endpoint with images

### 4. Config Update

`blockchain/cre/pledgebook/pledgebook-workflow/config.staging.json`

- Add vision model endpoint URL
- Add image verification template

---

## Demo Configuration

```json
{
  "endpoints": {
    "modelEndpoint": "https://your-app.workers.dev/api/ai/vision-verify",
    "evaluationCallbackUrl": "https://your-app.workers.dev/api/cre/evaluation"
  },
  "templates": {
    "imageVerification": "Count occurrences of '{{target_text}}' in both images. Baseline expected: {{baseline_count}}. Completion required: {{required_count}}."
  }
}
```

---

## Security Considerations

1. **HMAC Webhook Verification** - CRE callbacks should be signed
2. **Rate Limiting** - Vision API calls are expensive
3. **Image Validation** - Verify images are from our IPFS/R2 storage
4. **Prompt Injection** - Sanitize user-provided criteria

---

## Next Steps

1. [ ] Carmack: Create vision-verify.post.ts proxy endpoint
2. [ ] Carmack: Create verify-completion.post.ts trigger endpoint
3. [ ] Carmack: Update CRE workflow with image-verification type
4. [ ] ISBE: Configure API keys and test endpoints
5. [ ] Test end-to-end flow with sample images
