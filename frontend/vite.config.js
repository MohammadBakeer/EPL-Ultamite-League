import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',  // Set the root directory
  plugins: [react()],
  build: {
    outDir: '../dist',  // Output directory for the build
  },
  server: {
    port: process.env.PORT || 5173,  // Use the port from environment variable or fallback to 5173
  },
});
