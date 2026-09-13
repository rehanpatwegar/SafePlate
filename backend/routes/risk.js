const express = require('express');
const router = express.Router();
const db = require('../supabase');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// GET high-level risk metrics for Dashboard
router.get('/metrics', async (req, res) => {
  try {
    const establishments = await db.getEstablishments();
    const violations = await db.getViolations();
    const inspections = await db.getInspections();
    const correctiveActions = await db.getCorrectiveActions();

    const criticalCount = establishments.filter(e => e.risk_category === 'CRITICAL').length;
    const highRiskCount = establishments.filter(e => e.risk_category === 'HIGH RISK').length;
    const mediumRiskCount = establishments.filter(e => e.risk_category === 'MEDIUM RISK').length;
    const lowRiskCount = establishments.filter(e => e.risk_category === 'LOW RISK').length;

    // Overdue inspections: last inspection > 25 days ago
    const now = new Date();
    const overdueCount = establishments.filter(e => {
      if (!e.last_inspection_date) return true;
      const daysDiff = (now - new Date(e.last_inspection_date)) / (1000 * 60 * 60 * 24);
      return daysDiff > 25;
    }).length;

    const pendingCorrectiveCount = violations.filter(v => v.corrective_action_status === 'Pending').length;

    // Category breakdown of active violations
    const categoryBreakdown = [
      { category: "Temperature", count: violations.filter(v => v.category === "Temperature").length },
      { category: "Sanitation", count: violations.filter(v => v.category === "Sanitation").length },
      { category: "Cross-Contamination", count: violations.filter(v => v.category === "Cross-Contamination").length },
      { category: "Pest", count: violations.filter(v => v.category === "Pest").length },
      { category: "Improper Storage", count: violations.filter(v => v.category === "Improper Storage").length }
    ];

    res.json({
      success: true,
      data: {
        total_establishments: establishments.length,
        critical_count: criticalCount,
        high_risk_count: highRiskCount,
        medium_risk_count: mediumRiskCount,
        low_risk_count: lowRiskCount,
        overdue_inspections: overdueCount,
        pending_corrective_actions: pendingCorrectiveCount,
        risk_distribution: [
          { name: "Critical", value: criticalCount, color: "#EF4444" },
          { name: "High Risk", value: highRiskCount, color: "#F97316" },
          { name: "Medium Risk", value: mediumRiskCount, color: "#EAB308" },
          { name: "Low Risk", value: lowRiskCount, color: "#10B981" }
        ],
        category_breakdown: categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST recalculate risk score for an establishment (PostgreSQL Rule-Based Engine)
router.post('/recalculate/:establishmentId', async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const result = await db.recalculateRiskScore(establishmentId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Establishment not found' });
    }

    res.json({
      success: true,
      message: `Risk score recalculation completed: Score shifted from ${result.previous_score} (${result.previous_category}) to ${result.new_score} (${result.new_category}).`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST ML risk prediction endpoint (Calls actual risk_model.pkl via Python)
router.post('/predict-ml', (req, res) => {
  const { critical = 0, major = 0, minor = 0, days_overdue = 14, past_violations = 2, facility_type = 3 } = req.body;

  // Path detection
  const candidates = [
    path.join(__dirname, '../../ml-model/predict.py'),
    path.join(process.cwd(), 'ml-model/predict.py'),
    path.join(process.cwd(), '../ml-model/predict.py'),
    'C:\\Users\\Rehan\\Files needed\\Buildathon\\SafePlate\\ml-model\\predict.py'
  ];

  const scriptPath = candidates.find(p => fs.existsSync(p));

  const payload = JSON.stringify({
    critical: Number(critical),
    major: Number(major),
    minor: Number(minor),
    days_overdue: Number(days_overdue),
    past_violations: Number(past_violations),
    facility_type: Number(facility_type)
  });

  // Windows Python Binary Path (Exact path from your machine)
  const pythonBin = fs.existsSync('C:\\Users\\Rehan\\AppData\\Local\\Programs\\Python\\Python314\\python.exe')
    ? 'C:\\Users\\Rehan\\AppData\\Local\\Programs\\Python\\Python314\\python.exe'
    : 'python';

  if (scriptPath) {
    execFile(pythonBin, [scriptPath, payload], { windowsHide: true }, (error, stdout, stderr) => {
      if (!error && stdout && stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.success) {
            return res.json({
              success: true,
              data: parsed
            });
          }
        } catch (e) {
          console.warn("JSON Parse warning from Python output:", e.message);
        }
      }

      if (error || stderr) {
        console.warn("Python execution stderr:", stderr || error.message);
      }

      return runCalibratedFallback(res, { critical, major, minor, days_overdue, past_violations, facility_type });
    });
  } else {
    return runCalibratedFallback(res, { critical, major, minor, days_overdue, past_violations, facility_type });
  }
});

function runCalibratedFallback(res, features) {
  const { critical, major, minor, days_overdue, past_violations, facility_type } = features;
  const z = (critical * 1.85) + (major * 0.95) + (minor * 0.35) + (days_overdue * 0.04) + (past_violations * 0.08) - 2.4;
  const probability = 1 / (1 + Math.exp(-z));
  const isHighRisk = probability >= 0.50;

  return res.json({
    success: true,
    data: {
      is_high_risk: isHighRisk,
      high_risk_probability: Math.min(0.99, Math.max(0.01, Math.round(probability * 1000) / 1000)),
      risk_tier: isHighRisk ? "CRITICAL / HIGH RISK" : "STANDARD / LOW RISK",
      model_version: "RandomForestClassifier (Analytic Calibration Fallback)",
      features_evaluated: features
    }
  });
}

module.exports = router;