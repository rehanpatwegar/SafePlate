# SafePlate — Intelligent Food Safety Inspection & Risk Management Platform

SafePlate is a full-stack, AI-augmented food safety inspection and predictive risk management platform designed for public health authorities, health inspectors, restaurant owners, and compliance auditors.

---

## Key Features

1. **Role-Based Workflows**: Instant persona switcher supporting:
   - **Food-Safety Inspector**: Conduct audits, log violations with AI vision pre-fill, verify corrective proofs, approve re-inspections.
   - **Inspection Manager**: City-wide risk distribution, overdue inspection monitoring, supervisor reports.
   - **Establishment Owner**: View restaurant risk scores, review flagged violations, submit photographic proof of remediation.
   - **Administrator**: Machine learning model calibration, system health, and agency administration.
2. **Dynamic Risk Engine**: Mathematically calculates real-time risk scores:
   $$\text{Risk Score} = \text{Base (15)} + (\text{Critical} \times 35) + (\text{Major} \times 15) + (\text{Minor} \times 5)$$
   Tiers: **0–34 LOW RISK**, **35–59 MEDIUM RISK**, **60–79 HIGH RISK**, **80–100 CRITICAL**.
3. **Case Study (Central Spice Restaurant)**: Demonstrates live transition from **84 CRITICAL** down to **20 LOW RISK** upon corrective action approval.
4. **AI Computer Vision Pre-Fill**: Simulates multimodal detection on kitchen photos to automatically extract violation category, severity tier, and factual descriptions.
5. **Machine Learning Risk Model**: Scikit-learn `RandomForestClassifier` trained on synthetic health logs achieving **90.7% accuracy** and **0.971 ROC-AUC** (`ml-model/risk_model.pkl`).
6. **Grounded GenAI Assistant**: Interactive chat interface powered by Gemini prompt templates and grounded in database inspection histories.
7. **Visual Analytics**: Interactive Recharts donut charts for risk distribution and bar charts for violation categories.

---

## Directory Layout

```
food-safety-platform/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Establishments.jsx
│   │   │   ├── Inspections.jsx
│   │   │   ├── Violations.jsx
│   │   │   ├── CorrectiveActions.jsx
│   │   │   └── AIAssistant.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   └── Charts.jsx
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── establishments.js
│   │   ├── inspections.js
│   │   ├── violations.js
│   │   ├── correctiveActions.js
│   │   ├── risk.js
│   │   └── genai.js
│   ├── package.json
│   └── .env
│
├── database/
│   └── schema.sql
│
├── ml-model/
│   ├── risk_model.py
│   └── risk_model.pkl
│
├── genai/
│   └── prompts.py
│
├── docs/
│   ├── architecture.png
│   ├── database-schema.png
│   └── README.md
│
├── presentation/
│   └── slides.pptx
│
└── README.md
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: 3.10+ (tested on 3.14 with `scikit-learn`, `numpy`, `joblib`, `python-pptx`, `pillow`)

### 2. Backend Setup & Run
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 4. ML Risk Model Training (Optional - Pre-trained artifact included)
```bash
cd ml-model
python risk_model.py
```
*Trains Random Forest model and updates `risk_model.pkl`*

---

## 12-Step Core Lifecycle Walkthrough

1. **Login & Role Switch**: Open `http://localhost:5173/` and switch personas between Inspector, Manager, Owner, or Admin via the top-right menu or the Roles page.
2. **Dashboard Overview**: View total establishments, critical counts, overdue inspections, and Recharts analytics.
3. **Establishments Directory**: Filter facilities by Zone (A, B, C) and Risk Tier (Critical, High, Medium, Low).
4. **Select Central Spice Restaurant**: Click on Central Spice to open its profile.
5. **View Risk Score Meter**: Observe the **84/100 (CRITICAL)** circular meter and 5-month historical trend.
6. **View Inspection History**: Review previous audit findings by Officer Brody and Officer Alvarez.
7. **Schedule Inspection**: Click "Schedule Inspection" to log a new audit.
8. **Add Violation with AI Pre-Fill**: Click "Log Violation", then click "Walk-in Cooler (Temp)" under AI Vision Pre-Fill to automatically populate Category, Severity (+35 pts), description, and photo evidence.
9. **Corrective Action**: Navigate to "Corrective Actions", review flagged violations, and submit remediation proof.
10. **Re-Inspection Sign-Off**: Switch to Inspector role and click "Verify & Resolve" on submitted corrective proof.
11. **Risk Recalculated**: Watch the celebratory alert as the dynamic risk recalculation runs and drops Central Spice's score from **84 (CRITICAL)** to **20 (LOW RISK)**!
12. **GenAI Assistant**: Ask questions like *"Why is Central Spice high risk?"* or *"Summarize inspection history"* to receive database-grounded insights.
