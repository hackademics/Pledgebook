-- =============================================================================
-- Migration: 0013_additional_indexes.sql
-- Purpose: Add recommended indexes for query optimization
-- Date: 2026-02-05
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Users table indexes
-- -----------------------------------------------------------------------------

-- Index for ENS name lookups (only for non-null values)
CREATE INDEX IF NOT EXISTS idx_users_ens_name 
  ON users(ens_name) 
  WHERE ens_name IS NOT NULL;

-- Index for finding banned users (admin queries)
CREATE INDEX IF NOT EXISTS idx_users_banned 
  ON users(is_banned) 
  WHERE is_banned = 1;

-- -----------------------------------------------------------------------------
-- Campaigns table indexes
-- -----------------------------------------------------------------------------

-- Index for looking up campaigns by escrow address
CREATE INDEX IF NOT EXISTS idx_campaigns_escrow 
  ON campaigns(escrow_address) 
  WHERE escrow_address IS NOT NULL;

-- Composite index for verified active campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_verified 
  ON campaigns(is_verified, status);

-- -----------------------------------------------------------------------------
-- Evidence table indexes
-- -----------------------------------------------------------------------------

-- Index for IPFS CID lookups (deduplication checks)
CREATE INDEX IF NOT EXISTS idx_evidence_ipfs_cid 
  ON evidence(ipfs_cid);

-- -----------------------------------------------------------------------------
-- Consensus results table indexes
-- -----------------------------------------------------------------------------

-- Index for IPFS CID lookups on consensus results
CREATE INDEX IF NOT EXISTS idx_consensus_ipfs 
  ON consensus_results(ipfs_cid) 
  WHERE ipfs_cid IS NOT NULL;
