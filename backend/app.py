"""
app.py  —  Lunar Ops AI  Flask REST API
=========================================
Endpoints
---------
GET  /api/              Health check
POST /api/upload        Upload DEM (.tif) or terrain image (.jpg/.png)
POST /api/run-mission   Execute full pipeline, return JSON results
GET  /api/status        Current system status
GET  /api/output/<fn>   Serve generated output images

CORS is enabled for the Vite dev server (localhost:5173) and any localhost origin.
"""

import os
import sys
import uuid
import logging
import tempfile
from pathlib import Path
from typing import Dict, Any

from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

# ── Ensure the backend package is on the Python path ─────────────────────────
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from mission_engine import MissionEngine

# ── Paths ─────────────────────────────────────────────────────────────────────
WEIGHTS_PATH = str(HERE.parent / "weights" / "best.pt")
DEFAULT_DEM  = str(HERE / "data" / "GeoTIFF.tif")
OUTPUT_DIR   = str(HERE.parent / "output")
UPLOAD_DIR   = str(HERE.parent / "uploads")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions
ALLOWED_DEM   = {".tif", ".tiff", ".geotiff"}
ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".bmp"}

# ── App setup ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
log = logging.getLogger("lunar-api")

app = Flask(__name__)

CORS(app, origins=[
    "http://localhost:5173",   # Vite default
    "http://localhost:3000",   # Create-React-App fallback
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
])

# Shared session state — simple in-memory store (reset on server restart)
_session: Dict[str, Any] = {
    "dem_path":   None,
    "image_path": None,
    "last_result": None,
    "status": "idle",         # idle | uploading | running | done | error
}


# ── Health check ──────────────────────────────────────────────────────────────
@app.route("/api/")
@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "version": "1.0.0",
        "weights_available": os.path.isfile(WEIGHTS_PATH),
        "dem_available": os.path.isfile(_session["dem_path"] or DEFAULT_DEM),
    })


# ── File upload ───────────────────────────────────────────────────────────────
@app.route("/api/upload", methods=["POST"])
def upload():
    """
    Accept a multipart upload of a DEM (.tif) or image (.jpg/.png).
    Returns the server-side path that can then be used in /api/run-mission.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    ext = Path(file.filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(UPLOAD_DIR, unique_name)

    if ext in ALLOWED_DEM:
        file.save(save_path)
        _session["dem_path"] = save_path
        file_type = "dem"
        log.info("DEM uploaded → %s", save_path)
    elif ext in ALLOWED_IMAGE:
        file.save(save_path)
        _session["image_path"] = save_path
        file_type = "image"
        log.info("Image uploaded → %s", save_path)
    else:
        return jsonify({"error": f"Unsupported file type: {ext}"}), 415

    return jsonify({
        "success": True,
        "file_type": file_type,
        "filename": unique_name,
        "message": f"{file_type.upper()} file uploaded successfully",
    })


# ── Run mission pipeline ───────────────────────────────────────────────────────
@app.route("/api/run-mission", methods=["POST"])
def run_mission():
    """
    Execute the full MissionEngine pipeline and return a structured JSON result.

    Request body (JSON, optional overrides):
        dem_path:   server path to a previously uploaded DEM
        image_path: server path to a previously uploaded image
    """
    body = request.get_json(silent=True) or {}

    dem_path   = body.get("dem_path")   or _session.get("dem_path")   or DEFAULT_DEM
    image_path = body.get("image_path") or _session.get("image_path")

    if not os.path.isfile(dem_path):
        return jsonify({
            "error": f"DEM file not found: {dem_path}. Please upload a GeoTIFF first."
        }), 404

    _session["status"] = "running"
    log.info("run-mission → dem=%s  image=%s", dem_path, image_path)

    try:
        engine = MissionEngine(
            dem_path=dem_path,
            weights_path=WEIGHTS_PATH,
            output_dir=OUTPUT_DIR,
        )
        result = engine.run(image_path=image_path)
        _session["last_result"] = result
        _session["status"] = "done"
        log.info("run-mission complete — %d hazards, %d sites",
                 result["hazard_summary"]["total"],
                 len(result["landing_sites"]))
        return jsonify(result)

    except Exception as exc:
        _session["status"] = "error"
        log.exception("Pipeline failed: %s", exc)
        return jsonify({"error": str(exc)}), 500


# ── Status ────────────────────────────────────────────────────────────────────
@app.route("/api/status")
def status():
    last = _session.get("last_result")
    return jsonify({
        "pipeline_status": _session["status"],
        "dem_loaded":   bool(_session.get("dem_path")),
        "image_loaded": bool(_session.get("image_path")),
        "last_mission_score": last["summary"]["mission_score"] if last else None,
        "last_hazard_count":  last["summary"]["hazard_count"]  if last else None,
    })


# ── Serve output images ────────────────────────────────────────────────────────
@app.route("/api/output/<path:filename>")
def serve_output(filename):
    """Serve generated PNG files from the output directory."""
    safe_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.isfile(safe_path):
        abort(404)
    return send_from_directory(OUTPUT_DIR, filename)


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("Starting Lunar Ops API on http://127.0.0.1:5000")
    log.info("  DEM default : %s  (exists=%s)", DEFAULT_DEM, os.path.isfile(DEFAULT_DEM))
    log.info("  Weights     : %s  (exists=%s)", WEIGHTS_PATH, os.path.isfile(WEIGHTS_PATH))
    app.run(host="127.0.0.1", port=5000, debug=True)
