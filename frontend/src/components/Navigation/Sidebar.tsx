import React from 'react';
import { useCycloneStore, TabType } from '../../store/cycloneStore';
import groupIcon from '../../assets/cyclone-shield-group-icon.png';

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
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
    healthStatus
  } = useCycloneStore();

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
        { id: 'cyclones', label: 'Active Cyclones', icon: 'cyclone' },
        { id: 'cyclone-details', label: 'Cyclone Details', icon: 'my_location' }
      ]
    },
    {
      title: 'RISK INTELLIGENCE',
      items: [
        { id: 'analysis', label: 'Risk Analysis', icon: 'gshield' },
        { id: 'landfall', label: 'Landfall Analysis', icon: 'adjust' },
        { id: 'infrastructure', label: 'Infrastructure', icon: 'domain' },
        { id: 'population', label: 'Population Exposure', icon: 'groups' }
      ]
    },
    {
      title: 'SATELLITE & AI',
      items: [
        { id: 'satellite', label: 'Satellite Intelligence', icon: 'satellite_alt' },
        { id: 'ai', label: 'AI Intelligence', icon: 'auto_awesome' }
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { id: 'emergency', label: 'Emergency Priorities', icon: 'notification_important' },
        { id: 'reports', label: 'Reports', icon: 'description' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: 'tune' }
      ]
    }
  ];

  return (
    <aside 
      className={`relative h-full shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-r border-outline-variant/30 z-40 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.6)] transition-all duration-200 ${
        isSidebarCollapsed ? 'w-16 sm:w-20' : 'w-16 md:w-64 xl:w-80'
      }`}
    >
      <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
        {/* Brand Header */}
        <div className="p-3 md:p-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="flex items-center gap-space-md overflow-hidden">
            <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center">
              <img 
                src={groupIcon} 
                alt="CycloneShield AI Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" 
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="hidden md:flex flex-col min-w-0">
                <span className="font-headline-sm text-sm uppercase tracking-wider text-primary font-bold truncate">
                  CYCLONESHIELD AI
                </span>
                <span className="font-data-label text-[10px] text-primary-fixed-dim uppercase tracking-widest flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  Predict Path • Protect Assets
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary-container/50 hover:bg-surface-container transition-all shrink-0" 
            title={isSidebarCollapsed ? "Expand Tactical Dock" : "Collapse Tactical Dock"} 
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSidebarCollapsed ? 'dock_to_right' : 'dock_to_left'}
            </span>
          </button>
        </div>

        {/* Navigation Stream */}
        <nav className="flex-1 overflow-y-auto px-2 md:px-space-md py-space-sm space-y-space-md">
          {sections.map((section) => (
            <div key={section.title} className="space-y-space-2xs">
              {!isSidebarCollapsed && (
                <div className="hidden md:block px-space-sm py-space-2xs font-data-label text-data-label text-outline uppercase tracking-wider text-[10px]">
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
                    className={`w-full flex items-center justify-center md:justify-start px-2 md:px-space-sm py-space-xs rounded-lg transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-surface-container-high to-surface-container text-primary font-semibold shadow-[inset_3px_0_0_0_#00e5ff] border-l border-primary-container/60'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                    }`}
                    title={item.label}
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${
                        isActive ? 'text-primary-container filter drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]' : 'group-hover:text-primary'
                      }`}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <span className={`hidden md:inline font-body-md text-body-md truncate ${
                          isActive ? 'text-primary font-semibold' : ''
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Dock Bottom: Live Mode & Commander Profile */}
      <div className="p-2 md:p-space-md bg-surface-container-low/90 backdrop-blur-md flex flex-col gap-space-xs border-t border-outline-variant/30 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
        <div className="flex items-center bg-surface-container-lowest p-space-2xs rounded-lg border border-outline-variant/30">
          <div 
            className="w-full flex items-center justify-center gap-space-xs py-space-2xs px-space-xs rounded bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-badge text-badge uppercase font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)] select-none"
            title="SYSTEM OPERATIONAL: LIVE MODE"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-beacon"></span>
            {!isSidebarCollapsed && <span>LIVE MODE</span>}
          </div>
        </div>
        
        <div className={`flex items-center justify-center md:justify-between text-outline font-data-label text-[10px] ${isSidebarCollapsed ? 'justify-center' : 'px-space-xs py-space-2xs'}`}>
          <span className="flex items-center gap-space-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
            {!isSidebarCollapsed && <span className="hidden md:inline text-on-surface-variant font-semibold">FASTAPI CORE</span>}
          </span>
          {!isSidebarCollapsed && (
            <span className="hidden xl:inline font-data-value text-data-label text-emerald-400 font-bold">
              {healthStatus?.status === 'ok' ? '18ms • ONLINE' : 'CONNECTED'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center md:justify-between pt-space-xs border-t border-outline-variant/20">
          <div className="flex items-center gap-space-sm overflow-hidden">
            <div className="relative w-8 h-8 rounded-full ring-2 ring-primary-container/70 overflow-hidden shadow-[0_0_10px_rgba(0,229,255,0.4)] shrink-0 bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">account_circle</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="hidden md:flex flex-col truncate">
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
            <button className="hidden md:inline-flex text-outline hover:text-primary p-space-2xs transition-colors shrink-0" title="Operational Lock State" type="button">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
