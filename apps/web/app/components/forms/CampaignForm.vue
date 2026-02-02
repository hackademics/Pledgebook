<template>
  <div class="campaign-form">
    <!-- Step Indicator -->
    <div class="campaign-form__stepper">
      <div class="stepper">
        <button
          v-for="step in steps"
          :key="step.id"
          type="button"
          class="stepper__step"
          :class="{
            'stepper__step--active': step.isActive,
            'stepper__step--complete': step.isComplete && !step.isActive,
            'stepper__step--disabled': step.id > store.draft.currentStep + 1,
          }"
          :disabled="step.id > store.draft.currentStep + 1"
          @click="goToStep(step.id)"
        >
          <div class="stepper__step-indicator">
            <Icon
              v-if="step.isComplete && !step.isActive"
              name="heroicons:check"
              class="stepper__step-check"
            />
            <span v-else>{{ step.id }}</span>
          </div>
          <div class="stepper__step-content">
            <span class="stepper__step-title">{{ step.title }}</span>
            <span class="stepper__step-description">{{ step.description }}</span>
          </div>
        </button>
      </div>
      <div class="stepper__progress">
        <div
          class="stepper__progress-bar"
          :style="{ width: `${store.formProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Form Content -->
    <form
      class="campaign-form__content"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <!-- Step 1: Basic Info -->
      <Transition
        name="slide"
        mode="out-in"
      >
        <div
          v-if="store.draft.currentStep === 1"
          key="step-1"
          class="campaign-form__step"
        >
          <div class="campaign-form__step-header">
            <Icon
              name="heroicons:sparkles"
              class="campaign-form__step-icon"
            />
            <div>
              <h2 class="campaign-form__step-title">Basic Information</h2>
              <p class="campaign-form__step-description">
                Define your campaign's core details and SMART goals
              </p>
            </div>
          </div>

          <div class="campaign-form__fields">
            <!-- Campaign Name -->
            <div class="form-field">
              <div class="form-field__header">
                <label
                  for="name"
                  class="form-field__label"
                >
                  Campaign Name
                  <span class="form-field__required">*</span>
                </label>
                <button
                  type="button"
                  class="form-field__tooltip-trigger"
                  @click="showTooltip('name')"
                >
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="form-field__tooltip-icon"
                  />
                </button>
              </div>
              <input
                id="name"
                v-model="store.draft.name"
                type="text"
                class="form-field__input"
                :class="{ 'form-field__input--error': getError('name') }"
                placeholder="Enter a memorable campaign name"
                maxlength="100"
                @input="handleFieldChange('name')"
              />
              <div class="form-field__footer">
                <span
                  v-if="getError('name')"
                  class="form-field__error"
                >
                  <Icon
                    name="heroicons:exclamation-circle"
                    class="form-field__error-icon"
                  />
                  {{ getError('name') }}
                </span>
                <span
                  v-else
                  class="form-field__hint"
                >
                  Choose a clear, descriptive name
                </span>
                <span class="form-field__counter">{{ store.draft.name.length }}/100</span>
              </div>
            </div>

            <!-- Purpose Statement -->
            <div class="form-field">
              <div class="form-field__header">
                <label
                  for="purpose"
                  class="form-field__label"
                >
                  Purpose Statement (SMART Goal)
                  <span class="form-field__required">*</span>
                </label>
                <button
                  type="button"
                  class="form-field__tooltip-trigger"
                  @click="showTooltip('purpose')"
                >
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="form-field__tooltip-icon"
                  />
                </button>
              </div>
              <textarea
                id="purpose"
                v-model="store.draft.purpose"
                class="form-field__textarea"
                :class="{ 'form-field__textarea--error': getError('purpose') }"
                placeholder="Describe your goal using SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound"
                rows="4"
                maxlength="1000"
                @input="handleFieldChange('purpose')"
              ></textarea>
              <div class="form-field__footer">
                <span
                  v-if="getError('purpose')"
                  class="form-field__error"
                >
                  <Icon
                    name="heroicons:exclamation-circle"
                    class="form-field__error-icon"
                  />
                  {{ getError('purpose') }}
                </span>
                <span
                  v-else
                  class="form-field__hint"
                >
                  <Icon
                    name="heroicons:light-bulb"
                    class="form-field__hint-icon"
                  />
                  Example: "Lose 50 lbs by Dec 2026, verified via weekly Fitbit data"
                </span>
                <span class="form-field__counter">{{ store.draft.purpose.length }}/1000</span>
              </div>
            </div>

            <!-- Funding Row -->
            <div class="form-field__row">
              <!-- Fundraising Goal -->
              <div class="form-field">
                <div class="form-field__header">
                  <label
                    for="fundraisingGoal"
                    class="form-field__label"
                  >
                    Fundraising Goal
                    <span class="form-field__required">*</span>
                  </label>
                  <button
                    type="button"
                    class="form-field__tooltip-trigger"
                    @click="showTooltip('fundraisingGoal')"
                  >
                    <Icon
                      name="heroicons:question-mark-circle"
                      class="form-field__tooltip-icon"
                    />
                  </button>
                </div>
                <div class="form-field__input-group">
                  <span class="form-field__input-prefix">$</span>
                  <input
                    id="fundraisingGoal"
                    v-model="fundraisingGoalDisplay"
                    type="text"
                    class="form-field__input form-field__input--with-prefix"
                    :class="{ 'form-field__input--error': getError('fundraisingGoal') }"
                    placeholder="10,000"
                    @input="handleFundraisingGoalInput"
                  />
                  <span class="form-field__input-suffix">USDC</span>
                </div>
                <span
                  v-if="getError('fundraisingGoal')"
                  class="form-field__error"
                >
                  {{ getError('fundraisingGoal') }}
                </span>
              </div>

              <!-- Creator Bond -->
              <div class="form-field">
                <div class="form-field__header">
                  <label
                    for="creatorBond"
                    class="form-field__label"
                  >
                    Creator Bond
                  </label>
                  <button
                    type="button"
                    class="form-field__tooltip-trigger"
                    @click="showTooltip('creatorBond')"
                  >
                    <Icon
                      name="heroicons:question-mark-circle"
                      class="form-field__tooltip-icon"
                    />
                  </button>
                </div>
                <div class="form-field__input-group">
                  <span class="form-field__input-prefix">$</span>
                  <input
                    id="creatorBond"
                    v-model="creatorBondDisplay"
                    type="text"
                    class="form-field__input form-field__input--with-prefix"
                    placeholder="100"
                    @input="handleCreatorBondInput"
                  />
                  <span class="form-field__input-suffix">USDC</span>
                </div>
                <span class="form-field__hint">
                  <Icon
                    name="heroicons:shield-check"
                    class="form-field__hint-icon"
                  />
                  Stake shows commitment; returned on success
                </span>
              </div>
            </div>

            <!-- Date Row -->
            <div class="form-field__row">
              <!-- Start Date -->
              <div class="form-field">
                <label
                  for="startDate"
                  class="form-field__label"
                >
                  Start Date
                  <span class="form-field__optional">(optional)</span>
                </label>
                <input
                  id="startDate"
                  v-model="store.draft.startDate"
                  type="datetime-local"
                  class="form-field__input"
                  :min="minStartDate"
                />
                <span class="form-field__hint">When pledging begins</span>
              </div>

              <!-- End Date -->
              <div class="form-field">
                <div class="form-field__header">
                  <label
                    for="endDate"
                    class="form-field__label"
                  >
                    End Date
                    <span class="form-field__required">*</span>
                  </label>
                </div>
                <input
                  id="endDate"
                  v-model="store.draft.endDate"
                  type="datetime-local"
                  class="form-field__input"
                  :class="{ 'form-field__input--error': getError('endDate') }"
                  :min="minEndDate"
                  @change="handleFieldChange('endDate')"
                />
                <span
                  v-if="getError('endDate')"
                  class="form-field__error"
                >
                  {{ getError('endDate') }}
                </span>
                <span
                  v-else
                  class="form-field__hint"
                >
                  Deadline for goal verification
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Verification Setup -->
        <div
          v-else-if="store.draft.currentStep === 2"
          key="step-2"
          class="campaign-form__step"
        >
          <div class="campaign-form__step-header">
            <Icon
              name="heroicons:shield-check"
              class="campaign-form__step-icon"
            />
            <div>
              <h2 class="campaign-form__step-title">Verification Setup</h2>
              <p class="campaign-form__step-description">
                Define rules and data sources for AI consensus verification
              </p>
            </div>
          </div>

          <div class="campaign-form__fields">
            <!-- Rules & Resolution -->
            <div class="form-field">
              <div class="form-field__header">
                <label
                  for="rulesAndResolution"
                  class="form-field__label"
                >
                  Rules & Resolution Criteria
                  <span class="form-field__required">*</span>
                </label>
                <button
                  type="button"
                  class="form-field__tooltip-trigger"
                  @click="showTooltip('rulesAndResolution')"
                >
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="form-field__tooltip-icon"
                  />
                </button>
              </div>
              <textarea
                id="rulesAndResolution"
                v-model="store.draft.rulesAndResolution"
                class="form-field__textarea"
                :class="{ 'form-field__textarea--error': getError('rulesAndResolution') }"
                placeholder="Define exactly how success/failure is determined. Include specific criteria, thresholds, and resolution process."
                rows="5"
                maxlength="2000"
                @input="handleFieldChange('rulesAndResolution')"
              ></textarea>
              <div class="form-field__footer">
                <span
                  v-if="getError('rulesAndResolution')"
                  class="form-field__error"
                >
                  {{ getError('rulesAndResolution') }}
                </span>
                <span
                  v-else
                  class="form-field__hint"
                >
                  Clear criteria enable unambiguous AI consensus
                </span>
                <span class="form-field__counter">
                  {{ store.draft.rulesAndResolution.length }}/2000
                </span>
              </div>
            </div>

            <!-- Data Sources Section -->
            <div class="form-field">
              <div class="form-field__header">
                <label class="form-field__label"> Verification Data Sources </label>
                <button
                  type="button"
                  class="form-field__tooltip-trigger"
                  @click="showTooltip('sources')"
                >
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="form-field__tooltip-icon"
                  />
                </button>
              </div>

              <!-- Source Type Selection -->
              <div class="source-types">
                <button
                  v-for="sourceType in sourceTypes"
                  :key="sourceType.type"
                  type="button"
                  class="source-type-btn"
                  @click="addNewSource(sourceType.type)"
                >
                  <Icon
                    :name="getSourceTypeIcon(sourceType.type)"
                    class="source-type-btn__icon"
                  />
                  <div class="source-type-btn__content">
                    <span class="source-type-btn__title">{{
                      getSourceTypeLabel(sourceType.type)
                    }}</span>
                    <span class="source-type-btn__description">{{ sourceType.hint }}</span>
                  </div>
                  <Icon
                    name="heroicons:plus"
                    class="source-type-btn__add"
                  />
                </button>
              </div>

              <!-- Added Sources -->
              <div
                v-if="store.draft.sources.length > 0"
                class="sources-list"
              >
                <div
                  v-for="source in store.draft.sources"
                  :key="source.id"
                  class="source-card"
                >
                  <div class="source-card__header">
                    <Icon
                      :name="getSourceTypeIcon(source.type)"
                      class="source-card__icon"
                    />
                    <span class="source-card__type">{{ getSourceTypeLabel(source.type) }}</span>
                    <button
                      type="button"
                      class="source-card__remove"
                      @click="store.removeSource(source.id)"
                    >
                      <Icon name="heroicons:x-mark" />
                    </button>
                  </div>

                  <div class="source-card__body">
                    <!-- Source Name -->
                    <div class="source-card__field">
                      <label
                        :for="`source-name-${source.id}`"
                        class="source-card__label"
                      >
                        Source Name
                      </label>
                      <input
                        :id="`source-name-${source.id}`"
                        v-model="source.label"
                        type="text"
                        class="form-field__input"
                        placeholder="e.g., Fitbit Weight API"
                        @input="updateSourceField(source.id, 'label', source.label)"
                      />
                    </div>

                    <!-- API Endpoint (for public-api and private-api) -->
                    <div
                      v-if="source.type !== 'image-ocr'"
                      class="source-card__field"
                    >
                      <label
                        :for="`source-endpoint-${source.id}`"
                        class="source-card__label"
                      >
                        API Endpoint
                      </label>
                      <input
                        :id="`source-endpoint-${source.id}`"
                        v-model="source.endpoint"
                        type="url"
                        class="form-field__input"
                        placeholder="https://api.example.com/data"
                        @input="updateSourceField(source.id, 'endpoint', source.endpoint)"
                      />
                    </div>

                    <!-- Private API: API Key -->
                    <template v-if="source.type === 'private-api'">
                      <div class="source-card__field">
                        <label
                          :for="`source-apikey-${source.id}`"
                          class="source-card__label"
                        >
                          API Key
                        </label>
                        <div class="form-field__input-group form-field__input-group--stacked">
                          <input
                            :id="`source-apikey-${source.id}`"
                            v-model="source.apiKey"
                            type="password"
                            class="form-field__input"
                            placeholder="Enter your API key"
                            @input="updateSourceField(source.id, 'apiKey', source.apiKey)"
                          />
                          <span class="form-field__input-note">
                            <Icon name="heroicons:lock-closed" />
                            Encrypted client-side for DECO/ZKP verification
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- Image OCR: File URL -->
                    <template v-if="source.type === 'image-ocr'">
                      <div class="source-card__field">
                        <label
                          :for="`source-fileurl-${source.id}`"
                          class="source-card__label"
                        >
                          Image URL
                        </label>
                        <div class="source-card__upload">
                          <div class="source-card__upload-row">
                            <input
                              :id="`source-fileurl-${source.id}`"
                              v-model="source.fileUrl"
                              type="url"
                              class="form-field__input"
                              placeholder="ipfs://... or https://..."
                              @input="updateSourceField(source.id, 'fileUrl', source.fileUrl)"
                            />
                            <button
                              type="button"
                              class="source-card__upload-btn"
                              @click="openImageUploadModal(source.id)"
                            >
                              <Icon name="heroicons:cloud-arrow-up" />
                              Upload
                            </button>
                          </div>
                          <span class="form-field__hint">
                            <Icon name="heroicons:photo" />
                            Upload to IPFS or enter a direct URL. AI extracts values via OCR.
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- Description -->
                    <div class="source-card__field">
                      <label
                        :for="`source-desc-${source.id}`"
                        class="source-card__label"
                      >
                        Description
                      </label>
                      <textarea
                        :id="`source-desc-${source.id}`"
                        v-model="source.description"
                        class="form-field__textarea form-field__textarea--small"
                        placeholder="Describe what data this source provides"
                        rows="2"
                        @input="updateSourceField(source.id, 'description', source.description)"
                      ></textarea>
                    </div>

                    <!-- Privacy Checkbox -->
                    <label class="form-field__checkbox">
                      <input
                        v-model="source.isPrivate"
                        type="checkbox"
                        @change="updateSourceField(source.id, 'isPrivate', source.isPrivate)"
                      />
                      <span class="form-field__checkbox-label">
                        <Icon name="heroicons:eye-slash" />
                        Keep source data private (ZKP verification)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="sources-empty"
              >
                <Icon
                  name="heroicons:document-plus"
                  class="sources-empty__icon"
                />
                <p>Add data sources to enable verifiable consensus</p>
                <span>Sources allow AI to fetch real-world data for verification</span>
              </div>
            </div>

            <!-- Privacy Mode -->
            <div class="form-field">
              <div class="privacy-toggle">
                <div class="privacy-toggle__content">
                  <Icon
                    name="heroicons:shield-exclamation"
                    class="privacy-toggle__icon"
                  />
                  <div>
                    <span class="privacy-toggle__title">Privacy Mode</span>
                    <span class="privacy-toggle__description">
                      Enable zero-knowledge proofs for sensitive data verification
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  class="privacy-toggle__switch"
                  :class="{ 'privacy-toggle__switch--active': store.draft.privacyMode }"
                  role="switch"
                  :aria-checked="store.draft.privacyMode"
                  @click="store.draft.privacyMode = !store.draft.privacyMode"
                >
                  <span class="privacy-toggle__switch-thumb"></span>
                </button>
              </div>
              <div
                v-if="store.draft.privacyMode"
                class="privacy-info"
              >
                <Icon name="heroicons:information-circle" />
                <span>
                  ZKPs prove outcomes (e.g., "lost ≥50 lbs") without revealing actual values. Uses
                  DECO for private API attestation.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Prompt Refinement -->
        <div
          v-else-if="store.draft.currentStep === 3"
          key="step-3"
          class="campaign-form__step"
        >
          <div class="campaign-form__step-header">
            <Icon
              name="heroicons:cpu-chip"
              class="campaign-form__step-icon"
            />
            <div>
              <h2 class="campaign-form__step-title">AI Verification Prompt</h2>
              <p class="campaign-form__step-description">
                Craft the prompt that AI systems will use for consensus verification
              </p>
            </div>
          </div>

          <div class="campaign-form__fields">
            <!-- Prompt Input -->
            <div class="form-field">
              <div class="form-field__header">
                <label
                  for="prompt"
                  class="form-field__label"
                >
                  Verification Prompt
                  <span class="form-field__required">*</span>
                </label>
                <button
                  type="button"
                  class="form-field__tooltip-trigger"
                  @click="showTooltip('prompt')"
                >
                  <Icon
                    name="heroicons:question-mark-circle"
                    class="form-field__tooltip-icon"
                  />
                </button>
              </div>
              <textarea
                id="prompt"
                v-model="store.draft.prompt"
                class="form-field__textarea form-field__textarea--large"
                :class="{ 'form-field__textarea--error': getError('prompt') }"
                placeholder="Write the exact prompt AI will use to verify your campaign's outcome. Be specific about data sources, comparison logic, and success criteria."
                rows="8"
                maxlength="5000"
                @input="handleFieldChange('prompt')"
              ></textarea>
              <div class="form-field__footer">
                <span
                  v-if="getError('prompt')"
                  class="form-field__error"
                >
                  {{ getError('prompt') }}
                </span>
                <span class="form-field__counter">{{ store.draft.prompt.length }}/5000</span>
              </div>
            </div>

            <!-- AI Refinement -->
            <div class="prompt-refinement">
              <button
                type="button"
                class="prompt-refinement__btn"
                :disabled="!store.draft.prompt.trim() || store.isRefiningPrompt"
                @click="handleRefinePrompt"
              >
                <Icon
                  v-if="store.isRefiningPrompt"
                  name="heroicons:arrow-path"
                  class="prompt-refinement__btn-icon prompt-refinement__btn-icon--spinning"
                />
                <Icon
                  v-else
                  name="heroicons:sparkles"
                  class="prompt-refinement__btn-icon"
                />
                {{ store.isRefiningPrompt ? 'Refining...' : 'Refine with AI' }}
              </button>
              <span class="prompt-refinement__hint">
                AI will suggest improvements for clarity and verifiability
              </span>
            </div>

            <!-- Prompt Suggestion -->
            <Transition name="slide">
              <div
                v-if="store.promptSuggestion"
                class="prompt-suggestion"
              >
                <div class="prompt-suggestion__header">
                  <Icon
                    name="heroicons:light-bulb"
                    class="prompt-suggestion__icon"
                  />
                  <span>AI Suggestions</span>
                  <button
                    type="button"
                    class="prompt-suggestion__dismiss"
                    @click="store.dismissPromptSuggestion()"
                  >
                    <Icon name="heroicons:x-mark" />
                  </button>
                </div>

                <div class="prompt-suggestion__score">
                  <span>SMART Score:</span>
                  <div class="prompt-suggestion__score-bar">
                    <div
                      class="prompt-suggestion__score-fill"
                      :style="{ width: `${store.promptSuggestion.smartScore.overall}%` }"
                      :class="getScoreClass(store.promptSuggestion.smartScore.overall)"
                    ></div>
                  </div>
                  <span class="prompt-suggestion__score-value">
                    {{ store.promptSuggestion.smartScore.overall }}%
                  </span>
                </div>

                <div
                  v-if="store.promptSuggestion.improvements.length"
                  class="prompt-suggestion__list"
                >
                  <h4>Improvements:</h4>
                  <ul>
                    <li
                      v-for="(improvement, idx) in store.promptSuggestion.improvements"
                      :key="idx"
                    >
                      <Icon name="heroicons:check-circle" />
                      {{ improvement }}
                    </li>
                  </ul>
                </div>

                <div
                  v-if="store.promptSuggestion.warnings.length"
                  class="prompt-suggestion__warnings"
                >
                  <h4>Warnings:</h4>
                  <ul>
                    <li
                      v-for="(warning, idx) in store.promptSuggestion.warnings"
                      :key="idx"
                    >
                      <Icon name="heroicons:exclamation-triangle" />
                      {{ warning }}
                    </li>
                  </ul>
                </div>

                <div class="prompt-suggestion__refined">
                  <h4>Suggested Prompt:</h4>
                  <pre>{{ store.promptSuggestion.refined }}</pre>
                </div>

                <div class="prompt-suggestion__actions">
                  <button
                    type="button"
                    class="btn btn--secondary"
                    @click="store.dismissPromptSuggestion()"
                  >
                    Keep Original
                  </button>
                  <button
                    type="button"
                    class="btn btn--primary"
                    @click="store.applyPromptSuggestion()"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Prompt Hash Preview -->
            <div
              v-if="store.draft.prompt.trim()"
              class="prompt-hash"
            >
              <div class="prompt-hash__header">
                <Icon name="heroicons:finger-print" />
                <span>Prompt Hash (keccak256)</span>
              </div>
              <code class="prompt-hash__value">{{ store.computedPromptHash }}</code>
              <span class="prompt-hash__note">
                This hash will be stored on-chain for immutability
              </span>
            </div>

            <!-- Example Prompt -->
            <div class="prompt-example">
              <div class="prompt-example__header">
                <Icon name="heroicons:academic-cap" />
                <span>Example Verification Prompt</span>
              </div>
              <pre class="prompt-example__code">
Compare the baseline weight of the campaign creator (from Fitbit API on campaign start date) to their current weight on the end date.

Data Sources:
- Fitbit Weight API: https://api.fitbit.com/1/user/-/body/log/weight/date/{date}.json
- Baseline Date: {{ store.draft.startDate || '[start date]' }}
- Verification Date: {{ store.draft.endDate || '[end date]' }}

Success Criteria:
Return TRUE if: current_weight ≤ baseline_weight - 50 lbs
Return FALSE if: current_weight > baseline_weight - 50 lbs

Include reasoning and cite the exact data values used.</pre
              >
            </div>
          </div>
        </div>

        <!-- Step 4: Preview & Submit -->
        <div
          v-else-if="store.draft.currentStep === 4"
          key="step-4"
          class="campaign-form__step"
        >
          <div class="campaign-form__step-header">
            <Icon
              name="heroicons:paper-airplane"
              class="campaign-form__step-icon"
            />
            <div>
              <h2 class="campaign-form__step-title">Preview & Submit</h2>
              <p class="campaign-form__step-description">
                Review your campaign and submit with your creator bond
              </p>
            </div>
          </div>

          <div class="campaign-form__fields">
            <!-- Campaign Preview -->
            <div class="preview-card">
              <div class="preview-card__header">
                <h3>{{ store.draft.name || 'Untitled Campaign' }}</h3>
                <span class="preview-card__status">Draft</span>
              </div>

              <div class="preview-card__section">
                <h4>Purpose</h4>
                <p>{{ store.draft.purpose || 'No purpose defined' }}</p>
              </div>

              <div class="preview-card__grid">
                <div class="preview-card__item">
                  <span class="preview-card__label">Goal</span>
                  <span class="preview-card__value"
                    >${{ formatAmount(store.draft.fundraisingGoal) }}</span
                  >
                </div>
                <div class="preview-card__item">
                  <span class="preview-card__label">Bond</span>
                  <span class="preview-card__value"
                    >${{ formatAmount(store.draft.creatorBond) }}</span
                  >
                </div>
                <div class="preview-card__item">
                  <span class="preview-card__label">End Date</span>
                  <span class="preview-card__value">{{ formatDate(store.draft.endDate) }}</span>
                </div>
                <div class="preview-card__item">
                  <span class="preview-card__label">Privacy</span>
                  <span class="preview-card__value">
                    {{ store.draft.privacyMode ? 'ZKP Enabled' : 'Public' }}
                  </span>
                </div>
              </div>

              <div class="preview-card__section">
                <h4>Rules & Resolution</h4>
                <p>{{ store.draft.rulesAndResolution || 'No rules defined' }}</p>
              </div>

              <div
                v-if="store.draft.sources.length > 0"
                class="preview-card__section"
              >
                <h4>Data Sources ({{ store.draft.sources.length }})</h4>
                <ul class="preview-card__sources">
                  <li
                    v-for="source in store.draft.sources"
                    :key="source.id"
                  >
                    <Icon :name="getSourceTypeIcon(source.type)" />
                    <span>{{ source.label || getSourceTypeLabel(source.type) }}</span>
                    <span
                      v-if="source.isPrivate"
                      class="preview-card__badge"
                    >
                      ZKP
                    </span>
                  </li>
                </ul>
              </div>

              <div class="preview-card__section preview-card__section--prompt">
                <h4>Verification Prompt</h4>
                <pre>{{ store.draft.prompt || 'No prompt defined' }}</pre>
                <div
                  v-if="store.computedPromptHash"
                  class="preview-card__hash"
                >
                  <span>Hash:</span>
                  <code
                    >{{ store.computedPromptHash.slice(0, 20) }}...{{
                      store.computedPromptHash.slice(-8)
                    }}</code
                  >
                </div>
              </div>
            </div>

            <!-- Submission Checklist -->
            <div class="submission-checklist">
              <h4>Submission Checklist</h4>
              <ul>
                <li :class="{ 'submission-checklist__item--complete': store.isBasicInfoComplete }">
                  <Icon
                    :name="
                      store.isBasicInfoComplete ? 'heroicons:check-circle' : 'heroicons:x-circle'
                    "
                  />
                  Basic information complete
                </li>
                <li
                  :class="{ 'submission-checklist__item--complete': store.isVerificationComplete }"
                >
                  <Icon
                    :name="
                      store.isVerificationComplete ? 'heroicons:check-circle' : 'heroicons:x-circle'
                    "
                  />
                  Verification rules defined
                </li>
                <li :class="{ 'submission-checklist__item--complete': store.isPromptComplete }">
                  <Icon
                    :name="store.isPromptComplete ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                  />
                  AI prompt configured
                </li>
                <li :class="{ 'submission-checklist__item--complete': isWalletConnected }">
                  <Icon
                    :name="isWalletConnected ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                  />
                  Wallet connected
                </li>
              </ul>
            </div>

            <!-- Bond Transaction Info -->
            <div class="bond-info">
              <div class="bond-info__header">
                <Icon name="heroicons:banknotes" />
                <span>Creator Bond Transaction</span>
              </div>
              <div class="bond-info__content">
                <p>
                  Submitting this campaign requires posting a bond of
                  <strong>${{ formatAmount(store.draft.creatorBond) }} USDC</strong>.
                </p>
                <p class="bond-info__note">
                  <Icon name="heroicons:information-circle" />
                  Your bond is returned if the campaign succeeds. It's forfeited if you fail to meet
                  your goal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Form Navigation -->
      <div class="campaign-form__nav">
        <button
          v-if="store.draft.currentStep > 1"
          type="button"
          class="btn btn--secondary"
          @click="handlePrevStep"
        >
          <Icon name="heroicons:arrow-left" />
          Previous
        </button>
        <div class="campaign-form__nav-spacer"></div>

        <button
          type="button"
          class="btn btn--ghost"
          @click="handleSaveDraft"
        >
          <Icon name="heroicons:bookmark" />
          Save Draft
        </button>

        <button
          v-if="store.draft.currentStep < 4"
          type="button"
          class="btn btn--primary"
          :disabled="!canProceedToNextStep"
          @click="handleNextStep"
        >
          Next
          <Icon name="heroicons:arrow-right" />
        </button>

        <button
          v-else
          type="submit"
          class="btn btn--primary btn--lg"
          :disabled="!store.canSubmit || !isWalletConnected || isSubmitting"
        >
          <Icon
            v-if="isSubmitting"
            name="heroicons:arrow-path"
            class="btn__icon--spinning"
          />
          <Icon
            v-else
            name="heroicons:paper-airplane"
          />
          {{ isSubmitting ? 'Submitting...' : 'Submit Campaign' }}
        </button>
      </div>
    </form>

    <!-- Education Tooltip Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="activeTooltip && activeEducationContent"
          class="tooltip-overlay"
          @click="hideTooltip"
        >
          <div
            class="tooltip-modal"
            @click.stop
          >
            <div class="tooltip-modal__header">
              <h3>{{ activeEducationContent.title }}</h3>
              <button
                type="button"
                @click="hideTooltip"
              >
                <Icon name="heroicons:x-mark" />
              </button>
            </div>
            <div class="tooltip-modal__body">
              <p>{{ activeEducationContent.description }}</p>
              <div class="tooltip-modal__why">
                <Icon name="heroicons:light-bulb" />
                <span>{{ activeEducationContent.why }}</span>
              </div>
              <template
                v-if="'examples' in activeEducationContent && activeEducationContent.examples"
              >
                <div class="tooltip-modal__examples">
                  <div class="tooltip-modal__example tooltip-modal__example--good">
                    <span class="tooltip-modal__example-label">
                      <Icon name="heroicons:check-circle" />
                      Good
                    </span>
                    <code>{{ activeEducationContent.examples.good }}</code>
                  </div>
                  <div class="tooltip-modal__example tooltip-modal__example--bad">
                    <span class="tooltip-modal__example-label">
                      <Icon name="heroicons:x-circle" />
                      Avoid
                    </span>
                    <code>{{ activeEducationContent.examples.bad }}</code>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Image Upload Modal -->
    <ImageUploadModal
      :is-open="showImageUploadModal"
      @close="closeImageUploadModal"
      @upload="handleImageUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCampaignCreation } from '../../composables/useCampaignCreation'
import ImageUploadModal from './ImageUploadModal.vue'
import type { DataSourceType } from '../../stores/campaign'

// =============================================================================
// PROPS & EMITS
// =============================================================================

const emit = defineEmits<{
  submit: [data: ReturnType<typeof store.getSubmissionData>]
  saveDraft: []
}>()

// =============================================================================
// COMPOSABLES
// =============================================================================

const {
  store,
  steps,
  validateStep,
  getFieldError,
  clearErrors,
  getSourceTypeLabel,
  getSourceTypeIcon,
  createEmptySource,
  getEducationContent,
} = useCampaignCreation()

const { isConnected: isWalletConnected } = useWallet()
const toast = useToast()

// =============================================================================
// LOCAL STATE
// =============================================================================

const isSubmitting = ref(false)
const activeTooltip = ref<string | null>(null)
const fundraisingGoalDisplay = ref('')
const creatorBondDisplay = ref('')

// Client-side hydration flag to prevent SSR/client validation mismatch
const isHydrated = ref(false)

// Image upload modal state
const showImageUploadModal = ref(false)
const activeUploadSourceId = ref<string | null>(null)

// Source type options
const sourceTypes = [
  {
    type: 'public-api' as DataSourceType,
    hint: 'Public endpoint (no auth)',
  },
  {
    type: 'private-api' as DataSourceType,
    hint: 'Private API with DECO/ZKP',
  },
  {
    type: 'image-ocr' as DataSourceType,
    hint: 'Image for AI extraction',
  },
]

// =============================================================================
// COMPUTED
// =============================================================================

const activeEducationContent = computed(() => getEducationContent(activeTooltip.value))

const minStartDate = computed(() => {
  const now = new Date()
  return now.toISOString().slice(0, 16)
})

const minEndDate = computed(() => {
  if (store.draft.startDate) {
    const start = new Date(store.draft.startDate)
    start.setDate(start.getDate() + 1)
    return start.toISOString().slice(0, 16)
  }
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().slice(0, 16)
})

const canProceedToNextStep = computed(() => {
  // Only validate on client-side after hydration
  if (!isHydrated.value) return false
  return validateStep(store.draft.currentStep)
})

// =============================================================================
// METHODS
// =============================================================================

/**
 * Wrapper for getFieldError that only returns errors after hydration
 * This prevents SSR/client hydration mismatch for validation states
 */
function getError(field: string): string {
  if (!isHydrated.value) return ''
  return getFieldError(field)
}

function goToStep(stepId: number): void {
  if (stepId <= store.draft.currentStep + 1) {
    store.setStep(stepId)
    clearErrors()
  }
}

function handleNextStep(): void {
  if (validateStep(store.draft.currentStep)) {
    store.nextStep()
    clearErrors()
  }
}

function handlePrevStep(): void {
  store.prevStep()
  clearErrors()
}

function handleFieldChange(_field: string): void {
  store.draft.isDirty = true
  // Re-validate on change
  validateStep(store.draft.currentStep)
}

function handleSaveDraft(): void {
  store.saveDraft()
  toast.add({
    title: 'Draft Saved',
    description: 'Your campaign draft has been saved locally.',
    icon: 'i-heroicons-bookmark',
    color: 'success',
  })
  emit('saveDraft')
}

async function handleSubmit(): Promise<void> {
  if (!store.canSubmit || !isWalletConnected.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const data = store.getSubmissionData()
    emit('submit', data)
  } finally {
    isSubmitting.value = false
  }
}

async function handleRefinePrompt(): Promise<void> {
  const result = await store.refinePrompt()
  if (result) {
    toast.add({
      title: 'Prompt Analyzed',
      description: `SMART Score: ${result.smartScore.overall}%`,
      icon: 'i-heroicons-sparkles',
      color: result.smartScore.overall >= 60 ? 'success' : 'warning',
    })
  }
}

// Currency input handlers
function handleFundraisingGoalInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^0-9.]/g, '')
  fundraisingGoalDisplay.value = formatInputAmount(value)
  // Convert to wei (USDC has 6 decimals)
  const numValue = Number.parseFloat(value) || 0
  store.draft.fundraisingGoal = Math.floor(numValue * 1e6).toString()
  store.draft.isDirty = true
}

function handleCreatorBondInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^0-9.]/g, '')
  creatorBondDisplay.value = formatInputAmount(value)
  const numValue = Number.parseFloat(value) || 0
  store.draft.creatorBond = Math.floor(numValue * 1e6).toString()
  store.draft.isDirty = true
}

function formatInputAmount(value: string): string {
  const num = Number.parseFloat(value)
  if (Number.isNaN(num)) return ''
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatAmount(weiValue: string): string {
  if (!weiValue) return '0.00'
  const num = Number.parseInt(weiValue) / 1e6
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Data source handlers
function addNewSource(type: DataSourceType): void {
  const source = createEmptySource(type)
  store.addSource(source)
}

function updateSourceField(id: string, field: string, value: unknown): void {
  store.updateSource(id, { [field]: value })
}

// Image upload modal handlers
function openImageUploadModal(sourceId: string): void {
  activeUploadSourceId.value = sourceId
  showImageUploadModal.value = true
}

function closeImageUploadModal(): void {
  showImageUploadModal.value = false
  activeUploadSourceId.value = null
}

function handleImageUpload(data: { ipfsUrl: string; cid: string; gatewayUrl?: string }): void {
  if (activeUploadSourceId.value) {
    updateSourceField(activeUploadSourceId.value, 'fileUrl', data.gatewayUrl || data.ipfsUrl)
    updateSourceField(activeUploadSourceId.value, 'ipfsHash', data.cid)
    toast.add({
      title: 'Image Added',
      description: 'IPFS URL has been added to your data source.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })
  }
  closeImageUploadModal()
}

// Tooltip handlers
function showTooltip(field: string): void {
  activeTooltip.value = field
}

function hideTooltip(): void {
  activeTooltip.value = null
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'prompt-suggestion__score-fill--excellent'
  if (score >= 60) return 'prompt-suggestion__score-fill--good'
  if (score >= 40) return 'prompt-suggestion__score-fill--fair'
  return 'prompt-suggestion__score-fill--poor'
}

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => {
  // Mark as hydrated to enable client-side validation
  isHydrated.value = true

  // Load any existing draft
  store.loadDraft()

  // Initialize display values from store
  if (store.draft.fundraisingGoal) {
    const num = Number.parseInt(store.draft.fundraisingGoal) / 1e6
    fundraisingGoalDisplay.value = num > 0 ? formatInputAmount(num.toString()) : ''
  }
  if (store.draft.creatorBond) {
    const num = Number.parseInt(store.draft.creatorBond) / 1e6
    creatorBondDisplay.value = num > 0 ? formatInputAmount(num.toString()) : ''
  }
})
</script>
