# -*- coding: utf-8 -*-
"""
Lunar Ops AI - Mission Control
Backend Server (Flask Prototype)

This Python script initializes a lightweight Flask application to serve the
Lunar Mission Control Dashboard. It declares all key placeholder variables as
Python parameters, passing them dynamically to the Jinja index.html template.

This design makes it extremely simple to replace these static placeholders with
live values from:
1. Python DEM (Digital Elevation Model) Processor
2. YOLOv11 Rock & Crater Hazard Detection Engine
3. A* Onboard Rover Navigation Planner
4. Landing Recommendation Score Algorithms
"""

from flask import Flask, render_template

# Initialize the Flask application
# Since static assets and templates are in custom paths, we declare them here
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

@app.route('/')
def index():
    """
    Default route to render the main Mission Control Dashboard.
    Contains the structured database of telemetry placeholder parameters.
    """
    
    # Placeholder telemetry parameters.
    # In the future, these will be populated from telemetry logs and analytical processors.
    telemetry_data = {
        # Core Parameters requested by the client
        "mission_id": "LUN-2026-001",
        "operator": "Sanatan Roy",
        "current_region": "Mare Tranquillitatis",
        "mission_time": "08:42 UTC",
        "slope": "5°",
        "hazards": "12",
        "landing_score": "96%",
        "mission_score": "92%",
        "battery": "87%",
        "signal": "Strong",
        "coordinates": "82.34°S, 12.51°E",
        
        # Operational limits and HUD details
        "slope_cutoff": "15°",
        "detection_confidence": "95%",
        "cpu_load": "45%",
        "gpu_load": "62%",
        "system_status": "ACTIVE",
        "comms_link": "ONLINE (S-BAND)",
        "ai_engine": "OPTIMAL",
        
        # Detailed profile attributes of individual sites (Alpha through Echo)
        "sites": [
            {
                "id": "site-alpha",
                "name": "SITE ALPHA",
                "safety_score": 96,
                "slope": "2.1°",
                "rock_density": "0.5/m²",
                "hazard_probability": "LOW",
                "confidence": "98.5%",
                "coordinates": "25.4° N, 138.2° E",
                "description": "Mare Tranquillitatis Sector Alpha. Exceptional flat terrain, zero active seismic drift, direct-line-of-sight signal with Lunar Gateway."
            },
            {
                "id": "site-bravo",
                "name": "SITE BRAVO",
                "safety_score": 89,
                "slope": "4.5°",
                "rock_density": "1.2/m²",
                "hazard_probability": "LOW",
                "confidence": "91.2%",
                "coordinates": "42.3° N, 115.6° E",
                "description": "Mare Serenitatis Southern Rim. Sloped terrain with scattered high-density basalt clusters. Stable backup comms."
            },
            {
                "id": "site-charlie",
                "name": "SITE CHARLIE",
                "safety_score": 92,
                "slope": "3.8°",
                "rock_density": "0.8/m²",
                "hazard_probability": "LOW",
                "confidence": "94.8%",
                "coordinates": "15.6° N, 142.3° E",
                "description": "Oceanus Procellarum East. Solid regolith base, slightly elevated slope profile, low hazard footprint."
            },
            {
                "id": "site-delta",
                "name": "SITE DELTA",
                "safety_score": 78,
                "slope": "6.2°",
                "rock_density": "2.5/m²",
                "hazard_probability": "MEDIUM",
                "confidence": "82.1%",
                "coordinates": "30.1° S, 122.5° E",
                "description": "Tycho Crater Outer Ejecta. Significant rough features, high-density rock fragments, potential signal attenuation."
            },
            {
                "id": "site-echo",
                "name": "SITE ECHO",
                "safety_score": 85,
                "slope": "5.1°",
                "rock_density": "1.8/m²",
                "hazard_probability": "LOW",
                "confidence": "88.9%",
                "coordinates": "5.2° S, 149.8° E",
                "description": "Mare Imbrium Basin. Moderate rock distribution, shallow gradient slopes, stable backup landing zone."
            }
        ],
        
        # Chronological operational logs
        "operational_logs": [
            {"time": "14:32:10", "message": "AI: Hazard avoided, path recalculated.", "type": "info"},
            {"time": "14:31:55", "message": "AI: Optimal landing site identified.", "type": "success"},
            {"time": "14:31:30", "message": "AI: High-resolution surface scan complete.", "type": "info"},
            {"time": "14:31:00", "message": "AI: Initiating autonomous surface mapping.", "type": "info"}
        ]
    }
    
    # Render index.html template passing the dictionary as individual parameters
    return render_template('index.html', **telemetry_data)

if __name__ == '__main__':
    # Run the Flask app on localhost on port 5000 in debug mode for development.
    # When deployed to server, binding coordinates are changed to '0.0.0.0'.
    app.run(host='127.0.0.1', port=5000, debug=True)
