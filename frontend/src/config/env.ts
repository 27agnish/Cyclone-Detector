/**
 * CycloneShield AI - Centralized Frontend Environment & Configuration
 * Provides type-safe access to environment variables without scattering import.meta.env.
 */

const rawMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

/**
 * Base backend URL resolution:
 * - In development: uses VITE_API_BASE_URL / VITE_API_URL if provided, else defaults to local backend
 * - In production: MUST be provided via VITE_API_BASE_URL or VITE_API_URL. NEVER falls back to localhost.
 */
function resolveApiBaseUrl(): string {
  const configured = (
    import.meta.env.VITE_API_BASE_URL || 
    import.meta.env.VITE_API_URL || 
    ''
  ).trim();

  if (configured) {
    const clean = configured.replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  // Safe development fallback ONLY (active during 'vite dev', never during production build)
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000/api/v1';
  }

  // In production without configured backend URL: return empty string.
  // Never attempt localhost or send network requests to an unknown host in production.
  return '';
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
   * In production, this is non-empty ONLY when VITE_API_BASE_URL is configured.
   */
  API_V1_BASE_URL: apiBaseWithV1,

  /**
   * Operational demo mode flag.
   */
  DEMO_MODE: import.meta.env.MODE === 'development' || import.meta.env.VITE_DEMO_MODE === 'true',
} as const;

export default env;
