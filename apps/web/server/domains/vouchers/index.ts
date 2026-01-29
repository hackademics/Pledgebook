// =============================================================================
// VOUCHER DOMAIN - BARREL EXPORT
// =============================================================================

// Schemas & Types
export {
  voucherSchema,
  voucherResponseSchema,
  voucherSummarySchema,
  createVoucherSchema,
  updateVoucherSchema,
  listVouchersQuerySchema,
  voucherIdSchema,
  voucherStatusSchema,
  type Voucher,
  type VoucherResponse,
  type VoucherSummary,
  type CreateVoucherInput,
  type UpdateVoucherInput,
  type ListVouchersQuery,
  type VoucherStatus,
} from './voucher.schema'

// Mapper
export {
  toVoucherResponse,
  toVoucherResponseList,
  toVoucherSummary,
  toVoucherSummaryList,
  formatVoucherAmount,
} from './voucher.mapper'

// Repository
export { type VoucherRepository, createVoucherRepository } from './voucher.repository'

// Service
export { type VoucherService, createVoucherService } from './voucher.service'
