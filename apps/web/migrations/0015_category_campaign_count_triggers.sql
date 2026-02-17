-- =============================================================================
-- Migration 0015: Category campaign_count trigger
-- Automatically increments/decrements category.campaign_count when
-- campaigns are created or deleted.
-- Replaces the simpler triggers from 0007 with improved versions
-- that prevent negative counts.
-- =============================================================================

-- Drop the original triggers from 0007 to avoid double-counting
DROP TRIGGER IF EXISTS trg_campaign_categories_insert;
DROP TRIGGER IF EXISTS trg_campaign_categories_delete;

-- Trigger: Increment campaign_count when a new campaign is linked to a category
CREATE TRIGGER IF NOT EXISTS trg_increment_category_campaign_count
AFTER INSERT ON campaign_categories
BEGIN
  UPDATE categories
  SET campaign_count = campaign_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE category_id = NEW.category_id;
END;

-- Trigger: Decrement campaign_count when a campaign-category link is removed
CREATE TRIGGER IF NOT EXISTS trg_decrement_category_campaign_count
AFTER DELETE ON campaign_categories
BEGIN
  UPDATE categories
  SET campaign_count = CASE
        WHEN campaign_count > 0 THEN campaign_count - 1
        ELSE 0
      END,
      updated_at = CURRENT_TIMESTAMP
  WHERE category_id = OLD.category_id;
END;
