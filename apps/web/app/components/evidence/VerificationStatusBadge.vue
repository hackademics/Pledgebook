<template>
  <span
    class="status-badge"
    :class="`status-badge--${status}`"
  >
    <Icon :name="icon" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type VerificationStatus = 'pending' | 'baseline' | 'ready' | 'processing' | 'verified' | 'rejected'

const props = defineProps<{
  status: VerificationStatus
}>()

const statusConfig: Record<VerificationStatus, { label: string; icon: string }> = {
  pending: { label: 'Pending', icon: 'heroicons:clock' },
  baseline: { label: 'Baseline Set', icon: 'heroicons:camera' },
  ready: { label: 'Ready to Verify', icon: 'heroicons:play' },
  processing: { label: 'Verifying...', icon: 'heroicons:arrow-path' },
  verified: { label: 'Verified', icon: 'heroicons:check-circle-solid' },
  rejected: { label: 'Rejected', icon: 'heroicons:x-circle-solid' },
}

const label = computed(() => statusConfig[props.status]?.label || 'Unknown')
const icon = computed(() => statusConfig[props.status]?.icon || 'heroicons:question-mark-circle')
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.status-badge--pending {
  background: var(--surface-tertiary);
  color: var(--text-secondary);
}

.status-badge--baseline {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.status-badge--ready {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.status-badge--processing {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.status-badge .iconify {
  font-size: 1rem;
}

.status-badge--processing .iconify {
  animation: spin 1s linear infinite;
}

.status-badge--verified {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.status-badge--rejected {
  background: var(--color-error-100);
  color: var(--color-error-700);
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
