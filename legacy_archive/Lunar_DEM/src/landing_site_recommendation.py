import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import uniform_filter
from read_dem import read_dem
from slope_map import compute_slope
from roughness_map import compute_roughness
from hazard_map import compute_hazard_score
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
OUTPUT_PATH = "../output/landing_sites.png"
 
# A landing site needs a minimum flat, safe AREA -- not just one safe pixel --
# since a lander has physical size. This window size approximates that footprint.
WINDOW_SIZE = 15      # pixels; increase for larger landers / coarser DEMs
TOP_N_SITES = 5        # how many candidate sites to recommend
EDGE_MARGIN = 10       # pixels to exclude from the border (avoids edge/corner artifacts)
 
def find_candidate_sites(hazard, window_size=WINDOW_SIZE, top_n=TOP_N_SITES, edge_margin=EDGE_MARGIN):
    """
    Averages hazard over a local window (so isolated 1-pixel dips don't get
    picked), then finds the top_n lowest-hazard non-overlapping regions.
 
    Excludes a border margin around the DEM edges: slope (np.gradient) and
    roughness (windowed filter) are both less reliable at the boundary since
    there aren't full neighbors to compare against, which can make edge/corner
    pixels look artificially "safe." Real candidate sites should come from the
    interior of the DEM, not the edges.
    """
    # Average hazard within a window centered on each pixel
    windowed_hazard = uniform_filter(hazard, size=window_size)
 
    # Mask out the border so edge/corner artifacts can never be picked
    working = windowed_hazard.copy()
    if edge_margin > 0:
        working[:edge_margin, :] = np.nan
        working[-edge_margin:, :] = np.nan
        working[:, :edge_margin] = np.nan
        working[:, -edge_margin:] = np.nan
 
    candidates = []
 
    for _ in range(top_n):
        min_idx = np.unravel_index(np.nanargmin(working), working.shape)
        row, col = min_idx
        score = windowed_hazard[row, col]
        candidates.append((row, col, score))
 
        # Suppress the area around this site so the next pick is a different region
        r0, r1 = max(0, row - window_size), row + window_size
        c0, c1 = max(0, col - window_size), col + window_size
        working[r0:r1, c0:c1] = np.nan
 
    return candidates
 
def save_landing_sites_map(hazard, candidates):
    plt.figure(figsize=(8, 8))
    plt.imshow(hazard, cmap="RdYlGn_r")
    plt.colorbar(label="Hazard Score (0=safe, 1=hazardous)")
 
    for rank, (row, col, score) in enumerate(candidates, start=1):
        plt.scatter(col, row, s=120, edgecolor="black", facecolor="cyan", marker="*")
        plt.text(col + 3, row, f"#{rank} ({score:.2f})", color="white", fontsize=9)
 
    plt.title("Recommended Landing Sites (lower score = safer)")
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
 
    candidates = find_candidate_sites(hazard)
 
    print("\nTop candidate landing sites (row, col, hazard score):")
    for rank, (row, col, score) in enumerate(candidates, start=1):
        print(f"  #{rank}: pixel ({row}, {col})  hazard = {score:.3f}")
 
    save_landing_sites_map(hazard, candidates)