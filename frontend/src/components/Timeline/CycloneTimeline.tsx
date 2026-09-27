import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Wind, Compass, Gauge, AlertCircle } from 'lucide-react';
import { useCycloneStore } from '../../store/cycloneStore';

export const CycloneTimeline: React.FC = () => {
  const {
    cycloneDetail,
    timelineStepIndex,
    currentFramePoint,
    isPlaying,
    playbackSpeed,
    setIsPlaying,
    setTimelineStep
  } = useCycloneStore();

  const allPoints = cycloneDetail 
    ? [...cycloneDetail.observed_track, ...cycloneDetail.forecast_track]
    : [];

  // Playback timer loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && allPoints.length > 0) {
      interval = setInterval(() => {
        const nextIndex = (timelineStepIndex + 1) % allPoints.length;
        setTimelineStep(nextIndex);
      }, playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timelineStepIndex, allPoints.length, playbackSpeed]);

  if (!cycloneDetail || allPoints.length === 0) return null;

  const currentPt = currentFramePoint || allPoints[timelineStepIndex] || allPoints[0];
  const isLandfallPoint = currentPt.category.toLowerCase().includes('landfall');

  return (
    <div className="w-full bg-command-surface/95 backdrop-blur-md border border-command-border rounded-lg shadow-xl p-3.5 space-y-3">
      {/* Top Status & Metrics bar for currently scrubbed step */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-command-border pb-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              currentPt.track_type === 'OBSERVED' ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500 animate-pulse'
            }`} />
            <span className="font-mono font-bold text-slate-200">
              {currentPt.track_type === 'OBSERVED' ? 'OBSERVED TIMELINE' : 'PROJECTED FORECAST TIMELINE'}
            </span>
          </div>

          <span className="text-slate-400">|</span>

          <div className="font-mono text-cyan-300 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {currentPt.timestamp || 'T+00H'}
          </div>

          {isLandfallPoint && (
            <span className="bg-red-950 border border-red-700 text-red-300 px-2 py-0.5 rounded font-mono font-bold animate-pulse text-[11px]">
              ◆ ESTIMATED LANDFALL WINDOW
            </span>
          )}
        </div>

        {/* Dynamic telemetry for scrubbed point */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Wind className="w-3.5 h-3.5" />
            <span>Wind: <strong className="text-white">{currentPt.wind_speed} km/h</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <Gauge className="w-3.5 h-3.5" />
            <span>Pres: <strong className="text-white">{currentPt.pressure} hPa</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Move: <strong className="text-white">{currentPt.movement_direction} @ {currentPt.movement_speed} km/h</strong></span>
          </div>
          <div className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
            Cat: <span className="text-yellow-300 font-semibold">{currentPt.category}</span>
          </div>
        </div>
      </div>

      {/* Main Track Timeline Slider & Stepper */}
      <div className="space-y-2">
        {/* Interactive scrubber */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={allPoints.length - 1}
            value={timelineStepIndex}
            onChange={(e) => setTimelineStep(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Milestone Tick Labels: NOW -- 24H -- 12H -- 6H -- LANDFALL -- POST-LANDFALL */}
        <div className="relative w-full flex justify-between text-[11px] font-mono text-slate-400 px-1 select-none">
          {allPoints.map((pt, idx) => {
            const isSelected = idx === timelineStepIndex;
            const isObs = pt.track_type === 'OBSERVED';
            const isLandfall = pt.category.toLowerCase().includes('landfall');

            let label = pt.timestamp.split(' ')[1] || `T+${idx * 6}h`;
            if (idx === 0) label = 'PAST-30H';
            else if (idx === cycloneDetail.observed_track.length - 1) label = 'NOW (CURRENT)';
            else if (isLandfall) label = 'LANDFALL';

            return (
              <button
                key={idx}
                onClick={() => setTimelineStep(idx)}
                className={`flex flex-col items-center group transition ${
                  isSelected ? 'text-cyan-400 font-bold' : 'hover:text-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mb-1 transition ${
                  isSelected 
                    ? 'bg-cyan-400 scale-125 ring-2 ring-cyan-500/50' 
                    : isLandfall 
                      ? 'bg-rose-500 ring-2 ring-rose-500/50' 
                      : isObs 
                        ? 'bg-slate-600 group-hover:bg-slate-400' 
                        : 'bg-rose-700 group-hover:bg-rose-500'
                }`} />
                <span className={`text-[10px] whitespace-nowrap ${isLandfall ? 'text-rose-400 font-bold' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>PLAY TRACK</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setTimelineStep(0);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={() => {
              // Jump directly to current position
              const nowIdx = cycloneDetail.observed_track.length - 1;
              setTimelineStep(Math.max(0, nowIdx));
            }}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs transition border border-slate-700"
          >
            JUMP TO CURRENT
          </button>

          <button
            onClick={() => {
              // Jump directly to predicted landfall point
              const lfIdx = allPoints.findIndex(p => p.category.toLowerCase().includes('landfall'));
              if (lfIdx !== -1) setTimelineStep(lfIdx);
            }}
            className="px-2.5 py-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 font-mono text-xs transition border border-rose-800"
          >
            JUMP TO LANDFALL
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Timeline synchronized with map & risk engines</span>
        </div>
      </div>
    </div>
  );
};
