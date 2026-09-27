import React, { useState } from 'react';
import { 
  Hospital, 
  Zap, 
  Landmark, 
  Home, 
  Waves, 
  Radio, 
  Search, 
  Filter, 
  Sparkles, 
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { useCycloneStore } from '../store/cycloneStore';
import { InfrastructureAsset } from '../types/cyclone';
import { aiApi } from '../services/aiApi';

export const Infrastructure: React.FC = () => {
  const { infrastructure, selectedCycloneId, openAiModal, setIsAiLoading, setSelectedAsset, setActiveTab } = useCycloneStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assets = infrastructure?.assets || [];

  const filteredAssets = assets.filter((a) => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExplainAsset = async (asset: InfrastructureAsset) => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainRisk(selectedCycloneId, asset.id);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleViewOnMap = (asset: InfrastructureAsset) => {
    setSelectedAsset(asset);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2.5">
            <Hospital className="w-5 h-5 text-cyan-400" />
            <span>LIFELINE INFRASTRUCTURE VULNERABILITY DOSSIER</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Spatial vulnerability auditing of critical health, power, transport, and flood mitigation assets.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search asset or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-mono text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Lifeline Types</option>
            <option value="hospital">Hospitals</option>
            <option value="power">Power Substation</option>
            <option value="bridge">Bridges & Highways</option>
            <option value="shelter">Cyclone Shelters</option>
            <option value="water">Water Facilities</option>
            <option value="communication">Radar & Telecom</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400">TOTAL MONITORED</span>
          <div className="text-lg font-bold text-white mt-1">{infrastructure?.total_assets_monitored || 20} Assets</div>
        </div>
        <div className="bg-command-card border border-red-900/40 rounded-lg p-3">
          <span className="text-red-400">CRITICAL THREAT</span>
          <div className="text-lg font-bold text-red-400 mt-1">{infrastructure?.critical_assets || 4} Assets</div>
        </div>
        <div className="bg-command-card border border-orange-900/40 rounded-lg p-3">
          <span className="text-orange-400">HIGH RISK</span>
          <div className="text-lg font-bold text-orange-400 mt-1">{infrastructure?.high_risk_assets || 8} Assets</div>
        </div>
        <div className="bg-command-card border border-yellow-900/40 rounded-lg p-3">
          <span className="text-yellow-400">MODERATE EXPOSURE</span>
          <div className="text-lg font-bold text-yellow-400 mt-1">{infrastructure?.moderate_risk_assets || 8} Assets</div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-command-card border border-command-border rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 border-b border-command-border">
              <tr>
                <th className="p-3">ASSET NAME</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">DISTRICT</th>
                <th className="p-3">DIST TO TRACK</th>
                <th className="p-3">DIST TO LANDFALL</th>
                <th className="p-3">WIND EXPOSURE</th>
                <th className="p-3">RISK SCORE</th>
                <th className="p-3">PROTOTYPE ACTION</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAssets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-white">
                    {a.name}
                    <div className="text-[10px] text-slate-500 font-normal">Elev: {a.elevation_m}m | Backup: {a.backup_power ? 'Yes' : 'No'}</div>
                  </td>
                  <td className="p-3 text-slate-300 capitalize">{a.type}</td>
                  <td className="p-3 text-slate-300">{a.district}</td>
                  <td className="p-3 text-cyan-400 font-semibold">{a.distance_from_track_km} km</td>
                  <td className="p-3 text-rose-400 font-semibold">{a.distance_from_landfall_km} km</td>
                  <td className="p-3 text-amber-400 font-semibold">{a.wind_exposure_kmh} km/h</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.risk_category === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                      a.risk_category === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      'bg-yellow-950 text-yellow-300 border border-yellow-800'
                    }`}>
                      {a.risk_category} ({a.risk_score})
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate" title={a.prototype_action}>
                    {a.prototype_action}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleViewOnMap(a)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-[10px]"
                    >
                      Map
                    </button>
                    <button
                      onClick={() => handleExplainAsset(a)}
                      className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Explain
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
