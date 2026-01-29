-- Migration: 0010_views_functions
-- Created: 2025-01-29
-- Description: Database views for common queries and reporting
-- Domain: Views & Utilities

-- ============================================================================
-- VIEW: v_active_campaigns
-- Purpose: Quick access to all active, non-deleted campaigns
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_active_campaigns AS
SELECT 
    c.campaign_id,
    c.creator_address,
    c.name,
    c.slug,
    c.purpose,
    c.status,
    c.end_date,
    c.fundraising_goal,
    c.amount_pledged,
    c.pledge_count,
    c.unique_pledgers,
    c.voucher_count,
    c.is_showcased,
    c.is_featured,
    c.is_disputed,
    c.privacy_mode,
    c.image_url,
    c.created_at,
    c.activated_at,
    u.display_name AS creator_name,
    u.ens_name AS creator_ens,
    u.reputation_score AS creator_reputation
FROM campaigns c
LEFT JOIN users u ON c.creator_address = u.address
WHERE c.status = 'active' 
  AND c.is_deleted = 0
  AND datetime(c.end_date) > datetime('now')
ORDER BY c.amount_pledged DESC;

-- ============================================================================
-- VIEW: v_campaign_summary
-- Purpose: Aggregated campaign statistics for dashboards
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_campaign_summary AS
SELECT 
    c.campaign_id,
    c.name,
    c.slug,
    c.status,
    c.creator_address,
    c.fundraising_goal,
    c.amount_pledged,
    CASE 
        WHEN CAST(c.fundraising_goal AS REAL) > 0 
        THEN ROUND(CAST(c.amount_pledged AS REAL) / CAST(c.fundraising_goal AS REAL) * 100, 2)
        ELSE 0 
    END AS funding_percentage,
    c.pledge_count,
    c.unique_pledgers,
    c.voucher_count,
    c.disputer_count,
    c.is_disputed,
    c.end_date,
    ROUND((julianday(c.end_date) - julianday('now'))) AS days_remaining,
    c.created_at,
    c.activated_at,
    c.completed_at
FROM campaigns c
WHERE c.is_deleted = 0;

-- ============================================================================
-- VIEW: v_user_dashboard
-- Purpose: User activity summary for personal dashboards
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_user_dashboard AS
SELECT 
    u.address,
    u.display_name,
    u.ens_name,
    u.reputation_score,
    u.campaigns_created,
    u.pledges_made,
    u.total_pledged,
    -- Active campaigns created
    (SELECT COUNT(*) FROM campaigns c WHERE c.creator_address = u.address AND c.status = 'active') AS active_campaigns,
    -- Completed campaigns
    (SELECT COUNT(*) FROM campaigns c WHERE c.creator_address = u.address AND c.status = 'complete') AS completed_campaigns,
    -- Active pledges
    (SELECT COUNT(*) FROM pledges p WHERE p.pledger_address = u.address AND p.status = 'active') AS active_pledges,
    -- Active vouches
    (SELECT COUNT(*) FROM vouchers v WHERE v.voucher_address = u.address AND v.status = 'active') AS active_vouches,
    -- Pending disputes
    (SELECT COUNT(*) FROM disputers d WHERE d.disputer_address = u.address AND d.status IN ('pending', 'active')) AS pending_disputes,
    -- Unread notifications
    (SELECT COUNT(*) FROM notifications n WHERE n.recipient_address = u.address AND n.is_read = 0) AS unread_notifications,
    u.last_login_at,
    u.last_active_at,
    u.created_at
FROM users u
WHERE u.is_active = 1;

-- ============================================================================
-- VIEW: v_trending_campaigns
-- Purpose: Campaigns ranked by recent activity and engagement
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_trending_campaigns AS
SELECT 
    c.campaign_id,
    c.name,
    c.slug,
    c.purpose,
    c.image_url,
    c.status,
    c.fundraising_goal,
    c.amount_pledged,
    c.pledge_count,
    c.voucher_count,
    c.end_date,
    -- Recent pledges (last 24 hours)
    (SELECT COUNT(*) FROM pledges p 
     WHERE p.campaign_id = c.campaign_id 
     AND datetime(p.pledged_at) > datetime('now', '-1 day')) AS recent_pledges,
    -- Recent pledge amount
    (SELECT COALESCE(SUM(CAST(p.amount AS INTEGER)), 0) FROM pledges p 
     WHERE p.campaign_id = c.campaign_id 
     AND datetime(p.pledged_at) > datetime('now', '-1 day')) AS recent_pledge_amount,
    -- Trend score (simple engagement metric)
    (c.pledge_count * 2 + c.voucher_count * 5 + 
     (SELECT COUNT(*) FROM pledges p WHERE p.campaign_id = c.campaign_id AND datetime(p.pledged_at) > datetime('now', '-1 day')) * 10
    ) AS trend_score,
    c.created_at
FROM campaigns c
WHERE c.status = 'active' 
  AND c.is_deleted = 0
  AND datetime(c.end_date) > datetime('now')
ORDER BY trend_score DESC
LIMIT 50;

-- ============================================================================
-- VIEW: v_dispute_queue
-- Purpose: Pending disputes for admin/verifier review
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_dispute_queue AS
SELECT 
    d.disputer_id,
    d.campaign_id,
    c.name AS campaign_name,
    c.slug AS campaign_slug,
    d.disputer_address,
    d.amount,
    d.dispute_type,
    d.reason,
    d.status,
    d.disputed_at,
    d.expires_at,
    ROUND((julianday(d.expires_at) - julianday('now'))) AS days_until_expiry,
    c.creator_address,
    c.amount_pledged AS campaign_pledged
FROM disputers d
JOIN campaigns c ON d.campaign_id = c.campaign_id
WHERE d.status IN ('pending', 'active')
ORDER BY d.disputed_at ASC;

-- ============================================================================
-- VIEW: v_consensus_stats
-- Purpose: Aggregated consensus verification statistics
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_consensus_stats AS
SELECT 
    campaign_id,
    COUNT(*) AS total_verifications,
    SUM(result) AS passed_count,
    COUNT(*) - SUM(result) AS failed_count,
    ROUND(AVG(result) * 100, 2) AS pass_rate,
    ROUND(AVG(confidence), 4) AS avg_confidence,
    MAX(round_number) AS latest_round,
    MIN(verified_at) AS first_verification,
    MAX(verified_at) AS last_verification
FROM consensus_results
GROUP BY campaign_id;

-- ============================================================================
-- VIEW: v_category_stats
-- Purpose: Category popularity and campaign distribution
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_category_stats AS
SELECT 
    cat.category_id,
    cat.name,
    cat.description,
    cat.campaign_count,
    cat.is_featured,
    -- Active campaigns in category
    (SELECT COUNT(*) FROM campaign_categories cc 
     JOIN campaigns c ON cc.campaign_id = c.campaign_id 
     WHERE cc.category_id = cat.category_id AND c.status = 'active') AS active_count,
    -- Total pledged in category
    (SELECT COALESCE(SUM(CAST(c.amount_pledged AS INTEGER)), 0) FROM campaign_categories cc 
     JOIN campaigns c ON cc.campaign_id = c.campaign_id 
     WHERE cc.category_id = cat.category_id) AS total_pledged,
    cat.display_order
FROM categories cat
WHERE cat.is_active = 1
ORDER BY cat.display_order;

-- ============================================================================
-- VIEW: v_expiring_campaigns
-- Purpose: Campaigns ending soon (for notifications/highlights)
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_expiring_campaigns AS
SELECT 
    c.campaign_id,
    c.name,
    c.slug,
    c.status,
    c.end_date,
    ROUND((julianday(c.end_date) - julianday('now')) * 24) AS hours_remaining,
    c.fundraising_goal,
    c.amount_pledged,
    CASE 
        WHEN CAST(c.fundraising_goal AS REAL) > 0 
        THEN ROUND(CAST(c.amount_pledged AS REAL) / CAST(c.fundraising_goal AS REAL) * 100, 2)
        ELSE 0 
    END AS funding_percentage,
    c.creator_address
FROM campaigns c
WHERE c.status = 'active' 
  AND c.is_deleted = 0
  AND datetime(c.end_date) > datetime('now')
  AND datetime(c.end_date) <= datetime('now', '+7 days')
ORDER BY c.end_date ASC;

-- ============================================================================
-- VIEW: v_leaderboard
-- Purpose: Top users by reputation and activity
-- ============================================================================
CREATE VIEW IF NOT EXISTS v_leaderboard AS
SELECT 
    u.address,
    u.display_name,
    u.ens_name,
    u.reputation_score,
    u.campaigns_created,
    u.pledges_made,
    u.total_pledged,
    -- Successful campaigns (completed)
    (SELECT COUNT(*) FROM campaigns c WHERE c.creator_address = u.address AND c.status = 'complete') AS successful_campaigns,
    -- Total amount raised (as creator)
    (SELECT COALESCE(SUM(CAST(c.amount_pledged AS INTEGER)), 0) FROM campaigns c 
     WHERE c.creator_address = u.address AND c.status = 'complete') AS total_raised,
    u.created_at AS member_since
FROM users u
WHERE u.is_active = 1 AND u.is_banned = 0
ORDER BY u.reputation_score DESC
LIMIT 100;
