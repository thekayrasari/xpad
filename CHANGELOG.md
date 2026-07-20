# Changelog

All notable changes to this project will be documented in this file.

## [1.4.1] - 2026-07-20

### Added
- **Navigation Bar Reordering:** Added a premium drag-and-drop customization interface in Settings to reorder sidebar app icons. Custom order is saved globally and persists across application restarts.

## [1.4.0] - 2026-07-14

### Added
- **Dynamic Module Registry:** Added a backend-driven declarative registry for external integrations (VATSIM Radar, VATSIM NatTrak, SimBrief, Charts, FlightSim.to, Fenix EFB, FSLabs EFB, and GSX Remote) powered by local config at `%APPDATA%/xPad/modules-settings.json`.
- **Backend Settings Storage:** Migrated SimBrief Pilot ID, Simulator IP, and Charts Provider from the browser's volatile LocalStorage to unified persistent storage on disk at `%APPDATA%/xPad/settings.json`.
- **Aviation Nomenclature:** Renamed modules to official airline/network terminology (e.g. Radar ➔ VATSIM Radar, NatTrak ➔ VATSIM NatTrak, Notes ➔ Scratchpad).

### Changed
- **AOC Module Layout:** Refactored the Airline Operations Control module UI to comply with the "No Top Bars" rule. Replaced toolbars with a floating absolute-action button and blur-backdrop overlay modal.
- **vPilot Service Naming:** Renamed the backend installer file to `vpilotPluginService.ts` and updated class naming to improve service uniformity.

## [1.3.0] - 2026-07-03

### Added
- **Aviation Calculators:** New utility module to calculate Top of Descent (TOD) distance, Required Vertical Speed, and aviation unit converters (weight, pressure, temperature).
- **GSX Remote Control:** Seamlessly control GSX ground operations (boarding, catering, pushback) directly from the EFB interface.
- **Notes Auto-fill:** Added a one-click auto-fill feature to populate scratchpad fields directly from your fetched SimBrief OFP.
- **OFP Quick Navigation:** Added a sleek quick-navigation menu to instantly jump to specific sections within the Operational Flight Plan.
- **Desktop App Support:** xPad can now be run natively as a standalone desktop app with `.exe` installer generation support (`npm run dist`).

### Changed
- **App Launcher Layout:** Reordered apps on the home screen by importance for quicker access to essential modules.
- **Documentation:** Updated `README.md` with detailed instructions for building and running the standalone desktop application and highlighted new features.

### Removed
- **Split-Screen Mode:** Removed the split-screen multitasking capability (and `react-resizable-panels` dependency) to streamline the unified application interface.
