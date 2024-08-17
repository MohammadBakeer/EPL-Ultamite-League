import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',  // Vite will use the current directory as the root
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output directory for the build
  },
  server: {
    port: process.env.PORT || 5173,  // Port for local development
  },
});
        