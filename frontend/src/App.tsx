import React, { useEffect } from 'react';
import { useCycloneStore } from './store/cycloneStore';
import { TopStatusBar } from './components/Dashboard/TopStatusBar';
import { Sidebar } from './components/Navigation/Sidebar';
import { AIAnalysisModal } from './components/AI/AIAnalysisModal';

import { Dashboard } from './pages/Dashboard';
import { Cyclones } from './pages/Cyclones';
import { CycloneDetails } from './pages/CycloneDetails';
import { Analysis } from './pages/Analysis';
import { LandfallAnalysis } from './pages/LandfallAnalysis';
import { Infrastructure } from './pages/Infrastructure';
import { Population } from './pages/Population';
import { Emergency } from './pages/Emergency';
import { SatellitePage } from './pages/Satellite';
import { AIIntelligence } from './pages/AIIntelligence';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

export const App: React.FC = () => {
  const { fetchInitialData, activeTab, refreshAllData } = useCycloneStore();

  useEffect(() => {
    // 1. Initial data loading sequence (Phase 6: Health check, then active cyclone detection)
    fetchInitialData();

    // 2. Data refresh interval (Phase 26: 15-minute background polling)
    const intervalMinutes = 15;
    const intervalMs = intervalMinutes * 60 * 1000;
    const pollTimer = setInterval(() => {
      console.log('[CycloneShield AI] Executing periodic 15-minute data refresh...');
      refreshAllData();
    }, intervalMs);

    return () => clearInterval(pollTimer);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-command-bg text-slate-100 overflow-hidden font-sans">
      {/* 1. Persistent Navigation Sidebar (Phase 5) */}
      <Sidebar />

      {/* 2. Main Application Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Tactical Command Bar */}
        <TopStatusBar />

        {/* Dynamic Multi-Page Operational Canvas (Phase 4: 12 Modules) */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'cyclones' && <Cyclones />}
          {activeTab === 'cyclone-details' && <CycloneDetails />}
          {activeTab === 'analysis' && <Analysis />}
          {activeTab === 'landfall' && <LandfallAnalysis />}
          {activeTab === 'infrastructure' && <Infrastructure />}
          {activeTab === 'population' && <Population />}
          {activeTab === 'satellite' && <SatellitePage />}
          {activeTab === 'emergency' && <Emergency />}
          {activeTab === 'ai' && <AIIntelligence />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* 3. Global AI Analysis Dialog */}
      <AIAnalysisModal />
    </div>
  );
};

export default App;
