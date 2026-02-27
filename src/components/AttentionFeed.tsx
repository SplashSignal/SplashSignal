import React from 'react';
import { 
  AlertCircle, 
  Zap, 
  Droplets, 
  MessageSquare, 
  ArrowUpRight, 
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

const alerts = [
  {
    id: 'SIG-8821',
    type: 'VOLATILITY_SPIKE',
    title: 'High Volatility Detected: ETH/USDT',
    description: 'Price deviation exceeds 4.2% within 5-minute window. Correlated whale movements detected in 3 major exchanges.',
    severity: 'high',
    time: '2m ago',
    category: 'Market',
    icon: Zap
  },
  {
    id: 'SIG-8820',
    type: 'LIQUIDITY_GAP',
    title: 'Liquidity Thinning on Uniswap V3',
    description: 'Significant reduction in depth for WBTC/USDC pool. Potential slippage risk for orders > $500k.',
    severity: 'critical',
    time: '12m ago',
    category: 'Liquidity',
    icon: Droplets
  },
  {
    id: 'SIG-8819',
    type: 'SENTIMENT_SHIFT',
    title: 'Narrative Pivot: "AI Agent Summer"',
    description: 'Sudden 300% increase in keyword frequency across institutional channels. Bot amplification index: 0.82.',
    severity: 'medium',
    time: '45m ago',
    category: 'Social',
    icon: MessageSquare
  },
  {
    id: 'SIG-8818',
    type: 'CLUSTER_ACTIVE',
    title: 'Dormant Wallet Cluster Activation',
    description: '7 wallets from the 2021 "Genesis" cluster moved 4,500 BTC to OTC desks.',
    severity: 'high',
    time: '1h ago',
    category: 'On-chain',
    icon: AlertCircle
  }
];

export const AttentionFeed: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Attention Feed</h1>
          <p className="text-slate-500 mt-1">Real-time critical alerts and signal intelligence</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-panel border border-slate-border rounded-lg text-xs font-bold hover:bg-white/5 transition-all">
            <Filter size={14} /> FILTER
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            MARK ALL READ
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={cn(
              "bg-slate-panel border border-slate-border rounded-xl p-5 flex gap-5 group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden",
              alert.severity === 'critical' && "border-red-500/30 bg-red-500/[0.02]"
            )}
          >
            {alert.severity === 'critical' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            )}
            
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              alert.severity === 'critical' ? "bg-red-500/10 text-red-500" : 
              alert.severity === 'high' ? "bg-amber-500/10 text-amber-500" : 
              "bg-primary/10 text-primary"
            )}>
              <alert.icon size={24} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider">{alert.id}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-black/20 rounded">{alert.category}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{alert.time}</span>
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{alert.title}</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
              
              <div className="mt-4 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-panel bg-slate-700 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alert.id}${i}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-slate-panel bg-slate-800 flex items-center justify-center text-[8px] font-bold">+12</div>
                </div>
                <div className="h-4 w-px bg-slate-border"></div>
                <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                  VIEW FULL ANALYSIS <ArrowUpRight size={12} />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between items-end">
              <button className="text-slate-500 hover:text-white transition-colors">
                <MoreHorizontal size={20} />
              </button>
              <div className={cn(
                "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest",
                alert.severity === 'critical' ? "bg-red-500 text-white" : 
                alert.severity === 'high' ? "bg-amber-500/20 text-amber-500" : 
                "bg-primary/20 text-primary"
              )}>
                {alert.severity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
