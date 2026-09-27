/**
 * CycloneShield AI - Centralized Frontend Environment & Configuration
 * Provides type-safe access to environment variables without scattering import.meta.env.
 */

const rawMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();

// Ensure clean base URL without trailing slash
const sanitizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const apiBaseWithV1 = sanitizedBaseUrl.endsWith('/api/v1') ? sanitizedBaseUrl : `${sanitizedBaseUrl}/api/v1`;

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
   * Base URL for the FastAPI backend service (e.g. http://localhost:8000).
   */
  BACKEND_BASE_URL: sanitizedBaseUrl,

  /**
   * Base URL with /api/v1 prefix for standard API queries.
   */
  API_V1_BASE_URL: apiBaseWithV1,

  /**
   * Operational demo mode flag.
   */
  DEMO_MODE: import.meta.env.MODE === 'development' || import.meta.env.VITE_DEMO_MODE === 'true',
} as const;

export default env;
