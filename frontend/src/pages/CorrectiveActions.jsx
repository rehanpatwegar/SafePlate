import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Upload,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  TrendingDown,
  UserCheck,
  Sparkles,
  RefreshCw,
  PlusCircle,
  X
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import api from '../services/api';

export default function CorrectiveActions({ currentUser, activeRoleKey, onNavigateToEstablishment }) {
  const [actions, setActions] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  
  // Submit proof form state
  const [submitForm, setSubmitForm] = useState({
    violation_id: '',
    action_taken: '',
    evidence_url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600'
  });

  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [recalculationAlert, setRecalculationAlert] = useState(null);

  const fetchActionsAndViolations = async () => {
    try {
      setLoading(true);
      const [actionsRes, violRes] = await Promise.all([
        api.getCorrectiveActions(),
        api.getViolations()
      ]);
      if (actionsRes.success) setActions(actionsRes.data);
      if (violRes.success) setViolations(violRes.data);
    } catch (err) {
      console.error('Failed to load corrective actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionsAndViolations();
  }, []);

  // Quick prefill helper for Central Spice violations
  const handleOpenSubmitModal = (viol = null) => {
    if (viol) {
      setSelectedViolation(viol);
      setSubmitForm({
        violation_id: viol.id,
        action_taken: viol.category === 'Temperature'
          ? 'Commercial HVAC technician replaced faulty digital thermostat on walk-in cooler #1. Core internal temperature currently verified at 38.2°F.'
          : viol.category === 'Pest'
          ? 'Professional pest control contractor deployed non-toxic traps, sealed perimeter mortar gaps, and certified zero rodent activity.'
          : 'Reorganized storage shelves following strict food hierarchy with raw poultry on bottom rack.',
        evidence_url: viol.category === 'Temperature'
          ? 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600'
          : 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600'
      });
    } else {
      setSelectedViolation(null);
      setSubmitForm({
        violation_id: violations[0]?.id || '1',
        action_taken: '',
        evidence_url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600'
      });
    }
    setShowSubmitModal(true);
  };

  // Submit proof
  const handleSubmitAction = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createCorrectiveAction(submitForm);
      if (res.success) {
        setShowSubmitModal(false);
        await fetchActionsAndViolations();
      }
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // RE-INSPECTION VERIFY & APPROVE / REJECT
  // Crucial step: approving triggers risk score recalculation dropping restaurant score (e.g. 84 to 20)!
  const handleVerify = async (actionId, approved) => {
    try {
      setVerifyingId(actionId);
      const inspectorName = currentUser?.name || "Officer Marcus Brody";
      const res = await api.verifyCorrectiveAction(actionId, inspectorName, approved);

      if (res.success) {
        if (res.data.recalculation) {
          const r = res.data.recalculation;
          setRecalculationAlert({
            restaurant: r.establishment_name,
            oldScore: r.previous_score,
            oldCategory: r.previous_category,
            newScore: r.new_score,
            newCategory: r.new_category,
            unresolvedRemaining: r.unresolved_counts.total_unresolved
          });
        }
        await fetchActionsAndViolations();
      }
    } catch (err) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  // Batch Resolve all remaining violations for Central Spice to demonstrate 84 -> 20 drop!
  const handleFastTrackCentralSpice = async () => {
    try {
      setLoading(true);
      // Submit and verify for Central Spice violations 1, 2, 3
      const centralSpiceViolations = violations.filter(v => v.establishment_id === 1 && v.corrective_action_status !== 'Resolved');
      
      for (const v of centralSpiceViolations) {
        // Create action if not exists
        const action = await api.createCorrectiveAction({
          violation_id: v.id,
          action_taken: `Remediated ${v.category} violation with certified contractor proof and photo evidence.`,
          evidence_url: v.evidence_image_url
        });
        if (action.success) {
          await api.verifyCorrectiveAction(action.data.id, "Officer Marcus Brody", true);
        }
      }

      // Explicitly recalculate risk
      const recalc = await api.recalculateRisk(1);
      if (recalc.success) {
        setRecalculationAlert({
          restaurant: recalc.data.establishment_name,
          oldScore: recalc.data.previous_score,
          oldCategory: recalc.data.previous_category,
          newScore: recalc.data.new_score,
          newCategory: recalc.data.new_category,
          unresolvedRemaining: 0
        });
      }
      await fetchActionsAndViolations();
    } catch (err) {
      alert(`Fast-track resolution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = activeRoleKey === 'owner';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Corrective Action Portal & Re-Inspection Verification
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              {actions.length} Submissions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Establishments submit remediation evidence; Health Inspectors verify proof on re-inspection to drop risk scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo fast-track button */}
          <button
            onClick={handleFastTrackCentralSpice}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/20"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Resolve All Central Spice (84 → 20)</span>
          </button>

          <button
            onClick={() => handleOpenSubmitModal()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Submit Corrective Proof</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC RISK SCORE DROP CELEBRATORY BANNER */}
      {recalculationAlert && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900 border border-emerald-500/40 shadow-xl shadow-emerald-950/20 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-300">
                    RE-INSPECTION VERIFIED — RISK SCORE RECALCULATED!
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                    AUTOMATED REDUCTION
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Corrective action accepted for <strong>{recalculationAlert.restaurant}</strong>.
                  Public health risk score decreased from{' '}
                  <span className="text-red-400 font-bold line-through">{recalculationAlert.oldScore} ({recalculationAlert.oldCategory})</span>{' '}
                  down to{' '}
                  <span className="text-emerald-400 font-extrabold text-sm">{recalculationAlert.newScore} ({recalculationAlert.newCategory})</span>!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Remaining unresolved violations: {recalculationAlert.unresolvedRemaining}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setRecalculationAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Flagged Violations Awaiting Remediation */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Violations Requiring Corrective Action Proof</h3>
            <p className="text-xs text-slate-400">Establishment owners must upload remediation proof to request re-inspection</p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Awaiting Owner Action
          </span>
        </div>

        <div className="space-y-3">
          {violations.filter(v => v.corrective_action_status === 'Pending').map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    v.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {v.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-white">{v.category}</span>
                  <span className="text-xs text-slate-400 font-medium">• {v.establishment_name}</span>
                </div>
                <p className="text-xs text-slate-300">{v.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {v.evidence_image_url && (
                  <img
                    src={v.evidence_image_url}
                    alt="Evidence"
                    className="w-14 h-11 rounded-lg object-cover ring-1 ring-slate-700"
                  />
                )}
                <button
                  onClick={() => handleOpenSubmitModal(v)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Proof</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Proofs & Inspector Verification Queue */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Re-Inspection & Proof Verification Queue</h3>
            <p className="text-xs text-slate-400">Inspector verification resolves the violation and updates the facility risk index</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Inspector Queue
          </span>
        </div>

        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No corrective actions submitted yet.
            </div>
          ) : (
            actions.map((act) => {
              const isPendingApproval = act.status === 'Submitted';
              const isApproved = act.status === 'Approved';

              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isApproved
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-slate-900/80 border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          act.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {act.status.toUpperCase()}
                        </span>

                        <span className="text-xs font-bold text-white">
                          Action for #{act.violation_id}: {act.violation?.category || 'Hazard'}
                        </span>
                        <span className="text-xs text-slate-400">({act.establishment?.name || 'Central Spice'})</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                        <p className="font-semibold text-slate-200 mb-0.5">Remediation Action Taken by Facility:</p>
                        <p className="italic">{act.action_taken}</p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Submitted: {new Date(act.submitted_at).toLocaleDateString()}</span>
                        {act.verified_by && (
                          <span className="text-emerald-400">Verified by: {act.verified_by}</span>
                        )}
                      </div>
                    </div>

                    {/* Right proof photo & approval controls */}
                    <div className="flex sm:flex-col items-end justify-between gap-3 shrink-0">
                      {act.evidence_url && (
                        <img
                          src={act.evidence_url}
                          alt="Corrective Proof"
                          className="w-20 h-14 rounded-lg object-cover ring-1 ring-slate-700"
                        />
                      )}

                      {isPendingApproval && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerify(act.id, false)}
                            disabled={verifyingId === act.id}
                            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() => handleVerify(act.id, true)}
                            disabled={verifyingId === act.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-emerald-900/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify & Resolve</span>
                          </button>
                        </div>
                      )}

                      {isApproved && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Re-inspection Passed</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SUBMIT CORRECTIVE ACTION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Submit Corrective Action Proof</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload remediation details and photographic evidence to request inspector re-inspection sign-off.
            </p>

            <form onSubmit={handleSubmitAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Violation</label>
                <select
                  value={submitForm.violation_id}
                  onChange={(e) => setSubmitForm({ ...submitForm, violation_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {violations.map(v => (
                    <option key={v.id} value={v.id}>
                      #{v.id}: [{v.severity}] {v.category} - {v.establishment_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Remediation Action Taken</label>
                <textarea
                  rows={3}
                  required
                  value={submitForm.action_taken}
                  onChange={(e) => setSubmitForm({ ...submitForm, action_taken: e.target.value })}
                  placeholder="Describe repair, contractor logs, chemical sanitization, thermometer readings..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Photographic Proof URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={submitForm.evidence_url}
                    onChange={(e) => setSubmitForm({ ...submitForm, evidence_url: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                  {submitForm.evidence_url && (
                    <img
                      src={submitForm.evidence_url}
                      alt="Proof Preview"
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? 'Submitting...' : 'Submit for Re-Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
