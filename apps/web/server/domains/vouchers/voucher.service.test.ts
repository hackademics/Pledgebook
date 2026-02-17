import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createVoucherService } from './voucher.service'
import type { VoucherRepository } from './voucher.repository'
import type { CampaignRepository } from '../campaigns/campaign.repository'

function createMockVoucherRepo(overrides?: Partial<VoucherRepository>): VoucherRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByTxHash: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByCampaign: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findByVoucher: vi.fn().mockResolvedValue({ results: [], total: 0 }),
    findActiveByCampaign: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'pending' }),
    update: vi.fn().mockResolvedValue(true),
    updateStatus: vi.fn().mockResolvedValue(true),
    exists: vi.fn().mockResolvedValue(true),
    txHashExists: vi.fn().mockResolvedValue(false),
    hasVouchedForCampaign: vi.fn().mockResolvedValue(false),
    count: vi.fn().mockResolvedValue(0),
    sumByCampaign: vi.fn().mockResolvedValue('0'),
    ...overrides,
  } as unknown as VoucherRepository
}

function createMockCampaignRepo(overrides?: Partial<CampaignRepository>): CampaignRepository {
  return {
    findById: vi.fn().mockResolvedValue({ campaign_id: 'c-1', status: 'active' }),
    incrementVoucherCount: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as CampaignRepository
}

const validInput = {
  campaignId: 'c-1',
  amount: '50',
  stakeTxHash: '0x' + 'b'.repeat(64),
}

describe('VoucherService', () => {
  let voucherRepo: VoucherRepository
  let campaignRepo: CampaignRepository

  beforeEach(() => {
    vi.clearAllMocks()
    voucherRepo = createMockVoucherRepo()
    campaignRepo = createMockCampaignRepo()
  })

  describe('create', () => {
    it('creates a voucher with valid input', async () => {
      const service = createVoucherService({
        voucherRepository: voucherRepo,
        campaignRepository: campaignRepo,
      })
      await service.create('0xvoucher', validInput)

      expect(voucherRepo.create).toHaveBeenCalled()
    })

    it('throws CONFLICT on duplicate txHash', async () => {
      voucherRepo = createMockVoucherRepo({ txHashExists: vi.fn().mockResolvedValue(true) })
      const service = createVoucherService({
        voucherRepository: voucherRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xvoucher', validInput)).rejects.toThrow()
    })

    it('throws CONFLICT when user already vouched for campaign', async () => {
      voucherRepo = createMockVoucherRepo({
        hasVouchedForCampaign: vi.fn().mockResolvedValue(true),
      })
      const service = createVoucherService({
        voucherRepository: voucherRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xvoucher', validInput)).rejects.toThrow()
    })

    it('throws VALIDATION_ERROR for completed campaign', async () => {
      campaignRepo = createMockCampaignRepo({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'c-1', status: 'complete' }),
      })
      const service = createVoucherService({
        voucherRepository: voucherRepo,
        campaignRepository: campaignRepo,
      })

      await expect(service.create('0xvoucher', validInput)).rejects.toThrow()
    })

    it('allows vouching for draft campaigns', async () => {
      campaignRepo = createMockCampaignRepo({
        findById: vi.fn().mockResolvedValue({ campaign_id: 'c-1', status: 'draft' }),
      })
      const service = createVoucherService({
        voucherRepository: voucherRepo,
        campaignRepository: campaignRepo,
      })

      await service.create('0xvoucher', validInput)
      expect(voucherRepo.create).toHaveBeenCalled()
    })

    it('increments voucher count on campaign', async () => {
      const service = createVoucherService({
        voucherRepository: voucherRepo,
        campaignRepository: campaignRepo,
      })
      await service.create('0xvoucher', validInput)

      expect(campaignRepo.incrementVoucherCount).toHaveBeenCalledWith('c-1')
    })
  })

  describe('activateVoucher', () => {
    it('activates a pending voucher', async () => {
      voucherRepo = createMockVoucherRepo({
        findById: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'pending' }),
      })
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await service.activateVoucher('v-1')
      expect(voucherRepo.updateStatus).toHaveBeenCalledWith('v-1', 'active')
    })

    it('throws VALIDATION_ERROR for non-pending voucher', async () => {
      voucherRepo = createMockVoucherRepo({
        findById: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'active' }),
      })
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await expect(service.activateVoucher('v-1')).rejects.toThrow()
    })

    it('throws NOT_FOUND for missing voucher', async () => {
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await expect(service.activateVoucher('missing')).rejects.toThrow()
    })
  })

  describe('releaseVoucher', () => {
    it('releases an active voucher', async () => {
      voucherRepo = createMockVoucherRepo({
        findById: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'active' }),
      })
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await service.releaseVoucher('v-1', '0x' + 'c'.repeat(64))
      expect(voucherRepo.update).toHaveBeenCalledWith(
        'v-1',
        expect.objectContaining({ status: 'released' }),
      )
    })

    it('throws VALIDATION_ERROR for non-active voucher', async () => {
      voucherRepo = createMockVoucherRepo({
        findById: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'pending' }),
      })
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await expect(service.releaseVoucher('v-1', '0x' + 'c'.repeat(64))).rejects.toThrow()
    })
  })

  describe('slashVoucher', () => {
    it('slashes an active voucher', async () => {
      voucherRepo = createMockVoucherRepo({
        findById: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'active' }),
      })
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await service.slashVoucher('v-1', '0x' + 'd'.repeat(64), '25', 'Campaign failed')
      expect(voucherRepo.update).toHaveBeenCalledWith(
        'v-1',
        expect.objectContaining({
          status: 'slashed',
          slashAmount: '25',
        }),
      )
    })

    it('throws VALIDATION_ERROR for non-active voucher', async () => {
      voucherRepo = createMockVoucherRepo({
        findById: vi.fn().mockResolvedValue({ voucher_id: 'v-1', status: 'released' }),
      })
      const service = createVoucherService({ voucherRepository: voucherRepo })

      await expect(service.slashVoucher('v-1', '0xtx', '25', 'reason')).rejects.toThrow()
    })
  })
})
