import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Play,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Crosshair,
  RefreshCw
} from 'lucide-react';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import MissionUpload from './components/MissionUpload';
import TerrainPanel from './components/TerrainPanel';
import HazardPanel from './components/HazardPanel';
import LandingPanel from './components/LandingPanel';
import RoverPanel from './components/RoverPanel';
import MissionSummary from './components/MissionSummary';
import Settings from './components/Settings';

const API_BASE = '/api';

interface ApiLandingSite {
  rank: number;
  name: string;
  row: number;
  col: number;
  coordinates: string;
  safety_score: number;
  hazard_score: number;
  slope: number;
  roughness: number;
  hazard_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ApiHazardSummary {
  total: number;
  craters: number;
  rocks: number;
  max_severity: string;
}

interface ApiMaps {
  elevation: string;
  slope: string;
  roughness: string;
  terrain: string;
  hazard: string;
  fused_hazard: string;
  landing_sites: string;
}

interface ApiRoverPath {
  waypoints: number[][];
  total_pixels: number;
  estimated_distance_m: number;
  estimated_time_min: number;
  hazard_avoided: number;
}

interface ApiResponse {
  elevation: { min: number; max: number; mean: number; std: number; shape: number[] };
  terrain_stats: { safe_pct: number; caution_pct: number; unsafe_pct: number };
  maps: ApiMaps;
  hazards: { type: string; confidence: number; bbox: number[]; severity: string }[];
  hazard_summary: ApiHazardSummary;
  landing_sites: ApiLandingSite[];
  rover_path: ApiRoverPath;
  summary: {
    hazard_count: number;
    crater_count: number;
    rock_count: number;
    recommended_site: string;
    recommended_coords: string;
    mission_score: number;
    pipeline_stages_completed: number;
  };
}

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

interface Notification {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('HOME');
  const [slopeThreshold, setSlopeThreshold] = useState<number>(15);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [activeSiteId, setActiveSiteId] = useState<string>('site-alpha');
  const [showAdvancedTelemetry, setShowAdvancedTelemetry] = useState(false);

  const [layers, setLayers] = useState({
    terrain: true,
    grid: true,
    detections: true,
    safeZone: true
  });

  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [isExecutingLanding, setIsExecutingLanding] = useState(false);
  const [landingStep, setLandingStep] = useState(0);

  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedDemFile, setUploadedDemFile] = useState<File | null>(null);

  const [utcTime, setUtcTime] = useState<string>('2026-07-14 09:42:00');
  const [missionElapsed, setMissionElapsed] = useState<number>(9930);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', time: '14:32:10', text: 'AI: Hazard avoided, path recalculated.', type: 'info' },
    { id: '2', time: '14:31:55', text: 'AI: Optimal landing site identified.', type: 'success' },
    { id: '3', time: '14:31:30', text: 'AI: High-resolution surface scan complete.', type: 'info' },
    { id: '4', time: '14:31:00', text: 'AI: Initiating autonomous surface mapping.', type: 'info' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatNum = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getUTCFullYear()}-${formatNum(now.getUTCMonth() + 1)}-${formatNum(now.getUTCDate())}`;
      const timeStr = `${formatNum(now.getUTCHours())}:${formatNum(now.getUTCMinutes())}:${formatNum(now.getUTCSeconds())}`;
      setUtcTime(`${dateStr} ${timeStr}`);
      setMissionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const DEFAULT_SITES: SiteData[] = [
    { id: 'site-alpha',   name: 'SITE ALPHA',   safetyScore: 96, slope: 2.1, rockDensity: 0.5, hazardProb: 'LOW',    confidence: 98.5, coordinates: '25.4° N, 138.2° E', description: 'Mare Tranquillitatis Sector Alpha. Exceptional flat regolith plains, negligible micro-crater distribution.', x: 35, y: 40 },
    { id: 'site-bravo',   name: 'SITE BRAVO',   safetyScore: 89, slope: 4.5, rockDensity: 1.2, hazardProb: 'LOW',    confidence: 91.2, coordinates: '42.3° N, 115.6° E', description: 'Mare Serenitatis South Rim. Sloped terrain border with scattered basalt blocks.', x: 65, y: 30 },
    { id: 'site-charlie', name: 'SITE CHARLIE', safetyScore: 92, slope: 3.8, rockDensity: 0.8, hazardProb: 'LOW',    confidence: 94.8, coordinates: '15.6° N, 142.3° E', description: 'Oceanus Procellarum Margin. Deep regolith layer with moderate low-lying contours.', x: 70, y: 60 },
    { id: 'site-delta',   name: 'SITE DELTA',   safetyScore: 78, slope: 6.2, rockDensity: 2.5, hazardProb: 'MEDIUM', confidence: 82.1, coordinates: '30.1° S, 122.5° E', description: 'Tycho Crater Outer Ejecta Blanket. Complex rolling slopes, high-density impact fragments.', x: 42, y: 78 },
    { id: 'site-echo',    name: 'SITE ECHO',    safetyScore: 85, slope: 5.1, rockDensity: 1.8, hazardProb: 'LOW',    confidence: 88.9, coordinates: '5.2° S, 149.8° E',   description: 'Mare Imbrium East Basin. Fine-grained volcanic plains.', x: 55, y: 82 },
  ];

  const MAP_POSITIONS = [ { x: 35, y: 40 }, { x: 65, y: 30 }, { x: 70, y: 60 }, { x: 42, y: 78 }, { x: 55, y: 82 } ];

  const landingSites = useMemo<SiteData[]>(() => {
    if (!apiData || apiData.landing_sites.length === 0) return DEFAULT_SITES;
    return apiData.landing_sites.map((s, i) => ({
      id: `site-${s.name.toLowerCase().replace('site ', '')}`,
      name: s.name,
      safetyScore: s.safety_score,
      slope: s.slope,
      rockDensity: parseFloat((s.roughness * 10).toFixed(2)),
      hazardProb: s.hazard_level as 'LOW' | 'MEDIUM' | 'HIGH',
      confidence: parseFloat(((1 - s.hazard_score) * 100).toFixed(1)),
      coordinates: s.coordinates,
      description: `AI-computed site #${s.rank}. Slope: ${s.slope}°. Roughness index: ${s.roughness.toFixed(4)}. Hazard level: ${s.hazard_level}. Computed from DEM + YOLO fusion hazard map.`,
      x: MAP_POSITIONS[i]?.x ?? 50,
      y: MAP_POSITIONS[i]?.y ?? 50,
    }));
  }, [apiData]);

  const activeSite = useMemo(() => {
    return landingSites.find(s => s.id === activeSiteId) || landingSites[0];
  }, [activeSiteId, landingSites]);

  const radarPoints = useMemo(() => {
    const slopeClearance = Math.max(20, Math.min(100, (40 - activeSite.slope) * 2.5));
    const rockClearance = Math.max(20, Math.min(100, (5 - activeSite.rockDensity) * 20));
    const signalScore = activeSite.id === 'site-delta' ? 70 : 95;
    const powerExposure = activeSite.id === 'site-bravo' ? 82 : 94;
    const safetyVal = activeSite.safetyScore;
    const customSlopeAdjustment = Math.max(20, Math.min(100, (slopeThreshold / 30) * 100));

    const scores = [slopeClearance, rockClearance, signalScore, powerExposure, safetyVal, customSlopeAdjustment];
    const center = 100;
    const maxRadius = 75;

    return scores.map((score, i) => {
      const angle = (i * 60 - 90) * (Math.PI / 180);
      const r = (score / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, score };
    });
  }, [activeSite, slopeThreshold]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Upload failed: ${res.statusText}`);
    }
  };

  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isDem = ['tif', 'tiff', 'geotiff'].includes(ext);
    const isImg = ['jpg', 'jpeg', 'png', 'bmp'].includes(ext);

    if (isDem) {
      setUploadedDemFile(file);
    } else if (isImg) {
      setUploadedImageFile(file);
    }

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            setUploadedFile(file.name);
            setShowUploadModal(false);
            const timestamp = new Date().toUTCString().slice(17, 25);
            setNotifications(prevLogs => [
              {
                id: Date.now().toString(),
                time: timestamp,
                text: `SYSTEM: File '${file.name}' loaded locally. Click RUN AI PIPELINE to process.`,
                type: 'success'
              },
              ...prevLogs
            ]);
          }, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  const runAIScanSimulation = async () => {
    const timestamp = () => new Date().toUTCString().slice(17, 25);
    setIsRunningPipeline(true);
    setPipelineError(null);
    setNotifications(prev => [{
      id: Date.now().toString(),
      time: timestamp(),
      text: 'AI PIPELINE: Uploading files and starting terrain analysis...',
      type: 'warning',
    }, ...prev]);

    try {
      if (uploadedDemFile) {
        await uploadFile(uploadedDemFile);
      }
      if (uploadedImageFile) {
        await uploadFile(uploadedImageFile);
      }

      const runRes = await fetch(`${API_BASE}/run-mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slope_threshold: slopeThreshold,
          confidence_threshold: confidenceLevel / 100
        })
      });
      if (!runRes.ok) {
        const err = await runRes.json();
        throw new Error(err.error || `Pipeline failed: ${runRes.statusText}`);
      }
      const data: ApiResponse = await runRes.json();
      setApiData(data);
      setActiveTab('LANDING');

      if (data.landing_sites.length > 0) {
        setActiveSiteId(`site-${data.landing_sites[0].name.toLowerCase().replace('site ', '')}`);
      }

      setNotifications(prev => [{
        id: Date.now().toString(),
        time: timestamp(),
        text: `AI PIPELINE COMPLETE: ${data.summary.hazard_count} hazards detected. Best site: ${data.summary.recommended_site} (score: ${data.summary.mission_score}%).`,
        type: 'success',
      }, ...prev]);
    } catch (err: any) {
      const msg = err?.message ?? 'Unknown error';
      setPipelineError(msg);
      setNotifications(prev => [{ id: Date.now().toString(), time: timestamp(), text: `ERROR: ${msg}`, type: 'warning' }, ...prev]);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {};

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startLandingSequence = () => {
    setIsExecutingLanding(true);
    setLandingStep(0);
  };

  const nextLandingStep = () => {
    if (landingStep < 3) {
      setLandingStep(prev => prev + 1);
    } else {
      setIsExecutingLanding(false);
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          time: new Date().toUTCString().slice(17, 25),
          text: `COMMAND EXECUTION: Core landing sequence successfully delegated to onboard guidance system.`,
          type: 'success'
        },
        ...prev
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col font-mono select-none overflow-hidden relative" id="lunar-dashboard-root">
      <Navbar utcTime={utcTime} missionElapsed={missionElapsed} />

      {/* Workflow Guidance & Controls */}
      <div className="bg-slate-900/60 border-b border-panel-border px-6 py-2 flex flex-col md:flex-row items-start md:items-center justify-between text-xs font-mono gap-3 select-none" id="onboarding-guide">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-slate-500 font-bold tracking-wider">MISSION WORKFLOW:</span>
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-[9px] ${
              uploadedFile ? 'bg-cyber-green text-slate-950' : 'bg-cyber-cyan text-slate-950 animate-pulse font-black'
            }`}>1</span>
            <span className={uploadedFile ? 'text-slate-500 line-through decoration-cyber-green/50' : 'text-cyber-cyan font-bold'}>UPLOAD SURFACE DATA</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-[9px] ${
              apiData ? 'bg-cyber-green text-slate-950' : (uploadedFile ? 'bg-cyber-cyan text-slate-950 animate-pulse font-black' : 'bg-slate-800 text-slate-500')
            }`}>2</span>
            <span className={apiData ? 'text-slate-500 line-through decoration-cyber-green/50' : (uploadedFile ? 'text-cyber-cyan font-bold' : 'text-slate-500')}>RUN AI PIPELINE</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-[9px] ${
              apiData ? 'bg-cyber-cyan text-slate-950 animate-pulse font-black' : 'bg-slate-800 text-slate-500'
            }`}>3</span>
            <span className={apiData ? 'text-cyber-green font-bold' : 'text-slate-500'}>EVALUATE LANDING SITE & ROVER PATH</span>
          </div>
        </div>

        <button
          onClick={runAIScanSimulation}
          disabled={isRunningPipeline}
          className="bg-slate-950 border border-panel-border hover:border-cyber-cyan text-cyber-cyan px-4 py-1 rounded transition-all font-bold flex items-center space-x-1.5"
          id="btn-run-pipeline-top"
        >
          {isRunningPipeline ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>RUNNING...</span></>
          ) : (
            <><Play className="w-3.5 h-3.5" /><span>RUN AI PIPELINE</span></>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} apiData={apiData} />

        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-950/20">
          {activeTab === 'HOME' && <Home onStartMission={() => setActiveTab('UPLOAD')} apiData={apiData} />}
          {activeTab === 'UPLOAD' && (
            <MissionUpload
              uploadedFile={uploadedFile}
              uploadedImageFile={uploadedImageFile}
              uploadedDemFile={uploadedDemFile}
              uploadProgress={uploadProgress}
              isDragging={false}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
            />
          )}
          {activeTab === 'TERRAIN' && <TerrainPanel apiData={apiData} />}
          {activeTab === 'HAZARDS' && (
            <HazardPanel
              apiData={apiData}
              layers={layers}
              setLayers={setLayers}
            />
          )}
          {activeTab === 'LANDING' && (
            <LandingPanel
              apiData={apiData}
              landingSites={landingSites}
              activeSiteId={activeSiteId}
              setActiveSiteId={setActiveSiteId}
              radarPoints={radarPoints}
              activeSite={activeSite}
              startLandingSequence={startLandingSequence}
            />
          )}
          {activeTab === 'ROVER' && <RoverPanel apiData={apiData} />}
          {activeTab === 'SUMMARY' && <MissionSummary apiData={apiData} />}
          {activeTab === 'SETTINGS' && (
            <Settings
              slopeThreshold={slopeThreshold}
              setSlopeThreshold={setSlopeThreshold}
              confidenceLevel={confidenceLevel}
              setConfidenceLevel={setConfidenceLevel}
            />
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: LANDING SEQUENCE SIMULATOR
          ========================================================================= */}
      <AnimatePresence>
        {isExecutingLanding && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel-bg border-2 border-cyber-cyan p-6 rounded max-w-lg w-full space-y-5 shadow-2xl shadow-cyan-950/50 text-center font-mono relative"
            >
              <button
                onClick={() => setIsExecutingLanding(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 text-center">
                <h3 className="text-base font-display font-black text-white tracking-widest flex items-center justify-center gap-2">
                  <Crosshair className="w-5 h-5 text-cyber-cyan animate-pulse" />
                  CRITICAL COMMAND DESPATCH
                </h3>
                <p className="text-xs text-cyber-cyan font-bold uppercase tracking-widest">
                  DELEGATING DE-ORBIT AND TOUCHDOWN INSTRUCTIONS
                </p>
              </div>

              <div className="space-y-3 text-left bg-slate-950 border border-panel-border/85 p-4 rounded">
                {[
                  { title: 'TRANSMITTING TARGET COORDINATES', desc: `LAT/LON: ${activeSite.coordinates}` },
                  { title: 'CALIBRATING ONBOARD STAR-TRACKERS', desc: 'S-BAND Telemetry Sync verified' },
                  { title: 'DISPATCHING ROVER DYNAMICS MATRIX', desc: 'A* Pathing parameters updated' },
                  { title: 'CONFIRMING MISSION TOUCHDOWN EXECUTION', desc: 'Awaiting operator final manual consent' }
                ].map((step, idx) => {
                  const isCurrent = landingStep === idx;
                  const isDone = landingStep > idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 transition-colors ${
                        isCurrent ? 'text-white font-bold' : isDone ? 'text-cyber-green' : 'text-slate-600'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-cyber-green" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-slate-800 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-xs">{step.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={nextLandingStep}
                  className="w-full bg-cyber-cyan text-slate-950 font-black tracking-widest py-3 rounded text-xs transition-all active:scale-95"
                >
                  {landingStep < 3 ? 'PROCEED TO NEXT TELEMETRY SEQUENCE' : 'CONFIRM MISSION LANDING DISPATCH'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
