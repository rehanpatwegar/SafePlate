import React from 'react';
import {
  LayoutDashboard,
  Store,
  ClipboardList,
  AlertOctagon,
  CheckSquare,
  Bot,
  LogIn,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, metrics }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'establishments', label: 'Establishments', icon: Store, badge: metrics?.total_establishments },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList },
    { id: 'violations', label: 'Violations', icon: AlertOctagon, badge: metrics?.critical_count ? `${metrics.critical_count} Crit` : null, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'corrective-actions', label: 'Corrective Actions', icon: CheckSquare, badge: metrics?.pending_corrective_actions, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { id: 'ai-assistant', label: 'SafePlate AI', icon: Bot, isNew: true },
    { id: 'login', label: 'Roles & Profiles', icon: LogIn }
  ];

  return (
    <aside className="w-64 bg-slate-850 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Operations Hub
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono ${item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}

                {item.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    GENAI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Case Study Quick Card */}
      <div className="p-4 m-3 bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">Central Spice</p>
            <span className="text-[10px] text-red-400 font-mono">Case Study: 84 Score</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Solve active violations to trigger dynamic risk recalculation down to 20 (LOW RISK).
        </p>
        <button
          onClick={() => onSelectTab('establishments', { selectId: 1 })}
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>Launch Restaurant</span>
        </button>
      </div>
    </aside>
  );
}
