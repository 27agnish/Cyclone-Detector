/**
 * CycloneShield AI - Centralized Frontend Environment & Configuration
 * Provides type-safe access to environment variables without scattering import.meta.env.
 */

/**
 * Base backend URL resolution:
 * - In local development: defaults to 'http://127.0.0.1:8000/api/v1' unless overridden by VITE_API_BASE_URL.
 * - In unified Vercel deployment: defaults to same-origin relative path '/api/v1' (or uses VITE_API_BASE_URL if explicitly provided).
 */
function resolveApiBaseUrl(): string {
  const configured = (
    import.meta.env.VITE_API_BASE_URL || 
    import.meta.env.VITE_API_URL || 
    ''
  ).trim();

  if (configured) {
    const clean = configured.replace(/\/+$/, '');
    if (clean.endsWith('/api/v1') || clean.endsWith('/api')) return clean;
    return `${clean}/api`;
  }

  // Same-origin relative path '/api': seamless single-port operation directly on port 8000
  return '/api';
}

const apiBase = resolveApiBaseUrl();
const sanitizedBaseUrl = apiBase ? apiBase.replace(/\/api(\/v1)?$/, '') : '';

export const env = {
  /**
   * Tactical GIS Engine name (Leaflet with OpenStreetMap tiles).
   * Free and open-source; does not require any secret API key.
   */
  MAP_ENGINE: 'Leaflet (OpenStreetMap)',

  /**
   * Production mode indicator.
   */
  IS_PRODUCTION: import.meta.env.PROD,

  /**
   * Base URL for the FastAPI backend service (without /api).
   */
  BACKEND_BASE_URL: sanitizedBaseUrl,

  /**
   * Base URL with /api prefix for standard API queries.
   * Defaults to same-origin relative '/api' for clean single-port architecture.
   */
  API_BASE_URL: apiBase,
  API_V1_BASE_URL: apiBase,

  /**
   * Operational demo mode flag.
   */
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE !== undefined 
    ? (import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true)
    : true,
} as const;

export default env;
