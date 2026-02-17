import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCampaignService } from './campaign.service'
import type { CampaignRepository } from './campaign.repository'

function createMockRepository(overrides?: Partial<CampaignRepository>): CampaignRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByCreator: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findFeatured: vi.fn().mockResolvedValue([]),
    findActive: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findShowcased: vi.fn().mockResolvedValue([]),
    create: vi
      .fn()
      .mockResolvedValue({ campaign_id: 'new-id', slug: 'test-slug', status: 'draft' }),
    update: vi.fn().mockResolvedValue(true),
    updateStatus: vi.fn().mockResolvedValue(true),
    softDelete: vi.fn().mockResolvedValue(true),
    exists: vi.fn().mockResolvedValue(true),
    slugExists: vi.fn().mockResolvedValue(false),
    count: vi.fn().mockResolvedValue(0),
    incrementPledgeStats: vi.fn().mockResolvedValue(undefined),
    incrementVoucherCount: vi.fn().mockResolvedValue(undefined),
    incrementDisputerCount: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as CampaignRepository
}

const validInput = {
  name: 'Test Campaign',
  purpose: 'Test purpose for the campaign',
  rulesAndResolution: 'Rules for campaign resolution',
  prompt: 'Verify that the goal is met by checking public data',
  fundraisingGoal: '1000',
  endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
  tags: [] as string[],
  categories: [] as string[],
  privacyMode: false,
  consensusThreshold: 0.66,
}

describe('CampaignService', () => {
  let repository: CampaignRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = createMockRepository()
  })

  describe('create', () => {
    it('creates a campaign with valid input', async () => {
      const service = createCampaignService(repository)
      await service.create('0x1234567890abcdef1234567890abcdef12345678', validInput)

      expect(repository.create).toHaveBeenCalledWith(
        '0x1234567890abcdef1234567890abcdef12345678',
        expect.objectContaining({ name: 'Test Campaign' }),
      )
    })

    it('throws CONFLICT on duplicate slug', async () => {
      repository = createMockRepository({ slugExists: vi.fn().mockResolvedValue(true) })
      const service = createCampaignService(repository)

      await expect(
        service.create('0x1234567890abcdef1234567890abcdef12345678', {
          ...validInput,
          slug: 'duplicate-slug',
        }),
      ).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR if endDate is in the past', async () => {
      const service = createCampaignService(repository)
      const pastDate = new Date(Date.now() - 86400000).toISOString()

      await expect(
        service.create('0x1234567890abcdef1234567890abcdef12345678', {
          ...validInput,
          endDate: pastDate,
        }),
      ).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR if startDate is after endDate', async () => {
      const service = createCampaignService(repository)
      const endDate = new Date(Date.now() + 86400000 * 10).toISOString()
      const startDate = new Date(Date.now() + 86400000 * 20).toISOString()

      await expect(
        service.create('0x1234567890abcdef1234567890abcdef12345678', {
          ...validInput,
          endDate,
          startDate,
        }),
      ).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates a draft campaign by the owner', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'id-1',
          creator_address: '0xowner',
          status: 'draft',
        }),
      })
      const service = createCampaignService(repository)

      await service.update('id-1', '0xowner', { name: 'Updated Name' })
      expect(repository.update).toHaveBeenCalledWith(
        'id-1',
        expect.objectContaining({ name: 'Updated Name' }),
      )
    })

    it('throws NOT_FOUND for non-existent campaign', async () => {
      const service = createCampaignService(repository)

      await expect(service.update('missing', '0xowner', { name: 'X' })).rejects.toThrow()
    })

    it('throws FORBIDDEN when non-owner tries to update', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'id-1',
          creator_address: '0xowner',
          status: 'draft',
        }),
      })
      const service = createCampaignService(repository)

      await expect(service.update('id-1', '0xhacker', { name: 'X' })).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for non-draft campaign', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'id-1',
          creator_address: '0xowner',
          status: 'active',
        }),
      })
      const service = createCampaignService(repository)

      await expect(service.update('id-1', '0xowner', { name: 'X' })).rejects.toThrow()
    })
  })

  describe('updateStatus', () => {
    it('allows draft → submitted transition', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'id-1', status: 'draft' }),
      })
      const service = createCampaignService(repository)

      await service.updateStatus('id-1', 'submitted')
      expect(repository.updateStatus).toHaveBeenCalledWith('id-1', 'submitted')
    })

    it('allows active → complete transition', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'id-1', status: 'active' }),
      })
      const service = createCampaignService(repository)

      await service.updateStatus('id-1', 'complete')
      expect(repository.updateStatus).toHaveBeenCalledWith('id-1', 'complete')
    })

    it('rejects invalid transition (complete → draft)', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'id-1', status: 'complete' }),
      })
      const service = createCampaignService(repository)

      await expect(service.updateStatus('id-1', 'draft')).rejects.toThrow()
    })

    it('rejects invalid transition (cancelled → active)', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'id-1', status: 'cancelled' }),
      })
      const service = createCampaignService(repository)

      await expect(service.updateStatus('id-1', 'active')).rejects.toThrow()
    })

    it('throws NOT_FOUND for missing campaign', async () => {
      const service = createCampaignService(repository)

      await expect(service.updateStatus('missing', 'submitted')).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('soft-deletes a draft campaign by owner', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'id-1',
          creator_address: '0xowner',
          status: 'draft',
        }),
      })
      const service = createCampaignService(repository)

      await service.delete('id-1', '0xowner')
      expect(repository.softDelete).toHaveBeenCalledWith('id-1')
    })

    it('throws FORBIDDEN for non-owner', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'id-1',
          creator_address: '0xowner',
          status: 'draft',
        }),
      })
      const service = createCampaignService(repository)

      await expect(service.delete('id-1', '0xhacker')).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for non-draft campaign', async () => {
      repository = createMockRepository({
        findById: vi.fn().mockResolvedValue({
          campaign_id: 'id-1',
          creator_address: '0xowner',
          status: 'active',
        }),
      })
      const service = createCampaignService(repository)

      await expect(service.delete('id-1', '0xowner')).rejects.toThrow()
    })
  })
})
