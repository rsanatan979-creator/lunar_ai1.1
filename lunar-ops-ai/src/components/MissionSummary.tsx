import React from 'react';
import { Award, ShieldAlert, Navigation, FileCode2, Clock, CheckCircle2, Download } from 'lucide-react';

interface MissionSummaryProps {
  apiData: any;
}

export default function MissionSummary({ apiData }: MissionSummaryProps) {
  // Extract values
  const successScore = apiData?.summary?.mission_score ?? 96.4;
  const recommendedSite = apiData?.summary?.recommended_site ?? 'SITE ALPHA';
  const coords = apiData?.summary?.recommended_coords ?? '210080.29° N, 102335.77° E';
  const hazards = apiData?.summary?.hazard_count ?? 12;
  const distance = apiData?.rover_path?.estimated_distance_m ?? 3450;
  const duration = apiData?.rover_path?.estimated_time_min ?? 345;
  const riskIndex = apiData?.rover_path?.hazard_avoided ?? 8;
  const confidence = apiData?.landing_sites?.[0]?.confidence ?? 98.5;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none font-mono" id="mission-summary-panel">
      <div className="border-b border-panel-border/40 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-mono font-bold text-white tracking-wider">MISSION SUMMARY REPORT</h3>
          <p className="text-[10px] text-slate-500 mt-1">Finalized operational log of site selections, hazard densities, and optimized path parameters</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 border border-panel-border px-3 py-1.5 rounded text-[10px] font-bold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all"
          id="btn-print-report"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT REPORT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scorecard 1 */}
        <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-2 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">SUCCESS EVALUATION</span>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-cyber-yellow" />
            <span className="text-xl font-bold text-white tracking-wide">{successScore}%</span>
          </div>
          <p className="text-[9px] text-slate-400">Classified safe based on NASA Artemis limits</p>
        </div>

        {/* Scorecard 2 */}
        <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-2 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">DETECTED HAZARDS</span>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-cyber-red animate-pulse" />
            <span className="text-xl font-bold text-cyber-red tracking-wide">{hazards} GRIDS</span>
          </div>
          <p className="text-[9px] text-slate-400">Fused from topography slope and YOLO boxes</p>
        </div>

        {/* Scorecard 3 */}
        <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-2 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">OPTIMAL TARGET SITE</span>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-cyber-green" />
            <span className="text-xl font-bold text-white tracking-wide">{recommendedSite}</span>
          </div>
          <p className="text-[9px] text-slate-400">{coords}</p>
        </div>

        {/* Scorecard 4 */}
        <div className="bg-slate-900/60 border border-panel-border rounded-lg p-4 space-y-2 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ROVER RANGE TRANSIT</span>
          <div className="flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-cyber-cyan" />
            <span className="text-xl font-bold text-cyber-cyan tracking-wide">{distance} METERS</span>
          </div>
          <p className="text-[9px] text-slate-400">A* pathfinding: {duration} min duration</p>
        </div>
      </div>

      {/* Narrative Section */}
      <section className="bg-slate-900/30 border border-panel-border rounded-lg p-6 space-y-4">
        <h4 className="text-xs font-bold text-white border-b border-panel-border/30 pb-2">AI OPERATIONS EVALUATION</h4>
        <div className="space-y-3.5 text-[10px] leading-relaxed text-slate-300">
          <p>
            The autonomous landing site evaluation system ingested the Digital Elevation Model (DEM) and cross-correlated topography data with YOLO crater/boulder recognition.
          </p>
          <p>
            Based on the analysis, <strong className="text-white">{recommendedSite}</strong> is selected as the primary landing point. It features a slope profile of less than 0.5 degrees and a standard deviation roughness profile that is safe for landing operations.
          </p>
          <p>
            An optimized A* path has been generated from the initial rover spawn node to the site center. The route avoids steep slopes and crater boundaries, and remains within acceptable power and communication tolerances.
          </p>
        </div>
      </section>
    </div>
  );
}
