"""
terrain/hazard_map.py  (canonical version)
Combines normalised slope and roughness into a single hazard score
in the range [0, 1]  where 0 = completely safe and 1 = maximally hazardous.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def _normalize(arr: np.ndarray) -> np.ndarray:
    """Scale any 2-D array to [0, 1], returning zeros for flat arrays."""
    arr_min, arr_max = np.nanmin(arr), np.nanmax(arr)
    if arr_max - arr_min == 0:
        return np.zeros_like(arr)
    return (arr - arr_min) / (arr_max - arr_min)


def compute_hazard_score(
    slope_deg: np.ndarray,
    roughness: np.ndarray,
    slope_weight: float = 0.7,
    roughness_weight: float = 0.3,
) -> np.ndarray:
    """
    Combine slope and roughness into a single hazard score.

    Args:
        slope_deg:        2-D slope array (degrees).
        roughness:        2-D roughness array.
        slope_weight:     Contribution of slope (default 0.7).
        roughness_weight: Contribution of roughness (default 0.3).

    Returns:
        hazard: 2-D float32 array in [0, 1] — 0 = safest, 1 = most hazardous.
    """
    norm_slope = _normalize(slope_deg)
    norm_roughness = _normalize(roughness)
    hazard = (slope_weight * norm_slope) + (roughness_weight * norm_roughness)
    return hazard.astype(np.float32)


def save_hazard_map(hazard: np.ndarray, output_dir: str) -> str:
    """
    Save hazard map PNG (red = hazardous, green = safe) and return its path.

    Args:
        hazard:     2-D hazard array.
        output_dir: Directory where the PNG will be written.

    Returns:
        Absolute path to the saved PNG.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "hazard.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(hazard, cmap="RdYlGn_r")
    plt.colorbar(label="Hazard Score  (0 = safe,  1 = hazardous)")
    plt.title("Combined Hazard Map  (Slope + Roughness)")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path
