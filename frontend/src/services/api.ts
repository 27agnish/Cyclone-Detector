import axios from 'axios';
import { env } from '../config/env';

export const API_BASE_URL = env.API_V1_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Guard Interceptor: In production, prevent any request if backend URL is not configured
apiClient.interceptors.request.use((config) => {
  if (!API_BASE_URL && env.IS_PRODUCTION) {
    const errorMsg =
      'CycloneShield backend API URL is not configured. Expected /api/v1 same-origin route.';
    console.error(`[CycloneShield Config Error] ${errorMsg}`);
    return Promise.reject(new Error(errorMsg));
  }
  return config;
});

// Response interceptor for detailed diagnostic logging in browser console
apiClient.interceptors.response.use(
  (response) => response,
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
