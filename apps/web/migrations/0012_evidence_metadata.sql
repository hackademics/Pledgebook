-- Migration: 0012_evidence_metadata
-- Created: 2026-01-30
-- Description: Evidence metadata storage for uploads
-- Domain: Evidence

CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY
        CHECK (length(evidence_id) = 36),

    campaign_id TEXT,
    uploader_address TEXT NOT NULL,

    ipfs_cid TEXT NOT NULL,
    ipfs_url TEXT NOT NULL,
    gateway_url TEXT NOT NULL,
    r2_key TEXT,

    content_type TEXT,
    file_name TEXT,
    size_bytes INTEGER,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE SET NULL,
    FOREIGN KEY (uploader_address) REFERENCES users(address) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_evidence_campaign ON evidence(campaign_id);
CREATE INDEX IF NOT EXISTS idx_evidence_uploader ON evidence(uploader_address);
CREATE INDEX IF NOT EXISTS idx_evidence_created_at ON evidence(created_at DESC);
