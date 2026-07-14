"""
planning/landing_selector.py
Finds the top-N safest landing candidate sites from a hazard map.

Algorithm:
  1. Smooth the hazard map with a sliding window average — so single safe pixels
     don't win; a lander needs a safe AREA, not just a safe point.
  2. Mask out the border (edge/corner artifacts from gradient estimation).
  3. Iteratively pick the global minimum, record it, then suppress the surrounding
     region so the next pick is spatially separate.
  4. Convert pixel (row, col) coordinates to approximate lat/lon using the DEM
     rasterio transform (if provided), or return pixel indices if no transform.
"""
import numpy as np
from scipy.ndimage import uniform_filter
from typing import List, Dict, Any, Optional, Tuple


# ── Tuning Parameters (Tuning per mission) ───────────────────────────────────
WINDOW_SIZE = 15    # pixels — approximates the lander footprint
TOP_N_SITES = 5     # number of candidate sites to return
EDGE_MARGIN = 10    # pixels to exclude at the DEM border

# Rover speed assumption for time estimate
ROVER_SPEED_M_PER_MIN = 10.0   # metres per minute

# ── Safety Score Weighting Formula & Documentation ───────────────────────────
# The safety score is a 0-100 integer representing landing suitability.
# Formula:
#   safety_score = clip_0_100( (1.0 - average_fused_hazard) * 100 )
#
# Inputs & Weighting:
#   1. Slope Angle: Accounts for 70% of the base DEM hazard score. Safe threshold < 5°, caution 5-15°, critical > 15°.
#   2. Terrain Roughness: Accounts for 30% of the base DEM hazard score. Calculated via local elevation standard deviation.
#   3. Obstacles (Crater/Rock): YOLOv11 detections boost local hazard scores. Craters add up to +0.55 hazard, rocks add up to +0.35.
#   4. Flatness Window Size: All hazard factors are smoothed over a 15x15 pixel footprint to match the physical lander scale.

def calculate_safety_score(windowed_hazard_score: float) -> int:
    """
    Inverts the fused hazard score (0 safe, 1 hazardous) into a 0-100 safety score.
    
    Args:
        windowed_hazard_score: The average hazard index [0, 1] over the lander footprint.
        
    Returns:
        safety_score: suitablity score from 0 (unsafe) to 100 (safest).
    """
    score = (1.0 - windowed_hazard_score) * 100
    return max(0, min(100, int(round(score))))


def find_candidate_sites(
    hazard: np.ndarray,
    slope_deg: np.ndarray,
    roughness: np.ndarray,
    transform=None,
    window_size: int = WINDOW_SIZE,
    top_n: int = TOP_N_SITES,
    edge_margin: int = EDGE_MARGIN,
) -> List[Dict[str, Any]]:
    """
    Locate the top-N safest landing candidate sites.

    Args:
        hazard:      2-D hazard array [0, 1].
        slope_deg:   2-D slope array (degrees) — used for per-site metadata.
        roughness:   2-D roughness array — used for per-site metadata.
        transform:   rasterio Affine transform for pixel→geo conversion (optional).
        window_size: Sliding window radius (pixels).
        top_n:       Number of sites to return.
        edge_margin: Border pixels to exclude.

    Returns:
        List of dicts ordered by rank (1 = best), each containing:
            rank, name, row, col, coordinates, safety_score, hazard_score,
            slope, roughness, hazard_level, safety_score_explanation
    """
    windowed = uniform_filter(hazard, size=window_size)

    working = windowed.copy()
    if edge_margin > 0:
        working[:edge_margin, :] = np.nan
        working[-edge_margin:, :] = np.nan
        working[:, :edge_margin] = np.nan
        working[:, -edge_margin:] = np.nan

    sites: List[Dict[str, Any]] = []

    for rank in range(1, top_n + 1):
        if np.all(np.isnan(working)):
            break
        min_idx = np.unravel_index(np.nanargmin(working), working.shape)
        row, col = int(min_idx[0]), int(min_idx[1])
        h_score = float(windowed[row, col])

        # Safety score via formalized formula
        safety_score = calculate_safety_score(h_score)

        # Per-site terrain metrics
        site_slope = float(np.nanmean(slope_deg[
            max(0, row - window_size // 2): row + window_size // 2,
            max(0, col - window_size // 2): col + window_size // 2,
        ]))
        site_roughness = float(np.nanmean(roughness[
            max(0, row - window_size // 2): row + window_size // 2,
            max(0, col - window_size // 2): col + window_size // 2,
        ]))

        # Hazard level label
        if h_score < 0.25:
            hazard_level = "LOW"
        elif h_score < 0.55:
            hazard_level = "MEDIUM"
        else:
            hazard_level = "HIGH"

        # Geographic coordinates
        coordinates = _pixel_to_coords(row, col, transform)

        # Plain language safety explanation for API consumer (frontend / README)
        explanation = (
            f"Safety score of {safety_score}% represents (1.0 - average hazard score of {h_score:.2f}) * 100. "
            f"Determined by local slope ({site_slope:.1f}°), roughness ({site_roughness:.4f}), and YOLO crater/rock detections."
        )

        # Human-readable site name
        site_names = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"]
        name = f"SITE {site_names[rank - 1]}" if rank <= len(site_names) else f"SITE-{rank}"

        sites.append({
            "rank": rank,
            "name": name,
            "row": row,
            "col": col,
            "coordinates": coordinates,
            "safety_score": safety_score,
            "hazard_score": round(h_score, 4),
            "slope": round(site_slope, 2),
            "roughness": round(site_roughness, 4),
            "hazard_level": hazard_level,
            "safety_score_explanation": explanation,
        })


        # Suppress the neighbourhood so next pick is spatially distinct
        r0 = max(0, row - window_size)
        r1 = min(working.shape[0], row + window_size)
        c0 = max(0, col - window_size)
        c1 = min(working.shape[1], col + window_size)
        working[r0:r1, c0:c1] = np.nan

    return sites


def save_landing_sites_map(
    hazard: np.ndarray,
    sites: List[Dict[str, Any]],
    output_dir: str,
) -> str:
    """
    Overlay candidate site markers on the hazard map and save a PNG.

    Returns:
        Absolute path to the saved PNG.
    """
    import os
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "landing_sites.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(hazard, cmap="RdYlGn_r")
    plt.colorbar(label="Hazard Score  (0 = safe,  1 = hazardous)")

    for site in sites:
        row, col = site["row"], site["col"]
        plt.scatter(col, row, s=160, edgecolor="black", facecolor="cyan", marker="*", zorder=5)
        plt.text(
            col + 4, row,
            f"#{site['rank']} {site['name']}\nScore:{site['safety_score']}",
            color="white", fontsize=8, zorder=6,
        )

    plt.title("Recommended Landing Sites  (lower hazard = higher safety score)")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _pixel_to_coords(row: int, col: int, transform) -> str:
    """Convert pixel (row, col) to a lat/lon string using rasterio transform."""
    if transform is None:
        return f"{row}px, {col}px"
    # rasterio Affine: x = col * transform.a + transform.c
    #                  y = row * transform.e + transform.f
    x = col * transform.a + transform.c
    y = row * transform.e + transform.f
    lat_dir = "N" if y >= 0 else "S"
    lon_dir = "E" if x >= 0 else "W"
    return f"{abs(y):.2f}° {lat_dir}, {abs(x):.2f}° {lon_dir}"
