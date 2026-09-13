/**
 * SafePlate Backend Application Server
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const establishmentsRoutes = require('./routes/establishments');
const inspectionsRoutes = require('./routes/inspections');
const violationsRoutes = require('./routes/violations');
const correctiveActionsRoutes = require('./routes/correctiveActions');
const riskRoutes = require('./routes/risk');
const genaiRoutes = require('./routes/genai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[SafePlate API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SafePlate Food Safety & Inspection Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/corrective-actions', correctiveActionsRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/genai', genaiRoutes);

// Frontend: serve frontend/dist from this same backend server.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('[SafePlate Server Error]', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('==========================================');
    console.log('SAFEPLATE is running');
    console.log(`Open: http://localhost:${PORT}`);
    console.log('==========================================');
  });
}

module.exports = app;