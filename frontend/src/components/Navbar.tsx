import React from 'react';
import { 
  LayoutDashboard, 
  Wind, 
  Layers, 
  Hospital, 
  Users, 
  AlertOctagon, 
  Satellite, 
  FileText 
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useCycloneStore();

  const navItems = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'cyclones', label: 'Cyclone Detector', icon: Wind },
    { id: 'analysis', label: 'GIS & Hazard Risk', icon: Layers },
    { id: 'infrastructure', label: 'Infrastructure', icon: Hospital },
    { id: 'population', label: 'Population Exposure', icon: Users },
    { id: 'emergency', label: 'Emergency Priorities', icon: AlertOctagon },
    { id: 'satellite', label: 'Satellite & SAR', icon: Satellite },
    { id: 'reports', label: 'Briefing Reports', icon: FileText },
  ] as const;

  return (
    <nav className="w-full bg-command-card/90 border-b border-command-border px-4 py-1.5 flex items-center gap-1 overflow-x-auto select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition whitespace-nowrap ${
              isActive
                ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
