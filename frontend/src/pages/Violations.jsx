import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  PlusCircle,
  Sparkles,
  Camera,
  Image,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import api from '../services/api';

export default function Violations({ openCreateModalByDefault, defaultEstablishmentId, defaultInspectionId, onOpenInspectionModal }) {
  const [violations, setViolations] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(Boolean(openCreateModalByDefault));
  
  // Form State
  const [formData, setFormData] = useState({
    establishment_id: defaultEstablishmentId ? String(defaultEstablishmentId) : '',
    inspection_id: defaultInspectionId ? String(defaultInspectionId) : '',
    category: 'Temperature',
    severity: 'Critical',
    description: '',
    evidence_image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600'
  });

  const [aiDetecting, setAiDetecting] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [violResult, estResult, inspResult] = await Promise.allSettled([
        api.getViolations(),
        api.getEstablishments(),
        api.getInspections()
      ]);
      if (violResult.status === 'fulfilled' && violResult.value.success) setViolations(violResult.value.data);
      if (estResult.status === 'fulfilled' && estResult.value.success) setEstablishments(estResult.value.data);
      if (inspResult.status === 'fulfilled' && inspResult.value.success) setInspections(inspResult.value.data);
    } catch (err) {
      console.error('Failed to load violations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Keep the two dropdowns connected: an inspection always belongs to one establishment.
  useEffect(() => {
    if (!establishments.length) return;

    setFormData((current) => {
      const requestedEstablishmentId = defaultEstablishmentId ? String(defaultEstablishmentId) : current.establishment_id;
      const establishmentId = establishments.some((est) => String(est.id) === requestedEstablishmentId)
        ? requestedEstablishmentId
        : String(establishments[0].id);
      const matchingInspections = inspections.filter((inspection) => String(inspection.establishment_id) === establishmentId);
      const requestedInspectionId = defaultInspectionId ? String(defaultInspectionId) : current.inspection_id;
      const inspectionId = matchingInspections.some((inspection) => String(inspection.id) === requestedInspectionId)
        ? requestedInspectionId
        : (matchingInspections[0] ? String(matchingInspections[0].id) : '');

      if (current.establishment_id === establishmentId && current.inspection_id === inspectionId) return current;
      return { ...current, establishment_id: establishmentId, inspection_id: inspectionId };
    });
  }, [establishments, inspections, defaultEstablishmentId, defaultInspectionId]);

  const linkedInspections = inspections.filter(
    (inspection) => String(inspection.establishment_id) === String(formData.establishment_id)
  );

  const handleEstablishmentChange = (event) => {
    const establishmentId = event.target.value;
    const firstInspection = inspections.find(
      (inspection) => String(inspection.establishment_id) === String(establishmentId)
    );
    setFormData((current) => ({
      ...current,
      establishment_id: establishmentId,
      inspection_id: firstInspection ? String(firstInspection.id) : ''
    }));
  };

  // AI COMPUTER VISION DETECTION PRE-FILL HANDLER
  const handleAIPrefill = async (scenario = 'cooler') => {
    try {
      setAiDetecting(true);
      setAiDetectionResult(null);

      const scenarios = {
        cooler: {
          url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600',
          scenario: 'cooler'
        },
        pest: {
          url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600',
          scenario: 'pantry'
        },
        cross: {
          url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
          scenario: 'prep'
        }
      };

      const selected = scenarios[scenario] || scenarios.cooler;
      const res = await api.detectViolationImage({
        image_url: selected.url,
        scenario: selected.scenario
      });

      const detection = res.detection || res.data;
      if (res.success && detection) {
        const d = detection;
        setFormData(prev => ({
          ...prev,
          category: d.category,
          severity: d.severity,
          description: d.description,
          evidence_image_url: d.image_url || prev.evidence_image_url
        }));
        setAiDetectionResult(d);
      }
    } catch (err) {
      alert(`AI Vision Detection failed: ${err.message}`);
    } finally {
      setAiDetecting(false);
    }
  };

  const handleCreateViolation = async (e) => {
    e.preventDefault();
    if (!formData.establishment_id || !formData.inspection_id) {
      alert('Create an inspection for this establishment before recording a violation.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.createViolation(formData);
      if (res.success) {
        setStatusMessage('Violation recorded and establishment risk score dynamically updated!');
        setShowModal(false);
        setAiDetectionResult(null);
        await fetchAllData();
      }
    } catch (err) {
      alert(`Failed to log violation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredViolations = violations.filter(v => {
    if (filterSeverity !== 'All' && v.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    if (filterCategory !== 'All' && v.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Violations & Health Code Non-Compliance Log
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
              {violations.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized hazard classification with AI-assisted photo inspection, severity weighting, and remediation tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setAiDetectionResult(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-900/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Violation (With AI Vision)</span>
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

      {/* Filter Bar */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-800">All Severities</option>
              <option value="Critical" className="bg-slate-800">Critical (+35 pts)</option>
              <option value="Major" className="bg-slate-800">Major (+15 pts)</option>
              <option value="Minor" className="bg-slate-800">Minor (+5 pts)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-800">All Categories</option>
              <option value="Temperature" className="bg-slate-800">Temperature</option>
              <option value="Pest" className="bg-slate-800">Pest</option>
              <option value="Cross-Contamination" className="bg-slate-800">Cross-Contamination</option>
              <option value="Sanitation" className="bg-slate-800">Sanitation</option>
              <option value="Improper Storage" className="bg-slate-800">Improper Storage</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredViolations.length}</span> of {violations.length} violations
        </div>
      </div>

      {/* Violations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading violations registry...
          </div>
        ) : filteredViolations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No violations found for selected filters.
          </div>
        ) : (
          filteredViolations.map((viol) => {
            const severityStyles = {
              'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
              'Major': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
              'Minor': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            };

            const statusStyles = {
              'Pending': 'bg-red-500/10 text-red-400 border-red-500/20',
              'In Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            };

            return (
              <div
                key={viol.id}
                className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${severityStyles[viol.severity] || severityStyles.Minor}`}>
                      {viol.severity.toUpperCase()}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusStyles[viol.corrective_action_status] || statusStyles.Pending}`}>
                      {viol.corrective_action_status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">
                    {viol.category}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
                    {viol.description}
                  </p>
                </div>

                <div>
                  {viol.evidence_image_url && (
                    <div 
                      onClick={() => setPreviewImage(viol.evidence_image_url)}
                      className="relative rounded-xl overflow-hidden mb-3 border border-slate-700/80 cursor-pointer group/img h-32"
                    >
                      <img
                        src={viol.evidence_image_url}
                        alt="Violation Evidence"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold">
                        <Eye className="w-4 h-4" />
                        <span>Inspect Image</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {viol.establishment_name}
                    </span>
                    <span className="font-mono">#INS-{viol.inspection_id}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD VIOLATION (FEATURING AI COMPUTER VISION PRE-FILL) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Record Health Code Violation</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Input violation details manually or use AI Computer Vision to analyze inspection photos automatically.
            </p>

            {/* AI PRE-FILL TOOLBAR */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-cyan-300">AI Computer Vision Pre-Fill</span>
                </div>
                <span className="text-[10px] bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-500/20">
                  Multimodal Inspection
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                Simulate vision detection on commercial kitchen photos to extract category, severity, and factual violation report:
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAIPrefill('cooler')}
                  disabled={aiDetecting}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Walk-in Cooler (Temp)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAIPrefill('pest')}
                  disabled={aiDetecting}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Dry Pantry (Pest)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAIPrefill('cross')}
                  disabled={aiDetecting}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Prep Board (Cross-Contam)</span>
                </button>
              </div>

              {aiDetecting && (
                <div className="mt-3 text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing kitchen photo with SafePlate Vision model...</span>
                </div>
              )}

              {aiDetectionResult && (
                <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                    <span>Model: {aiDetectionResult.model}</span>
                    <span>Confidence: {(aiDetectionResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-white font-semibold">Suggested Action:</p>
                  <p className="text-slate-300 text-[11px]">{aiDetectionResult.suggested_action}</p>
                </div>
              )}
            </div>

            {/* FORM */}
            <form onSubmit={handleCreateViolation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Establishment</label>
                  <select
                    value={formData.establishment_id}
                    onChange={handleEstablishmentChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {!establishments.length && <option value="">No establishments available</option>}
                    {establishments.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Linked Inspection</label>
                  <select
                    value={formData.inspection_id}
                    onChange={(e) => setFormData({ ...formData, inspection_id: e.target.value })}
                    disabled={!linkedInspections.length}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {!linkedInspections.length && <option value="">Create an inspection first</option>}
                    {linkedInspections.map(i => (
                      <option key={i.id} value={i.id}>
                        #INS-{i.id} — {i.inspector_name} ({i.inspection_date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.establishment_id && !linkedInspections.length && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>No inspection has been assigned to this establishment yet. Assign one before recording a violation.</span>
                  <button
                    type="button"
                    onClick={() => onOpenInspectionModal?.(formData.establishment_id)}
                    className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 font-bold text-slate-950 hover:bg-amber-300"
                  >
                    Assign Inspector
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hazard Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Temperature">Temperature Abuse</option>
                    <option value="Pest">Pest Infestation</option>
                    <option value="Cross-Contamination">Cross-Contamination</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Improper Storage">Improper Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity Tier</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Critical">Critical (+35 Risk Pts)</option>
                    <option value="Major">Major (+15 Risk Pts)</option>
                    <option value="Minor">Minor (+5 Risk Pts)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Factual Violation Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific thermometer readings, locations, contamination vectors observed..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence Photo Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.evidence_image_url}
                    onChange={(e) => setFormData({ ...formData, evidence_image_url: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                  {formData.evidence_image_url && (
                    <img
                      src={formData.evidence_image_url}
                      alt="Thumbnail Preview"
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                    />
                  )}
                </div>
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
                  disabled={submitting || !formData.establishment_id || !formData.inspection_id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/30"
                >
                  {submitting ? 'Recording...' : 'Record Violation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm cursor-pointer"
        >
          <div className="max-w-2xl w-full p-2 bg-slate-900 border border-slate-700 rounded-2xl relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Full Size Evidence" className="w-full rounded-xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
