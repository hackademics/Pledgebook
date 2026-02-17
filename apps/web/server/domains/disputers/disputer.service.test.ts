import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDisputerService } from './disputer.service'
import type { DisputerRepository } from './disputer.repository'
import type { CampaignRepository } from '../campaigns/campaign.repository'

function createMockDisputerRepo(overrides?: Partial<DisputerRepository>): DisputerRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByTxHash: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByCampaign: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByDisputer: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findActiveByCampaign: vi.fn().mockResolvedValue([]),
    findPending: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'pending' }),
    update: vi.fn().mockResolvedValue(true),
    resolve: vi.fn().mockResolvedValue(true),
    updateStatus: vi.fn().mockResolvedValue(true),
    exists: vi.fn().mockResolvedValue(true),
    txHashExists: vi.fn().mockResolvedValue(false),
    hasDisputedCampaign: vi.fn().mockResolvedValue(false),
    count: vi.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as DisputerRepository
}

function createMockCampaignRepo(overrides?: Partial<CampaignRepository>): CampaignRepository {
  return {
    findById: vi.fn().mockResolvedValue({ campaign_id: 'c-1', status: 'active' }),
    incrementDisputerCount: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as CampaignRepository
}

const validInput = {
  campaignId: 'c-1',
  amount: '100',
  stakeTxHash: '0x' + 'e'.repeat(64),
  reason: 'Campaign is fraudulent',
  disputeType: 'fraud' as const,
  evidence: [] as {
    type: 'url' | 'text' | 'image' | 'document'
    content: string
    description?: string
    submittedAt?: string
  }[],
}

describe('DisputerService', () => {
  let disputerRepo: DisputerRepository
  let campaignRepo: CampaignRepository

  beforeEach(() => {
    vi.clearAllMocks()
    disputerRepo = createMockDisputerRepo()
    campaignRepo = createMockCampaignRepo()
  })

  describe('create', () => {
    it('creates a dispute with valid input', async () => {
      const service = createDisputerService({
        disputerRepository: disputerRepo,
        campaignRepository: campaignRepo,
      })
      await service.create('0xdisputer', validInput)

      expect(disputerRepo.create).toHaveBeenCalled()
    })

    it('throws CONFLICT on duplicate txHash', async () => {
      disputerRepo = createMockDisputerRepo({ txHashExists: vi.fn().mockResolvedValue(true) })
      const service = createDisputerService({
        disputerRepository: disputerRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xdisputer', validInput)).rejects.toThrow()
    })

    it('throws CONFLICT when user already disputed campaign', async () => {
      disputerRepo = createMockDisputerRepo({
        hasDisputedCampaign: vi.fn().mockResolvedValue(true),
      })
      const service = createDisputerService({
        disputerRepository: disputerRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xdisputer', validInput)).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for non-active campaign', async () => {
      campaignRepo = createMockCampaignRepo({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'c-1', status: 'draft' }),
      })
      const service = createDisputerService({
        disputerRepository: disputerRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xdisputer', validInput)).rejects.toThrow()
    })

    it('throws NOT_FOUND for missing campaign', async () => {
      campaignRepo = createMockCampaignRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      const service = createDisputerService({
        disputerRepository: disputerRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xdisputer', validInput)).rejects.toThrow()
    })

    it('increments disputer count on campaign', async () => {
      const service = createDisputerService({
        disputerRepository: disputerRepo,
        campaignRepository: campaignRepo,
      })
      await service.create('0xdisputer', validInput)

      expect(campaignRepo.incrementDisputerCount).toHaveBeenCalledWith('c-1')
    })
  })

  describe('activateDispute', () => {
    it('activates a pending dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'pending' }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await service.activateDispute('d-1')
      expect(disputerRepo.updateStatus).toHaveBeenCalledWith('d-1', 'active')
    })

    it('throws VALIDATION_ERROR for non-pending dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'active' }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await expect(service.activateDispute('d-1')).rejects.toThrow()
    })

    it('throws NOT_FOUND for missing dispute', async () => {
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await expect(service.activateDispute('missing')).rejects.toThrow()
    })
  })

  describe('withdrawDispute', () => {
    it('withdraws a pending dispute by the owner', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({
          dispute_id: 'd-1',
          disputer_address: '0xdisputer',
          status: 'pending',
        }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await service.withdrawDispute('d-1', '0xdisputer')
      expect(disputerRepo.updateStatus).toHaveBeenCalledWith('d-1', 'withdrawn')
    })

    it('throws FORBIDDEN for non-owner', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({
          dispute_id: 'd-1',
          disputer_address: '0xdisputer',
          status: 'pending',
        }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await expect(service.withdrawDispute('d-1', '0xhacker')).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for non-pending dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({
          dispute_id: 'd-1',
          disputer_address: '0xdisputer',
          status: 'active',
        }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await expect(service.withdrawDispute('d-1', '0xdisputer')).rejects.toThrow()
    })
  })

  describe('resolve', () => {
    it('resolves a pending dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'pending' }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await service.resolve('d-1', '0xresolver', { outcome: 'upheld', notes: 'Valid dispute' })
      expect(disputerRepo.resolve).toHaveBeenCalled()
    })

    it('resolves an active dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'active' }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await service.resolve('d-1', '0xresolver', { outcome: 'rejected', notes: 'No evidence' })
      expect(disputerRepo.resolve).toHaveBeenCalled()
    })

    it('throws VALIDATION_ERROR for resolved dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'resolved' }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await expect(
        service.resolve('d-1', '0xresolver', { outcome: 'upheld', notes: 'x' }),
      ).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for withdrawn dispute', async () => {
      disputerRepo = createMockDisputerRepo({
        findById: vi.fn().mockResolvedValue({ dispute_id: 'd-1', status: 'withdrawn' }),
      })
      const service = createDisputerService({ disputerRepository: disputerRepo })

      await expect(
        service.resolve('d-1', '0xresolver', { outcome: 'upheld', notes: 'x' }),
      ).rejects.toThrow()
    })
  })
})
