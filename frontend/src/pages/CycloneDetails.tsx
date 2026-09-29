import React from 'react';
import { 
  Wind, 
  Gauge, 
  Compass, 
  Activity, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { useCycloneStore } from '../store/cycloneStore';
import { aiApi } from '../services/aiApi';

export const CycloneDetails: React.FC = () => {
  const { 
    cycloneDetail, 
    selectedCycloneId, 
    riskAssessment, 
    setActiveTab, 
    openAiModal, 
    setIsAiLoading 
  } = useCycloneStore();

  if (!cycloneDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 font-mono text-center">
        <div className="text-slate-400 text-sm">No cyclone details loaded.</div>
        <button
          onClick={() => setActiveTab('cyclones')}
          className="px-3.5 py-1.5 rounded bg-cyan-600 text-white text-xs font-semibold"
        >
          SELECT CYCLONE
        </button>
      </div>
    );
  }

  // Combined track points for timeline charts
  const combinedPoints = [
    ...(cycloneDetail.observed_track || []).map(p => ({
      time: p.timestamp.split(' ')[1] || p.timestamp,
      fullTime: p.timestamp,
      wind: p.wind_speed,
      pressure: p.pressure,
      type: 'Observed',
      category: p.category,
      coords: `${p.latitude}°N, ${p.longitude}°E`
    })),
    ...(cycloneDetail.forecast_track || []).map(p => ({
      time: p.timestamp.split(' ')[1] || p.timestamp,
      fullTime: p.timestamp,
      wind: p.wind_speed,
      pressure: p.pressure,
      type: 'Forecast',
      category: p.category,
      coords: `${p.latitude}°N, ${p.longitude}°E`
    }))
  ];

  const handleExplain = async () => {
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainLandfall(selectedCycloneId);
      openAiModal(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-command-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cyclones')}
              className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-800"
              title="Back to Active Cyclones"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
              <span>{cycloneDetail.name}</span>
              <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                {cycloneDetail.category}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive synoptic dossier, observed trajectory telemetry, intensity curves, and forecast uncertainty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>VIEW ON GIS MAP</span>
          </button>

          <button
            onClick={handleExplain}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI RISK BRIEFING</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400 text-[10px]">CURRENT POSITION</span>
          <div className="text-white font-bold text-sm mt-1">{cycloneDetail.current_latitude}°N</div>
          <div className="text-slate-400 text-[11px]">{cycloneDetail.current_longitude}°E</div>
        </div>

        <div className="bg-command-card border border-amber-900/40 rounded-lg p-3">
          <span className="text-amber-400 text-[10px]">SUSTAINED WIND</span>
          <div className="text-amber-300 font-bold text-lg mt-1">{cycloneDetail.wind_speed} <span className="text-xs font-normal">km/h</span></div>
          <div className="text-slate-400 text-[10px]">Category {cycloneDetail.category.split(' ')[0]}</div>
        </div>

        <div className="bg-command-card border border-sky-900/40 rounded-lg p-3">
          <span className="text-sky-400 text-[10px]">CENTRAL PRESSURE</span>
          <div className="text-sky-300 font-bold text-lg mt-1">{cycloneDetail.central_pressure} <span className="text-xs font-normal">hPa</span></div>
          <div className="text-slate-400 text-[10px]">Deep depression</div>
        </div>

        <div className="bg-command-card border border-command-border rounded-lg p-3">
          <span className="text-slate-400 text-[10px]">MOVEMENT</span>
          <div className="text-cyan-300 font-bold text-sm mt-1">{cycloneDetail.movement_direction}</div>
          <div className="text-slate-300 text-[11px]">@ {cycloneDetail.movement_speed} km/h</div>
        </div>

        <div className="bg-command-card border border-red-900/40 rounded-lg p-3 col-span-2">
          <span className="text-red-400 text-[10px]">PREDICTED LANDFALL</span>
          <div className="text-white font-bold text-sm mt-1 truncate">
            {cycloneDetail.landfall ? cycloneDetail.landfall.location_name : 'Tracking over Bay'}
          </div>
          <div className="text-rose-400 text-[11px]">
            {cycloneDetail.landfall ? `${cycloneDetail.landfall.estimated_time} (${cycloneDetail.landfall.district})` : 'Under observation'}
          </div>
        </div>
      </div>

      {/* Intensity Curves: Wind & Pressure Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wind Speed Evolution */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Wind className="w-4 h-4 text-amber-400" />
              <span>WIND SPEED TRAJECTORY (KM/H)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Observed → Forecast</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedPoints}>
                <defs>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" />
                <YAxis stroke="#64748b" unit=" km/h" domain={[0, 160]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="wind" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#windGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Peak winds modeled at landfall (~130 km/h) before gradual inland frictional dissipation.
          </div>
        </div>

        {/* Central Barometric Pressure Evolution */}
        <div className="bg-command-card border border-command-border rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>CENTRAL PRESSURE PROFILE (HPA)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Atmospheric Deepening</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" />
                <YAxis stroke="#64748b" unit=" hPa" domain={[960, 1010]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="pressure" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Minimum central pressure corresponds with maximum eyewall intensity and storm surge generation.
          </div>
        </div>
      </div>

      {/* Uncertainty Cone & Landfall Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Forecast Cone Specification */}
        <div className="bg-command-card border border-command-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              FORECAST UNCERTAINTY CONE MODEL
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {cycloneDetail.forecast_cone ? cycloneDetail.forecast_cone.label : 'GEOMETRIC ENVELOPE'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The spatial uncertainty cone represents the 67% probability envelope of cyclone center location expanding with lead time:
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">T+12H LEAD</div>
              <div className="text-cyan-300 font-bold">± 68.6 km</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">T+24H LEAD</div>
              <div className="text-cyan-300 font-bold">± 102.2 km</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">T+48H LEAD</div>
              <div className="text-cyan-300 font-bold">± 169.4 km</div>
            </div>
          </div>
        </div>

        {/* Landfall Impact Assessment */}
        <div className="bg-command-card border border-command-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              LANDFALL IMPACT FORECAST
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              {cycloneDetail.landfall ? cycloneDetail.landfall.risk_category : 'CRITICAL'}
            </span>
          </div>

          {cycloneDetail.landfall ? (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Target Coastal Sector:</span>
                <span className="text-white font-bold">{cycloneDetail.landfall.location_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Estimated Landfall Time:</span>
                <span className="text-cyan-300 font-bold">{cycloneDetail.landfall.estimated_time}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Expected Landfall Wind:</span>
                <span className="text-amber-400 font-bold">{cycloneDetail.landfall.expected_wind_speed} km/h</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Estimated Storm Surge:</span>
                <span className="text-sky-300 font-bold">{cycloneDetail.landfall.expected_storm_surge_m} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Population in Danger Zone:</span>
                <span className="text-rose-400 font-bold">{cycloneDetail.landfall.population_exposed.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Landfall modeling active.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CycloneDetails;
