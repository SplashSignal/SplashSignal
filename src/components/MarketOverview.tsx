import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  AlertTriangle, 
  ArrowUpRight,
  Globe,
  Waves,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 52 },
  { time: '08:00', value: 48 },
  { time: '12:00', value: 61 },
  { time: '16:00', value: 55 },
  { time: '20:00', value: 67 },
  { time: '23:59', value: 63 },
];

const signals = [
  { label: 'Global Coordination', value: 84, delta: '+4.2%', status: 'high' },
  { label: 'Narrative Intensity', value: 62, delta: '-1.5%', status: 'neutral' },
  { label: 'Liquidity Stress', value: 28, delta: '+0.8%', status: 'low' },
  { label: 'Macro Volatility', value: 71, delta: '+12.4%', status: 'high' },
];

const anomalies = [
  { id: 'ANOM-442', type: 'Liquidity Gap', asset: 'ETH/USDC', severity: 'Critical', time: '2m ago' },
  { id: 'ANOM-441', type: 'Wash Trading', asset: 'PEPE', severity: 'High', time: '14m ago' },
  { id: 'ANOM-440', type: 'Whale Cluster', asset: 'BTC', severity: 'Medium', time: '32m ago' },
];

export const MarketOverview: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-4 gap-4">
        {signals.map((sig, i) => (
          <div key={i} className="bg-slate-panel border border-slate-border p-4 rounded-xl relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sig.label}</span>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded",
                sig.delta.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
              )}>
                {sig.delta.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {sig.delta}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold">{sig.value}</span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
            <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  sig.status === 'high' ? "bg-primary" : sig.status === 'neutral' ? "bg-amber-500" : "bg-emerald-500"
                )} 
                style={{ width: `${sig.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="col-span-2 bg-slate-panel border border-slate-border rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-display font-bold">Structural Coordination Heatmap</h3>
              <p className="text-xs text-slate-500">Cross-asset correlation and synchronization index</p>
            </div>
            <div className="flex gap-2">
              {['1H', '4H', '1D', '1W'].map(t => (
                <button key={t} className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded border transition-all",
                  t === '1D' ? "bg-primary border-primary text-white" : "border-slate-border text-slate-500 hover:text-slate-300"
                )}>{t}</button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137fec" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4b" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c2632', border: '1px solid #2d3a4b', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#137fec' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#137fec" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomalies Panel */}
        <div className="bg-slate-panel border border-slate-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold">Recent Anomalies</h3>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="space-y-4 flex-1">
            {anomalies.map((anom) => (
              <div key={anom.id} className="p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-slate-500">{anom.id}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    anom.severity === 'Critical' ? "text-red-500 bg-red-500/10" : "text-amber-500 bg-amber-500/10"
                  )}>{anom.severity}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm font-bold">{anom.type}</div>
                    <div className="text-xs text-slate-400">{anom.asset}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 group-hover:text-primary transition-colors flex items-center gap-1">
                    {anom.time} <ArrowUpRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-border rounded-lg hover:bg-white/5 transition-all">
            VIEW ALL ALERTS
          </button>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-panel border border-slate-border rounded-xl p-6">
          <h3 className="text-lg font-display font-bold mb-4">Regional Coordination Flow</h3>
          <div className="grid grid-cols-3 gap-4">
            {['APAC', 'EMEA', 'AMER'].map((region) => (
              <div key={region} className="p-4 rounded-xl bg-black/20 border border-white/5 text-center">
                <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">{region}</div>
                <div className="text-xl font-display font-bold">{(Math.random() * 100).toFixed(1)}%</div>
                <div className="mt-2 flex justify-center">
                  <Activity size={16} className="text-emerald-500 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-panel border border-slate-border rounded-xl p-6">
          <h3 className="text-lg font-display font-bold mb-4">Network Topology Health</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="48" cy="48" r="40" fill="transparent" stroke="#137fec" strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - 0.82)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">82%</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Stable</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Node Connectivity</span>
                <span className="font-mono">99.9%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sync Latency</span>
                <span className="font-mono">42ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Packet Integrity</span>
                <span className="font-mono">99.98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
