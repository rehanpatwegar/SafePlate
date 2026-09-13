const express = require('express');
const router = express.Router();
const db = require('../supabase');

// GET all violations with optional filtering
router.get('/', async (req, res) => {
  try {
    const { establishment_id, inspection_id, status } = req.query;
    const violations = await db.getViolations({ establishment_id, inspection_id, status });

    // A violation belongs to an inspection; the inspection belongs to an establishment.
    // Resolve the relationship through the inspection because violations has no establishment_id column.
    const enriched = await Promise.all(violations.map(async (v) => {
      const insp = await db.getInspectionById(v.inspection_id);
      const est = insp ? await db.getEstablishmentById(insp.establishment_id) : null;
      return {
        ...v,
        establishment_id: insp ? insp.establishment_id : null,
        establishment_name: est ? est.name : "Unknown Facility",
        establishment_zone: est ? est.zone : "Zone A",
        inspector_name: insp ? insp.inspector_name : "Inspector"
      };
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET violation by ID
router.get('/:id', async (req, res) => {
  try {
    const violation = await db.getViolationById(req.params.id);
    if (!violation) {
      return res.status(404).json({ success: false, message: 'Violation not found' });
    }
    const inspection = await db.getInspectionById(violation.inspection_id);
    const establishment = inspection ? await db.getEstablishmentById(inspection.establishment_id) : null;
    const actions = await db.getCorrectiveActions({ violation_id: violation.id });

    res.json({
      success: true,
      data: {
        ...violation,
        establishment_id: inspection ? inspection.establishment_id : null,
        inspection,
        establishment,
        corrective_actions: actions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create a violation
router.post('/', async (req, res) => {
  try {
    const { inspection_id, establishment_id, category, severity, description, evidence_image_url } = req.body;
    
    if (!inspection_id) {
      return res.status(400).json({ success: false, message: 'Create and select an inspection before recording a violation' });
    }

    const inspection = await db.getInspectionById(inspection_id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Linked inspection not found' });
    }
    if (establishment_id && String(inspection.establishment_id) !== String(establishment_id)) {
      return res.status(400).json({ success: false, message: 'The selected inspection does not belong to this establishment' });
    }

    const newViolation = await db.createViolation({
      inspection_id,
      establishment_id: inspection.establishment_id,
      category: category || "Temperature",
      severity: severity || "Major",
      description: description || "Health code non-compliance observed during audit",
      evidence_image_url: evidence_image_url || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600"
    });

    res.status(201).json({
      success: true,
      message: 'Violation recorded and risk score updated',
      data: newViolation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update violation
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateViolation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Violation not found' });
    }
    // Re-trigger risk score calculation if status changed
    if (req.body.corrective_action_status) {
      const inspection = await db.getInspectionById(updated.inspection_id);
      if (inspection) await db.recalculateRiskScore(inspection.establishment_id);
    }
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
