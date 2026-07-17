import { defineConfig } from 'vite';

function localRuntimeConfigPlugin() {
  return {
    name: 'musche-local-runtime-config',
    apply: 'serve',
    transformIndexHtml() {
      return [{
        tag: 'script',
        attrs: { src: '/config.local.js' },
        injectTo: 'head',
      }];
    },
  };
}

export default defineConfig({
  root: 'app',
  plugins: [localRuntimeConfigPlugin()],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    port: 5173,
  },
});
