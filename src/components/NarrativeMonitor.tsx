import React from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Zap, 
  Activity,
  BarChart3,
  ArrowUpRight,
  Filter,
  Share2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { cn } from '../lib/utils';

const volumeData = [
  { time: '00:00', volume: 1200, unique: 400 },
  { time: '04:00', volume: 1800, unique: 550 },
  { time: '08:00', volume: 3200, unique: 800 },
  { time: '12:00', volume: 4500, unique: 1200 },
  { time: '16:00', volume: 3800, unique: 1100 },
  { time: '20:00', volume: 5200, unique: 1500 },
  { time: '23:59', volume: 4800, unique: 1400 },
];

const stats = [
  { label: 'Organic Reach Index', value: 0.42, delta: '-5.2%', status: 'low' },
  { label: 'Bot Density', value: 0.82, delta: '+12.4%', status: 'high' },
  { label: 'Message Velocity', value: '4.2k/hr', delta: '+300%', status: 'high' },
  { label: 'Sentiment Bias', value: '+0.64', delta: '+0.12', status: 'neutral' },
];

export const NarrativeMonitor: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display font-bold tracking-tight">Narrative ID: "AI Agent Summer"</h1>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded border border-primary/20 uppercase tracking-widest">Tracking Active</span>
          </div>
          <p className="text-slate-500">Monitoring cross-platform amplification and organic resonance</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"><Share2 size={20} /></button>
          <button className="px-4 py-2 bg-slate-panel border border-slate-border rounded-lg text-xs font-bold hover:bg-white/5 transition-all">EXPORT DATA</button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-panel border border-slate-border p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              <div className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                stat.delta.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
              )}>{stat.delta}</div>
            </div>
            <div className="text-2xl font-display font-bold">{stat.value}</div>
            <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  stat.status === 'high' ? "bg-primary" : stat.status === 'neutral' ? "bg-amber-500" : "bg-emerald-500"
                )} 
                style={{ width: typeof stat.value === 'number' ? `${stat.value * 100}%` : '75%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="col-span-2 bg-slate-panel border border-slate-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold">Message Volume vs Unique Account Growth</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-primary"><div className="w-2 h-2 rounded-full bg-primary"></div> Total Volume</div>
              <div className="flex items-center gap-2 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Unique Accounts</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137fec" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4b" vertical={false} />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c2632', border: '1px solid #2d3a4b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#137fec" fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="unique" stroke="#10b981" fillOpacity={1} fill="url(#colorUnique)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Amplification Network */}
        <div className="bg-slate-panel border border-slate-border rounded-xl p-6">
          <h3 className="text-lg font-display font-bold mb-6">Amplification Network</h3>
          <div className="space-y-6">
            {[
              { label: 'Bot Clusters', value: 82, color: 'bg-primary' },
              { label: 'Influencer Nodes', value: 12, color: 'bg-purple-500' },
              { label: 'Organic Users', value: 6, color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono font-bold">{item.value}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2 uppercase tracking-widest">
              <Zap size={14} /> AI Insight
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Narrative shows high artificial amplification. 82% of volume is generated by known bot clusters. Organic resonance remains low.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
