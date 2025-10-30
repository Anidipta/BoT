import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Dev-time proxy to avoid CORS when fetching flowscan/testnet APIs from the browser.
    // Requests to /flowscan-api/* will be forwarded to https://testnet.flowscan.org/*
    proxy: {
      '/flowscan-api': {
        target: 'https://testnet.flowscan.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/flowscan-api/, ''),
      },
      // Proxy HTML pages from flowscan.io (testnet) so we can fetch account pages during dev
      '/flowscan-page': {
        target: 'https://testnet.flowscan.io',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/flowscan-page/, ''),
      },
    },
  },
});
