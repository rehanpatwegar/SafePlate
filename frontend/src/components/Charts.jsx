import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export function RiskDistributionDonutChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No risk distribution data available
      </div>
    );
  }

  const COLORS = {
    'Critical': '#EF4444',
    'High Risk': '#F97316',
    'Medium Risk': '#EAB308',
    'Low Risk': '#10B981'
  };

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Pie
            data={data}
            innerRadius={62}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name] || '#64748b'} 
                stroke="#0f172a" 
                strokeWidth={2} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-white">{total}</span>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Facilities</span>
      </div>
    </div>
  );
}

export function ViolationCategoryBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No violation category data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="category" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            angle={-15} 
            textAnchor="end" 
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar 
            dataKey="count" 
            fill="#06b6d4" 
            radius={[4, 4, 0, 0]} 
            name="Active Violations"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskTrendLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500">
        No trend data
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#EF4444" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#riskGradient)" 
            name="Risk Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
