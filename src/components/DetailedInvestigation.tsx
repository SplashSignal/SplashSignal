import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  Activity, 
  Target, 
  Users, 
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  ArrowUpRight,
  Fingerprint,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { initAnalysis, getAnalysisSummary, getAnalysisWallet, getAnalysisRisk } from '../services/marketService';

export const WalletIntelligence: React.FC<{ target?: string; onBack: () => void }> = ({ target, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const startAnalysis = async () => {
      if (!target) return;
      setLoading(true);
      try {
        const { id } = await initAnalysis(target);
        setAnalysisId(id);

        // Poll for completion
        let isComplete = false;
        let attempts = 0;
        while (!isComplete && attempts < 30) {
          const status = await getAnalysisSummary(id);
          if (status.status === 'COMPLETED') {
            setSummary(status);
            isComplete = true;
          } else {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
          }
        }

        if (isComplete) {
          const [wallet, risk] = await Promise.all([
            getAnalysisWallet(id),
            getAnalysisRisk(id)
          ]);
          setWalletData(wallet);
          setRiskData(risk);
        }
      } catch (e) {
        console.error('Analysis failed', e);
      } finally {
        setLoading(false);
      }
    };

    startAnalysis();
  }, [target]);

  const displayTarget = target || '0x7741...882';

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-display font-bold">Initializing Behavioral Analysis</h2>
          <p className="text-slate-500 text-sm">Mapping wallet relationships and intent signatures...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold tracking-tight truncate max-w-md">{displayTarget}</h1>
            {riskData?.overallScore > 70 && (
              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/20 uppercase tracking-widest">Flagged: High Risk</span>
            )}
            {riskData?.overallScore <= 70 && riskData?.overallScore > 30 && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded border border-amber-500/20 uppercase tracking-widest">Suspicious Activity</span>
            )}
          </div>
          <p className="text-slate-500 text-sm">Behavioral Fingerprint & Intent Classification</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Identity Card */}
        <div className="col-span-1 bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-border overflow-hidden mb-4 relative group">
            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${displayTarget}`} alt="Avatar" />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Fingerprint size={32} className="text-white" />
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1">{walletData?.classification || 'Unknown Actor'}</h3>
          <p className="text-xs text-slate-500 mb-6">Active since {walletData?.firstSeen ? new Date(walletData.firstSeen).toLocaleDateString() : 'N/A'}</p>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Value</span>
              <span className="font-mono font-bold">${walletData?.totalValue?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Primary Chain</span>
              <span className="font-mono font-bold capitalize">{summary?.chain || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tx Count</span>
              <span className="font-mono font-bold">{walletData?.txCount?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="col-span-3 grid grid-cols-3 gap-6">
          <div className="bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Score</span>
              <Activity size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-4xl font-display font-bold">{walletData?.activityScore || 0}</div>
              <div className="text-xs text-emerald-500 font-bold mt-1 uppercase tracking-widest">
                {walletData?.activityTrend > 0 ? `+${walletData.activityTrend}%` : `${walletData?.activityTrend || 0}%`} vs Avg
              </div>
            </div>
            <div className="h-1 bg-black/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${walletData?.activityScore || 0}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intent Score</span>
              <Target size={16} className="text-amber-500" />
            </div>
            <div>
              <div className="text-4xl font-display font-bold">{walletData?.intentScore || 0}</div>
              <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{walletData?.intentType || 'Neutral'}</div>
            </div>
            <div className="h-1 bg-black/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${walletData?.intentScore || 0}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Rating</span>
              <Shield size={16} className="text-red-500" />
            </div>
            <div>
              <div className="text-4xl font-display font-bold">{riskData?.grade || 'N/A'}</div>
              <div className="text-xs text-red-500 font-bold mt-1 uppercase tracking-widest">{riskData?.primaryRisk || 'Low Risk'}</div>
            </div>
            <div className="h-1 bg-black/20 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${riskData?.overallScore || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Interaction Summary */}
        <div className="col-span-2 bg-slate-panel border border-slate-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-bold">Interaction Summary</h3>
            <button className="text-xs text-primary font-bold hover:underline">VIEW ALL</button>
          </div>
          <div className="space-y-4">
            {walletData?.interactions?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    item.risk === 'High' ? "bg-red-500/10 text-red-500" : "bg-slate-700/30 text-slate-400"
                  )}>
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">{item.actor}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{item.type} • {item.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold">{item.amount}</div>
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    item.risk === 'High' ? "text-red-500" : item.risk === 'Medium' ? "text-amber-500" : "text-emerald-500"
                  )}>{item.risk} RISK</div>
                </div>
              </div>
            ))}
            {(!walletData?.interactions || walletData.interactions.length === 0) && (
              <div className="text-center py-8 text-slate-500 text-sm">No recent interactions detected.</div>
            )}
          </div>
        </div>

        {/* Correlated Actors */}
        <div className="bg-slate-panel border border-slate-border rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold mb-6">Correlated Actors</h3>
          <div className="space-y-6">
            {walletData?.correlatedActors?.map((actor: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${actor.address}`} alt="Actor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{actor.address}</div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${actor.correlation}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{actor.correlation}%</span>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-600" />
              </div>
            ))}
            {(!walletData?.correlatedActors || walletData.correlatedActors.length === 0) && (
              <div className="text-center py-8 text-slate-500 text-sm">No correlated actors found.</div>
            )}
          </div>
          <button className="w-full mt-8 py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-border rounded-lg hover:bg-white/5 transition-all">
            EXPAND NETWORK
          </button>
        </div>
      </div>
    </div>
  );
};
