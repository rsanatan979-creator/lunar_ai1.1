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
        profile = dict(src.profile)
        
        # Extract pixel resolution from metadata
        try:
            x_res, y_res = src.res
        except Exception:
            x_res, y_res = None, None

        if x_res is None or y_res is None:
            transform = src.transform
            if transform is not None:
                x_res = abs(transform.a)
                y_res = abs(transform.e)
        
        if not x_res or not y_res:
            import warnings
            warnings.warn("Pixel resolution metadata missing from DEM. Falling back to default 30.0m.")
            x_res = x_res or 30.0
            y_res = y_res or 30.0
            
        profile["res"] = (float(x_res), float(y_res))
        
    return elevation, profile

