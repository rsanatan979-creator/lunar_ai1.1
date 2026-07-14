"""
terrain/terrain_classification.py
Classifies each pixel into Safe / Caution / Unsafe based on slope angle
and saves a colour-coded RGB PNG.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


# Slope thresholds (degrees)
SAFE_MAX = 5.0      # < 5°  → Safe  (green)
CAUTION_MAX = 15.0  # 5–15° → Caution (yellow)
# > 15° → Unsafe (red)

CLASS_LABELS = {0: "Safe", 1: "Caution", 2: "Unsafe"}
CLASS_COLORS = {
    0: [0, 200, 0],     # green
    1: [255, 200, 0],   # yellow
    2: [200, 0, 0],     # red
}


def classify_terrain(slope_deg: np.ndarray) -> np.ndarray:
    """
    Map slope values to a 3-class terrain safety label array.

    Args:
        slope_deg: 2-D slope array in degrees.

    Returns:
        classified: (H, W, 3) uint8 RGB image where
                    green = safe, yellow = caution, red = unsafe.
    """
    h, w = slope_deg.shape
    classified = np.zeros((h, w, 3), dtype=np.uint8)

    classified[slope_deg < SAFE_MAX] = CLASS_COLORS[0]
    classified[(slope_deg >= SAFE_MAX) & (slope_deg <= CAUTION_MAX)] = CLASS_COLORS[1]
    classified[slope_deg > CAUTION_MAX] = CLASS_COLORS[2]

    return classified


def get_terrain_stats(slope_deg: np.ndarray) -> dict:
    """
    Return pixel-count statistics for each terrain class.

    Returns:
        dict with keys 'safe_pct', 'caution_pct', 'unsafe_pct'
    """
    total = slope_deg.size
    safe = int(np.sum(slope_deg < SAFE_MAX))
    caution = int(np.sum((slope_deg >= SAFE_MAX) & (slope_deg <= CAUTION_MAX)))
    unsafe = int(np.sum(slope_deg > CAUTION_MAX))
    return {
        "safe_pct": round(100 * safe / total, 1),
        "caution_pct": round(100 * caution / total, 1),
        "unsafe_pct": round(100 * unsafe / total, 1),
    }


def save_terrain_map(classified: np.ndarray, output_dir: str) -> str:
    """
    Save terrain classification map PNG and return its path.

    Args:
        classified: (H, W, 3) uint8 RGB array from classify_terrain().
        output_dir: Directory where the PNG will be written.

    Returns:
        Absolute path to the saved PNG.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "terrain.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(classified)
    plt.title("Terrain Classification  (Green=Safe | Yellow=Caution | Red=Unsafe)")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path
