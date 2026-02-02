<template>
  <div class="evidence-page">
    <header class="page-header">
      <div class="container-app">
        <div class="page-header__content">
          <div class="page-header__breadcrumb">
            <NuxtLink
              :to="`/campaigns/${campaignId}`"
              class="page-header__breadcrumb-link"
            >
              <Icon
                name="heroicons:arrow-left"
                class="page-header__breadcrumb-icon"
              />
              Back to Campaign
            </NuxtLink>
          </div>
          <div class="page-header__title-row">
            <div>
              <h1 class="page-header__title">Upload Evidence</h1>
              <p class="page-header__description">
                Submit proof for your campaign progress. Evidence is stored on IPFS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="container-app evidence-page__layout">
        <section class="detail-card">
          <h2>Security Check</h2>
          <p class="detail-card__muted">Complete the Turnstile check before uploading evidence.</p>
          <TurnstileWidget
            ref="turnstileRef"
            action="evidence_upload"
            @verified="handleTurnstileVerified"
            @expired="handleTurnstileExpired"
            @error="handleTurnstileError"
          />
        </section>

        <EvidenceUploadCard :campaign-id="campaignId" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TurnstileWidget from '../../../components/common/TurnstileWidget.vue'
import EvidenceUploadCard from '../../../components/evidence/EvidenceUploadCard.vue'

const route = useRoute()
const toast = useToast()
const { setToken, clearToken } = useTurnstileToken()

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const campaignId = computed(() => String(route.params.id || ''))

function handleTurnstileVerified(token: string): void {
  setToken(token)
}

function handleTurnstileExpired(): void {
  clearToken()
  toast.add({
    title: 'Verification Expired',
    description: 'Please complete the Turnstile check again.',
    icon: 'i-heroicons-exclamation-triangle',
    color: 'warning',
  })
}

function handleTurnstileError(message: string): void {
  toast.add({
    title: 'Verification Error',
    description: message,
    icon: 'i-heroicons-exclamation-circle',
    color: 'error',
  })
}
</script>

<style scoped>
.evidence-page__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

.detail-card {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card__muted {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}
</style>
