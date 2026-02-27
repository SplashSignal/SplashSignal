import React from 'react';
import { 
  Home,
  Globe, 
  Bell, 
  Search, 
  History, 
  FileText, 
  LayoutDashboard, 
  MessageSquare,
  ShieldAlert,
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();
  const categories = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'home', label: 'Home', icon: Home },
      ]
    },
    {
      title: 'MACRO TERMINAL',
      items: [
        { id: 'market-overview', label: 'Global State', icon: Globe },
        { id: 'attention-feed', label: 'Attention Feed', icon: Bell },
        { id: 'narrative-monitor', label: 'Narrative Intensity', icon: MessageSquare },
      ]
    },
    {
      title: 'INSTITUTIONAL TOOLS',
      items: [
        { id: 'investigation-gateway', label: 'Investigation', icon: Search },
        { id: 'archive', label: 'Analyst Archive', icon: History },
        { id: 'token-analysis', label: 'Reports', icon: FileText },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="w-64 h-screen bg-slate-panel border-r border-slate-border flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-white">S</div>
          <span className="font-display font-bold text-xl tracking-tight">SplashSignal</span>
        </div>
        <div className="mt-1 text-[10px] text-sky-400 font-mono tracking-widest uppercase">Intelligence I.O.</div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {categories.map((cat, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-6 mb-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
              {cat.title}
            </div>
            {cat.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewId)}
                className={cn(
                  "w-full px-6 py-2.5 flex items-center gap-3 transition-colors text-sm",
                  activeView === item.id 
                    ? "bg-primary/10 text-primary border-r-2 border-primary" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 group relative">
          <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden border border-primary/30">
            <img src={user?.profilePicture} alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate uppercase">{user?.username}</div>
            <div className="text-[10px] text-sky-400 font-mono">{user?.status}</div>
          </div>
          <button 
            onClick={logout}
            className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all text-slate-500"
            title="Terminate Session"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
