// =============================================================================
// DISPUTER DOMAIN - BARREL EXPORT
// =============================================================================

// Schemas & Types
export {
  disputerSchema,
  disputerResponseSchema,
  disputerSummarySchema,
  createDisputerSchema,
  updateDisputerSchema,
  resolveDisputerSchema,
  listDisputersQuerySchema,
  disputerIdSchema,
  disputerStatusSchema,
  disputeTypeSchema,
  resolutionOutcomeSchema,
  evidenceItemSchema,
  type Disputer,
  type DisputerResponse,
  type DisputerSummary,
  type EvidenceItem,
  type CreateDisputerInput,
  type UpdateDisputerInput,
  type ResolveDisputerInput,
  type ListDisputersQuery,
  type DisputerStatus,
  type DisputeType,
  type ResolutionOutcome,
} from './disputer.schema'

// Mapper
export {
  toDisputerResponse,
  toDisputerResponseList,
  toDisputerSummary,
  toDisputerSummaryList,
  formatDisputerAmount,
  getDisputeTypeDisplayName,
} from './disputer.mapper'

// Repository
export { type DisputerRepository, createDisputerRepository } from './disputer.repository'

// Service
export { type DisputerService, createDisputerService } from './disputer.service'
