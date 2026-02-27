export interface User {
  username: string;
  login: string;
  email: string;
  displayName: string;
  profilePicture: string;
  role: string;
  status: string;
  settings: {
    defaultLandingPage: 'home' | 'market-overview' | 'investigation-gateway';
    timezone: string;
    units: 'USD' | 'NATIVE';
    dataMode: 'light' | 'heavy';
  };
}

export type ViewId = 
  | 'home'
  | 'market-overview' 
  | 'attention-feed' 
  | 'investigation-gateway' 
  | 'token-analysis' 
  | 'wallet-intelligence' 
  | 'cluster-analysis' 
  | 'reasoning-audit' 
  | 'content-analyzer' 
  | 'trust-history' 
  | 'archive' 
  | 'narrative-monitor'
  | 'settings';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
  category: 'macro' | 'tools' | 'system';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'market-overview', label: 'Global State', icon: 'Public', category: 'macro' },
  { id: 'attention-feed', label: 'Attention Feed', icon: 'NotificationsActive', category: 'macro' },
  { id: 'narrative-monitor', label: 'Narrative Intensity', icon: 'Forum', category: 'macro' },
  { id: 'investigation-gateway', label: 'Investigation', icon: 'ManageSearch', category: 'tools' },
  { id: 'archive', label: 'Analyst Archive', icon: 'History', category: 'tools' },
  { id: 'token-analysis', label: 'Reports', icon: 'Description', category: 'tools' },
];
