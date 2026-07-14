import React, { useState } from 'react';
import { Compass, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

interface TerrainPanelProps {
  apiData: any;
}

export default function TerrainPanel({ apiData }: TerrainPanelProps) {
  const [selectedMap, setSelectedMap] = useState<'elevation' | 'slope' | 'roughness' | 'classification'>('elevation');
  const [zoomScale, setZoomScale] = useState(1);

  // Fallback defaults if no apiData has run
  const defaultMaps = {
    elevation: "https://images.unsplash.com/photo-1608178398319-48f814d0750c?auto=format&fit=crop&q=80&w=600",
    slope: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=600",
    roughness: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=600",
    classification: "https://images.unsplash.com/photo-1614726365930-627c73322797?auto=format&fit=crop&q=80&w=600"
  };

  const currentMapUrl = () => {
    if (!apiData?.maps) {
      return defaultMaps[selectedMap];
    }
    switch (selectedMap) {
      case 'elevation': return apiData.maps.elevation;
      case 'slope': return apiData.maps.slope;
      case 'roughness': return apiData.maps.roughness;
      case 'classification': return apiData.maps.terrain;
      default: return defaultMaps.elevation;
    }
  };

  const legends = {
    elevation: [
      { color: 'bg-indigo-950', label: 'Low Elevation (-240m)' },
      { color: 'bg-blue-800', label: 'Mean Level (-120m)' },
      { color: 'bg-cyan-400', label: 'High Elevation (15m)' }
    ],
    slope: [
      { color: 'bg-emerald-500', label: 'Safe (< 8.0°)' },
      { color: 'bg-yellow-500', label: 'Caution (8.0° - 15.0°)' },
      { color: 'bg-rose-600', label: 'Hazardous (> 15.0°)' }
    ],
    roughness: [
      { color: 'bg-slate-900', label: 'Smooth Regolith (0.0)' },
      { color: 'bg-orange-800', label: 'Moderate Roughness' },
      { color: 'bg-red-600', label: 'Boulders & Crates (1.0)' }
    ],
    classification: [
      { color: 'bg-[#00D4FF]', label: 'Safe Plains' },
      { color: 'bg-[#FFC107]', label: 'Caution Slopes' },
      { color: 'bg-[#FF4D4D]', label: 'Danger Zones' }
    ]
  };

  const descriptions = {
    elevation: "Lunar Digital Elevation Map. Height deviations across the selected coordinate segment computed directly from LROC datasets.",
    slope: "Terrain Slope Map. Calculates pixel-level angular steepness. Slopes exceeding 15 degrees are marked critical for landing operations.",
    roughness: "Surface Roughness Index. Derived from local standard deviation of elevation points, highlighting fine-scale micro-hazards.",
    classification: "Multi-class Terrain classification. Automatically labels pixels based on safety standards for autonomous guidance systems."
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none" id="terrain-analysis-panel">
      <div className="border-b border-panel-border/40 pb-3">
        <h3 className="text-sm font-mono font-bold text-white tracking-wider">GEOMORPHOLOGY &amp; TERRAIN ANALYSIS</h3>
        <p className="text-[10px] text-slate-500 mt-1">Interactive elevation profiles, slope clearances, and regolith roughness maps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left selector menu cards */}
        <div className="space-y-4">
          {[
            { id: 'elevation', label: 'ELEVATION PROFILE' },
            { id: 'slope', label: 'SLOPE DEVIATION' },
            { id: 'roughness', label: 'SURFACE ROUGHNESS' },
            { id: 'classification', label: 'TERRAIN CLASSIFICATION' }
          ].map((item) => {
            const isSelected = selectedMap === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedMap(item.id as any);
                  setZoomScale(1);
                }}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-900 border-cyber-cyan shadow-[0_0_15px_rgba(0,212,255,0.08)]'
                    : 'bg-slate-950/60 border-panel-border hover:bg-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MAP VIEW</span>
                  <Compass className={`w-3.5 h-3.5 ${isSelected ? 'text-cyber-cyan' : 'text-slate-600'}`} />
                </div>
                <h4 className="text-xs font-mono font-bold text-white tracking-wide">{item.label}</h4>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">{descriptions[item.id]}</p>
              </button>
            );
          })}
        </div>

        {/* Center Map Preview and Interactive Zoom */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/40 border border-panel-border rounded-xl overflow-hidden backdrop-blur">
          {/* Controls Bar */}
          <div className="bg-slate-950 border-b border-panel-border/80 px-4 py-2.5 flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              ACTIVE LAYER: {selectedMap.toUpperCase()}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
                className="p-1 bg-slate-900 hover:bg-slate-800 border border-panel-border rounded text-slate-400 hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] font-mono font-bold text-slate-500 w-10 text-center">{Math.round(zoomScale * 100)}%</span>
              <button 
                onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
                className="p-1 bg-slate-900 hover:bg-slate-800 border border-panel-border rounded text-slate-400 hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Zoom Map Image container */}
          <div className="flex-1 relative overflow-hidden bg-slate-950 min-h-[350px] flex items-center justify-center scanline-effect">
            <div 
              style={{ transform: `scale(${zoomScale})` }} 
              className="transition-transform duration-200 ease-out w-full h-full flex items-center justify-center"
            >
              <img
                src={currentMapUrl()}
                alt="Active Terrain Map"
                className="max-h-[350px] object-contain select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Legend and Description Bar at bottom */}
          <div className="bg-slate-950 border-t border-panel-border/80 p-4 space-y-3">
            <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
              {descriptions[selectedMap]}
            </p>

            <div className="border-t border-panel-border/30 pt-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">MAP COLOR KEY:</span>
              <div className="flex flex-wrap items-center gap-4">
                {legends[selectedMap].map((leg, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-[9px] font-bold text-slate-300 font-mono">
                    <span className={`w-3 h-3 rounded-sm ${leg.color}`}></span>
                    <span>{leg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
