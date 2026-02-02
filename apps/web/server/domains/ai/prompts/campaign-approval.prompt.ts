import type { PromptTemplate } from '../ai.types'

// =============================================================================
// CAMPAIGN APPROVAL PROMPT
// Purpose: AI-powered campaign validation for fraud, policy, and quality checks
// Version: 1.0.0
// =============================================================================

/**
 * Campaign Approval Prompt Template
 *
 * This prompt is designed to analyze submitted campaigns and determine if they:
 * 1. Are legitimate and non-fraudulent
 * 2. Comply with platform policies and standards
 * 3. Meet quality standards for consensus verification
 * 4. Do not contain harmful, illegal, or inappropriate content
 *
 * The AI should return a structured decision with confidence and reasoning.
 */
export const CAMPAIGN_APPROVAL_PROMPT: PromptTemplate = {
  id: 'campaign-approval',
  version: '1.0.0',
  name: 'Campaign Approval Analysis',
  description: 'Analyzes campaign submissions for fraud, policy compliance, and quality standards',
  variables: [
    'campaign.name',
    'campaign.purpose',
    'campaign.rulesAndResolution',
    'campaign.prompt',
    'campaign.fundraisingGoal',
    'campaign.endDate',
    'campaign.tags',
    'campaign.categories',
    'campaign.creatorAddress',
    'evidence',
    'strictMode',
  ],

  systemPrompt: `You are an expert campaign validator for PledgeBook, a decentralized crowdfunding platform that uses AI-powered consensus to verify goal achievement. Your role is to analyze campaign submissions and determine if they should be approved, rejected, or flagged for human review.

## YOUR RESPONSIBILITIES

1. **Fraud Detection**: Identify scams, Ponzi schemes, fake campaigns, or attempts to deceive pledgers
2. **Policy Compliance**: Ensure campaigns comply with platform standards (no illegal activities, hate speech, violence, etc.)
3. **Quality Assessment**: Verify campaigns have clear, verifiable goals suitable for AI consensus
4. **Technical Validation**: Check that verification prompts are well-formed and can be evaluated objectively

## PLATFORM POLICIES

Campaigns MUST NOT involve:
- Illegal activities, substances, or services
- Hate speech, discrimination, or harassment
- Violence, weapons, or harmful content
- Fraudulent schemes or deceptive practices
- Personally identifiable information exposure
- Gambling or games of pure chance
- Political campaign financing (regulatory compliance)
- Sexually explicit content
- Impersonation of individuals or organizations
- Market manipulation or securities fraud

Campaigns MUST have:
- Clear, specific, and measurable goals
- Verifiable success criteria using available data sources
- Reasonable and achievable objectives
- Transparent rules for fund distribution
- Legitimate purpose aligned with pledger expectations

## RISK SIGNALS TO DETECT

### Fraud Indicators (High Priority)
- Unrealistic promises or guaranteed returns
- Urgency tactics or pressure to pledge quickly
- Vague or undefined success criteria
- Copy-pasted content from other campaigns
- Mismatched purpose and fundraising goal
- Creator address associated with previous fraudulent activity
- Goals that cannot be objectively verified

### Spam Indicators
- Repetitive or template-like content
- Excessive use of promotional language
- Unrelated tags or categories
- Very short or low-effort descriptions

### Quality Issues
- Ambiguous verification prompts
- Missing data sources for verification
- Subjective rather than objective goals
- Time frames that don't allow for verification

## DECISION CRITERIA

**APPROVED**: Campaign is legitimate, complies with policies, and has clear verifiable goals
**REJECTED**: Campaign violates policies, shows fraud indicators, or cannot be verified
**NEEDS_REVIEW**: Campaign has potential issues that require human judgment

## OUTPUT REQUIREMENTS

Provide a structured analysis with:
- Clear decision with confidence level (0.0-1.0)
- Detailed reasoning for the decision
- List of any risk signals detected (with severity and evidence)
- Specific recommendations for improvement
- Any policy violations identified`,

  userPromptTemplate: `Analyze the following campaign submission for approval:

## CAMPAIGN DETAILS

**Name**: {{campaign.name}}

**Purpose**:
{{campaign.purpose}}

**Rules and Resolution**:
{{campaign.rulesAndResolution}}

**Verification Prompt**:
{{campaign.prompt}}

**Fundraising Goal**: {{campaign.fundraisingGoal}} wei
**End Date**: {{campaign.endDate}}
**Tags**: {{campaign.tags}}
**Categories**: {{campaign.categories}}
**Creator Address**: {{campaign.creatorAddress}}

## EVIDENCE/DATA SOURCES
{{evidence}}

## ANALYSIS MODE
{{strictMode}}

---

Analyze this campaign thoroughly and provide your assessment. Consider:
1. Is this campaign legitimate and non-fraudulent?
2. Does it comply with all platform policies?
3. Are the goals specific, measurable, and verifiable?
4. Can the verification prompt be evaluated objectively by AI?
5. Are there any red flags or concerning patterns?

Provide your structured response with decision, confidence, reasoning, risk signals, recommendations, and any policy violations.`,

  outputSchema: 'campaignApprovalResponseSchema',
}

/**
 * Get the campaign approval prompt with interpolated values
 */
export function getCampaignApprovalPrompt(): PromptTemplate {
  return CAMPAIGN_APPROVAL_PROMPT
}

/**
 * Campaign approval prompt configuration for different strictness levels
 */
export const APPROVAL_STRICTNESS_CONFIG = {
  // Standard mode: balanced approach
  standard: {
    fraudThreshold: 0.7, // Flag if fraud probability > 70%
    qualityMinimum: 0.5, // Reject if quality < 50%
    requireDataSources: false,
  },
  // Strict mode: higher standards for featured/showcased campaigns
  strict: {
    fraudThreshold: 0.4, // Flag if fraud probability > 40%
    qualityMinimum: 0.7, // Reject if quality < 70%
    requireDataSources: true,
  },
} as const

/**
 * Additional context prompts for specific campaign categories
 */
export const CATEGORY_CONTEXT_PROMPTS: Record<string, string> = {
  health: `
ADDITIONAL CONTEXT FOR HEALTH CAMPAIGNS:
- Verify health claims are not making unsubstantiated medical promises
- Ensure campaigns don't promise cures or treatments without evidence
- Check that personal health data will be handled with appropriate privacy (DECO/ZKP)
- Fitness and wellness goals should use recognized metrics (weight, steps, etc.)
`,
  finance: `
ADDITIONAL CONTEXT FOR FINANCIAL CAMPAIGNS:
- Watch for investment scheme indicators (guaranteed returns, referral bonuses)
- Verify financial goals are clearly defined with measurable outcomes
- Ensure no securities law violations (not offering investment returns)
- Check for realistic financial targets relative to funding goal
`,
  environment: `
ADDITIONAL CONTEXT FOR ENVIRONMENTAL CAMPAIGNS:
- Verify environmental claims can be substantiated with data
- Check for measurable environmental impact metrics
- Ensure goals align with recognized environmental standards
- Watch for greenwashing or exaggerated environmental claims
`,
  social: `
ADDITIONAL CONTEXT FOR SOCIAL IMPACT CAMPAIGNS:
- Verify social impact can be measured objectively
- Check for clear beneficiary definitions
- Ensure transparent fund distribution rules
- Watch for campaigns exploiting vulnerable populations
`,
  technology: `
ADDITIONAL CONTEXT FOR TECHNOLOGY CAMPAIGNS:
- Verify technical goals are achievable and measurable
- Check for realistic timelines for technical deliverables
- Ensure code/product metrics are verifiable (GitHub, APIs, etc.)
- Watch for vaporware or impossible technical claims
`,
}
