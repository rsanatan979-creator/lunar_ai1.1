import React, { useMemo } from 'react';
import { Check, X, ShieldAlert, Award, Star, Compass, ArrowRight } from 'lucide-react';

interface SiteData {
  id: string;
  name: string;
  safetyScore: number;
  slope: number;
  rockDensity: number;
  hazardProb: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  coordinates: string;
  description: string;
  x: number;
  y: number;
}

interface LandingPanelProps {
  apiData: any;
  landingSites: SiteData[];
  activeSiteId: string;
  setActiveSiteId: (id: string) => void;
  radarPoints: { x: number; y: number; score: number }[];
  activeSite: SiteData;
  startLandingSequence: () => void;
}

export default function LandingPanel({
  apiData,
  landingSites,
  activeSiteId,
  setActiveSiteId,
  radarPoints,
  activeSite,
  startLandingSequence
}: LandingPanelProps) {

  // Explainable AI evaluation checklist for each site
  const xaiChecklist = useMemo(() => {
    const slopeOk = activeSite.slope < 5.0;
    const roughnessOk = activeSite.rockDensity < 15; // standard bounds
    const hazardsOk = activeSite.hazardProb === 'LOW';
    const confidenceOk = activeSite.confidence > 90.0;

    return [
      { label: 'Low Slope Profile (< 5°)', passed: slopeOk, val: `${activeSite.slope}°` },
      { label: 'Flat Terrain Profile (Roughness index)', passed: roughnessOk, val: `${activeSite.rockDensity}` },
      { label: 'Low Boulder/Crater Density', passed: hazardsOk, val: activeSite.hazardProb },
      { label: 'High Structural AI Confidence (> 90%)', passed: confidenceOk, val: `${activeSite.confidence}%` }
    ];
  }, [activeSite]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none" id="landing-recommendation-panel">
      <div className="border-b border-panel-border/40 pb-3">
        <h3 className="text-sm font-mono font-bold text-white tracking-wider">AI LANDING RECOMMENDATION DECK</h3>
        <p className="text-[10px] text-slate-500 mt-1">Safest recommended landing sites ranked by topographical parameters and AI object detection clearance margins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Ranked cards */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">RANKED CANDIDATES</span>
          {landingSites.map((site, index) => {
            const isSelected = activeSiteId === site.id;
            return (
              <button
                key={site.id}
                onClick={() => setActiveSiteId(site.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-900 border-cyber-cyan shadow-[0_0_15px_rgba(0,212,255,0.08)]'
                    : 'bg-slate-950/60 border-panel-border hover:bg-slate-900/60'
                }`}
                id={`site-card-${site.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-mono font-black tracking-wide text-white flex items-center gap-1.5">
                      {index === 0 && <Star className="w-3.5 h-3.5 text-cyber-yellow fill-cyber-yellow" />}
                      {site.name}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono">{site.coordinates}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">SAFETY SCORE</span>
                    <span className={`text-xs font-mono font-bold block ${
                      site.safetyScore > 90 ? 'text-cyber-green' : 'text-cyber-yellow'
                    }`}>
                      {site.safetyScore} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-panel-border/30 text-[9px] font-mono">
                  <div>
                    <span className="text-slate-500 block">SLOPE</span>
                    <span className="text-slate-200 font-bold">{site.slope}°</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ROUGHNESS</span>
                    <span className="text-slate-200 font-bold">{site.rockDensity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">RISK LEVEL</span>
                    <span className={`font-bold ${
                      site.hazardProb === 'LOW' ? 'text-cyber-green' : 'text-cyber-yellow'
                    }`}>
                      {site.hazardProb}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Explainable AI & Telemetry details */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/40 border border-panel-border rounded-xl p-5 space-y-5 backdrop-blur">
            <div className="border-b border-panel-border/40 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{activeSite.name} DIAGNOSTIC REPORT</h4>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">Coordinates: {activeSite.coordinates}</p>
              </div>
              <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded font-bold font-mono">
                RANK #{landingSites.findIndex(s => s.id === activeSite.id) + 1}
              </span>
            </div>

            {/* Plain English score explanation returned by the API */}
            <div className="bg-slate-950/60 border border-panel-border p-3.5 rounded-lg space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyber-cyan animate-spin-slow" />
                EXPLAINABLE AI (XAI) METADATA
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                {apiData?.landing_sites?.find((s: any) => s.name === activeSite.name)?.safety_score_explanation || activeSite.description}
              </p>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">NASA SAFETY COMPLIANCE CHECKLIST</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {xaiChecklist.map((check, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-panel-border/60 p-3 rounded flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center space-x-2">
                      {check.passed ? (
                        <div className="w-4.5 h-4.5 rounded-full bg-cyber-green/10 text-cyber-green border border-cyber-green/30 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/30 flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-slate-300">{check.label}</span>
                    </div>
                    <span className="text-white font-bold">{check.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execute landing sequence */}
            <div className="pt-3 border-t border-panel-border/30">
              <button
                onClick={startLandingSequence}
                className="w-full bg-cyber-cyan text-slate-950 hover:bg-white hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] font-bold text-xs py-3 rounded-lg flex items-center justify-center space-x-2 transition-all font-mono tracking-widest uppercase"
                id="btn-landing-seq"
              >
                <span>INITIATE LANDING PROCESS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
