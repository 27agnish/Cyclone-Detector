import React from 'react';
import { 
  LayoutDashboard, 
  Wind, 
  Activity, 
  Layers, 
  MapPin, 
  Hospital, 
  Users, 
  Satellite, 
  AlertOctagon, 
  Sparkles, 
  FileText, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { useCycloneStore, TabType } from '../../store/cycloneStore';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isSidebarCollapsed, 
    toggleSidebar,
    healthStatus,
    activeCyclones
  } = useCycloneStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cyclones', label: 'Active Cyclones', icon: Wind, badge: `${activeCyclones.length}`, badgeColor: 'bg-cyan-900 text-cyan-300' },
    { id: 'cyclone-details', label: 'Cyclone Details', icon: Activity },
    { id: 'analysis', label: 'Risk Analysis', icon: Layers, badge: 'PROTOTYPE', badgeColor: 'bg-amber-950 text-amber-300' },
    { id: 'landfall', label: 'Landfall Analysis', icon: MapPin },
    { id: 'infrastructure', label: 'Infrastructure', icon: Hospital },
    { id: 'population', label: 'Population Exposure', icon: Users },
    { id: 'satellite', label: 'Satellite Intelligence', icon: Satellite },
    { id: 'emergency', label: 'Emergency Priorities', icon: AlertOctagon, badge: 'TRIAGE', badgeColor: 'bg-red-950 text-red-300' },
    { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside 
      className={`h-full bg-command-surface border-r border-command-border flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand & Collapse Toggle */}
      <div>
        <div className="p-3.5 border-b border-command-border flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="leading-tight truncate">
                <div className="font-mono font-extrabold text-sm tracking-wider text-white">
                  CYCLONESHIELD<span className="text-cyan-400"> AI</span>
                </div>
                <div className="text-[9px] text-slate-400 font-sans truncate">
                  Predict the Path. Protect What Matters.
                </div>
              </div>
            </div>
          )}

          {isSidebarCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition ${
              isSidebarCollapsed ? 'mx-auto mt-2 block' : ''
            }`}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition group ${
                  isActive
                    ? 'bg-cyan-950/80 border border-cyan-500/70 text-cyan-300 shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Strip */}
      <div className="p-3 border-t border-command-border bg-slate-950/60">
        {!isSidebarCollapsed ? (
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SYSTEM STATUS</span>
              </span>
              <span className="text-emerald-400 font-bold">{healthStatus?.status?.toUpperCase() || 'ONLINE'}</span>
            </div>
            <div className="text-slate-400 truncate">
              Core: <span className="text-slate-200">FastAPI REST + GIS Engine</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Backend Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
