<template>
  <section class="evidence-card">
    <div class="evidence-card__header">
      <div>
        <h3 class="evidence-card__title">Evidence Upload</h3>
        <p class="evidence-card__subtitle">
          Upload image evidence to IPFS for immutable verification records.
        </p>
      </div>
      <button
        type="button"
        class="btn btn--primary"
        @click="openModal"
      >
        <Icon name="heroicons:cloud-arrow-up" />
        Upload Evidence
      </button>
    </div>

    <div class="evidence-card__content">
      <div
        v-if="!hasToken"
        class="evidence-card__notice"
      >
        <Icon name="heroicons:exclamation-triangle" />
        <span>Complete the security check before uploading evidence.</span>
      </div>

      <div
        v-if="lastUpload"
        class="evidence-card__result"
      >
        <div class="evidence-card__result-row">
          <span>Gateway URL</span>
          <a
            :href="lastUpload.gatewayUrl"
            target="_blank"
            rel="noreferrer"
          >
            {{ lastUpload.gatewayUrl }}
          </a>
        </div>
        <div class="evidence-card__result-row">
          <span>IPFS URL</span>
          <code>{{ lastUpload.ipfsUrl }}</code>
        </div>
        <div class="evidence-card__result-row">
          <span>CID</span>
          <code>{{ lastUpload.cid }}</code>
        </div>
      </div>

      <div class="evidence-card__help">
        <Icon name="heroicons:information-circle" />
        <span>
          Evidence uploads are encrypted at rest and stored on IPFS with a D1 metadata record.
        </span>
      </div>
    </div>

    <ImageUploadModal
      :is-open="isModalOpen"
      :campaign-id="campaignId"
      @close="closeModal"
      @upload="handleUpload"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageUploadModal from '../forms/ImageUploadModal.vue'

const { campaignId } = defineProps<{
  campaignId: string
}>()

const { hasToken } = useTurnstileToken()
const toast = useToast()

const isModalOpen = ref(false)
const lastUpload = ref<{
  ipfsUrl: string
  cid: string
  gatewayUrl?: string
} | null>(null)

function openModal(): void {
  isModalOpen.value = true
}

function closeModal(): void {
  isModalOpen.value = false
}

function handleUpload(data: { ipfsUrl: string; cid: string; gatewayUrl?: string }): void {
  lastUpload.value = data
  toast.add({
    title: 'Evidence Uploaded',
    description: 'Your evidence is now stored on IPFS.',
    icon: 'i-heroicons-check-circle',
    color: 'success',
  })
}
</script>

<style scoped>
.evidence-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-secondary);
  background-color: var(--surface-primary);
}

.evidence-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.evidence-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.evidence-card__subtitle {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-top: 0.25rem;
}

.evidence-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.evidence-card__notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: color-mix(in oklch, var(--color-warning-500) 10%, transparent);
  color: var(--color-warning-700);
  font-size: var(--text-sm);
}

.evidence-card__result {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background-color: var(--surface-secondary);
  font-size: var(--text-xs);
}

.evidence-card__result-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.evidence-card__result-row a,
.evidence-card__result-row code {
  color: var(--text-secondary);
  word-break: break-all;
}

.evidence-card__help {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}
</style>
