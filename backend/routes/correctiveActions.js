const express = require('express');
const router = express.Router();
const db = require('../supabase');

// GET all corrective actions
router.get('/', async (req, res) => {
  try {
    const { establishment_id, status } = req.query;
    const actions = await db.getCorrectiveActions({ establishment_id, status });
    res.json({
      success: true,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST submit a corrective action by establishment owner
router.post('/', async (req, res) => {
  try {
    const { violation_id, action_taken, evidence_url, establishment_id } = req.body;
    if (!violation_id || !action_taken) {
      return res.status(400).json({ success: false, message: 'violation_id and action_taken are required' });
    }

    const action = await db.createCorrectiveAction({
      violation_id,
      action_taken,
      evidence_url: evidence_url || "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600",
      establishment_id
    });

    res.status(201).json({
      success: true,
      message: 'Corrective action proof submitted for inspection verification',
      data: action
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST verify and approve/reject corrective action (Re-inspection verification)
// Approving drops the restaurant's risk score!
router.post('/:id/verify', async (req, res) => {
  try {
    const { inspector_name, approved } = req.body;
    const isApproved = approved !== undefined ? Boolean(approved) : true;
    const result = await db.verifyCorrectiveAction(
      req.params.id,
      inspector_name || "Officer Marcus Brody",
      isApproved
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Corrective action not found' });
    }

    res.json({
      success: true,
      message: isApproved 
        ? 'Re-inspection completed: Corrective action approved and violation resolved.' 
        : 'Re-inspection completed: Corrective action rejected, remediation required.',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update corrective action directly
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateCorrectiveAction(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Corrective action not found' });
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
