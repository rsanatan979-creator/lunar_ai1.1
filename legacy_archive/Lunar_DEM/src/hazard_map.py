import numpy as np
import matplotlib.pyplot as plt
from read_dem import read_dem
from slope_map import compute_slope
from roughness_map import compute_roughness
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
OUTPUT_PATH = "../output/hazard_map.png"
 
def normalize(arr):
    """Scale any array to a 0-1 range so slope and roughness can be combined fairly."""
    arr_min, arr_max = np.nanmin(arr), np.nanmax(arr)
    if arr_max - arr_min == 0:
        return np.zeros_like(arr)
    return (arr - arr_min) / (arr_max - arr_min)
 
def compute_hazard_score(slope_deg, roughness, slope_weight=0.7, roughness_weight=0.3):
    """
    Combines slope and roughness into a single hazard score (0 = safest, 1 = most hazardous).
    slope_weight + roughness_weight should sum to 1.
    Slope is weighted higher by default since it's the primary landing risk factor.
    """
    norm_slope = normalize(slope_deg)
    norm_roughness = normalize(roughness)
    hazard = (slope_weight * norm_slope) + (roughness_weight * norm_roughness)
    return hazard
 
def save_hazard_map(hazard):
    plt.figure(figsize=(8, 8))
    plt.imshow(hazard, cmap="RdYlGn_r")  # red = hazardous, green = safe
    plt.colorbar(label="Hazard Score (0=safe, 1=hazardous)")
    plt.title("Combined Hazard Map (Slope + Roughness)")
    plt.axis("off")
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Saved: {OUTPUT_PATH}")
 
if __name__ == "__main__":
    elevation, profile = read_dem(DEM_PATH)
    pixel_size = profile["transform"][0]
 
    slope_deg = compute_slope(elevation, pixel_size)
    roughness = compute_roughness(elevation)
 
    hazard = compute_hazard_score(slope_deg, roughness)
    save_hazard_map(hazard)