import axios from 'axios';
import { env } from '../config/env';

export const API_BASE_URL = env.API_V1_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export default apiClient;
