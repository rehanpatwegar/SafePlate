import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, ShieldAlert, FileText, ArrowRight, User } from 'lucide-react';

export default function Login({ currentUser, activeRoleKey, onRoleChange, onNavigateDashboard }) {
  const roles = [
    {
      key: 'inspector',
      title: 'Food-Safety Inspector',
      name: 'Marcus Brody',
      badge: 'FSI-9042',
      agency: 'Metro Dept of Public Health',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      description: 'Conduct on-site inspections, log critical violations with AI vision pre-fill, verify corrective proofs, and approve re-inspections.',
      features: [
        'Initiate & submit restaurant inspection audits',
        'AI computer vision assisted violation logging',
        'Verify submitted corrective actions',
        'Trigger risk recalculation & re-inspection'
      ]
    },
    {
      key: 'manager',
      title: 'Inspection Manager',
      name: 'Dr. Evelyn Reed',
      badge: 'MGR-1020',
      agency: 'Public Health Safety Commission',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      description: 'Monitor high-level municipal health compliance, track overdue audits, oversee high-risk facilities, and review inspector productivity.',
      features: [
        'City-wide risk distribution and overdue tracking',
        'Supervise high-risk restaurant remediations',
        'Review AI pre-inspection briefings',
        'Export compliance reports and statutory audits'
      ]
    },
    {
      key: 'owner',
      title: 'Establishment Owner',
      name: 'Rajesh Patel',
      badge: 'Central Spice Restaurant',
      agency: 'License: LIC-2024-09881',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      description: 'Facility owner portal. Review flagged violations for Central Spice Restaurant, upload photographic proof of fix, and request re-inspection.',
      features: [
        'Live establishment risk score meter & history',
        'Review inspector violation notices with photo evidence',
        'Submit corrective action proof & receipts',
        'Watch risk score drop upon inspector sign-off'
      ]
    },
    {
      key: 'admin',
      title: 'Administrator',
      name: 'System Administrator',
      badge: 'ADM-0001',
      agency: 'SafePlate Platform Core',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      description: 'System administration, Machine Learning model inference calibration, Gemini GenAI configurations, and database management.',
      features: [
        'ML Risk Engine (RandomForest) tuning & metrics',
        'GenAI prompt orchestration & Gemini API sync',
        'Database seeding & mock reset controls',
        'Municipal agency user administration'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Role Switcher & Persona Authentication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Select Your SafePlate Operational Role
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-2">
          Experience the food safety platform from each perspective: inspectors conducting on-site audits, restaurant owners resolving violations, managers overseeing city risk, or administrators.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r) => {
          const isSelected = activeRoleKey === r.key;
          return (
            <div
              key={r.key}
              onClick={() => onRoleChange(r.key)}
              className={`relative rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{r.title}</h3>
                      <p className="text-xs text-slate-300 font-medium">{r.name}</p>
                      <span className="text-[11px] text-cyan-400 font-mono">{r.agency}</span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs">
                      Select
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {r.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  {r.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Badge: {r.badge}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoleChange(r.key);
                    onNavigateDashboard();
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
