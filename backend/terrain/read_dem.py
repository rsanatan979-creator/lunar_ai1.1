"""
terrain/read_dem.py
Reads a GeoTIFF Digital Elevation Model (DEM) file and returns the elevation
array plus its rasterio profile (metadata including transform and CRS).
"""
import numpy as np
import rasterio


def read_dem(path: str):
    """
    Open a GeoTIFF DEM file and return (elevation_array, profile).

    Args:
        path: Absolute or relative path to a GeoTIFF file.

    Returns:
        elevation: float32 numpy array of elevation values in metres.
        profile: rasterio profile dict (crs, transform, width, height, …).
    """
    with rasterio.open(path) as src:
        elevation = src.read(1).astype(np.float32)   # band 1 = elevation
        profile = src.profile
    return elevation, profile
