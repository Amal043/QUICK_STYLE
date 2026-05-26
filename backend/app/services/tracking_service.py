"""
GPS Simulation & Rider Live Position Tracking Service
Integrates Google Maps Directions API for realistic routing and ETA.
"""
import os
import httpx
import polyline
from typing import List, Dict

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_KEY", os.getenv("GOOGLE_API_KEY", ""))

async def get_directions(origin_coords: List[float], dest_coords: List[float]) -> Dict:
    """
    Fetches directions between two coordinates [lon, lat] using Google Directions API.
    Returns decoded polyline waypoints, distance, and duration.
    Note: Coordinates in MongoDB are [lon, lat]. Maps API expects lat,lng.
    """
    if not GOOGLE_API_KEY:
        print("[WARNING] No Google Maps API Key found. Returning mock route.")
        return get_mock_directions(origin_coords, dest_coords)

    origin_str = f"{origin_coords[1]},{origin_coords[0]}"
    dest_str = f"{dest_coords[1]},{dest_coords[0]}"
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin_str}&destination={dest_str}&key={GOOGLE_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            data = resp.json()
            if data.get("status") == "OK":
                route = data["routes"][0]["legs"][0]
                points = data["routes"][0]["overview_polyline"]["points"]
                waypoints = polyline.decode(points) # Returns list of (lat, lng) tuples
                
                # Format to list of dicts
                formatted_waypoints = [{"lat": p[0], "lng": p[1]} for p in waypoints]
                
                return {
                    "waypoints": formatted_waypoints,
                    "distance_meters": route["distance"]["value"],
                    "duration_seconds": route["duration"]["value"],
                    "status": "OK"
                }
            else:
                print(f"[ERROR] Google Maps API Error: {data.get('status')}")
                return get_mock_directions(origin_coords, dest_coords)
        except Exception as e:
            print(f"[ERROR] Failed to fetch directions: {e}")
            return get_mock_directions(origin_coords, dest_coords)

def get_mock_directions(origin: List[float], dest: List[float]) -> Dict:
    """Fallback if API fails."""
    return {
        "waypoints": [
            {"lat": origin[1], "lng": origin[0]},
            {"lat": (origin[1] + dest[1])/2, "lng": (origin[0] + dest[0])/2},
            {"lat": dest[1], "lng": dest[0]}
        ],
        "distance_meters": 5000,
        "duration_seconds": 600, # 10 mins
        "status": "MOCK"
    }
