"""
terrain/elevation_map.py
Generates and saves an elevation visualisation from a DEM array.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")   # non-interactive backend — safe for servers
import matplotlib.pyplot as plt


def generate_elevation_map(elevation: np.ndarray, output_dir: str) -> str:
    """
    Render the elevation array as a colour-mapped PNG and save it.

    Args:
        elevation: 2-D float32 numpy array (metres).
        output_dir: Directory where the PNG will be written.

    Returns:
        Absolute path to the saved PNG file.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "elevation.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(elevation, cmap="terrain")
    plt.colorbar(label="Elevation (m)")
    plt.title("Lunar Elevation Map")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path
