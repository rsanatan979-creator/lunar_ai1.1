"""
terrain/roughness_map.py
Computes terrain roughness as the local standard deviation of elevation
within a sliding window, then saves a PNG.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.ndimage import generic_filter


def compute_roughness(elevation: np.ndarray, window_size: int = 3) -> np.ndarray:
    """
    Compute roughness as local elevation standard deviation.

    Args:
        elevation: 2-D float32 elevation array.
        window_size: Size of the sliding window (pixels).

    Returns:
        roughness: 2-D float32 roughness array.
    """
    roughness = generic_filter(elevation, np.std, size=window_size)
    return roughness.astype(np.float32)


def save_roughness_map(roughness: np.ndarray, output_dir: str) -> str:
    """
    Save roughness map PNG and return its path.

    Args:
        roughness: 2-D roughness array.
        output_dir: Directory where the PNG will be written.

    Returns:
        Absolute path to the saved PNG.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "roughness.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(roughness, cmap="magma")
    plt.colorbar(label="Roughness (std. dev. of elevation)")
    plt.title("Lunar Roughness Map")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path
