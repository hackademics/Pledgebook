<template>
  <div class="ai-testing-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              to="/admin"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Admin
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div class="page-header__text">
              <h1 class="page-header__title">AI Prompt Testing</h1>
              <p class="page-header__description">
                Test and iterate on AI prompts without running through normal flows. Useful for
                debugging and prompt refinement.
              </p>
            </div>
            <div class="page-header__actions">
              <button
                type="button"
                class="btn btn--secondary btn--sm"
                @click="resetAll"
              >
                <Icon name="heroicons:arrow-path" />
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app">
        <div class="ai-testing__layout">
          <div class="ai-testing__main">
            <!-- Endpoint Selector Tabs -->
            <div class="ai-testing__tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="ai-testing__tab"
                :class="{ 'ai-testing__tab--active': activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                <Icon :name="tab.icon" />
                {{ tab.label }}
              </button>
            </div>

            <div class="ai-testing__content">
              <!-- Campaign Approval Testing -->
              <div
                v-show="activeTab === 'approval'"
                class="ai-testing__panel"
              >
                <div class="ai-testing__panel-header">
                  <div>
                    <h2>Campaign Approval</h2>
                    <p>Test fraud detection and policy compliance analysis</p>
                  </div>
                  <code class="ai-testing__endpoint">POST /api/ai/campaign-approval</code>
                </div>

                <div class="ai-testing__form-grid">
                  <div class="ai-testing__input-section">
                    <h3>Request Body</h3>
                    <div class="ai-testing__json-editor">
                      <FormTextarea
                        v-model="approvalInput"
                        label="JSON Payload"
                        :rows="20"
                        :error="approvalInputError"
                        hint="Edit the JSON payload to test different campaign scenarios"
                        resize="vertical"
                      />
                    </div>
                    <div class="ai-testing__actions">
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="loadApprovalTemplate"
                      >
                        <Icon name="heroicons:document-text" />
                        Load Template
                      </button>
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="formatJson('approval')"
                      >
                        <Icon name="heroicons:code-bracket" />
                        Format JSON
                      </button>
                      <button
                        type="button"
                        class="btn btn--primary"
                        :disabled="approvalLoading"
                        @click="runApprovalTest"
                      >
                        <Icon
                          v-if="approvalLoading"
                          name="heroicons:arrow-path"
                          class="animate-spin"
                        />
                        <Icon
                          v-else
                          name="heroicons:play"
                        />
                        {{ approvalLoading ? 'Running...' : 'Run Test' }}
                      </button>
                    </div>
                  </div>

                  <div class="ai-testing__output-section">
                    <h3>
                      Response
                      <span
                        v-if="approvalResult"
                        class="ai-testing__timing"
                      >
                        ({{ approvalTiming }}ms)
                      </span>
                    </h3>
                    <div
                      v-if="approvalError"
                      class="ai-testing__error"
                    >
                      <Icon name="heroicons:exclamation-circle" />
                      <pre>{{ approvalError }}</pre>
                    </div>
                    <div
                      v-else-if="approvalResult"
                      class="ai-testing__result"
                    >
                      <div class="ai-testing__result-header">
                        <span
                          class="ai-testing__decision"
                          :class="`ai-testing__decision--${approvalResult.data?.decision}`"
                        >
                          {{ approvalResult.data?.decision?.toUpperCase() }}
                        </span>
                        <span class="ai-testing__confidence">
                          Confidence:
                          {{ ((approvalResult.data?.confidence || 0) * 100).toFixed(0) }}%
                        </span>
                      </div>
                      <pre class="ai-testing__json">{{
                        JSON.stringify(approvalResult, null, 2)
                      }}</pre>
                    </div>
                    <div
                      v-else
                      class="ai-testing__placeholder"
                    >
                      <Icon name="heroicons:beaker" />
                      <p>Run a test to see results</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Campaign Setup Testing -->
              <div
                v-show="activeTab === 'setup'"
                class="ai-testing__panel"
              >
                <div class="ai-testing__panel-header">
                  <div>
                    <h2>Campaign Setup Helper</h2>
                    <p>Test SMART criteria evaluation and prompt refinement</p>
                  </div>
                  <code class="ai-testing__endpoint">POST /api/ai/campaign-setup</code>
                </div>

                <div class="ai-testing__form-grid">
                  <div class="ai-testing__input-section">
                    <h3>Request Body</h3>
                    <div class="ai-testing__json-editor">
                      <FormTextarea
                        v-model="setupInput"
                        label="JSON Payload"
                        :rows="20"
                        :error="setupInputError"
                        hint="Edit the JSON payload to test campaign setup assistance"
                        resize="vertical"
                      />
                    </div>
                    <div class="ai-testing__actions">
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="loadSetupTemplate"
                      >
                        <Icon name="heroicons:document-text" />
                        Load Template
                      </button>
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="formatJson('setup')"
                      >
                        <Icon name="heroicons:code-bracket" />
                        Format JSON
                      </button>
                      <button
                        type="button"
                        class="btn btn--primary"
                        :disabled="setupLoading"
                        @click="runSetupTest"
                      >
                        <Icon
                          v-if="setupLoading"
                          name="heroicons:arrow-path"
                          class="animate-spin"
                        />
                        <Icon
                          v-else
                          name="heroicons:play"
                        />
                        {{ setupLoading ? 'Running...' : 'Run Test' }}
                      </button>
                    </div>
                  </div>

                  <div class="ai-testing__output-section">
                    <h3>
                      Response
                      <span
                        v-if="setupResult"
                        class="ai-testing__timing"
                      >
                        ({{ setupTiming }}ms)
                      </span>
                    </h3>
                    <div
                      v-if="setupError"
                      class="ai-testing__error"
                    >
                      <Icon name="heroicons:exclamation-circle" />
                      <pre>{{ setupError }}</pre>
                    </div>
                    <div
                      v-else-if="setupResult"
                      class="ai-testing__result"
                    >
                      <div class="ai-testing__result-header">
                        <span
                          class="ai-testing__decision"
                          :class="
                            setupResult.data?.isValid
                              ? 'ai-testing__decision--approved'
                              : 'ai-testing__decision--rejected'
                          "
                        >
                          {{ setupResult.data?.isValid ? 'VALID' : 'INVALID' }}
                        </span>
                        <span class="ai-testing__confidence">
                          SMART Score: {{ setupResult.data?.smartScore?.overall || 0 }}/100
                        </span>
                      </div>
                      <!-- SMART Score Breakdown -->
                      <div
                        v-if="setupResult.data?.smartScore"
                        class="ai-testing__smart-scores"
                      >
                        <div
                          v-for="(score, key) in setupResult.data.smartScore"
                          :key="key"
                          class="ai-testing__smart-score"
                        >
                          <span class="ai-testing__smart-label">{{ formatSmartLabel(key) }}</span>
                          <div class="ai-testing__smart-bar">
                            <div
                              class="ai-testing__smart-fill"
                              :style="{ width: `${score}%` }"
                              :class="getScoreClass(score)"
                            ></div>
                          </div>
                          <span class="ai-testing__smart-value">{{ score }}</span>
                        </div>
                      </div>
                      <pre class="ai-testing__json">{{ JSON.stringify(setupResult, null, 2) }}</pre>
                    </div>
                    <div
                      v-else
                      class="ai-testing__placeholder"
                    >
                      <Icon name="heroicons:beaker" />
                      <p>Run a test to see results</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Consensus Testing -->
              <div
                v-show="activeTab === 'consensus'"
                class="ai-testing__panel"
              >
                <div class="ai-testing__panel-header">
                  <div>
                    <h2>Consensus Verification</h2>
                    <p>Test multi-AI consensus voting on campaign outcomes</p>
                  </div>
                  <code class="ai-testing__endpoint">POST /api/ai/consensus</code>
                </div>

                <div class="ai-testing__form-grid">
                  <div class="ai-testing__input-section">
                    <h3>Request Body</h3>
                    <div class="ai-testing__json-editor">
                      <FormTextarea
                        v-model="consensusInput"
                        label="JSON Payload"
                        :rows="20"
                        :error="consensusInputError"
                        hint="Edit the JSON payload to test consensus verification"
                        resize="vertical"
                      />
                    </div>
                    <div class="ai-testing__actions">
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="loadConsensusTemplate"
                      >
                        <Icon name="heroicons:document-text" />
                        Load Template
                      </button>
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="formatJson('consensus')"
                      >
                        <Icon name="heroicons:code-bracket" />
                        Format JSON
                      </button>
                      <button
                        type="button"
                        class="btn btn--primary"
                        :disabled="consensusLoading"
                        @click="runConsensusTest"
                      >
                        <Icon
                          v-if="consensusLoading"
                          name="heroicons:arrow-path"
                          class="animate-spin"
                        />
                        <Icon
                          v-else
                          name="heroicons:play"
                        />
                        {{ consensusLoading ? 'Running...' : 'Run Test' }}
                      </button>
                    </div>
                  </div>

                  <div class="ai-testing__output-section">
                    <h3>
                      Response
                      <span
                        v-if="consensusResult"
                        class="ai-testing__timing"
                      >
                        ({{ consensusTiming }}ms)
                      </span>
                    </h3>
                    <div
                      v-if="consensusError"
                      class="ai-testing__error"
                    >
                      <Icon name="heroicons:exclamation-circle" />
                      <pre>{{ consensusError }}</pre>
                    </div>
                    <div
                      v-else-if="consensusResult"
                      class="ai-testing__result"
                    >
                      <div class="ai-testing__result-header">
                        <span
                          class="ai-testing__decision"
                          :class="
                            consensusResult.data?.verdict
                              ? 'ai-testing__decision--approved'
                              : 'ai-testing__decision--rejected'
                          "
                        >
                          {{ consensusResult.data?.verdict ? 'PASS' : 'FAIL' }}
                        </span>
                        <span class="ai-testing__confidence">
                          Consensus:
                          {{ ((consensusResult.data?.consensusScore || 0) * 100).toFixed(0) }}% ({{
                            consensusResult.data?.thresholdMet ? 'Met' : 'Not Met'
                          }})
                        </span>
                      </div>
                      <!-- Provider Votes -->
                      <div
                        v-if="consensusResult.data?.providerResults"
                        class="ai-testing__provider-votes"
                      >
                        <h4>Provider Votes</h4>
                        <div class="ai-testing__votes-grid">
                          <div
                            v-for="provider in consensusResult.data.providerResults"
                            :key="provider.provider"
                            class="ai-testing__vote-card"
                            :class="
                              provider.result
                                ? 'ai-testing__vote-card--pass'
                                : 'ai-testing__vote-card--fail'
                            "
                          >
                            <div class="ai-testing__vote-header">
                              <span class="ai-testing__provider-name">{{ provider.provider }}</span>
                              <span class="ai-testing__vote-result">
                                {{ provider.result ? '✓ PASS' : '✗ FAIL' }}
                              </span>
                            </div>
                            <p class="ai-testing__vote-model">{{ provider.model }}</p>
                            <p class="ai-testing__vote-confidence">
                              Confidence: {{ (provider.confidence * 100).toFixed(0) }}%
                            </p>
                            <p class="ai-testing__vote-time">{{ provider.processingTimeMs }}ms</p>
                          </div>
                        </div>
                      </div>
                      <pre class="ai-testing__json">{{
                        JSON.stringify(consensusResult, null, 2)
                      }}</pre>
                    </div>
                    <div
                      v-else
                      class="ai-testing__placeholder"
                    >
                      <Icon name="heroicons:beaker" />
                      <p>Run a test to see results</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Single Provider Evaluation Testing -->
              <div
                v-show="activeTab === 'evaluate'"
                class="ai-testing__panel"
              >
                <div class="ai-testing__panel-header">
                  <div>
                    <h2>Single Provider Evaluation</h2>
                    <p>Test individual AI provider responses (used by CRE)</p>
                  </div>
                  <code class="ai-testing__endpoint">POST /api/ai/consensus/evaluate</code>
                </div>

                <div class="ai-testing__form-grid">
                  <div class="ai-testing__input-section">
                    <h3>Request Body</h3>
                    <FormSelect
                      v-model="evaluateProvider"
                      label="Provider"
                      :options="providerOptions"
                      hint="Select which AI provider to test"
                    />
                    <div class="ai-testing__json-editor">
                      <FormTextarea
                        v-model="evaluateInput"
                        label="JSON Payload"
                        :rows="16"
                        :error="evaluateInputError"
                        hint="Edit the JSON payload (provider is set via dropdown)"
                        resize="vertical"
                      />
                    </div>
                    <div class="ai-testing__actions">
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="loadEvaluateTemplate"
                      >
                        <Icon name="heroicons:document-text" />
                        Load Template
                      </button>
                      <button
                        type="button"
                        class="btn btn--secondary btn--sm"
                        @click="formatJson('evaluate')"
                      >
                        <Icon name="heroicons:code-bracket" />
                        Format JSON
                      </button>
                      <button
                        type="button"
                        class="btn btn--primary"
                        :disabled="evaluateLoading"
                        @click="runEvaluateTest"
                      >
                        <Icon
                          v-if="evaluateLoading"
                          name="heroicons:arrow-path"
                          class="animate-spin"
                        />
                        <Icon
                          v-else
                          name="heroicons:play"
                        />
                        {{ evaluateLoading ? 'Running...' : 'Run Test' }}
                      </button>
                    </div>
                  </div>

                  <div class="ai-testing__output-section">
                    <h3>
                      Response
                      <span
                        v-if="evaluateResult"
                        class="ai-testing__timing"
                      >
                        ({{ evaluateTiming }}ms)
                      </span>
                    </h3>
                    <div
                      v-if="evaluateError"
                      class="ai-testing__error"
                    >
                      <Icon name="heroicons:exclamation-circle" />
                      <pre>{{ evaluateError }}</pre>
                    </div>
                    <div
                      v-else-if="evaluateResult"
                      class="ai-testing__result"
                    >
                      <div class="ai-testing__result-header">
                        <span
                          class="ai-testing__decision"
                          :class="
                            evaluateResult.data?.result
                              ? 'ai-testing__decision--approved'
                              : 'ai-testing__decision--rejected'
                          "
                        >
                          {{ evaluateResult.data?.result ? 'PASS' : 'FAIL' }}
                        </span>
                        <span class="ai-testing__confidence">
                          Confidence:
                          {{ ((evaluateResult.data?.confidence || 0) * 100).toFixed(0) }}%
                        </span>
                      </div>
                      <pre class="ai-testing__json">{{
                        JSON.stringify(evaluateResult, null, 2)
                      }}</pre>
                    </div>
                    <div
                      v-else
                      class="ai-testing__placeholder"
                    >
                      <Icon name="heroicons:beaker" />
                      <p>Run a test to see results</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Helper Sidebar -->
          <aside class="ai-testing__sidebar">
            <div class="helper-card">
              <h4 class="helper-card__title">Quick Tips</h4>
              <ul class="helper-card__list">
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Use "Load Template" to start with valid sample data</span>
                </li>
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Modify fields to test edge cases and error handling</span>
                </li>
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Check reasoning in responses to understand AI decisions</span>
                </li>
                <li class="helper-card__list-item">
                  <Icon name="heroicons:check-circle" />
                  <span>Compare provider responses in Consensus testing</span>
                </li>
              </ul>
            </div>

            <div class="helper-card">
              <h4 class="helper-card__title">Test Scenarios</h4>
              <div class="ai-testing__scenarios">
                <button
                  type="button"
                  class="ai-testing__scenario-btn"
                  @click="loadScenario('valid-campaign')"
                >
                  Valid Campaign
                </button>
                <button
                  type="button"
                  class="ai-testing__scenario-btn"
                  @click="loadScenario('vague-goals')"
                >
                  Vague Goals
                </button>
                <button
                  type="button"
                  class="ai-testing__scenario-btn"
                  @click="loadScenario('suspicious')"
                >
                  Suspicious Campaign
                </button>
                <button
                  type="button"
                  class="ai-testing__scenario-btn"
                  @click="loadScenario('successful-outcome')"
                >
                  Successful Outcome
                </button>
                <button
                  type="button"
                  class="ai-testing__scenario-btn"
                  @click="loadScenario('failed-outcome')"
                >
                  Failed Outcome
                </button>
              </div>
            </div>

            <div class="helper-card">
              <h4 class="helper-card__title">Documentation</h4>
              <div class="ai-testing__docs-links">
                <NuxtLink
                  to="/docs/guides/AI-GUIDE"
                  class="ai-testing__doc-link"
                >
                  <Icon name="heroicons:book-open" />
                  AI System Guide
                </NuxtLink>
                <NuxtLink
                  to="/docs/guides/CRE-GUIDE"
                  class="ai-testing__doc-link"
                >
                  <Icon name="heroicons:cpu-chip" />
                  CRE Integration
                </NuxtLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// =============================================================================
// PAGE META
// =============================================================================

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'AI Prompt Testing - Admin - Pledgebook',
  description:
    'Test and debug AI prompts for campaign approval, setup, and consensus verification.',
})

// =============================================================================
// TYPES
// =============================================================================

interface Tab {
  id: 'approval' | 'setup' | 'consensus' | 'evaluate'
  label: string
  icon: string
}

interface SmartScore {
  specific: number
  measurable: number
  achievable: number
  relevant: number
  timeBound: number
  overall: number
}

interface ProviderResult {
  provider: string
  model: string
  result: boolean
  confidence: number
  reasoning: string
  processingTimeMs: number
}

interface ApprovalResponse {
  success: boolean
  data?: {
    decision: 'approved' | 'rejected' | 'needs_review'
    confidence: number
    reasoning: string
    riskSignals: unknown[]
    recommendations: string[]
    policyViolations: string[]
  }
}

interface SetupResponse {
  success: boolean
  data?: {
    isValid: boolean
    smartScore: SmartScore
    refinedPrompt: string
    promptImprovements: string[]
    warnings: string[]
    suggestions: string[]
  }
}

interface ConsensusResponse {
  success: boolean
  data?: {
    verdict: boolean
    consensusScore: number
    thresholdMet: boolean
    providerResults: ProviderResult[]
    aggregatedReasoning: string
  }
}

interface EvaluateResponse {
  success: boolean
  data?: {
    result: boolean
    confidence: number
    reasoning: string
    sourcesCited: string[]
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

const tabs: Tab[] = [
  { id: 'approval', label: 'Campaign Approval', icon: 'heroicons:shield-check' },
  { id: 'setup', label: 'Setup Helper', icon: 'heroicons:light-bulb' },
  { id: 'consensus', label: 'Consensus', icon: 'heroicons:scale' },
  { id: 'evaluate', label: 'Single Eval', icon: 'heroicons:cpu-chip' },
]

const providerOptions = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI (GPT-4)' },
  { value: 'google', label: 'Google (Gemini)' },
]

// =============================================================================
// TEMPLATE DATA
// =============================================================================

const APPROVAL_TEMPLATE = {
  campaign: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Weight Loss Challenge',
    purpose: 'Track my 20lb weight loss journey over 3 months to prove commitment to health',
    rulesAndResolution:
      'Funds released when AI verification confirms goal achievement based on Fitbit data',
    prompt:
      'Verify that the campaign creator achieved a weight loss of at least 20 lbs by comparing baseline weight to final weight using Fitbit API data.',
    promptHash: 'a1b2c3d4e5f6g7h8i9j0',
    baselineData: { weight: '200', unit: 'lbs', date: '2026-02-01' },
    fundraisingGoal: '1000000000000000000',
    consensusThreshold: 0.66,
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    tags: ['health', 'fitness', 'weight-loss'],
    categories: ['Health'],
    creatorAddress: '0x1234567890abcdef1234567890abcdef12345678',
  },
  strictMode: false,
}

const SETUP_TEMPLATE = {
  name: 'My Fitness Journey',
  purpose: 'I want to lose 20 pounds in the next 3 months',
  rulesAndResolution: 'Funds will be released when I hit my target weight',
  prompt: 'Check if I lost weight',
  fundraisingGoal: '500000000000000000',
  endDate: '2026-05-01',
  tags: ['health', 'fitness'],
  categories: ['Health'],
  evidence: [{ type: 'private-api', uri: 'fitbit', description: 'Fitbit weight data' }],
}

const CONSENSUS_TEMPLATE = {
  campaign: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Weight Loss Challenge',
    purpose: 'Track my 20lb weight loss journey over 3 months',
    rulesAndResolution: 'Funds released when AI verification confirms goal achievement',
    prompt:
      'Verify that the campaign creator achieved a weight loss of at least 20 lbs by comparing baseline weight to final weight using Fitbit API data. Return TRUE if weight loss >= 20 lbs, FALSE otherwise.',
    promptHash: 'a1b2c3d4e5f6g7h8i9j0',
    baselineData: { weight: '200', unit: 'lbs', date: '2026-02-01' },
    fundraisingGoal: '1000000000000000000',
    consensusThreshold: 0.66,
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    tags: ['health', 'fitness'],
    categories: ['Health'],
    creatorAddress: '0x1234567890abcdef1234567890abcdef12345678',
  },
  verificationType: 'completion',
  currentEvidence: [
    {
      type: 'private-api',
      uri: 'fitbit://weight/2026-05-01',
      description: 'Final weight reading: 178 lbs (verified via DECO)',
    },
  ],
  baselineData: { weight: '200', unit: 'lbs', date: '2026-02-01' },
}

const EVALUATE_TEMPLATE = {
  campaign: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Weight Loss Challenge',
    purpose: 'Track my 20lb weight loss journey over 3 months',
    rulesAndResolution: 'Funds released when AI verification confirms goal achievement',
    prompt:
      'Verify that the campaign creator achieved a weight loss of at least 20 lbs. Return TRUE if >= 20 lbs lost.',
    promptHash: 'a1b2c3d4e5f6g7h8i9j0',
    baselineData: { weight: '200', unit: 'lbs', date: '2026-02-01' },
    fundraisingGoal: '1000000000000000000',
    consensusThreshold: 0.66,
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    tags: ['health'],
    categories: ['Health'],
    creatorAddress: '0x1234567890abcdef1234567890abcdef12345678',
  },
  verificationType: 'completion',
  currentEvidence: [
    {
      type: 'private-api',
      uri: 'fitbit://weight/2026-05-01',
      description: 'Final weight: 178 lbs',
    },
  ],
  baselineData: { weight: '200', date: '2026-02-01' },
}

// =============================================================================
// TEST SCENARIOS
// =============================================================================

const SCENARIOS: Record<string, { approval?: object; setup?: object; consensus?: object }> = {
  'valid-campaign': {
    approval: APPROVAL_TEMPLATE,
    setup: SETUP_TEMPLATE,
    consensus: CONSENSUS_TEMPLATE,
  },
  'vague-goals': {
    setup: {
      name: 'Get healthier',
      purpose: 'I want to be healthier and feel better',
      prompt: 'Check if I got healthier',
      tags: ['health'],
      categories: ['Health'],
    },
    approval: {
      ...APPROVAL_TEMPLATE,
      campaign: {
        ...APPROVAL_TEMPLATE.campaign,
        name: 'Get healthier',
        purpose: 'I want to be healthier and feel better',
        prompt: 'Check if I got healthier',
      },
    },
  },
  suspicious: {
    approval: {
      campaign: {
        ...APPROVAL_TEMPLATE.campaign,
        name: 'Get Rich Quick Investment Opportunity',
        purpose: 'Guaranteed 1000% returns in 30 days! Send crypto now!',
        rulesAndResolution: 'Trust me, funds will be returned with massive profits',
        prompt: 'Verify that investors made money',
        tags: ['investment', 'crypto', 'guaranteed-returns'],
      },
      strictMode: true,
    },
  },
  'successful-outcome': {
    consensus: {
      ...CONSENSUS_TEMPLATE,
      currentEvidence: [
        {
          type: 'private-api',
          uri: 'fitbit://weight/2026-05-01',
          description: 'Final weight: 175 lbs (25 lb loss from 200 lb baseline)',
        },
      ],
    },
  },
  'failed-outcome': {
    consensus: {
      ...CONSENSUS_TEMPLATE,
      currentEvidence: [
        {
          type: 'private-api',
          uri: 'fitbit://weight/2026-05-01',
          description: 'Final weight: 195 lbs (only 5 lb loss from 200 lb baseline)',
        },
      ],
    },
  },
}

// =============================================================================
// STATE
// =============================================================================

const activeTab = ref<'approval' | 'setup' | 'consensus' | 'evaluate'>('approval')

// Approval state
const approvalInput = ref(JSON.stringify(APPROVAL_TEMPLATE, null, 2))
const approvalInputError = ref('')
const approvalLoading = ref(false)
const approvalResult = ref<ApprovalResponse | null>(null)
const approvalError = ref('')
const approvalTiming = ref(0)

// Setup state
const setupInput = ref(JSON.stringify(SETUP_TEMPLATE, null, 2))
const setupInputError = ref('')
const setupLoading = ref(false)
const setupResult = ref<SetupResponse | null>(null)
const setupError = ref('')
const setupTiming = ref(0)

// Consensus state
const consensusInput = ref(JSON.stringify(CONSENSUS_TEMPLATE, null, 2))
const consensusInputError = ref('')
const consensusLoading = ref(false)
const consensusResult = ref<ConsensusResponse | null>(null)
const consensusError = ref('')
const consensusTiming = ref(0)

// Evaluate state
const evaluateProvider = ref('anthropic')
const evaluateInput = ref(JSON.stringify(EVALUATE_TEMPLATE, null, 2))
const evaluateInputError = ref('')
const evaluateLoading = ref(false)
const evaluateResult = ref<EvaluateResponse | null>(null)
const evaluateError = ref('')
const evaluateTiming = ref(0)

// =============================================================================
// METHODS
// =============================================================================

function parseJsonSafe(input: string): { success: boolean; data?: unknown; error?: string } {
  try {
    const data = JSON.parse(input)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

function formatJson(type: 'approval' | 'setup' | 'consensus' | 'evaluate'): void {
  const inputRef = {
    approval: approvalInput,
    setup: setupInput,
    consensus: consensusInput,
    evaluate: evaluateInput,
  }[type]

  const errorRef = {
    approval: approvalInputError,
    setup: setupInputError,
    consensus: consensusInputError,
    evaluate: evaluateInputError,
  }[type]

  const parsed = parseJsonSafe(inputRef.value)
  if (parsed.success) {
    inputRef.value = JSON.stringify(parsed.data, null, 2)
    errorRef.value = ''
  } else {
    errorRef.value = `Invalid JSON: ${parsed.error}`
  }
}

async function runApprovalTest(): Promise<void> {
  const parsed = parseJsonSafe(approvalInput.value)
  if (!parsed.success) {
    approvalInputError.value = `Invalid JSON: ${parsed.error}`
    return
  }

  approvalInputError.value = ''
  approvalLoading.value = true
  approvalResult.value = null
  approvalError.value = ''

  const startTime = Date.now()

  try {
    const response = await $fetch('/api/ai/campaign-approval', {
      method: 'POST',
      body: parsed.data as Record<string, unknown>,
    })
    approvalResult.value = response as ApprovalResponse
    approvalTiming.value = Date.now() - startTime
  } catch (e) {
    approvalError.value = (e as Error).message || JSON.stringify(e, null, 2)
    approvalTiming.value = Date.now() - startTime
  } finally {
    approvalLoading.value = false
  }
}

async function runSetupTest(): Promise<void> {
  const parsed = parseJsonSafe(setupInput.value)
  if (!parsed.success) {
    setupInputError.value = `Invalid JSON: ${parsed.error}`
    return
  }

  setupInputError.value = ''
  setupLoading.value = true
  setupResult.value = null
  setupError.value = ''

  const startTime = Date.now()

  try {
    const response = await $fetch('/api/ai/campaign-setup', {
      method: 'POST',
      body: parsed.data as Record<string, unknown>,
    })
    setupResult.value = response as SetupResponse
    setupTiming.value = Date.now() - startTime
  } catch (e) {
    setupError.value = (e as Error).message || JSON.stringify(e, null, 2)
    setupTiming.value = Date.now() - startTime
  } finally {
    setupLoading.value = false
  }
}

async function runConsensusTest(): Promise<void> {
  const parsed = parseJsonSafe(consensusInput.value)
  if (!parsed.success) {
    consensusInputError.value = `Invalid JSON: ${parsed.error}`
    return
  }

  consensusInputError.value = ''
  consensusLoading.value = true
  consensusResult.value = null
  consensusError.value = ''

  const startTime = Date.now()

  try {
    const response = await $fetch('/api/ai/consensus', {
      method: 'POST',
      body: parsed.data as Record<string, unknown>,
    })
    consensusResult.value = response as ConsensusResponse
    consensusTiming.value = Date.now() - startTime
  } catch (e) {
    consensusError.value = (e as Error).message || JSON.stringify(e, null, 2)
    consensusTiming.value = Date.now() - startTime
  } finally {
    consensusLoading.value = false
  }
}

async function runEvaluateTest(): Promise<void> {
  const parsed = parseJsonSafe(evaluateInput.value)
  if (!parsed.success) {
    evaluateInputError.value = `Invalid JSON: ${parsed.error}`
    return
  }

  evaluateInputError.value = ''
  evaluateLoading.value = true
  evaluateResult.value = null
  evaluateError.value = ''

  const startTime = Date.now()

  try {
    // Merge provider from dropdown into the body
    const body = { ...(parsed.data as Record<string, unknown>), provider: evaluateProvider.value }
    const response = await $fetch('/api/ai/consensus/evaluate', {
      method: 'POST',
      body,
    })
    evaluateResult.value = response as EvaluateResponse
    evaluateTiming.value = Date.now() - startTime
  } catch (e) {
    evaluateError.value = (e as Error).message || JSON.stringify(e, null, 2)
    evaluateTiming.value = Date.now() - startTime
  } finally {
    evaluateLoading.value = false
  }
}

function loadApprovalTemplate(): void {
  approvalInput.value = JSON.stringify(APPROVAL_TEMPLATE, null, 2)
  approvalInputError.value = ''
}

function loadSetupTemplate(): void {
  setupInput.value = JSON.stringify(SETUP_TEMPLATE, null, 2)
  setupInputError.value = ''
}

function loadConsensusTemplate(): void {
  consensusInput.value = JSON.stringify(CONSENSUS_TEMPLATE, null, 2)
  consensusInputError.value = ''
}

function loadEvaluateTemplate(): void {
  evaluateInput.value = JSON.stringify(EVALUATE_TEMPLATE, null, 2)
  evaluateInputError.value = ''
}

function loadScenario(scenarioId: string): void {
  const scenario = SCENARIOS[scenarioId]
  if (!scenario) return

  if (scenario.approval && activeTab.value === 'approval') {
    approvalInput.value = JSON.stringify(scenario.approval, null, 2)
    approvalInputError.value = ''
  } else if (scenario.setup && activeTab.value === 'setup') {
    setupInput.value = JSON.stringify(scenario.setup, null, 2)
    setupInputError.value = ''
  } else if (scenario.consensus && activeTab.value === 'consensus') {
    consensusInput.value = JSON.stringify(scenario.consensus, null, 2)
    consensusInputError.value = ''
  } else if (scenario.approval) {
    // Load into the appropriate tab based on what's available
    activeTab.value = 'approval'
    approvalInput.value = JSON.stringify(scenario.approval, null, 2)
    approvalInputError.value = ''
  } else if (scenario.setup) {
    activeTab.value = 'setup'
    setupInput.value = JSON.stringify(scenario.setup, null, 2)
    setupInputError.value = ''
  } else if (scenario.consensus) {
    activeTab.value = 'consensus'
    consensusInput.value = JSON.stringify(scenario.consensus, null, 2)
    consensusInputError.value = ''
  }
}

function resetAll(): void {
  loadApprovalTemplate()
  loadSetupTemplate()
  loadConsensusTemplate()
  loadEvaluateTemplate()
  approvalResult.value = null
  approvalError.value = ''
  setupResult.value = null
  setupError.value = ''
  consensusResult.value = null
  consensusError.value = ''
  evaluateResult.value = null
  evaluateError.value = ''
}

function formatSmartLabel(key: string): string {
  const labels: Record<string, string> = {
    specific: 'Specific',
    measurable: 'Measurable',
    achievable: 'Achievable',
    relevant: 'Relevant',
    timeBound: 'Time-Bound',
    overall: 'Overall',
  }
  return labels[key] || key
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'ai-testing__smart-fill--high'
  if (score >= 60) return 'ai-testing__smart-fill--medium'
  return 'ai-testing__smart-fill--low'
}
</script>

<style scoped>
/* =============================================================================
   PAGE LAYOUT
   ============================================================================= */

.ai-testing-page {
  min-height: 100vh;
}

.page-main {
  padding: 2rem 0;
}

.ai-testing__layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  align-items: start;
}

.ai-testing__main {
  min-width: 0;
}

@media (max-width: 1024px) {
  .ai-testing__layout {
    grid-template-columns: 1fr;
  }

  .ai-testing__sidebar {
    order: -1;
  }
}

/* =============================================================================
   PAGE HEADER
   ============================================================================= */

.page-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 1.5rem 0;
}

.page-header__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header__breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.page-header__breadcrumb-link:hover {
  color: var(--text-secondary);
}

.page-header__breadcrumb-icon {
  width: 1rem;
  height: 1rem;
}

.page-header__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header__title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.page-header__description {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  max-width: 48rem;
}

/* =============================================================================
   TABS
   ============================================================================= */

.ai-testing__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.ai-testing__tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.ai-testing__tab:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.ai-testing__tab--active {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.ai-testing__tab svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* =============================================================================
   PANELS
   ============================================================================= */

.ai-testing__panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
}

.ai-testing__panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.ai-testing__panel-header h2 {
  margin: 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.ai-testing__panel-header p {
  margin: 0.25rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.ai-testing__endpoint {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}

/* =============================================================================
   FORM GRID
   ============================================================================= */

.ai-testing__form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .ai-testing__form-grid {
    grid-template-columns: 1fr;
  }
}

.ai-testing__input-section h3,
.ai-testing__output-section h3 {
  margin: 0 0 1rem;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.ai-testing__timing {
  font-weight: var(--font-weight-normal);
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

.ai-testing__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

/* =============================================================================
   OUTPUT
   ============================================================================= */

.ai-testing__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-primary);
  color: var(--text-tertiary);
}

.ai-testing__placeholder svg {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.75rem;
}

.ai-testing__placeholder p {
  margin: 0;
  font-size: var(--text-sm);
}

.ai-testing__error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--radius-lg);
  color: var(--color-error-700);
}

.ai-testing__error svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.ai-testing__error pre {
  margin: 0;
  font-size: var(--text-sm);
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-testing__result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-testing__result-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ai-testing__decision {
  padding: 0.25rem 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
}

.ai-testing__decision--approved {
  background-color: var(--color-success-100);
  color: var(--color-success-700);
}

.ai-testing__decision--rejected {
  background-color: var(--color-error-100);
  color: var(--color-error-700);
}

.ai-testing__decision--needs_review {
  background-color: var(--color-warning-100);
  color: var(--color-warning-700);
}

.ai-testing__confidence {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.ai-testing__json {
  margin: 0;
  padding: 1rem;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

/* =============================================================================
   SMART SCORES
   ============================================================================= */

.ai-testing__smart-scores {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.ai-testing__smart-score {
  display: grid;
  grid-template-columns: 100px 1fr 40px;
  align-items: center;
  gap: 0.75rem;
}

.ai-testing__smart-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.ai-testing__smart-bar {
  height: 8px;
  background-color: var(--border-primary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.ai-testing__smart-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.ai-testing__smart-fill--high {
  background-color: var(--color-success-500);
}

.ai-testing__smart-fill--medium {
  background-color: var(--color-warning-500);
}

.ai-testing__smart-fill--low {
  background-color: var(--color-error-500);
}

.ai-testing__smart-value {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-align: right;
}

/* =============================================================================
   PROVIDER VOTES
   ============================================================================= */

.ai-testing__provider-votes {
  padding: 1rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
}

.ai-testing__provider-votes h4 {
  margin: 0 0 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.ai-testing__votes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.ai-testing__vote-card {
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.ai-testing__vote-card--pass {
  background-color: var(--color-success-50);
  border-color: var(--color-success-200);
}

.ai-testing__vote-card--fail {
  background-color: var(--color-error-50);
  border-color: var(--color-error-200);
}

.ai-testing__vote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ai-testing__provider-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-transform: capitalize;
}

.ai-testing__vote-result {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.ai-testing__vote-card--pass .ai-testing__vote-result {
  color: var(--color-success-700);
}

.ai-testing__vote-card--fail .ai-testing__vote-result {
  color: var(--color-error-700);
}

.ai-testing__vote-model,
.ai-testing__vote-confidence,
.ai-testing__vote-time {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* =============================================================================
   SIDEBAR
   ============================================================================= */

.ai-testing__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.helper-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.helper-card__title {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.helper-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.helper-card__list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.helper-card__list-item svg {
  width: 1rem;
  height: 1rem;
  color: var(--color-success-500);
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

.ai-testing__scenarios {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-testing__scenario-btn {
  padding: 0.5rem 0.75rem;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.ai-testing__scenario-btn:hover {
  background-color: var(--surface-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.ai-testing__docs-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-testing__doc-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--text-sm);
  color: var(--interactive-primary);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.ai-testing__doc-link:hover {
  background-color: var(--surface-hover);
}

.ai-testing__doc-link svg {
  width: 1rem;
  height: 1rem;
}

/* =============================================================================
   BUTTONS
   ============================================================================= */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn svg {
  width: 1rem;
  height: 1rem;
}

.btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
}

.btn--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--surface-hover);
}

.btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-xs);
}

/* =============================================================================
   UTILITIES
   ============================================================================= */

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
