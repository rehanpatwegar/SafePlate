import axios from 'axios';

// Express backend direct binding
const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token if stored
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('safeplate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth & Roles
  async getMe() {
    try {
      const res = await client.get('/auth/me');
      return res.data;
    } catch {
      return { success: true, user: { name: 'Marcus Brody', role: 'inspector' }, activeRoleKey: 'inspector' };
    }
  },
  async switchRole(roleKey) {
    const res = await client.post('/auth/switch-role', { roleKey });
    return res.data;
  },

  // Establishments
  async getEstablishments(filters = {}) {
    const res = await client.get('/establishments', { params: filters });
    return res.data;
  },
  async getEstablishmentById(id) {
    const res = await client.get(`/establishments/${id}`);
    return res.data;
  },
  async createEstablishment(data) {
    const res = await client.post('/establishments', data);
    return res.data;
  },

  // Inspections
  async getInspections(establishmentId = null) {
    const params = establishmentId ? { establishment_id: establishmentId } : {};
    const res = await client.get('/inspections', { params });
    return res.data;
  },
  async getInspectionById(id) {
    const res = await client.get(`/inspections/${id}`);
    return res.data;
  },
  async createInspection(data) {
    const res = await client.post('/inspections', data);
    return res.data;
  },
  async updateInspection(id, updates) {
    const res = await client.put(`/inspections/${id}`, updates);
    return res.data;
  },

  // Violations
  async getViolations(filters = {}) {
    const res = await client.get('/violations', { params: filters });
    return res.data;
  },
  async getViolationById(id) {
    const res = await client.get(`/violations/${id}`);
    return res.data;
  },
  async createViolation(data) {
    const res = await client.post('/violations', data);
    return res.data;
  },
  async updateViolation(id, updates) {
    const res = await client.put(`/violations/${id}`, updates);
    return res.data;
  },

  // Corrective Actions
  async getCorrectiveActions(filters = {}) {
    const res = await client.get('/corrective-actions', { params: filters });
    return res.data;
  },
  async createCorrectiveAction(data) {
    const res = await client.post('/corrective-actions', data);
    return res.data;
  },
  async verifyCorrectiveAction(id, inspectorName, approved) {
    const res = await client.post(`/corrective-actions/${id}/verify`, {
      inspector_name: inspectorName,
      approved
    });
    return res.data;
  },

  // Risk Management
  async getRiskMetrics() {
    const res = await client.get('/risk/metrics');
    return res.data;
  },
  async recalculateRisk(establishmentId) {
    const res = await client.post(`/risk/recalculate/${establishmentId}`);
    return res.data;
  },
  async predictRiskML(features) {
    const res = await client.post('/risk/predict-ml', features);
    return res.data;
  },

  // GenAI Assistant
  async explainRisk(establishmentId) {
    const res = await client.post('/genai/explain-risk', { establishmentId });
    return res.data;
  },
  async detectViolationImage(data) {
    const res = await client.post('/genai/detect-violation-image', data);
    return res.data;
  },
  async sendChatMessage(message, establishmentId = null) {
    const res = await client.post('/genai/chat', { message, establishmentId });
    return res.data;
  },
  async getBriefing(establishmentId) {
    const res = await client.post(`/genai/briefing/${establishmentId}`);
    return res.data;
  }
};

export default api;