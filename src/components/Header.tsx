import React from 'react';
import { Search, Bell, Shield, Terminal, ChevronRight } from 'lucide-react';
import { ViewId } from '../types';

interface HeaderProps {
  activeView: ViewId;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const getBreadcrumbs = () => {
    const mapping: Record<string, string> = {
      'home': 'Overview / Home',
      'market-overview': 'Macro Terminal / Global State',
      'attention-feed': 'Macro Terminal / Attention Feed',
      'narrative-monitor': 'Macro Terminal / Narrative Intensity',
      'investigation-gateway': 'Institutional Tools / Investigation',
      'archive': 'Institutional Tools / Analyst Archive',
      'token-analysis': 'Institutional Tools / Reports',
      'settings': 'System / Settings'
    };
    return mapping[activeView] || activeView;
  };

  return (
    <header className="h-14 border-b border-slate-border bg-background-dark/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="text-sky-400">SplashSignal</span>
          <ChevronRight size={12} />
          <span className="text-sky-200 uppercase tracking-wider">{getBreadcrumbs()}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search assets, entities, or events..." 
            className="bg-slate-panel/50 border border-slate-border rounded-full py-1.5 pl-10 pr-4 text-xs w-80 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-600 bg-black/20 px-1 rounded">⌘K</div>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-border pl-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-slate-400">LATENCY: 12ms</span>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Shield size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
