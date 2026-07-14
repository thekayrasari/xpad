<div align="center">
  <p><strong>A Next-Generation Electronic Flight Bag for Flight Simulation Enthusiasts</strong></p>
</div>

---

**xPad** is a sleek, standalone Electronic Flight Bag (EFB) built to elevate your flight simulation experience. Seamlessly integrating with SimBrief and VATSIM, xPad provides an all-in-one cockpit companion accessible directly from your browser or desktop. Experience unparalleled situational awareness, intuitive flight planning, and seamless dispatch communications in a unified, beautifully designed interface.

## Features

### Flight Planning & OFP
- **SimBrief Integration:** Automatically fetch and review your latest Operational Flight Plan using your Pilot ID. Access block fuel, routing, weights, alternates, and interactive waypoint tables. Features a sleek quick-navigation menu for instantly jumping to specific OFP sections.
- **Advanced Dispatch Form:** A full-featured native flight planner. Generate your flight directly to SimBrief with complete control over parameters such as Aircraft Type, Registration, SELCAL, ETOPS, and more.

### Live Radar & Traffic
- **VATSIM Radar Integration:** Real-time visualization of global VATSIM traffic and active ATC controllers with our integrated radar map, bringing true-to-life situational awareness to your cockpit.

### Flight Charts Support
- **Multi-Provider Charting:** Seamlessly access your favorite charting providers right within xPad. Fully supports:
  - **Navigraph Charts**
  - **Chartfox**
  - **MSFS Flight Planner**

### Dispatch & Weather
- **Live METAR & TAF:** Real-time weather reporting for departure, arrival, and alternates directly from the Aviation Weather Center.
- **Company Dispatch (AOC):** Simulate airline dispatch communications. Send and receive standard IATA Delay Codes directly through an interactive AOC feed.

### Documents & Note-taking
- **Hybrid ATC Notepad:** Keep track of clearances, frequencies, and scratchpad notes. Features a fully-interactive draw mode for quick annotations, and one-click auto-fill to populate fields directly from your SimBrief OFP!
- **PDF Manuals:** Upload and seamlessly navigate through your FCOM, QRH, SOPs, and briefing plates with our integrated PDF reader.

### Embedded Aircraft EFBs
Connect your favorite high-fidelity aircraft EFBs natively inside xPad using your local network:
- **Fenix A320/A330 EFB Integration**
- **FSLabs EFB Integration**

### Ground Operations
- **GSX Remote Control:** Seamlessly control GSX operations (boarding, catering, pushback) right from the EFB with a fully integrated remote control interface.

### Integrated Web Tools
Quickly access essential simulation resources without leaving xPad:
- **FlightSim.to:** Browse and download sceneries or liveries natively inside an iframe.
- **VATSIM NatTrak:** Manage your oceanic clearances natively.

### App Launcher & Automation
- **Flight Sim & Tools Launcher:** A dedicated interface to start Microsoft Flight Simulator (2020 & 2024, Steam/Xbox versions), vPilot, and BeyondATC directly from the EFB. Features intelligent path auto-detection and customizable path settings.

### VATSIM & Network Connectivity
- **vPilot Integration:** Native backend integration with the vPilot desktop client to monitor VATSIM network connection status, current callsign, and active COM frequencies directly inside the EFB.

### Configuration & Persistence
- **Declarative Modules Registry:** Webviews and local iframes are loaded dynamically from backend configuration (`modules-settings.json`). Add, remove, or edit integrations dynamically without touching code or recompiling.
- **Unified Disk Storage:** All preferences (SimBrief Pilot ID, simulator IP, charts provider, and app launch paths) are stored as flat JSON files in `%APPDATA%/xPad/` for persistent, one-time login sessions.

## Tech Stack

Built with a modern and highly-performant stack:
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Lucide React
- **Backend:** Node.js, TypeScript, Express, WebSocket
- **APIs:** SimBrief API, VATSIM Data API v3, Aviation Weather Center

## Getting Started

Ready to take flight? You can run xPad as a standalone desktop app or in your browser:

### Desktop App (Recommended)
1. Install dependencies in the root, frontend, and backend folders:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Start the standalone xPad desktop application:
   ```bash
   npm start
   ```
3. To build a distributable `.exe` installer:
   ```bash
   npm run dist
   ```

### Development Servers (Browser)
1. **Backend Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend App:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *xPad will be available at `http://localhost:5173`*

## Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check out [CONTRIBUTING.md](CONTRIBUTING.md).

## License
xPad is an open-source project licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
