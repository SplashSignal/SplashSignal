import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Activity, 
  Users, 
  ArrowLeft,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle2,
  Search,
  ArrowUpRight,
  Share2,
  Info,
  Loader2,
  Fingerprint,
  Link as LinkIcon
} from 'lucide-react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  initAnalysis, 
  getAnalysisSummary, 
  getAnalysisMetadata, 
  getAnalysisClusters, 
  getAnalysisRisk,
  getDeterministicScore
} from '../services/marketService';
import { TokenMetadata, WalletCluster, RiskAssessment, RiskScore } from '../types/signalos';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  label: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

export const ClusterAnalysis: React.FC<{ target?: string; onBack: () => void }> = ({ target, onBack }) => {
  const [searchQuery, setSearchQuery] = useState(target || '');
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [clusters, setClusters] = useState<WalletCluster[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [summary, setSummary] = useState<any>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Derived metrics
  const botRisk = risk?.insiderCoordinationRisk.score || 0;
  const timingMatch = risk ? (risk.insiderCoordinationRisk.score / 100).toFixed(2) : '0.00';
  const walletCount = clusters.reduce((acc, c) => acc + c.wallets.length, 0);

  const evidenceLog = clusters.map((cluster, i) => ({
    id: `DET-0${i+1}`,
    type: cluster.type === 'funding' ? 'Shared Money Source' : cluster.type === 'timing' ? 'Perfect Timing' : 'Behavioral Link',
    description: cluster.evidence[0],
    confidence: cluster.coordinationScore / 100,
    time: 'Recent'
  }));

  useEffect(() => {
    const startAnalysis = async () => {
      if (!searchQuery) return;
      
      setLoading(true);
      try {
        const init = await initAnalysis(searchQuery);
        setAnalysisId(init.analysisId);
        
        // Poll for completion
        let completed = false;
        let attempts = 0;
        while (!completed && attempts < 10) {
          const status = await getAnalysisSummary(init.analysisId);
          if (status.status !== 'PENDING') {
            completed = true;
            setSummary(status);
            
            // Fetch all parts
            const [metaData, clusterData, riskData] = await Promise.all([
              getAnalysisMetadata(init.analysisId),
              getAnalysisClusters(init.analysisId),
              getAnalysisRisk(init.analysisId)
            ]);
            
            setMetadata(metaData);
            setClusters(clusterData);
            setRisk(riskData);
          } else {
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
          }
        }
      } catch (e) {
        console.error('Analysis failed', e);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) startAnalysis();
  }, [searchQuery]);

  useEffect(() => {
    const renderMap = () => {
      if (!svgRef.current || loading || !analysisId || clusters.length === 0) return;

      const width = 600;
      const height = 400;

      d3.select(svgRef.current).selectAll("*").remove();
      const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);

      const nodes: Node[] = [{ id: "center", group: 1, label: metadata?.symbol ? `$${metadata.symbol}` : 'Target' }];
      const links: Link[] = [];

      clusters.forEach((cluster, cIdx) => {
        cluster.wallets.forEach((wallet, wIdx) => {
          const nodeId = `cluster-${cIdx}-wallet-${wIdx}`;
          nodes.push({ id: nodeId, group: 2, label: `${wallet.slice(0, 6)}...` });
          links.push({ source: "center", target: nodeId, value: cluster.coordinationScore / 100 });
        });
      });

      const simulation = d3.forceSimulation<Node>(nodes)
        .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const link = svg.append("g")
        .attr("stroke", "#2d3a4b")
        .attr("stroke-opacity", 0.4)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value) * 2);

      const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(d3.drag<SVGGElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any);

      node.append("circle")
        .attr("r", d => d.id === "center" ? 16 : 8)
        .attr("fill", d => d.id === "center" ? "#137fec" : "#ef4444")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      node.append("text")
        .text(d => d.label)
        .attr("x", 18)
        .attr("y", 5)
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#94a3b8")
        .style("font-family", "monospace")
        .style("pointer-events", "none");

      simulation.on("tick", () => {
        link.attr("x1", d => (d.source as any).x).attr("y1", d => (d.source as any).y)
            .attr("x2", d => (d.target as any).x).attr("y2", d => (d.target as any).y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x; event.subject.fy = event.subject.y;
      }
      function dragged(event: any) { event.subject.fx = event.x; event.subject.fy = event.y; }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null; event.subject.fy = null;
      }
      return simulation;
    };

    let simulation: d3.Simulation<Node, Link> | undefined;
    const timer = setTimeout(() => {
      simulation = renderMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (simulation) simulation.stop();
    };
  }, [analysisId, clusters, metadata, loading]);

  const shortenedAddress = metadata?.deployer || (searchQuery.startsWith('0x') ? `${searchQuery.slice(0, 6)}...${searchQuery.slice(-4)}` : '');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold tracking-tight">
              {metadata ? `$${metadata.symbol}` : (searchQuery ? (searchQuery.startsWith('0x') ? 'Analyzing Asset...' : searchQuery) : 'Cluster Investigation')}
            </h1>
            {analysisId && (
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-widest",
                botRisk > 80 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              )}>
                {botRisk > 80 ? 'High Risk' : 'Low Risk'}
              </span>
            )}
          </div>
          {analysisId && (
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
              <LinkIcon size={12} />
              <span className="font-mono">{shortenedAddress}</span>
              <span className="text-slate-700">•</span>
              <span>{metadata?.name || 'Forensic Audit'}</span>
            </div>
          )}
        </div>
        
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Enter Token Name or Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-panel border border-slate-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all shadow-inner"
          />
        </div>

        <div className="flex gap-3">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400">
            <Share2 size={20} />
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
            REPORT BOTS
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[600px] flex flex-col items-center justify-center space-y-6 bg-slate-panel/20 rounded-3xl border border-slate-border/50"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <Fingerprint className="absolute inset-0 m-auto w-6 h-6 text-primary/50" />
            </div>
            <div className="text-center">
              <div className="text-xl font-display font-bold text-white mb-2">SCANNING NETWORK TOPOLOGY...</div>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Tracing wallet connections & funding lineage</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-6">
              {/* Bot Activity Risk */}
              <div className="bg-slate-panel border border-slate-border rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-help">
                <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  Bot Activity Risk
                  <Info size={10} />
                </div>
                
                {/* Tooltip */}
                <div className="absolute top-12 left-4 right-4 p-3 bg-black/90 border border-slate-border rounded-xl text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none leading-relaxed">
                  <span className="text-white font-bold block mb-1">What is this?</span>
                  This score shows how likely it is that the trading activity is being controlled by a single person using multiple "bot" wallets instead of real individual people.
                </div>

                <div className={cn(
                  "text-7xl font-display font-bold mb-2 transition-transform group-hover:scale-110 duration-500",
                  botRisk > 80 ? "text-red-500" : "text-emerald-500"
                )}>
                  {botRisk}%
                </div>
                <div className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                  botRisk > 80 ? "text-red-500" : "text-emerald-500"
                )}>
                  {botRisk > 80 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  {botRisk > 80 ? 'High Bot Activity' : 'Organic Activity'}
                </div>
                <p className="mt-6 text-xs text-slate-400 leading-relaxed">
                  {botRisk > 80 
                    ? `We detected a massive group of ${walletCount} wallets all acting in perfect sync. This is a common sign of a "pump and dump" setup.`
                    : 'The wallets trading this token seem to be acting independently, which is a healthy sign of real community growth.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="col-span-2 grid grid-cols-2 gap-6">
                <div className="bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col justify-between group cursor-help relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      Timing Similarity
                      <Info size={10} />
                    </span>
                    <Clock size={16} className="text-primary" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-12 left-4 right-4 p-3 bg-black/90 border border-slate-border rounded-xl text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none leading-relaxed">
                    <span className="text-white font-bold block mb-1">Timing Similarity</span>
                    A score of 1.00 means all wallets are clicking "buy" or "sell" at the exact same millisecond. Real humans don't have this kind of coordination.
                  </div>

                  <div className="text-4xl font-display font-bold">{timingMatch}</div>
                  <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">
                    {parseFloat(timingMatch) > 0.7 ? 'Suspiciously Fast' : 'Natural Timing'}
                  </div>
                  <div className="mt-4 flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={cn(
                        "h-1 flex-1 rounded-full", 
                        i < parseFloat(timingMatch) * 10 ? "bg-primary" : "bg-black/20"
                      )}></div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col justify-between group cursor-help relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      Connected Wallets
                      <Info size={10} />
                    </span>
                    <Users size={16} className="text-purple-500" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-12 left-4 right-4 p-3 bg-black/90 border border-slate-border rounded-xl text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none leading-relaxed">
                    <span className="text-white font-bold block mb-1">Connected Wallets</span>
                    This is the number of individual crypto wallets we've linked together into this single "cluster" based on their shared history.
                  </div>

                  <div className="text-4xl font-display font-bold">{walletCount}</div>
                  <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Linked Accounts</div>
                  <div className="mt-4 flex -space-x-2">
                    {[...Array(Math.min(5, walletCount))].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-panel bg-slate-700 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=actor${i}${analysisId}`} alt="Actor" />
                      </div>
                    ))}
                    {walletCount > 5 && (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-panel bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                        +{walletCount - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Wallet Connection Map */}
              <div className="col-span-2 bg-slate-panel border border-slate-border rounded-2xl p-6 relative min-h-[450px] overflow-hidden group">
                {!analysisId && !loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600">
                      <Network size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-slate-400">Ready to Investigate</h3>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">Enter a token contract address above to visualize the wallet connection network.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-4 left-4 z-10">
                      <h3 className="text-lg font-display font-bold">Wallet Connection Map</h3>
                      <p className="text-xs text-slate-500">Visualizing how these wallets are linked together</p>
                    </div>
                    
                    <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

                    <div className="absolute bottom-4 left-4 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 text-[10px] text-slate-400 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span>Blue Node: {metadata?.symbol ? `$${metadata.symbol}` : 'Token Contract'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Red Nodes: Individual Wallets in the Cluster</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button className="p-2 bg-black/40 rounded-lg text-slate-400 hover:text-white transition-colors"><Search size={16} /></button>
                      <button className="p-2 bg-black/40 rounded-lg text-slate-400 hover:text-white transition-colors"><Activity size={16} /></button>
                    </div>
                  </>
                )}
              </div>

              {/* Detection Evidence */}
              <div className="bg-slate-panel border border-slate-border rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Detection Evidence</h3>
                <div className="space-y-4 flex-1">
                  {evidenceLog.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-slate-500">{log.id}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                          <CheckCircle2 size={10} /> {(log.confidence * 100).toFixed(0)}% CONF
                        </div>
                      </div>
                      <div className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{log.type}</div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{log.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-600">{log.time}</span>
                        <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                          LEARN WHY <ArrowUpRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-border rounded-lg hover:bg-white/5 transition-all">
                  VIEW FULL FORENSIC LOG
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
