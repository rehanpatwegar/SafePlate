const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL ya SUPABASE key .env me missing hai!');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// ==========================================
// 1. ESTABLISHMENTS
// ==========================================

async function getEstablishments(filters = {}) {
  let query = supabase
    .from('establishments')
    .select('*')
    .order('risk_score', { ascending: false });

  if (filters.zone) query = query.eq('zone', filters.zone);
  if (filters.riskCategory) query = query.eq('risk_category', filters.riskCategory);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getEstablishmentById(id) {
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

async function createEstablishment(payload) {
  const { data, error } = await supabase
    .from('establishments')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateEstablishment(id, payload) {
  const { data, error } = await supabase
    .from('establishments')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// 2. INSPECTIONS
// ==========================================

async function getInspections(establishment_id) {
  let query = supabase
    .from('inspections')
    .select('*')
    .order('inspection_date', { ascending: false });

  if (establishment_id) {
    query = query.eq('establishment_id', establishment_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getInspectionById(id) {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

async function createInspection(payload) {
  const { data, error } = await supabase
    .from('inspections')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateInspection(id, payload) {
  const { data, error } = await supabase
    .from('inspections')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// 3. VIOLATIONS
// Note: Schema me violations table me establishment_id nahi hai,
// toh inspections table ke through resolve hota hai.
// ==========================================

async function getViolations(filters = {}) {
  let validInspectionIds = null;
  
  if (filters.establishment_id) {
    const { data: estInspections, error: inspError } = await supabase
      .from('inspections')
      .select('id')
      .eq('establishment_id', filters.establishment_id);

    if (inspError) throw inspError;
    validInspectionIds = (estInspections || []).map(i => i.id);

    if (validInspectionIds.length === 0) return [];
  }

  let query = supabase
    .from('violations')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.inspection_id) query = query.eq('inspection_id', filters.inspection_id);
  if (validInspectionIds) query = query.in('inspection_id', validInspectionIds);
  if (filters.status) query = query.eq('corrective_action_status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getViolationById(id) {
  const { data, error } = await supabase
    .from('violations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

async function createViolation(payload) {
  const insertPayload = {
    inspection_id: payload.inspection_id,
    category: payload.category,
    severity: payload.severity,
    description: payload.description,
    evidence_image_url: payload.evidence_image_url,
    corrective_action_status: payload.corrective_action_status || 'Pending'
  };

  const { data, error } = await supabase
    .from('violations')
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;

  // Recalculate score
  let targetEstId = payload.establishment_id;
  if (!targetEstId && data.inspection_id) {
    const parentInspection = await getInspectionById(data.inspection_id);
    if (parentInspection) targetEstId = parentInspection.establishment_id;
  }

  if (targetEstId) {
    await recalculateRiskScore(targetEstId);
  }

  return data;
}

async function updateViolation(id, payload) {
  const { data, error } = await supabase
    .from('violations')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// 4. CORRECTIVE ACTIONS
// ==========================================

async function getCorrectiveActions(filters = {}) {
  let validViolationIds = null;

  if (filters.establishment_id) {
    const estViolations = await getViolations({ establishment_id: filters.establishment_id });
    validViolationIds = estViolations.map(v => v.id);
    if (validViolationIds.length === 0) return [];
  }

  let query = supabase
    .from('corrective_actions')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (filters.violation_id) query = query.eq('violation_id', filters.violation_id);
  if (validViolationIds) query = query.in('violation_id', validViolationIds);
  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function createCorrectiveAction(payload) {
  const insertPayload = {
    violation_id: payload.violation_id,
    action_taken: payload.action_taken,
    evidence_url: payload.evidence_url,
    status: 'Submitted'
  };

  const { data, error } = await supabase
    .from('corrective_actions')
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;

  // Parent violation ka status update karo
  await supabase
    .from('violations')
    .update({ corrective_action_status: 'Submitted' })
    .eq('id', payload.violation_id);

  return data;
}

async function verifyCorrectiveAction(id, inspector_name, isApproved) {
  const actionStatus = isApproved ? 'Accepted' : 'Rejected';
  const nowIso = new Date().toISOString();

  const { data: action, error: actionErr } = await supabase
    .from('corrective_actions')
    .update({
      status: actionStatus,
      verified_by: inspector_name || 'Officer Marcus Brody',
      verified_at: nowIso
    })
    .eq('id', id)
    .select()
    .single();

  if (actionErr) throw actionErr;

  const violStatus = isApproved ? 'Resolved' : 'Pending';
  const { data: violation, error: violErr } = await supabase
    .from('violations')
    .update({ corrective_action_status: violStatus })
    .eq('id', action.violation_id)
    .select()
    .single();

  if (violErr) throw violErr;

  let recalcResult = null;
  const parentInspection = await getInspectionById(violation.inspection_id);
  if (parentInspection && parentInspection.establishment_id) {
    recalcResult = await recalculateRiskScore(parentInspection.establishment_id);
  }

  return {
    action,
    violation,
    recalculation: recalcResult
  };
}

async function updateCorrectiveAction(id, payload) {
  const { data, error } = await supabase
    .from('corrective_actions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// 5. RISK RECALCULATION ENGINE
// ==========================================

async function recalculateRiskScore(establishmentId) {
  const est = await getEstablishmentById(establishmentId);
  if (!est) return null;

  const violations = await getViolations({ establishment_id: establishmentId });

  let score = 15; // Base score
  (violations || []).forEach(v => {
    const isResolved = v.corrective_action_status === 'Resolved' || v.corrective_action_status === 'Closed';
    if (!isResolved) {
      if (v.severity === 'Critical') score += 35;
      else if (v.severity === 'Major') score += 15;
      else if (v.severity === 'Minor') score += 5;
    }
  });

  score = Math.min(100, Math.max(5, score));

  let category = 'LOW RISK';
  if (score >= 80) category = 'CRITICAL';
  else if (score >= 60) category = 'HIGH RISK';
  else if (score >= 35) category = 'MEDIUM RISK';

  const todayDate = new Date().toISOString().split('T')[0];

  const { data: updatedEst, error: updateErr } = await supabase
    .from('establishments')
    .update({
      risk_score: score,
      risk_category: category,
      last_inspection_date: todayDate
    })
    .eq('id', establishmentId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  return {
    establishment_id: establishmentId,
    previous_score: est.risk_score,
    previous_category: est.risk_category,
    new_score: score,
    new_category: category,
    updated_establishment: updatedEst
  };
}

module.exports = {
  supabase,
  getEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  getViolations,
  getViolationById,
  createViolation,
  updateViolation,
  getCorrectiveActions,
  createCorrectiveAction,
  updateCorrectiveAction,
  verifyCorrectiveAction,
  recalculateRiskScore
};