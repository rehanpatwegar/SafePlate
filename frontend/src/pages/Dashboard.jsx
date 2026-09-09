import React, { useState, useEffect } from 'react';
import {
  Store,
  ShieldAlert,
  Clock,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { RiskDistributionDonutChart, ViolationCategoryBarChart } from '../components/Charts';
import api from '../services/api';

export default function Dashboard({ onNavigate, currentUser }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priorityFacilities, setPriorityFacilities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, estRes] = await Promise.all([
        api.getRiskMetrics(),
        api.getEstablishments()
      ]);

      if (metricsRes.success) {
        setMetrics(metricsRes.data);
      }

      if (estRes.success) {
        // Sort by highest risk score first
        const sorted = [...estRes.data].sort((a, b) => b.risk_score - a.risk_score);
        setPriorityFacilities(sorted.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Safety Intelligence & Risk Overview
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              Live Audits
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time municipal food safety monitoring, predictive risk indexing, and remediation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => onNavigate('inspections', { openCreateModal: true })}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Establishments */}
        <div 
          onClick={() => onNavigate('establishments')}
          className="bg-slate-850 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Facilities
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {metrics?.total_establishments || 10}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <span>Active Roster</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            100% active operational licenses monitored across 3 zones
          </p>
        </div>

        {/* Card 2: High & Critical Risk Count */}
        <div 
          onClick={() => onNavigate('establishments', { riskCategory: 'Critical' })}
          className="bg-slate-850 bg-slate-800/60 hover:bg-slate-800 border border-red-500/30 rounded-2xl p-5 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
              Critical & High Risk
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-red-400">
              {(metrics?.critical_count || 0) + (metrics?.high_risk_count || 0)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
              {metrics?.critical_count || 1} Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Central Spice Restaurant (84) requires immediate supervisory action
          </p>
        </div>

        {/* Card 3: Overdue Inspections */}
        <div 
          onClick={() => onNavigate('inspections')}
          className="bg-slate-850 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overdue Audits
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400">
              {metrics?.overdue_inspections || 4}
            </span>
            <span className="text-xs text-amber-400/80 font-mono font-semibold">
              &gt; 25 days
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Automated notifications dispatched to assigned field inspectors
          </p>
        </div>

        {/* Card 4: Pending Corrective Actions */}
        <div 
          onClick={() => onNavigate('corrective-actions')}
          className="bg-slate-850 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Corrective Proof
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {metrics?.pending_corrective_actions || 7}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              Review Open
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Awaiting establishment owner proof submissions & re-inspection
          </p>
        </div>
      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Risk Distribution */}
        <div className="lg:col-span-5 bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Facility Risk Tier Distribution</h3>
              <p className="text-xs text-slate-400">Automated classification based on weighted violation formulas</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Dynamic
            </span>
          </div>

          <RiskDistributionDonutChart data={metrics?.risk_distribution} />

          {/* Legend Table */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-700/60">
            {metrics?.risk_distribution?.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-xs text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="text-xs font-bold font-mono text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Violation Categories */}
        <div className="lg:col-span-7 bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Active Violations by Hazard Category</h3>
              <p className="text-xs text-slate-400">Leading causes of non-compliance identified during inspections</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Public Health Metric</span>
          </div>

          <ViolationCategoryBarChart data={metrics?.category_breakdown} />

          <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Critical focus: <strong>Temperature abuse (53.4°F)</strong> & <strong>Pest vectors</strong></span>
            <button
              onClick={() => onNavigate('violations')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Explore All Violations</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Priority Attention Facilities Feed */}
      <div className="bg-slate-850 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Priority Attention Establishments</h3>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[11px] font-semibold border border-red-500/30">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Establishments sorted by predictive risk score requiring prompt supervisory intervention.
            </p>
          </div>

          <button
            onClick={() => onNavigate('establishments')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View All 10 Establishments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityFacilities.map((est) => (
            <div
              key={est.id}
              onClick={() => onNavigate('establishments', { selectId: est.id })}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                est.id === 1
                  ? 'bg-red-950/20 border-red-500/40 hover:border-red-500 shadow-md shadow-red-950/20'
                  : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-400">{est.zone}</span>
                  <RiskBadge category={est.risk_category} score={est.risk_score} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-white truncate" title={est.name}>
                  {est.name}
                </h4>
                <p className="text-xs text-slate-400 truncate">{est.address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Inspected: {est.last_inspection_date}</span>
                <span className="text-cyan-400 font-semibold group-hover:underline">Open Profile →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
