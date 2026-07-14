import React from 'react';
import { Moon } from 'lucide-react';

interface NavbarProps {
  utcTime: string;
  missionElapsed: number;
}

export default function Navbar({ utcTime }: NavbarProps) {
  return (
    <header className="border-b border-panel-border bg-slate-950/80 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-40" id="main-nav-header">
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-cyber-cyan/20 blur-md rounded-full w-9 h-9 animate-pulse"></div>
          <Moon className="w-8 h-8 text-cyber-cyan relative z-10" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-display font-black tracking-wider text-white">LUNAR OPS AI</h1>
            <span className="text-[9px] bg-cyber-red/20 border border-cyber-red/50 text-cyber-red px-1.5 py-0.5 rounded font-mono font-bold tracking-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyber-red rounded-full glow-dot-green"></span> LIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono" id="mission-id">
            MISSION ID: <span className="text-cyber-cyan font-bold">L-OPS-2026-X</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-xs font-mono bg-slate-900/60 border border-panel-border px-4 py-1.5 rounded" id="header-clocks">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-semibold">UTC CLOCK:</span>
          <span className="text-white tracking-widest font-bold" id="current-time">{utcTime}</span>
        </div>
        <div className="h-4 w-[1px] bg-panel-border"></div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-semibold">OPERATOR:</span>
          <span className="text-cyber-cyan font-semibold">SANATAN ROY</span>
        </div>
      </div>
    </header>
  );
}
