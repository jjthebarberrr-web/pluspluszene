-- =============================================
-- CATALOG REORGANIZATION MIGRATION
-- Reorganizes the entire catalog for proper hierarchy,
-- economy-aligned pricing, and clean structure.
-- Run against the arcturus database.
-- =============================================

-- STEP 1: Create a new top-level 'Rares' category
INSERT INTO catalog_pages (id, parent_id, caption, caption_save, page_layout, icon_color, icon_image, min_rank, order_num, visible, enabled, page_headline, page_teaser, page_special, page_text1, page_text2, page_text_details, page_text_teaser, vip_only, includes, room_id)
SELECT 70000, -1, 'Rares', 'Rares', 'default_3x3', 1, 0, 1, 4, '1', '1', '', '', '', 'Welcome to the Rares section! Browse exclusive and limited edition items.', '', '', '', '0', '', 0
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM catalog_pages WHERE id = 70000);

-- STEP 2: Reorganize top-level page ordering
-- Structure: Front(1) > Furniture(2) > Clothes(3) > Rares(70000) > Pets(4) > Others(5) > VIP(60000) > Staff(7)
UPDATE catalog_pages SET order_num = 1 WHERE id = 1;
UPDATE catalog_pages SET order_num = 2, caption = 'Furniture' WHERE id = 2;
UPDATE catalog_pages SET order_num = 3 WHERE id = 3;
UPDATE catalog_pages SET order_num = 4 WHERE id = 70000;
UPDATE catalog_pages SET order_num = 5 WHERE id = 4;
UPDATE catalog_pages SET order_num = 6 WHERE id = 5;
UPDATE catalog_pages SET order_num = 7, visible = '1', enabled = '1' WHERE id = 60000;
UPDATE catalog_pages SET order_num = 99, visible = '1', enabled = '1', min_rank = 6 WHERE id = 7;

-- STEP 3: Move rare-related pages from Furnis to Rares (70000)
UPDATE catalog_pages SET parent_id = 70000, order_num = 1 WHERE id = 50520;  -- Rare Items (194 items)
UPDATE catalog_pages SET parent_id = 70000, order_num = 2 WHERE id = 50521;  -- Mini Rares (87 items)
UPDATE catalog_pages SET parent_id = 70000, order_num = 3 WHERE id = 50529;  -- Rainbow Rares (9 items)
UPDATE catalog_pages SET parent_id = 70000, order_num = 4 WHERE id = 50530;  -- Limited Edition (22 items)
UPDATE catalog_pages SET parent_id = 70000, order_num = 10 WHERE id = 50522; -- Bonus Rares 2020
UPDATE catalog_pages SET parent_id = 70000, order_num = 11 WHERE id = 50523; -- Bonus Rares 2021
UPDATE catalog_pages SET parent_id = 70000, order_num = 12 WHERE id = 50524; -- Bonus Rares 2022
UPDATE catalog_pages SET parent_id = 70000, order_num = 13 WHERE id = 50525; -- Bonus Rares 2023
UPDATE catalog_pages SET parent_id = 70000, order_num = 14 WHERE id = 50526; -- Bonus Rares 2024
UPDATE catalog_pages SET parent_id = 70000, order_num = 15 WHERE id = 50527; -- Bonus Rares 2025
UPDATE catalog_pages SET parent_id = 70000, order_num = 16 WHERE id = 50528; -- Bonus Rares 2026

-- STEP 4: Reorder Furniture children (parent=2)
UPDATE catalog_pages SET order_num = 1 WHERE id = 50000;   -- New Arrivals
UPDATE catalog_pages SET order_num = 2, visible = '1', enabled = '1' WHERE id = 209;  -- Furniture collection
UPDATE catalog_pages SET order_num = 2, visible = '1', enabled = '1' WHERE id = 10023; -- Newest
UPDATE catalog_pages SET order_num = 3, visible = '1', enabled = '1' WHERE id = 568;  -- Classic Furni
UPDATE catalog_pages SET order_num = 4, visible = '1', enabled = '1' WHERE id = 372;  -- Seasonal
UPDATE catalog_pages SET order_num = 5, visible = '1', enabled = '1' WHERE id = 218;  -- Wired
UPDATE catalog_pages SET order_num = 6, visible = '1', enabled = '1' WHERE id = 219;  -- Games
UPDATE catalog_pages SET order_num = 7 WHERE id = 8;       -- Habbo Club
UPDATE catalog_pages SET order_num = 8, visible = '1', enabled = '1' WHERE id = 1635463909; -- Room Construction
UPDATE catalog_pages SET order_num = 9, visible = '1', enabled = '1' WHERE id = 253;  -- Music Store
UPDATE catalog_pages SET order_num = 10 WHERE id = 9;      -- Bots
UPDATE catalog_pages SET order_num = 11, visible = '1', enabled = '1' WHERE id = 10086; -- Designers
UPDATE catalog_pages SET order_num = 12 WHERE id = 107;    -- Groups
UPDATE catalog_pages SET order_num = 13 WHERE id = 50531;  -- Diamond Items
UPDATE catalog_pages SET order_num = 14 WHERE id = 50532;  -- Ducket Items
UPDATE catalog_pages SET order_num = 15 WHERE id = 50510;  -- Builders Club Items
UPDATE catalog_pages SET order_num = 16 WHERE id = 50920;  -- Promo Items
UPDATE catalog_pages SET order_num = 17 WHERE id = 50600;  -- NFT Collection
UPDATE catalog_pages SET order_num = 99 WHERE id = 308;    -- Purchase History
-- Disable junk pages under Furnis
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE id IN (912368591, 474, 222, 14, 233, 594, 26);

-- Enable seasonal sub-pages
UPDATE catalog_pages SET enabled = '1' WHERE parent_id = 372 AND visible = '1';

-- STEP 5: Reorganize Clothes (parent=3)
UPDATE catalog_pages SET order_num = 1, caption = 'All Clothing' WHERE id = 50500;
UPDATE catalog_pages SET order_num = 2 WHERE id = 588;   -- Top Picks
UPDATE catalog_pages SET order_num = 3 WHERE id = 589;   -- New
UPDATE catalog_pages SET order_num = 4 WHERE id = 200;   -- Outfits
UPDATE catalog_pages SET order_num = 5 WHERE id = 204;   -- Tshirts
UPDATE catalog_pages SET order_num = 6 WHERE id = 205;   -- Coats
UPDATE catalog_pages SET order_num = 7 WHERE id = 203;   -- Dresses
UPDATE catalog_pages SET order_num = 8 WHERE id = 208;   -- Skirts
UPDATE catalog_pages SET order_num = 9 WHERE id = 206;   -- Jeans
UPDATE catalog_pages SET order_num = 10 WHERE id = 201;  -- Hairstyles
UPDATE catalog_pages SET order_num = 11 WHERE id = 202;  -- Hats
UPDATE catalog_pages SET order_num = 12 WHERE id = 585;  -- Golden Accessories
UPDATE catalog_pages SET order_num = 13 WHERE id = 423;  -- Effects
-- Fix broken caption page
UPDATE catalog_pages SET caption = 'Accessories', order_num = 14 WHERE parent_id = 3 AND id NOT IN (50500,588,589,200,204,205,203,208,206,201,202,585,423,252,410,207);
-- Disable empty/junk clothes pages
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE id IN (252, 410, 207);

-- STEP 6: Clean up Staff catalog (parent=7)
-- Hide Bsstonino junk pages
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE id = 912368597;
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE parent_id = 912368597;
-- Hide other junk staff pages
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE id IN (
  912368592, 912368593, 912368596, 912368586, 912368587,
  180012, 111138, 111205, 40, 10131,
  1635463895, 1635463911, 1635463907, 442, 345, 270, 5779, 10041, 194
);
-- Keep useful staff pages
UPDATE catalog_pages SET order_num = 1, visible = '1', enabled = '1' WHERE id = 10045;
UPDATE catalog_pages SET order_num = 2, visible = '1', enabled = '1' WHERE id = 1635463906;
UPDATE catalog_pages SET order_num = 3, visible = '1', enabled = '1' WHERE id = 1635463905;
-- Hide test items page
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE id = 50950;

-- STEP 7: Hide disabled top-level junk
UPDATE catalog_pages SET visible = '0', enabled = '0' WHERE id IN (610, 10102, 6, 1800000021);

-- STEP 8: VIP page min_rank values (2=Bronze, 3=Silver, 4=Gold, 5=Diamond)
UPDATE catalog_pages SET min_rank = 2 WHERE id = 60001;
UPDATE catalog_pages SET min_rank = 3 WHERE id = 60002;
UPDATE catalog_pages SET min_rank = 4 WHERE id = 60003;
UPDATE catalog_pages SET min_rank = 5 WHERE id = 60004;

-- STEP 9: Staff catalog min_rank (6=Representative+, 8=Governor+)
UPDATE catalog_pages SET min_rank = 6 WHERE id = 7;
UPDATE catalog_pages SET min_rank = 8 WHERE id = 10045;
UPDATE catalog_pages SET min_rank = 6 WHERE id = 1635463906;
UPDATE catalog_pages SET min_rank = 8 WHERE id = 1635463905;

-- =============================================
-- PRICING ALIGNMENT WITH ECONOMY
-- =============================================

-- RARES: Premium pricing
UPDATE catalog_items SET cost_credits = 25, cost_points = 0 WHERE page_id = 50520 AND cost_credits < 25;
UPDATE catalog_items SET cost_credits = 15, cost_points = 0 WHERE page_id = 50521 AND cost_credits < 15;
UPDATE catalog_items SET cost_credits = 50, cost_points = 0 WHERE page_id = 50529;
UPDATE catalog_items SET cost_credits = 75, cost_points = 0 WHERE page_id = 50530;
UPDATE catalog_items SET cost_credits = 20, cost_points = 0 
WHERE page_id IN (50522, 50523, 50524, 50525, 50526, 50527, 50528) AND cost_credits < 20;

-- DIAMOND ITEMS: Price in diamonds
UPDATE catalog_items SET cost_credits = 0, cost_points = 5, points_type = 5 
WHERE page_id = 50531 AND (cost_points = 0 OR points_type != 5);

-- DUCKET ITEMS: Price in duckets
UPDATE catalog_items SET cost_credits = 0, cost_points = 10, points_type = 0 
WHERE page_id = 50532 AND (cost_points = 0 OR points_type != 0);

-- BUILDERS CLUB: Affordable bulk building (5 credits)
UPDATE catalog_items SET cost_credits = 5 WHERE page_id = 50510 AND cost_credits = 0;

-- NEW ARRIVALS: Standard pricing
UPDATE catalog_items SET cost_credits = 5 WHERE page_id = 50007 AND cost_credits = 0;
UPDATE catalog_items SET cost_credits = 3 WHERE page_id = 50008 AND cost_credits = 0;

-- CLASSIC FURNI: 3 credits for basic items
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 3
WHERE p.parent_id = 568 AND ci.cost_credits = 0;

-- WIRED items: 10 credits (technical items)
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 10
WHERE p.parent_id = 218 AND ci.cost_credits < 10;

-- GAMES items: 10 credits
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 10
WHERE p.parent_id = 219 AND ci.cost_credits < 10;

-- THEMED COLLECTIONS: 10 credits each
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 10
WHERE p.parent_id = 50000 AND ci.cost_credits < 5;

-- SEASONAL items: 10 credits
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 10
WHERE p.parent_id = 372 AND ci.cost_credits < 10;

-- RECENT ADDITIONS: 10 credits
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 10
WHERE p.parent_id = 10023 AND ci.cost_credits < 10;

-- CLOTHING: Minimum 3 credits
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 3
WHERE (p.parent_id = 3 OR p.id = 3) AND ci.cost_credits = 0;

UPDATE catalog_items SET cost_credits = 5 WHERE page_id = 50500 AND cost_credits < 3;
UPDATE catalog_items SET cost_credits = 15 WHERE page_id = 585;  -- Golden Accessories (premium)
UPDATE catalog_items SET cost_credits = 10 WHERE page_id = 423;  -- Effects

-- HABBO CLUB items: 10 credits + HC exclusive
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 10
WHERE p.parent_id = 8 AND ci.cost_credits < 10;

-- VIP CATALOG items: Premium pricing
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 15
WHERE p.parent_id = 60000 AND ci.cost_credits < 15;

-- NFT Collection: 20 credits
UPDATE catalog_items ci
JOIN catalog_pages p ON ci.page_id = p.id
SET ci.cost_credits = 20
WHERE (p.id = 50600 OR p.parent_id = 50600) AND ci.cost_credits < 20;

-- PROMO ITEMS: 10 credits
UPDATE catalog_items SET cost_credits = 10 WHERE page_id = 50920 AND cost_credits < 5;

-- Fix remaining free items in active catalog (except front page)
UPDATE catalog_items SET cost_credits = 3 
WHERE cost_credits = 0 AND cost_points = 0 
AND page_id NOT IN (1, 308)
AND page_id IN (SELECT id FROM catalog_pages WHERE visible = '1' AND enabled = '1');
