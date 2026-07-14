"""
terrain/slope_map.py
Computes per-pixel slope (degrees) from an elevation array and saves a PNG.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def compute_slope(elevation: np.ndarray, pixel_size: float = 1.0) -> np.ndarray:
    """
    Compute slope in degrees using the gradient of the elevation surface.

    Args:
        elevation: 2-D float32 array of elevation values (metres).
        pixel_size: Ground resolution of one pixel in metres (from DEM metadata).

    Returns:
        slope_deg: 2-D float32 array of slope values in degrees.
    """
    dy, dx = np.gradient(elevation, pixel_size)
    slope_rad = np.arctan(np.sqrt(dx ** 2 + dy ** 2))
    slope_deg = np.degrees(slope_rad)
    return slope_deg.astype(np.float32)


def save_slope_map(slope_deg: np.ndarray, output_dir: str) -> str:
    """
    Render slope map to PNG and return its path.

    Args:
        slope_deg: 2-D slope array (degrees).
        output_dir: Directory where the PNG will be written.

    Returns:
        Absolute path to the saved PNG.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "slope.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(slope_deg, cmap="inferno")
    plt.colorbar(label="Slope (degrees)")
    plt.title("Lunar Slope Map")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path
