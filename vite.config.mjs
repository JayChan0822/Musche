import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    port: 5173,
  },
});
