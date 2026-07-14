/**
 * Lunar Ops AI - Mission Control Dashboard
 * Core Frontend Interactive Logic (Vanilla JavaScript)
 * 
 * This file handles all visual interactions, animations, state management,
 * and simulations for the Lunar Ops AI control center, ensuring a highly
 * interactive, responsive experience without needing client frameworks.
 * 
 * Structure:
 * 1. Global State Configuration
 * 2. Real-Time Telemetry Clocks & Timers
 * 3. Tab Switching Viewports
 * 4. Sliders Calibration HUD
 * 5. Interactive Site Selection & Card Binding
 * 6. Geographic Range-Finder Measure Tool
 * 7. AI Pipeline Scanner Logs
 * 8. DEM File Drag & Drop Ingestion Modal
 * 9. Core Mission Landing Command Dispatcher
 */

// =========================================================================
// 1. Global State Configuration
// =========================================================================
const appState = {
    activeTab: 'OVERVIEW',              // Current view state
    activeSiteId: 'site-alpha',         // Current target landing site
    measureModeActive: false,           // Range finder tool toggle
    measurePoints: [],                  // Coordinates clicked for distance range
    missionElapsedSeconds: 9930,        // Mission clock start value (2h 45m 30s)
    currentDispatchStep: 0,             // Current step in landing sequence modal
    
    // Structured database matching Python variables for live site information
    sites: {
        'site-alpha': {
            name: 'SITE ALPHA',
            coordinates: '25.4° N, 138.2° E',
            safetyScore: 96,
            slope: '2.1°',
            rockDensity: '0.5/m²',
            hazardProb: 'LOW',
            confidence: '98.5%',
            description: 'Mare Tranquillitatis Sector Alpha. Exceptional flat terrain, zero active seismic drift, direct-line-of-sight signal with Lunar Gateway.'
        },
        'site-bravo': {
            name: 'SITE BRAVO',
            coordinates: '42.3° N, 115.6° E',
            safetyScore: 89,
            slope: '4.5°',
            rockDensity: '1.2/m²',
            hazardProb: 'LOW',
            confidence: '91.2%',
            description: 'Mare Serenitatis Southern Rim. Sloped terrain with scattered high-density basalt clusters. Stable backup comms.'
        },
        'site-charlie': {
            name: 'SITE CHARLIE',
            coordinates: '15.6° N, 142.3° E',
            safetyScore: 92,
            slope: '3.8°',
            rockDensity: '0.8/m²',
            hazardProb: 'LOW',
            confidence: '94.8%',
            description: 'Oceanus Procellarum East. Solid regolith base, slightly elevated slope profile, low hazard footprint.'
        },
        'site-delta': {
            name: 'SITE DELTA',
            coordinates: '30.1° S, 122.5° E',
            safetyScore: 78,
            slope: '6.2°',
            rockDensity: '2.5/m²',
            hazardProb: 'MEDIUM',
            confidence: '82.1%',
            description: 'Tycho Crater Outer Ejecta. Significant rough features, high-density rock fragments, potential signal attenuation.'
        },
        'site-echo': {
            name: 'SITE ECHO',
            coordinates: '5.2° S, 149.8° E',
            safetyScore: 85,
            slope: '5.1°',
            rockDensity: '1.8/m²',
            hazardProb: 'LOW',
            confidence: '88.9%',
            description: 'Mare Imbrium Basin. Moderate rock distribution, shallow gradient slopes, stable backup landing zone.'
        }
    }
};

// Ensure page is fully rendered before binding event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Start active systems clocks
    initHUDClocks();
    
    // Inject introductory AI terminal log
    addConsoleLog("SYSTEM INIT", "S-Band communications linked. Orbit telemetry calibrated.", "info");
});

// =========================================================================
// 2. Real-Time Telemetry Clocks & Timers
// =========================================================================
function initHUDClocks() {
    // Tick Clock every second (1000ms)
    setInterval(() => {
        // 1. Real-time UTC clock rendering
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const date = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        
        const utcFormatted = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
        const clockDisplay = document.getElementById("current-time");
        if (clockDisplay) clockDisplay.innerText = utcFormatted;

        // 2. Mission Elapsed Timer increment
        appState.missionElapsedSeconds++;
        const elapsedDisplay = document.getElementById("mission-timer");
        if (elapsedDisplay) {
            elapsedDisplay.innerText = formatElapsed(appState.missionElapsedSeconds);
        }
    }, 1000);
}

// Converts raw seconds integers to "02h 45m 30s" string segments
function formatElapsed(totalSeconds) {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}h ${mins}m ${secs}s`;
}

// =========================================================================
// 3. Tab Switching Viewports
// =========================================================================
function switchTab(targetTab) {
    appState.activeTab = targetTab;
    
    // Remove "active" class state from all subtab buttons
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => btn.classList.remove("active"));
    
    // De-activate all viewport containers
    const overviewView = document.getElementById("view-overview");
    const recommendationView = document.getElementById("view-landing-recommendation");
    
    if (overviewView) overviewView.classList.remove("active-screen");
    if (recommendationView) recommendationView.classList.remove("active-screen");

    // Match selected button and viewport to activate
    if (targetTab === 'LANDING-RECOMMENDATION') {
        const landingTabBtn = document.getElementById("tab-landing-recommendation");
        if (landingTabBtn) landingTabBtn.classList.add("active");
        if (recommendationView) recommendationView.classList.add("active-screen");
        
        addConsoleLog("NAV REPORT", "Viewing Landing Recommendation Engine console.", "info");
    } else {
        // Any other tab (Overview, Terrain, Rover, Models) displays Screen 1 Overview
        const overviewTabBtn = document.getElementById("tab-overview");
        if (overviewTabBtn) overviewTabBtn.classList.add("active");
        if (overviewView) overviewView.classList.add("active-screen");
        
        addConsoleLog("NAV REPORT", `Viewport shifted to telemetry tab: [${targetTab}]`, "info");
    }
}

// =========================================================================
// 4. Sliders Calibration HUD
// =========================================================================
function updateSlopeSlider(val) {
    const display = document.getElementById("slope-display");
    if (display) display.innerText = `${val}°`;
    
    // Interactive: alter radar spider polygons slightly when sliders adjust to represent live feedback
    const spiderPoly = document.getElementById("spider-polygon");
    if (spiderPoly) {
        // Shift top vertex based on slider value
        const shiftY = 45 + (val - 15) * 1.2;
        spiderPoly.setAttribute("points", `100,${shiftY} 155,75 145,130 100,165 45,135 55,70`);
    }
}

function updateConfidenceSlider(val) {
    const display = document.getElementById("confidence-display");
    if (display) display.innerText = `${val}%`;
}

// Toggle grid layers on center map
function toggleMapGrid() {
    const gridLines = document.getElementById("map-coordinates-grid-lines");
    if (gridLines) {
        if (gridLines.style.display === "none") {
            gridLines.style.display = "block";
            addConsoleLog("HUD LAYERS", "Coordinate grid lines toggled [ON].", "info");
        } else {
            gridLines.style.display = "none";
            addConsoleLog("HUD LAYERS", "Coordinate grid lines toggled [OFF].", "info");
        }
    }
}

// =========================================================================
// 5. Interactive Site Selection & Card Binding
// =========================================================================
function selectLandingSite(siteId) {
    appState.activeSiteId = siteId;
    const siteObj = appState.sites[siteId];
    if (!siteObj) return;

    // 1. Update Map Targets concentric circles active indicators
    const mapNodes = document.querySelectorAll(".target-node");
    mapNodes.forEach(node => node.classList.remove("active-target"));
    
    const activeNode = document.getElementById(`map-node-${siteId}`);
    if (activeNode) activeNode.classList.add("active-target");

    // 2. Highlight matching registration cards in scrolling list
    const regCards = document.querySelectorAll(".site-registry-card");
    regCards.forEach(card => card.classList.remove("selected"));
    
    const activeCard = document.getElementById(`site-card-${siteId}`);
    if (activeCard) activeCard.classList.add("selected");

    // 3. Update Recommendation Summary panel descriptions
    const summaryTitle = document.getElementById("selected-site-title");
    const summaryDesc = document.getElementById("selected-site-summary");
    const summaryCoords = document.getElementById("landing-coordinates");
    
    if (summaryTitle) summaryTitle.innerText = siteObj.name;
    if (summaryDesc) summaryDesc.innerText = siteObj.description;
    if (summaryCoords) summaryCoords.innerText = `LAT/LON: ${siteObj.coordinates}`;

    addConsoleLog("TARGET SELECTOR", `Tracking target locked on coordinates: ${siteObj.coordinates}`, "success");
}

// =========================================================================
// 6. Geographic Range-Finder Measure Tool
// =========================================================================
function toggleMeasureMode() {
    appState.measureModeActive = !appState.measureModeActive;
    appState.measurePoints = [];
    
    const measureBtn = document.getElementById("btn-map-measure");
    const measurePanel = document.getElementById("measure-panel");
    const svgLine = document.getElementById("measure-line-element");
    const dotA = document.getElementById("measure-dot-a");
    const dotB = document.getElementById("measure-dot-b");

    if (appState.measureModeActive) {
        if (measureBtn) measureBtn.classList.add("active-btn");
        if (measurePanel) measurePanel.style.display = "block";
        addConsoleLog("RANGE FINDER", "Precision measure range-finding active. Tap map points.", "warning");
    } else {
        if (measureBtn) measureBtn.classList.remove("active-btn");
        if (measurePanel) measurePanel.style.display = "none";
        
        // Hide SVGs
        if (svgLine) svgLine.style.display = "none";
        if (dotA) dotA.style.display = "none";
        if (dotB) dotB.style.display = "none";
    }
}

// Handles mouse clicking inside geographic map viewport for distance scaling
function handleMapViewportClick(event) {
    if (!appState.measureModeActive) return;

    const mapContainer = document.getElementById("map-container");
    const rect = mapContainer.getBoundingClientRect();
    
    // Capture exact relative percentage click
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    appState.measurePoints.push({ x: clickX, y: clickY, pxX: event.clientX - rect.left, pxY: event.clientY - rect.top });

    const dotA = document.getElementById("measure-dot-a");
    const dotB = document.getElementById("measure-dot-b");
    const svgLine = document.getElementById("measure-line-element");
    const resultText = document.getElementById("measure-result");

    if (appState.measurePoints.length === 1) {
        // Plot point A marker dot
        if (dotA) {
            dotA.setAttribute("cx", `${clickX}%`);
            dotA.setAttribute("cy", `${clickY}%`);
            dotA.style.display = "block";
        }
        if (resultText) resultText.innerText = "Selecting Point B...";
    } else if (appState.measurePoints.length === 2) {
        // Plot point B marker dot and connecting vector
        if (dotB) {
            dotB.setAttribute("cx", `${clickX}%`);
            dotB.setAttribute("cy", `${clickY}%`);
            dotB.style.display = "block";
        }
        
        const ptA = appState.measurePoints[0];
        if (svgLine) {
            svgLine.setAttribute("x1", `${ptA.x}%`);
            svgLine.setAttribute("y1", `${ptA.y}%`);
            svgLine.setAttribute("x2", `${clickX}%`);
            svgLine.setAttribute("y2", `${clickY}%`);
            svgLine.style.display = "block";
        }

        // Calculate math distance scale to lunar kilometers (e.g. 1% delta = 4.35km)
        const dx = clickX - ptA.x;
        const dy = clickY - ptA.y;
        const totalPct = Math.sqrt(dx * dx + dy * dy);
        const lunarKm = (totalPct * 4.35).toFixed(1);

        if (resultText) {
            resultText.innerHTML = `Point A Latitude: ${ptA.y.toFixed(1)}°N<br>Point B Latitude: ${clickY.toFixed(1)}°N<br><strong style="color:#39ff14;">Range Distance: ${lunarKm} km</strong>`;
        }

        addConsoleLog("RANGE FINDER", `Geodetic range computed. Range: ${lunarKm} km`, "info");
    } else {
        // Reset and restart measuring
        appState.measurePoints = [{ x: clickX, y: clickY }];
        if (dotA) {
            dotA.setAttribute("cx", `${clickX}%`);
            dotA.setAttribute("cy", `${clickY}%`);
        }
        if (dotB) dotB.style.display = "none";
        if (svgLine) svgLine.style.display = "none";
        if (resultText) resultText.innerText = "Selecting Point B...";
    }
}

// =========================================================================
// 7. AI Pipeline Scanner Logs
// =========================================================================
function addConsoleLog(header, msg, type = 'info') {
    const terminal = document.getElementById("terminal-decision-log");
    if (!terminal) return;

    // Grab current system time
    const date = new Date();
    const timeFormatted = `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;

    // Create styled log line
    const logLine = document.createElement("div");
    logLine.className = `log-line ${type}`;
    logLine.innerHTML = `<span class="log-time">[${timeFormatted}]</span> <span class="log-msg">${header}: ${msg}</span>`;

    // Append to top of terminal
    terminal.insertBefore(logLine, terminal.firstChild);
}

// Triggers full multi-spectral scan simulation
function triggerAISimulation() {
    addConsoleLog("AI SCAN", "Starting terrain hazard detection sweep...", "warning");
    
    // Simulate telemetry values fluctuation
    let count = 0;
    const interval = setInterval(() => {
        // Fluctuate sliders to simulate background processing
        const mockVal = Math.floor(Math.random() * 10) + 10;
        updateSlopeSlider(mockVal);
        document.getElementById("slope-range").value = mockVal;
        
        count++;
        if (count > 5) {
            clearInterval(interval);
            addConsoleLog("AI SCAN", "Sweep complete. Safe area confidence margin: 96.4%.", "success");
        }
    }, 200);
}

// =========================================================================
// 8. DEM File Drag & Drop Ingestion Modal
// =========================================================================
function triggerDemoUpload() {
    const uploadModal = document.getElementById("upload-modal");
    if (uploadModal) uploadModal.style.display = "flex";
}

function closeUploadModal() {
    const uploadModal = document.getElementById("upload-modal");
    if (uploadModal) uploadModal.style.display = "none";
    
    // Reset progress track
    document.getElementById("upload-progress-card").style.display = "none";
}

// Handles selecting a mock file from directory selection click
function simulateDemoFileSelection() {
    const mockFiles = ['dem_mare_tranquillitatis_RAW.dem', 'dem_tycho_crater_GIS.raw', 'dem_imbrium_basin.bin'];
    const chosenFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    runMockFileUpload(chosenFile);
}

// Handles files dropped inside drag area boundary
function handleDemoFileDrop(event) {
    event.preventDefault();
    const box = document.getElementById("drag-drop-box");
    if (box) box.classList.remove("dragging");

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        runMockFileUpload(event.dataTransfer.files[0].name);
    }
}

// Animate fake progress bars mimicking raw GIS ingestion
function runMockFileUpload(fileName) {
    const progressCard = document.getElementById("upload-progress-card");
    const progressFill = document.getElementById("upload-progress-bar");
    const progressPct = document.getElementById("upload-progress-pct");

    if (progressCard) progressCard.style.display = "block";
    
    let pct = 0;
    const interval = setInterval(() => {
        pct += 20;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressPct) progressPct.innerText = `${pct}%`;

        if (pct >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                closeUploadModal();
                addConsoleLog("GIS PROCESSOR", `Ingested DEM mesh: [${fileName}]. Re-calibrating slope threshold bounds.`, "success");
            }, 500);
        }
    }, 150);
}

// =========================================================================
// 9. Core Mission Landing Command Dispatcher
// =========================================================================
function executeLandingDispatch() {
    appState.currentDispatchStep = 0;
    
    const dispatchModal = document.getElementById("dispatch-modal");
    if (dispatchModal) dispatchModal.style.display = "flex";

    // Clear previous check classes
    for (let i = 1; i <= 4; i++) {
        const row = document.getElementById(`dstep-${i}`);
        if (row) {
            row.className = "dispatch-step-row";
        }
    }

    advanceDispatchStep();
}

function closeDispatchModal() {
    const dispatchModal = document.getElementById("dispatch-modal");
    if (dispatchModal) dispatchModal.style.display = "none";
}

// Step-by-step checklist triggers
function advanceDispatchStep() {
    appState.currentDispatchStep++;
    const step = appState.currentDispatchStep;

    const advanceBtn = document.getElementById("btn-advance-dispatch");

    if (step <= 4) {
        // Set previous row complete
        if (step > 1) {
            const prevRow = document.getElementById(`dstep-${step - 1}`);
            if (prevRow) {
                prevRow.classList.remove("active");
                prevRow.classList.add("complete");
            }
        }

        // Set current row active
        const currRow = document.getElementById(`dstep-${step}`);
        if (currRow) {
            currRow.classList.add("active");
        }

        if (advanceBtn) {
            if (step === 4) {
                advanceBtn.innerText = "CONFIRM MISSION LANDING DISPATCH";
            } else {
                advanceBtn.innerText = "PROCEED TO NEXT TELEMETRY SEQUENCE";
            }
        }
    } else {
        // Sequence finalized
        const finalRow = document.getElementById("dstep-4");
        if (finalRow) {
            finalRow.classList.remove("active");
            finalRow.classList.add("complete");
        }
        
        setTimeout(() => {
            closeDispatchModal();
            addConsoleLog("CRITICAL EXECUTION", `Landing sequence transmitted to lunar guidance module. Tracking telemetry ON S-BAND.`, "success");
            alert("COMMAND DISPATCHED SUCCESSFUL!\nOnboard telemetry linked on S-Band.");
        }, 500);
    }
}
