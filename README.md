# 🌙 Lunar AI — AI-Assisted Lunar Terrain Analysis & Safe Rover Navigation

> **Hackathon Project** — AI-powered system for autonomous lunar landing site selection and rover path planning using DEM analysis, YOLO object detection, and A* path planning.

---

## 🎯 Project Overview

This system ingests a lunar Digital Elevation Model (DEM) GeoTIFF, fuses it with real-time YOLO crater/rock detection, and produces:

- **5 ranked landing site recommendations** (scored 0–100)
- **A* minimum-hazard rover path** between a start point and the best landing site
- **6 terrain analysis maps** (elevation, slope, roughness, terrain classification, DEM hazard, fused hazard)
- A **Mission Control dashboard** visualizing all of the above in real-time

---

## 🏗 Architecture

```
d:\sipun\
├── backend/                   Flask REST API + ML Pipeline
│   ├── app.py                 Flask server with CORS
│   ├── mission_engine.py      Unified 10-step pipeline orchestrator
│   ├── fusion_engine.py       DEM hazard + YOLO detection fusion
│   ├── terrain/               DEM processing modules
│   │   ├── read_dem.py
│   │   ├── elevation_map.py
│   │   ├── slope_map.py
│   │   ├── roughness_map.py
│   │   ├── terrain_classification.py
│   │   └── hazard_map.py
│   ├── detection/
│   │   └── detector.py        YOLOv11 crater/rock detector (lazy-loaded)
│   ├── planning/
│   │   ├── landing_selector.py  Windowed hazard site picker
│   │   └── path_planner.py      A* rover path planner
│   ├── data/
│   │   └── GeoTIFF.tif        Lunar DEM (LROC data)
│   └── requirements.txt
├── lunar-ops-ai/              React + Vite + TypeScript frontend
│   ├── src/App.tsx            Mission Control dashboard (1800+ lines)
│   └── src/index.css          NASA-style UI theme
├── weights/
│   ├── best.pt                YOLOv11 trained weights
│   └── last.pt
└── Lunar_DEM/                 Original DEM pipeline scripts (reference)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

The Flask API will start at `http://127.0.0.1:5000`.

### 2. Frontend Setup

```bash
cd lunar-ops-ai
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

### 3. Run a Mission

1. Open `http://localhost:5173`
2. Click **UPLOAD DEM** → drag a `.tif` DEM file or terrain image
3. Click **RUN AI PIPELINE**
4. All 6 terrain map tabs will populate with real data

---

## 🧠 Pipeline Stages

| Step | Module | Output |
|------|--------|--------|
| 1 | `read_dem.py` | Elevation array + metadata |
| 2 | `elevation_map.py` | `elevation.png` |
| 3 | `slope_map.py` | Slope array + `slope.png` |
| 4 | `roughness_map.py` | Roughness array + `roughness.png` |
| 5 | `terrain_classification.py` | RGB terrain map + `terrain.png` |
| 6 | `hazard_map.py` | DEM hazard array + `hazard.png` |
| 7 | `detector.py` | YOLO crater/rock detections |
| 8 | `fusion_engine.py` | Fused hazard array + `fused_hazard.png` |
| 9 | `landing_selector.py` | 5 ranked sites + `landing_sites.png` |
| 10 | `path_planner.py` | A* waypoints + distance/time estimates |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | Health check |
| `POST` | `/api/upload` | Upload DEM (`.tif`) or image (`.jpg/.png`) |
| `POST` | `/api/run-mission` | Execute full pipeline, return JSON + base64 maps |
| `GET` | `/api/status` | Pipeline status + last mission summary |
| `GET` | `/api/output/<filename>` | Serve generated PNG files |

### Example: Run Mission

```bash
# Upload an image
curl -X POST http://localhost:5000/api/upload -F "file=@test.jpeg"

# Run pipeline (uses default DEM + uploaded image)
curl -X POST http://localhost:5000/api/run-mission \
  -H "Content-Type: application/json" \
  -d "{}"
```

Response includes:
- `maps` — base64-encoded PNGs for all 6 analysis layers
- `landing_sites` — 5 ranked candidates with coordinates and safety scores
- `rover_path` — A* waypoints, distance in metres, estimated travel time
- `hazard_summary` — crater/rock counts and severity
- `summary` — overall mission score

---

## 🖥 Dashboard Tabs

| Tab | Content |
|-----|---------|
| **OVERVIEW** | Live hazard map, pipeline status, telemetry |
| **TERRAIN ANALYSIS** | Operations timeline, geographic radar |
| **ROVER CONTROL** | Path waypoints, drive telemetry |
| **AI MODELS** | YOLO detection results, confidence scores |
| **LANDING RECOMMENDATION** | Ranked sites radar chart, site selector |

---

## ⚠️ Known Limitations

- The GeoTIFF DEM must be a single-band raster (band 1 = elevation metres)
- YOLO detection requires an image file — if none is uploaded, pipeline runs DEM-only
- Path planning uses a 30 m/pixel assumption; update `PIXEL_SIZE_M` in `path_planner.py` for your DEM resolution
- `roughness_map` with `generic_filter` is slow on large DEMs; consider downsampling for DEMs > 2000×2000 px

---

## 👥 Team

- **Sanatan Roy** — ML Pipeline, YOLO Training, Backend
- Mission Control UI — Frontend Architecture

---

## 📄 License

MIT — Open for hackathon evaluation and educational use.
