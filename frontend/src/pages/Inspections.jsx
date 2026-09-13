import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertOctagon,
  Search,
  Filter,
  X,
  FileText,
  Building
} from 'lucide-react';
import api from '../services/api';

export default function Inspections({ openCreateModalByDefault, defaultEstablishmentId, onOpenViolationModal }) {
  const [inspections, setInspections] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(Boolean(openCreateModalByDefault));
  const [formData, setFormData] = useState({
    establishment_id: defaultEstablishmentId || '1',
    inspector_name: 'Officer Marcus Brody',
    inspection_date: new Date().toISOString().split('T')[0],
    status: 'In Progress',
    score: 85,
    notes: 'Comprehensive food code hygiene and cold holding compliance audit'
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchInspectionsAndEsts = async () => {
    try {
      setLoading(true);
      const [inspRes, estRes] = await Promise.all([
        api.getInspections(),
        api.getEstablishments()
      ]);
      if (inspRes.success) setInspections(inspRes.data);
      if (estRes.success) setEstablishments(estRes.data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionsAndEsts();
  }, []);

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createInspection(formData);
      if (res.success) {
        setStatusMessage(`Inspector assigned and evaluation recorded: ${res.data.inspector_name} • ${res.data.score}/100.`);
        setShowModal(false);
        await fetchInspectionsAndEsts();
      }
    } catch (err) {
      alert(`Failed to create inspection: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateInspection(id, { status: newStatus });
      if (res.success) {
        fetchInspectionsAndEsts();
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Inspection Operations & Schedule
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              {inspections.length} Audits
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conduct, schedule, and track food safety field inspections across designated municipal zones.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Assign Inspector & Evaluate</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inspections List Table */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Inspection ID</th>
                <th className="py-3.5 px-4">Establishment</th>
                <th className="py-3.5 px-4">Inspector</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status & Score</th>
                <th className="py-3.5 px-4">Active Findings</th>
                <th className="py-3.5 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading inspections...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No inspections on record. Click "Schedule New Inspection" to create one.
                  </td>
                </tr>
              ) : (
                inspections.map((ins) => {
                  const statusColors = {
                    'Scheduled': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    'In Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    'Submitted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                    'Resolved': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  };

                  return (
                    <tr key={ins.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        #INS-{String(ins.id).padStart(4, '0')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{ins.establishment_name}</div>
                        <span className="text-[11px] text-slate-400">{ins.establishment_zone} • {ins.establishment_type}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium">{ins.inspector_name}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {ins.inspection_date}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[ins.status] || 'bg-slate-700 text-slate-300'}`}>
                            {ins.status}
                          </span>
                          {ins.score !== null && (
                            <span className="text-[11px] font-mono text-slate-400">
                              Score: {ins.score}/100
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-xs ${
                          ins.violations_count > 0 ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'text-slate-400'
                        }`}>
                          {ins.violations_count} Violations
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ins.status === 'Scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(ins.id, 'In Progress')}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold"
                            >
                              Start Audit
                            </button>
                          )}

                          {ins.status === 'In Progress' && (
                            <button
                              onClick={() => onOpenViolationModal(ins.establishment_id, ins.id)}
                              className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded text-xs font-semibold flex items-center gap-1"
                            >
                              <AlertOctagon className="w-3 h-3" />
                              <span>Log Violation</span>
                            </button>
                          )}

                          {ins.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateStatus(ins.id, 'Submitted')}
                              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-semibold"
                            >
                              Submit Audit
                            </button>
                          )}

                          {ins.status === 'Submitted' && (
                            <button
                              onClick={() => handleUpdateStatus(ins.id, 'Resolved')}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-semibold"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INSPECTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Assign Inspector & Evaluate</h3>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Food Establishment</label>
                <select
                  value={formData.establishment_id}
                  onChange={(e) => setFormData({ ...formData, establishment_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.zone} - {e.risk_category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Inspector</label>
                  <input
                    type="text"
                    value={formData.inspector_name}
                    onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evaluation Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
                <p className="mt-1 text-[10px] text-slate-500">This compliance evaluation is shown in the inspection list and hotel profile.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Workflow Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Focus & Inspection Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Focus points: walk-in cooling, HACCP compliance, food contact surfaces..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? 'Saving...' : 'Assign & Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
