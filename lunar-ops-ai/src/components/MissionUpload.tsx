import React, { useRef } from 'react';
import { Upload, FileCode2, Check, AlertCircle } from 'lucide-react';

interface MissionUploadProps {
  uploadedFile: string | null;
  uploadedImageFile: File | null;
  uploadedDemFile: File | null;
  uploadProgress: number | null;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
}

export default function MissionUpload({
  uploadedFile,
  uploadedImageFile,
  uploadedDemFile,
  uploadProgress,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect
}: MissionUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono select-none" id="upload-panel">
      <div className="border-b border-panel-border/40 pb-3">
        <h3 className="text-sm font-mono font-bold text-white tracking-wider">MISSION DATA INGESTION</h3>
        <p className="text-[10px] text-slate-500 mt-1">Ingest Digital Elevation Models (DEM) and optical imagery to calculate hazard bounds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={triggerSelect}
            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden min-h-[300px] ${
              isDragging
                ? 'border-cyber-cyan bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,212,255,0.15)] animate-pulse'
                : 'border-panel-border bg-slate-900/30 hover:border-cyber-cyan hover:bg-slate-900/40'
            }`}
            id="drag-drop-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              className="hidden"
              accept=".tif,.tiff,.geotiff,.jpg,.jpeg,.png,.bmp"
            />
            
            <div className="p-4 bg-slate-950/60 border border-panel-border rounded-full mb-4">
              <Upload className="w-8 h-8 text-cyber-cyan" />
            </div>

            <h4 className="text-xs font-bold text-white tracking-wide">
              {isDragging ? "DROP THE DATA FILE HERE" : "DRAG & DROP MISSION DATA FILE"}
            </h4>
            <p className="text-[10px] text-slate-500 mt-1.5 max-w-sm">
              Upload high-resolution DEM files (.tif, .geotiff) for terrain profiles, or optical maps (.jpg, .png) for crater object recognition.
            </p>

            {uploadProgress !== null && (
              <div className="absolute bottom-0 left-0 w-full bg-slate-950 border-t border-panel-border p-4 space-y-2 z-20">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-cyber-cyan">INGESTING DATA SOURCE...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1">
                  <div
                    className="bg-cyber-cyan h-1 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info & Validation Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-panel-border rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 border-b border-panel-border/30 pb-2 flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-cyber-cyan" />
              SUPPORTED SPECIFICATIONS
            </h4>

            <div className="space-y-3.5 text-[10px]">
              <div>
                <span className="text-slate-500 block">LUNAR ELEVATION DATA (DEM)</span>
                <span className="text-white font-bold">GeoTIFF Format (.tif, .tiff)</span>
                <p className="text-slate-500 text-[9px] mt-0.5">Raster mapping values in elevation meters relative to lunar reference datum.</p>
              </div>

              <div>
                <span className="text-slate-500 block">OPTICAL TERRAIN IMAGES</span>
                <span className="text-white font-bold">JPEG / PNG Format (.jpg, .png)</span>
                <p className="text-slate-500 text-[9px] mt-0.5">Auxiliary optical orbital snapshot of same region for YOLO crater detector.</p>
              </div>

              <div className="border-t border-panel-border/30 pt-3">
                <span className="text-slate-500 block">MAX SIZE THRESHOLD</span>
                <span className="text-white font-bold">40 MB (Auto downsamples above 2000px)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loaded Files status deck */}
      {(uploadedDemFile || uploadedImageFile || uploadedFile) && (
        <section className="bg-slate-950/60 border border-panel-border rounded-lg p-4 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">INGESTED DATA SOURCES</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedDemFile ? (
              <div className="bg-slate-900 border border-cyber-green/30 rounded p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyber-green/10 text-cyber-green p-1.5 rounded-lg border border-cyber-green/20">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold">DIGITAL ELEVATION MODEL (DEM)</span>
                    <span className="text-xs font-bold text-white">{uploadedDemFile.name}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-bold font-mono">
                  {(uploadedDemFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-panel-border/60 rounded p-3.5 flex items-center space-x-3 text-slate-500">
                <AlertCircle className="w-4 h-4 text-slate-600" />
                <div className="text-[10px]">NO CUSTOM DEM FILE INGESTED (USING FALLBACK GEOTIFF.TIF)</div>
              </div>
            )}

            {uploadedImageFile ? (
              <div className="bg-slate-900 border border-cyber-green/30 rounded p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyber-green/10 text-cyber-green p-1.5 rounded-lg border border-cyber-green/20">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold">OPTICAL IMAGERY (YOLO TARGET)</span>
                    <span className="text-xs font-bold text-white">{uploadedImageFile.name}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-bold font-mono">
                  {(uploadedImageFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-panel-border/60 rounded p-3.5 flex items-center space-x-3 text-slate-500">
                <AlertCircle className="w-4 h-4 text-slate-600" />
                <div className="text-[10px]">NO CUSTOM OPTICAL IMAGE INGESTED (USING DEFAULT REGOLITH IMAGE)</div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
