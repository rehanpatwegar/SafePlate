/**
 * SafePlate Backend Application Server
 * REST API entrypoint mounting authentication, establishments, inspections,
 * violations, corrective actions, dynamic risk recalculation, and GenAI intelligence.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const establishmentsRoutes = require('./routes/establishments');
const inspectionsRoutes = require('./routes/inspections');
const violationsRoutes = require('./routes/violations');
const correctiveActionsRoutes = require('./routes/correctiveActions');
const riskRoutes = require('./routes/risk');
const genaiRoutes = require('./routes/genai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[SafePlate API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SafePlate Food Safety & Inspection Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/corrective-actions', correctiveActionsRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/genai', genaiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SafePlate Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  SAFEPLATE FOOD SAFETY PLATFORM API`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
