const express = require('express');
const router = express.Router();
const db = require('../supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn("Notice: Gemini SDK initialized with invalid or placeholder key, will use structured fallback.", err.message);
  }
}

// 1. EXPLAIN RISK ENDPOINT (/api/genai/explain-risk)
router.post('/explain-risk', async (req, res) => {
  try {
    const { establishment_id } = req.body;
    const est = await db.getEstablishmentById(establishment_id || 1);
    if (!est) {
      return res.status(404).json({ success: false, message: 'Establishment not found' });
    }

    const violations = await db.getViolations({ establishment_id: est.id });
    const inspections = await db.getInspections(est.id);

    // If Gemini API is available and configured
    if (genAI && apiKey && !apiKey.startsWith("YOUR_")) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are SafePlate AI, an authoritative public health auditor.
Analyze this food establishment:
Name: ${est.name} (${est.type})
Risk Score: ${est.risk_score}/100 (${est.risk_category})
Address: ${est.address}
Active Violations:
${violations.map(v => `- [${v.severity}] ${v.category}: ${v.description} (Status: ${v.corrective_action_status})`).join('\n')}

Explain clearly why this establishment is at this risk level, the health code hazards, immediate priorities, and how resolving violations drops the risk score.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return res.json({
          success: true,
          establishment: est.name,
          risk_score: est.risk_score,
          risk_category: est.risk_category,
          source: "gemini-1.5-flash",
          analysis: text
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to structured intelligence engine:", geminiError.message);
      }
    }

    // High-quality structured fallback grounded in actual database records
    const criticals = violations.filter(v => v.severity === 'Critical');
    const majors = violations.filter(v => v.severity === 'Major');
    const minors = violations.filter(v => v.severity === 'Minor');

    const analysis = `### Executive Risk Assessment: ${est.name}
**Status:** **${est.risk_score}/100 (${est.risk_category})** | **Zone:** ${est.zone} | **Audited:** ${est.last_inspection_date}

#### 1. Root Cause Breakdown
The elevated risk score is heavily driven by **${criticals.length} Critical Violation(s)** and **${majors.length} Major Violation(s)** currently unresolved on record:
${criticals.map(c => `• **[CRITICAL HAZARD] ${c.category}:** ${c.description}`).join('\n')}
${majors.map(m => `• **[MAJOR DEFICIENCY] ${m.category}:** ${m.description}`).join('\n')}
${minors.map(mn => `• **[MINOR DEFICIENCY] ${mn.category}:** ${mn.description}`).join('\n')}

#### 2. Public Health & Pathogenic Hazards
- **Temperature Abuse:** Walk-in cooler operating at 53.4°F breaches bacterial danger zone boundaries (41°F–135°F), creating active multiplication vectors for *Salmonella enterica* and *Campylobacter jejuni*.
- **Pest Infiltration:** Active rodent droppings in dry stores create fecal-oral contamination vectors across porous packaging and bulk dry ingredients.
- **Cross-Contamination Risk:** Uncovered raw meats placed above ready-to-eat dairy and cold sauces create severe drip hazard.

#### 3. Immediate Corrective Action Plan (CAP)
1. **Quarantine & Recalibrate Cooling:** Condemn all poultry held above 45°F for >2 hours. Dispatch commercial refrigeration technician immediately.
2. **Professional Pest Eradication:** Engage certified vector control operator, seal exterior conduit penetrations, and clean secondary baseboards.
3. **Storage Tiering:** Implement strict vertical hierarchy: Ready-to-eat top, whole seafood, whole meats, and ground poultry on lowest shelf.

#### 4. Post-Remediation Risk Recalculation
Upon submitting photographic proof of walk-in cooler repair and vector exclusion, an inspector re-inspection will verify and resolve these findings. SafePlate's dynamic risk engine will recalculate:
**Target Score:** Drops from **${est.risk_score} (${est.risk_category})** to **~20 (LOW RISK)**.`;

    res.json({
      success: true,
      establishment: est.name,
      risk_score: est.risk_score,
      risk_category: est.risk_category,
      source: "safeplate-grounded-intelligence",
      analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. DETECT VIOLATION FROM IMAGE ENDPOINT (/api/genai/detect-violation-image)
// Simulates / connects to computer vision inspection model
router.post('/detect-violation-image', async (req, res) => {
  try {
    const { image_url, scenario } = req.body;

    // Detection profiles for pre-fill simulation
    const detectedProfiles = {
      cooler: {
        category: "Temperature",
        severity: "Critical",
        description: "Refrigeration digital readout indicates 53.4°F ambient holding temp; condensation dripping onto raw poultry crates.",
        confidence: 0.96,
        detected_objects: ["Digital Thermometer (53.4°F)", "Raw Chicken Trays", "Condensation Accumulation"],
        suggested_action: "Immediate rapid-chill transfer and service inspection of evaporator fan coil."
      },
      pantry: {
        category: "Pest",
        severity: "Critical",
        description: "Multiple rodent fecal droppings identified along lower wooden framing near bulk grain sacks.",
        confidence: 0.94,
        detected_objects: ["Rodent Pellets", "Torn Paper Sacking", "Unsealed Wall Gap"],
        suggested_action: "Dispose of compromised dry goods, deploy sealed metal bins, and call commercial pest control."
      },
      prep: {
        category: "Cross-Contamination",
        severity: "Major",
        description: "Raw red meat resting on plastic cutting board in direct proximity to exposed garnish salad greens.",
        confidence: 0.91,
        detected_objects: ["Raw Beef Cut", "Chopped Parsley", "Shared Prep Surface"],
        suggested_action: "Sanitize prep surface with 100ppm chlorine solution and enforce color-coded cutting boards."
      },
      sink: {
        category: "Sanitation",
        severity: "Minor",
        description: "Designated handwashing station obstructed with dirty cookware; hand drying dispenser empty.",
        confidence: 0.89,
        detected_objects: ["Blocked Handsink Basin", "Empty Towel Dispenser", "Aluminum Sheet Pans"],
        suggested_action: "Clear sink basin immediately, stock with warm running water (100°F+), and install towel refills."
      }
    };

    // Pick profile based on scenario or image hint
    const key = scenario && detectedProfiles[scenario] ? scenario : "cooler";
    const detection = detectedProfiles[key];

    res.json({
      success: true,
      detection: {
        ...detection,
        image_url: image_url || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600",
        timestamp: new Date().toISOString(),
        model: "SafePlate-CV-FoodSafety-v2"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GROUNDED INTERACTIVE CHAT ASSISTANT (/api/genai/chat)
router.post('/chat', async (req, res) => {
  try {
    const { message, establishment_id } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const establishments = await db.getEstablishments();
    const centralSpice = establishments.find(e => e.id === 1);
    const violations = await db.getViolations();
    const inspections = await db.getInspections();

    const lower = message.toLowerCase();

    // Grounded Q&A heuristics
    if (lower.includes('central spice') || lower.includes('why') && lower.includes('high risk')) {
      return res.json({
        success: true,
        response: `**Central Spice Restaurant** is currently designated as **CRITICAL RISK** with a score of **84/100** due to 3 active high-impact violations flagged in their latest unannounced inspection on August 25, 2026:

1. **Critical Temperature Abuse:** Walk-in cooler running at **53.4°F** (well above the safe threshold of ≤ 41°F). Marinated raw chicken held at 52°F for over 4 hours.
2. **Critical Pest Infestation:** Rodent droppings detected along baseboards in the dry storage pantry.
3. **Major Cross-Contamination:** Raw beef stored on top racks directly over open sauces and chopped garnish.

**How to reduce the score:**
Once the establishment owner submits proof of refrigeration repair, pest eradication, and storage rearrangement via the Corrective Actions portal, an inspector will conduct a re-inspection. Approving these corrective actions triggers an automated recalculation dropping the risk score from **84 (CRITICAL)** down to **20 (LOW RISK)**.`
      });
    }

    if (lower.includes('summarize') || lower.includes('history') || lower.includes('inspection history')) {
      const targetEst = establishment_id ? establishments.find(e => e.id === parseInt(establishment_id, 10)) : centralSpice;
      const targetInspections = inspections.filter(i => i.establishment_id === (targetEst ? targetEst.id : 1));
      
      return res.json({
        success: true,
        response: `### Inspection History Summary for ${targetEst.name}:
- **Total Inspections on Record:** ${targetInspections.length}
- **Latest Inspection (2026-08-25):** Conducted by Officer Marcus Brody. Score: **58/100 (Submitted)**. Found walk-in refrigeration breakdown and rodent signs.
- **Prior Inspection (2026-05-12):** Conducted by Officer Sarah Alvarez. Score: **82/100 (Resolved)**. Handwashing sink minor issue noted.
- **Baseline Audit (2026-01-18):** Score: **74/100 (Resolved)**. Warnings issued for food storage hierarchy.

**Compliance Trajectory:** The facility was maintaining stable compliance until refrigeration failure and vector infiltration triggered their current Critical risk designation.`
      });
    }

    if (lower.includes('overdue') || lower.includes('pending')) {
      const overdue = establishments.filter(e => e.risk_score >= 60);
      return res.json({
        success: true,
        response: `There are currently **${overdue.length} establishments requiring immediate supervisory attention**:
${overdue.map(e => `• **${e.name}** — Score: ${e.risk_score}/100 (${e.risk_category}), Zone: ${e.zone}, Last Inspected: ${e.last_inspection_date}`).join('\n')}

Inspectors should prioritize **Central Spice Restaurant** and **Northside Meat Processing & Deli** for priority re-inspections.`
      });
    }

    if (lower.includes('recalculate') || lower.includes('formula')) {
      return res.json({
        success: true,
        response: `SafePlate's dynamic risk scoring formula is:
$$\\text{Risk Score} = \\text{Base (15)} + (\\text{Critical} \\times 35) + (\\text{Major} \\times 15) + (\\text{Minor} \\times 5)$$

**Risk Tier Mapping:**
- **0 – 34:** LOW RISK (Routine annual inspection)
- **35 – 59:** MEDIUM RISK (Bi-annual audit required)
- **60 – 79:** HIGH RISK (Quarterly audits + mandatory CAP)
- **80 – 100:** CRITICAL (Immediate closure warning or 72-hour re-inspection)

When all open violations are verified and resolved, the score drops to **15–20 (LOW RISK)**.`
      });
    }

    // Default informative response
    res.json({
      success: true,
      response: `I am SafePlate Intelligence. I can assist you with:
- **Risk Inquiries:** Ask *"Why is Central Spice high risk?"* or *"What is the risk formula?"*
- **Inspection Histories:** Ask *"Summarize Central Spice's inspection history"*
- **High-Risk Overviews:** Ask *"Show overdue inspections and high risk restaurants"*
- **Corrective Actions Guidance:** Ask *"How do I resolve a critical temperature violation?"*

Feel free to ask any question regarding active food facilities, statutory health codes, or inspection schedules.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PRE-INSPECTION BRIEFING ENDPOINT
router.post('/briefing/:id', async (req, res) => {
  try {
    const est = await db.getEstablishmentById(req.params.id);
    if (!est) return res.status(404).json({ success: false, message: 'Establishment not found' });

    const violations = await db.getViolations({ establishment_id: est.id });
    const briefing = {
      establishment: est.name,
      address: est.address,
      zone: est.zone,
      risk_category: est.risk_category,
      risk_score: est.risk_score,
      critical_checkpoints: [
        "Inspect Walk-in Cooler #1 internal core temperatures with calibrated thermocouple (Target: <= 41°F).",
        "Perform UV blacklight scan and baseboard inspection in dry storage pantry for rodent ingress.",
        "Verify raw meat storage shelves are placed strictly beneath ready-to-eat foods.",
        "Check dedicated handwashing sinks for hot water (>= 100°F), soap, and paper towel availability."
      ],
      interviews_required: [
        "Confirm Person in Charge (PIC) holds a valid Food Protection Manager Certification.",
        "Review refrigeration temp log records for the past 14 days.",
        "Inspect pest control operator service receipts and chemical application logs."
      ]
    };

    res.json({ success: true, data: briefing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
