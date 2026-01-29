-- Migration: 0001_initial_schema
-- Created: 2025-01-29
-- Description: Initial database schema - Base setup and configuration
-- 
-- PledgeBook D1 Database Schema
-- ============================================================================
-- This is the initial migration that sets up the foundational database
-- configuration. Subsequent migrations create the domain-specific tables.
--
-- Migration Order:
--   0001 - Initial schema (this file)
--   0002 - Users domain (wallet-only auth)
--   0003 - Campaigns domain (core entity)
--   0004 - Pledges domain
--   0005 - Vouchers domain (endorsers)
--   0006 - Disputers domain
--   0007 - Categories & Tags (relational)
--   0008 - Consensus & Audit logging
--   0009 - Sessions & Notifications
--   0010 - Views & Utilities
-- ============================================================================

-- Enable foreign key support (D1/SQLite requires explicit enable)
PRAGMA foreign_keys = ON;

-- ============================================================================
-- SCHEMA METADATA TABLE
-- Purpose: Track migration history and schema version
-- ============================================================================
CREATE TABLE IF NOT EXISTS _schema_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert initial schema version
INSERT OR REPLACE INTO _schema_metadata (key, value, updated_at) 
VALUES ('schema_version', '1.0.0', datetime('now'));

INSERT OR REPLACE INTO _schema_metadata (key, value, updated_at) 
VALUES ('initial_migration_at', datetime('now'), datetime('now'));

-- ============================================================================
-- CONFIGURATION TABLE  
-- Purpose: Store runtime configuration values
-- ============================================================================
CREATE TABLE IF NOT EXISTS config (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    is_sensitive INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default configuration values
INSERT OR IGNORE INTO config (config_key, config_value, description) VALUES
    ('consensus_threshold_default', '0.66', 'Default consensus threshold for campaigns'),
    ('min_pledge_amount', '1000000', 'Minimum pledge amount in wei (1 USDC)'),
    ('min_creator_bond', '10000000', 'Minimum creator bond in wei (10 USDC)'),
    ('max_campaign_duration_days', '365', 'Maximum campaign duration in days'),
    ('dispute_window_days', '7', 'Days after completion to file a dispute'),
    ('session_expiry_hours', '168', 'Session expiry time in hours (7 days)');

-- Index for config lookups
CREATE INDEX IF NOT EXISTS idx_config_key ON config(config_key);
