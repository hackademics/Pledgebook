-- Migration: 0017_evidence_verification
-- Description: Add evidence type and verification tracking for demo

-- Add evidence type and verification tracking
ALTER TABLE evidence ADD COLUMN evidence_type TEXT DEFAULT 'general'
    CHECK (evidence_type IN ('baseline', 'completion', 'general'));
ALTER TABLE evidence ADD COLUMN verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'processing'));
ALTER TABLE evidence ADD COLUMN verification_result TEXT;
ALTER TABLE evidence ADD COLUMN verified_at TEXT;

-- Add baseline/completion references to campaigns
ALTER TABLE campaigns ADD COLUMN baseline_evidence_id TEXT
    REFERENCES evidence(evidence_id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN completion_evidence_id TEXT
    REFERENCES evidence(evidence_id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_verification ON evidence(verification_status);
