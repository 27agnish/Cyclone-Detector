/**
 * CycloneShield AI - Centralized Frontend Environment & Configuration
 * Provides type-safe access to environment variables without scattering import.meta.env.
 */

const rawMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

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
    if (clean.endsWith('/api/v1')) return clean;
    if (clean.endsWith('/api')) return `${clean}/v1`;
    return `${clean}/api/v1`;
  }

  // Same-origin relative path /api/v1: works seamlessly on the SAME port (e.g. 8000 direct, or 5173 via Vite proxy)
  return '/api/v1';
}

const apiBaseWithV1 = resolveApiBaseUrl();
const sanitizedBaseUrl = apiBaseWithV1 ? apiBaseWithV1.replace(/\/api\/v1$/, '') : '';

export const env = {
  /**
   * Google Maps Platform JavaScript API Key.
   * Only accessible from the frontend client environment.
   */
  GOOGLE_MAPS_API_KEY: rawMapsKey,

  /**
   * Whether a valid, non-placeholder Google Maps API key is present.
   */
  IS_GOOGLE_MAPS_CONFIGURED: Boolean(
    rawMapsKey && 
    rawMapsKey !== 'YOUR_GOOGLE_MAPS_API_KEY' &&
    rawMapsKey.length > 10
  ),

  /**
   * Production mode indicator.
   */
  IS_PRODUCTION: import.meta.env.PROD,

  /**
   * Base URL for the FastAPI backend service (without /api/v1).
   */
  BACKEND_BASE_URL: sanitizedBaseUrl,

  /**
   * Base URL with /api/v1 prefix for standard API queries.
   * Defaults to same-origin '/api/v1' in production, or 'http://127.0.0.1:8000/api/v1' in development.
   */
  API_V1_BASE_URL: apiBaseWithV1,

  /**
   * Operational demo mode flag.
   */
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE !== undefined 
    ? (import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true)
    : true,
} as const;

export default env;
