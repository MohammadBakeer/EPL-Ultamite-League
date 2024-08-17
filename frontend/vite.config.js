import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',  // Vite will use the current directory as the root
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output directory for the build
    rollupOptions: {
      output: {
        format: 'esm',  // Ensures the output is in ES module format
      },
    },
  },
  server: {
    port: process.env.PORT || 5173,  // Port for local development
  },
  optimizeDeps: {
    // Specify CommonJS dependencies here if needed
    include: [
      'some-commonjs-package',
      'another-commonjs-package',
    ],
  },
});
