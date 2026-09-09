import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ category, score, showScore = true, size = 'md' }) {
  const cat = (category || 'LOW RISK').toUpperCase();

  const styles = {
    'CRITICAL': {
      bg: 'bg-red-500/15 text-red-400 border-red-500/30',
      dot: 'bg-red-500',
      ring: 'ring-red-500/20',
      icon: ShieldAlert,
      label: 'CRITICAL RISK'
    },
    'HIGH RISK': {
      bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-500',
      ring: 'ring-orange-500/20',
      icon: AlertTriangle,
      label: 'HIGH RISK'
    },
    'MEDIUM RISK': {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
      ring: 'ring-amber-500/20',
      icon: AlertCircle,
      label: 'MEDIUM RISK'
    },
    'LOW RISK': {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
      ring: 'ring-emerald-500/20',
      icon: CheckCircle2,
      label: 'LOW RISK'
    }
  };

  const current = styles[cat] || styles['LOW RISK'];
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium tracking-wide shadow-sm ${current.bg} ${sizeClasses}`}>
      <span className="relative flex h-2 w-2">
        {cat === 'CRITICAL' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}></span>
      </span>
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{current.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-slate-900/60 rounded text-[11px] font-mono font-semibold">
          {score}/100
        </span>
      )}
    </span>
  );
}
