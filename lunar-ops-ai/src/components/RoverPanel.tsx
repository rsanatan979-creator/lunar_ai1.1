import React, { useState, useEffect, useMemo } from 'react';
import { Play, RotateCcw, MapPin, Compass, Battery, ShieldAlert, Award } from 'lucide-react';

interface RoverPanelProps {
  apiData: any;
}

export default function RoverPanel({ apiData }: RoverPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);

  // Extract path waypoints or fallback to default path coordinates (percents)
  const defaultWaypoints = [
    [40, 35], [43, 38], [47, 43], [52, 48], [55, 52], [58, 58]
  ];

  const waypoints = useMemo(() => {
    if (!apiData?.rover_path?.waypoints || apiData.rover_path.waypoints.length === 0) {
      return defaultWaypoints;
    }
    
    // Scale pixel indices [row, col] to percentages for absolute plotting on image box
    // The test DEM shape is (128, 205).
    const h = apiData.elevation?.shape?.[0] ?? 128;
    const w = apiData.elevation?.shape?.[1] ?? 205;
    
    return apiData.rover_path.waypoints.map((pt: number[]) => {
      const yPct = (pt[0] / h) * 100;
      const xPct = (pt[1] / w) * 100;
      return [yPct, xPct];
    });
  }, [apiData]);

  // Handle path animation loop
  useEffect(() => {
    let timer: any;
    if (isAnimating) {
      timer = setInterval(() => {
        setAnimationIndex(prev => {
          if (prev >= waypoints.length - 1) {
            setIsAnimating(false);
            clearInterval(timer);
            return waypoints.length - 1;
          }
          return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isAnimating, waypoints]);

  const activePosition = waypoints[animationIndex] || waypoints[0];

  const startAnimation = () => {
    setAnimationIndex(0);
    setIsAnimating(true);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationIndex(0);
  };

  // Metrics details
  const distance = apiData?.rover_path?.estimated_distance_m ?? 3450;
  const time = apiData?.rover_path?.estimated_time_min ?? 345;
  const riskIndex = apiData?.rover_path?.hazard_avoided ?? 8;
  const energyRemaining = Math.max(72, 100 - Math.round((animationIndex / (waypoints.length - 1 || 1)) * 28));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none" id="rover-navigation-panel">
      <div className="border-b border-panel-border/40 pb-3">
        <h3 className="text-sm font-mono font-bold text-white tracking-wider">A* ROVER ROUTE OPTIMIZATION</h3>
        <p className="text-[10px] text-slate-500 mt-1">Autonomous pathfinding minimizing topological roughness and crater/rock proximity hazards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Stats & Controls */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">WAYPOINT STATISTICS</h4>
            
            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">ESTIMATED RANGE:</span>
                <span className="text-white font-bold">{distance} METERS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TRANSIT DURATION:</span>
                <span className="text-white font-bold">{time} MINUTES</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OBSTACLES AVOIDED:</span>
                <span className="text-cyber-green font-bold">{riskIndex} DETECTED</span>
              </div>
              <div className="flex justify-between items-center border-t border-panel-border/30 pt-3">
                <span className="text-slate-500">BATTERY CAPACITY:</span>
                <div className="flex items-center space-x-1">
                  <Battery className="w-3.5 h-3.5 text-cyber-green" />
                  <span className="text-cyber-green font-bold">{energyRemaining}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">TELEMETRY CONTROLS</h4>
            <div className="flex gap-2">
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className="flex-1 bg-cyber-cyan text-slate-950 hover:bg-white disabled:opacity-50 font-bold text-xs py-2 px-3 rounded flex items-center justify-center space-x-2 transition-all"
                id="btn-play-rover"
              >
                <Play className="w-3.5 h-3.5" />
                <span>TRAVERSE</span>
              </button>
              <button
                onClick={resetAnimation}
                className="p-2 border border-panel-border bg-slate-950 text-slate-400 hover:text-white rounded"
                id="btn-reset-rover"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Center: Map frame displaying paths and animated rover icon */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/40 border border-panel-border rounded-xl overflow-hidden backdrop-blur">
          {/* Header */}
          <div className="bg-slate-950 border-b border-panel-border/80 px-4 py-2.5 flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              MISSION TELEMETRY MAP LAYER
            </span>
          </div>

          <div className="flex-1 relative overflow-hidden bg-slate-950 min-h-[380px] flex items-center justify-center scanline-effect" id="rover-telemetry-viewport">
            {/* Base landing maps */}
            <img
              src={apiData?.maps?.landing_sites || "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=1200"}
              alt="Rover Path map"
              className="max-h-[380px] object-contain opacity-70 pointer-events-none select-none mix-blend-lighten"
            />

            {/* Path SVG overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <polyline
                points={waypoints.map(pt => `${pt[1]}%,${pt[0]}%`).join(' ')}
                fill="none"
                stroke="#00D4FF"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            </svg>

            {/* Animated Rover Position Marker */}
            <div 
              style={{ 
                left: `${activePosition[1]}%`, 
                top: `${activePosition[0]}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-30 flex items-center justify-center transition-all duration-200 ease-out"
              id="rover-node-marker"
            >
              <div className="w-4 h-4 bg-cyber-green rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_10px_rgba(0,255,157,0.8)]">
                <span className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-ping"></span>
              </div>
              <span className="absolute left-5 bg-slate-950/80 border border-panel-border px-1.5 py-0.5 rounded text-[8px] font-mono text-cyber-green font-bold uppercase tracking-wider whitespace-nowrap">
                ROVER-01
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
