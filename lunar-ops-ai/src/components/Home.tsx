import React from 'react';
import { 
  Play, 
  Moon, 
  Activity, 
  Cpu, 
  ShieldAlert, 
  Navigation, 
  CheckSquare 
} from 'lucide-react';

interface HomeProps {
  onStartMission: () => void;
  apiData: any;
}

export default function Home({ onStartMission, apiData }: HomeProps) {
  // Quick Statistics
  const stats = [
    { label: 'DEM RESOLUTION', val: '0.12 M/PX', desc: 'LROC high precision datasets' },
    { label: 'YOLO DETECTOR', val: 'v11 Crater/Rock', desc: 'Pre-trained custom Weights' },
    { label: 'COMPUTATION SPEEDUP', val: '389X Faster', desc: 'Vectorized uniform_filter standard deviation' },
    { label: 'MISSION SUCCESS INDEX', val: apiData ? `${apiData.summary.mission_score}%` : '96.4%', desc: 'NASA safety standard comparison' }
  ];

  // Pipeline stages
  const pipelineStages = [
    { title: '1. DEM Ingestion', desc: 'Reads Lunar Digital Elevation Models (.tif) extracting spatial transformations.', icon: Moon },
    { title: '2. Terrain Profiling', desc: 'Computes slope angles and roughness metrics using vectorized gradient maps.', icon: Activity },
    { title: '3. YOLO AI Detection', desc: 'Runs real-time crater and boulder detection on auxiliary optical images.', icon: Cpu },
    { title: '4. Sensor Fusion', desc: 'Merges GIS measurements with AI object bounds into a unified hazard matrix.', icon: ShieldAlert },
    { title: '5. Path Optimization', desc: 'Computes optimal safety landing zones and plots paths via anisotropic A*.', icon: Navigation }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none" id="home-view-panel">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900/40 border border-panel-border rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur" id="home-hero">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 to-transparent pointer-events-none"></div>
        <div className="space-y-4 max-w-xl">
          <span className="text-[10px] font-bold text-cyber-cyan tracking-widest uppercase border border-cyber-cyan/30 bg-cyber-cyan/5 px-2.5 py-1 rounded-full">
            LUNAR AI OPERATIONAL ENVIRONMENT
          </span>
          <h2 className="text-3xl lg:text-4xl font-display font-black text-white leading-tight">
            Autonomous Landing Site Selector &amp; Safe Rover Navigation
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed font-mono">
            An advanced AI-assisted GIS system designed to automatically analyze high-resolution lunar elevation models, run computer vision crater models, and plot safest pathways for landing systems and autonomous rovers.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartMission}
              className="bg-cyber-cyan text-slate-950 hover:bg-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] font-bold text-xs px-6 py-3 rounded-lg flex items-center space-x-2 transition-all font-mono tracking-widest uppercase"
              id="btn-start-mission"
            >
              <Play className="w-4 h-4" />
              <span>START MISSION ANALYZER</span>
            </button>
          </div>
        </div>

        {/* Outer glowing HUD circle graphic */}
        <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 border border-cyber-cyan/10 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-4 border border-dashed border-cyber-cyan/20 rounded-full animate-reverse-spin"></div>
          <div className="absolute inset-8 bg-slate-950/80 border border-cyber-cyan/30 rounded-full flex flex-col items-center justify-center">
            <Moon className="w-12 h-12 text-cyber-cyan animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase font-mono">MARIS-1</span>
          </div>
        </div>
      </section>

      {/* Quick Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="home-stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-panel-border rounded-lg p-4 font-mono space-y-1.5 hover:border-cyber-cyan/50 transition-colors">
            <span className="text-[9px] text-slate-500 font-bold tracking-wider">{stat.label}</span>
            <div className="text-lg font-bold text-white tracking-wide">{stat.val}</div>
            <p className="text-[10px] text-slate-400">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* AI Pipeline Visualization */}
      <section className="bg-slate-900/30 border border-panel-border rounded-lg p-6 space-y-6" id="home-pipeline-section">
        <div className="border-b border-panel-border/40 pb-3">
          <h3 className="text-sm font-mono font-bold text-white tracking-wider">AI PROCESSING PIPELINE STAGES</h3>
          <p className="text-[10px] text-slate-500 mt-1">Autonomous decision matrix flow from raw input to rover telemetry</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative" id="pipeline-stages-container">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={idx} className="relative bg-slate-950/80 border border-panel-border/80 rounded-lg p-4 flex flex-col items-start space-y-3 hover:border-cyber-cyan transition-all">
                {idx < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-cyber-cyan text-sm pointer-events-none z-20 animate-pulse font-bold">
                    ➔
                  </div>
                )}
                <div className="p-2 bg-slate-900 border border-panel-border rounded-lg">
                  <Icon className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-200">{stage.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
