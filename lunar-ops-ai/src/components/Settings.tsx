import React from 'react';
import { Sliders, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

interface SettingsProps {
  slopeThreshold: number;
  setSlopeThreshold: React.Dispatch<React.SetStateAction<number>>;
  confidenceLevel: number;
  setConfidenceLevel: React.Dispatch<React.SetStateAction<number>>;
}

export default function Settings({
  slopeThreshold,
  setSlopeThreshold,
  confidenceLevel,
  setConfidenceLevel
}: SettingsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none font-mono" id="settings-panel">
      <div className="border-b border-panel-border/40 pb-3">
        <h3 className="text-sm font-mono font-bold text-white tracking-wider">SYSTEM SETTINGS &amp; CALIBRATION</h3>
        <p className="text-[10px] text-slate-500 mt-1">Calibrate AI detector threshold settings and landing hazard cutoffs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slope Threshold */}
        <div className="bg-slate-900/60 border border-panel-border rounded-lg p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-panel-border/30 pb-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyber-cyan" />
              SLOPE THRESHOLD LIMIT
            </h4>
            <span className="text-xs text-cyber-cyan font-bold bg-slate-950 px-2 py-0.5 border border-panel-border rounded">
              {slopeThreshold}°
            </span>
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min="5"
              max="35"
              value={slopeThreshold}
              onChange={(e) => setSlopeThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-cyber-cyan"
              id="settings-slider-slope"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>MIN: 5°</span>
              <span className="text-slate-400">CRITICAL ANGLE FOR TIP-OVER</span>
              <span>MAX: 35°</span>
            </div>
          </div>
        </div>

        {/* Detection Confidence */}
        <div className="bg-slate-900/60 border border-panel-border rounded-lg p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-panel-border/30 pb-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyber-cyan" />
              YOLO DETECTION CONFIDENCE
            </h4>
            <span className="text-xs text-cyber-cyan font-bold bg-slate-950 px-2 py-0.5 border border-panel-border rounded">
              {confidenceLevel}%
            </span>
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min="50"
              max="100"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-cyber-cyan"
              id="settings-slider-confidence"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>50% (SENSITIVE)</span>
              <span className="text-slate-400">DEFAULT: 95%</span>
              <span>100% (STRICT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
