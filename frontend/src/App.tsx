import React, { useEffect } from 'react';
import { useCycloneStore } from './store/cycloneStore';
import { TopStatusBar } from './components/Dashboard/TopStatusBar';
import { Navbar } from './components/Navbar';
import { AIAnalysisModal } from './components/AI/AIAnalysisModal';

import { Dashboard } from './pages/Dashboard';
import { Cyclones } from './pages/Cyclones';
import { Analysis } from './pages/Analysis';
import { Infrastructure } from './pages/Infrastructure';
import { Population } from './pages/Population';
import { Emergency } from './pages/Emergency';
import { SatellitePage } from './pages/Satellite';
import { Reports } from './pages/Reports';

export const App: React.FC = () => {
  const { fetchInitialData, activeTab } = useCycloneStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-command-bg text-slate-100 overflow-hidden font-sans">
      {/* 1. Global Tactical Command Bar */}
      <TopStatusBar />

      {/* 2. Operational Navigation Bar */}
      <Navbar />

      {/* 3. Main Operational View Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'cyclones' && <Cyclones />}
        {activeTab === 'analysis' && <Analysis />}
        {activeTab === 'infrastructure' && <Infrastructure />}
        {activeTab === 'population' && <Population />}
        {activeTab === 'emergency' && <Emergency />}
        {activeTab === 'satellite' && <SatellitePage />}
        {activeTab === 'reports' && <Reports />}
      </main>

      {/* 4. Global AI Modal */}
      <AIAnalysisModal />
    </div>
  );
};

export default App;
