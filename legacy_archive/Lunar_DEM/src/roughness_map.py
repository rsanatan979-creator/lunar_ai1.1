import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import generic_filter
from read_dem import read_dem
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
OUTPUT_PATH = "../output/roughness.png"
 
def compute_roughness(elevation, window_size=3):
    def local_std(values):
        return np.std(values)
    roughness = generic_filter(elevation, local_std, size=window_size)
    return roughness
 
def save_roughness_map(roughness):
    plt.figure(figsize=(8, 8))
    plt.imshow(roughness, cmap="magma")
    plt.colorbar(label="Roughness (std. dev. of elevation)")
    plt.title("Lunar Roughness Map")
    plt.axis("off")
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Saved: {OUTPUT_PATH}")
 
if __name__ == "__main__":
    elevation, _ = read_dem(DEM_PATH)
    roughness = compute_roughness(elevation)
    save_roughness_map(roughness)