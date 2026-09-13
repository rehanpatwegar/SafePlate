const express = require('express');
const router = express.Router();
const db = require('../supabase');

// GET all inspections
router.get('/', async (req, res) => {
  try {
    const { establishment_id } = req.query;
    const inspections = await db.getInspections(establishment_id);
    
    // Enrich with establishment details
    const enriched = await Promise.all(inspections.map(async (ins) => {
      const est = await db.getEstablishmentById(ins.establishment_id);
      const viols = await db.getViolations({ inspection_id: ins.id });
      return {
        ...ins,
        establishment_name: est ? est.name : "Unknown Facility",
        establishment_type: est ? est.type : "Food Service",
        establishment_zone: est ? est.zone : "Zone A",
        violations_count: viols.length
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

// GET single inspection by ID
router.get('/:id', async (req, res) => {
  try {
    const inspection = await db.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    const establishment = await db.getEstablishmentById(inspection.establishment_id);
    const violations = await db.getViolations({ inspection_id: inspection.id });

    res.json({
      success: true,
      data: {
        ...inspection,
        establishment,
        violations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST schedule / create a new inspection
router.post('/', async (req, res) => {
  try {
    const { establishment_id, inspector_name, inspection_date, status, score, notes } = req.body;
    if (!establishment_id) {
      return res.status(400).json({ success: false, message: 'establishment_id is required' });
    }

    const evaluationScore = Number(score);
    if (score !== undefined && (!Number.isInteger(evaluationScore) || evaluationScore < 0 || evaluationScore > 100)) {
      return res.status(400).json({ success: false, message: 'score must be a whole number between 0 and 100' });
    }

    const newInspection = await db.createInspection({
      establishment_id,
      inspector_name: inspector_name || "Officer Marcus Brody",
      inspection_date: inspection_date || new Date().toISOString().split('T')[0],
      status: status || "Scheduled",
      score: score === undefined || score === '' ? 85 : evaluationScore,
      notes: notes || "Standard unannounced compliance audit"
    });

    res.status(201).json({
      success: true,
      message: 'Inspection successfully logged',
      data: newInspection
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update inspection status (Scheduled -> In Progress -> Submitted -> Resolved)
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateInspection(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    res.json({
      success: true,
      message: `Inspection status updated to ${updated.status}`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
