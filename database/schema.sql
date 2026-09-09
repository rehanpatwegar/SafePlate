-- SafePlate Food Safety Inspection & Risk Management Platform
-- PostgreSQL Database Schema & Realistic Seed Data

-- 1. DROP EXISTING TABLES IF ANY
DROP TABLE IF EXISTS corrective_actions CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;

-- 2. CREATE EXTENSIONS (UUID support if deployed on Postgres/Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. ESTABLISHMENTS TABLE
CREATE TABLE establishments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Restaurant, Cafeteria, Bakery, Food Truck, Hospital Kitchen, Deli, Supermarket
    address VARCHAR(255) NOT NULL,
    zone VARCHAR(50) NOT NULL,  -- Zone A, Zone B, Zone C, Downtown, Northside, Harbor
    risk_score INTEGER NOT NULL DEFAULT 15, -- 0 to 100
    risk_category VARCHAR(50) NOT NULL DEFAULT 'LOW RISK', -- LOW RISK, MEDIUM RISK, HIGH RISK, CRITICAL
    last_inspection_date DATE,
    phone VARCHAR(50),
    email VARCHAR(100),
    owner_name VARCHAR(100),
    operating_license VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INSPECTIONS TABLE
CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    establishment_id INTEGER REFERENCES establishments(id) ON DELETE CASCADE,
    inspector_name VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- Scheduled, In Progress, Submitted, Resolved
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. VIOLATIONS TABLE
CREATE TABLE violations (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- Improper Storage, Temperature, Sanitation, Pest, Cross-Contamination
    severity VARCHAR(50) NOT NULL,  -- Minor, Major, Critical
    description TEXT NOT NULL,
    evidence_image_url TEXT,
    corrective_action_status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, In Review, Resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CORRECTIVE ACTIONS TABLE
CREATE TABLE corrective_actions (
    id SERIAL PRIMARY KEY,
    violation_id INTEGER REFERENCES violations(id) ON DELETE CASCADE,
    action_taken TEXT NOT NULL,
    evidence_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted', -- Submitted, Approved, Rejected
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_establishments_risk ON establishments(risk_category, risk_score);
CREATE INDEX idx_inspections_establishment ON inspections(establishment_id);
CREATE INDEX idx_violations_inspection ON violations(inspection_id);
CREATE INDEX idx_corrective_actions_violation ON corrective_actions(violation_id);

-- =========================================================================
-- SEED DATA (10 Diverse Food Establishments)
-- Central Spice Restaurant is featured as the core high-risk case study (84/100, CRITICAL)
-- =========================================================================

INSERT INTO establishments (id, name, type, address, zone, risk_score, risk_category, last_inspection_date, phone, email, owner_name, operating_license)
VALUES
(1, 'Central Spice Restaurant', 'Restaurant', '442 Grand Avenue, Downtown', 'Zone A', 84, 'CRITICAL', '2026-08-25', '(555) 234-9812', 'manager@centralspice.com', 'Rajesh Patel', 'LIC-2024-09881'),
(2, 'Golden Dragon Bistro', 'Restaurant', '128 East River Rd, Chinatown', 'Zone B', 52, 'MEDIUM RISK', '2026-08-10', '(555) 765-4321', 'contact@goldendragon.com', 'Mei-Ling Chen', 'LIC-2023-01442'),
(3, 'Fresh Greens Salad Bar', 'Cafeteria', '89 Financial Square, Suite 100', 'Zone A', 14, 'LOW RISK', '2026-08-28', '(555) 441-9982', 'info@freshgreens.io', 'Sarah Jenkins', 'LIC-2025-00129'),
(4, 'Harbor Seafood Market & Grill', 'Restaurant', '15 Marina Pier Way', 'Zone C', 68, 'HIGH RISK', '2026-08-14', '(555) 887-1234', 'dock@harborseafood.com', 'Captain Marco Rossi', 'LIC-2022-07615'),
(5, 'Metro General Hospital Kitchen', 'Hospital Kitchen', '500 Medical Center Blvd', 'Zone A', 8, 'LOW RISK', '2026-09-01', '(555) 990-0011', 'dietary@metrohealth.org', 'Dr. Aris Thorne', 'LIC-2021-00041'),
(6, 'City Center Bakery & Cafe', 'Bakery', '210 Maple Street, West End', 'Zone B', 22, 'LOW RISK', '2026-08-19', '(555) 321-4567', 'hello@citycenterbakery.com', 'Elena Rostova', 'LIC-2024-03318'),
(7, 'Taco Libre Mobile Truck', 'Food Truck', 'Rotates across Waterfront Plaza', 'Zone C', 45, 'MEDIUM RISK', '2026-08-04', '(555) 554-1290', 'tacos@libre.com', 'Carlos Gutierrez', 'LIC-2025-08119'),
(8, 'St. Jude Senior Living Cafeteria', 'Cafeteria', '1040 Oakwood Lane, North Hill', 'Zone A', 18, 'LOW RISK', '2026-08-30', '(555) 670-3412', 'dining@stjudecare.org', 'Patricia Moore', 'LIC-2020-00192'),
(9, 'Northside Meat Processing & Deli', 'Deli', '710 Industrial Parkway', 'Zone B', 74, 'HIGH RISK', '2026-08-01', '(555) 432-8876', 'butcher@northsidedeli.com', 'Viktor Kowalski', 'LIC-2023-09112'),
(10, 'University Student Union Diner', 'Cafeteria', '300 Campus Drive, South Hall', 'Zone C', 38, 'MEDIUM RISK', '2026-07-29', '(555) 819-2044', 'dining@stateuniv.edu', 'Marcus Vance', 'LIC-2022-04981');

-- SEED INSPECTIONS FOR CENTRAL SPICE & OTHERS
INSERT INTO inspections (id, establishment_id, inspector_name, inspection_date, status, score, notes)
VALUES
(1, 1, 'Officer Marcus Brody', '2026-08-25', 'Submitted', 58, 'Routine unannounced inspection revealed severe refrigeration failure and evidence of rodent activity in secondary dry store.'),
(2, 1, 'Officer Sarah Alvarez', '2026-05-12', 'Resolved', 82, 'Follow-up inspection noted corrected hot holding temperature; minor handwashing station re-stocking needed.'),
(3, 1, 'Officer Sarah Alvarez', '2026-01-18', 'Resolved', 74, 'Annual baseline inspection. Issued warnings for improper raw chicken storage over fresh produce.'),
(4, 2, 'Officer Marcus Brody', '2026-08-10', 'Submitted', 72, 'Walk-in thermometer calibration off by 6 degrees F. Grease trap accumulation requires servicing.'),
(5, 3, 'Officer Sarah Alvarez', '2026-08-28', 'Resolved', 96, 'Exemplary cold buffet temperature controls and documented HACCP logs.'),
(6, 4, 'Officer David Sterling', '2026-08-14', 'Submitted', 64, 'Raw shellfish stored at 48°F. Shellstock tags missing for two batches of Atlantic oysters.'),
(7, 9, 'Officer David Sterling', '2026-08-01', 'Submitted', 60, 'Slicer blade encrusted with dried meat residues. Sanitizer concentration below 50ppm quaternary ammonium.');

-- SEED VIOLATIONS FOR CENTRAL SPICE (RESTAURANT 1) THAT DRIVE ITS 84 CRITICAL RISK SCORE
INSERT INTO violations (id, inspection_id, category, severity, description, evidence_image_url, corrective_action_status)
VALUES
(1, 1, 'Temperature', 'Critical', 'Walk-in cooler internal ambient temp reading 53.4°F (Safe limit <= 41°F). Raw marinated chicken breast held at 52°F for over 4 hours.', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600', 'Pending'),
(2, 1, 'Pest', 'Critical', 'Rodent droppings observed along the perimeter baseboard of the dry storage pantry and near bulk flour sacks.', 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600', 'Pending'),
(3, 1, 'Cross-Contamination', 'Major', 'Uncovered raw beef trays stored directly on top shelves above open containers of prepared yogurt sauces and chopped cilantro.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', 'Pending'),
(4, 1, 'Sanitation', 'Minor', 'Handsink in primary prep cook line blocked by stacked metal hotel pans; no paper towel rolls inside dispenser.', 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600', 'Pending'),
(5, 4, 'Temperature', 'Major', 'Walk-in display reach-in refrigeration running at 47°F. Corrective recalibration ordered.', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600', 'Pending'),
(6, 6, 'Improper Storage', 'Critical', 'Raw oysters held without required supplier certification tags and stored next to cooked shrimp.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', 'Pending'),
(7, 7, 'Sanitation', 'Major', 'Commercial electric meat deli slicer not sanitized every 4 hours as mandated by public health code.', 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600', 'Pending');

-- SEED CORRECTIVE ACTIONS (One previously resolved action for historical reference)
INSERT INTO corrective_actions (id, violation_id, action_taken, evidence_url, submitted_at, status, verified_by, verified_at)
VALUES
(1, 4, 'Cleared all prep pans from handwashing sink, installed heavy-duty touchless dispenser, and fully stocked antibacterial soap and paper towels.', 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600', '2026-08-26 14:30:00+00', 'Submitted', NULL, NULL);

-- UPDATE SEQUENCES
SELECT setval('establishments_id_seq', (SELECT MAX(id) FROM establishments));
SELECT setval('inspections_id_seq', (SELECT MAX(id) FROM inspections));
SELECT setval('violations_id_seq', (SELECT MAX(id) FROM violations));
SELECT setval('corrective_actions_id_seq', (SELECT MAX(id) FROM corrective_actions));
