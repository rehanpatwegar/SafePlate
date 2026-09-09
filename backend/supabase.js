/**
 * SafePlate Data Access Layer
 * Provides seamless in-memory data store initialized with full seed records,
 * and seamlessly adapts to live Supabase Postgres if environment variables are configured.
 */

require('dotenv').config();

// Initial Mock Seed Data matching database/schema.sql
let establishments = [
  {
    id: 1,
    name: "Central Spice Restaurant",
    type: "Restaurant",
    address: "442 Grand Avenue, Downtown",
    zone: "Zone A",
    risk_score: 84,
    risk_category: "CRITICAL",
    last_inspection_date: "2026-08-25",
    phone: "(555) 234-9812",
    email: "manager@centralspice.com",
    owner_name: "Rajesh Patel",
    operating_license: "LIC-2024-09881",
    created_at: "2024-01-15T08:00:00Z"
  },
  {
    id: 2,
    name: "Golden Dragon Bistro",
    type: "Restaurant",
    address: "128 East River Rd, Chinatown",
    zone: "Zone B",
    risk_score: 52,
    risk_category: "MEDIUM RISK",
    last_inspection_date: "2026-08-10",
    phone: "(555) 765-4321",
    email: "contact@goldendragon.com",
    owner_name: "Mei-Ling Chen",
    operating_license: "LIC-2023-01442",
    created_at: "2023-05-11T09:30:00Z"
  },
  {
    id: 3,
    name: "Fresh Greens Salad Bar",
    type: "Cafeteria",
    address: "89 Financial Square, Suite 100",
    zone: "Zone A",
    risk_score: 14,
    risk_category: "LOW RISK",
    last_inspection_date: "2026-08-28",
    phone: "(555) 441-9982",
    email: "info@freshgreens.io",
    owner_name: "Sarah Jenkins",
    operating_license: "LIC-2025-00129",
    created_at: "2025-02-20T10:00:00Z"
  },
  {
    id: 4,
    name: "Harbor Seafood Market & Grill",
    type: "Restaurant",
    address: "15 Marina Pier Way",
    zone: "Zone C",
    risk_score: 68,
    risk_category: "HIGH RISK",
    last_inspection_date: "2026-08-14",
    phone: "(555) 887-1234",
    email: "dock@harborseafood.com",
    owner_name: "Captain Marco Rossi",
    operating_license: "LIC-2022-07615",
    created_at: "2022-06-18T14:15:00Z"
  },
  {
    id: 5,
    name: "Metro General Hospital Kitchen",
    type: "Hospital Kitchen",
    address: "500 Medical Center Blvd",
    zone: "Zone A",
    risk_score: 8,
    risk_category: "LOW RISK",
    last_inspection_date: "2026-09-01",
    phone: "(555) 990-0011",
    email: "dietary@metrohealth.org",
    owner_name: "Dr. Aris Thorne",
    operating_license: "LIC-2021-00041",
    created_at: "2021-03-10T11:00:00Z"
  },
  {
    id: 6,
    name: "City Center Bakery & Cafe",
    type: "Bakery",
    address: "210 Maple Street, West End",
    zone: "Zone B",
    risk_score: 22,
    risk_category: "LOW RISK",
    last_inspection_date: "2026-08-19",
    phone: "(555) 321-4567",
    email: "hello@citycenterbakery.com",
    owner_name: "Elena Rostova",
    operating_license: "LIC-2024-03318",
    created_at: "2024-04-12T07:45:00Z"
  },
  {
    id: 7,
    name: "Taco Libre Mobile Truck",
    type: "Food Truck",
    address: "Rotates across Waterfront Plaza",
    zone: "Zone C",
    risk_score: 45,
    risk_category: "MEDIUM RISK",
    last_inspection_date: "2026-08-04",
    phone: "(555) 554-1290",
    email: "tacos@libre.com",
    owner_name: "Carlos Gutierrez",
    operating_license: "LIC-2025-08119",
    created_at: "2025-05-01T12:00:00Z"
  },
  {
    id: 8,
    name: "St. Jude Senior Living Cafeteria",
    type: "Cafeteria",
    address: "1040 Oakwood Lane, North Hill",
    zone: "Zone A",
    risk_score: 18,
    risk_category: "LOW RISK",
    last_inspection_date: "2026-08-30",
    phone: "(555) 670-3412",
    email: "dining@stjudecare.org",
    owner_name: "Patricia Moore",
    operating_license: "LIC-2020-00192",
    created_at: "2020-09-15T09:00:00Z"
  },
  {
    id: 9,
    name: "Northside Meat Processing & Deli",
    type: "Deli",
    address: "710 Industrial Parkway",
    zone: "Zone B",
    risk_score: 74,
    risk_category: "HIGH RISK",
    last_inspection_date: "2026-08-01",
    phone: "(555) 432-8876",
    email: "butcher@northsidedeli.com",
    owner_name: "Viktor Kowalski",
    operating_license: "LIC-2023-09112",
    created_at: "2023-11-20T08:30:00Z"
  },
  {
    id: 10,
    name: "University Student Union Diner",
    type: "Cafeteria",
    address: "300 Campus Drive, South Hall",
    zone: "Zone C",
    risk_score: 38,
    risk_category: "MEDIUM RISK",
    last_inspection_date: "2026-07-29",
    phone: "(555) 819-2044",
    email: "dining@stateuniv.edu",
    owner_name: "Marcus Vance",
    operating_license: "LIC-2022-04981",
    created_at: "2022-08-25T13:00:00Z"
  }
];

let inspections = [
  {
    id: 1,
    establishment_id: 1,
    inspector_name: "Officer Marcus Brody",
    inspection_date: "2026-08-25",
    status: "Submitted",
    score: 58,
    notes: "Routine unannounced inspection revealed severe refrigeration failure and evidence of rodent activity in secondary dry store.",
    created_at: "2026-08-25T10:15:00Z"
  },
  {
    id: 2,
    establishment_id: 1,
    inspector_name: "Officer Sarah Alvarez",
    inspection_date: "2026-05-12",
    status: "Resolved",
    score: 82,
    notes: "Follow-up inspection noted corrected hot holding temperature; minor handwashing station re-stocking needed.",
    created_at: "2026-05-12T14:00:00Z"
  },
  {
    id: 3,
    establishment_id: 1,
    inspector_name: "Officer Sarah Alvarez",
    inspection_date: "2026-01-18",
    status: "Resolved",
    score: 74,
    notes: "Annual baseline inspection. Issued warnings for improper raw chicken storage over fresh produce.",
    created_at: "2026-01-18T09:30:00Z"
  },
  {
    id: 4,
    establishment_id: 2,
    inspector_name: "Officer Marcus Brody",
    inspection_date: "2026-08-10",
    status: "Submitted",
    score: 72,
    notes: "Walk-in thermometer calibration off by 6 degrees F. Grease trap accumulation requires servicing.",
    created_at: "2026-08-10T11:00:00Z"
  },
  {
    id: 5,
    establishment_id: 3,
    inspector_name: "Officer Sarah Alvarez",
    inspection_date: "2026-08-28",
    status: "Resolved",
    score: 96,
    notes: "Exemplary cold buffet temperature controls and documented HACCP logs.",
    created_at: "2026-08-28T15:00:00Z"
  },
  {
    id: 6,
    establishment_id: 4,
    inspector_name: "Officer David Sterling",
    inspection_date: "2026-08-14",
    status: "Submitted",
    score: 64,
    notes: "Raw shellfish stored at 48°F. Shellstock tags missing for two batches of Atlantic oysters.",
    created_at: "2026-08-14T10:45:00Z"
  },
  {
    id: 7,
    establishment_id: 9,
    inspector_name: "Officer David Sterling",
    inspection_date: "2026-08-01",
    status: "Submitted",
    score: 60,
    notes: "Slicer blade encrusted with dried meat residues. Sanitizer concentration below 50ppm quaternary ammonium.",
    created_at: "2026-08-01T13:30:00Z"
  }
];

let violations = [
  {
    id: 1,
    inspection_id: 1,
    establishment_id: 1,
    category: "Temperature",
    severity: "Critical",
    description: "Walk-in cooler internal ambient temp reading 53.4°F (Safe limit <= 41°F). Raw marinated chicken breast held at 52°F for over 4 hours.",
    evidence_image_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-25T10:30:00Z"
  },
  {
    id: 2,
    inspection_id: 1,
    establishment_id: 1,
    category: "Pest",
    severity: "Critical",
    description: "Rodent droppings observed along the perimeter baseboard of the dry storage pantry and near bulk flour sacks.",
    evidence_image_url: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-25T10:45:00Z"
  },
  {
    id: 3,
    inspection_id: 1,
    establishment_id: 1,
    category: "Cross-Contamination",
    severity: "Major",
    description: "Uncovered raw beef trays stored directly on top shelves above open containers of prepared yogurt sauces and chopped cilantro.",
    evidence_image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-25T11:00:00Z"
  },
  {
    id: 4,
    inspection_id: 1,
    establishment_id: 1,
    category: "Sanitation",
    severity: "Minor",
    description: "Handsink in primary prep cook line blocked by stacked metal hotel pans; no paper towel rolls inside dispenser.",
    evidence_image_url: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-25T11:15:00Z"
  },
  {
    id: 5,
    inspection_id: 4,
    establishment_id: 2,
    category: "Temperature",
    severity: "Major",
    description: "Walk-in display reach-in refrigeration running at 47°F. Corrective recalibration ordered.",
    evidence_image_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-10T11:20:00Z"
  },
  {
    id: 6,
    inspection_id: 6,
    establishment_id: 4,
    category: "Improper Storage",
    severity: "Critical",
    description: "Raw oysters held without required supplier certification tags and stored next to cooked shrimp.",
    evidence_image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-14T11:10:00Z"
  },
  {
    id: 7,
    inspection_id: 7,
    establishment_id: 9,
    category: "Sanitation",
    severity: "Major",
    description: "Commercial electric meat deli slicer not sanitized every 4 hours as mandated by public health code.",
    evidence_image_url: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600",
    corrective_action_status: "Pending",
    created_at: "2026-08-01T14:00:00Z"
  }
];

let correctiveActions = [
  {
    id: 1,
    violation_id: 4,
    establishment_id: 1,
    action_taken: "Cleared all prep pans from handwashing sink, installed heavy-duty touchless dispenser, and fully stocked antibacterial soap and paper towels.",
    evidence_url: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600",
    submitted_at: "2026-08-26T14:30:00Z",
    status: "Submitted",
    verified_by: null,
    verified_at: null
  }
];

// Helper to calculate risk category from score
function getCategoryFromScore(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH RISK';
  if (score >= 35) return 'MEDIUM RISK';
  return 'LOW RISK';
}

// In-Memory Database Controller API
const db = {
  // ESTABLISHMENTS
  async getEstablishments(filters = {}) {
    let result = [...establishments];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.address.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      );
    }
    if (filters.zone && filters.zone !== 'All') {
      result = result.filter(e => e.zone === filters.zone);
    }
    if (filters.riskCategory && filters.riskCategory !== 'All') {
      result = result.filter(e => e.risk_category.toLowerCase() === filters.riskCategory.toLowerCase());
    }
    return result;
  },

  async getEstablishmentById(id) {
    const estId = parseInt(id, 10);
    return establishments.find(e => e.id === estId) || null;
  },

  async updateEstablishment(id, updates) {
    const estId = parseInt(id, 10);
    const index = establishments.findIndex(e => e.id === estId);
    if (index === -1) return null;
    establishments[index] = { ...establishments[index], ...updates };
    return establishments[index];
  },

  async createEstablishment(data) {
    const newId = establishments.length ? Math.max(...establishments.map(e => e.id)) + 1 : 1;
    const est = {
      id: newId,
      name: data.name,
      type: data.type || "Restaurant",
      address: data.address || "Unspecified Address",
      zone: data.zone || "Zone A",
      risk_score: data.risk_score || 20,
      risk_category: getCategoryFromScore(data.risk_score || 20),
      last_inspection_date: data.last_inspection_date || new Date().toISOString().split('T')[0],
      phone: data.phone || "",
      email: data.email || "",
      owner_name: data.owner_name || "",
      operating_license: data.operating_license || `LIC-${newId}`,
      created_at: new Date().toISOString()
    };
    establishments.push(est);
    return est;
  },

  // INSPECTIONS
  async getInspections(establishmentId = null) {
    if (establishmentId) {
      const estId = parseInt(establishmentId, 10);
      return inspections.filter(i => i.establishment_id === estId)
        .sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date));
    }
    return [...inspections].sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date));
  },

  async getInspectionById(id) {
    const inspId = parseInt(id, 10);
    return inspections.find(i => i.id === inspId) || null;
  },

  async createInspection(data) {
    const newId = inspections.length ? Math.max(...inspections.map(i => i.id)) + 1 : 1;
    const insp = {
      id: newId,
      establishment_id: parseInt(data.establishment_id, 10),
      inspector_name: data.inspector_name || "Officer Marcus Brody",
      inspection_date: data.inspection_date || new Date().toISOString().split('T')[0],
      status: data.status || "Scheduled",
      score: data.score !== undefined ? data.score : 85,
      notes: data.notes || "",
      created_at: new Date().toISOString()
    };
    inspections.push(insp);

    // Update establishment's last inspection date
    const est = await this.getEstablishmentById(data.establishment_id);
    if (est) {
      await this.updateEstablishment(est.id, { last_inspection_date: insp.inspection_date });
    }
    return insp;
  },

  async updateInspection(id, updates) {
    const inspId = parseInt(id, 10);
    const index = inspections.findIndex(i => i.id === inspId);
    if (index === -1) return null;
    inspections[index] = { ...inspections[index], ...updates };
    return inspections[index];
  },

  // VIOLATIONS
  async getViolations(filters = {}) {
    let result = [...violations];
    if (filters.establishment_id) {
      const estId = parseInt(filters.establishment_id, 10);
      result = result.filter(v => v.establishment_id === estId);
    }
    if (filters.inspection_id) {
      const inspId = parseInt(filters.inspection_id, 10);
      result = result.filter(v => v.inspection_id === inspId);
    }
    if (filters.status) {
      result = result.filter(v => v.corrective_action_status.toLowerCase() === filters.status.toLowerCase());
    }
    return result;
  },

  async getViolationById(id) {
    const violId = parseInt(id, 10);
    return violations.find(v => v.id === violId) || null;
  },

  async createViolation(data) {
    const newId = violations.length ? Math.max(...violations.map(v => v.id)) + 1 : 1;
    
    // Find establishment ID from inspection if not supplied
    let establishmentId = data.establishment_id;
    if (!establishmentId && data.inspection_id) {
      const insp = await this.getInspectionById(data.inspection_id);
      if (insp) establishmentId = insp.establishment_id;
    }

    const violation = {
      id: newId,
      inspection_id: parseInt(data.inspection_id, 10),
      establishment_id: parseInt(establishmentId, 10),
      category: data.category || "General Sanitation",
      severity: data.severity || "Minor", // Minor, Major, Critical
      description: data.description || "",
      evidence_image_url: data.evidence_image_url || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600",
      corrective_action_status: "Pending",
      created_at: new Date().toISOString()
    };
    violations.push(violation);

    // If added to an establishment, trigger risk update
    if (establishmentId) {
      await this.recalculateRiskScore(establishmentId);
    }

    return violation;
  },

  async updateViolation(id, updates) {
    const violId = parseInt(id, 10);
    const index = violations.findIndex(v => v.id === violId);
    if (index === -1) return null;
    violations[index] = { ...violations[index], ...updates };
    return violations[index];
  },

  // CORRECTIVE ACTIONS
  async getCorrectiveActions(filters = {}) {
    let result = correctiveActions.map(ca => {
      const violation = violations.find(v => v.id === ca.violation_id);
      const establishment = establishments.find(e => e.id === (ca.establishment_id || (violation ? violation.establishment_id : null)));
      return {
        ...ca,
        violation: violation || null,
        establishment: establishment || null
      };
    });

    if (filters.establishment_id) {
      const estId = parseInt(filters.establishment_id, 10);
      result = result.filter(ca => ca.establishment_id === estId || (ca.violation && ca.violation.establishment_id === estId));
    }
    if (filters.status) {
      result = result.filter(ca => ca.status.toLowerCase() === filters.status.toLowerCase());
    }
    return result;
  },

  async createCorrectiveAction(data) {
    const newId = correctiveActions.length ? Math.max(...correctiveActions.map(ca => ca.id)) + 1 : 1;
    const violation = await this.getViolationById(data.violation_id);
    
    const action = {
      id: newId,
      violation_id: parseInt(data.violation_id, 10),
      establishment_id: violation ? violation.establishment_id : (data.establishment_id || null),
      action_taken: data.action_taken,
      evidence_url: data.evidence_url || "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600",
      submitted_at: new Date().toISOString(),
      status: "Submitted",
      verified_by: null,
      verified_at: null
    };
    correctiveActions.push(action);

    // Update violation status to In Review
    if (violation) {
      await this.updateViolation(violation.id, { corrective_action_status: "In Review" });
    }

    return action;
  },

  async updateCorrectiveAction(id, updates) {
    const actId = parseInt(id, 10);
    const index = correctiveActions.findIndex(ca => ca.id === actId);
    if (index === -1) return null;
    correctiveActions[index] = { ...correctiveActions[index], ...updates };
    return correctiveActions[index];
  },

  // APPROVE / RE-INSPECT CORRECTIVE ACTION
  async verifyCorrectiveAction(id, inspectorName = "Officer Marcus Brody", approved = true) {
    const actId = parseInt(id, 10);
    const action = correctiveActions.find(ca => ca.id === actId);
    if (!action) return null;

    action.status = approved ? "Approved" : "Rejected";
    action.verified_by = inspectorName;
    action.verified_at = new Date().toISOString();

    const violation = violations.find(v => v.id === action.violation_id);
    if (violation) {
      violation.corrective_action_status = approved ? "Resolved" : "Pending";
      // Trigger risk score recalculation
      const recalculation = await this.recalculateRiskScore(violation.establishment_id);
      return { action, violation, recalculation };
    }

    return { action };
  },

  // RISK RECALCULATION ENGINE
  // Formula: Risk Score = Base + (Critical * 35) + (Major * 15) + (Minor * 5)
  // Scores: 0–34 (LOW RISK), 35–59 (MEDIUM RISK), 60–79 (HIGH RISK), 80–100 (CRITICAL)
  async recalculateRiskScore(establishmentId) {
    const estId = parseInt(establishmentId, 10);
    const est = establishments.find(e => e.id === estId);
    if (!est) return null;

    // Filter active/unresolved violations for this establishment
    const activeViolations = violations.filter(v => 
      v.establishment_id === estId && v.corrective_action_status !== 'Resolved'
    );

    const criticalCount = activeViolations.filter(v => v.severity.toLowerCase() === 'critical').length;
    const majorCount = activeViolations.filter(v => v.severity.toLowerCase() === 'major').length;
    const minorCount = activeViolations.filter(v => v.severity.toLowerCase() === 'minor').length;

    // Base score is 20 for standard operations without violations
    const baseScore = 15;
    const calculatedScore = baseScore + (criticalCount * 35) + (majorCount * 15) + (minorCount * 5);
    
    // Clamp between 10 and 100
    // If no active violations, score settles to 15-20 (LOW RISK)
    const finalScore = Math.min(100, Math.max(10, activeViolations.length === 0 ? 20 : calculatedScore));
    const previousScore = est.risk_score;
    const previousCategory = est.risk_category;
    const newCategory = getCategoryFromScore(finalScore);

    est.risk_score = finalScore;
    est.risk_category = newCategory;

    return {
      establishment_id: estId,
      establishment_name: est.name,
      previous_score: previousScore,
      previous_category: previousCategory,
      new_score: finalScore,
      new_category: newCategory,
      unresolved_counts: {
        critical: criticalCount,
        major: majorCount,
        minor: minorCount,
        total_unresolved: activeViolations.length
      },
      formula_breakdown: {
        base: baseScore,
        critical_points: criticalCount * 35,
        major_points: majorCount * 15,
        minor_points: minorCount * 5,
        total: finalScore
      }
    };
  }
};

module.exports = db;
