-- ============================================================================
-- MIGRATION: 0014_count_decrement_triggers.sql
-- Purpose: Add triggers to decrement pledge_count and voucher_count when
--          pledges/vouchers are cancelled, refunded, or deleted
-- Date: 2025-01-20
-- ============================================================================

-- ============================================================================
-- PLEDGE COUNT DECREMENT TRIGGERS
-- ============================================================================

-- Decrement pledge count when pledge status changes from active to cancelled/refunded
CREATE TRIGGER IF NOT EXISTS trg_pledges_decrement_on_status_change
AFTER UPDATE ON pledges
FOR EACH ROW
WHEN OLD.status IN ('confirmed', 'active') 
     AND NEW.status IN ('cancelled', 'refunded', 'failed')
BEGIN
    UPDATE campaigns 
    SET 
        pledge_count = MAX(0, pledge_count - 1),
        amount_pledged = CAST(MAX(0, CAST(amount_pledged AS INTEGER) - CAST(OLD.amount AS INTEGER)) AS TEXT),
        updated_at = datetime('now')
    WHERE campaign_id = NEW.campaign_id;
END;

-- Decrement pledge count when pledge is deleted (if applicable)
CREATE TRIGGER IF NOT EXISTS trg_pledges_decrement_on_delete
AFTER DELETE ON pledges
FOR EACH ROW
WHEN OLD.status IN ('confirmed', 'active')
BEGIN
    UPDATE campaigns 
    SET 
        pledge_count = MAX(0, pledge_count - 1),
        amount_pledged = CAST(MAX(0, CAST(amount_pledged AS INTEGER) - CAST(OLD.amount AS INTEGER)) AS TEXT),
        updated_at = datetime('now')
    WHERE campaign_id = OLD.campaign_id;
END;

-- ============================================================================
-- VOUCHER COUNT DECREMENT TRIGGERS
-- ============================================================================

-- Decrement voucher count when voucher status changes from active to cancelled/slashed
CREATE TRIGGER IF NOT EXISTS trg_vouchers_decrement_on_status_change
AFTER UPDATE ON vouchers
FOR EACH ROW
WHEN OLD.status = 'active' 
     AND NEW.status IN ('cancelled', 'slashed', 'withdrawn')
BEGIN
    UPDATE campaigns 
    SET 
        voucher_count = MAX(0, voucher_count - 1),
        updated_at = datetime('now')
    WHERE campaign_id = NEW.campaign_id;
END;

-- Decrement voucher count when voucher is deleted (if applicable)
CREATE TRIGGER IF NOT EXISTS trg_vouchers_decrement_on_delete
AFTER DELETE ON vouchers
FOR EACH ROW
WHEN OLD.status = 'active'
BEGIN
    UPDATE campaigns 
    SET 
        voucher_count = MAX(0, voucher_count - 1),
        updated_at = datetime('now')
    WHERE campaign_id = OLD.campaign_id;
END;

-- ============================================================================
-- USER STATS DECREMENT TRIGGERS
-- ============================================================================

-- Decrement user's total_pledged when pledge is refunded
CREATE TRIGGER IF NOT EXISTS trg_pledges_decrement_user_total
AFTER UPDATE ON pledges
FOR EACH ROW
WHEN OLD.status IN ('confirmed', 'active') 
     AND NEW.status IN ('refunded')
BEGIN
    UPDATE users 
    SET 
        total_pledged = CAST(MAX(0, CAST(total_pledged AS INTEGER) - CAST(OLD.amount AS INTEGER)) AS TEXT),
        updated_at = datetime('now')
    WHERE wallet_address = NEW.pledger_address;
END;
