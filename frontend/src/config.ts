/**
 * Shared application configuration.
 * VITE_BACKEND_URL can be overridden via a .env file during development.
 * Falls back to the default Electron production address.
 */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';
