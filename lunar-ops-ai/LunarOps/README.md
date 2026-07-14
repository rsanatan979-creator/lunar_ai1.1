# Lunar Ops AI - Mission Control Console Documentation

This documentation serves as a comprehensive visual, styling, and functional guide for the Lunar Ops AI Mission Control dashboard interface. Designed for seamless portability, the project is structured to run as a **Python (Flask) Web Application** using only standard HTML5, CSS3, and Vanilla JavaScript. 

---

## 📂 Project Directory Structure

The files are laid out exactly according to professional modular web app guidelines:

```text
LunarOps/
│
├── app.py                      # Flask Application Server (Python 3.13+)
│
├── static/                     # Directory for browser-facing resources
│   ├── css/
│   │      style.css            # Custom layout rules & cybernetic HUD theme styling
│   │
│   ├── js/
│   │      app.js               # Client side modular interactions and simulator
│   │
│   ├── images/                 # Placeholder for high-resolution satellite meshes
│   └── icons/                  # Placeholder for structural graphic vector targets
│
├── templates/
│       index.html              # Core semantic HUD structures and Jinja variables
│
└── README.md                   # System architectural explanations (this file)
```

---

## 🐍 1. Flask Application Backend (`app.py`)

### Purpose
The `app.py` script starts a local development server running on Flask (Python). It is responsible for organizing the initial telemetry and configuration parameters inside a structured dictionary, passing them to the Jinja template compiler to render them dynamically within the HTML markup.

### Code Block Breakdown
- **Imports:** Imports the standard `Flask` library and the `render_template` module.
- **App Initialization:** Defines the application root and maps the static asset catalog (`/static`) and Jinja templates (`/templates`).
- **Route `/`:** Declares the default home endpoint. It initializes parameter payloads like `mission_id`, `battery`, `signal`, `slope`, and details of individual landing zones (Alpha through Echo).
- **Dynamic Array Injection:** Feeds the array lists into `render_template` so they are compiled natively by Jinja without hardcoding.

---

## 🧱 2. Semantic HTML Architecture (`templates/index.html`)

### Purpose
Implements a highly accessible and structured HTML5 DOM footprint. Instead of generic nesting, it relies on semantic elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<footer>`) to construct the visual telemetry grids.

### Key Sections Explained
- **`<header>` (Top Navigation Header):** Centers the LUNAR OPS AI brand, contains a red live pulsing telemetry dot, a clock widget, operator status, and system buttons.
- **`<nav>` (Subtabs Navigation):** Implements horizontal tab switching. Each tab represents a specific sub-console viewpoint.
- **`<main>` (Viewport Grid):** The primary container that maps three layout columns using flex rows:
  - **Left `<aside>` (Pipeline Panel):** Visualizes the multi-step AI pipeline meters, dual slider calibration selectors (Slope Threshold & Detection Confidence), and LED status indicators.
  - **Center `<section>` (Map Canvas Frame):** Maps coordinate grid overlays, YOLO bounding indicators, scale rulers, and floating measurement compasses on top of lunar geography images.
  - **Right `<aside>` (Intelligence & Comparisons):** Hosts polar spider charts, real-time terminals for AI logs, and detailed sites registries with circular confidence rings.
- **`<footer>` (Subsystem Diagnostics):** Keeps track of GPU loads, S-band status signals, and ticking stopwatch values.
- **Modal Dialogs:** Built-in floating modals for raw DEM file uploading and landing sequences transmission overlays, hidden by default via CSS.

---

## 🎨 3. Cybernetic CSS HUD Stylesheets (`static/css/style.css`)

### Purpose
Provides a clean, custom design language called "Dark Mission Control" with no frameworks (no Bootstrap, no Tailwind CDN). It focuses on crisp neon vectors, generous grid alignments, and a high-contrast dark palette.

### Key CSS Variables
- `--background`: Deep space dark blue/black (`#03070c`).
- `--panel-bg`: Dark blue panel container fill (`#09111c`).
- `--primary`: S-band cyan neon highlights (`#00f0ff`).
- `--success`: Active status telemetry green (`#39ff14`).
- `--danger`: Slope threshold critical cutoffs red (`#ff3b30`).

### Visual Structure Styles
- **`hud-scanlines`:** Overlays a subtle vertical scanning CRT line effect using linear gradients to mimic high-tech tactical military maps.
- **CSS Grid & Flexbox:** Uses `display: flex` and `display: grid` extensively for responsive alignments. For instance, the main viewport screen occupies exactly `height: calc(100vh - 100px)` to prevent vertical page breaking, and column contents scroll individually.
- **Circular Progress Gauges & Targets:** Styled target rings pulse dynamically with relative positions (`position: absolute; transform: translate(-50%, -50%)`).
- **Pulsing Animations (`@keyframes`):**
  - `pulse-ring`: Fluctuates box-shadow glows on telemetry locks.
  - `pulse-ring-expand`: Expands target indicator waves on selected map vectors.
  - `flash`: Multi-step indicator blinking.

---

## ⚙️ 4. Vanilla JavaScript Controller (`static/js/app.js`)

### Purpose
Implements all modular browser-side interactivity, state synchronization, clock ticking, range calculations, and simulation triggers entirely in standard ECMAScript.

### Core Functions Demystified
- **`initHUDClocks()`:** Runs an active interval looping every 1000ms. It grabs the client computer's clock to update the UTC live display and increments the mission elapsed seconds continuously.
- **`switchTab(targetTab)`:** Toggles between viewports. When switching to `LANDING-RECOMMENDATION`, it swaps the viewport view to reveal Screen 2, updating logging lines.
- **`updateSlopeSlider(val)` & `updateConfidenceSlider(val)`:** Updates inline displays dynamically. Modifying the slope slider actually tweaks the SVG coordinates on the Surface Roughness radar polygon, simulating live physical modeling.
- **`selectLandingSite(siteId)`:** Keeps the map and registration cards perfectly synchronized. Clicking site Bravo highlights Bravo card, centres Bravo target concentric circles on the map, and writes its coordinates and safety logs into the HUD details card.
- **`toggleMeasureMode()` & `handleMapViewportClick(event)`:** An interactive range-finder. Click Point A, click Point B, and it projects an SVG dotted line directly on the canvas, measuring actual geodetic distance in kilometers (calculated dynamically via Pythagorean delta vectors scaled to lunar proportions).
- **`triggerAISimulation()`:** Creates automated telemetry fluctuations. Swipes the sliders and appends detailed diagnostic logs with custom timestamp stamps.
- **`runMockFileUpload(fileName)`:** Simulates RAW DEM file drag-and-drop. Animates progress bar increments and appends GIS mapping logs to the terminal.
- **`executeLandingDispatch()` & `advanceDispatchStep()`:** Displays a critical telemetry dispatch modal. Runs a step-by-step checklist validation with indicator checks before finalizing onboard landing delegation.

---

## 🚀 How to Launch the Application Locally

1. **Verify Python Installation:** Ensure you have Python 3.13+ installed on your workspace system:
   ```bash
   python3 --version
   ```
2. **Install Flask:** Install Flask via pip:
   ```bash
   pip install flask
   ```
3. **Run Server:** Run the `app.py` script:
   ```bash
   python3 app.py
   ```
4. **Access UI:** Open your browser and navigate to `http://127.0.0.1:5000` to interact with the console dashboard!
