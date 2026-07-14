# 🌙 Lunar AI — AI-Assisted Lunar Terrain Analysis & Safe Rover Navigation

> **Smart India Hackathon (SIH) Final Round Ready** — High-precision autonomous lunar landing site selection and safe rover navigation platform. Spatially fuses Digital Elevation Models (DEM) with real-time YOLOv11 crater/rock object detection.

---

## 🎯 Key Project Enhancements & Architectural Upgrades

This project has been modernized and optimized from a student prototype to a production-quality mission operations dashboard following NASA, ESA, and SpaceX minimal dark-theme HUD design principles.

### 1. Performance Optimization
* **~389x Faster Terrain Roughness**: Replaced slow pixel-by-pixel `scipy.ndimage.generic_filter` standard deviation loops with a vectorized rolling standard deviation using `scipy.ndimage.uniform_filter` ($\sigma = \sqrt{E[X^2] - (E[X])^2}$), reducing computation from 1.86s to 0.0048s.
* **Auto-Downsampling/Upsampling**: Big DEM datasets (> 2000px) are dynamically downsampled before computing roughness and upsampled afterwards, avoiding memory exhaustion.
* **Lazy-loaded AI Models**: YOLOv11 model weights are lazyloaded only upon incoming image uploads, saving massive startup memory overhead.

### 2. Explainable AI (XAI) & Landing Scoring
* **NASA Artemis Compliance Checklist**: Candidate landing zones are verified against Artemis HLS parameters (Slope < 8.0°).
* **Transparent Scoring Logic**: The 0–100 safety score integrates normalized slope (70% weight), roughness (30% weight), and YOLO object bounding boosts, with plain-language explanations returned by the API for every site.

---

## 🏗 Modular Folder Structure

```
d:\sipun\
├── backend/                       ← Flask API & Pipeline Package
│   ├── app.py                     ← REST API with CORS
│   ├── mission_engine.py          ← 10-step GIS + YOLO pipeline orchestrator
│   ├── fusion_engine.py           ← Image-space obstacle and DEM fusion
│   ├── terrain/                   ← Raster processing modules
│   │   ├── read_dem.py            ← Extracts pixel size spacing
│   │   ├── slope_map.py           ← Anisotropic gradient calculation
│   │   ├── roughness_map.py       ← Vectorized std dev mapping
│   │   └── ...
│   ├── planning/
│   │   ├── landing_selector.py    ← Artemis safety site selector
│   │   └── path_planner.py        ← Anisotropic A* pathfinder
│   ├── validation/
│   │   └── sanity_check.py        ← NASA safety compliance check script
│   └── requirements.txt
├── lunar-ops-ai/                  ← React Mission Control Frontend
│   ├── src/
│   │   ├── components/            ← Modular Dashboard Panels
│   │   │   ├── Home.tsx           ← Hero & Pipeline Stepper
│   │   │   ├── MissionUpload.tsx  ← Drag & Drop Ingestion
│   │   │   ├── TerrainPanel.tsx   ← Zoomable geomorphology maps
│   │   │   ├── HazardPanel.tsx    ← Dynamic layer overlays
│   │   │   ├── LandingPanel.tsx   ← Ranked cards & XAI checklist
│   │   │   ├── RoverPanel.tsx     ← Path telemetry & Animated movement
│   │   │   ├── MissionSummary.tsx ← Printable operations log
│   │   │   ├── Settings.tsx       ← Threshold calibrations
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── App.tsx                ← Shared State Orchestrator
│   │   └── index.css              ← Tactical grid animations & styling
```

---

## 🚀 Quick Start & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
*API runs at `http://127.0.0.1:5000`.*

### 2. Frontend Setup
```bash
cd lunar-ops-ai
npm install
npm run dev
```
*Vite Dev Server runs at `http://localhost:5173`.*

---

## 🌐 Flask API Specification

* **`POST /api/upload`**: Upload DEM files (`.tif`) or target imagery (`.jpg`, `.png`).
* **`POST /api/run-mission`**: Runs the pipeline and returns spatial map images in base64, ranked site coordinates with explanations, and A* waypoints.
* **`GET /api/status`**: Current pipeline status and last run summaries.
