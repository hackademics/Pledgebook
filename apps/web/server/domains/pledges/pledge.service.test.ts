import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPledgeService } from './pledge.service'
import type { PledgeRepository } from './pledge.repository'
import type { CampaignRepository } from '../campaigns/campaign.repository'

function createMockPledgeRepo(overrides?: Partial<PledgeRepository>): PledgeRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByTxHash: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByCampaign: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByPledger: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    create: vi.fn().mockResolvedValue({ pledge_id: 'p-1', status: 'pending' }),
    update: vi.fn().mockResolvedValue(true),
    updateStatus: vi.fn().mockResolvedValue(true),
    exists: vi.fn().mockResolvedValue(true),
    txHashExists: vi.fn().mockResolvedValue(false),
    hasPledgedToCampaign: vi.fn().mockResolvedValue(false),
    count: vi.fn().mockResolvedValue(0),
    sumByCampaign: vi.fn().mockResolvedValue('0'),
    ...overrides,
  } as unknown as PledgeRepository
}

function createMockCampaignRepo(overrides?: Partial<CampaignRepository>): CampaignRepository {
  return {
    findById: vi.fn().mockResolvedValue({
      campaign_id: 'c-1',
      status: 'active',
      end_date: new Date(Date.now() + 86400000).toISOString(),
    }),
    incrementPledgeStats: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as CampaignRepository
}

const validInput = {
  campaignId: 'c-1',
  amount: '100',
  txHash: '0x' + 'a'.repeat(64),
  isAnonymous: false,
}

describe('PledgeService', () => {
  let pledgeRepo: PledgeRepository
  let campaignRepo: CampaignRepository

  beforeEach(() => {
    vi.clearAllMocks()
    pledgeRepo = createMockPledgeRepo()
    campaignRepo = createMockCampaignRepo()
  })

  describe('create', () => {
    it('creates a pledge with valid input', async () => {
      const service = createPledgeService({
        pledgeRepository: pledgeRepo,
        campaignRepository: campaignRepo,
      })
      await service.create('0xpledger', validInput)

      expect(pledgeRepo.create).toHaveBeenCalled()
    })

    it('throws CONFLICT on duplicate txHash', async () => {
      pledgeRepo = createMockPledgeRepo({ txHashExists: vi.fn().mockResolvedValue(true) })
      const service = createPledgeService({
        pledgeRepository: pledgeRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xpledger', validInput)).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for non-active campaign', async () => {
      campaignRepo = createMockCampaignRepo({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'c-1',
          status: 'draft',
          end_date: new Date(Date.now() + 86400000).toISOString(),
        }),
      })
      const service = createPledgeService({
        pledgeRepository: pledgeRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xpledger', validInput)).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for ended campaign', async () => {
      campaignRepo = createMockCampaignRepo({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'c-1',
          status: 'active',
          end_date: new Date(Date.now() - 86400000).toISOString(),
        }),
      })
      const service = createPledgeService({
        pledgeRepository: pledgeRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xpledger', validInput)).rejects.toThrow()
    })

    it('increments pledge stats on campaign repository', async () => {
      const service = createPledgeService({
        pledgeRepository: pledgeRepo,
        campaignRepository: campaignRepo,
      })
      await service.create('0xpledger', validInput)

      expect(campaignRepo.incrementPledgeStats).toHaveBeenCalled()
    })

    it('works without campaignRepository (no validation)', async () => {
      const service = createPledgeService({ pledgeRepository: pledgeRepo })
      await service.create('0xpledger', validInput)

      expect(pledgeRepo.create).toHaveBeenCalled()
    })
  })

  describe('confirmPledge', () => {
    it('confirms a pending pledge with sufficient confirmations', async () => {
      pledgeRepo = createMockPledgeRepo({
        findById: vi.fn().mockResolvedValue({ pledge_id: 'p-1', status: 'pending' }),
      })
      const service = createPledgeService({ pledgeRepository: pledgeRepo })

      await service.confirmPledge('p-1', 3)
      expect(pledgeRepo.update).toHaveBeenCalledWith(
        'p-1',
        expect.objectContaining({ status: 'confirmed', confirmations: 3 }),
      )
    })

    it('only updates confirmations if already confirmed', async () => {
      pledgeRepo = createMockPledgeRepo({
        findById: vi.fn().mockResolvedValue({ pledge_id: 'p-1', status: 'confirmed' }),
      })
      const service = createPledgeService({ pledgeRepository: pledgeRepo })

      await service.confirmPledge('p-1', 10)
      expect(pledgeRepo.update).toHaveBeenCalledWith(
        'p-1',
        expect.objectContaining({ confirmations: 10 }),
      )
    })

    it('throws NOT_FOUND for missing pledge', async () => {
      const service = createPledgeService({ pledgeRepository: pledgeRepo })

      await expect(service.confirmPledge('missing', 1)).rejects.toThrow()
    })
  })
})
