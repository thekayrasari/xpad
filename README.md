# xPad EFB

A modern, standalone Electronic Flight Bag (EFB) built for flight simulation enthusiasts. xPad combines real-time flight simulation telemetry, VATSIM network integration, online flight planning, and flight calculations in a unified, professional dark-themed cockpit interface.

---

## Technical Architecture & Design

xPad is designed around a lightweight, dual-process model:
* **Frontend:** A React 19 web application built with TypeScript, Vite, Tailwind CSS v4, and Zustand. The styling follows the professional **xPad Design Language** (MSFS 2024 dark theme with solid deep navy/slate colors, Outfit typography, and responsive visual transitions).
* **Backend:** A local Node.js service utilizing Express, WebSockets, and `node-simconnect`. It exposes local API endpoints and broadcasts real-time telemetry to the frontend via WebSockets.
* **Desktop Client:** An Electron container wrapping the frontend and backend processes, enabling packaging as a native desktop application with `.exe` installers.

---

## Core Features

### 1. Live Simulator Telemetry (SimConnect)
* Natively connects to Microsoft Flight Simulator (MSFS) using the SimConnect SDK.
* Streams real-time flight parameters (altitude, latitude, longitude, heading, indicated airspeed, COM1/COM2 active frequencies) via WebSockets.
* Supports active COM1 radio tuning directly from the EFB user interface.

### 2. VATSIM & vPilot Integration
* Includes an automated installer service that detects local vPilot client paths and installs the custom `xPadPlugin.dll` plugin.
* Monitors VATSIM network connection status, current callsign, and active controller frequencies.
* Displays nearby controllers and lists frequency lists in a unified communication panel.

### 3. SimBrief & Flight Planning
* Fetches detailed Operational Flight Plans (OFP) using your SimBrief Pilot ID.
* Displays routing, alternates, weight profiles, weather information, waypoints, dispatch remarks, and log logs.
* Features a quick navigation side-menu to instantly snap to sections within large flight documents.

### 4. Interactive Notepad & Scratchpad
* Includes a specialized notepad optimized for copying clearances with pre-formatted templates (e.g. CRAFT).
* Supports one-click auto-fill to populate notepad fields using data parsed from the active SimBrief OFP.

### 5. Aviation Flight Calculators
* **Top of Descent (TOD):** Calculates target vertical profile descent starts based on target alt, current alt, groundspeed, and descent rate/angle.
* **Unit Converter:** Perform instant aviation conversions (Weights: KG ⟷ LB, Temperature: °C ⟷ °F, Pressures: hPa ⟷ InHg).

### 6. Dynamic Web Integrations Registry
An extensible backend-driven modules registry loads web views and local iframes dynamically (`modules-settings.json`) to integrate:
* **Flight Charts:** Support for Navigraph Charts, Chartfox, and MSFS Planner.
* **Flightsim.to & Dispatch:** Built-in web frames to browse sceneries or access SimBrief Dispatch and VATSIM NatTrak.
* **Cockpit Companion Apps:** Connects directly to local aircraft EFB screens (Fenix EFB, FSLabs EFB) and GSX Pro Remote control.

### 7. Interactive PDF Manuals
* Browse, view, and store flight checklists, aircraft manuals (SOPs/FCOMs), and airport terminal plates in an integrated PDF module.

### 8. App Launcher & Automation
* Automatically scans, registers, and starts local applications (MSFS, vPilot, BeyondATC, Volanta, etc.) directly from the launcher panel within the EFB.

### 9. Custom App Reordering
* Features an interactive HTML5 drag-and-drop interface in Settings to customize the vertical sequence of apps on the left navigation sidebar. Re-ordered configurations are saved instantly on release.

### 10. Persistent Storage
* All settings (SimBrief Pilot ID, preferred charts provider, simulator IP address, and custom app orders) are persisted on disk in `%APPDATA%/xPad/` to support persistent configurations.

---

## Installation & Setup

### Running as a Standalone Desktop App (Recommended)

1. Clone the repository and install dependencies at all levels:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ..
   ```
2. Start the local server and Electron container:
   ```bash
   npm start
   ```
3. To package the application as a standalone `.exe` installer:
   ```bash
   npm run dist
   ```

### Running in Development Mode (Browser-based)

To run the frontend Vite dev server and the backend Node service independently:

1. **Start the Backend Service:**
   ```bash
   cd backend
   npm run dev
   ```
   *Runs by default on HTTP port `3001` & WebSocket port `8080`.*

2. **Start the Frontend App:**
   ```bash
   cd frontend
   npm run dev
   ```
   *The client interface will be available at `http://localhost:5173`.*

---

## Contributing

Contributions, bug reports, and features are welcome! Feel free to open issues or check out the [CONTRIBUTING.md](CONTRIBUTING.md) guide.

## License

xPad is licensed under the MIT License. See [LICENSE](LICENSE) for details.
