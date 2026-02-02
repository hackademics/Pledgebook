import type { PromptTemplate } from '../ai.types'

// =============================================================================
// CAMPAIGN SETUP HELPER PROMPT
// Purpose: AI-powered assistance for creating valid, consensus-ready campaigns
// Version: 1.0.0
// =============================================================================

/**
 * Campaign Setup Helper Prompt Template
 *
 * This prompt assists users in creating campaigns that:
 * 1. Have clear, SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals
 * 2. Include proper verification prompts for AI consensus
 * 3. Specify appropriate data sources for verification
 * 4. Meet platform standards for approval
 */
export const CAMPAIGN_SETUP_PROMPT: PromptTemplate = {
  id: 'campaign-setup-helper',
  version: '1.0.0',
  name: 'Campaign Setup Assistant',
  description:
    'Helps users create valid, consensus-ready campaigns with proper verification prompts',
  variables: [
    'name',
    'purpose',
    'rulesAndResolution',
    'prompt',
    'fundraisingGoal',
    'endDate',
    'tags',
    'categories',
    'evidence',
  ],

  systemPrompt: `You are an expert campaign creation assistant for PledgeBook, a decentralized crowdfunding platform that uses AI-powered consensus to verify goal achievement. Your role is to help users create campaigns that are clear, verifiable, and likely to achieve consensus.

## YOUR ROLE

You help campaign creators by:
1. **Evaluating** their campaign details against SMART criteria
2. **Refining** their verification prompts for AI consensus
3. **Recommending** appropriate data sources for verification
4. **Identifying** potential issues before submission
5. **Suggesting** improvements to increase approval likelihood

## SMART CRITERIA FOR CAMPAIGNS

**Specific**: The goal must be clear and well-defined
- ❌ "Lose weight" → ✅ "Reduce body weight by 20 lbs"
- ❌ "Improve sales" → ✅ "Increase monthly revenue by $10,000"
- ❌ "Help the environment" → ✅ "Plant 1,000 trees in California"

**Measurable**: The goal must have quantifiable success criteria
- Include specific numbers, percentages, or countable outcomes
- Define exactly what data points will be compared
- Specify the comparison operator (greater than, less than, equals)

**Achievable**: The goal must be realistic given the timeframe and resources
- Consider typical success rates for similar goals
- Evaluate if the data sources can actually provide the needed information
- Check that the timeline allows for meaningful progress

**Relevant**: The goal must be meaningful and aligned with the campaign purpose
- The verification should prove what pledgers care about
- Data sources should be appropriate for the goal type
- The outcome should justify the fundraising goal

**Time-bound**: The goal must have clear start and end dates
- Baseline data captured at campaign start
- Final verification at campaign end date
- Consider if the timeframe is appropriate for the goal

## VERIFICATION PROMPT BEST PRACTICES

A good verification prompt should:

1. **Start with a clear TRUE/FALSE question**
   Example: "Did the campaign creator achieve a weight loss of at least 20 lbs?"

2. **Specify exact data comparisons**
   Example: "Compare the baseline weight from [date] with the final weight on [end_date]"

3. **Reference specific data sources**
   Example: "Using data from the Fitbit API, verify that..."

4. **Include success criteria formula**
   Example: "Return TRUE if: current_value <= baseline_value - 20"

5. **Handle edge cases**
   Example: "Return FALSE if data is missing or cannot be verified"

## DATA SOURCE TYPES

1. **Public APIs**: Openly accessible data (GitHub, public fitness APIs, weather services)
   - Best for: Code contributions, public metrics, environmental data
   - Verification: Direct API calls with response validation

2. **Private APIs (DECO/ZKP)**: User-authenticated data with privacy preservation
   - Best for: Personal health data, financial records, private accounts
   - Verification: Zero-knowledge proofs prove facts without revealing raw data

3. **Image OCR**: AI vision analysis of uploaded images
   - Best for: Scale photos, document verification, before/after comparisons
   - Verification: AI extracts and compares values from images

4. **URLs/Documents**: Web pages or uploaded documents
   - Best for: News articles, official reports, certifications
   - Verification: Content extraction and analysis

## CONSENSUS READINESS CHECKLIST

A campaign is consensus-ready when:
- [ ] Goal is SMART (all 5 criteria met with score ≥70%)
- [ ] Verification prompt is clear and unambiguous
- [ ] At least one verifiable data source is specified
- [ ] Success criteria are objective (not subjective)
- [ ] Timeframe allows for data collection
- [ ] No policy violations or red flags

## OUTPUT FORMAT

Provide a comprehensive assessment including:
1. Validity status (is the campaign ready for submission?)
2. SMART score breakdown (0-100 for each criterion)
3. Refined verification prompt (improved version)
4. List of specific improvements made
5. Warnings about potential issues
6. Suggestions for enhancement
7. Recommended data sources with descriptions
8. Consensus readiness assessment (ready/not ready with blockers)`,

  userPromptTemplate: `Help me create/improve a PledgeBook campaign with the following details:

## CURRENT CAMPAIGN DRAFT

**Name**: {{name}}

**Purpose**:
{{purpose}}

**Rules and Resolution**:
{{rulesAndResolution}}

**Verification Prompt** (current draft):
{{prompt}}

**Fundraising Goal**: {{fundraisingGoal}}
**End Date**: {{endDate}}
**Tags**: {{tags}}
**Categories**: {{categories}}

## DATA SOURCES (if specified)
{{evidence}}

---

Please analyze this campaign and provide:

1. **SMART Score**: Rate each criterion (Specific, Measurable, Achievable, Relevant, Time-bound) from 0-100 and explain why

2. **Refined Prompt**: Provide an improved verification prompt that:
   - Starts with a clear TRUE/FALSE question
   - Specifies exact data comparisons
   - References the data sources
   - Includes success criteria formula
   - Handles edge cases

3. **Improvements**: List specific changes you made to the prompt

4. **Warnings**: Flag any issues that could cause approval rejection

5. **Suggestions**: Recommend additional improvements

6. **Data Sources**: Suggest appropriate data sources for verification

7. **Consensus Readiness**: Assess if the campaign is ready for AI consensus with specific blockers if not`,

  outputSchema: 'campaignSetupHelpResponseSchema',
}

/**
 * Get the campaign setup helper prompt
 */
export function getCampaignSetupPrompt(): PromptTemplate {
  return CAMPAIGN_SETUP_PROMPT
}

/**
 * Example refined prompts for common campaign types
 * These serve as references for the AI to learn the expected format
 */
export const EXAMPLE_REFINED_PROMPTS: Record<string, { original: string; refined: string }> = {
  weightLoss: {
    original: 'Verify that I lost weight during this campaign.',
    refined: `VERIFICATION QUESTION: Did the campaign creator achieve a weight loss of at least {{targetLbs}} lbs during the campaign period?

DATA SOURCES:
- Fitbit API (authenticated via DECO): Weight readings
- OR Image OCR: Scale photos with timestamps

BASELINE CAPTURE (Campaign Start):
- Record: baseline_weight from first weight reading after start_date
- Hash and store: baseline_weight_hash

FINAL EVALUATION (Campaign End):
- Retrieve: current_weight from most recent weight reading before end_date
- Calculate: weight_change = baseline_weight - current_weight

SUCCESS CRITERIA:
- Return TRUE if: weight_change >= {{targetLbs}}
- Return FALSE if: weight_change < {{targetLbs}}
- Return FALSE if: Data is missing, corrupted, or cannot be verified

INCLUDE IN REASONING:
- Exact baseline and final weight values (or ZKP proof of delta)
- Date of measurements
- Confidence level based on data consistency
- Any anomalies detected`,
  },

  codeContributions: {
    original: 'Check if I made contributions to the open source project.',
    refined: `VERIFICATION QUESTION: Did the campaign creator make at least {{targetCommits}} merged commits to the {{repoOwner}}/{{repoName}} repository during the campaign period?

DATA SOURCES:
- GitHub API (public): /repos/{{repoOwner}}/{{repoName}}/commits
- Query parameters: author={{creatorGithubUsername}}&since={{startDate}}&until={{endDate}}

BASELINE CAPTURE (Campaign Start):
- Record: baseline_commit_count = total commits by author before start_date
- Hash and store: baseline_commit_hash

FINAL EVALUATION (Campaign End):
- Retrieve: current_commit_count = total commits by author before end_date
- Calculate: new_commits = current_commit_count - baseline_commit_count

SUCCESS CRITERIA:
- Return TRUE if: new_commits >= {{targetCommits}}
- Return FALSE if: new_commits < {{targetCommits}}
- Return FALSE if: GitHub API is unavailable or author not found

INCLUDE IN REASONING:
- Exact commit counts (baseline and final)
- List of commit SHAs as evidence
- Verification that commits are merged (not just pushed)
- Any commits that appear suspicious or automated`,
  },

  fundraising: {
    original: 'Verify the charity received the donation.',
    refined: `VERIFICATION QUESTION: Did the campaign creator successfully transfer at least {{targetAmount}} {{currency}} to {{charityName}} (verified address: {{charityAddress}}) during the campaign period?

DATA SOURCES:
- Blockchain Explorer API: Transaction history for creator address
- Charity verification: Confirmed receiving address from official source

VERIFICATION STEPS:
1. Query transactions from {{creatorAddress}} between {{startDate}} and {{endDate}}
2. Filter for transactions to {{charityAddress}}
3. Sum total transferred amount

SUCCESS CRITERIA:
- Return TRUE if: total_transferred >= {{targetAmount}}
- Return FALSE if: total_transferred < {{targetAmount}}
- Return FALSE if: No transactions found to verified charity address

INCLUDE IN REASONING:
- Transaction hashes as evidence
- Total amount transferred
- Confirmation that receiving address is verified charity
- Timestamp of transactions`,
  },

  environmental: {
    original: 'Check if the trees were planted.',
    refined: `VERIFICATION QUESTION: Were at least {{targetTrees}} trees planted in {{location}} as part of this campaign, verified by {{verificationPartner}}?

DATA SOURCES:
- Partner API: {{verificationPartnerAPI}} (authenticated)
- OR Official certification document (Image OCR)
- OR Public registry: {{publicTreeRegistry}}

VERIFICATION STEPS:
1. Query planting records for campaign ID or creator ID
2. Verify location matches specified region
3. Confirm tree count and species

SUCCESS CRITERIA:
- Return TRUE if: verified_tree_count >= {{targetTrees}} AND location_verified = true
- Return FALSE if: verified_tree_count < {{targetTrees}}
- Return FALSE if: Location does not match or data cannot be verified

INCLUDE IN REASONING:
- Certificate or registry ID as evidence
- Exact tree count verified
- Location confirmation
- Date of verification
- Partner/registry credibility assessment`,
  },
}

/**
 * Common data source recommendations by category
 */
export const DATA_SOURCE_RECOMMENDATIONS: Record<
  string,
  Array<{
    type: 'public-api' | 'private-api' | 'image-ocr' | 'document' | 'url'
    name: string
    description: string
    endpoint?: string
  }>
> = {
  health: [
    {
      type: 'private-api',
      name: 'Fitbit API',
      description: 'Weight, steps, sleep data with DECO privacy preservation',
      endpoint: 'api.fitbit.com',
    },
    {
      type: 'private-api',
      name: 'Apple Health',
      description: 'Health metrics via HealthKit with ZKP verification',
    },
    {
      type: 'private-api',
      name: 'Strava API',
      description: 'Running, cycling, and workout data',
      endpoint: 'api.strava.com',
    },
    {
      type: 'image-ocr',
      name: 'Scale Photos',
      description: 'AI-extracted weight values from timestamped photos',
    },
  ],
  technology: [
    {
      type: 'public-api',
      name: 'GitHub API',
      description: 'Commits, PRs, issues, and repository statistics',
      endpoint: 'api.github.com',
    },
    {
      type: 'public-api',
      name: 'GitLab API',
      description: 'Project contributions and merge requests',
      endpoint: 'gitlab.com/api/v4',
    },
    {
      type: 'public-api',
      name: 'npm Registry',
      description: 'Package downloads and version releases',
      endpoint: 'registry.npmjs.org',
    },
  ],
  finance: [
    {
      type: 'public-api',
      name: 'Blockchain Explorer',
      description: 'On-chain transaction verification',
      endpoint: 'Etherscan, Polygonscan, etc.',
    },
    {
      type: 'private-api',
      name: 'Bank Statement (DECO)',
      description: 'Privacy-preserving proof of financial transactions',
    },
    {
      type: 'document',
      name: 'Financial Report',
      description: 'Official financial statements or receipts',
    },
  ],
  environment: [
    {
      type: 'public-api',
      name: 'One Tree Planted API',
      description: 'Tree planting verification and certificates',
    },
    {
      type: 'url',
      name: 'Public Registry',
      description: 'Government or NGO environmental registries',
    },
    {
      type: 'document',
      name: 'Certification',
      description: 'Official environmental impact certifications',
    },
  ],
  social: [
    {
      type: 'public-api',
      name: 'Charity Navigator',
      description: 'Charity verification and ratings',
      endpoint: 'api.charitynavigator.org',
    },
    {
      type: 'document',
      name: 'Donation Receipt',
      description: 'Official receipts from charitable organizations',
    },
    {
      type: 'public-api',
      name: 'Blockchain Donations',
      description: 'Verified on-chain donations to charity addresses',
    },
  ],
}
