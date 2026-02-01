import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3210,
    strictPort: true,
    hmr: {
      timeout: 60000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3209',
        changeOrigin: true,
      },
      '/data': {
        target: 'http://localhost:3209',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['leaflet', 'recharts', 'lucide-react', 'clsx', 'tailwind-merge'],
          'vendor-utils': ['date-fns', 'fflate'],
        },
      },
    },
  },
});
