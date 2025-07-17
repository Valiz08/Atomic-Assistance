import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  }
});