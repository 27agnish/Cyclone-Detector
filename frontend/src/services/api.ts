import axios from 'axios';
import { env } from '../config/env';

export const API_BASE_URL = env.API_V1_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
