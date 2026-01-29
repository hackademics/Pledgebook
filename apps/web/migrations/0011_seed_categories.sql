-- Migration: 0011_seed_categories
-- Created: 2025-01-29
-- Description: Seed additional campaign categories
-- Domain: Categories (Seed Data)

-- ============================================================================
-- PERSONAL & INDIVIDUAL GROWTH CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('personal-fitness', 'Personal Fitness', 'Health and fitness improvement goals', 11, 1),
    ('weight-loss', 'Weight Loss', 'Weight management and body composition goals', 12, 0),
    ('endurance-sports', 'Endurance Sports', 'Marathon, triathlon, and endurance athletic challenges', 13, 0),
    ('academic-success', 'Academic Success', 'Educational achievement and learning goals', 14, 0),
    ('skill-building', 'Skill Building', 'Professional and personal skill development', 15, 0),
    ('career-growth', 'Career Growth', 'Professional advancement and career milestones', 16, 0),
    ('health-recovery', 'Health Recovery', 'Medical recovery and rehabilitation goals', 17, 0),
    ('debt-payoff', 'Debt Payoff', 'Financial debt elimination and freedom goals', 18, 0),
    ('sustainable-living', 'Sustainable Living', 'Eco-friendly lifestyle and sustainability pledges', 19, 1);

-- ============================================================================
-- BUSINESS & ENTREPRENEURSHIP CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('startup-launch', 'Startup Launch', 'New business and startup launch milestones', 20, 1),
    ('sales-targets', 'Sales Targets', 'Sales performance and revenue targets', 21, 0),
    ('revenue-growth', 'Revenue Growth', 'Business revenue and growth objectives', 22, 0);

-- ============================================================================
-- NONPROFIT & HUMANITARIAN CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('nonprofit-fundraising', 'Nonprofit Fundraising', 'Charitable organization fundraising campaigns', 30, 1),
    ('shelter-housing', 'Shelter & Housing', 'Housing assistance and shelter programs', 31, 0),
    ('food-security', 'Food Security', 'Hunger relief and food access initiatives', 32, 0),
    ('homelessness-reduction', 'Homelessness Reduction', 'Programs to reduce and prevent homelessness', 33, 0),
    ('mental-health-support', 'Mental Health Support', 'Mental health awareness and support services', 34, 1),
    ('animal-rescue', 'Animal Rescue', 'Animal welfare and rescue operations', 35, 0);

-- ============================================================================
-- ENVIRONMENTAL CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('environmental-cleanup', 'Environmental Cleanup', 'Pollution cleanup and environmental restoration', 40, 0),
    ('tree-planting', 'Tree Planting', 'Reforestation and urban greening initiatives', 41, 1),
    ('carbon-reduction', 'Carbon Reduction', 'Carbon footprint and emissions reduction goals', 42, 0),
    ('renewable-energy', 'Renewable Energy', 'Clean energy adoption and infrastructure projects', 43, 1);

-- ============================================================================
-- COMMUNITY & CIVIC CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('crime-reduction', 'Crime Reduction', 'Public safety and crime prevention initiatives', 50, 0),
    ('traffic-safety', 'Traffic Safety', 'Road safety and traffic incident reduction', 51, 0),
    ('community-projects', 'Community Projects', 'Local community improvement and development', 52, 1),
    ('civic-engagement', 'Civic Engagement', 'Voter participation and civic responsibility', 53, 0);

-- ============================================================================
-- EDUCATION CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('education-funding', 'Education Funding', 'Scholarships, school funding, and educational resources', 60, 1),
    ('student-attendance', 'Student Attendance', 'School attendance improvement programs', 61, 0),
    ('academic-performance', 'Academic Performance', 'Student achievement and test score improvements', 62, 0);

-- ============================================================================
-- ARTS & SCIENCE CATEGORIES
-- ============================================================================
INSERT OR IGNORE INTO categories (category_id, name, description, display_order, is_featured) VALUES
    ('arts-creativity', 'Arts & Creativity', 'Artistic projects, performances, and creative works', 70, 0),
    ('scientific-research', 'Scientific Research', 'Research projects and scientific discovery initiatives', 71, 1);
