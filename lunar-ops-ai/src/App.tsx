import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Play,
  Download,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Info,
  Activity,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Battery,
  Radio,
  Navigation,
  Eye,
  EyeOff,
  Terminal,
  Sliders,
  X,
  Crosshair,
  Ruler,
  ChevronUp,
  ChevronDown,
  Moon,
  RefreshCw
} from 'lucide-react';

// Interfaces for our state and UI data
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
  x: number; // Percent from left on map
  y: number; // Percent from top on map
}

interface Notification {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export default function App() {
  // Navigation & Tab state: 'OVERVIEW', 'TERRAIN ANALYSIS', 'ROVER CONTROL', 'AI MODELS', 'LANDING RECOMMENDATION'
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');

  // Interactive controls
  const [slopeThreshold, setSlopeThreshold] = useState<number>(15);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [activeSiteId, setActiveSiteId] = useState<string>('site-alpha');
  
  // Custom Layer Toggles
  const [layers, setLayers] = useState({
    terrain: true,
    grid: true,
    detections: true,
    safeZone: true,
    contours: false
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Measure tool state
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Time & Timers
  const [utcTime, setUtcTime] = useState<string>('2026-07-14 09:42:00');
  const [missionElapsed, setMissionElapsed] = useState<number>(9930); // in seconds (2h 45m 30s)
  
  // File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Simulation execution state
  const [isExecutingLanding, setIsExecutingLanding] = useState(false);
  const [landingStep, setLandingStep] = useState(0);

  // Interactive notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', time: '14:32:10', text: 'AI: Hazard avoided, path recalculated.', type: 'info' },
    { id: '2', time: '14:31:55', text: 'AI: Optimal landing site identified.', type: 'success' },
    { id: '3', time: '14:31:30', text: 'AI: High-resolution surface scan complete.', type: 'info' },
    { id: '4', time: '14:31:00', text: 'AI: Initiating autonomous surface mapping.', type: 'info' },
  ]);

  // Update dynamic clocks
  useEffect(() => {
    const interval = setInterval(() => {
      // Keep real UTC clock ticking
      const now = new Date();
      const formatNum = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getUTCFullYear()}-${formatNum(now.getUTCMonth() + 1)}-${formatNum(now.getUTCDate())}`;
      const timeStr = `${formatNum(now.getUTCHours())}:${formatNum(now.getUTCMinutes())}:${formatNum(now.getUTCSeconds())}`;
      setUtcTime(`${dateStr} ${timeStr}`);
      
      // Keep elapsed mission time ticking
      setMissionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format elapsed time: "02h 45m 30s"
  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  // Static landing sites placeholder data
  const landingSites = useMemo<SiteData[]>(() => [
    {
      id: 'site-alpha',
      name: 'SITE ALPHA',
      safetyScore: 96,
      slope: 2.1,
      rockDensity: 0.5,
      hazardProb: 'LOW',
      confidence: 98.5,
      coordinates: '25.4° N, 138.2° E',
      description: 'Mare Tranquillitatis Sector Alpha. Exceptional flat regolith plains, negligible micro-crater distribution, and optimal direct line-of-sight communications back with Earth ground telemetry.',
      x: 35,
      y: 40
    },
    {
      id: 'site-bravo',
      name: 'SITE BRAVO',
      safetyScore: 89,
      slope: 4.5,
      rockDensity: 1.2,
      hazardProb: 'LOW',
      confidence: 91.2,
      coordinates: '42.3° N, 115.6° E',
      description: 'Mare Serenitatis South Rim. Sloped terrain border with scattered basalt blocks. Comms are stable with minor terrain obstruction risk.',
      x: 65,
      y: 30
    },
    {
      id: 'site-charlie',
      name: 'SITE CHARLIE',
      safetyScore: 92,
      slope: 3.8,
      rockDensity: 0.8,
      hazardProb: 'LOW',
      confidence: 94.8,
      coordinates: '15.6° N, 142.3° E',
      description: 'Oceanus Procellarum Margin. Deep regolith layer with moderate low-lying contours. Excellent power generation exposure profiles.',
      x: 70,
      y: 60
    },
    {
      id: 'site-delta',
      name: 'SITE DELTA',
      safetyScore: 78,
      slope: 6.2,
      rockDensity: 2.5,
      hazardProb: 'MEDIUM',
      confidence: 82.1,
      coordinates: '30.1° S, 122.5° E',
      description: 'Tycho Crater Outer Ejecta Blanket. Complex rolling slopes, high-density impact fragments, and minor radar signal shadow risks.',
      x: 42,
      y: 78
    },
    {
      id: 'site-echo',
      name: 'SITE ECHO',
      safetyScore: 85,
      slope: 5.1,
      rockDensity: 1.8,
      hazardProb: 'LOW',
      confidence: 88.9,
      coordinates: '5.2° S, 149.8° E',
      description: 'Mare Imbrium East Basin. Fine-grained volcanic plains. Safe slopes with moderately spaced structural obstacles.',
      x: 55,
      y: 82
    }
  ], []);

  // Currently selected site data object
  const activeSite = useMemo(() => {
    return landingSites.find(s => s.id === activeSiteId) || landingSites[0];
  }, [activeSiteId, landingSites]);

  // Generate coordinates for radar/spider chart dynamically based on values
  // We align these 6 dimensions around the center of 100,100 with radius 75
  const radarPoints = useMemo(() => {
    // Standard scales for the 6 axes
    // 1. Slope Clearance (higher is flatter: derived from 40 - slope)
    const slopeClearance = Math.max(20, Math.min(100, (40 - activeSite.slope) * 2.5));
    // 2. Rock Density clearance (higher is safer: derived from 5 - rockDensity)
    const rockClearance = Math.max(20, Math.min(100, (5 - activeSite.rockDensity) * 20));
    // 3. Signal strength
    const signalScore = activeSite.id === 'site-delta' ? 70 : 95;
    // 4. Power profiles (based on coordinate latitudes)
    const powerExposure = activeSite.id === 'site-bravo' ? 82 : 94;
    // 5. General structural confidence
    const safetyVal = activeSite.safetyScore;
    // 6. User adjustable threshold mapping
    const customSlopeAdjustment = Math.max(20, Math.min(100, (slopeThreshold / 30) * 100));

    const scores = [slopeClearance, rockClearance, signalScore, powerExposure, safetyVal, customSlopeAdjustment];
    const center = 100;
    const maxRadius = 75;

    return scores.map((score, i) => {
      const angle = (i * 60 - 90) * (Math.PI / 180); // Rotate to start at top
      const r = (score / 100) * maxRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, score };
    });
  }, [activeSite, slopeThreshold]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processMockUpload(e.dataTransfer.files[0].name);
    }
  };

  const processMockUpload = (filename: string) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            setUploadedFile(filename);
            setShowUploadModal(false);
            // Add automated operational log
            const timestamp = new Date().toUTCString().slice(17, 25);
            setNotifications(prevLogs => [
              {
                id: Date.now().toString(),
                time: timestamp,
                text: `SYSTEM: Lunar DEM file '${filename}' loaded successfully. Core mapping updated.`,
                type: 'success'
              },
              ...prevLogs
            ]);
          }, 800);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Run AI Simulation check trigger
  const runAIScanSimulation = () => {
    const timestamp = new Date().toUTCString().slice(17, 25);
    const newLog: Notification = {
      id: Date.now().toString(),
      time: timestamp,
      text: 'AI PIPELINE: Running real-time spatial diagnostics and recalculating hazard matrices...',
      type: 'warning'
    };
    setNotifications(prev => [newLog, ...prev]);

    // Animate sliders slightly to simulate computing
    let count = 0;
    const interval = setInterval(() => {
      setSlopeThreshold(prev => Math.min(25, Math.max(5, prev + (Math.random() > 0.5 ? 1 : -1))));
      setConfidenceLevel(prev => Math.min(99, Math.max(85, prev + (Math.random() > 0.5 ? 1 : -1))));
      count++;
      if (count > 8) {
        clearInterval(interval);
        setNotifications(prev => [
          {
            id: (Date.now() + 1).toString(),
            time: new Date().toUTCString().slice(17, 25),
            text: 'AI PIPELINE: Multi-spectral terrain analysis complete. High safety margins verified.',
            type: 'success'
          },
          ...prev
        ]);
      }
    }, 200);
  };

  // Click handler inside maps to demonstrate precision coordinates & measurement tool
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!measureMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoints = [...measurePoints, { x, y }];
    setMeasurePoints(newPoints);

    if (newPoints.length === 2) {
      // Calculate pixel/percent distance and scale to lunar kilometers (e.g. 1% = 5.2 km)
      const dx = newPoints[1].x - newPoints[0].x;
      const dy = newPoints[1].y - newPoints[0].y;
      const pctDist = Math.sqrt(dx * dx + dy * dy);
      const lunarKm = Math.round(pctDist * 4.35 * 10) / 10;
      setMeasuredDistance(lunarKm);

      // Add log
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          time: new Date().toUTCString().slice(17, 25),
          text: `MEASURE TOOL: Range calculated between coordinates. Distance: ${lunarKm} km.`,
          type: 'info'
        },
        ...prev
      ]);
    } else if (newPoints.length > 2) {
      // Reset measure points
      setMeasurePoints([{ x, y }]);
      setMeasuredDistance(null);
    }
  };

  // Execute Landing sequence countdown simulation
  const startLandingSequence = () => {
    setIsExecutingLanding(true);
    setLandingStep(0);
  };

  const nextLandingStep = () => {
    if (landingStep < 3) {
      setLandingStep(prev => prev + 1);
    } else {
      setIsExecutingLanding(false);
      // Log landing confirmation
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
      {/* Decorative Matrix / HUD Scanlines overlay on top border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-cyan opacity-40 z-50"></div>
      
      {/* =========================================================================
          TOP NAVIGATION HEADER
          ========================================================================= */}
      <header className="border-b border-panel-border bg-panel-bg/90 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-40" id="main-nav-header">
        <div className="flex items-center space-x-4">
          {/* Animated pulsing lunar logo */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-cyber-cyan/20 blur-md rounded-full w-9 h-9 animate-pulse"></div>
            <Moon className="w-8 h-8 text-cyber-cyan relative z-10" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-display font-bold tracking-wider text-white">LUNAR OPS AI</h1>
              <span className="text-[10px] bg-cyber-red/20 border border-cyber-red/50 text-cyber-red px-1.5 py-0.5 rounded font-mono font-bold tracking-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyber-red rounded-full glow-dot-green"></span> LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono" id="mission-id">
              MISSION ID: <span className="text-cyber-cyan font-bold">L-OPS-2026-X</span>
            </p>
          </div>
        </div>

        {/* System clocks & operational parameters */}
        <div className="flex items-center space-x-8 text-xs font-mono bg-slate-950/60 border border-panel-border px-4 py-1.5 rounded" id="header-clocks">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">UTC CLOCK:</span>
            <span className="text-white tracking-widest font-bold" id="current-time">{utcTime}</span>
          </div>
          <div className="h-4 w-[1px] bg-panel-border"></div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">OPERATOR:</span>
            <span className="text-cyber-cyan font-semibold">SANATAN ROY</span>
          </div>
          <div className="h-4 w-[1px] bg-panel-border"></div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">REGION:</span>
            <span className="text-cyber-yellow">MARE TRANQUILLITATIS</span>
          </div>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center space-x-2" id="header-action-buttons">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 border border-panel-border hover:border-cyber-cyan hover:text-cyber-cyan rounded text-xs font-mono transition-all active:scale-95"
            title="Upload digital elevation model files"
            id="btn-upload"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD DEM</span>
          </button>
          
          <button
            onClick={runAIScanSimulation}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 border border-panel-border hover:border-cyber-green hover:text-cyber-green rounded text-xs font-mono transition-all active:scale-95"
            title="Trigger multi-spectral pipeline recheck"
            id="btn-run-ai"
          >
            <Play className="w-3.5 h-3.5" />
            <span>RUN AI PIPELINE</span>
          </button>

          <a
            href="#export"
            onClick={(e) => {
              e.preventDefault();
              alert("Exporting GIS package... Download scheduled.");
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 border border-panel-border hover:border-cyber-blue hover:text-cyber-blue rounded text-xs font-mono transition-all active:scale-95"
            id="btn-export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </a>
        </div>
      </header>

      {/* =========================================================================
          HORIZONTAL SUB-NAVBAR TABS
          ========================================================================= */}
      <nav className="bg-slate-950 border-b border-panel-border px-6 py-1 flex items-center justify-between" id="horizontal-tabs-bar">
        <div className="flex space-x-1 overflow-x-auto">
          {['OVERVIEW', 'TERRAIN ANALYSIS', 'ROVER CONTROL', 'AI MODELS', 'LANDING RECOMMENDATION'].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Dynamic log
                  setNotifications(prev => [
                    {
                      id: Date.now().toString(),
                      time: new Date().toUTCString().slice(17, 25),
                      text: `NAV: Switching telemetry console viewport to [${tab}].`,
                      type: 'info'
                    },
                    ...prev
                  ]);
                }}
                className={`px-4 py-2 text-xs font-mono font-bold tracking-wider border-b-2 transition-all duration-300 whitespace-nowrap ${
                  isSelected
                    ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right side tab detail */}
        <div className="hidden lg:flex items-center space-x-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
            SYS STATUS: ACTIVE
          </span>
          <span className="text-slate-700">|</span>
          <span>LAT/LON RESOLUTION: 0.12M / PX</span>
        </div>
      </nav>

      {/* =========================================================================
          MAIN MULTI-SCREEN LAYOUT
          ========================================================================= */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative" id="main-dashboard-body">
        
        {/* VIEWPORT SWITCHER */}
        {activeTab !== 'LANDING RECOMMENDATION' ? (
          
          /* =========================================================================
             SCREEN 1: OPERATIONS OVERVIEW & TERRAIN PIPELINE
             ========================================================================= */
          <>
            {/* COLUMN 1: AI PIPELINE STATUS & CALIBRATION */}
            <aside className="w-full lg:w-80 border-r border-panel-border bg-slate-950/80 p-4 flex flex-col space-y-5 overflow-y-auto" id="left-sidebar-panel">
              
              {/* Header */}
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-panel-border/60 pb-1.5">
                  <span>AI PIPELINE STATUS</span>
                  <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
                </h2>
              </div>

              {/* DEM Loaded banner */}
              <div className="bg-slate-900 border border-panel-border p-3 rounded flex items-center justify-between relative overflow-hidden" id="dem-status-card">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-cyber-green glow-dot-green"></div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide" id="dem-state-label">DEM LOADED</h3>
                    <p className="text-[10px] text-slate-500 font-mono">FILE: T_TRANQ_82S_V3.RAW</p>
                  </div>
                </div>
                {/* Visual mini progress bars */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex space-x-0.5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 h-3 bg-cyber-cyan rounded-sm"></div>
                    ))}
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="w-1 h-3 bg-slate-800 rounded-sm"></div>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">0.03 MB</span>
                </div>
              </div>

              {/* Pipeline Step Progress Visualizer */}
              <div className="space-y-4" id="pipeline-status-indicators">
                {/* Step indicators with styled glowing levels */}
                {[
                  { name: 'ANALYSIS', level: 10, max: 10, color: 'bg-cyber-cyan', subText: 'PROGRESS: 100% | PROC_SENS_O', status: 'ACTIVE' },
                  { name: 'SLOPE', level: 9, max: 10, color: 'bg-cyber-blue', subText: 'SLOPE ANALYSIS COMPLETED', status: 'STABLE' },
                  { name: 'HAZARDS', level: 8, max: 10, color: 'bg-cyber-red', subText: '12 ACTIVE HAZARD GRIDS FLAGGED', status: 'WARNING' },
                  { name: 'LANDING', level: 7, max: 10, color: 'bg-cyber-green', subText: 'LANDING SCORE: 96% | OPTIMAL', status: 'RECOMMENDED' },
                  { name: 'PATH', level: 6, max: 10, color: 'bg-cyber-yellow', subText: 'A* PATH GENERATED | RE-COMPUTE', status: 'READY' },
                ].map((step, idx) => (
                  <div key={step.name} className="bg-slate-900/60 border border-panel-border/60 p-3 rounded hover:border-panel-border transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-slate-800 border border-panel-border text-slate-300 font-mono font-bold w-5 h-5 flex items-center justify-center rounded">
                          0{idx+1}
                        </span>
                        <span className="text-xs font-mono font-bold tracking-wider text-slate-200">{step.name}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        step.status === 'WARNING' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30' :
                        step.status === 'RECOMMENDED' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' :
                        'bg-slate-800 text-slate-300 border border-panel-border'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    {/* Progress grid segments */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 flex gap-[3px]">
                        {[...Array(step.max)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-2 rounded-sm transition-all duration-500 ${
                              i < step.level ? step.color : 'bg-slate-800'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-[9px] font-mono text-slate-400 mt-1.5 flex items-center justify-between">
                      <span>{step.subText}</span>
                      <span className="text-slate-600 font-bold">10-SEG HUD</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Dynamic Slope Threshold Slider */}
              <div className="bg-slate-900 border border-panel-border p-3.5 rounded space-y-2.5 shadow-md relative" id="card-slope-threshold">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
                    SLOPE THRESHOLD
                  </h3>
                  <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 border border-panel-border rounded">
                    <span className="text-xs font-mono font-bold text-cyber-cyan" id="slope-value">{slopeThreshold}°</span>
                    <div className="flex flex-col text-[8px] leading-none text-slate-400">
                      <button onClick={() => setSlopeThreshold(prev => Math.min(30, prev + 1))} className="hover:text-cyber-cyan">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => setSlopeThreshold(prev => Math.max(1, prev - 1))} className="hover:text-cyber-cyan">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={slopeThreshold}
                  onChange={(e) => setSlopeThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-cyber-cyan"
                  id="slider-slope"
                />
                
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>MIN: 5°</span>
                  <span className="text-slate-400">CRITICAL CUTOFF</span>
                  <span>MAX: 35°</span>
                </div>
              </div>

              {/* Dynamic Confidence Slider */}
              <div className="bg-slate-900 border border-panel-border p-3.5 rounded space-y-2.5 shadow-md" id="card-confidence-threshold">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
                    DETECTION CONFIDENCE
                  </h3>
                  <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 border border-panel-border rounded">
                    <span className="text-xs font-mono font-bold text-cyber-cyan" id="confidence-value">{confidenceLevel}%</span>
                    <div className="flex flex-col text-[8px] leading-none text-slate-400">
                      <button onClick={() => setConfidenceLevel(prev => Math.min(100, prev + 1))} className="hover:text-cyber-cyan">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => setConfidenceLevel(prev => Math.max(50, prev - 1))} className="hover:text-cyber-cyan">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="50"
                  max="100"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-cyber-cyan"
                  id="slider-confidence"
                />

                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>50% (SENSITIVE)</span>
                  <span>95% (DEFAULT)</span>
                  <span>100% (STRICT)</span>
                </div>
              </div>

              {/* Telemetry LED Status Grid */}
              <div className="bg-slate-950/60 border border-panel-border p-3.5 rounded" id="card-telemetry-leds">
                <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider mb-2.5 border-b border-panel-border/30 pb-1">
                  TELEMETRY SUBSYSTEMS
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'GPS STATUS', id: 'gps-status', desc: 'SATELLITES', status: 'LOCK 8/8', active: true },
                    { name: 'IMU STATUS', id: 'imu-status', desc: 'GYRO SENSORS', status: 'STABLE', active: true },
                    { name: 'POWER GRID', id: 'power', desc: '87% BATTERY', status: 'SOLAR AUX', active: true },
                    { name: 'S-BAND LINK', id: 'signal', desc: 'SIGNAL STRONG', status: '98% STRENGTH', active: true }
                  ].map((sys) => (
                    <div
                      key={sys.name}
                      className="bg-slate-900 border border-panel-border/80 rounded p-1.5 flex flex-col items-center justify-between text-center cursor-pointer hover:border-cyber-cyan transition-colors"
                      id={`telemetry-${sys.id}`}
                    >
                      <span className="text-[8px] font-mono font-bold text-slate-400 truncate w-full">{sys.name}</span>
                      
                      {/* LED Glow indicator */}
                      <div className="my-2 relative flex items-center justify-center">
                        <div className="w-3.5 h-3.5 bg-cyber-green rounded-full glow-dot-green border border-white/20"></div>
                        <div className="absolute w-5 h-5 bg-cyber-green/30 rounded-full animate-ping pointer-events-none"></div>
                      </div>

                      <span className="text-[7px] font-mono font-bold text-slate-500 truncate w-full uppercase">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>

            {/* COLUMN 2: MAIN CENTER MAP OVERLAYS */}
            <section className="flex-1 flex flex-col min-w-0 bg-slate-950 relative" id="center-map-column">
              
              {/* Map Controls Floating Header */}
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 bg-slate-950/90 border border-panel-border p-1.5 rounded shadow-lg backdrop-blur" id="floating-map-controls">
                <button
                  onClick={() => {
                    setMeasureMode(!measureMode);
                    setMeasurePoints([]);
                    setMeasuredDistance(null);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
                    measureMode
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'border-panel-border text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                  title="Distance Measuring Utility"
                  id="btn-measure"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{measureMode ? 'MEASURE: ON' : 'MEASURE'}</span>
                </button>
                
                <button
                  onClick={() => alert("Zooming in/out on terrain canvas...")}
                  className="p-1.5 border border-panel-border text-slate-300 hover:text-white hover:bg-slate-900 rounded"
                  title="Zoom In"
                  id="btn-zoom-in"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => alert("Zooming out...")}
                  className="p-1.5 border border-panel-border text-slate-300 hover:text-white hover:bg-slate-900 rounded"
                  title="Zoom Out"
                  id="btn-zoom-out"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowLayerMenu(!showLayerMenu)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 border border-panel-border text-slate-300 hover:text-white hover:bg-slate-900 rounded text-xs font-mono"
                    id="btn-layers-toggle"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>LAYERS</span>
                  </button>

                  {showLayerMenu && (
                    <div className="absolute top-full left-0 mt-1.5 bg-slate-950 border border-panel-border p-2.5 rounded shadow-xl w-48 space-y-2 z-30 font-mono text-xs text-slate-300">
                      <h4 className="font-bold border-b border-panel-border/50 pb-1 text-[10px] text-slate-500 uppercase">TOGGLE HUD LAYERS</h4>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={layers.terrain} onChange={() => setLayers({...layers, terrain: !layers.terrain})} className="accent-cyber-cyan" />
                        <span>Lunar Terrain RAW</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={layers.grid} onChange={() => setLayers({...layers, grid: !layers.grid})} className="accent-cyber-cyan" />
                        <span>Coordinate Grid HUD</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={layers.detections} onChange={() => setLayers({...layers, detections: !layers.detections})} className="accent-cyber-cyan" />
                        <span>AI Bounding Boxes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={layers.safeZone} onChange={() => setLayers({...layers, safeZone: !layers.safeZone})} className="accent-cyber-cyan" />
                        <span>Safe Landing Zones</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Compass Indicator */}
              <div className="absolute top-4 right-4 z-20 bg-slate-950/80 border border-panel-border p-2.5 rounded flex flex-col items-center justify-center text-center shadow-md backdrop-blur">
                <Compass className="w-6 h-6 text-cyber-cyan animate-spin-slow" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 mt-1">N</span>
              </div>

              {/* Measure Instructions overlay when active */}
              {measureMode && (
                <div className="absolute top-16 left-4 z-20 bg-cyber-cyan/10 border border-cyber-cyan p-2.5 rounded max-w-sm backdrop-blur text-xs text-slate-300">
                  <div className="flex items-center space-x-2 font-bold text-cyber-cyan mb-1">
                    <Ruler className="w-4 h-4" />
                    <span>PRECISION MEASUREMENT ACTIVE</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Click two separate points on the lunar map to measure the geographic distance in kilometers.
                  </p>
                  {measurePoints.length > 0 && (
                    <div className="mt-2 font-mono text-[10px] border-t border-cyber-cyan/30 pt-1.5 space-y-1">
                      <div>Point A: <span className="text-white">LAT {Math.round(measurePoints[0].y * 10) / 10}°N, LON {Math.round(measurePoints[0].x * 10) / 10}°E</span></div>
                      {measurePoints.length === 2 && (
                        <>
                          <div>Point B: <span className="text-white">LAT {Math.round(measurePoints[1].y * 10) / 10}°N, LON {Math.round(measurePoints[1].x * 10) / 10}°E</span></div>
                          <div className="font-bold text-cyber-green text-sm mt-1">Distance: {measuredDistance} km</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MAP DISPLAY FRAME */}
              <div
                className={`flex-1 relative overflow-hidden cursor-crosshair scanline-effect border-b border-panel-border ${
                  layers.terrain ? 'bg-slate-950' : 'bg-slate-900/40'
                }`}
                onClick={handleMapClick}
                id="landing-map"
              >
                {/* Background Moon Image */}
                {layers.terrain && (
                  <img
                    src="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=1200"
                    alt="Lunar Surface Mare Tranquillitatis"
                    className="w-full h-full object-cover opacity-60 mix-blend-lighten absolute top-0 left-0"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Coordinate Grid HUD Layer */}
                {layers.grid && (
                  <div className="absolute inset-0 pointer-events-none" id="grid-hud-overlay">
                    {/* SVG Grid lines */}
                    <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      {/* Symmetrical central target rings */}
                      <circle cx="50%" cy="50%" r="80" fill="none" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="5,5" />
                      <circle cx="50%" cy="50%" r="180" fill="none" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="3,8" />
                    </svg>

                    {/* Coordinates tickers on borders */}
                    <div className="absolute top-2 left-16 text-[9px] font-mono text-cyber-cyan/80 font-bold">+139.07°N</div>
                    <div className="absolute top-1/4 left-3 text-[9px] font-mono text-cyber-cyan/80 font-bold">+132.07°N</div>
                    <div className="absolute top-2/4 left-3 text-[9px] font-mono text-cyber-cyan/80 font-bold">+128.51°N</div>
                    <div className="absolute top-3/4 left-3 text-[9px] font-mono text-cyber-cyan/80 font-bold">+120.50°N</div>
                  </div>
                )}

                {/* Simulated AI Object Detections Bounding Boxes (YOLO & GIS Markers) */}
                {layers.detections && (
                  <div className="absolute inset-0 pointer-events-none" id="detections-overlay">
                    
                    {/* Rock Cluster 1 */}
                    <div className="absolute top-[22%] left-[62%] border border-cyber-cyan/80 p-1 flex flex-col justify-between" style={{ width: '100px', height: '65px' }}>
                      <div className="bg-cyber-cyan/15 text-cyber-cyan text-[7px] px-1 font-mono tracking-tight absolute -top-4 left-0 whitespace-nowrap border border-cyber-cyan/40">
                        ROCK CLUSTER [CONF. 92%]
                      </div>
                      <div className="w-full h-full flex items-center justify-center">
                        <Crosshair className="w-4 h-4 text-cyber-cyan/60 animate-spin-slow" />
                      </div>
                    </div>

                    {/* Rock Cluster 2 */}
                    <div className="absolute top-[38%] left-[68%] border border-cyber-cyan/80 p-1 flex flex-col" style={{ width: '80px', height: '40px' }}>
                      <div className="bg-cyber-cyan/15 text-cyber-cyan text-[7px] px-1 font-mono tracking-tight absolute -top-4 left-0 whitespace-nowrap border border-cyber-cyan/40">
                        ROCK CLUSTER [CONF. 92.5%]
                      </div>
                    </div>

                    {/* Crater Detected Center Large */}
                    <div className="absolute top-[35%] left-[38%] border border-cyber-cyan bg-slate-900/20 rounded shadow-2xl shadow-cyan-900/50" style={{ width: '140px', height: '140px' }}>
                      <div className="bg-cyber-cyan text-slate-950 text-[8px] px-1.5 py-0.5 font-mono font-bold absolute -top-5 left-0 whitespace-nowrap">
                        CRATER DETECTED (CONF. 98%)
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Crosshair className="w-8 h-8 text-cyber-cyan/50 animate-pulse" />
                      </div>
                    </div>

                    {/* Rock Cluster 3 */}
                    <div className="absolute top-[58%] left-[30%] border border-cyber-cyan/70 p-1" style={{ width: '65px', height: '50px' }}>
                      <div className="bg-cyber-cyan/10 text-cyber-cyan text-[7px] px-1 font-mono absolute -top-4 left-0 whitespace-nowrap border border-cyber-cyan/30">
                        ROCK FRAGS [CONF. 92%]
                      </div>
                    </div>

                    {/* Crater Detected Bottom Small */}
                    <div className="absolute top-[70%] left-[42%] border border-cyber-cyan/80" style={{ width: '55px', height: '55px' }}>
                      <div className="bg-cyber-cyan/15 text-cyber-cyan text-[7px] px-1 font-mono absolute -top-4 left-0 whitespace-nowrap border border-cyber-cyan/40">
                        CRATER DETECTED [CONF. 98%]
                      </div>
                    </div>

                  </div>
                )}

                {/* Safe Landing Zone Box */}
                {layers.safeZone && (
                  <div className="absolute top-[54%] left-[58%] border-2 border-cyber-green bg-cyber-green/5 p-1 relative flex flex-col items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.2)]" style={{ width: '130px', height: '90px' }} id="safe-landing-zone-overlay">
                    <div className="bg-cyber-green text-slate-950 text-[9px] px-2 py-0.5 font-mono font-bold tracking-wider absolute -top-5.5 left-0 uppercase">
                      SAFE LANDING ZONE (96.4%)
                    </div>
                    
                    <Crosshair className="w-8 h-8 text-cyber-green/80 animate-pulse" />
                    
                    <div className="absolute bottom-1 right-1 text-[8px] font-mono text-cyber-green font-semibold">
                      SITE ALPHA
                    </div>
                  </div>
                )}

                {/* Interactive Measure Points SVG Render */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {measurePoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={`${pt.x}%`}
                      cy={`${pt.y}%`}
                      r="6"
                      fill="#00f0ff"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}
                  {measurePoints.length === 2 && (
                    <line
                      x1={`${measurePoints[0].x}%`}
                      y1={`${measurePoints[0].y}%`}
                      x2={`${measurePoints[1].x}%`}
                      y2={`${measurePoints[1].y}%`}
                      stroke="#00f0ff"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                  )}
                </svg>

                {/* Static target overlay on center of map */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-cyber-cyan/10 rounded-full w-96 h-96 flex items-center justify-center">
                  <div className="border border-cyber-cyan/20 rounded-full w-48 h-48 flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyber-cyan rounded-full opacity-40"></div>
                  </div>
                </div>

              </div>

              {/* Coordinates Tick Bar at bottom of Map */}
              <div className="bg-slate-950 border-t border-panel-border/80 px-4 py-2 flex justify-between items-center overflow-x-auto" id="map-coordinates-bar">
                <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-400">
                  <span>SW BOUNDS: <span className="text-white font-bold">-132.351W</span></span>
                  <span>NW BOUNDS: <span className="text-white font-bold">+121.955E</span></span>
                  <span>CENTER LAT: <span className="text-white font-bold">+120.83W</span></span>
                  <span>CENTER LON: <span className="text-white font-bold">-120.78W</span></span>
                  <span>RE-CENTER: <span className="text-cyber-cyan cursor-pointer hover:underline" onClick={() => alert("Re-centering Map coordinates...")}>MAR-T01</span></span>
                </div>
                <div className="text-[10px] font-mono text-cyber-cyan font-bold whitespace-nowrap">
                  SCALE: 1:45,000 | DEM RESOLUTION: 0.12M
                </div>
              </div>

            </section>

            {/* COLUMN 3: MISSION INTELLIGENCE & POLAR RADAR */}
            <aside className="w-full lg:w-80 border-l border-panel-border bg-slate-950/80 p-4 flex flex-col space-y-4 overflow-y-auto" id="right-sidebar-panel">
              
              {/* Mission Intelligence parameters */}
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-panel-border/60 pb-1.5 mb-3">
                  <span>MISSION INTELLIGENCE</span>
                  <Info className="w-3.5 h-3.5 text-cyber-cyan" />
                </h2>

                <div className="space-y-2" id="mission-intelligence-metrics">
                  {[
                    { label: 'MISSION SCORE', val: '94.5 / 100', id: 'mission-score', color: 'text-cyber-green' },
                    { label: 'SAFE AREA %', val: '78.2%', id: 'landing-score', color: 'text-cyber-cyan' },
                    { label: 'MEAN ELEVATION', val: '-120m', id: 'mean-elevation', color: 'text-slate-200' },
                    { label: 'MAX SLOPE', val: `${activeSite.slope + 8}°`, id: 'max-slope', color: 'text-cyber-red' },
                    { label: 'TEMP PROFILES', val: '-40°C', id: 'temp-profile', color: 'text-cyber-blue' }
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-900 border border-panel-border/60 rounded px-3 py-2 flex items-center justify-between hover:border-panel-border transition-all">
                      <span className="text-[10px] font-mono text-slate-400">{item.label}:</span>
                      <span className={`text-xs font-mono font-bold ${item.color}`} id={item.id}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Surface Roughness Polar/Radar Chart */}
              <div className="bg-slate-900 border border-panel-border p-3 rounded" id="radar-chart-card">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 border-b border-panel-border/40 pb-1.5 mb-2 flex justify-between items-center">
                  <span>SURFACE ROUGHNESS</span>
                  <span className="text-[9px] text-cyber-cyan">REAL-TIME POLAR</span>
                </h3>

                <div className="flex justify-center my-1 relative">
                  {/* SVG Custom Radar chart */}
                  <svg width="190" height="190" viewBox="0 0 200 200" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.15)]">
                    {/* Concentric grid lines */}
                    <circle cx="100" cy="100" r="75" fill="none" stroke="#1a2a3e" strokeWidth="1" />
                    <circle cx="100" cy="100" r="55" fill="none" stroke="#1a2a3e" strokeWidth="1" />
                    <circle cx="100" cy="100" r="35" fill="none" stroke="#1a2a3e" strokeWidth="1" />
                    <circle cx="100" cy="100" r="15" fill="none" stroke="#1a2a3e" strokeWidth="1" />

                    {/* Radial axis lines */}
                    {[0, 60, 120, 180, 240, 300].map((angle) => {
                      const rad = (angle - 90) * (Math.PI / 180);
                      return (
                        <line
                          key={angle}
                          x1="100"
                          y1="100"
                          x2={100 + 75 * Math.cos(rad)}
                          y2={100 + 75 * Math.sin(rad)}
                          stroke="#1a2a3e"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Axis Labels */}
                    {[
                      { text: 'SLOPE', x: 100, y: 15 },
                      { text: 'ROCKS', x: 175, y: 55 },
                      { text: 'CRATERS', x: 175, y: 150 },
                      { text: 'SIGNAL', x: 100, y: 190 },
                      { text: 'POWER', x: 25, y: 150 },
                      { text: 'THERMAL', x: 20, y: 55 }
                    ].map((lbl, idx) => (
                      <text
                        key={idx}
                        x={lbl.x}
                        y={lbl.y}
                        fill="#64748b"
                        fontSize="7"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                        className="font-bold"
                      >
                        {lbl.text}
                      </text>
                    ))}

                    {/* Filled Radar Data Area */}
                    <polygon
                      points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(0, 240, 255, 0.25)"
                      stroke="#00f0ff"
                      strokeWidth="1.5"
                      className="transition-all duration-500"
                    />

                    {/* Interactive dots on vertices */}
                    {radarPoints.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#39ff14"
                        stroke="#00f0ff"
                        strokeWidth="1"
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                </div>

                <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider mt-2">
                  HUD POLYGON BOUND TO AI PREDICTION MARGINS
                </div>
              </div>

              {/* AI DECISION LOG */}
              <div className="flex-1 flex flex-col bg-slate-900 border border-panel-border rounded p-3 min-h-[160px] overflow-hidden" id="card-ai-decision-log">
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 border-b border-panel-border/40 pb-1.5 mb-2 flex justify-between items-center">
                  <span>AI DECISION LOG</span>
                  <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10px]" id="hazard-count">
                  <AnimatePresence initial={false}>
                    {notifications.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`p-2 rounded border border-transparent ${
                          log.type === 'success' ? 'bg-cyber-green/15 text-cyber-green border-cyber-green/30' :
                          log.type === 'warning' ? 'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/30' :
                          'bg-slate-950/80 text-slate-300 border-panel-border/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[8px] text-slate-500 mb-1">
                          <span className="font-bold uppercase">{log.type} LOG</span>
                          <span>{log.time}</span>
                        </div>
                        <p className="leading-relaxed">{log.text}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </aside>
          </>

        ) : (
          
          /* =========================================================================
             SCREEN 2: LANDING SITE RECOMMENDATION ENGINE (Default Selected Site)
             ========================================================================= */
          <>
            {/* COLUMN 1: OPERATIONS TIMELINE CONSOLE */}
            <aside className="w-full lg:w-80 border-r border-panel-border bg-slate-950/80 p-4 flex flex-col space-y-5 overflow-y-auto" id="left-sidebar-timeline">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-panel-border/60 pb-1.5">
                  <span>OPERATIONS CONSOLE</span>
                  <span className="text-[10px] bg-cyber-green/10 border border-cyber-green text-cyber-green px-1.5 py-0.2 rounded font-bold">
                    ACTIVE
                  </span>
                </h2>
              </div>

              {/* TIMELINE LIST */}
              <div className="relative pl-4 border-l-2 border-panel-border space-y-6 ml-2" id="timeline-flow-list">
                
                {/* Timeline Node 1 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyber-green border border-white"></div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500">STEP 1</span>
                    <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                      Data Ingestion
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
                    </h4>
                    <p className="text-[10px] text-slate-500">DEM mapping files uploaded and matched</p>
                  </div>
                </div>

                {/* Timeline Node 2 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyber-green border border-white"></div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500">STEP 2</span>
                    <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                      Terrain Mapping
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
                    </h4>
                    <p className="text-[10px] text-slate-500">Coordinate grids overlay and spatial contours</p>
                  </div>
                </div>

                {/* Timeline Node 3 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyber-green border border-white"></div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500">STEP 3</span>
                    <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                      Surface Analysis
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
                    </h4>
                    <p className="text-[10px] text-slate-500">Slopes clearance profiles calculated</p>
                  </div>
                </div>

                {/* Timeline Node 4 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyber-green border border-white"></div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500">STEP 4</span>
                    <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                      AI Models & Simulation
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
                    </h4>
                    <p className="text-[10px] text-slate-500">YOLOv11 neural rock cluster detectors run</p>
                  </div>
                </div>

                {/* Timeline Node 5 - Active state */}
                <div className="relative">
                  <div className="absolute -left-[25px] -top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyber-cyan flex items-center justify-center glow-cyan-active">
                    <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full"></span>
                  </div>
                  <div className="border border-cyber-cyan/50 bg-cyber-cyan/5 p-2 rounded">
                    <span className="text-[9px] font-mono text-cyber-cyan font-bold">CURRENT PROCESS STEP 5</span>
                    <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1">
                      Landing Recommendation
                    </h4>
                    <p className="text-[10px] text-slate-400">Verifying safe locations and orbital telemetry</p>
                  </div>
                </div>

                {/* Timeline Node 6 - Pending */}
                <div className="relative opacity-40">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-800 border border-panel-border"></div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500">STEP 6</span>
                    <h4 className="text-xs font-mono font-bold text-slate-400">Trajectory Planning</h4>
                    <p className="text-[10px] text-slate-500">Orbital calculations and fuel requirements</p>
                  </div>
                </div>

                {/* Timeline Node 7 - Pending */}
                <div className="relative opacity-40">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-800 border border-panel-border"></div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500">STEP 7</span>
                    <h4 className="text-xs font-mono font-bold text-slate-400">Mission Execution</h4>
                    <p className="text-[10px] text-slate-500">Onboard guidance delegation sequences</p>
                  </div>
                </div>

              </div>

              {/* Subsystem Health Grid */}
              <div className="bg-slate-900 border border-panel-border p-3.5 rounded space-y-2" id="subsystem-health-grid">
                <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1">
                  SYSTEM HEALTH INDEX
                </h4>
                <div className="space-y-1.5 text-xs font-mono" id="subsystem-list">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">CORE POWER GRID:</span>
                    <span className="text-cyber-green font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-cyber-green rounded-full glow-dot-green"></span> STABLE
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">S-BAND SATCOM:</span>
                    <span className="text-cyber-green font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-cyber-green rounded-full glow-dot-green"></span> ONLINE
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">AI DETECTOR ENGINE:</span>
                    <span className="text-cyber-green font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-cyber-green rounded-full glow-dot-green"></span> OPTIMAL
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLUMN 2: SITE RECOMMENDATION GEOGRAPHIC MAP */}
            <section className="flex-1 flex flex-col min-w-0 bg-slate-950 relative" id="center-map-column">
              
              {/* Floating Instructions Banner */}
              <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-panel-border p-2.5 rounded shadow-lg backdrop-blur text-xs max-w-xs" id="geographic-info">
                <h4 className="font-bold text-white mb-1 uppercase font-mono tracking-wider">GEOGRAPHIC RADAR</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Select a Site card in the right sidebar panel to center visual radar tracking sensors. Pulsing concentric circles locate safe relative coordinates.
                </p>
              </div>

              {/* MAP DISPLAY FRAME */}
              <div className="flex-1 relative overflow-hidden scanline-effect border-b border-panel-border bg-slate-950" id="landing-recommendation-map">
                {/* Background Moon Image */}
                <img
                  src="https://images.unsplash.com/photo-1447433589675-4adf569200c1?auto=format&fit=crop&q=80&w=1200"
                  alt="Lunar Geographic Terrain"
                  className="w-full h-full object-cover opacity-50 mix-blend-lighten absolute top-0 left-0"
                  referrerPolicy="no-referrer"
                />

                {/* S-Band targets overlay drawing */}
                <div className="absolute inset-0 pointer-events-none" id="radar-targets-layer">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Visual target lines connecting the sites */}
                    <line x1="35%" y1="40%" x2="65%" y2="30%" stroke="#1a2a3e" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="65%" y1="30%" x2="70%" y2="60%" stroke="#1a2a3e" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="70%" y1="60%" x2="55%" y2="82%" stroke="#1a2a3e" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="55%" y1="82%" x2="42%" y2="78%" stroke="#1a2a3e" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="42%" y1="78%" x2="35%" y2="40%" stroke="#1a2a3e" strokeWidth="1" strokeDasharray="3,3" />
                  </svg>

                  {/* Concentric targets loop */}
                  {landingSites.map((site) => {
                    const isSelected = activeSiteId === site.id;
                    return (
                      <div
                        key={site.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                        style={{ left: `${site.x}%`, top: `${site.y}%` }}
                        onClick={() => {
                          setActiveSiteId(site.id);
                          setNotifications(prev => [
                            {
                              id: Date.now().toString(),
                              time: new Date().toUTCString().slice(17, 25),
                              text: `NAV: Target locked on coordinates for ${site.name}.`,
                              type: 'info'
                            },
                            ...prev
                          ]);
                        }}
                      >
                        {/* Target rings */}
                        <div className="relative flex items-center justify-center">
                          <div className={`rounded-full absolute transition-all duration-500 ${
                            isSelected
                              ? 'w-16 h-16 border-2 border-cyber-cyan animate-ping bg-cyber-cyan/10'
                              : 'w-10 h-10 border border-cyber-blue/40 hover:border-cyber-cyan'
                          }`}></div>
                          
                          <div className={`rounded-full absolute transition-all duration-500 ${
                            isSelected
                              ? 'w-10 h-10 border border-cyber-cyan/80 animate-spin-slow'
                              : 'w-6 h-6 border border-cyber-blue/30'
                          }`}></div>

                          <div className={`rounded-full w-3.5 h-3.5 transition-all ${
                            isSelected ? 'bg-cyber-cyan scale-125' : 'bg-cyber-blue/80'
                          }`}></div>

                          {/* Site Name overlay label */}
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-panel-border px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap text-white">
                            {site.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Symmetrical geographic borders scale */}
                <div className="absolute bottom-4 left-4 z-20 bg-slate-950/80 border border-panel-border p-2 rounded text-[10px] font-mono text-slate-400" id="scale-bar">
                  <div className="flex items-center space-x-2">
                    <span>0</span>
                    <div className="w-24 h-1 bg-slate-800 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-cyber-cyan"></div>
                    </div>
                    <span>250 km</span>
                  </div>
                </div>

                {/* Grid coordinates indicator at bottom-center */}
                <div className="absolute bottom-4 right-4 z-20 bg-slate-950/80 border border-panel-border px-3 py-1 rounded text-[10px] font-mono text-white">
                  CENTER SITE: <span className="text-cyber-cyan font-bold">{activeSite.coordinates}</span>
                </div>

              </div>

              {/* Coordinates Tick Bar at bottom of Map */}
              <div className="bg-slate-950 border-t border-panel-border/80 px-4 py-2 flex justify-between items-center overflow-x-auto" id="map-coordinates-bar">
                <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-400">
                  <span>SW COORDINATES: <span className="text-white font-bold">24.2° N, 137.1° E</span></span>
                  <span>NE COORDINATES: <span className="text-white font-bold">26.5° N, 139.8° E</span></span>
                  <span>TARGET DRIFT: <span className="text-cyber-green font-bold">±0.04m</span></span>
                  <span>SATELLITE ORBIT: <span className="text-cyber-cyan font-bold">CHANDRAYAAN-HUD3</span></span>
                </div>
              </div>

            </section>

            {/* COLUMN 3: LANDING SITE COMPARISON PANELS */}
            <aside className="w-full lg:w-96 border-l border-panel-border bg-slate-950/80 p-4 flex flex-col space-y-4 overflow-y-auto" id="right-sidebar-comparison">
              
              {/* Summary recommendation box */}
              <div className="bg-slate-900 border border-cyber-cyan p-4 rounded space-y-2 shadow-lg shadow-cyan-950/20" id="recommendation-summary-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-cyan">
                    AI RECOMMENDATION SUMMARY
                  </h3>
                  <span className="text-[9px] bg-cyber-cyan text-slate-950 px-1.5 py-0.5 rounded font-mono font-bold">
                    RECOMMENDED
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-white tracking-wide">
                  OPTIMAL SITE SELECTED: <span className="text-cyber-green font-mono font-black" id="landing-score">SITE ALPHA</span>
                </h4>
                
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                  Based on complete multi-spectral DEM terrain clearance, Site Alpha is highly recommended due to exceptional safety index rating, minimal basalt rock distribution, and continuous direct-line-of-sight satellite communications back to Earth telemetry stations.
                </p>

                <div className="text-[9px] font-mono text-slate-500 border-t border-panel-border/40 pt-2 flex items-center justify-between">
                  <span>ANALYSIS COMPLETION TIME:</span>
                  <span className="text-white">2026-07-14 14:32:45 UTC</span>
                </div>
              </div>

              {/* Scrolling Card List for Sites */}
              <div className="flex-1 space-y-3 pr-1" id="sites-comparison-list">
                <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider mb-1 border-b border-panel-border/30 pb-1">
                  LANDING SITES PROFILE COMPARISON
                </h4>
                
                {landingSites.map((site) => {
                  const isSelected = activeSiteId === site.id;
                  
                  // Simple circle circumference variables for confidence SVG gauge
                  const radius = 18;
                  const strokeWidth = 3;
                  const circum = 2 * Math.PI * radius;
                  const strokeOffset = circum - (site.confidence / 100) * circum;

                  return (
                    <div
                      key={site.id}
                      onClick={() => {
                        setActiveSiteId(site.id);
                        setNotifications(prev => [
                          {
                            id: Date.now().toString(),
                            time: new Date().toUTCString().slice(17, 25),
                            text: `CONSOLE: Switched active analysis target to ${site.name}.`,
                            type: 'info'
                          },
                          ...prev
                        ]);
                      }}
                      className={`border p-3 rounded cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-cyber-cyan bg-cyber-cyan/5 shadow-md shadow-cyan-950/10'
                          : 'border-panel-border/60 bg-slate-900/60 hover:border-panel-border'
                      }`}
                      id={`site-card-${site.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className={`text-xs font-mono font-black ${isSelected ? 'text-cyber-cyan' : 'text-slate-300'}`}>
                            {site.name}
                          </h5>
                          <span className="text-[9px] font-mono text-slate-500">{site.coordinates}</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-slate-500">SAFETY:</span>
                          <span className="text-xs font-mono font-bold text-cyber-green block">{site.safetyScore} / 100</span>
                        </div>
                      </div>

                      {/* Detailed specifications horizontal grid */}
                      <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-panel-border/30 text-[10px] font-mono">
                        <div>
                          <span className="text-slate-500 block">SLOPE:</span>
                          <span className="text-white font-bold">{site.slope}°</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ROCKS:</span>
                          <span className="text-white font-bold">{site.rockDensity}/m²</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">HAZARD:</span>
                          <span className={`font-bold ${site.hazardProb === 'LOW' ? 'text-cyber-green' : 'text-cyber-yellow'}`}>
                            {site.hazardProb}
                          </span>
                        </div>
                      </div>

                      {/* Expandable details when selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-panel-border/50 space-y-3"
                        >
                          <p className="text-[10px] leading-relaxed text-slate-300 font-mono italic">
                            {site.description}
                          </p>

                          {/* Confidence circular gauge indicators */}
                          <div className="flex items-center justify-between bg-slate-950 border border-panel-border/80 p-2 rounded">
                            <div className="text-[10px] font-mono">
                              <span className="text-slate-500 block">AI CLASSIFICATION:</span>
                              <span className="text-white font-semibold">9-SEG RADAR CONFIDENCE</span>
                            </div>
                            
                            {/* SVG circular progress indicator */}
                            <div className="relative flex items-center justify-center">
                              <svg width="46" height="46" className="transform -rotate-90">
                                <circle
                                  cx="23"
                                  cy="23"
                                  r={radius}
                                  stroke="#1e293b"
                                  strokeWidth={strokeWidth}
                                  fill="transparent"
                                />
                                <circle
                                  cx="23"
                                  cy="23"
                                  r={radius}
                                  stroke="#00f0ff"
                                  strokeWidth={strokeWidth}
                                  fill="transparent"
                                  strokeDasharray={circum}
                                  strokeDashoffset={strokeOffset}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute text-[8px] font-mono font-bold text-white leading-none">
                                {site.confidence}%
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ACTION COMMAND BUTTON */}
              <button
                onClick={startLandingSequence}
                className="w-full bg-cyber-cyan text-slate-950 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all font-mono font-black text-xs py-3 rounded tracking-widest uppercase shadow-lg shadow-cyan-900/30 flex items-center justify-center space-x-2"
                id="btn-execute-landing"
              >
                <Crosshair className="w-4 h-4 animate-spin-slow" />
                <span>EXECUTE LANDING SEQUENCE</span>
              </button>

            </aside>
          </>

        )}

      </main>

      {/* =========================================================================
          FOOTER SYSTEM STATUS BAR
          ========================================================================= */}
      <footer className="border-t border-panel-border bg-slate-950 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-slate-400 z-40" id="main-footer">
        <div className="flex items-center space-x-6">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
            SYSTEM DIAGNOSTICS:
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            CPU: <span className="text-cyber-green font-bold">45%</span>
          </span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1.5 text-slate-200">
            GPU MAPPING: <span className="text-cyber-green font-bold">62%</span>
          </span>
          <span className="text-slate-800">|</span>
          <span className="flex items-center gap-1.5 text-slate-200">
            TELEMETRY LINK: <span className="text-cyber-green font-bold">98% (S-BAND)</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1 border border-panel-border/80 rounded">
            <Clock className="w-3.5 h-3.5 text-cyber-yellow" />
            <span>MISSION ELAPSED:</span>
            <span className="text-white font-bold" id="mission-timer">{formatElapsed(missionElapsed)}</span>
          </div>
          <span className="text-slate-800">|</span>
          <span>DSR CHANDRAYAAN-OPS-CENTER</span>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: DIGITAL ELEVATION MODEL (DEM) FILE UPLOADER
          ========================================================================= */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-panel-bg border border-cyber-cyan/50 p-6 rounded max-w-md w-full space-y-4 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 border-b border-panel-border/60 pb-3">
                <h3 className="text-sm font-display font-bold tracking-wider text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyber-cyan animate-pulse" />
                  LOAD DIGITAL ELEVATION MODEL (DEM)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Upload raw surface contour DEM files to re-compute optimal path calculations and YOLO classifications.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  const filenames = ['dem_mare_tranquillitatis_RAW.dem', 'dem_tycho_crater_GIS.raw', 'dem_imbrium_basin.bin'];
                  const picked = filenames[Math.floor(Math.random() * filenames.length)];
                  processMockUpload(picked);
                }}
                className={`border-2 border-dashed rounded p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyber-cyan bg-cyber-cyan/15 text-white scale-[1.01]'
                    : 'border-panel-border bg-slate-950/60 hover:border-cyber-cyan/60 hover:text-white'
                }`}
              >
                <Upload className="w-10 h-10 text-cyber-cyan/80 mb-3 animate-bounce" />
                <span className="text-xs font-mono font-semibold block mb-1">
                  Drag and drop DEM file here or <span className="text-cyber-cyan underline">click to select</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Supported extensions: .RAW, .DEM, .BIN (Max 50MB)
                </span>
              </div>

              {/* Progress Indicator */}
              {uploadProgress !== null && (
                <div className="space-y-2 bg-slate-950 p-3 rounded border border-panel-border">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>PROCESSING SPATIAL MATRIX...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                    <div
                      className="bg-cyber-cyan h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Warning Notice footer */}
              <div className="flex items-start space-x-2.5 bg-slate-950 border border-panel-border/80 p-3 rounded text-[10px] font-mono text-slate-400">
                <AlertTriangle className="w-4 h-4 text-cyber-yellow shrink-0" />
                <p className="leading-relaxed">
                  Notice: Ingesting high-density DEM meshes overrides active mission vectors. Confirm telemetry links before dispatch.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              {/* Close safety button */}
              <button
                onClick={() => setIsExecutingLanding(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
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

              {/* Step checklist indicators */}
              <div className="space-y-3 text-left bg-slate-950 border border-panel-border/85 p-4 rounded">
                {[
                  { title: 'TRANSMITTING SITE ALPHA TARGET', desc: `LAT: ${activeSite.coordinates}` },
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
                      {/* Left icon indicator */}
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

              {/* CTA trigger */}
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
