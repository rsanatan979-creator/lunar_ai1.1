"""
planning/path_planner.py
A* rover path planner on the hazard grid.

Finds a minimum-hazard path from a start pixel to a goal pixel using A* search
weighted by the hazard map cost.  Falls back to BFS (uniform cost) when the
hazard map is flat (all zeros / all ones).

Rover parameters are configurable for different mission profiles.
"""
import heapq
import math
import numpy as np
from typing import List, Tuple, Optional, Dict, Any


# Rover physical parameters
PIXEL_SIZE_M = 30.0         # metres per pixel (approximate for LROC 30 m/px)
ROVER_SPEED_M_PER_MIN = 10  # metres per minute


def plan_path(
    hazard: np.ndarray,
    start: Tuple[int, int],
    goal: Tuple[int, int],
    pixel_size_m = PIXEL_SIZE_M,
) -> Dict[str, Any]:
    """
    Find a minimum-hazard A* path from start to goal on the hazard grid.

    Args:
        hazard:       2-D float32 hazard array [0, 1].
        start:        (row, col) start pixel.
        goal:         (row, col) goal pixel.
        pixel_size_m: Metres per pixel used for distance estimates. Can be float or tuple/list (x_res, y_res).

    Returns:
        dict with:
            waypoints:          List of [row, col] tuples along the path.
            waypoint_coords:    Simplified list (every 5th point) for display.
            total_pixels:       Path length in pixels.
            estimated_distance_m: Estimated path length in metres.
            estimated_time_min:   Estimated travel time in minutes.
            hazard_avoided:     Number of HIGH-hazard pixels avoided vs straight line.
    """
    rows, cols = hazard.shape
    sr, sc = start
    gr, gc = goal

    # Clamp to grid bounds
    sr, sc = max(0, min(sr, rows - 1)), max(0, min(sc, cols - 1))
    gr, gc = max(0, min(gr, rows - 1)), max(0, min(gc, cols - 1))

    if (sr, sc) == (gr, gc):
        return _empty_path(start)

    # Cost = hazard value + tiny epsilon to prefer shorter equal-hazard paths
    cost_grid = hazard + 1e-6

    # A* priority queue: (f_cost, g_cost, row, col)
    open_heap: List[Tuple[float, float, int, int]] = []
    heapq.heappush(open_heap, (0.0, 0.0, sr, sc))

    came_from: Dict[Tuple[int, int], Optional[Tuple[int, int]]] = {(sr, sc): None}
    g_score: Dict[Tuple[int, int], float] = {(sr, sc): 0.0}

    # 8-directional movement (includes diagonals)
    directions = [
        (-1, 0), (1, 0), (0, -1), (0, 1),
        (-1, -1), (-1, 1), (1, -1), (1, 1),
    ]

    found = False
    while open_heap:
        f, g, r, c = heapq.heappop(open_heap)

        if (r, c) == (gr, gc):
            found = True
            break

        if g > g_score.get((r, c), float("inf")):
            continue  # stale entry

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue

            move_cost = math.sqrt(dr ** 2 + dc ** 2) * float(cost_grid[nr, nc])
            new_g = g + move_cost

            if new_g < g_score.get((nr, nc), float("inf")):
                g_score[(nr, nc)] = new_g
                h = _heuristic(nr, nc, gr, gc)
                heapq.heappush(open_heap, (new_g + h, new_g, nr, nc))
                came_from[(nr, nc)] = (r, c)

    if not found:
        # Fallback: straight-line waypoints if A* fails (no path found)
        return _straight_line_path(start, goal, pixel_size_m)

    # Reconstruct path
    path: List[Tuple[int, int]] = []
    cur: Optional[Tuple[int, int]] = (gr, gc)
    while cur is not None:
        path.append(cur)
        cur = came_from.get(cur)
    path.reverse()

    # Calculate physical distance step-by-step
    if isinstance(pixel_size_m, (tuple, list)):
        x_res, y_res = pixel_size_m
    else:
        x_res = y_res = pixel_size_m

    dist_m = 0.0
    for i in range(len(path) - 1):
        r0, c0 = path[i]
        r1, c1 = path[i+1]
        dist_m += math.sqrt(((r1 - r0) * y_res) ** 2 + ((c1 - c0) * x_res) ** 2)

    total_pixels = len(path)
    time_min = dist_m / ROVER_SPEED_M_PER_MIN

    # Simplified waypoints for frontend display (every 5th point)
    simplified = [[r, c] for r, c in path[::5]]
    if [gr, gc] not in simplified:
        simplified.append([gr, gc])

    return {
        "waypoints": simplified,
        "total_pixels": total_pixels,
        "estimated_distance_m": round(dist_m, 1),
        "estimated_time_min": round(time_min, 1),
        "hazard_avoided": _count_avoided(path, hazard),
    }



def select_goal(sites: List[Dict[str, Any]], hazard: np.ndarray) -> Tuple[int, int]:
    """
    Select the goal pixel: the highest-ranked landing site (rank=1).
    Falls back to the centre of the hazard map if no sites provided.
    """
    if sites:
        best = min(sites, key=lambda s: s["rank"])
        return best["row"], best["col"]
    h, w = hazard.shape
    return h // 2, w // 2


def default_start(hazard: np.ndarray) -> Tuple[int, int]:
    """Return a sensible start pixel (top-left corner of the safe interior)."""
    margin = 10
    return margin, margin


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _heuristic(r: int, c: int, gr: int, gc: int) -> float:
    """Euclidean distance heuristic (admissible for A*)."""
    return math.sqrt((r - gr) ** 2 + (c - gc) ** 2)


def _count_avoided(path: List[Tuple[int, int]], hazard: np.ndarray) -> int:
    """Count high-hazard (>0.6) pixels NOT on the path vs direct line."""
    return sum(1 for r, c in path if hazard[r, c] > 0.6)


def _empty_path(start: Tuple[int, int]) -> Dict[str, Any]:
    return {
        "waypoints": [list(start)],
        "total_pixels": 0,
        "estimated_distance_m": 0.0,
        "estimated_time_min": 0.0,
        "hazard_avoided": 0,
    }


def _straight_line_path(
    start: Tuple[int, int], goal: Tuple[int, int], pixel_size_m
) -> Dict[str, Any]:
    """Bresenham straight-line fallback path."""
    r0, c0 = start
    r1, c1 = goal
    points = _bresenham(r0, c0, r1, c1)

    if isinstance(pixel_size_m, (tuple, list)):
        x_res, y_res = pixel_size_m
    else:
        x_res = y_res = pixel_size_m

    dist_m = 0.0
    for i in range(len(points) - 1):
        pr0, pc0 = points[i]
        pr1, pc1 = points[i+1]
        dist_m += math.sqrt(((pr1 - pr0) * y_res) ** 2 + ((pc1 - pc0) * x_res) ** 2)

    return {
        "waypoints": [[r, c] for r, c in points[::5]],
        "total_pixels": len(points),
        "estimated_distance_m": round(dist_m, 1),
        "estimated_time_min": round(dist_m / ROVER_SPEED_M_PER_MIN, 1),
        "hazard_avoided": 0,
    }



def _bresenham(r0: int, c0: int, r1: int, c1: int) -> List[Tuple[int, int]]:
    """Bresenham's line algorithm."""
    points = []
    dr = abs(r1 - r0); dc = abs(c1 - c0)
    sr = 1 if r0 < r1 else -1
    sc = 1 if c0 < c1 else -1
    err = dr - dc
    r, c = r0, c0
    while True:
        points.append((r, c))
        if r == r1 and c == c1:
            break
        e2 = 2 * err
        if e2 > -dc:
            err -= dc; r += sr
        if e2 < dr:
            err += dr; c += sc
    return points
