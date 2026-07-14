"""
detection/detector.py
YOLOv11 crater and rock detection wrapper.

The model is loaded lazily on first call to detect() so importing this module
does NOT trigger inference (the original detecter.py ran model.predict() at
import time, which caused side-effects and slow startup).

Class map (assumed from project context):
    0 → crater
    1 → rock
"""
import os
from typing import List, Dict, Any

# Class index → human-readable name
CLASS_NAMES: Dict[int, str] = {0: "crater", 1: "rock"}

# Severity thresholds based on detection confidence
SEVERITY_MAP = [
    (0.85, "CRITICAL"),
    (0.70, "HIGH"),
    (0.50, "MEDIUM"),
    (0.00, "LOW"),
]

_model = None   # lazy-loaded singleton


def _get_model(weights_path: str):
    """Load (or return cached) YOLO model."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO(weights_path, task="detect")
    return _model


def _confidence_to_severity(conf: float) -> str:
    for threshold, label in SEVERITY_MAP:
        if conf >= threshold:
            return label
    return "LOW"


def detect(image_path: str, weights_path: str, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
    """
    Run YOLOv11 inference on a single image and return structured detections.

    Args:
        image_path:    Path to the input image file.
        weights_path:  Path to the .pt model weights file.
        conf_threshold: Minimum confidence to include a detection.

    Returns:
        List of detection dicts, each with:
            - type:       'crater' or 'rock'
            - confidence: float in [0, 1]
            - bbox:       [x1, y1, x2, y2] in pixel coordinates
            - severity:   'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    """
    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    if not os.path.isfile(weights_path):
        raise FileNotFoundError(f"Weights not found: {weights_path}")

    model = _get_model(weights_path)
    results = model.predict(source=image_path, conf=conf_threshold, verbose=False)

    detections: List[Dict[str, Any]] = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            detections.append({
                "type": CLASS_NAMES.get(cls_id, f"class_{cls_id}"),
                "confidence": round(conf, 4),
                "bbox": [round(v, 1) for v in bbox],
                "severity": _confidence_to_severity(conf),
            })

    return detections


def get_hazard_summary(detections: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate detection results into a summary dict.

    Returns:
        dict with 'total', 'craters', 'rocks', 'max_severity'
    """
    craters = sum(1 for d in detections if d["type"] == "crater")
    rocks = sum(1 for d in detections if d["type"] == "rock")
    severities = [d["severity"] for d in detections]
    severity_order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    max_sev = max(severities, key=lambda s: severity_order.index(s)) if severities else "NONE"
    return {
        "total": len(detections),
        "craters": craters,
        "rocks": rocks,
        "max_severity": max_sev,
    }
