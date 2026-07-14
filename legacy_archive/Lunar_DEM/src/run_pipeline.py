from read_dem import read_dem
from elevation_map import generate_elevation_map
from slope_map import compute_slope, save_slope_map
from roughness_map import compute_roughness, save_roughness_map
from terrain_classification import classify_terrain, save_terrain_map
from hazard_map import compute_hazard_score, save_hazard_map
from landing_site_recommendation import find_candidate_sites, save_landing_sites_map
 
DEM_PATH = "../dataset/dem/GeoTIFF.tif"
 
def main():
    elevation, profile = read_dem(DEM_PATH)
    pixel_size = profile["transform"][0]
 
    generate_elevation_map(elevation)
 
    slope_deg = compute_slope(elevation, pixel_size)
    save_slope_map(slope_deg)
 
    roughness = compute_roughness(elevation)
    save_roughness_map(roughness)
 
    classified = classify_terrain(slope_deg)
    save_terrain_map(classified)
 
    hazard = compute_hazard_score(slope_deg, roughness)
    save_hazard_map(hazard)
 
    candidates = find_candidate_sites(hazard)
    print("\nTop candidate landing sites (row, col, hazard score):")
    for rank, (row, col, score) in enumerate(candidates, start=1):
        print(f"  #{rank}: pixel ({row}, {col})  hazard = {score:.3f}")
    save_landing_sites_map(hazard, candidates)
 
    print("\nPipeline complete. Check the output/ folder.")
 
if __name__ == "__main__":
    main()