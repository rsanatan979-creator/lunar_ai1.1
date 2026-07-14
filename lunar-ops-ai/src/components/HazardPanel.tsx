import React, { useState } from 'react';
import { Eye, EyeOff, Layers, Info, Check, ShieldAlert } from 'lucide-react';

interface HazardPanelProps {
  apiData: any;
  layers: {
    terrain: boolean;
    grid: boolean;
    detections: boolean;
    safeZone: boolean;
  };
  setLayers: React.Dispatch<React.SetStateAction<{
    terrain: boolean;
    grid: boolean;
    detections: boolean;
    safeZone: boolean;
  }>>;
}

export default function HazardPanel({ apiData, layers, setLayers }: HazardPanelProps) {
  const [activeTab, setActiveTab] = useState<'fused' | 'summary'>('fused');

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const mapUrl = apiData?.maps?.fused_hazard || "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none" id="hazard-panel">
      <div className="border-b border-panel-border/40 pb-3">
        <h3 className="text-sm font-mono font-bold text-white tracking-wider">SENSOR FUSION &amp; HAZARD ANALYSIS</h3>
        <p className="text-[10px] text-slate-500 mt-1">Unified hazard mapping combining topography gradients and YOLO-detected surface obstacles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layer Toggles & Stats */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-3.5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
              MAP LAYERS TOGGLE
            </h4>
            
            <div className="space-y-2">
              {[
                { key: 'terrain', label: 'ELEVATION HAZARDS' },
                { key: 'grid', label: 'COORDINATE GRID HUD' },
                { key: 'detections', label: 'YOLO DETECTIONS (CRATER/ROCK)' },
                { key: 'safeZone', label: 'RECOMMENDED LANDING BOUNDS' }
              ].map((layer) => {
                const isActive = (layers as any)[layer.key];
                return (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key as any)}
                    className={`w-full flex items-center justify-between p-2.5 rounded border transition-all text-xs font-mono font-bold ${
                      isActive
                        ? 'border-cyber-cyan bg-cyber-cyan/5 text-cyber-cyan'
                        : 'border-panel-border bg-slate-950/60 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{layer.label}</span>
                    {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyber-cyan" />
              HAZARD SUMMARY
            </h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">TOTAL DETECTED CRATERS:</span>
                <span className="text-white font-bold">{apiData?.summary?.crater_count ?? 5}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TOTAL DETECTED BOULDERS:</span>
                <span className="text-white font-bold">{apiData?.summary?.rock_count ?? 14}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MAX DANGER SEVERITY:</span>
                <span className="text-cyber-red font-bold uppercase">{apiData?.hazard_summary?.max_severity ?? 'HIGH'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Hazard Map Viewport */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/40 border border-panel-border rounded-xl overflow-hidden backdrop-blur">
          {/* Viewport header */}
          <div className="bg-slate-950 border-b border-panel-border/80 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              SENSOR FUSION ENVIRONMENT
            </span>
            <span className="text-[9px] bg-cyber-red/20 text-cyber-red border border-cyber-red/30 px-2 py-0.5 rounded font-bold font-mono">
              RED = EXTREME HAZARD
            </span>
          </div>

          {/* Interactive Map Visual */}
          <div className="flex-1 relative overflow-hidden bg-slate-950 min-h-[380px] flex items-center justify-center scanline-effect" id="hazard-map-view">
            {layers.terrain && (
              <img
                src={mapUrl}
                alt="Unified Hazard Map"
                className="max-h-[380px] object-contain opacity-75 mix-blend-lighten pointer-events-none select-none"
              />
            )}

            {/* Simulated AI Object Detections Overlay */}
            {layers.detections && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Simulated Crater boundary */}
                <div className="absolute top-[35%] left-[38%] border border-cyber-cyan bg-slate-900/20 rounded-full flex items-center justify-center animate-pulse" style={{ width: '130px', height: '130px' }}>
                  <span className="bg-cyber-cyan text-slate-950 text-[7px] px-1 py-0.5 font-mono font-bold absolute -top-4 rounded">CRATER (CONF 98%)</span>
                </div>
                {/* Simulated Rock cluster */}
                <div className="absolute top-[22%] left-[62%] border border-cyber-cyan/80 p-1" style={{ width: '90px', height: '55px' }}>
                  <span className="bg-cyber-cyan/15 text-cyber-cyan text-[7px] px-1 font-mono absolute -top-4 left-0 border border-cyber-cyan/40">ROCK CLUSTER</span>
                </div>
              </div>
            )}

            {/* Coordinate Grid HUD */}
            {layers.grid && (
              <div className="absolute inset-0 pointer-events-none z-10 opacity-35">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
                      <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Safe landing bounds overlay */}
            {layers.safeZone && (
              <div className="absolute top-[54%] left-[58%] border border-cyber-green bg-cyber-green/5 p-1 relative flex flex-col items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.15)] pointer-events-none z-25" style={{ width: '130px', height: '85px' }}>
                <div className="bg-cyber-green text-slate-950 text-[8px] px-2 py-0.5 font-mono font-bold tracking-wider absolute -top-4.5 left-0 uppercase">
                  SAFE LANDING ZONE
                </div>
                <div className="text-[8px] font-mono text-cyber-green font-bold">SITE ALPHA (99%)</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
