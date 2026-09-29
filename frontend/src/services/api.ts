import axios from 'axios';
import { env } from '../config/env';

export const API_BASE_URL = env.API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for detailed diagnostic logging and SPA fallback detection
apiClient.interceptors.response.use(
  (response) => {
    // Detect accidental HTML responses (SPA index.html fallback) when JSON was expected
    const rawContentType = response.headers?.['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : String(rawContentType || '');
    const isHtmlString =
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') ||
        response.data.trim().startsWith('<!DOCTYPE') ||
        response.data.trim().startsWith('<html'));
    if (contentType.includes('text/html') || isHtmlString) {
      const url = `${response.config?.baseURL || ''}${response.config?.url || ''}`;
      console.error(
        `[CycloneShield API Error] HTML response received from API route: ${url}. Expected JSON. ` +
        `This indicates the request was intercepted by the SPA fallback (Vite dev server or static host) ` +
        `instead of reaching the Python FastAPI backend.`
      );
      const htmlError = new Error(
        `Received HTML instead of JSON from API endpoint '${url}'. The backend service may be down, or routing is misconfigured.`
      );
      (htmlError as any).response = {
        ...response,
        status: 502,
        statusText: 'Bad Gateway (SPA Fallback Intercepted)',
        data: {
          error: 'SPA Fallback Intercepted',
          message: `Endpoint ${url} returned HTML. FastAPI backend may not be running.`,
        },
      };
      return Promise.reject(htmlError);
    }
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase() || 'GET';
    const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    const status = error.response?.status;
    const statusText = error.response?.statusText || '';

    console.error(
      `[CycloneShield API Error] ${method} ${url} -> ${status || 'NETWORK ERROR'} (${statusText || error.message})`,
      {
        url,
        status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      }
    );

    return Promise.reject(error);
  }
);

export default apiClient;
