import React from 'react';
import { useCycloneStore, TabType } from '../../store/cycloneStore';

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: 'cyan' | 'crimson' | 'amber' | 'emerald' | 'neutral';
}

interface NavSection {
  title: string;
  items: NavItem[];
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
  const severityScore = riskAssessment?.overall_cyclone_risk_score 
    ? Math.round(riskAssessment.overall_cyclone_risk_score) 
    : 88;

  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' }
      ]
    },
    {
      title: 'CYCLONE INTELLIGENCE',
      items: [
        { 
          id: 'cyclones', 
          label: 'Active Cyclones', 
          icon: 'cyclone', 
          badge: `${activeCyclones.length || 3} ACTIVE`,
          badgeColor: 'cyan'
        },
        { 
          id: 'cyclone-details', 
          label: 'Cyclone Details', 
          icon: 'my_location', 
          badge: selectedCyclone ? (selectedCyclone.name.startsWith('Cyclone') ? selectedCyclone.name.replace('Cyclone ', 'TC-') : `TC-${selectedCyclone.name}`) : 'TC-HELEN',
          badgeColor: 'crimson'
        }
      ]
    },
    {
      title: 'RISK INTELLIGENCE',
      items: [
        { 
          id: 'analysis', 
          label: 'Risk Analysis', 
          icon: 'gshield', 
          badge: `CRITICAL ${severityScore}`,
          badgeColor: 'crimson'
        },
        { 
          id: 'landfall', 
          label: 'Landfall Analysis', 
          icon: 'adjust', 
          badge: 'T-14h',
          badgeColor: 'amber'
        },
        { 
          id: 'infrastructure', 
          label: 'Infrastructure', 
          icon: 'domain', 
          badge: '142 ASSETS',
          badgeColor: 'neutral'
        },
        { 
          id: 'population', 
          label: 'Population Exposure', 
          icon: 'groups', 
          badge: '1.4M',
          badgeColor: 'cyan'
        }
      ]
    },
    {
      title: 'SATELLITE & AI',
      items: [
        { 
          id: 'satellite', 
          label: 'Satellite Intelligence', 
          icon: 'satellite_alt', 
          badge: 'INSAT-3D',
          badgeColor: 'emerald'
        },
        { 
          id: 'ai', 
          label: 'AI Intelligence', 
          icon: 'auto_awesome', 
          badge: 'FASTAPI',
          badgeColor: 'cyan'
        }
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { 
          id: 'emergency', 
          label: 'Emergency Priorities', 
          icon: 'notification_important', 
          badge: '7 URGENT',
          badgeColor: 'crimson'
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: 'description', 
          badge: 'PDF/JSON',
          badgeColor: 'neutral'
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: 'tune' }
      ]
    }
  ];

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'crimson':
        return 'bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold';
      case 'amber':
        return 'bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold';
      case 'emerald':
        return 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold';
      case 'cyan':
        return 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold';
      default:
        return 'bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant font-medium';
    }
  };

  return (
    <aside 
      className={`relative h-full shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-r border-outline-variant/30 z-40 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.6)] transition-all duration-200 ${
        isSidebarCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
        {/* Brand Header */}
        <div className="p-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="flex items-center gap-space-md overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-primary-container flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)] shrink-0">
              <span className="material-symbols-outlined text-[20px] text-surface-container-lowest font-bold">shield</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-sm uppercase tracking-wider text-primary font-bold truncate">
                  CYCLONESHIELD AI
                </span>
                <span className="font-data-label text-[10px] text-primary-fixed-dim uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Predict Path • Protect Assets
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary-container/50 hover:bg-surface-container transition-all shrink-0" 
            title={isSidebarCollapsed ? "Expand Tactical Dock" : "Collapse Tactical Dock"} 
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSidebarCollapsed ? 'dock_to_right' : 'dock_to_left'}
            </span>
          </button>
        </div>

        {/* Navigation Stream */}
        <nav className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-md">
          {sections.map((section) => (
            <div key={section.title} className="space-y-space-2xs">
              {!isSidebarCollapsed && (
                <div className="px-space-sm py-space-2xs font-data-label text-data-label text-outline uppercase tracking-wider text-[10px]">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-surface-container-high to-surface-container text-primary font-semibold shadow-[inset_3px_0_0_0_#00e5ff] border-l border-primary-container/60'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${
                        isActive ? 'text-primary-container filter drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]' : 'group-hover:text-primary'
                      }`}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <span className={`font-body-md text-body-md truncate ${
                          isActive ? 'text-primary font-semibold' : ''
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isSidebarCollapsed && item.badge && (
                      <span className={`font-badge text-badge px-space-xs py-space-2xs rounded shrink-0 ${getBadgeStyle(item.badgeColor)}`}>
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

      {/* Dock Bottom: Live Mode & Commander Profile */}
      <div className="p-space-md bg-surface-container-low/90 backdrop-blur-md flex flex-col gap-space-xs border-t border-outline-variant/30 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-space-xs bg-surface-container-lowest p-space-2xs rounded-lg border border-outline-variant/30">
            <button className="flex-1 flex items-center justify-center gap-space-xs py-space-2xs px-space-xs rounded bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-badge text-badge uppercase font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]" type="button">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-beacon"></span>
              LIVE MODE
            </button>
            <button className="flex-1 flex items-center justify-center gap-space-xs py-space-2xs px-space-xs rounded text-outline hover:text-on-surface transition-colors font-badge text-badge uppercase" type="button">
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
              SIMULATION
            </button>
          </div>
        )}
        
        <div className={`flex items-center justify-between text-outline font-data-label text-[10px] ${isSidebarCollapsed ? 'justify-center' : 'px-space-xs py-space-2xs'}`}>
          <span className="flex items-center gap-space-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
            {!isSidebarCollapsed && <span className="text-on-surface-variant font-semibold">FASTAPI CORE</span>}
          </span>
          {!isSidebarCollapsed && (
            <span className="font-data-value text-data-label text-emerald-400 font-bold">
              {healthStatus?.status === 'ok' ? '18ms • ONLINE' : 'CONNECTED'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/20">
          <div className="flex items-center gap-space-sm overflow-hidden">
            <div className="relative w-8 h-8 rounded-full ring-2 ring-primary-container/70 overflow-hidden shadow-[0_0_10px_rgba(0,229,255,0.4)] shrink-0 bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">account_circle</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight truncate">
                  Cmdr. Elena Rostova
                </span>
                <span className="font-data-label text-[10px] text-primary leading-tight font-medium">
                  Dir. Met. Command
                </span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button className="text-outline hover:text-primary p-space-2xs transition-colors shrink-0" title="Operational Lock State" type="button">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
