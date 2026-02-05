<template>
  <NuxtLink
    :to="`/vouchers/${voucher.id}`"
    class="voucher-card"
    :class="{ 'voucher-card--compact': compact }"
  >
    <div class="voucher-card__header">
      <div class="voucher-card__icon">
        <Icon name="heroicons:shield-check" />
      </div>
      <div class="voucher-card__meta">
        <span class="voucher-card__address">
          {{ formatAddress(voucher.voucherAddress) }}
        </span>
        <span class="voucher-card__date">
          {{ formatDate(voucher.vouchedAt) }}
        </span>
      </div>
      <span
        class="voucher-card__status"
        :class="`voucher-card__status--${statusConfig.color}`"
      >
        <Icon :name="statusConfig.icon" />
        {{ statusConfig.label }}
      </span>
    </div>

    <div
      v-if="!compact"
      class="voucher-card__body"
    >
      <div class="voucher-card__amount">
        <span class="voucher-card__amount-label">Staked</span>
        <span class="voucher-card__amount-value">{{ formattedAmount }}</span>
      </div>

      <p
        v-if="voucher.endorsementMessage"
        class="voucher-card__message"
      >
        "{{ voucher.endorsementMessage }}"
      </p>

      <div
        v-if="showCampaign && hasCampaignTitle(voucher)"
        class="voucher-card__campaign"
      >
        <Icon name="heroicons:flag" />
        <span>{{ voucher.campaignTitle }}</span>
      </div>
    </div>

    <div
      v-if="compact"
      class="voucher-card__compact-info"
    >
      <span class="voucher-card__amount-value">{{ formattedAmount }}</span>
      <span
        v-if="voucher.endorsementMessage"
        class="voucher-card__message-preview"
      >
        {{ voucher.endorsementMessage.substring(0, 40)
        }}{{ voucher.endorsementMessage.length > 40 ? '...' : '' }}
      </span>
    </div>

    <div
      v-if="!compact && showActions && hasActions"
      class="voucher-card__actions"
    >
      <button
        v-if="actions.canWithdraw"
        type="button"
        class="voucher-card__action voucher-card__action--secondary"
        @click.prevent="$emit('withdraw', voucher)"
      >
        Withdraw
      </button>
      <button
        v-if="actions.canRelease"
        type="button"
        class="voucher-card__action voucher-card__action--primary"
        @click.prevent="$emit('release', voucher)"
      >
        Release
      </button>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VoucherSummary, VoucherResponse } from '../types/voucher'
import { getVoucherStatusConfig, formatVoucherAmount, getVoucherActions } from '../types/voucher'

type VoucherData = VoucherSummary | VoucherResponse

// Helper to check if voucher has campaign title
function hasCampaignTitle(v: VoucherData): v is VoucherSummary & { campaignTitle: string } {
  return 'campaignTitle' in v && typeof v.campaignTitle === 'string'
}

interface Props {
  voucher: VoucherData
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
  withdraw: [voucher: VoucherData]
  release: [voucher: VoucherData]
}>()

const statusConfig = computed(() => getVoucherStatusConfig(props.voucher.status))

const formattedAmount = computed(() => formatVoucherAmount(props.voucher.amount))

const actions = computed(() => getVoucherActions(props.voucher.status))

const hasActions = computed(() => actions.value.canWithdraw || actions.value.canRelease)

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

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
.voucher-card {
  display: block;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.voucher-card:hover {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 1px var(--color-success-500);
}

.voucher-card--compact {
  padding: 0.75rem;
}

/* Header */
.voucher-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.voucher-card__icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-500);
  flex-shrink: 0;
}

.voucher-card--compact .voucher-card__icon {
  width: 1.75rem;
  height: 1.75rem;
}

.voucher-card__icon .icon {
  width: 1.125rem;
  height: 1.125rem;
}

.voucher-card--compact .voucher-card__icon .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.voucher-card__meta {
  flex: 1;
  min-width: 0;
}

.voucher-card__address {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.voucher-card__date {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Status Badge */
.voucher-card__status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.voucher-card__status .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.voucher-card__status--success {
  background-color: color-mix(in oklch, var(--color-success-500) 12%, transparent);
  color: var(--color-success-600);
}

.voucher-card__status--warning {
  background-color: color-mix(in oklch, var(--color-warning-500) 12%, transparent);
  color: var(--color-warning-600);
}

.voucher-card__status--error {
  background-color: color-mix(in oklch, var(--color-error-500) 12%, transparent);
  color: var(--color-error-600);
}

.voucher-card__status--info {
  background-color: color-mix(in oklch, var(--color-info-500) 12%, transparent);
  color: var(--color-info-600);
}

.voucher-card__status--neutral {
  background-color: var(--surface-secondary);
  color: var(--text-secondary);
}

/* Body */
.voucher-card__body {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
}

.voucher-card__amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.voucher-card__amount-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.voucher-card__amount-value {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.voucher-card__message {
  margin: 0.5rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-style: italic;
  line-height: 1.5;
}

.voucher-card__campaign {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.voucher-card__campaign .icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-tertiary);
}

/* Compact Info */
.voucher-card__compact-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.voucher-card__compact-info .voucher-card__amount-value {
  font-size: var(--text-base);
}

.voucher-card__message-preview {
  flex: 1;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Actions */
.voucher-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
}

.voucher-card__action {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.voucher-card__action--primary {
  background-color: var(--color-success-500);
  color: var(--text-inverse);
}

.voucher-card__action--primary:hover {
  background-color: var(--color-success-600);
}

.voucher-card__action--secondary {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.voucher-card__action--secondary:hover {
  background-color: var(--surface-hover);
}
</style>
