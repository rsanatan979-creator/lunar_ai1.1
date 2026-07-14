"""
fusion_engine.py
Fuses DEM-based hazard data with YOLO detection results into one unified
hazard map.

Strategy:
  - For each YOLO detection bounding box, boost the hazard score of the
    corresponding pixel region by a severity-weighted amount.
  - Crater detections receive a larger boost than rock detections (craters
    are harder to traverse).
  - The result is clipped to [0, 1] so downstream logic remains consistent.
"""
import numpy as np
from typing import List, Dict, Any


# Hazard boost magnitudes (added to existing DEM hazard values)
BOOST = {
    "crater": {
        "CRITICAL": 0.55,
        "HIGH":     0.40,
        "MEDIUM":   0.25,
        "LOW":      0.15,
    },
    "rock": {
        "CRITICAL": 0.35,
        "HIGH":     0.25,
        "MEDIUM":   0.15,
        "LOW":      0.08,
    },
}
DEFAULT_BOOST = 0.10    # fallback for unknown types


def fuse_hazard_maps(
    dem_hazard: np.ndarray,
    detections: List[Dict[str, Any]],
    image_shape: tuple,
) -> np.ndarray:
    """
    Combine DEM-based hazard with YOLO detections.

    The detection bounding boxes are expressed in image pixel coordinates.
    We scale them to the hazard map dimensions and apply the severity-weighted boost.

    Args:
        dem_hazard:   2-D float32 hazard array (from terrain pipeline) [0, 1].
        detections:   List of detection dicts from detection.detector.detect().
        image_shape:  (height, width) of the original image used for YOLO.

    Returns:
        fused_hazard: 2-D float32 array [0, 1] — same shape as dem_hazard.
    """
    fused = dem_hazard.copy().astype(np.float32)

    if not detections or dem_hazard.size == 0:
        return fused

    dem_h, dem_w = dem_hazard.shape
    img_h, img_w = image_shape[:2]

    # Scale factors: map image pixels → hazard map pixels
    scale_r = dem_h / img_h
    scale_c = dem_w / img_w

    for det in detections:
        obj_type = det.get("type", "rock")
        severity = det.get("severity", "LOW")
        bbox = det.get("bbox", [])

        if len(bbox) != 4:
            continue

        x1, y1, x2, y2 = bbox

        # Convert image coordinates → hazard map pixel coordinates
        r0 = max(0, int(y1 * scale_r))
        r1 = min(dem_h, int(y2 * scale_r) + 1)
        c0 = max(0, int(x1 * scale_c))
        c1 = min(dem_w, int(x2 * scale_c) + 1)

        if r1 <= r0 or c1 <= c0:
            continue

        boost_val = BOOST.get(obj_type, {}).get(severity, DEFAULT_BOOST)
        fused[r0:r1, c0:c1] += boost_val

    # Clip to valid range
    np.clip(fused, 0.0, 1.0, out=fused)
    return fused


def generate_fused_hazard_png(
    fused_hazard: np.ndarray, output_dir: str
) -> str:
    """
    Save the fused hazard map as a PNG and return its path.

    Args:
        fused_hazard: 2-D fused hazard array [0, 1].
        output_dir:   Directory where the PNG will be written.

    Returns:
        Absolute path to the saved PNG.
    """
    import os
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "fused_hazard.png")

    plt.figure(figsize=(8, 8))
    plt.imshow(fused_hazard, cmap="RdYlGn_r", vmin=0, vmax=1)
    plt.colorbar(label="Fused Hazard Score  (DEM + YOLO detections)")
    plt.title("Fused Hazard Map  (Terrain + AI Object Detection)")
    plt.axis("off")
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path
