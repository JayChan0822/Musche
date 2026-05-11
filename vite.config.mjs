import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app',
  server: {
    port: 5173,
  },
  build: {
    outDir: '../www',
    emptyOutDir: true,
  },
});
