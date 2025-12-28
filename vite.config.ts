import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3208,
    strictPort: true,
    hmr: {
      timeout: 60000,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        shared: resolve(__dirname, 'shared.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
