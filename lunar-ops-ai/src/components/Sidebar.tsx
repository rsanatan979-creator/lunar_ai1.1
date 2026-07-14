import React from 'react';
import { 
  Home, 
  Upload, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Activity, 
  Sliders 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiData: any;
}

const MENU_ITEMS = [
  { id: 'HOME', label: 'HOME', icon: Home },
  { id: 'UPLOAD', label: 'MISSION UPLOAD', icon: Upload },
  { id: 'TERRAIN', label: 'TERRAIN ANALYSIS', icon: Compass },
  { id: 'HAZARDS', label: 'HAZARD ANALYSIS', icon: AlertTriangle },
  { id: 'LANDING', label: 'LANDING RECOMMENDATION', icon: CheckCircle2 },
  { id: 'ROVER', label: 'ROVER NAVIGATION', icon: Navigation },
  { id: 'SUMMARY', label: 'MISSION SUMMARY', icon: Activity },
  { id: 'SETTINGS', label: 'SETTINGS', icon: Sliders },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-full lg:w-64 border-r border-panel-border bg-slate-950/80 flex flex-col justify-between py-6" id="dashboard-sidebar">
      <div className="space-y-6">
        <div className="px-6">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">MISSION INTERFACE</div>
          <div className="text-xs text-cyber-cyan font-bold font-mono mt-1">TELEMETRY DECK</div>
        </div>

        <nav className="space-y-1 px-3">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyber-cyan/10 border-l-2 border-cyber-cyan text-cyber-cyan font-extrabold shadow-[0_0_10px_rgba(0,212,255,0.05)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border-l-2 border-transparent'
                }`}
                id={`sidebar-link-${item.id.toLowerCase()}`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyber-cyan' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-6 space-y-4">
        <div className="border-t border-panel-border/40 pt-4 text-[10px] text-slate-500 font-mono space-y-1.5">
          <div className="flex items-center justify-between">
            <span>GRID SYSTEM:</span>
            <span className="text-slate-300 font-bold">LROC LUNAR</span>
          </div>
          <div className="flex items-center justify-between">
            <span>YOLO CODES:</span>
            <span className="text-cyber-green font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between">
            <span>COMM LINK:</span>
            <span className="text-cyber-cyan font-bold">S-BAND STABLE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
