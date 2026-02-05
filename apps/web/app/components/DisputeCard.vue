<template>
  <NuxtLink
    :to="`/disputes/${dispute.id}`"
    class="dispute-card"
    :class="{ 'dispute-card--compact': compact }"
  >
    <div class="dispute-card__header">
      <div
        class="dispute-card__icon"
        :class="`dispute-card__icon--${typeConfig.color}`"
      >
        <Icon :name="typeConfig.icon" />
      </div>
      <div class="dispute-card__meta">
        <span class="dispute-card__type">
          {{ typeConfig.label }}
        </span>
        <span class="dispute-card__date">
          {{ formatDate(dispute.disputedAt) }}
        </span>
      </div>
      <span
        class="dispute-card__status"
        :class="`dispute-card__status--${statusConfig.color}`"
      >
        <Icon :name="statusConfig.icon" />
        {{ statusConfig.label }}
      </span>
    </div>

    <div
      v-if="!compact"
      class="dispute-card__body"
    >
      <div class="dispute-card__amount">
        <span class="dispute-card__amount-label">Staked</span>
        <span class="dispute-card__amount-value">{{ formattedAmount }}</span>
      </div>

      <p class="dispute-card__reason">
        {{ truncatedReason }}
      </p>

      <div
        v-if="dispute.evidence && dispute.evidence.length > 0"
        class="dispute-card__evidence"
      >
        <Icon name="heroicons:paper-clip" />
        <span
          >{{ dispute.evidence.length }} evidence item{{
            dispute.evidence.length !== 1 ? 's' : ''
          }}</span
        >
      </div>

      <div
        v-if="showCampaign && hasCampaignTitle(dispute)"
        class="dispute-card__campaign"
      >
        <Icon name="heroicons:flag" />
        <span>{{ dispute.campaignTitle }}</span>
      </div>
    </div>

    <div
      v-if="compact"
      class="dispute-card__compact-info"
    >
      <span class="dispute-card__amount-value">{{ formattedAmount }}</span>
      <span class="dispute-card__reason-preview">
        {{ dispute.reason.substring(0, 50) }}{{ dispute.reason.length > 50 ? '...' : '' }}
      </span>
    </div>

    <div
      v-if="!compact && showActions && hasActions"
      class="dispute-card__actions"
    >
      <button
        v-if="actions.canWithdraw"
        type="button"
        class="dispute-card__action dispute-card__action--secondary"
        @click.prevent="$emit('withdraw', dispute)"
      >
        Withdraw
      </button>
      <button
        v-if="actions.canAddEvidence"
        type="button"
        class="dispute-card__action dispute-card__action--primary"
        @click.prevent="$emit('addEvidence', dispute)"
      >
        Add Evidence
      </button>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DisputerSummary, DisputerResponse, EvidenceItem } from '../types/disputer'
import {
  getDisputerStatusConfig,
  getDisputeTypeConfig,
  formatDisputerAmount,
  getDisputerActions,
} from '../types/disputer'

interface DisputerWithEvidence extends DisputerSummary {
  evidence?: EvidenceItem[]
}

type DisputeData = DisputerWithEvidence | DisputerResponse

// Helper to check if dispute has campaign title
function hasCampaignTitle(d: DisputeData): d is DisputerSummary & { campaignTitle: string } {
  return 'campaignTitle' in d && typeof d.campaignTitle === 'string'
}

interface Props {
  dispute: DisputeData
  compact?: boolean
  showCampaign?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showCampaign: false,
  showActions: false,
})

defineEmits<{
  withdraw: [dispute: DisputeData]
  addEvidence: [dispute: DisputeData]
}>()

const statusConfig = computed(() => getDisputerStatusConfig(props.dispute.status))

const typeConfig = computed(() => getDisputeTypeConfig(props.dispute.disputeType))

const formattedAmount = computed(() => formatDisputerAmount(props.dispute.amount))

const actions = computed(() => getDisputerActions(props.dispute.status))

const hasActions = computed(() => actions.value.canWithdraw || actions.value.canAddEvidence)

const truncatedReason = computed(() => {
  const maxLength = 150
  if (props.dispute.reason.length <= maxLength) {
    return props.dispute.reason
  }
  return props.dispute.reason.substring(0, maxLength) + '...'
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.dispute-card {
  display: block;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.dispute-card:hover {
  border-color: var(--color-error-500);
  box-shadow: 0 0 0 1px var(--color-error-500);
}

.dispute-card--compact {
  padding: 0.75rem;
}

/* Header */
.dispute-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dispute-card__icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.dispute-card--compact .dispute-card__icon {
  width: 1.75rem;
  height: 1.75rem;
}

.dispute-card__icon .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.dispute-card--compact .dispute-card__icon .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.dispute-card__icon--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-500);
}

.dispute-card__icon--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  color: var(--color-warning-500);
}

.dispute-card__icon--info {
  background-color: color-mix(in oklch, var(--color-info-500) 12%, transparent);
  color: var(--color-info-500);
}

.dispute-card__meta {
  flex: 1;
  min-width: 0;
}

.dispute-card__type {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.dispute-card__date {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Status Badge */
.dispute-card__status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.dispute-card__status .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.dispute-card__status--success {
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-600);
}

.dispute-card__status--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  color: var(--color-warning-600);
}

.dispute-card__status--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-600);
}

.dispute-card__status--info {
  background-color: color-mix(in oklch, var(--color-info-500) 12%, transparent);
  color: var(--color-info-600);
}

.dispute-card__status--neutral {
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

/* Body */
.dispute-card__body {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
}

.dispute-card__amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.dispute-card__amount-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.dispute-card__amount-value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dispute-card__reason {
  margin: 0.5rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.dispute-card__evidence {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.dispute-card__evidence .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.dispute-card__campaign {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dispute-card__campaign .icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-tertiary);
}

/* Compact Info */
.dispute-card__compact-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.dispute-card__compact-info .dispute-card__amount-value {
  font-size: var(--text-base);
}

.dispute-card__reason-preview {
  flex: 1;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Actions */
.dispute-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
}

.dispute-card__action {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dispute-card__action--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
}

.dispute-card__action--primary:hover {
  background-color: var(--interactive-primary-hover);
}

.dispute-card__action--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.dispute-card__action--secondary:hover {
  background-color: var(--surface-hover);
}
</style>
