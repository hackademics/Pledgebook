-- Migration: 0002_users_domain
-- Created: 2025-01-29
-- Description: User domain schema for wallet-only authentication
-- Domain: Users (Wallet-Only Auth)

-- Drop existing users table if exists (from initial schema example)
DROP TABLE IF EXISTS users;

-- ============================================================================
-- USERS TABLE
-- Purpose: Minimal user record where wallet address is the primary identity
-- Design: Wallet-only authentication - Ethereum address is the primary key
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    -- Primary identity: Ethereum wallet address (0x + 40 hex chars)
    address TEXT PRIMARY KEY 
        CHECK (length(address) = 42 AND address LIKE '0x%'),
    
    -- User role with constrained values
    role TEXT NOT NULL DEFAULT 'user' 
        CHECK (role IN ('user', 'admin', 'verifier')),
    
    -- User preferences stored as JSON
    preferences TEXT DEFAULT '{"privacyMode": false, "notifications": true}',
    
    -- Display name (optional, user-provided)
    display_name TEXT,
    
    -- ENS name cache (optional, resolved from blockchain)
    ens_name TEXT,
    
    -- Profile image URL
    avatar_url TEXT,
    
    -- Reputation score (calculated from successful campaigns/pledges)
    reputation_score INTEGER DEFAULT 0,
    
    -- Total number of campaigns created
    campaigns_created INTEGER DEFAULT 0,
    
    -- Total number of pledges made
    pledges_made INTEGER DEFAULT 0,
    
    -- Total amount pledged (in wei, stored as TEXT for large numbers)
    total_pledged TEXT DEFAULT '0',
    
    -- Account status
    is_active INTEGER DEFAULT 1,
    is_banned INTEGER DEFAULT 0,
    ban_reason TEXT,
    
    -- Audit columns
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT,
    last_active_at TEXT
);

-- ============================================================================
-- INDEXES
-- Purpose: Optimize query performance for common access patterns
-- ============================================================================

-- Index for role-based queries (admin panels, verifier lookups)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index for active user filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index for reputation-based sorting (leaderboards)
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);

-- Index for recently active users
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC);

-- Composite index for active users by role
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- ============================================================================
-- TRIGGERS
-- Purpose: Maintain data integrity and audit trail
-- ============================================================================

-- Auto-update updated_at timestamp on any row modification
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE address = NEW.address;
END;
