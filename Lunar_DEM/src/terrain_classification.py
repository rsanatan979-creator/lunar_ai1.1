import numpy as np
import matplotlib.pyplot as plt
from read_dem import read_dem
from slope_map import compute_slope
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
OUTPUT_PATH = "../output/terrain.png"
 
def classify_terrain(slope_deg):
    """
    Returns an RGB image:
    Green = Safe (<5 deg)
    Yellow = Caution (5-15 deg)
    Red = Unsafe (>15 deg)
    """
    h, w = slope_deg.shape
    classified = np.zeros((h, w, 3), dtype=np.uint8)
 
    safe_mask = slope_deg < 5
    caution_mask = (slope_deg >= 5) & (slope_deg <= 15)
    unsafe_mask = slope_deg > 15
 
    classified[safe_mask]    = [0, 200, 0]     # green
    classified[caution_mask] = [255, 200, 0]   # yellow
    classified[unsafe_mask]  = [200, 0, 0]     # red
 
    return classified
 
def save_terrain_map(classified):
    plt.figure(figsize=(8, 8))
    plt.imshow(classified)
    plt.title("Terrain Classification (Green=Safe, Yellow=Caution, Red=Unsafe)")
    plt.axis("off")
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Saved: {OUTPUT_PATH}")
 
if __name__ == "__main__":
    elevation, profile = read_dem(DEM_PATH)
    pixel_size = profile["transform"][0]
    slope_deg = compute_slope(elevation, pixel_size)
    classified = classify_terrain(slope_deg)
    save_terrain_map(classified)