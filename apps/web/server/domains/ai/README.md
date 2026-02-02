# AI Domain Module

This module provides AI-powered capabilities for campaign validation, assistance, and consensus verification in PledgeBook.

## Overview

The AI module consists of three main services:

1. **Campaign Approval** - Automated fraud detection and policy compliance checking
2. **Campaign Setup Helper** - AI-assisted campaign creation with SMART criteria evaluation
3. **Consensus Verification** - Multi-AI consensus for verifying campaign goal achievement

## Architecture

```
server/domains/ai/
├── index.ts              # Module exports
├── ai.types.ts           # TypeScript type definitions
├── ai.schema.ts          # Zod validation schemas
├── ai.config.ts          # Configuration and environment settings
├── ai.provider.ts        # AI provider configurations and utilities
├── ai.service.ts         # Main AI service implementation
├── ai.cre.ts             # CRE workflow integration
└── prompts/
    ├── index.ts          # Prompt exports
    ├── prompt.utils.ts   # Prompt utilities (interpolation, hashing, etc.)
    ├── campaign-approval.prompt.ts   # Fraud/policy detection prompt
    ├── campaign-setup.prompt.ts      # Campaign creation assistance prompt
    └── consensus.prompt.ts           # Multi-AI consensus prompt
```

## Configuration

### Environment Variables

```bash
# Required: At least one AI provider
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Optional: Override defaults
AI_CONSENSUS_THRESHOLD=0.66
AI_MIN_PROVIDERS=2
AI_TIMEOUT_MS=45000
```

### Supported Providers

| Provider  | Model                    | Use Case        |
| --------- | ------------------------ | --------------- |
| Anthropic | claude-sonnet-4-20250514 | All (primary)   |
| OpenAI    | gpt-4.1                  | All (fallback)  |
| Google    | gemini-2.5-flash         | All (consensus) |

## API Endpoints

### POST `/api/ai/campaign-approval`

Analyzes a campaign for approval/rejection based on fraud detection, policy compliance, and quality standards.

**Request:**

```json
{
  "campaign": {
    "id": "uuid",
    "name": "Weight Loss Challenge",
    "purpose": "Track my 20lb weight loss journey",
    "rulesAndResolution": "Funds released when goal verified",
    "prompt": "Verify 20lb weight loss using Fitbit data",
    "promptHash": "sha256...",
    "baselineData": {},
    "fundraisingGoal": "1000000000000000000",
    "consensusThreshold": 0.66,
    "startDate": "2026-02-01",
    "endDate": "2026-05-01",
    "tags": ["health", "fitness"],
    "categories": ["Health"],
    "creatorAddress": "0x..."
  },
  "strictMode": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "decision": "approved",
    "confidence": 0.92,
    "reasoning": "Campaign meets all approval criteria...",
    "riskSignals": [],
    "recommendations": ["Consider adding secondary data source"],
    "policyViolations": [],
    "timestamp": "2026-02-01T12:00:00Z"
  }
}
```

### POST `/api/ai/campaign-setup`

Helps users create valid, consensus-ready campaigns with SMART criteria evaluation.

**Request:**

```json
{
  "name": "My Weight Loss Journey",
  "purpose": "I want to lose 20 pounds over the next 3 months",
  "rulesAndResolution": "Funds released when I hit my target weight",
  "prompt": "Check if I lost 20 pounds",
  "fundraisingGoal": "1000000000000000000",
  "endDate": "2026-05-01",
  "tags": ["health", "weight-loss"],
  "categories": ["Health"],
  "evidence": [{ "type": "private-api", "uri": "fitbit", "description": "Fitbit weight data" }]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": false,
    "smartScore": {
      "specific": 60,
      "measurable": 80,
      "achievable": 85,
      "relevant": 90,
      "timeBound": 70,
      "overall": 77
    },
    "refinedPrompt": "VERIFICATION QUESTION: Did the campaign creator achieve...",
    "promptImprovements": ["Added specific comparison formula", "..."],
    "warnings": ["Consider specifying exact dates"],
    "suggestions": ["Add secondary verification source"],
    "recommendedDataSources": [...],
    "consensusReadiness": {
      "ready": true,
      "blockers": [],
      "score": 85
    },
    "timestamp": "2026-02-01T12:00:00Z"
  }
}
```

### POST `/api/ai/consensus`

Runs multi-AI consensus verification for campaign goal achievement.

**Request:**

```json
{
  "campaign": {...},
  "verificationType": "completion",
  "currentEvidence": [
    {
      "type": "private-api",
      "uri": "fitbit://weight/2026-05-01",
      "description": "Final weight reading: 178 lbs"
    }
  ],
  "baselineData": { "weight": "200", "date": "2026-02-01" }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "campaignId": "uuid",
    "requestId": "uuid",
    "verificationType": "completion",
    "verdict": true,
    "consensusScore": 1.0,
    "threshold": 0.66,
    "thresholdMet": true,
    "providerResults": [
      {
        "provider": "anthropic",
        "model": "claude-sonnet-4-20250514",
        "result": true,
        "confidence": 0.95,
        "reasoning": "Weight decreased from 200 lbs to 178 lbs...",
        "sourcesCited": ["fitbit://weight/2026-05-01"],
        "processingTimeMs": 2340
      },
      ...
    ],
    "aggregatedReasoning": "## Consensus Summary...",
    "sourcesCited": ["fitbit://weight/2026-05-01"],
    "inputHash": "sha256...",
    "timestamp": "2026-02-01T12:00:00Z"
  }
}
```

## Prompt Engineering

### Best Practices Used

1. **Structured System Prompts** - Clear role definition, responsibilities, and constraints
2. **SMART Criteria** - Specific, Measurable, Achievable, Relevant, Time-bound goals
3. **Structured Output** - Zod schemas for reliable JSON responses
4. **Variable Interpolation** - `{{variable}}` syntax for dynamic content
5. **Prompt Hashing** - SHA-256 hashes for integrity verification
6. **Input Sanitization** - Protection against prompt injection
7. **Provider Adjustments** - Optimizations for each AI model's strengths

### Prompt Template Structure

```typescript
interface PromptTemplate {
  id: string // Unique identifier
  version: string // Semantic version for tracking changes
  name: string // Human-readable name
  description: string // Purpose description
  systemPrompt: string // System/instruction prompt
  userPromptTemplate: string // User prompt with {{variables}}
  variables: string[] // Required variables list
  outputSchema?: string // Reference to Zod schema
}
```

## CRE Workflow Integration

The module integrates with Chainlink Runtime Environment (CRE) for decentralized consensus:

```typescript
import { buildCREConsensusPrompt, toCREEvaluationOutput } from './ai.cre'

// Build prompts for CRE workflow
const { systemPrompt, userPrompt, inputHash } = buildCREConsensusPrompt(
  input,
  campaignContext,
  'completion',
  'anthropic',
)

// Convert results to CRE format
const creOutput = toCREEvaluationOutput(result, requestId)
```

## Verification Types

| Type         | Purpose                        | Output                   |
| ------------ | ------------------------------ | ------------------------ |
| `baseline`   | Capture initial state          | Data summary, no verdict |
| `progress`   | Check interim progress         | Progress %, trajectory   |
| `completion` | Final verification             | TRUE/FALSE verdict       |
| `dispute`    | Re-evaluate challenged outcome | Detailed verdict         |

## Security Considerations

1. **API Key Storage** - Keys stored in environment variables, never logged
2. **Input Sanitization** - User inputs sanitized to prevent prompt injection
3. **Prompt Hashing** - All prompts hashed for integrity verification
4. **Audit Logging** - All AI calls logged with request/response hashes
5. **Rate Limiting** - Configurable limits per provider

## Adding New Prompts

1. Create a new file in `prompts/` following the template pattern
2. Define the `PromptTemplate` with all required fields
3. Export from `prompts/index.ts`
4. Add corresponding Zod schema in `ai.schema.ts`
5. Add service method in `ai.service.ts`
6. Create API endpoint if needed

## Testing

```bash
# Run AI module tests
pnpm test:unit --filter=ai

# Test with mock providers (no API keys needed)
AI_MOCK_RESPONSES=true pnpm test:unit
```

## Dependencies

The module uses the Vercel AI SDK for provider abstraction:

```bash
# Install AI SDK and providers (when ready for production)
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
```

## Future Enhancements

- [ ] Streaming responses for long-running analyses
- [ ] Caching layer for repeated prompt evaluations
- [ ] A/B testing framework for prompt optimization
- [ ] Custom fine-tuned models for specific domains
- [ ] Real-time consensus visualization
