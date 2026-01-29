-- Migration: 0007_campaign_categories
-- Created: 2025-01-29
-- Description: Campaign categories domain - Many-to-many relationship
-- Domain: Campaign Categories (Relational)

-- ============================================================================
-- CATEGORIES TABLE
-- Purpose: Master list of available categories for campaigns
-- Design: Normalized category reference table
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    -- Primary key: Category slug (lowercase, kebab-case)
    category_id TEXT PRIMARY KEY 
        CHECK (category_id GLOB '[a-z0-9-]*' AND length(category_id) >= 2 AND length(category_id) <= 50),
    
    -- Display name
    name TEXT NOT NULL 
        CHECK (length(name) >= 2 AND length(name) <= 100),
    
    -- Description of the category
    description TEXT 
        CHECK (description IS NULL OR length(description) <= 500),
    
    -- Icon identifier (for UI)
    icon TEXT,
    
    -- Color code (hex)
    color TEXT 
        CHECK (color IS NULL OR color GLOB '#[a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]'),
    
    -- Parent category for hierarchical categories (optional)
    parent_category_id TEXT,
    
    -- Display order for UI sorting
    display_order INTEGER DEFAULT 0,
    
    -- Is this category active/visible
    is_active INTEGER DEFAULT 1,
    
    -- Is this a featured/promoted category
    is_featured INTEGER DEFAULT 0,
    
    -- Campaign count (denormalized for performance)
    campaign_count INTEGER DEFAULT 0,
    
    -- Audit columns
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Self-referencing foreign key for hierarchy
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- ============================================================================
-- CAMPAIGN_CATEGORIES TABLE (Junction/Bridge Table)
-- Purpose: Many-to-many relationship between campaigns and categories
-- Design: Standard junction table with composite primary key
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_categories (
    -- Foreign key to campaign
    campaign_id TEXT NOT NULL,
    
    -- Foreign key to category
    category_id TEXT NOT NULL,
    
    -- Is this the primary category for the campaign
    is_primary INTEGER DEFAULT 0,
    
    -- Audit columns
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Composite primary key
    PRIMARY KEY (campaign_id, category_id),
    
    -- Foreign key constraints
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- ============================================================================
-- TAGS TABLE
-- Purpose: Master list of tags for campaigns (user-generated or curated)
-- Design: Flexible tagging system with usage tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
    -- Primary key: Tag slug (lowercase, kebab-case)
    tag_id TEXT PRIMARY KEY 
        CHECK (tag_id GLOB '[a-z0-9-]*' AND length(tag_id) >= 2 AND length(tag_id) <= 50),
    
    -- Display name
    name TEXT NOT NULL 
        CHECK (length(name) >= 2 AND length(name) <= 50),
    
    -- Usage count (denormalized for trending/popular tags)
    usage_count INTEGER DEFAULT 0,
    
    -- Is this a curated/official tag
    is_curated INTEGER DEFAULT 0,
    
    -- Is this tag active/visible
    is_active INTEGER DEFAULT 1,
    
    -- Audit columns
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- CAMPAIGN_TAGS TABLE (Junction/Bridge Table)
-- Purpose: Many-to-many relationship between campaigns and tags
-- Design: Standard junction table with composite primary key
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_tags (
    -- Foreign key to campaign
    campaign_id TEXT NOT NULL,
    
    -- Foreign key to tag
    tag_id TEXT NOT NULL,
    
    -- Audit columns
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Composite primary key
    PRIMARY KEY (campaign_id, tag_id),
    
    -- Foreign key constraints
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);

-- Campaign categories indexes
CREATE INDEX IF NOT EXISTS idx_campaign_categories_campaign ON campaign_categories(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_categories_category ON campaign_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_campaign_categories_primary ON campaign_categories(campaign_id, is_primary) 
    WHERE is_primary = 1;

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_usage ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_curated ON tags(is_curated, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);

-- Campaign tags indexes
CREATE INDEX IF NOT EXISTS idx_campaign_tags_campaign ON campaign_tags(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tags_tag ON campaign_tags(tag_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update categories updated_at
CREATE TRIGGER IF NOT EXISTS trg_categories_updated_at
AFTER UPDATE ON categories
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE categories SET updated_at = datetime('now') WHERE category_id = NEW.category_id;
END;

-- Increment category campaign count on insert
CREATE TRIGGER IF NOT EXISTS trg_campaign_categories_insert
AFTER INSERT ON campaign_categories
FOR EACH ROW
BEGIN
    UPDATE categories 
    SET campaign_count = campaign_count + 1, updated_at = datetime('now')
    WHERE category_id = NEW.category_id;
END;

-- Decrement category campaign count on delete
CREATE TRIGGER IF NOT EXISTS trg_campaign_categories_delete
AFTER DELETE ON campaign_categories
FOR EACH ROW
BEGIN
    UPDATE categories 
    SET campaign_count = campaign_count - 1, updated_at = datetime('now')
    WHERE category_id = OLD.category_id;
END;

-- Increment tag usage count on insert
CREATE TRIGGER IF NOT EXISTS trg_campaign_tags_insert
AFTER INSERT ON campaign_tags
FOR EACH ROW
BEGIN
    UPDATE tags 
    SET usage_count = usage_count + 1, updated_at = datetime('now')
    WHERE tag_id = NEW.tag_id;
END;

-- Decrement tag usage count on delete
CREATE TRIGGER IF NOT EXISTS trg_campaign_tags_delete
AFTER DELETE ON campaign_tags
FOR EACH ROW
BEGIN
    UPDATE tags 
    SET usage_count = usage_count - 1, updated_at = datetime('now')
    WHERE tag_id = OLD.tag_id;
END;

-- ============================================================================
-- SEED DATA: Default Categories
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('technology', 'Technology', 'Tech startups, software, and innovation projects', 1, 1),
    ('environment', 'Environment', 'Climate, sustainability, and conservation initiatives', 2, 1),
    ('healthcare', 'Healthcare', 'Medical research, health services, and wellness', 3, 1),
    ('education', 'Education', 'Learning, training, and educational programs', 4, 1),
    ('social-impact', 'Social Impact', 'Community development and social causes', 5, 1),
    ('arts-culture', 'Arts & Culture', 'Creative projects, media, and cultural preservation', 6, 0),
    ('finance', 'Finance', 'DeFi, fintech, and financial inclusion', 7, 0),
    ('infrastructure', 'Infrastructure', 'Physical and digital infrastructure projects', 8, 0),
    ('governance', 'Governance', 'DAO, policy, and organizational initiatives', 9, 0),
    ('research', 'Research', 'Scientific research and academic projects', 10, 0);
