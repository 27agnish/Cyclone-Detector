import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            const httpRes = res as any;
            if (httpRes && typeof httpRes.writeHead === 'function' && !httpRes.headersSent) {
              httpRes.writeHead(502, { 'Content-Type': 'application/json' });
              httpRes.end(JSON.stringify({
                status: 'error',
                message: 'FastAPI backend unreachable at http://127.0.0.1:8000. Please ensure the backend is running.',
                detail: err.message
              }));
            }
          });
        }
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            const httpRes = res as any;
            if (httpRes && typeof httpRes.writeHead === 'function' && !httpRes.headersSent) {
              httpRes.writeHead(502, { 'Content-Type': 'application/json' });
              httpRes.end(JSON.stringify({
                status: 'error',
                message: 'FastAPI backend unreachable at http://127.0.0.1:8000.',
                detail: err.message
              }));
            }
          });
        }
      }
    }
  }
})
