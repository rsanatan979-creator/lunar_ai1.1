
import matplotlib.pyplot as plt
import numpy as np
from read_dem import read_dem
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
OUTPUT_PATH = "../output/elevation.png"
 
def generate_elevation_map(elevation):
    plt.figure(figsize=(8, 8))
    plt.imshow(elevation, cmap="terrain")
    plt.colorbar(label="Elevation (m)")
    plt.title("Lunar Elevation Map")
    plt.axis("off")
    plt.savefig(OUTPUT_PATH, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Saved: {OUTPUT_PATH}")
 
if __name__ == "__main__":
    elevation, _ = read_dem(DEM_PATH)
    generate_elevation_map(elevation)