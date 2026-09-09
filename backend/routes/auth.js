const express = require('express');
const router = express.Router();

// Mock User Database representing the 4 primary personas
const ROLES = {
  inspector: {
    id: "usr_inspector_01",
    name: "Marcus Brody",
    role: "Food-Safety Inspector",
    badgeNumber: "FSI-9042",
    agency: "Metro Dept of Public Health",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    permissions: ["view_all", "create_inspection", "log_violation", "re_inspect", "trigger_recalculation", "ai_assistant"]
  },
  manager: {
    id: "usr_manager_01",
    name: "Dr. Evelyn Reed",
    role: "Inspection Manager",
    badgeNumber: "MGR-1020",
    agency: "Public Health Safety Commission",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    permissions: ["view_all", "analytics", "assign_inspectors", "audit_reviews", "ai_assistant", "admin_controls"]
  },
  owner: {
    id: "usr_owner_01",
    name: "Rajesh Patel",
    role: "Establishment Owner",
    establishmentId: 1,
    establishmentName: "Central Spice Restaurant",
    agency: "Food Safety Licensee",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    permissions: ["view_own", "submit_corrective_action", "request_reinspection", "ai_assistant"]
  },
  admin: {
    id: "usr_admin_01",
    name: "System Administrator",
    role: "Administrator",
    badgeNumber: "ADM-0001",
    agency: "SafePlate Platform Administration",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    permissions: ["all", "system_settings", "ml_model_sync", "user_management"]
  }
};

let currentActiveRole = "inspector";

// GET current session user
router.get('/me', (req, res) => {
  const user = ROLES[currentActiveRole] || ROLES.inspector;
  res.json({
    success: true,
    user,
    activeRoleKey: currentActiveRole,
    availableRoles: Object.keys(ROLES).map(k => ({
      key: k,
      name: ROLES[k].name,
      role: ROLES[k].role,
      agency: ROLES[k].agency
    }))
  });
});

// Switch role (Mock auth)
router.post('/switch-role', (req, res) => {
  const { roleKey } = req.body;
  if (!ROLES[roleKey]) {
    return res.status(400).json({ success: false, message: `Invalid role: ${roleKey}` });
  }
  currentActiveRole = roleKey;
  res.json({
    success: true,
    message: `Switched active profile to ${ROLES[roleKey].role}`,
    user: ROLES[currentActiveRole]
  });
});

// GET all roles
router.get('/roles', (req, res) => {
  res.json({
    success: true,
    roles: ROLES
  });
});

module.exports = router;
