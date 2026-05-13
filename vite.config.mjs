import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    outDir: '../www',
    emptyOutDir: true,
  },
});
