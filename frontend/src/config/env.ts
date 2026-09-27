/**
 * CycloneShield AI - Centralized Frontend Environment & Configuration
 * Provides type-safe access to environment variables without scattering import.meta.env.
 */

const isProd = import.meta.env.PROD;
const rawMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

// Base backend URL resolution:
// In production on Vercel: must be set via VITE_API_BASE_URL or VITE_API_URL in Vercel project settings
// In development: defaults to local FastAPI backend on http://127.0.0.1:8000
const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  (isProd ? '' : 'http://127.0.0.1:8000')
).trim();

// Ensure clean base URL without trailing slash
const sanitizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const apiBaseWithV1 = sanitizedBaseUrl 
  ? (sanitizedBaseUrl.endsWith('/api/v1') ? sanitizedBaseUrl : `${sanitizedBaseUrl}/api/v1`)
  : '/api/v1';

if (isProd && (!sanitizedBaseUrl || sanitizedBaseUrl.includes('localhost') || sanitizedBaseUrl.includes('127.0.0.1'))) {
  console.warn(
    '[CycloneShield] Notice: Running in production without a public backend URL configured. ' +
    'Set VITE_API_BASE_URL in your Vercel Project Settings > Environment Variables.'
  );
}

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
  IS_PRODUCTION: isProd,

  /**
   * Base URL for the FastAPI backend service (e.g. https://your-backend.onrender.com).
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
