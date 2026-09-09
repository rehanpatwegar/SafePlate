import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  AlertOctagon,
  TrendingDown,
  Sparkles,
  PlusCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { RiskTrendLineChart } from '../components/Charts';
import api from '../services/api';

export default function Establishments({ initialSelectedId, onOpenInspectionModal, onOpenViolationModal, onOpenAIAssistant }) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const res = await api.getEstablishments({
        search: search || undefined,
        zone: zoneFilter,
        riskCategory: riskFilter
      });
      if (res.success) {
        setEstablishments(res.data);
      }
    } catch (err) {
      console.error('Failed to load establishments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, [search, zoneFilter, riskFilter]);

  // Load detailed profile when an establishment is selected
  const loadProfile = async (id) => {
    try {
      setProfileLoading(true);
      setAiAnalysis(null);
      setRecalculateMessage(null);
      const res = await api.getEstablishmentById(id);
      if (res.success) {
        setProfileData(res.data);
        setSelectedEstablishment(res.data);
      }
    } catch (err) {
      console.error('Failed to load establishment profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (initialSelectedId) {
      loadProfile(initialSelectedId);
    }
  }, [initialSelectedId]);

  // Trigger Backend Dynamic Risk Recalculation
  const handleRecalculate = async (id) => {
    try {
      setRecalculating(true);
      setRecalculateMessage(null);
      const res = await api.recalculateRisk(id);
      if (res.success) {
        setRecalculateMessage(res.message);
        // Refresh local profile and global list
        await loadProfile(id);
        fetchEstablishments();
      }
    } catch (err) {
      setRecalculateMessage(`Recalculation error: ${err.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  // Run GenAI Risk Analysis
  const handleExplainRisk = async (id) => {
    try {
      setAiLoading(true);
      const res = await api.explainRisk(id);
      if (res.success) {
        setAiAnalysis(res.analysis);
      }
    } catch (err) {
      setAiAnalysis(`AI Risk Analysis failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Food Establishments Directory
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono">
              {establishments.length} Facilities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Filterable registry of restaurants, cafeterias, bakeries, and mobile trucks with live risk scores.
          </p>
        </div>

        {/* Quick select Central Spice Case Study */}
        <button
          onClick={() => loadProfile(1)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span>Case Study: Central Spice (84/100)</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by facility name, address, or type..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Zone Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Zone:</span>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-800">All Zones</option>
              <option value="Zone A" className="bg-slate-800">Zone A</option>
              <option value="Zone B" className="bg-slate-800">Zone B</option>
              <option value="Zone C" className="bg-slate-800">Zone C</option>
            </select>
          </div>

          {/* Risk Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-800">All Levels</option>
              <option value="Critical" className="bg-slate-800">Critical</option>
              <option value="High Risk" className="bg-slate-800">High Risk</option>
              <option value="Medium Risk" className="bg-slate-800">Medium Risk</option>
              <option value="Low Risk" className="bg-slate-800">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Establishment</th>
                <th className="py-3.5 px-4">Type & Zone</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4">Last Inspected</th>
                <th className="py-3.5 px-4">License ID</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading food establishments...
                  </td>
                </tr>
              ) : establishments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No establishments match your filters.
                  </td>
                </tr>
              ) : (
                establishments.map((est) => {
                  const isCriticalCase = est.id === 1;
                  return (
                    <tr
                      key={est.id}
                      onClick={() => loadProfile(est.id)}
                      className={`hover:bg-slate-800/80 cursor-pointer transition-colors ${
                        isCriticalCase ? 'bg-red-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${
                            isCriticalCase
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{est.name}</span>
                              {isCriticalCase && (
                                <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded text-[10px] font-bold border border-red-500/30">
                                  CASE STUDY
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{est.address}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          {est.type}
                        </span>
                        <span className="ml-2 font-mono text-[11px] text-slate-400">{est.zone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge category={est.risk_category} score={est.risk_score} />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {est.last_inspection_date || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {est.operating_license}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadProfile(est.id);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 hover:border-cyan-500 rounded-lg text-xs font-semibold text-slate-200 transition-all"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTAURANT PROFILE DETAIL DRAWER / MODAL */}
      {selectedEstablishment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEstablishment(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800 pr-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold border border-cyan-500/20">
                    {selectedEstablishment.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedEstablishment.zone}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">{selectedEstablishment.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedEstablishment.address}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedEstablishment.phone}</span>
                  <span className="flex items-center gap-1 font-mono">License: {selectedEstablishment.operating_license}</span>
                </div>
              </div>

              {/* Live Risk Badge in Profile */}
              <div className="flex flex-col items-end gap-1">
                <RiskBadge category={selectedEstablishment.risk_category} score={selectedEstablishment.risk_score} size="lg" />
                <span className="text-[10px] text-slate-400 font-mono">
                  Recalculated on: {selectedEstablishment.last_inspection_date}
                </span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Dynamic Recalculate Button */}
                <button
                  onClick={() => handleRecalculate(selectedEstablishment.id)}
                  disabled={recalculating}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                  <span>Recalculate Risk Score</span>
                </button>

                {/* GenAI Explain Risk Button */}
                <button
                  onClick={() => handleExplainRisk(selectedEstablishment.id)}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>{aiLoading ? 'Analyzing...' : 'GenAI Risk Explanation'}</span>
                </button>
              </div>

              {/* Inspection Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenInspectionModal(selectedEstablishment.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Schedule Inspection</span>
                </button>

                <button
                  onClick={() => onOpenViolationModal(selectedEstablishment.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-colors"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Log Violation</span>
                </button>
              </div>
            </div>

            {/* Notification banner upon recalculation */}
            {recalculateMessage && (
              <div className="my-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{recalculateMessage}</span>
              </div>
            )}

            {/* GenAI Risk Analysis Box */}
            {aiAnalysis && (
              <div className="my-4 p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-slate-200 text-xs leading-relaxed space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-cyan-300">Grounded SafePlate AI Inspection Intelligence</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-900/40 px-2 py-0.5 rounded">
                    Audit Log Grounded
                  </span>
                </div>
                <div className="whitespace-pre-line prose-sm text-slate-300 font-sans">
                  {aiAnalysis}
                </div>
              </div>
            )}

            {/* 2-Column Grid: Visual Meter + Historical Trend */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6">
              {/* Score Meter */}
              <div className="md:col-span-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Current Risk Score
                </span>

                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        selectedEstablishment.risk_score >= 80 ? 'text-red-500' :
                        selectedEstablishment.risk_score >= 60 ? 'text-orange-500' :
                        selectedEstablishment.risk_score >= 35 ? 'text-amber-500' : 'text-emerald-500'
                      }
                      strokeDasharray={`${selectedEstablishment.risk_score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">
                      {selectedEstablishment.risk_score}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">/ 100</span>
                  </div>
                </div>

                <div className="mt-2">
                  <RiskBadge category={selectedEstablishment.risk_category} showScore={false} size="sm" />
                </div>

                <p className="text-[11px] text-slate-400 mt-3 max-w-xs">
                  Formula: Base(15) + (Crit × 35) + (Maj × 15) + (Min × 5)
                </p>
              </div>

              {/* Historical Trend Chart */}
              <div className="md:col-span-7 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Historical Risk Score Trend (Last 5 Months)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Score vs Time</span>
                </div>
                <RiskTrendLineChart data={profileData?.trend} />
              </div>
            </div>

            {/* Active Violations Table */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white">Flagged Non-Compliance Violations</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {profileData?.violations?.length || 0} Record(s)
                </span>
              </div>

              <div className="space-y-2">
                {profileData?.violations?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                    No active non-compliance violations on record. Score is currently optimized.
                  </div>
                ) : (
                  profileData?.violations?.map((viol) => (
                    <div
                      key={viol.id}
                      className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            viol.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            viol.severity === 'Major' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {viol.severity.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-white">{viol.category}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Status: {viol.corrective_action_status}</span>
                        </div>
                        <p className="text-xs text-slate-300">{viol.description}</p>
                      </div>

                      {viol.evidence_image_url && (
                        <img
                          src={viol.evidence_image_url}
                          alt="Violation Evidence"
                          className="w-16 h-12 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Inspection History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Chronological Inspection History</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {profileData?.inspections?.length || 0} Audit(s)
                </span>
              </div>

              <div className="space-y-2">
                {profileData?.inspections?.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{ins.inspection_date}</span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700">
                          {ins.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{ins.notes}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-cyan-400 font-semibold">{ins.inspector_name}</span>
                      <p className="text-[10px] text-slate-400">Score: {ins.score}/100</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
