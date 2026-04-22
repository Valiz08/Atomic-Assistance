import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  root: './',
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3088',
      '/socket.io': {
        target: 'http://localhost:3088',
        ws: true,
      },
    },
  },
  build: {
    outDir: '../service/public',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html'
    }
  }
});