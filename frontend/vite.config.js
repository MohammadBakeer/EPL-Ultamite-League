import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',  // Set the root directory
  plugins: [react()],
  build: {
    outDir: '../dist',  // Output directory for the build
  },
  server: {
    port: 5173,  // Port on which Vite will run
  },
});
