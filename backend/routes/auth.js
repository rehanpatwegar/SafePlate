const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Secret key .env se aayegi, ya default dev key use hogi
const JWT_SECRET = process.env.JWT_SECRET || 'safeplate_super_secret_buildathon_2026';

// Realistic pre-configured users for testing/demo
const DEMO_USERS = [
  {
    id: "usr_admin_1",
    name: "Dr. Sarah Rao",
    email: "admin@safeplate.gov",
    password: "password123",
    role: "Admin",
    title: "Chief Public Health Administrator",
    department: "Municipal Food Safety Authority"
  },
  {
    id: "usr_insp_1",
    name: "Officer Marcus Brody",
    email: "brody@safeplate.gov",
    password: "password123",
    role: "Inspector",
    title: "Senior Food Safety Inspector",
    badgeNumber: "FSI-4091"
  },
  {
    id: "usr_mgr_1",
    name: "Rajesh Patel",
    email: "manager@centralspice.com",
    password: "password123",
    role: "Establishment Manager",
    title: "Proprietor / Operating Head",
    establishmentId: 1
  }
];

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Match with demo user or accept role credentials
    let user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    // If specific email not found, create a session user with selected role
    if (!user) {
      const selectedRole = role || "Inspector";
      user = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: selectedRole,
        title: `${selectedRole} Staff`
      };
    }

    // Sign a real JWT valid for 24 hours
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        establishmentId: user.establishmentId || null
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: `Authenticated successfully as ${user.role}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        badgeNumber: user.badgeNumber || null,
        establishmentId: user.establishmentId || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me (Verify active token)
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "No active token provided" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      user: decoded
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
});

module.exports = router;