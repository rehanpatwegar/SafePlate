const express = require('express');
const router = express.Router();
const db = require('../supabase');

require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function isGlobalQuestion(query) {
  return /\b(overdue|all facilities|all restaurants|high[- ]risk restaurants|high[- ]risk facilities|citywide|municipal)\b/i.test(query);
}

function createFallbackReply(targetEst, inspections, violations) {
  if (!targetEst) {
    return (
      'SafePlate is monitoring food-safety compliance across all municipal zones. ' +
      'Please mention a facility name, for example: “Why is Central Spice Restaurant high risk?”'
    );
  }

  const activeViolations = violations.filter(
    (violation) =>
      violation.corrective_action_status !== 'Resolved' &&
      violation.corrective_action_status !== 'Closed'
  );

  const criticalViolations = activeViolations.filter(
    (violation) => violation.severity === 'Critical'
  );

  return (
    `**${targetEst.name}** is currently classified as **${targetEst.risk_category}** ` +
    `with a risk score of **${targetEst.risk_score}/100**.\n\n` +
    `- **Location:** ${targetEst.address}, ${targetEst.zone}\n` +
    `- **Last inspection:** ${targetEst.last_inspection_date || 'No recorded inspection'}\n` +
    `- **Inspection records:** ${inspections.length}\n` +
    `- **Unresolved violations:** ${activeViolations.length}\n` +
    `- **Critical unresolved violations:** ${criticalViolations.length}\n\n` +
    (
      criticalViolations.length > 0
        ? `Priority action is recommended for: ${criticalViolations
            .map((violation) => violation.category)
            .join(', ')}.`
        : 'There are no open critical violations in the current record.'
    )
  );
}

function createMunicipalFallback(establishments) {
  const highRisk = establishments.filter(
    (establishment) =>
      establishment.risk_category === 'CRITICAL' ||
      establishment.risk_category === 'HIGH RISK'
  );

  return (
    `SafePlate is monitoring **${establishments.length}** facilities.\n\n` +
    `**High-risk facilities:**\n` +
    (
      highRisk.length
        ? highRisk
            .map(
              (establishment) =>
                `- ${establishment.name}: ${establishment.risk_score}/100 (${establishment.risk_category}), last inspected ${establishment.last_inspection_date || 'not recorded'}`
            )
            .join('\n')
        : '- No high-risk facilities are currently recorded.'
    )
  );
}

// POST /api/genai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, establishmentId } = req.body;
    const query = String(message || '').trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a question.'
      });
    }

    const globalQuestion = isGlobalQuestion(query);

    let targetEst = null;
    let inspections = [];
    let violations = [];

    const allEstablishments = await db.getEstablishments();

    // Do not force a specific restaurant for city-wide questions.
    if (establishmentId && !globalQuestion) {
      targetEst = await db.getEstablishmentById(establishmentId);
    }

    // Match both full names and shorter names, such as "Central Spice".
    if (!targetEst) {
      const normalizedQuery = query.toLowerCase();

      targetEst = allEstablishments.find((establishment) => {
        const facilityName = establishment.name.toLowerCase();

        const meaningfulWords = facilityName
          .split(/\s+/)
          .filter((word) => word.length > 3);

        return (
          normalizedQuery.includes(facilityName) ||
          meaningfulWords.every((word) => normalizedQuery.includes(word))
        );
      });
    }

    if (targetEst) {
      inspections = await db.getInspections(targetEst.id);
      violations = await db.getViolations({
        establishment_id: targetEst.id
      });
    }

    let groundedContext = '';

    if (globalQuestion || !targetEst) {
      groundedContext = `
MUNICIPAL FOOD-SAFETY DATABASE

Total facilities: ${allEstablishments.length}

FACILITY DIRECTORY:
${JSON.stringify(
  allEstablishments.map((establishment) => ({
    id: establishment.id,
    name: establishment.name,
    type: establishment.type,
    address: establishment.address,
    zone: establishment.zone,
    risk_score: establishment.risk_score,
    risk_category: establishment.risk_category,
    last_inspection_date: establishment.last_inspection_date
  })),
  null,
  2
)}
`;
    } else {
      const activeViolations = violations.filter(
        (violation) =>
          violation.corrective_action_status !== 'Resolved' &&
          violation.corrective_action_status !== 'Closed'
      );

      groundedContext = `
FACILITY RECORD

Name: ${targetEst.name}
Type: ${targetEst.type}
Address: ${targetEst.address}
Zone: ${targetEst.zone}
Risk score: ${targetEst.risk_score}/100
Risk category: ${targetEst.risk_category}
Last inspection: ${targetEst.last_inspection_date || 'Not recorded'}

INSPECTION HISTORY:
${JSON.stringify(inspections, null, 2)}

UNRESOLVED VIOLATIONS:
${JSON.stringify(activeViolations, null, 2)}
`;
    }

    const fallbackReply = globalQuestion
      ? createMunicipalFallback(allEstablishments)
      : createFallbackReply(targetEst, inspections, violations);

    if (
      GEMINI_API_KEY &&
      GEMINI_API_KEY !== 'your_gemini_api_key_here'
    ) {
      try {
        const prompt = `
You are SafePlate AI, a professional assistant for food-safety inspectors.

Answer the user's question using ONLY the verified SafePlate database context below.
Never invent violations, dates, inspections, legislation, citations, or facility records.
If the database does not contain an answer, clearly state that.
Use short, clear paragraphs and bullet points where helpful.

VERIFIED SAFEPLATE DATABASE CONTEXT:
${groundedContext}

USER QUESTION:
${query}
`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 800
              }
            })
          }
        );

        const geminiData = await geminiResponse.json();

        if (!geminiResponse.ok) {
          throw new Error(
            geminiData.error?.message ||
              `Gemini request failed with status ${geminiResponse.status}`
          );
        }

        const aiReply = (geminiData.candidates?.[0]?.content?.parts || [])
          .map((part) => part.text || '')
          .join('')
          .trim();

        if (!aiReply) {
          throw new Error('Gemini returned an empty response.');
        }

        return res.json({
          success: true,
          source: GEMINI_MODEL,
          reply: aiReply,
          response: aiReply
        });
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError.message);
      }
    }

    return res.json({
      success: true,
      source: 'safeplate-database-fallback',
      reply: fallbackReply,
      response: fallbackReply
    });
  } catch (error) {
    console.error('SafePlate AI error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to generate an AI response.'
    });
  }
});

// POST /api/genai/explain-risk
router.post('/explain-risk', async (req, res) => {
  try {
    const { establishmentId } = req.body;

    if (!establishmentId) {
      return res.status(400).json({
        success: false,
        message: 'establishmentId is required'
      });
    }

    const establishment = await db.getEstablishmentById(establishmentId);

    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: 'Establishment not found'
      });
    }

    const violations = await db.getViolations({
      establishment_id: establishmentId
    });

    const activeViolations = violations.filter(
      (violation) =>
        violation.corrective_action_status !== 'Resolved' &&
        violation.corrective_action_status !== 'Closed'
    );

    return res.json({
      success: true,
      establishment: establishment.name,
      risk_score: establishment.risk_score,
      risk_category: establishment.risk_category,
      unresolved_violations_count: activeViolations.length,
      explanation:
        `Risk score is ${establishment.risk_score}/100 with ` +
        `${activeViolations.length} unresolved violation(s).`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/genai/detect-violation-image
router.post('/detect-violation-image', async (req, res) => {
  try {
    // The UI sends `scenario`; support `profile` as well for backwards compatibility.
    const profile = req.body.scenario || req.body.profile || 'cooler';

    const presets = {
      cooler: {
        category: 'Temperature',
        severity: 'Critical',
        description:
          'Refrigeration unit registering 53.4°F ambient temperature; unsafe storage threshold exceeded.',
        suggested_action:
          'Immediately service the unit and move perishable food to safe cold storage.',
        image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600'
      },
      pantry: {
        category: 'Pest',
        severity: 'Major',
        description:
          'Dry storage packaging shows evidence of pest intrusion and improper food storage clearance.',
        suggested_action:
          'Sanitize shelves, install pest controls, and elevate food containers at least 6 inches above the floor.',
        image_url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600'
      },
      prep: {
        category: 'Cross-Contamination',
        severity: 'Critical',
        description:
          'Raw poultry preparation observed on a board designated for ready-to-eat vegetables.',
        suggested_action:
          'Sanitize the station immediately and retrain staff on food-separation procedures.',
        image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600'
      },
      sink: {
        category: 'Sanitation',
        severity: 'Major',
        description:
          'Handwashing station lacks required soap and paper towels.',
        suggested_action:
          'Restock handwashing supplies before food preparation resumes.',
        image_url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600'
      }
    };

    const detection = {
      ...(presets[profile] || presets.cooler),
      confidence: 0.96,
      model: 'SafePlate CV Demo'
    };

    return res.json({
      success: true,
      detection,
      // Kept for clients built against the earlier response shape.
      data: detection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
