import rasterio
import matplotlib.pyplot as plt
import numpy as np
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
 
def read_dem(path):
    with rasterio.open(path) as src:
        elevation = src.read(1).astype(np.float32)   # band 1 = elevation values
        profile = src.profile
    return elevation, profile
 
if __name__ == "__main__":
    elevation, profile = read_dem(DEM_PATH)
 
    print(f"Width  : {elevation.shape[1]} pixels")
    print(f"Height : {elevation.shape[0]} pixels")
    print(f"Min elevation : {np.nanmin(elevation):.2f} m")
    print(f"Max elevation : {np.nanmax(elevation):.2f} m")
 
    plt.imshow(elevation, cmap="terrain")
    plt.title("Raw DEM Preview")
    plt.colorbar(label="Elevation (m)")
    plt.show()