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
  Lock,
  Radio,
  Server
} from 'lucide-react';
import { useCycloneStore, TabType } from '../../store/cycloneStore';

interface NavGroup {
  title: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeStyle?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isSidebarCollapsed, 
    toggleSidebar,
    healthStatus,
    activeCyclones,
    selectedCycloneId,
    riskAssessment
  } = useCycloneStore();

  const selectedCyclone = activeCyclones.find(c => c.id === selectedCycloneId) || activeCyclones[0];
  const severityScore = riskAssessment?.overall_cyclone_risk_score ? Math.round(riskAssessment.overall_cyclone_risk_score) : 88;

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'CYCLONE INTELLIGENCE',
      items: [
        { 
          id: 'cyclones', 
          label: 'Active Cyclones', 
          icon: Wind, 
          badge: `${activeCyclones.length} ACTIVE`,
          badgeStyle: 'bg-cyan-950/80 border border-cyan-400 text-cyan-200'
        },
        { 
          id: 'cyclone-details', 
          label: 'Cyclone Details', 
          icon: Activity, 
          badge: selectedCyclone ? selectedCyclone.name.replace('Cyclone ', 'TC-') : 'TC-DANA',
          badgeStyle: 'bg-rose-950/90 border border-rose-400 text-rose-200'
        }
      ]
    },
    {
      title: 'RISK INTELLIGENCE',
      items: [
        { 
          id: 'analysis', 
          label: 'Risk Analysis', 
          icon: Layers, 
          badge: `CRITICAL ${severityScore}`,
          badgeStyle: 'bg-red-950/90 border border-red-500 text-white alert-beacon'
        },
        { 
          id: 'landfall', 
          label: 'Landfall Analysis', 
          icon: MapPin, 
          badge: 'T-14h',
          badgeStyle: 'bg-amber-950/80 border border-amber-400 text-amber-300'
        },
        { 
          id: 'infrastructure', 
          label: 'Infrastructure', 
          icon: Hospital, 
          badge: '142 ASSETS',
          badgeStyle: 'bg-[#13223f] border border-cyan-400/40 text-cyan-200'
        },
        { 
          id: 'population', 
          label: 'Population Exposure', 
          icon: Users, 
          badge: '1.4M',
          badgeStyle: 'bg-emerald-950/80 border border-emerald-400 text-emerald-200'
        }
      ]
    },
    {
      title: 'SATELLITE & AI',
      items: [
        { 
          id: 'satellite', 
          label: 'Satellite Intelligence', 
          icon: Satellite, 
          badge: 'INSAT-3D',
          badgeStyle: 'bg-emerald-950/80 border border-emerald-400 text-emerald-200'
        },
        { 
          id: 'ai', 
          label: 'AI Intelligence', 
          icon: Sparkles, 
          badge: 'FASTAPI',
          badgeStyle: 'bg-cyan-950/80 border border-cyan-400 text-cyan-200'
        }
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { 
          id: 'emergency', 
          label: 'Emergency Priorities', 
          icon: AlertOctagon, 
          badge: '7 URGENT',
          badgeStyle: 'bg-rose-950/90 border border-rose-400 text-rose-200'
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: FileText, 
          badge: 'PDF/JSON',
          badgeStyle: 'bg-[#13223f] border border-cyan-500/40 text-cyan-200'
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: SettingsIcon }
      ]
    }
  ];

  return (
    <aside 
      className={`relative h-full shrink-0 bg-[#070d18] border-r border-[#1e293b] z-40 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.7)] transition-all duration-300 select-none ${
        isSidebarCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between bg-[#070d18] border-b border-[#1e293b]/70">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_16px_rgba(0,229,255,0.4)]">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm uppercase tracking-wider font-extrabold bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                  CYCLONESHIELD AI
                </span>
                <span className="font-telemetry text-[9px] text-[#00daf3] uppercase tracking-widest font-semibold">
                  Predict Path • Protect Assets
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
          )}

          <button 
            onClick={toggleSidebar}
            className={`w-7 h-7 flex items-center justify-center rounded-lg bg-[#0f1a30] text-cyan-300 hover:text-white hover:bg-[#13223f] border border-cyan-500/30 transition-colors shadow-sm ${
              isSidebarCollapsed ? 'hidden' : ''
            }`}
            title="Collapse Tactical Dock"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
          </button>
        </div>

        {isSidebarCollapsed && (
          <div className="py-2 text-center border-b border-[#1e293b]">
            <button 
              onClick={toggleSidebar}
              className="w-7 h-7 mx-auto flex items-center justify-center rounded-lg bg-[#0f1a30] text-cyan-300 hover:text-white border border-cyan-500/30 transition-colors"
              title="Expand Dock"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2 py-1 font-telemetry text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#13223f] to-[#0f1a30] text-[#00e5ff] font-semibold border-l-4 border-[#00e5ff] shadow-[0_0_16px_rgba(0,229,255,0.3)] border-y border-r border-cyan-400/40' 
                        : 'text-slate-300 hover:bg-[#0f1a30] hover:text-white border border-transparent hover:border-cyan-500/30'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-cyan-400'
                      }`} />
                      {!isSidebarCollapsed && (
                        <span className={`text-xs font-medium tracking-wide ${isActive ? 'text-white font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isSidebarCollapsed && item.badge && (
                      <span className={`text-[10px] font-telemetry px-2 py-0.5 rounded-full font-bold shadow-sm ${item.badgeStyle}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Tactical Dock Footer */}
      <div className="p-3 bg-[#0b1326] border-t border-[#1e293b]/70 flex flex-col gap-2 shadow-[0_-2px_12px_rgba(0,0,0,0.5)]">
        {!isSidebarCollapsed ? (
          <>
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#070d18] p-1 rounded-lg border border-[#1e293b]/60">
              <button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-gradient-to-r from-cyan-950 to-[#0f1a30] border border-cyan-500/40 text-[#00e5ff] font-telemetry text-[10px] uppercase font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] pulse-beacon"></span>
                LIVE MODE
              </button>
              <button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-slate-400 hover:text-slate-200 transition-colors font-telemetry text-[10px] uppercase font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                SIMULATION
              </button>
            </div>

            {/* FastAPI Status Core */}
            <div className="flex items-center justify-between px-1 text-slate-400 font-telemetry text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                FASTAPI CORE
              </span>
              <span className="text-emerald-300 font-bold">18ms • ONLINE</span>
            </div>

            {/* Operational Commander Profile */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full ring-2 ring-cyan-500/40 p-0.5 overflow-hidden bg-slate-800 flex items-center justify-center">
                  <span className="text-cyan-300 font-telemetry text-xs font-bold">CR</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-100 leading-tight">Cmdr. Elena Rostova</span>
                  <span className="font-telemetry text-[9px] text-[#00daf3] leading-tight">Dir. Met. Command</span>
                </div>
              </div>
              <button className="text-cyan-300 hover:text-white p-1 transition-colors drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]" title="Operational Lock State" type="button">
                <Lock className="w-3.5 h-3.5 text-cyan-300" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-beacon" title="FastAPI Online"></span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
