const express = require('express');
const router = express.Router();
const db = require('../supabase');

// GET all establishments with optional filtering
router.get('/', async (req, res) => {
  try {
    const { search, zone, riskCategory } = req.query;
    const establishments = await db.getEstablishments({ search, zone, riskCategory });
    res.json({
      success: true,
      count: establishments.length,
      data: establishments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single establishment with detailed profile and linked inspections/violations
router.get('/:id', async (req, res) => {
  try {
    const establishment = await db.getEstablishmentById(req.params.id);
    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establishment not found' });
    }

    const inspections = await db.getInspections(establishment.id);
    const violations = await db.getViolations({ establishment_id: establishment.id });
    const correctiveActions = await db.getCorrectiveActions({ establishment_id: establishment.id });

    // Historical trend simulation
    const trend = [
      { month: "Apr 2026", score: Math.max(10, establishment.risk_score - 15) },
      { month: "May 2026", score: Math.max(10, establishment.risk_score - 10) },
      { month: "Jun 2026", score: Math.max(10, establishment.risk_score - 5) },
      { month: "Jul 2026", score: Math.max(10, establishment.risk_score - 2) },
      { month: "Aug 2026", score: establishment.risk_score }
    ];

    res.json({
      success: true,
      data: {
        ...establishment,
        inspections,
        violations,
        corrective_actions: correctiveActions,
        trend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create establishment
router.post('/', async (req, res) => {
  try {
    const newEst = await db.createEstablishment(req.body);
    res.status(201).json({
      success: true,
      data: newEst
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update establishment
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateEstablishment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Establishment not found' });
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
