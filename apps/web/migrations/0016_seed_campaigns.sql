-- ============================================================================
-- Migration: 0016_seed_campaigns
-- Created: 2026-02-09
-- Description: Comprehensive campaign seed data for testing environment
-- Purpose: Seeds realistic data across ALL lifecycle states, workflows,
--          and features of the Pledgebook ecosystem
-- ============================================================================
--
-- SEEDING STRATEGY OVERVIEW
-- ============================================================================
-- Users:       8 users (1 primary tester, 5 participants, 1 admin, 1 verifier)
-- Campaigns:  18 campaigns covering every status:
--   - Draft (2)        : New campaigns not yet submitted
--   - Submitted (2)    : Applied / awaiting review
--   - Rejected->Draft  : Submitted then rejected back to draft
--   - Approved (1)     : Approved, awaiting on-chain activation
--   - Active (5)       : Live campaigns at various funding levels
--   - Complete (2)     : Successfully verified, one with funds released
--   - Failed (2)       : Verification failed / dispute upheld
--   - Disputed (1)     : Active dispute in progress
--   - Cancelled (1)    : Creator-cancelled campaign
-- Pledges:    34 pledges across active/completed/failed/disputed campaigns
-- Vouchers:   12 vouchers (active, released, slashed)
-- Disputers:   4 disputes (pending, active, upheld)
-- Consensus:  10 AI verification results (pass/fail across providers)
-- Evidence:    4 evidence uploads for disputed/completed campaigns
-- Notifications: 12 lifecycle notifications
-- Audit Log:  15 system audit entries
--
-- Primary Test Wallet: 0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f
-- ============================================================================

-- ============================================================================
-- SECTION 1: USERS
-- ============================================================================
-- 8 users with varied roles, reputations, and activity levels

INSERT OR IGNORE INTO users (
    address, role, display_name, ens_name, avatar_url,
    reputation_score, campaigns_created, pledges_made, total_pledged,
    is_active, is_banned, created_at, updated_at, last_login_at, last_active_at
) VALUES
    -- Primary test wallet: Active campaign creator and pledger
    ('0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', 'user', 'PledgeBook Tester', 'pledgetester.eth', NULL,
     85, 14, 11, '92000000000',
     1, 0, '2025-06-01 10:00:00', '2026-02-09 08:00:00', '2026-02-09 08:00:00', '2026-02-09 08:30:00'),

    -- Alice: Campaign creator and active pledger
    ('0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'user', 'Alice Chen', 'alice.eth', NULL,
     62, 2, 8, '46000000000',
     1, 0, '2025-07-15 14:00:00', '2026-02-08 16:00:00', '2026-02-08 16:00:00', '2026-02-08 16:30:00'),

    -- Bob: Campaign creator with mixed track record
    ('0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 'user', 'Bob Martinez', NULL, NULL,
     25, 2, 4, '31500000000',
     1, 0, '2025-08-01 09:00:00', '2026-02-07 12:00:00', '2026-02-07 12:00:00', '2026-02-07 12:45:00'),

    -- Charlie: Consistent voucher/endorser
    ('0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'user', 'Charlie Wilson', NULL, NULL,
     72, 0, 2, '11000000000',
     1, 0, '2025-07-20 11:00:00', '2026-02-09 07:00:00', '2026-02-09 07:00:00', '2026-02-09 07:15:00'),

    -- Dave: Active disputer and watchdog
    ('0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', 'user', 'Dave Thompson', NULL, NULL,
     48, 0, 2, '7000000000',
     1, 0, '2025-09-01 08:00:00', '2026-02-06 10:00:00', '2026-02-06 10:00:00', '2026-02-06 10:30:00'),

    -- Emily: Platform administrator
    ('0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 'admin', 'Emily Rodriguez', NULL, NULL,
     100, 0, 0, '0',
     1, 0, '2025-05-01 09:00:00', '2026-02-09 09:00:00', '2026-02-09 09:00:00', '2026-02-09 09:00:00'),

    -- Frank: Platform verifier
    ('0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', 'verifier', 'Frank Kim', NULL, NULL,
     90, 0, 0, '0',
     1, 0, '2025-05-15 10:00:00', '2026-02-08 14:00:00', '2026-02-08 14:00:00', '2026-02-08 14:30:00'),

    -- Grace: Active pledger and occasional voucher
    ('0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', 'user', 'Grace Okafor', 'grace.eth', NULL,
     55, 0, 6, '28300000000',
     1, 0, '2025-08-10 15:00:00', '2026-02-08 18:00:00', '2026-02-08 18:00:00', '2026-02-08 18:20:00');


-- ============================================================================
-- SECTION 2: TAGS
-- ============================================================================
-- Seed curated tags for campaign classification

INSERT OR IGNORE INTO tags (tag_id, name, usage_count, is_curated, is_active) VALUES
    ('web3', 'Web3', 0, 1, 1),
    ('defi', 'DeFi', 0, 1, 1),
    ('climate', 'Climate', 0, 1, 1),
    ('reforestation', 'Reforestation', 0, 1, 1),
    ('education', 'Education', 0, 1, 1),
    ('coding', 'Coding', 0, 1, 1),
    ('charity', 'Charity', 0, 1, 1),
    ('fitness', 'Fitness', 0, 1, 1),
    ('marathon', 'Marathon', 0, 1, 1),
    ('housing', 'Housing', 0, 1, 1),
    ('animals', 'Animals', 0, 1, 1),
    ('mental-health', 'Mental Health', 0, 1, 1),
    ('food', 'Food', 0, 1, 1),
    ('sustainability', 'Sustainability', 0, 1, 1),
    ('community', 'Community', 0, 1, 1),
    ('carbon-offset', 'Carbon Offset', 0, 1, 1),
    ('music', 'Music', 0, 1, 1),
    ('health', 'Health', 0, 1, 1),
    ('youth', 'Youth', 0, 1, 1),
    ('emergency', 'Emergency', 0, 1, 1);


-- ============================================================================
-- SECTION 3: CAMPAIGNS
-- ============================================================================
-- 18 campaigns covering every lifecycle status
-- Amounts are in USDC wei (6 decimals): 1 USDC = 1000000

-- --------------------------------------------------------------------------
-- CAMPAIGN 1: DRAFT - 30-Day Fitness Challenge
-- Status: draft | No pledges | Fresh campaign being created
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    '30-Day Fitness Challenge',
    '30-day-fitness-challenge',
    'Complete a structured 30-day fitness program with daily workout logging and progress photos verified through AI analysis.',
    'Participant must complete at least 25 of 30 planned workouts. Progress verified via timestamped photos and fitness tracker data. Partial completion (20-24 days) results in 50% pledge return.',
    'Verify that the campaign creator has completed at least 25 out of 30 planned workout sessions by analyzing timestamped progress photos, fitness tracker data exports, and gym check-in records. Cross-reference dates and validate consistency of evidence.',
    '0101010101010101010101010101010101010101010101010101010101010101',
    'draft',
    '{}',
    0, 0.66, '0', '0', '5000000000',
    '["fitness", "health"]',
    '["personal-fitness"]',
    '/images/campaigns/fitness-challenge.jpg',
    0, 0, 0, 0,
    '[{"action":"created","at":"2026-01-28T14:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-05-01 00:00:00', NULL,
    0, 0, 0, 0,
    '2026-01-28 14:00:00', '2026-01-28 14:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 2: DRAFT - React Development Mastery
-- Status: draft | No pledges | Skill-building campaign
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'React Development Mastery',
    'react-development-mastery',
    'Complete an advanced React.js certification course and build a production-ready portfolio project within 60 days.',
    'Must earn an official React certification from a recognized platform and deploy a publicly accessible portfolio project with at least 3 features. Verified via certificate URL and live deployment.',
    'Verify the campaign creator has obtained a React.js certification by checking the certificate URL against known certification platforms and confirm a live deployed portfolio project at the provided URL with at least 3 distinct interactive features.',
    '0202020202020202020202020202020202020202020202020202020202020202',
    'draft',
    '{}',
    0, 0.66, '0', '0', '2000000000',
    '["coding", "education", "web3"]',
    '["skill-building"]',
    '/images/campaigns/react-mastery.jpg',
    0, 0, 0, 0,
    '[{"action":"created","at":"2026-02-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-06-01 00:00:00', NULL,
    0, 0, 0, 0,
    '2026-02-01 10:00:00', '2026-02-01 10:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 3: SUBMITTED - Clean Water for Rural Schools
-- Status: submitted | Awaiting admin/verifier review (Applied)
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Clean Water for Rural Schools',
    'clean-water-rural-schools',
    'Install water purification systems in 5 rural schools across Sub-Saharan Africa, providing clean drinking water to over 2000 students.',
    'Funds released upon verified installation of water purification units at each school. Installation must be confirmed via geo-tagged photographs, local government certification, and independent inspector reports. Milestone-based: 20% released per school.',
    'Verify the installation of water purification systems at five rural schools by cross-referencing geo-tagged installation photographs with school GPS coordinates, validating government certification documents, and confirming water quality test results from independent laboratories.',
    '0303030303030303030303030303030303030303030303030303030303030303',
    'submitted',
    '{}',
    0, 0.66, '0', '0', '25000000000',
    '["charity", "community"]',
    '["community-projects"]',
    '/images/campaigns/clean-water.jpg',
    0, 0, 0, 0,
    '[{"action":"created","at":"2026-01-15T09:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2026-01-22T11:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-09-01 00:00:00', NULL,
    0, 0, 0, 0,
    '2026-01-15 09:00:00', '2026-01-22 11:00:00', '2026-01-22 11:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 4: SUBMITTED - Urban Rooftop Gardens
-- Status: submitted | Created by Alice | Awaiting review (Applied)
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    'Urban Rooftop Gardens',
    'urban-rooftop-gardens',
    'Transform 10 unused urban rooftops into productive community gardens, providing fresh produce to 500 local families.',
    'Each garden installation must be documented with before/after photos, building permits, and harvest yield records. Success measured by active gardens producing food within 6 months of installation.',
    'Verify the establishment of urban rooftop gardens by analyzing before and after satellite imagery, cross-referencing building permit records from municipal databases, and validating harvest yield reports submitted by community garden managers.',
    '0404040404040404040404040404040404040404040404040404040404040404',
    'submitted',
    '{}',
    0, 0.70, '0', '0', '15000000000',
    '["sustainability", "community", "food"]',
    '["sustainable-living"]',
    '/images/campaigns/rooftop-garden.jpg',
    0, 0, 0, 0,
    '[{"action":"created","at":"2026-01-18T16:00:00Z","by":"0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"},{"action":"submitted","at":"2026-01-25T10:00:00Z","by":"0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"}]',
    '[]',
    '2026-10-01 00:00:00', NULL,
    0, 0, 0, 0,
    '2026-01-18 16:00:00', '2026-01-25 10:00:00', '2026-01-25 10:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 5: REJECTED (back to draft) - Wellness Retreat Fund
-- Status: draft | Was submitted, rejected by verifier, returned to draft
-- Demonstrates the "Rejected" workflow
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Wellness Retreat Fund',
    'wellness-retreat-fund',
    'Organize a community wellness retreat focused on mental and physical health recovery programs for burnout professionals.',
    'Retreat must host minimum 50 participants over a 3-day program. Success verified by attendance records, participant surveys, and venue booking confirmations.',
    'Verify the wellness retreat was conducted by checking venue booking confirmations against the claimed dates, reviewing anonymized participant attendance logs, and analyzing aggregated satisfaction survey results from at least 50 attendees.',
    '0505050505050505050505050505050505050505050505050505050505050505',
    'draft',
    '{}',
    0, 0.66, '0', '0', '10000000000',
    '["health"]',
    '["health-recovery"]',
    NULL,
    0, 0, 0, 0,
    '[{"action":"created","at":"2025-12-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-12-15T14:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"rejected","at":"2025-12-22T09:30:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1","reason":"Insufficient verification criteria. The AI prompt does not define measurable outcomes and the retreat success metrics are too subjective. Please revise with quantifiable health improvement indicators."}]',
    '[]',
    '2026-06-01 00:00:00', NULL,
    0, 0, 0, 0,
    '2025-12-01 10:00:00', '2025-12-22 09:30:00', '2025-12-15 14:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 6: APPROVED - NYC Marathon Charity Run
-- Status: approved | Bond posted, awaiting on-chain activation
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440006',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'NYC Marathon Charity Run',
    'nyc-marathon-charity-run',
    'Complete the 2026 NYC Marathon and raise awareness for childhood cancer research. All pledged funds go to pediatric oncology programs.',
    'Campaign creator must complete the official NYC Marathon (26.2 miles) with a verified finishing time. Proof includes official race results from NYRR, finisher medal photo, and GPS tracking data from race day.',
    'Verify marathon completion by cross-referencing the official New York Road Runners race results database for the registered participant, confirming the finishing time and bib number, and validating GPS tracking data showing the complete 26.2-mile course route.',
    '0606060606060606060606060606060606060606060606060606060606060606',
    'approved',
    '{"registrationNumber": "NYC2026-48291", "bibNumber": "12847", "registrationDate": "2025-11-15"}',
    0, 0.66, '10000000', '0', '20000000000',
    '["marathon", "charity", "fitness"]',
    '["endurance-sports"]',
    '/images/campaigns/nyc-marathon.jpg',
    0, 0, 0, 0,
    '[{"action":"created","at":"2026-01-05T12:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2026-01-10T08:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2026-01-18T15:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"}]',
    '[]',
    '2026-11-15 00:00:00', '2026-03-01 00:00:00',
    0, 0, 0, 0,
    '2026-01-05 12:00:00', '2026-01-18 15:00:00', '2026-01-10 08:00:00', '2026-01-18 15:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 7: ACTIVE - 10,000 Trees Initiative (Early Stage ~17%)
-- Status: active | Low funding, recently launched
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440007',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    '10,000 Trees Initiative',
    '10000-trees-initiative',
    'Plant 10,000 native trees across three deforested regions to restore biodiversity and offset 500 tons of carbon annually.',
    'Trees must be planted and verified alive after 60 days. Verification through drone survey imagery, planting certificates from partnered NGOs, and carbon offset registry entries. Milestone releases at 2500, 5000, 7500, and 10000 trees.',
    'Verify tree planting progress by analyzing drone survey imagery of target reforestation areas, cross-referencing planting certificates issued by partnered environmental NGOs, and confirming carbon offset registry entries on recognized platforms such as Gold Standard or Verra.',
    '0707070707070707070707070707070707070707070707070707070707070707',
    'active',
    '{"deforestationSurvey": "2025-10-15", "partnerNGOs": ["GreenEarth Foundation", "Trees for Tomorrow"], "targetRegions": ["Amazon Basin", "Borneo", "Congo"]}',
    0, 0.66, '25000000', '8500000000', '50000000000',
    '["reforestation", "climate", "carbon-offset"]',
    '["tree-planting"]',
    '/images/campaigns/trees-initiative.jpg',
    0, 0, 0, 0,
    '0x1111111111111111111111111111111111111111',
    '0xcc01000000000000000000000000000000000000000000000000000000000007',
    '0xaa01000000000000000000000000000000000000000000000000000000000007',
    '[{"action":"created","at":"2025-12-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-12-05T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-12-12T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2026-01-05T09:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-07-01 00:00:00', '2026-01-05 09:00:00',
    3, 3, 1, 0,
    '2025-12-01 10:00:00', '2026-02-05 16:00:00', '2025-12-05 10:00:00', '2025-12-12 14:00:00', '2026-01-05 09:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 8: ACTIVE - Youth Coding Bootcamp (Mid Progress ~42%)
-- Status: active | Moderate funding, growing momentum
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Youth Coding Bootcamp',
    'youth-coding-bootcamp',
    'Provide free 12-week coding bootcamp for 100 underprivileged youth aged 14-18, teaching web development fundamentals and job-ready skills.',
    'Success measured by: minimum 75 students completing the program, each producing a deployed portfolio project, and at least 30% securing internship interviews. Verified via enrollment records, project URLs, and employer confirmations.',
    'Verify bootcamp completion by checking enrollment management system records for at least 75 graduating students, confirming each has a publicly accessible deployed portfolio project, and cross-referencing internship placement data with participating employer records.',
    '0808080808080808080808080808080808080808080808080808080808080808',
    'active',
    '{"partnerSchools": 5, "enrolledStudents": 112, "bootcampVenue": "TechHub Community Center", "startDate": "2026-01-15"}',
    0, 0.66, '15000000', '12500000000', '30000000000',
    '["coding", "education", "youth"]',
    '["education-funding"]',
    '/images/campaigns/coding-bootcamp.jpg',
    1, 0, 0, 0,
    '0x2222222222222222222222222222222222222222',
    '0xcc01000000000000000000000000000000000000000000000000000000000008',
    '0xaa01000000000000000000000000000000000000000000000000000000000008',
    '[{"action":"created","at":"2025-11-15T14:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-11-20T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-12-01T09:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-12-10T12:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-06-15 00:00:00', '2025-12-10 12:00:00',
    3, 3, 1, 0,
    '2025-11-15 14:00:00', '2026-02-03 14:00:00', '2025-11-20 10:00:00', '2025-12-01 09:00:00', '2025-12-10 12:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 9: ACTIVE FEATURED - Homeless Shelter Renovation (~67%)
-- Status: active | Featured + Showcased | High engagement
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url, banner_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Homeless Shelter Renovation',
    'homeless-shelter-renovation',
    'Complete renovation of the downtown community shelter to increase capacity from 50 to 150 beds, add medical facilities, and create job training rooms.',
    'Renovation verified through building inspection certificates, updated occupancy permits, photographic evidence of completed work, and contractor completion certificates. Funds released in 3 milestones: structural (40%), interior (35%), furnishing (25%).',
    'Verify shelter renovation by confirming updated building inspection certificates with municipal records, cross-referencing contractor invoices with work completion photographs, and validating the new occupancy permit reflecting increased capacity from 50 to 150 beds.',
    '0909090909090909090909090909090909090909090909090909090909090909',
    'active',
    '{"currentCapacity": 50, "targetCapacity": 150, "buildingAddress": "742 Hope Street, Downtown", "contractorLicense": "CON-2025-48291"}',
    0, 0.70, '50000000', '67000000000', '100000000000',
    '["charity", "housing", "community"]',
    '["shelter-housing", "homelessness-reduction"]',
    '/images/campaigns/shelter-renovation.jpg',
    '/images/campaigns/shelter-renovation-banner.jpg',
    1, 1, 0, 0,
    '0x3333333333333333333333333333333333333333',
    '0xcc01000000000000000000000000000000000000000000000000000000000009',
    '0xaa01000000000000000000000000000000000000000000000000000000000009',
    '[{"action":"created","at":"2025-10-01T08:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-10-05T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-10-15T11:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-11-01T09:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"featured","at":"2025-12-01T10:00:00Z","by":"0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"}]',
    '[]',
    '2026-05-01 00:00:00', '2025-11-01 09:00:00',
    4, 4, 2, 0,
    '2025-10-01 08:00:00', '2026-02-07 09:00:00', '2025-10-05 10:00:00', '2025-10-15 11:00:00', '2025-11-01 09:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 10: ACTIVE NEAR GOAL - Rescue Animal Sanctuary (~91%)
-- Status: active | Creator: Alice | Close to fundraising goal
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-44665544000a',
    '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    'Rescue Animal Sanctuary',
    'rescue-animal-sanctuary',
    'Build a no-kill animal sanctuary that houses 200 rescued animals with veterinary care, rehabilitation, and adoption services.',
    'Sanctuary must be operational with proper licensing, housing minimum 100 animals within 6 months. Verified via veterinary inspection reports, animal intake records, county licensing, and adoption placement data.',
    'Verify sanctuary operations by confirming county animal facility licensing records, reviewing veterinary inspection reports for minimum 100 animals on-site, and cross-referencing animal intake and adoption records with county animal control databases.',
    '0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a',
    'active',
    '{"currentAnimals": 45, "facilitySize": "12 acres", "vetPartner": "PawsCare Veterinary", "license": "SANC-2025-1847"}',
    0, 0.66, '20000000', '36500000000', '40000000000',
    '["animals", "charity", "community"]',
    '["animal-rescue"]',
    '/images/campaigns/animal-sanctuary.jpg',
    1, 1, 0, 0,
    '0x4444444444444444444444444444444444444444',
    '0xcc0100000000000000000000000000000000000000000000000000000000000a',
    '0xaa0100000000000000000000000000000000000000000000000000000000000a',
    '[{"action":"created","at":"2025-09-15T10:00:00Z","by":"0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"},{"action":"submitted","at":"2025-09-20T14:00:00Z","by":"0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"},{"action":"approved","at":"2025-10-01T09:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-10-15T12:00:00Z","by":"0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"}]',
    '[]',
    '2026-04-15 00:00:00', '2025-10-15 12:00:00',
    4, 4, 1, 0,
    '2025-09-15 10:00:00', '2026-02-06 11:00:00', '2025-09-20 14:00:00', '2025-10-01 09:00:00', '2025-10-15 12:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 11: COMPLETE - Community Library Fund
-- Status: complete | Verified | Exceeded fundraising goal
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash, completion_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at, completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-44665544000b',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Community Library Fund',
    'community-library-fund',
    'Establish a free community library with 5000 books, digital resources, wifi, and reading programs serving an underserved neighborhood.',
    'Library must be open to the public with verified operating hours, catalog of 5000+ books, functional wifi, and at least 2 weekly reading programs. Verified via opening ceremony documentation, library catalog records, ISP service agreement, and program attendance logs.',
    'Verify community library establishment by confirming the physical location through municipal business records, validating the book catalog contains at least 5000 entries, checking ISP service agreements for wifi provision, and reviewing weekly reading program attendance logs.',
    '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b',
    'complete',
    '{"plannedBooks": 5000, "location": "1234 Community Drive", "buildingLease": "2025-06-01 to 2030-06-01"}',
    0, 0.66, '15000000', '15800000000', '15000000000',
    '["education", "community"]',
    '["education-funding", "community-projects"]',
    '/images/campaigns/community-library.jpg',
    0, 0, 1, 0,
    '0x5555555555555555555555555555555555555555',
    '0xcc0100000000000000000000000000000000000000000000000000000000000b',
    '0xaa0100000000000000000000000000000000000000000000000000000000000b',
    '0xdd0100000000000000000000000000000000000000000000000000000000000b',
    '[{"action":"created","at":"2025-06-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-06-05T09:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-06-15T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-07-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"completed","at":"2025-12-20T16:00:00Z","by":"system","reason":"Consensus verification passed with 91% confidence"}]',
    '[{"round":1,"type":"baseline","result":"pass","confidence":0.92},{"round":1,"type":"baseline","result":"pass","confidence":0.89},{"round":2,"type":"completion","result":"pass","confidence":0.95}]',
    '2025-12-31 00:00:00', '2025-07-01 10:00:00',
    3, 3, 1, 0,
    '2025-06-01 10:00:00', '2025-12-20 16:00:00', '2025-06-05 09:00:00', '2025-06-15 14:00:00', '2025-07-01 10:00:00', '2025-12-20 16:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 12: COMPLETE + FUNDS RELEASED - Back-to-School Supply Drive
-- Status: complete | Verified | All pledge funds released to creator
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash, completion_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at, completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-44665544000c',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Back-to-School Supply Drive',
    'back-to-school-supply-drive',
    'Distribute school supply kits to 1000 students in low-income families before the fall semester, including backpacks, notebooks, and essential supplies.',
    'Supply distribution verified through school district partnership agreements, distribution event photos with student count verification, and recipient acknowledgment forms. Minimum 800 kits distributed for full fund release.',
    'Verify school supply distribution by confirming partnership agreements with the school district, analyzing distribution event photographs with headcount verification, and validating signed recipient acknowledgment forms against the claimed 1000 student target.',
    '0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c',
    'complete',
    '{"targetStudents": 1000, "schoolDistrict": "Central Unified SD", "distributionDate": "2025-08-15"}',
    0, 0.66, '10000000', '10500000000', '10000000000',
    '["education", "charity", "youth"]',
    '["education-funding"]',
    '/images/campaigns/school-supplies.jpg',
    0, 0, 1, 0,
    '0x6666666666666666666666666666666666666666',
    '0xcc0100000000000000000000000000000000000000000000000000000000000c',
    '0xaa0100000000000000000000000000000000000000000000000000000000000c',
    '0xdd0100000000000000000000000000000000000000000000000000000000000c',
    '[{"action":"created","at":"2025-05-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-05-05T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-05-15T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-06-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"completed","at":"2025-11-01T12:00:00Z","by":"system","reason":"Consensus verification passed. 1,047 supply kits distributed."},{"action":"funds_released","at":"2025-11-05T10:00:00Z","by":"contract"}]',
    '[{"round":1,"type":"baseline","result":"pass","confidence":0.88},{"round":1,"type":"completion","result":"pass","confidence":0.91}]',
    '2025-11-15 00:00:00', '2025-06-01 10:00:00',
    3, 3, 1, 0,
    '2025-05-01 10:00:00', '2025-11-05 10:00:00', '2025-05-05 10:00:00', '2025-05-15 14:00:00', '2025-06-01 10:00:00', '2025-11-01 12:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 13: FAILED - Miracle Cure Supplements
-- Status: failed | Creator: Bob | AI verification failed | Pledges refunded
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at, completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-44665544000d',
    '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    'Miracle Cure Supplements',
    'miracle-cure-supplements',
    'Develop and distribute an all-natural supplement blend clinically proven to boost immune function by 300% based on proprietary herbal research.',
    'Must provide clinical trial results from accredited laboratory, FDA compliance documentation, and peer-reviewed publication. Distribution to 500 test participants with before/after health assessments.',
    'Verify clinical trial claims by checking FDA clinical trial registry for the referenced study, confirming laboratory accreditation through recognized bodies, and searching peer-reviewed medical journals for published results supporting the 300% immune boost claim.',
    '0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d',
    'failed',
    '{"claimedLab": "NaturePure Labs", "claimedStudy": "NPL-2025-IMM-001"}',
    0, 0.66, '10000000', '5000000000', '50000000000',
    '["health"]',
    '["health-recovery"]',
    '/images/campaigns/supplements.jpg',
    0, 0, 0, 0,
    '0x7777777777777777777777777777777777777777',
    '0xcc0100000000000000000000000000000000000000000000000000000000000d',
    '0xaa0100000000000000000000000000000000000000000000000000000000000d',
    '[{"action":"created","at":"2025-07-01T10:00:00Z","by":"0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"},{"action":"submitted","at":"2025-07-05T10:00:00Z","by":"0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"},{"action":"approved","at":"2025-07-15T09:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-08-01T10:00:00Z","by":"0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"},{"action":"failed","at":"2025-12-01T14:00:00Z","by":"system","reason":"AI verification consensus failed. No FDA clinical trial found. Laboratory accreditation unverifiable. No peer-reviewed publications found."}]',
    '[{"round":1,"type":"baseline","result":"fail","confidence":0.15},{"round":1,"type":"baseline","result":"fail","confidence":0.12}]',
    '2025-12-15 00:00:00', '2025-08-01 10:00:00',
    2, 2, 0, 1,
    '2025-07-01 10:00:00', '2025-12-01 14:00:00', '2025-07-05 10:00:00', '2025-07-15 09:00:00', '2025-08-01 10:00:00', '2025-12-01 14:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 14: DISPUTED (Active) - Carbon Offset Reforestation
-- Status: disputed | Active disputes filed | Under investigation
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    dispute_reason,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-44665544000e',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Carbon Offset Reforestation',
    'carbon-offset-reforestation',
    'Purchase and retire 1000 verified carbon credits through reforestation projects in Southeast Asia, offsetting the carbon footprint of 200 households.',
    'Carbon credits must be purchased from Gold Standard or Verra-certified projects. Verification through registry transaction records, retirement certificates, and third-party audit confirmation. Full release upon 1000 credits retired.',
    'Verify carbon credit retirement by querying Gold Standard and Verra carbon registries for the specified credit serial numbers, confirming retirement status, and cross-referencing the retirement certificates with the claimed offset amount of 1000 tons CO2.',
    '0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e',
    'disputed',
    '{"registryType": "Verra", "projectId": "VCS-2847", "targetCredits": 1000}',
    0, 0.66, '30000000', '22000000000', '75000000000',
    '["carbon-offset", "reforestation", "climate"]',
    '["carbon-reduction", "tree-planting"]',
    '/images/campaigns/carbon-offset.jpg',
    0, 0, 0, 1,
    '0x8888888888888888888888888888888888888888',
    '0xcc0100000000000000000000000000000000000000000000000000000000000e',
    '0xaa0100000000000000000000000000000000000000000000000000000000000e',
    'Multiple disputes filed: Alleged discrepancies between claimed carbon credit serial numbers and Verra registry records. Satellite imagery of claimed reforestation sites shows minimal tree cover change.',
    '[{"action":"created","at":"2025-08-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-08-05T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-08-15T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-09-01T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"disputed","at":"2026-01-15T10:00:00Z","by":"0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5","reason":"Verification discrepancy in carbon credit registry entries"}]',
    '[{"round":1,"type":"baseline","result":"pass","confidence":0.71},{"round":1,"type":"dispute","result":"fail","confidence":0.45}]',
    '2026-03-31 00:00:00', '2025-09-01 10:00:00',
    3, 3, 0, 2,
    '2025-08-01 10:00:00', '2026-01-20 10:00:00', '2025-08-05 10:00:00', '2025-08-15 14:00:00', '2025-09-01 10:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 15: FAILED (Dispute Upheld) - Phantom Charity Organization
-- Status: failed | Creator: Bob | Dispute upheld = campaign failed
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    dispute_reason, dispute_resolution,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at, completed_at
) VALUES (
    '550e8400-e29b-41d4-a716-44665544000f',
    '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    'Phantom Charity Organization',
    'phantom-charity-org',
    'Establish a registered 501(c)(3) charity providing disaster relief supplies to communities affected by natural disasters in Central America.',
    'Charity must obtain official 501(c)(3) status, distribute relief supplies to at least 3 disaster-affected communities, and provide itemized distribution records with photographic evidence.',
    'Verify charity establishment by checking IRS 501(c)(3) registry for the organization name and EIN, confirming relief supply distribution through customs records and shipping manifests, and cross-referencing community aid reports with local government disaster response records.',
    '0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f',
    'failed',
    '{"claimedEIN": "84-2847291", "claimedOrg": "Global Hope Relief"}',
    0, 0.66, '10000000', '8000000000', '30000000000',
    '["charity"]',
    '["nonprofit-fundraising"]',
    NULL,
    0, 0, 0, 1,
    '0x9999999999999999999999999999999999999999',
    '0xcc0100000000000000000000000000000000000000000000000000000000000f',
    '0xaa0100000000000000000000000000000000000000000000000000000000000f',
    'No 501(c)(3) record found for claimed organization. EIN does not match any registered entity. Photographic evidence appears to be stock photography.',
    'Dispute upheld. Investigation confirmed the claimed charity organization does not exist in IRS records. Creator bond forfeited. All pledges refunded. Voucher stakes slashed.',
    '[{"action":"created","at":"2025-08-15T10:00:00Z","by":"0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"},{"action":"submitted","at":"2025-08-20T10:00:00Z","by":"0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"},{"action":"approved","at":"2025-09-01T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-09-15T10:00:00Z","by":"0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"},{"action":"disputed","at":"2025-11-01T16:00:00Z","by":"0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5","reason":"Fraudulent organization"},{"action":"failed","at":"2025-12-15T11:00:00Z","by":"0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6","reason":"Dispute upheld. Organization does not exist."}]',
    '[{"round":1,"type":"baseline","result":"fail","confidence":0.08}]',
    '2026-02-15 00:00:00', '2025-09-15 10:00:00',
    3, 3, 1, 1,
    '2025-08-15 10:00:00', '2025-12-15 11:00:00', '2025-08-20 10:00:00', '2025-09-01 14:00:00', '2025-09-15 10:00:00', '2025-12-15 11:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 16: CANCELLED - Summer Music Festival
-- Status: cancelled | Cancelled before activation
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Summer Music Festival',
    'summer-music-festival',
    'Organize a 3-day community music festival featuring 20 local bands, food trucks, and art installations to raise funds for music education.',
    'Festival must take place over 3 consecutive days with minimum 500 attendees verified via ticket sales. At least 15 performing acts confirmed through signed contracts. Funds allocated: 60% artist fees, 25% venue/logistics, 15% music education fund.',
    'Verify music festival execution by confirming venue booking contracts for three consecutive days, cross-referencing ticket sales records with payment processor data for minimum 500 unique attendees, and validating signed performance contracts for at least 15 musical acts.',
    '1010101010101010101010101010101010101010101010101010101010101010',
    'cancelled',
    '{}',
    0, 0.66, '0', '0', '20000000000',
    '["music", "community"]',
    '["arts-creativity"]',
    '/images/campaigns/music-festival.jpg',
    0, 0, 0, 0,
    '[{"action":"created","at":"2025-10-01T12:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-10-10T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-10-20T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"cancelled","at":"2025-12-15T16:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f","reason":"Unable to secure venue due to scheduling conflicts. Will resubmit for spring dates."}]',
    '[]',
    '2026-08-01 00:00:00', NULL,
    0, 0, 0, 0,
    '2025-10-01 12:00:00', '2025-12-15 16:00:00', '2025-10-10 10:00:00', '2025-10-20 14:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 17: ACTIVE HEAVILY VOUCHED - Mental Health Awareness (~51%)
-- Status: active | Multiple vouchers endorsing legitimacy
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440011',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Mental Health Awareness Campaign',
    'mental-health-awareness',
    'Launch a nationwide mental health awareness campaign with free counseling sessions, educational workshops, and a 24/7 crisis hotline serving 10,000 people.',
    'Campaign must provide documented proof of: 24/7 hotline operational for 6 months, at least 500 counseling sessions conducted, 50 educational workshops held, and 10,000 unique individuals served. Verified via telecom records, session logs, workshop attendance, and unique caller statistics.',
    'Verify mental health campaign impact by confirming 24/7 hotline operations through telecom provider records, reviewing anonymized counseling session logs for the 500-session target, validating workshop attendance records from 50 documented events, and analyzing unique caller statistics.',
    '1111111111111111111111111111111111111111111111111111111111111111',
    'active',
    '{"hotlineNumber": "1-800-555-HOPE", "partnerOrg": "MindWell Foundation", "licensedCounselors": 12}',
    0, 0.70, '20000000', '18000000000', '35000000000',
    '["mental-health", "charity", "community"]',
    '["mental-health-support"]',
    '/images/campaigns/mental-health.jpg',
    1, 1, 0, 0,
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '0xcc01000000000000000000000000000000000000000000000000000000000011',
    '0xaa01000000000000000000000000000000000000000000000000000000000011',
    '[{"action":"created","at":"2025-10-15T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2025-10-20T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2025-11-01T14:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2025-11-15T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-06-30 00:00:00', '2025-11-15 10:00:00',
    3, 3, 3, 0,
    '2025-10-15 10:00:00', '2026-02-08 12:00:00', '2025-10-20 10:00:00', '2025-11-01 14:00:00', '2025-11-15 10:00:00'
);

-- --------------------------------------------------------------------------
-- CAMPAIGN 18: ACTIVE ENDING SOON - Emergency Food Bank Drive (~70%)
-- Status: active | Ending in 3 days | Urgency scenario
-- --------------------------------------------------------------------------
INSERT OR IGNORE INTO campaigns (
    campaign_id, creator_address, name, slug, purpose, rules_and_resolution,
    prompt, prompt_hash, status, baseline_data, privacy_mode,
    consensus_threshold, creator_bond, amount_pledged, fundraising_goal,
    tags, categories, image_url,
    is_showcased, is_featured, is_verified, is_disputed,
    escrow_address, creation_tx_hash, activation_tx_hash,
    history, consensus_results,
    end_date, start_date,
    pledge_count, unique_pledgers, voucher_count, disputer_count,
    created_at, updated_at, submitted_at, approved_at, activated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440012',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'Emergency Food Bank Drive',
    'emergency-food-bank-drive',
    'Collect and distribute 50,000 meals to families affected by recent severe weather events through a network of 15 community food banks.',
    'Distribution verified via food bank intake records, weight-based donation tracking, and delivery confirmation receipts from each of the 15 partner food banks. Target: 50,000 meal equivalents.',
    'Verify emergency food distribution by cross-referencing donation weight records from each of the 15 partner food banks, confirming delivery receipts with logistics provider manifests, and calculating total meal equivalents against the 50,000 meal target using standard conversion factors.',
    '1212121212121212121212121212121212121212121212121212121212121212',
    'active',
    '{"partnerFoodBanks": 15, "targetMeals": 50000, "disasterReference": "Winter Storm Elara 2026"}',
    0, 0.66, '15000000', '14000000000', '20000000000',
    '["food", "emergency", "charity", "community"]',
    '["food-security"]',
    '/images/campaigns/food-bank.jpg',
    1, 0, 0, 0,
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    '0xcc01000000000000000000000000000000000000000000000000000000000012',
    '0xaa01000000000000000000000000000000000000000000000000000000000012',
    '[{"action":"created","at":"2026-01-10T08:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"submitted","at":"2026-01-12T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"},{"action":"approved","at":"2026-01-15T09:00:00Z","by":"0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1"},{"action":"activated","at":"2026-01-20T10:00:00Z","by":"0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f"}]',
    '[]',
    '2026-02-12 23:59:59', '2026-01-20 10:00:00',
    3, 3, 1, 0,
    '2026-01-10 08:00:00', '2026-02-08 14:00:00', '2026-01-12 10:00:00', '2026-01-15 09:00:00', '2026-01-20 10:00:00'
);


-- ============================================================================
-- SECTION 4: CAMPAIGN CATEGORIES (Junction Table)
-- ============================================================================

INSERT OR IGNORE INTO campaign_categories (campaign_id, category_id, is_primary) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'personal-fitness', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'skill-building', 1),
    ('550e8400-e29b-41d4-a716-446655440003', 'community-projects', 1),
    ('550e8400-e29b-41d4-a716-446655440004', 'sustainable-living', 1),
    ('550e8400-e29b-41d4-a716-446655440005', 'health-recovery', 1),
    ('550e8400-e29b-41d4-a716-446655440006', 'endurance-sports', 1),
    ('550e8400-e29b-41d4-a716-446655440007', 'tree-planting', 1),
    ('550e8400-e29b-41d4-a716-446655440008', 'education-funding', 1),
    ('550e8400-e29b-41d4-a716-446655440009', 'shelter-housing', 1),
    ('550e8400-e29b-41d4-a716-446655440009', 'homelessness-reduction', 0),
    ('550e8400-e29b-41d4-a716-44665544000a', 'animal-rescue', 1),
    ('550e8400-e29b-41d4-a716-44665544000b', 'education-funding', 1),
    ('550e8400-e29b-41d4-a716-44665544000b', 'community-projects', 0),
    ('550e8400-e29b-41d4-a716-44665544000c', 'education-funding', 1),
    ('550e8400-e29b-41d4-a716-44665544000d', 'health-recovery', 1),
    ('550e8400-e29b-41d4-a716-44665544000e', 'carbon-reduction', 1),
    ('550e8400-e29b-41d4-a716-44665544000e', 'tree-planting', 0),
    ('550e8400-e29b-41d4-a716-44665544000f', 'nonprofit-fundraising', 1),
    ('550e8400-e29b-41d4-a716-446655440010', 'arts-creativity', 1),
    ('550e8400-e29b-41d4-a716-446655440011', 'mental-health-support', 1),
    ('550e8400-e29b-41d4-a716-446655440012', 'food-security', 1);


-- ============================================================================
-- SECTION 5: CAMPAIGN TAGS (Junction Table)
-- ============================================================================

INSERT OR IGNORE INTO campaign_tags (campaign_id, tag_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'fitness'),
    ('550e8400-e29b-41d4-a716-446655440001', 'health'),
    ('550e8400-e29b-41d4-a716-446655440002', 'coding'),
    ('550e8400-e29b-41d4-a716-446655440002', 'education'),
    ('550e8400-e29b-41d4-a716-446655440002', 'web3'),
    ('550e8400-e29b-41d4-a716-446655440003', 'charity'),
    ('550e8400-e29b-41d4-a716-446655440003', 'community'),
    ('550e8400-e29b-41d4-a716-446655440004', 'sustainability'),
    ('550e8400-e29b-41d4-a716-446655440004', 'community'),
    ('550e8400-e29b-41d4-a716-446655440004', 'food'),
    ('550e8400-e29b-41d4-a716-446655440005', 'health'),
    ('550e8400-e29b-41d4-a716-446655440006', 'marathon'),
    ('550e8400-e29b-41d4-a716-446655440006', 'charity'),
    ('550e8400-e29b-41d4-a716-446655440006', 'fitness'),
    ('550e8400-e29b-41d4-a716-446655440007', 'reforestation'),
    ('550e8400-e29b-41d4-a716-446655440007', 'climate'),
    ('550e8400-e29b-41d4-a716-446655440007', 'carbon-offset'),
    ('550e8400-e29b-41d4-a716-446655440008', 'coding'),
    ('550e8400-e29b-41d4-a716-446655440008', 'education'),
    ('550e8400-e29b-41d4-a716-446655440008', 'youth'),
    ('550e8400-e29b-41d4-a716-446655440009', 'charity'),
    ('550e8400-e29b-41d4-a716-446655440009', 'housing'),
    ('550e8400-e29b-41d4-a716-446655440009', 'community'),
    ('550e8400-e29b-41d4-a716-44665544000a', 'animals'),
    ('550e8400-e29b-41d4-a716-44665544000a', 'charity'),
    ('550e8400-e29b-41d4-a716-44665544000a', 'community'),
    ('550e8400-e29b-41d4-a716-44665544000b', 'education'),
    ('550e8400-e29b-41d4-a716-44665544000b', 'community'),
    ('550e8400-e29b-41d4-a716-44665544000c', 'education'),
    ('550e8400-e29b-41d4-a716-44665544000c', 'charity'),
    ('550e8400-e29b-41d4-a716-44665544000c', 'youth'),
    ('550e8400-e29b-41d4-a716-44665544000d', 'health'),
    ('550e8400-e29b-41d4-a716-44665544000e', 'carbon-offset'),
    ('550e8400-e29b-41d4-a716-44665544000e', 'reforestation'),
    ('550e8400-e29b-41d4-a716-44665544000e', 'climate'),
    ('550e8400-e29b-41d4-a716-44665544000f', 'charity'),
    ('550e8400-e29b-41d4-a716-446655440010', 'music'),
    ('550e8400-e29b-41d4-a716-446655440010', 'community'),
    ('550e8400-e29b-41d4-a716-446655440011', 'mental-health'),
    ('550e8400-e29b-41d4-a716-446655440011', 'charity'),
    ('550e8400-e29b-41d4-a716-446655440011', 'community'),
    ('550e8400-e29b-41d4-a716-446655440012', 'food'),
    ('550e8400-e29b-41d4-a716-446655440012', 'emergency'),
    ('550e8400-e29b-41d4-a716-446655440012', 'charity'),
    ('550e8400-e29b-41d4-a716-446655440012', 'community');


-- ============================================================================
-- SECTION 6: PLEDGES
-- ============================================================================
-- 34 pledges across 11 campaigns, covering all pledge statuses:
-- active, confirmed, released, refunded
-- Amounts in USDC wei (6 decimals)

-- Campaign 7: Active Trees (8500 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000001', '550e8400-e29b-41d4-a716-446655440007',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '5000000000',
     'Let''s grow a forest together! Proud to support reforestation.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000001',
     17100000, '2026-01-10 14:00:00', 12, '2026-01-10 14:05:00',
     0, '2026-01-10 14:00:00', '2026-01-10 14:05:00', '2026-01-10 14:00:00'),

    ('10000000-0000-4000-a000-000000000002', '550e8400-e29b-41d4-a716-446655440007',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '2000000000',
     'Trees are the lungs of our planet.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000002',
     17200000, '2026-01-18 10:00:00', 12, '2026-01-18 10:04:00',
     0, '2026-01-18 10:00:00', '2026-01-18 10:04:00', '2026-01-18 10:00:00'),

    ('10000000-0000-4000-a000-000000000003', '550e8400-e29b-41d4-a716-446655440007',
     '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', '1500000000',
     NULL, 'confirmed',
     '0xee01000000000000000000000000000000000000000000000000000000000003',
     17800000, '2026-02-05 16:00:00', 6, '2026-02-05 16:02:00',
     0, '2026-02-05 16:00:00', '2026-02-05 16:02:00', '2026-02-05 16:00:00');

-- Campaign 8: Active Coding (12500 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000004', '550e8400-e29b-41d4-a716-446655440008',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '5000000000',
     'Education changes everything. Happy to support these young coders!', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000004',
     16200000, '2025-12-15 11:00:00', 12, '2025-12-15 11:04:00',
     0, '2025-12-15 11:00:00', '2025-12-15 11:04:00', '2025-12-15 11:00:00'),

    ('10000000-0000-4000-a000-000000000005', '550e8400-e29b-41d4-a716-446655440008',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '4000000000',
     'Every kid deserves a chance to learn to code.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000005',
     16500000, '2025-12-28 14:00:00', 12, '2025-12-28 14:04:00',
     0, '2025-12-28 14:00:00', '2025-12-28 14:04:00', '2025-12-28 14:00:00'),

    ('10000000-0000-4000-a000-000000000006', '550e8400-e29b-41d4-a716-446655440008',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '3500000000',
     NULL, 'confirmed',
     '0xee01000000000000000000000000000000000000000000000000000000000006',
     17600000, '2026-01-28 09:00:00', 8, '2026-01-28 09:03:00',
     0, '2026-01-28 09:00:00', '2026-01-28 09:03:00', '2026-01-28 09:00:00');

-- Campaign 9: Active Featured Shelter (67000 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000007', '550e8400-e29b-41d4-a716-446655440009',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '25000000000',
     'Everyone deserves a safe place to sleep. This project is transformative.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000007',
     15500000, '2025-11-10 10:00:00', 12, '2025-11-10 10:04:00',
     0, '2025-11-10 10:00:00', '2025-11-10 10:04:00', '2025-11-10 10:00:00'),

    ('10000000-0000-4000-a000-000000000008', '550e8400-e29b-41d4-a716-446655440009',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '17000000000',
     'Shelters save lives. Proud to contribute.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000008',
     15800000, '2025-11-22 15:00:00', 12, '2025-11-22 15:04:00',
     0, '2025-11-22 15:00:00', '2025-11-22 15:04:00', '2025-11-22 15:00:00'),

    ('10000000-0000-4000-a000-000000000009', '550e8400-e29b-41d4-a716-446655440009',
     '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', '15000000000',
     NULL, 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000009',
     16100000, '2025-12-10 09:00:00', 12, '2025-12-10 09:04:00',
     0, '2025-12-10 09:00:00', '2025-12-10 09:04:00', '2025-12-10 09:00:00'),

    ('10000000-0000-4000-a000-000000000010', '550e8400-e29b-41d4-a716-446655440009',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '10000000000',
     'Glad this campaign is featured. Well deserved!', 'confirmed',
     '0xee01000000000000000000000000000000000000000000000000000000000010',
     17700000, '2026-02-01 11:00:00', 6, '2026-02-01 11:03:00',
     0, '2026-02-01 11:00:00', '2026-02-01 11:03:00', '2026-02-01 11:00:00');

-- Campaign 10: Active Near Goal Animal (36500 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000011', '550e8400-e29b-41d4-a716-44665544000a',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '15000000000',
     'Animals need our help. So close to the goal!', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000011',
     15600000, '2025-11-05 14:00:00', 12, '2025-11-05 14:04:00',
     0, '2025-11-05 14:00:00', '2025-11-05 14:04:00', '2025-11-05 14:00:00'),

    ('10000000-0000-4000-a000-000000000012', '550e8400-e29b-41d4-a716-44665544000a',
     '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', '10000000000',
     NULL, 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000012',
     16000000, '2025-12-05 10:00:00', 12, '2025-12-05 10:04:00',
     0, '2025-12-05 10:00:00', '2025-12-05 10:04:00', '2025-12-05 10:00:00'),

    ('10000000-0000-4000-a000-000000000013', '550e8400-e29b-41d4-a716-44665544000a',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '7500000000',
     'Rescue animals deserve love and care.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000013',
     16800000, '2026-01-15 16:00:00', 12, '2026-01-15 16:04:00',
     0, '2026-01-15 16:00:00', '2026-01-15 16:04:00', '2026-01-15 16:00:00'),

    ('10000000-0000-4000-a000-000000000014', '550e8400-e29b-41d4-a716-44665544000a',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '4000000000',
     'Almost there! Let''s push to the goal!', 'confirmed',
     '0xee01000000000000000000000000000000000000000000000000000000000014',
     17900000, '2026-02-06 11:00:00', 4, '2026-02-06 11:02:00',
     0, '2026-02-06 11:00:00', '2026-02-06 11:02:00', '2026-02-06 11:00:00');

-- Campaign 11: Complete Library (15800 USDC total - all released)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    release_tx_hash, released_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000015', '550e8400-e29b-41d4-a716-44665544000b',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '6000000000',
     'Knowledge is the best investment.', 'released',
     '0xee01000000000000000000000000000000000000000000000000000000000015',
     14000000, '2025-07-15 10:00:00', 12, '2025-07-15 10:04:00',
     '0x1101000000000000000000000000000000000000000000000000000000000015', '2025-12-22 10:00:00',
     0, '2025-07-15 10:00:00', '2025-12-22 10:00:00', '2025-07-15 10:00:00'),

    ('10000000-0000-4000-a000-000000000016', '550e8400-e29b-41d4-a716-44665544000b',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '5000000000',
     'Libraries are the heartbeat of communities.', 'released',
     '0xee01000000000000000000000000000000000000000000000000000000000016',
     14200000, '2025-08-01 14:00:00', 12, '2025-08-01 14:04:00',
     '0x1101000000000000000000000000000000000000000000000000000000000016', '2025-12-22 10:00:00',
     0, '2025-08-01 14:00:00', '2025-12-22 10:00:00', '2025-08-01 14:00:00'),

    ('10000000-0000-4000-a000-000000000017', '550e8400-e29b-41d4-a716-44665544000b',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '4800000000',
     NULL, 'released',
     '0xee01000000000000000000000000000000000000000000000000000000000017',
     14500000, '2025-08-20 09:00:00', 12, '2025-08-20 09:04:00',
     '0x1101000000000000000000000000000000000000000000000000000000000017', '2025-12-22 10:00:00',
     0, '2025-08-20 09:00:00', '2025-12-22 10:00:00', '2025-08-20 09:00:00');

-- Campaign 12: Complete Released School (10500 USDC total - all released)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    release_tx_hash, released_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000018', '550e8400-e29b-41d4-a716-44665544000c',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '5000000000',
     'Every child deserves school supplies.', 'released',
     '0xee01000000000000000000000000000000000000000000000000000000000018',
     13500000, '2025-06-20 10:00:00', 12, '2025-06-20 10:04:00',
     '0x1101000000000000000000000000000000000000000000000000000000000018', '2025-11-03 10:00:00',
     0, '2025-06-20 10:00:00', '2025-11-03 10:00:00', '2025-06-20 10:00:00'),

    ('10000000-0000-4000-a000-000000000019', '550e8400-e29b-41d4-a716-44665544000c',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '3500000000',
     'Happy to help prepare kids for school!', 'released',
     '0xee01000000000000000000000000000000000000000000000000000000000019',
     13800000, '2025-07-10 15:00:00', 12, '2025-07-10 15:04:00',
     '0x1101000000000000000000000000000000000000000000000000000000000019', '2025-11-03 10:00:00',
     0, '2025-07-10 15:00:00', '2025-11-03 10:00:00', '2025-07-10 15:00:00'),

    ('10000000-0000-4000-a000-000000000020', '550e8400-e29b-41d4-a716-44665544000c',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '2000000000',
     NULL, 'released',
     '0xee01000000000000000000000000000000000000000000000000000000000020',
     14100000, '2025-08-02 11:00:00', 12, '2025-08-02 11:04:00',
     '0x1101000000000000000000000000000000000000000000000000000000000020', '2025-11-03 10:00:00',
     1, '2025-08-02 11:00:00', '2025-11-03 10:00:00', '2025-08-02 11:00:00');

-- Campaign 13: Failed Miracle (5000 USDC total - all refunded)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    refund_tx_hash, refunded_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000021', '550e8400-e29b-41d4-a716-44665544000d',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '3000000000',
     'Hoping this is legit.', 'refunded',
     '0xee01000000000000000000000000000000000000000000000000000000000021',
     14600000, '2025-09-01 10:00:00', 12, '2025-09-01 10:04:00',
     '0x2201000000000000000000000000000000000000000000000000000000000021', '2025-12-05 10:00:00',
     0, '2025-09-01 10:00:00', '2025-12-05 10:00:00', '2025-09-01 10:00:00'),

    ('10000000-0000-4000-a000-000000000022', '550e8400-e29b-41d4-a716-44665544000d',
     '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', '2000000000',
     NULL, 'refunded',
     '0xee01000000000000000000000000000000000000000000000000000000000022',
     14800000, '2025-09-15 14:00:00', 12, '2025-09-15 14:04:00',
     '0x2201000000000000000000000000000000000000000000000000000000000022', '2025-12-05 10:00:00',
     0, '2025-09-15 14:00:00', '2025-12-05 10:00:00', '2025-09-15 14:00:00');

-- Campaign 14: Disputed Carbon (22000 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000023', '550e8400-e29b-41d4-a716-44665544000e',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '10000000000',
     'Carbon offsets are critical for our future.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000023',
     15000000, '2025-09-20 10:00:00', 12, '2025-09-20 10:04:00',
     0, '2025-09-20 10:00:00', '2025-09-20 10:04:00', '2025-09-20 10:00:00'),

    ('10000000-0000-4000-a000-000000000024', '550e8400-e29b-41d4-a716-44665544000e',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '7000000000',
     NULL, 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000024',
     15300000, '2025-10-10 11:00:00', 12, '2025-10-10 11:04:00',
     0, '2025-10-10 11:00:00', '2025-10-10 11:04:00', '2025-10-10 11:00:00'),

    ('10000000-0000-4000-a000-000000000025', '550e8400-e29b-41d4-a716-44665544000e',
     '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', '5000000000',
     'Supporting climate action.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000025',
     15700000, '2025-11-15 09:00:00', 12, '2025-11-15 09:04:00',
     0, '2025-11-15 09:00:00', '2025-11-15 09:04:00', '2025-11-15 09:00:00');

-- Campaign 15: Failed Phantom (8000 USDC total - all refunded)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    refund_tx_hash, refunded_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000026', '550e8400-e29b-41d4-a716-44665544000f',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '4000000000',
     'Supporting disaster relief efforts.', 'refunded',
     '0xee01000000000000000000000000000000000000000000000000000000000026',
     15100000, '2025-10-01 10:00:00', 12, '2025-10-01 10:04:00',
     '0x2201000000000000000000000000000000000000000000000000000000000026', '2025-12-18 10:00:00',
     0, '2025-10-01 10:00:00', '2025-12-18 10:00:00', '2025-10-01 10:00:00'),

    ('10000000-0000-4000-a000-000000000027', '550e8400-e29b-41d4-a716-44665544000f',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '2500000000',
     NULL, 'refunded',
     '0xee01000000000000000000000000000000000000000000000000000000000027',
     15200000, '2025-10-05 14:00:00', 12, '2025-10-05 14:04:00',
     '0x2201000000000000000000000000000000000000000000000000000000000027', '2025-12-18 10:00:00',
     0, '2025-10-05 14:00:00', '2025-12-18 10:00:00', '2025-10-05 14:00:00'),

    ('10000000-0000-4000-a000-000000000028', '550e8400-e29b-41d4-a716-44665544000f',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '1500000000',
     'Hope this helps those in need.', 'refunded',
     '0xee01000000000000000000000000000000000000000000000000000000000028',
     15400000, '2025-10-20 09:00:00', 12, '2025-10-20 09:04:00',
     '0x2201000000000000000000000000000000000000000000000000000000000028', '2025-12-18 10:00:00',
     0, '2025-10-20 09:00:00', '2025-12-18 10:00:00', '2025-10-20 09:00:00');

-- Campaign 17: Active Mental Health (18000 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000029', '550e8400-e29b-41d4-a716-446655440011',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '8000000000',
     'Mental health matters. Break the stigma.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000029',
     15900000, '2025-11-25 10:00:00', 12, '2025-11-25 10:04:00',
     0, '2025-11-25 10:00:00', '2025-11-25 10:04:00', '2025-11-25 10:00:00'),

    ('10000000-0000-4000-a000-000000000030', '550e8400-e29b-41d4-a716-446655440011',
     '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', '5000000000',
     NULL, 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000030',
     16300000, '2025-12-18 14:00:00', 12, '2025-12-18 14:04:00',
     0, '2025-12-18 14:00:00', '2025-12-18 14:04:00', '2025-12-18 14:00:00'),

    ('10000000-0000-4000-a000-000000000031', '550e8400-e29b-41d4-a716-446655440011',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '5000000000',
     'Everyone deserves access to mental health support.', 'confirmed',
     '0xee01000000000000000000000000000000000000000000000000000000000031',
     17500000, '2026-01-25 16:00:00', 6, '2026-01-25 16:03:00',
     0, '2026-01-25 16:00:00', '2026-01-25 16:03:00', '2026-01-25 16:00:00');

-- Campaign 18: Active Ending Soon Food (14000 USDC total)
INSERT OR IGNORE INTO pledges (
    pledge_id, campaign_id, pledger_address, amount, message, status,
    tx_hash, block_number, block_timestamp, confirmations, confirmed_at,
    is_anonymous, created_at, updated_at, pledged_at
) VALUES
    ('10000000-0000-4000-a000-000000000032', '550e8400-e29b-41d4-a716-446655440012',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', '6000000000',
     'Emergency food relief is urgent. Let''s make this happen!', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000032',
     17300000, '2026-01-22 08:00:00', 12, '2026-01-22 08:04:00',
     0, '2026-01-22 08:00:00', '2026-01-22 08:04:00', '2026-01-22 08:00:00'),

    ('10000000-0000-4000-a000-000000000033', '550e8400-e29b-41d4-a716-446655440012',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '5000000000',
     'No one should go hungry.', 'active',
     '0xee01000000000000000000000000000000000000000000000000000000000033',
     17400000, '2026-01-25 10:00:00', 12, '2026-01-25 10:04:00',
     0, '2026-01-25 10:00:00', '2026-01-25 10:04:00', '2026-01-25 10:00:00'),

    ('10000000-0000-4000-a000-000000000034', '550e8400-e29b-41d4-a716-446655440012',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '3000000000',
     NULL, 'confirmed',
     '0xee01000000000000000000000000000000000000000000000000000000000034',
     17850000, '2026-02-08 14:00:00', 4, '2026-02-08 14:02:00',
     0, '2026-02-08 14:00:00', '2026-02-08 14:02:00', '2026-02-08 14:00:00');


-- ============================================================================
-- SECTION 7: VOUCHERS
-- ============================================================================
-- 12 vouchers covering: active, released, slashed statuses
-- UNIQUE constraint: one voucher per (campaign_id, voucher_address)

-- C7: Trees - 1 active voucher
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, block_number, block_timestamp,
    reward_earned, created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000001', '550e8400-e29b-41d4-a716-446655440007',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '5000000000', 'active',
     'I''ve verified the NGO partnerships. This is a legitimate reforestation project.',
     '0xff01000000000000000000000000000000000000000000000000000000000001',
     17150000, '2026-01-12 10:00:00',
     '0', '2026-01-12 10:00:00', '2026-01-12 10:00:00', '2026-01-12 10:00:00');

-- C8: Coding - 1 active voucher
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, block_number, block_timestamp,
    reward_earned, created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000002', '550e8400-e29b-41d4-a716-446655440008',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '3000000000', 'active',
     'Great program. I know the instructors personally - top tier educators.',
     '0xff01000000000000000000000000000000000000000000000000000000000002',
     16600000, '2026-01-02 14:00:00',
     '0', '2026-01-02 14:00:00', '2026-01-02 14:00:00', '2026-01-02 14:00:00');

-- C9: Shelter - 2 active vouchers
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, block_number, block_timestamp,
    reward_earned, created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000003', '550e8400-e29b-41d4-a716-446655440009',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '10000000000', 'active',
     'The shelter renovation plans have been verified with the city building department. This project is real and needed.',
     '0xff01000000000000000000000000000000000000000000000000000000000003',
     15600000, '2025-11-08 09:00:00',
     '0', '2025-11-08 09:00:00', '2025-11-08 09:00:00', '2025-11-08 09:00:00'),

    ('20000000-0000-4000-a000-000000000004', '550e8400-e29b-41d4-a716-446655440009',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '5000000000', 'active',
     'Visited the shelter site. Renovation is underway and on schedule.',
     '0xff01000000000000000000000000000000000000000000000000000000000004',
     16400000, '2025-12-22 15:00:00',
     '0', '2025-12-22 15:00:00', '2025-12-22 15:00:00', '2025-12-22 15:00:00');

-- C10: Animal - 1 active voucher
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, block_number, block_timestamp,
    reward_earned, created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000005', '550e8400-e29b-41d4-a716-44665544000a',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '5000000000', 'active',
     'I know Alice personally. She has years of experience in animal rescue.',
     '0xff01000000000000000000000000000000000000000000000000000000000005',
     16700000, '2026-01-10 10:00:00',
     '0', '2026-01-10 10:00:00', '2026-01-10 10:00:00', '2026-01-10 10:00:00');

-- C11: Library - 1 released voucher (campaign complete)
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, release_tx_hash,
    block_number, block_timestamp,
    reward_earned, reward_claimed, reward_claimed_at,
    created_at, updated_at, vouched_at, released_at
) VALUES
    ('20000000-0000-4000-a000-000000000006', '550e8400-e29b-41d4-a716-44665544000b',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '3000000000', 'released',
     'Verified the building lease and book inventory. Legitimate community project.',
     '0xff01000000000000000000000000000000000000000000000000000000000006',
     '0x1101000000000000000000000000000000000000000000000000000000000106',
     14300000, '2025-08-05 10:00:00',
     '150000000', '150000000', '2025-12-25 10:00:00',
     '2025-08-05 10:00:00', '2025-12-25 10:00:00', '2025-08-05 10:00:00', '2025-12-22 10:00:00');

-- C12: School - 1 released voucher (campaign complete)
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, release_tx_hash,
    block_number, block_timestamp,
    reward_earned, reward_claimed, reward_claimed_at,
    created_at, updated_at, vouched_at, released_at
) VALUES
    ('20000000-0000-4000-a000-000000000007', '550e8400-e29b-41d4-a716-44665544000c',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '2000000000', 'released',
     'School district partnership confirmed. Supply orders verified.',
     '0xff01000000000000000000000000000000000000000000000000000000000007',
     '0x1101000000000000000000000000000000000000000000000000000000000107',
     13600000, '2025-06-25 11:00:00',
     '100000000', '100000000', '2025-11-05 10:00:00',
     '2025-06-25 11:00:00', '2025-11-05 10:00:00', '2025-06-25 11:00:00', '2025-11-03 10:00:00');

-- C15: Phantom - 1 slashed voucher (dispute upheld, fraudulent campaign)
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, slash_tx_hash,
    block_number, block_timestamp,
    slash_amount, slash_reason, slashed_at,
    created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000008', '550e8400-e29b-41d4-a716-44665544000f',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '3000000000', 'slashed',
     'Organization appears legitimate based on initial review.',
     '0xff01000000000000000000000000000000000000000000000000000000000008',
     '0xbb01000000000000000000000000000000000000000000000000000000000008',
     15150000, '2025-10-01 10:00:00',
     '1500000000', 'Vouched for fraudulent campaign. Organization does not exist in IRS records.', '2025-12-15 11:00:00',
     '2025-10-01 10:00:00', '2025-12-15 11:00:00', '2025-10-01 10:00:00');

-- C17: Mental Health - 3 active vouchers (heavily vouched)
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, block_number, block_timestamp,
    reward_earned, created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000009', '550e8400-e29b-41d4-a716-446655440011',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '8000000000', 'active',
     'The MindWell Foundation is a reputable organization. I have personally verified their counseling team credentials and hotline infrastructure.',
     '0xff01000000000000000000000000000000000000000000000000000000000009',
     16000000, '2025-12-01 10:00:00',
     '0', '2025-12-01 10:00:00', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),

    ('20000000-0000-4000-a000-000000000010', '550e8400-e29b-41d4-a716-446655440011',
     '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8', '5000000000', 'active',
     'Called the hotline myself - it works. Professional and compassionate service.',
     '0xff01000000000000000000000000000000000000000000000000000000000010',
     16700000, '2026-01-08 15:00:00',
     '0', '2026-01-08 15:00:00', '2026-01-08 15:00:00', '2026-01-08 15:00:00'),

    ('20000000-0000-4000-a000-000000000011', '550e8400-e29b-41d4-a716-446655440011',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', '3000000000', 'active',
     'Mental health is a cause close to my heart. This team is doing amazing work.',
     '0xff01000000000000000000000000000000000000000000000000000000000011',
     17000000, '2026-01-18 10:00:00',
     '0', '2026-01-18 10:00:00', '2026-01-18 10:00:00', '2026-01-18 10:00:00');

-- C18: Food Bank - 1 active voucher
INSERT OR IGNORE INTO vouchers (
    voucher_id, campaign_id, voucher_address, amount, status,
    endorsement_message, stake_tx_hash, block_number, block_timestamp,
    reward_earned, created_at, updated_at, vouched_at
) VALUES
    ('20000000-0000-4000-a000-000000000012', '550e8400-e29b-41d4-a716-446655440012',
     '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', '4000000000', 'active',
     'Food bank partnerships verified. Distribution logistics are sound.',
     '0xff01000000000000000000000000000000000000000000000000000000000012',
     17350000, '2026-01-23 09:00:00',
     '0', '2026-01-23 09:00:00', '2026-01-23 09:00:00', '2026-01-23 09:00:00');


-- ============================================================================
-- SECTION 8: DISPUTERS
-- ============================================================================
-- 4 disputes covering: pending, active, upheld statuses

-- C13: Failed Miracle - Dispute UPHELD (campaign failed as a result)
INSERT OR IGNORE INTO disputers (
    disputer_id, campaign_id, disputer_address, amount, status,
    reason, dispute_type, evidence, stake_tx_hash,
    block_number, block_timestamp,
    resolution_outcome, resolution_notes, resolved_by, resolved_at,
    reward_earned, stake_returned,
    expires_at, created_at, updated_at, disputed_at
) VALUES (
    '30000000-0000-4000-a000-000000000001',
    '550e8400-e29b-41d4-a716-44665544000d',
    '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    '5000000000', 'upheld',
    'The claimed laboratory "NaturePure Labs" does not exist in any accredited laboratory registry. The clinical trial number NPL-2025-IMM-001 is not found in the FDA clinical trials database. The product makes unsubstantiated health claims.',
    'fraud',
    '[{"type":"document","description":"FDA clinical trial search results showing no matching records","url":"ipfs://QmFDASearch001"},{"type":"document","description":"Accredited lab registry search showing no NaturePure Labs","url":"ipfs://QmLabSearch001"}]',
    '0xbb01000000000000000000000000000000000000000000000000000000000001',
    15000000, '2025-10-15 10:00:00',
    'upheld', 'Investigation confirmed: No FDA clinical trial exists. No accredited laboratory found. Campaign creator bond forfeit.', '0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', '2025-11-30 14:00:00',
    '2500000000', '5000000000',
    '2025-12-15 10:00:00', '2025-10-15 10:00:00', '2025-11-30 14:00:00', '2025-10-15 10:00:00'
);

-- C14: Disputed Carbon - Dispute ACTIVE (under investigation)
INSERT OR IGNORE INTO disputers (
    disputer_id, campaign_id, disputer_address, amount, status,
    reason, dispute_type, evidence, stake_tx_hash,
    block_number, block_timestamp,
    expires_at, created_at, updated_at, disputed_at
) VALUES (
    '30000000-0000-4000-a000-000000000002',
    '550e8400-e29b-41d4-a716-44665544000e',
    '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    '7000000000', 'active',
    'The carbon credit serial numbers provided by the campaign do not match any entries in the Verra VCS registry for project VCS-2847. Satellite imagery from Sentinel-2 shows no significant reforestation activity in the claimed areas over the past 12 months.',
    'verification_failure',
    '[{"type":"document","description":"Verra registry search showing no matching serial numbers","url":"ipfs://QmVerraSearch001"},{"type":"image","description":"Sentinel-2 satellite comparison imagery showing no tree cover change","url":"ipfs://QmSatellite001"}]',
    '0xbb01000000000000000000000000000000000000000000000000000000000002',
    17100000, '2026-01-15 10:00:00',
    '2026-02-22 10:00:00', '2026-01-15 10:00:00', '2026-01-20 10:00:00', '2026-01-15 10:00:00'
);

-- C14: Disputed Carbon - Second dispute PENDING
INSERT OR IGNORE INTO disputers (
    disputer_id, campaign_id, disputer_address, amount, status,
    reason, dispute_type, evidence, stake_tx_hash,
    block_number, block_timestamp,
    expires_at, created_at, updated_at, disputed_at
) VALUES (
    '30000000-0000-4000-a000-000000000003',
    '550e8400-e29b-41d4-a716-44665544000e',
    '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    '5000000000', 'pending',
    'The campaign claims to offset 500 tons of CO2 but the math does not add up. At average carbon sequestration rates, 1000 credits from the claimed project type would only offset approximately 200 tons. The campaign is misrepresenting its environmental impact.',
    'misrepresentation',
    '[{"type":"document","description":"Carbon sequestration calculation analysis","url":"ipfs://QmCarbonCalc001"}]',
    '0xbb01000000000000000000000000000000000000000000000000000000000003',
    17650000, '2026-01-30 15:00:00',
    '2026-03-01 15:00:00', '2026-01-30 15:00:00', '2026-01-30 15:00:00', '2026-01-30 15:00:00'
);

-- C15: Phantom Charity - Dispute UPHELD (campaign failed)
INSERT OR IGNORE INTO disputers (
    disputer_id, campaign_id, disputer_address, amount, status,
    reason, dispute_type, evidence, stake_tx_hash,
    block_number, block_timestamp,
    resolution_outcome, resolution_notes, resolved_by, resolved_at,
    reward_earned, stake_returned,
    expires_at, created_at, updated_at, disputed_at
) VALUES (
    '30000000-0000-4000-a000-000000000004',
    '550e8400-e29b-41d4-a716-44665544000f',
    '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    '8000000000', 'upheld',
    'The claimed 501(c)(3) organization "Global Hope Relief" with EIN 84-2847291 does not exist in the IRS Exempt Organizations database. The photographs used in the campaign appear to be stock images sourced from multiple commercial image libraries.',
    'fraud',
    '[{"type":"document","description":"IRS EO database search showing no matching organization","url":"ipfs://QmIRSSearch001"},{"type":"document","description":"Reverse image search results showing stock photo sources","url":"ipfs://QmImageSearch001"},{"type":"document","description":"State charity registration search with no results","url":"ipfs://QmStateSearch001"}]',
    '0xbb01000000000000000000000000000000000000000000000000000000000004',
    15700000, '2025-11-01 16:00:00',
    'upheld', 'Dispute upheld unanimously. No 501(c)(3) registration exists. Stock photography confirmed. All pledges refunded. Creator bond and voucher stakes slashed.', '0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', '2025-12-10 10:00:00',
    '4000000000', '8000000000',
    '2025-12-01 16:00:00', '2025-11-01 16:00:00', '2025-12-10 10:00:00', '2025-11-01 16:00:00'
);


-- ============================================================================
-- SECTION 9: CONSENSUS RESULTS
-- ============================================================================
-- 10 AI verification results across completed, failed, and disputed campaigns

-- C11: Community Library - PASSED (3 verifications)
INSERT OR IGNORE INTO consensus_results (
    result_id, campaign_id, round_number, ai_provider, model_version,
    result, confidence, reasoning, sources, verification_type,
    processing_time_ms, tokens_used,
    input_hash, created_at, verified_at
) VALUES
    ('40000000-0000-4000-a000-000000000001', '550e8400-e29b-41d4-a716-44665544000b',
     1, 'openai', 'gpt-4o-2025-08-06',
     1, 0.92,
     'Municipal business records confirm the establishment of "Community Library" at 1234 Community Drive. Library catalog system shows 5,247 indexed titles. ISP service agreement with Comcast Business confirmed active wifi service. Two weekly reading programs verified via attendance logs averaging 18 participants per session.',
     '[{"source":"Municipal Business Registry","url":"https://city.gov/business/lookup","accessed":"2025-12-18"},{"source":"LibraryThing Catalog API","accessed":"2025-12-18"},{"source":"Comcast Business Service Records","accessed":"2025-12-18"}]',
     'baseline',
     4521, 3200,
     'aabb001100000000000000000000000000000000000000000000000000000001',
     '2025-12-18 10:00:00', '2025-12-18 10:00:00'),

    ('40000000-0000-4000-a000-000000000002', '550e8400-e29b-41d4-a716-44665544000b',
     1, 'anthropic', 'claude-3.5-sonnet-20250620',
     1, 0.89,
     'Cross-verified library establishment through independent channels. Building lease agreement matches claimed address. Book inventory verified through catalog API. Reading programs confirmed through community center event listings.',
     '[{"source":"County Property Records","accessed":"2025-12-18"},{"source":"Community Center Events Calendar","accessed":"2025-12-18"}]',
     'baseline',
     3890, 2900,
     'aabb001100000000000000000000000000000000000000000000000000000002',
     '2025-12-18 10:15:00', '2025-12-18 10:15:00'),

    ('40000000-0000-4000-a000-000000000003', '550e8400-e29b-41d4-a716-44665544000b',
     2, 'openai', 'gpt-4o-2025-08-06',
     1, 0.95,
     'Completion verification: Library has been operational for 5 months. Current catalog shows 5,247 books. Weekly attendance average of 18 participants across 2 reading programs. All success criteria met or exceeded.',
     '[{"source":"Library Management System API","accessed":"2025-12-20"},{"source":"Weekly Attendance Logs","accessed":"2025-12-20"}]',
     'completion',
     5100, 3800,
     'aabb001100000000000000000000000000000000000000000000000000000003',
     '2025-12-20 14:00:00', '2025-12-20 14:00:00');

-- C12: School Supplies - PASSED (2 verifications)
INSERT OR IGNORE INTO consensus_results (
    result_id, campaign_id, round_number, ai_provider, model_version,
    result, confidence, reasoning, sources, verification_type,
    processing_time_ms, tokens_used,
    input_hash, created_at, verified_at
) VALUES
    ('40000000-0000-4000-a000-000000000004', '550e8400-e29b-41d4-a716-44665544000c',
     1, 'openai', 'gpt-4o-2025-08-06',
     1, 0.88,
     'School district partnership agreement verified with Central Unified SD. Supply procurement records show 1,047 kits ordered. Distribution event documented with timestamped photos showing 1,047 recipients.',
     '[{"source":"Central Unified SD Partnership Portal","accessed":"2025-10-28"},{"source":"Supply Vendor Invoice Records","accessed":"2025-10-28"}]',
     'baseline',
     4200, 3100,
     'aabb001200000000000000000000000000000000000000000000000000000004',
     '2025-10-28 10:00:00', '2025-10-28 10:00:00'),

    ('40000000-0000-4000-a000-000000000005', '550e8400-e29b-41d4-a716-44665544000c',
     1, 'anthropic', 'claude-3.5-sonnet-20250620',
     1, 0.91,
     'Completion verified: 1,047 supply kits distributed across 8 schools in Central Unified SD. Photo evidence is consistent and timestamped. Recipient acknowledgment forms collected for 98% of kits.',
     '[{"source":"Distribution Event Photos (EXIF verified)","accessed":"2025-10-30"},{"source":"Recipient Acknowledgment Database","accessed":"2025-10-30"}]',
     'completion',
     3700, 2800,
     'aabb001200000000000000000000000000000000000000000000000000000005',
     '2025-10-30 14:00:00', '2025-10-30 14:00:00');

-- C13: Miracle Cure - FAILED (2 verifications)
INSERT OR IGNORE INTO consensus_results (
    result_id, campaign_id, round_number, ai_provider, model_version,
    result, confidence, reasoning, sources, verification_type,
    processing_time_ms, tokens_used,
    input_hash, created_at, verified_at
) VALUES
    ('40000000-0000-4000-a000-000000000006', '550e8400-e29b-41d4-a716-44665544000d',
     1, 'openai', 'gpt-4o-2025-08-06',
     0, 0.15,
     'VERIFICATION FAILED: No FDA clinical trial registry entry found for study NPL-2025-IMM-001. "NaturePure Labs" is not listed in any accredited laboratory database (AAALAC, CAP, CLIA). No peer-reviewed publications found matching the claimed 300% immune boost. The claim appears to be entirely fabricated.',
     '[{"source":"FDA Clinical Trials Database (clinicaltrials.gov)","accessed":"2025-11-25"},{"source":"AAALAC Accredited Laboratory Directory","accessed":"2025-11-25"},{"source":"PubMed/Google Scholar Search","accessed":"2025-11-25"}]',
     'baseline',
     5800, 4200,
     'aabb001300000000000000000000000000000000000000000000000000000006',
     '2025-11-25 10:00:00', '2025-11-25 10:00:00'),

    ('40000000-0000-4000-a000-000000000007', '550e8400-e29b-41d4-a716-44665544000d',
     1, 'anthropic', 'claude-3.5-sonnet-20250620',
     0, 0.12,
     'VERIFICATION FAILED: Independent verification confirms no clinical trial, no accredited laboratory, and no peer-reviewed research exists for the claimed product. The 300% immune boost claim has no scientific basis and contradicts established immunology.',
     '[{"source":"WHO International Clinical Trials Registry","accessed":"2025-11-25"},{"source":"Google Scholar comprehensive search","accessed":"2025-11-25"}]',
     'baseline',
     4100, 3000,
     'aabb001300000000000000000000000000000000000000000000000000000007',
     '2025-11-25 10:30:00', '2025-11-25 10:30:00');

-- C14: Carbon Offset - DISPUTED (mixed results)
INSERT OR IGNORE INTO consensus_results (
    result_id, campaign_id, round_number, ai_provider, model_version,
    result, confidence, reasoning, sources, verification_type,
    processing_time_ms, tokens_used,
    input_hash, created_at, verified_at
) VALUES
    ('40000000-0000-4000-a000-000000000008', '550e8400-e29b-41d4-a716-44665544000e',
     1, 'openai', 'gpt-4o-2025-08-06',
     1, 0.71,
     'Verra project VCS-2847 exists in the registry and is an active reforestation project. However, the specific credit serial numbers provided could not be fully verified due to registry API limitations. Partial match found for 623 of 1000 claimed credits.',
     '[{"source":"Verra Registry API","accessed":"2025-12-20"},{"source":"Gold Standard Registry","accessed":"2025-12-20"}]',
     'baseline',
     6200, 4500,
     'aabb001400000000000000000000000000000000000000000000000000000008',
     '2025-12-20 10:00:00', '2025-12-20 10:00:00'),

    ('40000000-0000-4000-a000-000000000009', '550e8400-e29b-41d4-a716-44665544000e',
     1, 'anthropic', 'claude-3.5-sonnet-20250620',
     0, 0.45,
     'Dispute verification: Satellite imagery analysis shows some reforestation activity in the claimed areas but significantly less than required for 1000 carbon credits. Estimated actual sequestration: 30-40% of claimed amount. Carbon credit serial number verification is inconclusive.',
     '[{"source":"Sentinel-2 Satellite Imagery","accessed":"2026-01-18"},{"source":"FAO Global Forest Resources Assessment","accessed":"2026-01-18"}]',
     'dispute',
     7100, 5200,
     'aabb001400000000000000000000000000000000000000000000000000000009',
     '2026-01-18 14:00:00', '2026-01-18 14:00:00');

-- C15: Phantom Charity - FAILED (1 verification)
INSERT OR IGNORE INTO consensus_results (
    result_id, campaign_id, round_number, ai_provider, model_version,
    result, confidence, reasoning, sources, verification_type,
    processing_time_ms, tokens_used,
    input_hash, created_at, verified_at
) VALUES
    ('40000000-0000-4000-a000-000000000010', '550e8400-e29b-41d4-a716-44665544000f',
     1, 'openai', 'gpt-4o-2025-08-06',
     0, 0.08,
     'VERIFICATION FAILED: EIN 84-2847291 does not exist in the IRS Exempt Organizations database. "Global Hope Relief" is not registered as a 501(c)(3) in any state. No matching charity registration found in GuideStar/Candid database. Reverse image search confirms campaign photos are commercially licensed stock images from Shutterstock.',
     '[{"source":"IRS Exempt Organizations Select Check","accessed":"2025-11-28"},{"source":"GuideStar/Candid Nonprofit Database","accessed":"2025-11-28"},{"source":"Shutterstock Reverse Image Search","accessed":"2025-11-28"}]',
     'baseline',
     4800, 3600,
     'aabb001500000000000000000000000000000000000000000000000000000010',
     '2025-11-28 10:00:00', '2025-11-28 10:00:00');


-- ============================================================================
-- SECTION 10: EVIDENCE
-- ============================================================================
-- Evidence uploads for disputed and completed campaigns

INSERT OR IGNORE INTO evidence (
    evidence_id, campaign_id, uploader_address,
    ipfs_cid, ipfs_url, gateway_url, r2_key,
    content_type, file_name, size_bytes, created_at
) VALUES
    -- Dispute evidence for C14 (Carbon Offset)
    ('60000000-0000-4000-a000-000000000001',
     '550e8400-e29b-41d4-a716-44665544000e',
     '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
     'QmVerraSearch001aaaaaaaaaaaaaaaaaaaaaaaaa',
     'ipfs://QmVerraSearch001aaaaaaaaaaaaaaaaaaaaaaaaa',
     'https://gateway.pinata.cloud/ipfs/QmVerraSearch001aaaaaaaaaaaaaaaaaaaaaaaaa',
     'evidence/c14/verra-registry-search.pdf',
     'application/pdf', 'verra-registry-search.pdf', 245760,
     '2026-01-15 10:30:00'),

    ('60000000-0000-4000-a000-000000000002',
     '550e8400-e29b-41d4-a716-44665544000e',
     '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
     'QmSatellite001bbbbbbbbbbbbbbbbbbbbbbbbbbbb',
     'ipfs://QmSatellite001bbbbbbbbbbbbbbbbbbbbbbbbbbbb',
     'https://gateway.pinata.cloud/ipfs/QmSatellite001bbbbbbbbbbbbbbbbbbbbbbbbbbbb',
     'evidence/c14/satellite-comparison.png',
     'image/png', 'satellite-comparison.png', 1572864,
     '2026-01-15 10:35:00'),

    -- Dispute evidence for C15 (Phantom Charity)
    ('60000000-0000-4000-a000-000000000003',
     '550e8400-e29b-41d4-a716-44665544000f',
     '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
     'QmIRSSearch001cccccccccccccccccccccccccccc',
     'ipfs://QmIRSSearch001cccccccccccccccccccccccccccc',
     'https://gateway.pinata.cloud/ipfs/QmIRSSearch001cccccccccccccccccccccccccccc',
     'evidence/c15/irs-search-results.pdf',
     'application/pdf', 'irs-search-results.pdf', 189440,
     '2025-11-01 16:30:00'),

    -- Completion evidence for C11 (Library)
    ('60000000-0000-4000-a000-000000000004',
     '550e8400-e29b-41d4-a716-44665544000b',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'QmLibraryProof001dddddddddddddddddddddddd',
     'ipfs://QmLibraryProof001dddddddddddddddddddddddd',
     'https://gateway.pinata.cloud/ipfs/QmLibraryProof001dddddddddddddddddddddddd',
     'evidence/c11/library-opening-ceremony.jpg',
     'image/jpeg', 'library-opening-ceremony.jpg', 3145728,
     '2025-12-15 14:00:00');


-- ============================================================================
-- SECTION 11: NOTIFICATIONS
-- ============================================================================
-- 12 lifecycle notifications for the primary test wallet

INSERT OR IGNORE INTO notifications (
    notification_id, recipient_address, type, title, message,
    entity_type, entity_id, action_url, priority,
    is_read, read_at, created_at
) VALUES
    -- Campaign approved notification
    ('50000000-0000-4000-a000-000000000001',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'campaign_approved', 'Campaign Approved!',
     'Your campaign "Homeless Shelter Renovation" has been approved. You can now activate it on-chain.',
     'campaign', '550e8400-e29b-41d4-a716-446655440009', '/campaigns/homeless-shelter-renovation', 'high',
     1, '2025-10-15 11:30:00', '2025-10-15 11:00:00'),

    -- Campaign active notification
    ('50000000-0000-4000-a000-000000000002',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'campaign_active', 'Campaign is Live!',
     'Your campaign "Homeless Shelter Renovation" is now active and accepting pledges.',
     'campaign', '550e8400-e29b-41d4-a716-446655440009', '/campaigns/homeless-shelter-renovation', 'normal',
     1, '2025-11-01 09:30:00', '2025-11-01 09:00:00'),

    -- Pledge received notifications
    ('50000000-0000-4000-a000-000000000003',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'pledge_received', 'New Pledge Received!',
     'Alice Chen pledged 17,000 USDC to your campaign "Homeless Shelter Renovation".',
     'campaign', '550e8400-e29b-41d4-a716-446655440009', '/campaigns/homeless-shelter-renovation', 'normal',
     1, '2025-11-22 16:00:00', '2025-11-22 15:00:00'),

    -- Vouch received notification
    ('50000000-0000-4000-a000-000000000004',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'vouch_received', 'Campaign Vouched For!',
     'Charlie Wilson staked 10,000 USDC to vouch for your campaign "Homeless Shelter Renovation".',
     'campaign', '550e8400-e29b-41d4-a716-446655440009', '/campaigns/homeless-shelter-renovation', 'normal',
     1, '2025-11-08 10:00:00', '2025-11-08 09:00:00'),

    -- Campaign completed notification
    ('50000000-0000-4000-a000-000000000005',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'campaign_completed', 'Campaign Completed Successfully!',
     'Your campaign "Community Library Fund" has been verified and completed! Funds will be released shortly.',
     'campaign', '550e8400-e29b-41d4-a716-44665544000b', '/campaigns/community-library-fund', 'high',
     1, '2025-12-20 17:00:00', '2025-12-20 16:00:00'),

    -- Pledge released notification
    ('50000000-0000-4000-a000-000000000006',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'pledge_released', 'Funds Released!',
     'Funds from "Back-to-School Supply Drive" have been released to the campaign creator. Thank you for your pledge!',
     'campaign', '550e8400-e29b-41d4-a716-44665544000c', '/campaigns/back-to-school-supply-drive', 'normal',
     1, '2025-11-05 10:30:00', '2025-11-05 10:00:00'),

    -- Campaign disputed notification
    ('50000000-0000-4000-a000-000000000007',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'campaign_disputed', 'Campaign Disputed!',
     'Your campaign "Carbon Offset Reforestation" has been disputed by Dave Thompson. Please review the dispute details.',
     'campaign', '550e8400-e29b-41d4-a716-44665544000e', '/campaigns/carbon-offset-reforestation', 'urgent',
     1, '2026-01-15 10:30:00', '2026-01-15 10:00:00'),

    -- Pledge refunded notification
    ('50000000-0000-4000-a000-000000000008',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'pledge_refunded', 'Pledge Refunded',
     'Your pledge of 3,000 USDC to "Miracle Cure Supplements" has been refunded due to campaign failure.',
     'pledge', '10000000-0000-4000-a000-000000000021', '/dashboard/pledges', 'high',
     1, '2025-12-05 10:30:00', '2025-12-05 10:00:00'),

    -- Consensus result notification
    ('50000000-0000-4000-a000-000000000009',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'consensus_result', 'Verification Complete',
     'AI consensus verification for "Community Library Fund" passed with 95% confidence (Round 2).',
     'campaign', '550e8400-e29b-41d4-a716-44665544000b', '/campaigns/community-library-fund', 'normal',
     1, '2025-12-20 14:30:00', '2025-12-20 14:00:00'),

    -- Unread notification: New pledge on emergency food bank
    ('50000000-0000-4000-a000-000000000010',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'pledge_received', 'New Pledge Received!',
     'Grace Okafor pledged 3,000 USDC to your campaign "Emergency Food Bank Drive". You''re 70% to goal!',
     'campaign', '550e8400-e29b-41d4-a716-446655440012', '/campaigns/emergency-food-bank-drive', 'normal',
     0, NULL, '2026-02-08 14:05:00'),

    -- Unread notification: Campaign ending soon
    ('50000000-0000-4000-a000-000000000011',
     '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
     'system', 'Campaign Ending Soon!',
     'Your campaign "Emergency Food Bank Drive" ends in 3 days. Currently at 70% of funding goal.',
     'campaign', '550e8400-e29b-41d4-a716-446655440012', '/campaigns/emergency-food-bank-drive', 'urgent',
     0, NULL, '2026-02-09 08:00:00'),

    -- Notification for Alice: pledge refunded from phantom charity
    ('50000000-0000-4000-a000-000000000012',
     '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
     'pledge_refunded', 'Pledge Refunded',
     'Your pledge of 2,500 USDC to "Phantom Charity Organization" has been refunded. The campaign was found to be fraudulent.',
     'pledge', '10000000-0000-4000-a000-000000000027', '/dashboard/pledges', 'high',
     0, NULL, '2025-12-18 10:30:00');


-- ============================================================================
-- SECTION 12: AUDIT LOG
-- ============================================================================
-- 15 key system audit entries tracking major lifecycle events

INSERT INTO audit_log (
    actor_address, actor_type, action, action_category,
    entity_type, entity_id, details, created_at
) VALUES
    -- Campaign submission
    ('0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', 'user',
     'campaign_submitted', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-446655440009',
     '{"name":"Homeless Shelter Renovation","fundraisingGoal":"100000000000"}',
     '2025-10-05 10:00:00'),

    -- Campaign approval by verifier
    ('0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', 'verifier',
     'campaign_approved', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-446655440009',
     '{"approvedBy":"Frank Kim","reason":"All verification criteria met. Building permits confirmed."}',
     '2025-10-15 11:00:00'),

    -- Campaign rejection
    ('0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', 'verifier',
     'campaign_rejected', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-446655440005',
     '{"rejectedBy":"Frank Kim","reason":"Insufficient verification criteria. Campaign purpose is too vague."}',
     '2025-12-22 09:30:00'),

    -- Campaign activated on-chain
    ('0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', 'user',
     'campaign_activated', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-446655440009',
     '{"escrowAddress":"0x3333333333333333333333333333333333333333","txHash":"0xaa01000000000000000000000000000000000000000000000000000000000009"}',
     '2025-11-01 09:00:00'),

    -- Featured by admin
    ('0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 'admin',
     'campaign_featured', 'admin',
     'campaign', '550e8400-e29b-41d4-a716-446655440009',
     '{"reason":"High community impact. Strong progress toward goal."}',
     '2025-12-01 10:00:00'),

    -- Large pledge received
    ('0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', 'user',
     'pledge_created', 'pledge',
     'pledge', '10000000-0000-4000-a000-000000000007',
     '{"campaignId":"550e8400-e29b-41d4-a716-446655440009","amount":"25000000000","txHash":"0xee01000000000000000000000000000000000000000000000000000000000007"}',
     '2025-11-10 10:00:00'),

    -- Vouch staked
    ('0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'user',
     'vouch_created', 'vouch',
     'voucher', '20000000-0000-4000-a000-000000000003',
     '{"campaignId":"550e8400-e29b-41d4-a716-446655440009","amount":"10000000000"}',
     '2025-11-08 09:00:00'),

    -- Dispute filed
    ('0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', 'user',
     'dispute_filed', 'dispute',
     'disputer', '30000000-0000-4000-a000-000000000002',
     '{"campaignId":"550e8400-e29b-41d4-a716-44665544000e","amount":"7000000000","type":"verification_failure"}',
     '2026-01-15 10:00:00'),

    -- Dispute resolved (upheld)
    ('0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 'admin',
     'dispute_resolved', 'dispute',
     'disputer', '30000000-0000-4000-a000-000000000004',
     '{"campaignId":"550e8400-e29b-41d4-a716-44665544000f","outcome":"upheld","reason":"Fraudulent organization confirmed"}',
     '2025-12-10 10:00:00'),

    -- Campaign completion (success)
    (NULL, 'system',
     'campaign_completed', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-44665544000b',
     '{"name":"Community Library Fund","consensusResult":"pass","confidence":0.95}',
     '2025-12-20 16:00:00'),

    -- Funds released
    (NULL, 'contract',
     'funds_released', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-44665544000c',
     '{"name":"Back-to-School Supply Drive","amount":"10500000000","txHash":"0xdd0100000000000000000000000000000000000000000000000000000000000c"}',
     '2025-11-05 10:00:00'),

    -- Campaign failed (verification)
    (NULL, 'system',
     'campaign_failed', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-44665544000d',
     '{"name":"Miracle Cure Supplements","reason":"AI consensus verification failed. No supporting evidence found."}',
     '2025-12-01 14:00:00'),

    -- Voucher slashed
    (NULL, 'contract',
     'voucher_slashed', 'vouch',
     'voucher', '20000000-0000-4000-a000-000000000008',
     '{"campaignId":"550e8400-e29b-41d4-a716-44665544000f","voucherAddress":"0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2","slashAmount":"1500000000","reason":"Vouched for fraudulent campaign"}',
     '2025-12-15 11:00:00'),

    -- Campaign cancelled
    ('0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f', 'user',
     'campaign_cancelled', 'campaign',
     'campaign', '550e8400-e29b-41d4-a716-446655440010',
     '{"name":"Summer Music Festival","reason":"Unable to secure venue due to scheduling conflicts."}',
     '2025-12-15 16:00:00'),

    -- Consensus verification run
    (NULL, 'system',
     'consensus_verification', 'consensus',
     'campaign', '550e8400-e29b-41d4-a716-44665544000e',
     '{"round":1,"providers":["openai","anthropic"],"results":"mixed","disputed":true}',
     '2026-01-18 14:30:00');


-- ============================================================================
-- SECTION 13: SESSIONS (Test session for primary wallet)
-- ============================================================================

INSERT OR IGNORE INTO sessions (
    session_id, user_address,
    siwe_nonce, chain_id,
    issued_at, expires_at,
    is_valid, last_activity_at, created_at
) VALUES (
    'seed-session-001-aaaabbbbccccddddeeeeffffgggg0001',
    '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f',
    'a1b2c3d4e5f6a7b8',
    80002,
    '2026-02-09 08:00:00', '2026-02-16 08:00:00',
    1, '2026-02-09 08:30:00', '2026-02-09 08:00:00'
);


-- ============================================================================
-- SECTION 14: FIX DENORMALIZED COUNTS
-- ============================================================================
-- Explicitly set all denormalized counters to correct values.
-- This ensures accuracy regardless of whether triggers fired during seeding.

-- Campaign counts
UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 1, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440007';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 1, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440008';

UPDATE campaigns SET
    pledge_count = 4, unique_pledgers = 4, voucher_count = 2, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440009';

UPDATE campaigns SET
    pledge_count = 4, unique_pledgers = 4, voucher_count = 1, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-44665544000a';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 1, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-44665544000b';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 1, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-44665544000c';

UPDATE campaigns SET
    pledge_count = 2, unique_pledgers = 2, voucher_count = 0, disputer_count = 1
WHERE campaign_id = '550e8400-e29b-41d4-a716-44665544000d';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 0, disputer_count = 2
WHERE campaign_id = '550e8400-e29b-41d4-a716-44665544000e';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 1, disputer_count = 1
WHERE campaign_id = '550e8400-e29b-41d4-a716-44665544000f';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 3, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440011';

UPDATE campaigns SET
    pledge_count = 3, unique_pledgers = 3, voucher_count = 1, disputer_count = 0
WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440012';

-- User stats
UPDATE users SET
    campaigns_created = 14, pledges_made = 11, total_pledged = '92000000000', reputation_score = 85
WHERE address = '0x9bedbe969028d7fabc6c9ccb8c9f05ec1b70d35f';

UPDATE users SET
    campaigns_created = 2, pledges_made = 8, total_pledged = '46000000000', reputation_score = 62
WHERE address = '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

UPDATE users SET
    campaigns_created = 2, pledges_made = 4, total_pledged = '31500000000', reputation_score = 25
WHERE address = '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3';

UPDATE users SET
    campaigns_created = 0, pledges_made = 2, total_pledged = '11000000000', reputation_score = 72
WHERE address = '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';

UPDATE users SET
    campaigns_created = 0, pledges_made = 2, total_pledged = '7000000000', reputation_score = 48
WHERE address = '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5';

UPDATE users SET
    campaigns_created = 0, pledges_made = 0, total_pledged = '0', reputation_score = 100
WHERE address = '0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6';

UPDATE users SET
    campaigns_created = 0, pledges_made = 0, total_pledged = '0', reputation_score = 90
WHERE address = '0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1';

UPDATE users SET
    campaigns_created = 0, pledges_made = 6, total_pledged = '28300000000', reputation_score = 55
WHERE address = '0xa7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8';


-- ============================================================================
-- SECTION 14B: UPDATE CATEGORY CAMPAIGN COUNTS
-- ============================================================================
-- Sync campaign_count on categories based on seeded campaign_categories data

UPDATE categories SET campaign_count = (
    SELECT COUNT(*) FROM campaign_categories WHERE category_id = categories.category_id
) WHERE category_id IN (
    'personal-fitness', 'skill-building', 'community-projects', 'sustainable-living',
    'health-recovery', 'endurance-sports', 'tree-planting', 'education-funding',
    'shelter-housing', 'homelessness-reduction', 'animal-rescue', 'carbon-reduction',
    'nonprofit-fundraising', 'arts-creativity', 'mental-health-support', 'food-security'
);


-- ============================================================================
-- SECTION 15: UPDATE SCHEMA METADATA
-- ============================================================================

INSERT OR REPLACE INTO _schema_metadata (key, value, updated_at)
VALUES ('seed_campaigns_at', datetime('now'), datetime('now'));

INSERT OR REPLACE INTO _schema_metadata (key, value, updated_at)
VALUES ('seed_campaigns_version', '1.0.0', datetime('now'));
