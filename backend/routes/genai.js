const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../supabase');
require('dotenv').config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('⚠️ Could not initialize Gemini SDK:', err.message);
  }
}

// POST /api/genai/chat - Dynamic Grounded AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, establishmentId } = req.body;
    const query = (message || '').trim();

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query message is required' });
    }

    // 1. Fetch live database context specifically for queried establishment
    let targetEst = null;
    let inspections = [];
    let violations = [];

    if (establishmentId) {
      targetEst = await db.getEstablishmentById(establishmentId);
      if (targetEst) {
        inspections = await db.getInspections(establishmentId);
        violations = await db.getViolations({ establishment_id: establishmentId });
      }
    }

    // Fallback: If no ID was sent, check if establishment name is mentioned in query
    if (!targetEst) {
      const allEsts = await db.getEstablishments();
      targetEst = allEsts.find(e => query.toLowerCase().includes(e.name.toLowerCase()));
      if (targetEst) {
        inspections = await db.getInspections(targetEst.id);
        violations = await db.getViolations({ establishment_id: targetEst.id });
      }
    }

    // 2. Build Grounded Context
    let contextData = '';
    if (targetEst) {
      const activeViolations = violations.filter(v => v.corrective_action_status !== 'Resolved' && v.corrective_action_status !== 'Closed');
      const criticalViolations = activeViolations.filter(v => v.severity === 'Critical');

      contextData = `
TARGET FACILITY RECORD:
- Facility Name: ${targetEst.name} (Type: ${targetEst.type})
- Current Risk Score: ${targetEst.risk_score} / 100
- Risk Category: ${targetEst.risk_category}
- Zone: ${targetEst.zone}
- Last Inspected Date: ${targetEst.last_inspection_date || 'No recorded audit'}
- Total Audits on Record: ${inspections.length}
- Total Unresolved Violations: ${activeViolations.length}
- Critical Unresolved Violations: ${criticalViolations.length}

VIOLATION LOG:
${activeViolations.length > 0 ? JSON.stringify(activeViolations.map(v => ({
  category: v.category,
  severity: v.severity,
  description: v.description,
  status: v.corrective_action_status
})), null, 2) : 'No unresolved violations.'}
`;
    } else {
      const allEsts = await db.getEstablishments();
      const criticalEsts = allEsts.filter(e => e.risk_category === 'CRITICAL');
      contextData = `
MUNICIPAL PUBLIC HEALTH SUMMARY:
- Total Monitored Establishments: ${allEsts.length}
- Critical Risk Facilities (${criticalEsts.length}): ${criticalEsts.map(e => `${e.name} (Score: ${e.risk_score})`).join(', ')}
`;
    }

    // 3. Attempt live call to Gemini API
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `
You are SafePlate Copilot, an expert AI assistant for municipal food safety officers and establishment managers.
Analyze the user's question using ONLY the provided verified database context below.
Be concise, professional, and data-backed. Never invent citations or violation facts.

VERIFIED DATABASE CONTEXT:
${contextData}

USER QUERY:
${query}
`;
        const result = await model.generateContent(systemPrompt);
        const aiResponse = result.response.text();

        return res.json({
          success: true,
          source: 'gemini-1.5-flash',
          reply: aiResponse
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, using dynamic database fallback:', geminiError.message);
      }
    }

    // 4. Grounded Dynamic Fallback (Accurate to the queried establishment)
    let fallbackReply = '';
    if (targetEst) {
      const activeViolations = violations.filter(v => v.corrective_action_status !== 'Resolved' && v.corrective_action_status !== 'Closed');
      const criticalCount = activeViolations.filter(v => v.severity === 'Critical').length;

      fallbackReply = `**${targetEst.name}** is currently designated as **${targetEst.risk_category}** with a compliance risk score of **${targetEst.risk_score}/100**.\n\n` +
        `- **Location & Zone:** ${targetEst.address} (${targetEst.zone})\n` +
        `- **Audit Record:** ${inspections.length} inspection(s) logged. Last audit: ${targetEst.last_inspection_date || 'N/A'}.\n` +
        `- **Active Violations:** ${activeViolations.length} unresolved issue(s) (${criticalCount} Critical).\n\n` +
        (criticalCount > 0
          ? `Priority enforcement recommended due to open critical infractions: ${activeViolations.filter(v => v.severity === 'Critical').map(v => v.category).join(', ')}.`
          : `Facility maintains standard compliance standing with no immediate critical health hazards.`);
    } else {
      fallbackReply = `SafePlate Municipal Intelligence is currently monitoring food safety compliance across all municipal zones. For a specific facility analysis, please select an establishment or mention its name.`;
    }

    return res.json({
      success: true,
      source: 'grounded-database-engine',
      reply: fallbackReply
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/genai/explain-risk - Direct Risk Reasoning
router.post('/explain-risk', async (req, res) => {
  try {
    const { establishmentId } = req.body;
    if (!establishmentId) {
      return res.status(400).json({ success: false, message: 'establishmentId is required' });
    }

    const est = await db.getEstablishmentById(establishmentId);
    if (!est) {
      return res.status(404).json({ success: false, message: 'Establishment not found' });
    }

    const violations = await db.getViolations({ establishment_id: establishmentId });
    const active = violations.filter(v => v.corrective_action_status !== 'Resolved' && v.corrective_action_status !== 'Closed');

    res.json({
      success: true,
      establishment: est.name,
      risk_score: est.risk_score,
      risk_category: est.risk_category,
      unresolved_violations_count: active.length,
      explanation: `Calculated from base score (15) plus ${active.length} active violations across critical and major hazard categories.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/genai/detect-violation-image (AI Vision Demonstration Simulation)
router.post('/detect-violation-image', async (req, res) => {
  try {
    const { profile = 'cooler' } = req.body;

    const PRESETS = {
      cooler: {
        category: "Temperature",
        severity: "Critical",
        description: "Refrigeration display unit registering 53.4°F ambient air temp; unsafe storage threshold exceeded.",
        recommendedAction: "Immediately service evaporator coil and relocate perishable items to walk-in cooler."
      },
      pantry: {
        category: "Pest",
        severity: "Major",
        description: "Dry storage packaging displays evidence of pest intrusion and improper ground clearance.",
        recommendedAction: "Sanitize shelving, install perimeter pest traps, and elevate containers 6 inches above floor."
      },
      prep: {
        category: "Cross-Contamination",
        severity: "Critical",
        description: "Raw poultry preparation observed on board designated for ready-to-eat vegetables.",
        recommendedAction: "Sanitize station immediately and conduct staff re-training on color-coded board protocols."
      },
      sink: {
        category: "Sanitation",
        severity: "Major",
        description: "Handwashing station lacks required paper towel dispenser and soap cartridge.",
        recommendedAction: "Restock handwashing supplies immediately prior to next food preparation shift."
      }
    };

    const detected = PRESETS[profile] || PRESETS.cooler;

    res.json({
      success: true,
      data: {
        ...detected,
        confidence: 0.96,
        model: "SafePlate-CV-FoodSafety-v2 (Demo Pipeline)"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;