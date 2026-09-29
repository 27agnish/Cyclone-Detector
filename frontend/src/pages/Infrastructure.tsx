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
  Layers,
  MapPin,
  Building2,
  ShieldAlert
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

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital': return <Hospital className="w-5 h-5 text-rose-400" />;
      case 'power': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'bridge':
      case 'transport': return <Landmark className="w-5 h-5 text-cyan-400" />;
      case 'shelter': return <Home className="w-5 h-5 text-emerald-400" />;
      default: return <Building2 className="w-5 h-5 text-[#00e5ff]" />;
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full bg-[#070d18] text-[#dee2f1] select-none font-telemetry">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-white flex items-center gap-2.5">
            <Hospital className="w-6 h-6 text-[#00e5ff]" />
            <span>LIFELINE INFRASTRUCTURE VULNERABILITY DOSSIER</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Spatial vulnerability auditing of critical health, power, transport, and flood mitigation assets.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search asset, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f1a30] border border-[#1e293b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-48 sm:w-64"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0f1a30] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">ALL LIFELINE TYPES</option>
            <option value="hospital">HOSPITALS & HEALTHCARE</option>
            <option value="power">POWER & ENERGY</option>
            <option value="bridge">TRANSPORT & BRIDGES</option>
            <option value="shelter">CYCLONE SHELTERS</option>
          </select>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0d1527] border border-[#1e293b] rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Monitored Assets</div>
            <div className="font-headline text-xl font-bold text-white mt-0.5">{assets.length}</div>
          </div>
          <Building2 className="w-6 h-6 text-[#00e5ff] opacity-80" />
        </div>

        <div className="bg-[#0d1527] border border-rose-500/40 rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-rose-400 uppercase font-bold">Critical Vulnerability</div>
            <div className="font-headline text-xl font-bold text-rose-400 mt-0.5">
              {assets.filter(a => a.risk_category === 'CRITICAL').length}
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400 alert-beacon" />
        </div>

        <div className="bg-[#0d1527] border border-amber-500/40 rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-bold">High Risk</div>
            <div className="font-headline text-xl font-bold text-amber-400 mt-0.5">
              {assets.filter(a => a.risk_category === 'HIGH').length}
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>

        <div className="bg-[#0d1527] border border-cyan-500/40 rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-cyan-400 uppercase font-bold">Moderate / Low</div>
            <div className="font-headline text-xl font-bold text-cyan-300 mt-0.5">
              {assets.filter(a => a.risk_category === 'MODERATE' || a.risk_category === 'LOW').length}
            </div>
          </div>
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => {
          const isCritical = asset.risk_category === 'CRITICAL';
          const isHigh = asset.risk_category === 'HIGH';

          return (
            <div
              key={asset.id}
              className={`bg-[#0d1527] border rounded-xl p-4 shadow-xl flex flex-col justify-between transition group ${
                isCritical ? 'border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(255,51,102,0.2)]' :
                isHigh ? 'border-amber-500/40 hover:border-amber-400' :
                'border-[#1e293b] hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#0f1a30] border border-[#1e293b]">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <h4 className="font-headline text-sm font-bold text-white group-hover:text-cyan-200 transition-colors leading-tight">
                        {asset.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase">{asset.type} • {asset.district}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm ${
                    isCritical ? 'bg-rose-950/90 text-rose-300 border border-rose-500 alert-beacon' :
                    isHigh ? 'bg-amber-950/90 text-amber-300 border border-amber-500' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-500'
                  }`}>
                    {asset.risk_category} ({asset.risk_score})
                  </span>
                </div>

                <div className="bg-[#0f1a30] p-2.5 rounded-lg border border-[#1e293b] space-y-1 text-xs mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Track Distance:</span>
                    <strong className="text-cyan-300">{asset.distance_from_track_km} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Landfall Distance:</span>
                    <strong className="text-rose-400">{asset.distance_from_landfall_km} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wind Exposure:</span>
                    <strong className="text-amber-400">{asset.wind_exposure_kmh} km/h</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation:</span>
                    <strong className="text-slate-200">{asset.elevation_m}m</strong>
                  </div>
                </div>

                {/* Vulnerability factors */}
                <div className="mt-2.5 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Identified Vulnerabilities:</div>
                  <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5 font-sans">
                    {asset.risk_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 mt-2 border-t border-[#1e293b]">
                <button
                  onClick={() => handleViewOnMap(asset)}
                  className="flex-1 py-1.5 rounded-lg bg-[#0f1a30] hover:bg-[#13223f] border border-[#1e293b] text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>ON MAP</span>
                </button>

                <button
                  onClick={() => handleExplainAsset(asset)}
                  className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-[#00e5ff] text-[#070d18] text-xs font-headline font-bold shadow-sm transition flex items-center justify-center gap-1.5 hover:opacity-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI EXPLAIN</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Infrastructure;
