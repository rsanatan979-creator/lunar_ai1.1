import numpy as np
import matplotlib.pyplot as plt
from read_dem import read_dem
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
OUTPUT_PATH = "../output/slope.png"
 
def compute_slope(elevation, pixel_size=1.0):
    """
    Computes slope in degrees using the gradient of elevation.
    pixel_size = ground resolution of one pixel in meters (check your DEM metadata).
    """
    dy, dx = np.gradient(elevation, pixel_size)
    slope_rad = np.arctan(np.sqrt(dx**2 + dy**2))
    slope_deg = np.degrees(slope_rad)
    return slope_deg
 
def save_slope_map(slope_deg):
    plt.figure(figsize=(8, 8))
    plt.imshow(slope_deg, cmap="inferno")
    plt.colorbar(label="Slope (degrees)")
    plt.title("Lunar Slope Map")
    plt.axis("off")
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Saved: {OUTPUT_PATH}")
 
if __name__ == "__main__":
    elevation, profile = read_dem(DEM_PATH)
    pixel_size = profile["transform"][0]  # ground resolution from DEM metadata
    slope_deg = compute_slope(elevation, pixel_size)
    save_slope_map(slope_deg)