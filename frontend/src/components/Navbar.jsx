import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ChevronDown, Bell, Search, Activity, Sparkles } from 'lucide-react';

export default function Navbar({ currentUser, activeRoleKey, onRoleChange, onOpenAIAssistant }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roles = [
    { key: 'inspector', name: 'Marcus Brody', title: 'Food-Safety Inspector', badge: 'Inspector' },
    { key: 'manager', name: 'Dr. Evelyn Reed', title: 'Inspection Manager', badge: 'Manager' },
    { key: 'owner', name: 'Rajesh Patel', title: 'Establishment Owner (Central Spice)', badge: 'Owner' },
    { key: 'admin', name: 'System Administrator', title: 'Administrator', badge: 'Admin' }
  ];

  const handleSelectRole = (key) => {
    onRoleChange(key);
    setDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-slate-800/80 backdrop-blur border-b border-slate-700/60 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              SafePlate
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              v2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Intelligent Food Safety & Risk Management
          </p>
        </div>
      </div>

      {/* Center Search & AI Quick Launcher */}
      <div className="hidden md:flex items-center gap-2 max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restaurants, zones, license ID..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <button
          onClick={onOpenAIAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-medium transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Right User & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* System Health Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <Activity className="w-3 h-3 animate-pulse" />
          <span className="font-mono text-[11px]">API Online</span>
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-700/60 border border-slate-700/80 transition-all text-left"
          >
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Avatar"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-500/40"
            />
            <div className="hidden sm:block leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">{currentUser?.name || 'Marcus Brody'}</span>
                <span className="px-1.5 py-0.2 bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-mono">
                  {currentUser?.role?.split(' ')[0] || 'Inspector'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser?.agency || 'Public Health'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-700/80">
                <p className="text-xs font-semibold text-slate-300">Simulate Persona / Switch Role</p>
                <p className="text-[11px] text-slate-400">Select any role to test its specific views & actions</p>
              </div>
              <div className="p-1 space-y-1">
                {roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleSelectRole(r.key)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      activeRoleKey === r.key
                        ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-medium'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{r.title}</p>
                      <p className="text-[11px] text-slate-400">{r.name}</p>
                    </div>
                    {activeRoleKey === r.key && (
                      <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
