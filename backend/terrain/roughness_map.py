"""
terrain/roughness_map.py
Computes terrain roughness as the local standard deviation of elevation
within a sliding window, then saves a PNG.
"""
import os
import logging
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.ndimage import uniform_filter

log = logging.getLogger(__name__)


def compute_roughness(elevation: np.ndarray, window_size: int = 3) -> np.ndarray:
    """
    Compute roughness as local elevation standard deviation.
    Vectorized via rolling variance formula for maximum speed.
    If the DEM is larger than 2000px, automatically downsamples for performance
    and upsamples the resulting roughness map back to the original size.

    Args:
        elevation: 2-D float32 elevation array.
        window_size: Size of the sliding window (pixels).

    Returns:
        roughness: 2-D float32 roughness array.
    """
    h, w = elevation.shape
    downsampled = False
    original_shape = (h, w)

    # 1. Automatic downsampling if DEM > 2000px
    if h > 2000 or w > 2000:
        log.info("DEM resolution (%dx%d) exceeds 2000px. Downsampling for performance.", w, h)
        scale = 1000.0 / max(h, w)
        try:
            import cv2
            elevation_proc = cv2.resize(elevation, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
        except ImportError:
            from scipy.ndimage import zoom
            elevation_proc = zoom(elevation, scale, order=1)
        downsampled = True
    else:
        elevation_proc = elevation

    # 2. Vectorized rolling window standard deviation: StdDev = sqrt( E[X^2] - (E[X])^2 )
    mean_x = uniform_filter(elevation_proc, size=window_size)
    mean_x2 = uniform_filter(elevation_proc ** 2, size=window_size)
    
    variance = mean_x2 - mean_x ** 2
    variance = np.clip(variance, 0.0, None)  # clip negative variances due to float precision
    roughness = np.sqrt(variance)

    # 3. Upsample back to original resolution if downsampled
    if downsampled:
        log.info("Upsampling roughness map back to original size (%dx%d).", original_shape[1], original_shape[0])
        try:
            import cv2
            roughness = cv2.resize(roughness, (original_shape[1], original_shape[0]), interpolation=cv2.INTER_LINEAR)
        except ImportError:
            from scipy.ndimage import zoom
            scale_h = original_shape[0] / roughness.shape[0]
            scale_w = original_shape[1] / roughness.shape[1]
            roughness = zoom(roughness, (scale_h, scale_w), order=1)

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
