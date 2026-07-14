"""
mission_engine.py
Unified pipeline orchestrator for the Lunar Terrain Analysis system.

MissionEngine.run() executes the full processing chain in a single call:

    DEM file
      └─► read_dem         → elevation array + metadata
      └─► elevation_map    → elevation.png
      └─► slope_map        → slope array + slope.png
      └─► roughness_map    → roughness array + roughness.png
      └─► terrain_class.   → terrain.png
      └─► hazard_map       → DEM hazard array + hazard.png
    Image file (JPEG/PNG)
      └─► YOLO detector    → detection list
    Fusion
      └─► fusion_engine    → fused hazard array + fused_hazard.png
    Planning
      └─► landing_selector → ranked sites + landing_sites.png
      └─► path_planner     → rover waypoints

Returns a single JSON-serialisable dict.
"""
import os
import base64
import logging
from typing import Dict, Any, Optional

import numpy as np

# Terrain pipeline
from terrain.read_dem import read_dem
from terrain.elevation_map import generate_elevation_map
from terrain.slope_map import compute_slope, save_slope_map
from terrain.roughness_map import compute_roughness, save_roughness_map
from terrain.terrain_classification import classify_terrain, save_terrain_map, get_terrain_stats
from terrain.hazard_map import compute_hazard_score, save_hazard_map

# Object detection
from detection.detector import detect, get_hazard_summary

# Fusion
from fusion_engine import fuse_hazard_maps, generate_fused_hazard_png

# Planning
from planning.landing_selector import find_candidate_sites, save_landing_sites_map
from planning.path_planner import plan_path, select_goal, default_start

log = logging.getLogger(__name__)


# Paths relative to backend/ — can be overridden via constructor
_HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DEM_PATH     = os.path.join(_HERE, "data", "GeoTIFF.tif")
DEFAULT_WEIGHTS_PATH = os.path.join(_HERE, "..", "weights", "best.pt")
DEFAULT_OUTPUT_DIR   = os.path.join(_HERE, "..", "output")


class MissionEngine:
    """
    Orchestrates the full Lunar terrain analysis → safe landing → path planning pipeline.

    Args:
        dem_path:     Path to the GeoTIFF DEM file.
        weights_path: Path to the YOLO .pt model weights.
        output_dir:   Directory where all generated images are saved.
    """

    def __init__(
        self,
        dem_path: str = DEFAULT_DEM_PATH,
        weights_path: str = DEFAULT_WEIGHTS_PATH,
        output_dir: str = DEFAULT_OUTPUT_DIR,
    ):
        self.dem_path = dem_path
        self.weights_path = weights_path
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def run(self, image_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute the complete analysis pipeline.

        Args:
            image_path: Path to a terrain image for YOLO detection (optional).
                        If None or not found, the detection step is skipped and
                        only DEM-based analysis is performed.

        Returns:
            JSON-serialisable dict with keys:
                elevation, terrain_stats, maps (base64 PNGs),
                hazards, landing_sites, rover_path, summary
        """
        log.info("MissionEngine.run() — starting pipeline")

        # ── 1. Read DEM ──────────────────────────────────────────────
        log.info("Step 1: Reading DEM from %s", self.dem_path)
        elevation, profile = read_dem(self.dem_path)
        pixel_size = profile.get("res", (30.0, 30.0))   # (x_res, y_res)


        elev_stats = {
            "min": round(float(np.nanmin(elevation)), 2),
            "max": round(float(np.nanmax(elevation)), 2),
            "mean": round(float(np.nanmean(elevation)), 2),
            "std": round(float(np.nanstd(elevation)), 2),
            "shape": list(elevation.shape),
        }

        # ── 2. Elevation map ─────────────────────────────────────────
        log.info("Step 2: Generating elevation map")
        elev_png = generate_elevation_map(elevation, self.output_dir)

        # ── 3. Slope ─────────────────────────────────────────────────
        log.info("Step 3: Computing slope")
        slope_deg = compute_slope(elevation, pixel_size)
        slope_png = save_slope_map(slope_deg, self.output_dir)

        # ── 4. Roughness ─────────────────────────────────────────────
        log.info("Step 4: Computing roughness")
        roughness = compute_roughness(elevation)
        rough_png = save_roughness_map(roughness, self.output_dir)

        # ── 5. Terrain classification ────────────────────────────────
        log.info("Step 5: Classifying terrain")
        classified = classify_terrain(slope_deg)
        terrain_png = save_terrain_map(classified, self.output_dir)
        terrain_stats = get_terrain_stats(slope_deg)

        # ── 6. DEM hazard map ────────────────────────────────────────
        log.info("Step 6: Computing DEM hazard")
        dem_hazard = compute_hazard_score(slope_deg, roughness)
        hazard_png = save_hazard_map(dem_hazard, self.output_dir)

        # ── 7. YOLO object detection ─────────────────────────────────
        detections = []
        hazard_summary = {"total": 0, "craters": 0, "rocks": 0, "max_severity": "NONE"}

        if image_path and os.path.isfile(image_path) and os.path.isfile(self.weights_path):
            log.info("Step 7: Running YOLO detection on %s", image_path)
            try:
                import cv2
                img = cv2.imread(image_path)
                img_shape = img.shape if img is not None else (elevation.shape[0], elevation.shape[1], 3)
                detections = detect(image_path, self.weights_path)
                hazard_summary = get_hazard_summary(detections)
            except Exception as exc:
                log.warning("YOLO detection failed: %s — continuing without detections", exc)
                img_shape = (elevation.shape[0], elevation.shape[1], 3)
        else:
            log.info("Step 7: No image provided — skipping YOLO detection")
            img_shape = (elevation.shape[0], elevation.shape[1], 3)

        # ── 8. Fusion ─────────────────────────────────────────────────
        log.info("Step 8: Fusing DEM hazard with YOLO detections")
        fused_hazard = fuse_hazard_maps(dem_hazard, detections, img_shape)
        fused_png = generate_fused_hazard_png(fused_hazard, self.output_dir)

        # ── 9. Landing site recommendation ───────────────────────────
        log.info("Step 9: Selecting landing candidates")
        transform = profile.get("transform")
        sites = find_candidate_sites(fused_hazard, slope_deg, roughness, transform=transform)
        sites_png = save_landing_sites_map(fused_hazard, sites, self.output_dir)

        # ── 10. Rover path planning ───────────────────────────────────
        log.info("Step 10: Planning rover path")
        start_px = default_start(fused_hazard)
        goal_px  = select_goal(sites, fused_hazard)
        rover_path = plan_path(fused_hazard, start_px, goal_px, pixel_size_m=pixel_size)


        # ── 11. Assemble output ───────────────────────────────────────
        log.info("Step 11: Assembling results")

        maps_b64 = {
            "elevation":    _img_to_b64(elev_png),
            "slope":        _img_to_b64(slope_png),
            "roughness":    _img_to_b64(rough_png),
            "terrain":      _img_to_b64(terrain_png),
            "hazard":       _img_to_b64(hazard_png),
            "fused_hazard": _img_to_b64(fused_png),
            "landing_sites":_img_to_b64(sites_png),
        }

        best_site = sites[0] if sites else {}
        mission_score = best_site.get("safety_score", 0)

        result = {
            "elevation": elev_stats,
            "terrain_stats": terrain_stats,
            "maps": maps_b64,
            "hazards": detections,
            "hazard_summary": hazard_summary,
            "landing_sites": sites,
            "rover_path": rover_path,
            "summary": {
                "hazard_count": hazard_summary["total"],
                "crater_count": hazard_summary["craters"],
                "rock_count": hazard_summary["rocks"],
                "recommended_site": best_site.get("name", "UNKNOWN"),
                "recommended_coords": best_site.get("coordinates", "—"),
                "mission_score": mission_score,
                "pipeline_stages_completed": 10,
            },
        }

        log.info("MissionEngine.run() — complete ✓")
        return result


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _img_to_b64(path: str) -> str:
    """Read a PNG file and return a data-URI base64 string."""
    if not os.path.isfile(path):
        return ""
    with open(path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
