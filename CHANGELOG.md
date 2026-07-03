# Changelog

All notable changes to this project will be documented in this file.

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
