<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/plane.svg" width="80" height="80" alt="xPad Icon" />
  <h1>xPad</h1>
  <p><strong>A Next-Generation Electronic Flight Bag for Flight Simulation Enthusiasts</strong></p>
</div>

---

**xPad** is a sleek, standalone Electronic Flight Bag (EFB) built to elevate your flight simulation experience. Seamlessly integrating with SimBrief and VATSIM, xPad provides an all-in-one cockpit companion accessible directly from your browser or desktop. Experience unparalleled situational awareness, intuitive flight planning, and seamless dispatch communications in a unified, beautifully designed interface with advanced split-screen multitasking capabilities.

## 🚀 Features

### 🛫 Flight Planning & OFP
- **SimBrief Integration:** Automatically fetch and review your latest Operational Flight Plan using your Pilot ID. Access block fuel, routing, weights, alternates, and interactive waypoint tables.
- **Advanced Dispatch Form:** A full-featured native flight planner. Generate your flight directly to SimBrief with complete control over parameters such as Aircraft Type, Registration, SELCAL, ETOPS, and more.

### 🗺️ Live Radar & Traffic
- **VATSIM Radar Integration:** Real-time visualization of global VATSIM traffic and active ATC controllers with our integrated radar map, bringing true-to-life situational awareness to your cockpit.

### 🗺️ Flight Charts Support
- **Multi-Provider Charting:** Seamlessly access your favorite charting providers right within xPad. Fully supports:
  - **Navigraph Charts**
  - **Chartfox**
  - **MSFS Flight Planner**

### ☁️ Dispatch & Weather
- **Live METAR & TAF:** Real-time weather reporting for departure, arrival, and alternates directly from the Aviation Weather Center.
- **Company Dispatch (AOC):** Simulate airline dispatch communications. Send and receive standard IATA Delay Codes directly through an interactive AOC feed.

### 📚 Documents & Note-taking
- **Hybrid ATC Notepad:** Keep track of clearances, frequencies, and scratchpad notes. Features a fully-interactive draw mode for quick annotations!
- **PDF Manuals:** Upload and seamlessly navigate through your FCOM, QRH, SOPs, and briefing plates with our integrated PDF reader.

### 🛩️ Embedded Aircraft EFBs
Connect your favorite high-fidelity aircraft EFBs natively inside xPad using your local network:
- **Fenix A320/A330 EFB Integration**
- **FSLabs EFB Integration**

### 🌐 Integrated Web Tools
Quickly access essential simulation resources without leaving xPad:
- **FlightSim.to:** Browse and download sceneries or liveries natively inside an iframe.
- **VATSIM NatTrak:** Manage your oceanic clearances natively.

### 💻 Advanced Multitasking
- **Split-Screen Mode:** Run two modules side-by-side simultaneously. Keep your OFP open while taking notes, or monitor the VATSIM Radar while browsing charts!

## 🛠️ Tech Stack

Built with a modern and highly-performant stack:
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Lucide React, react-resizable-panels
- **Backend:** Node.js, TypeScript, Express, WebSocket
- **APIs:** SimBrief API, VATSIM Data API v3, Aviation Weather Center

## 📦 Getting Started

Ready to take flight? Start the development servers locally:

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

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check out [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License
xPad is an open-source project licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
