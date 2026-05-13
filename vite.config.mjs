import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function copyRuntimeConfigPlugin() {
  return {
    name: 'copy-runtime-config',
    closeBundle() {
      const sourcePath = existsSync(resolve(__dirname, 'app/config.local.js'))
        ? resolve(__dirname, 'app/config.local.js')
        : resolve(__dirname, 'app/config.local.example.js');
      const outDir = resolve(__dirname, 'www');
      mkdirSync(outDir, { recursive: true });
      copyFileSync(sourcePath, resolve(outDir, 'config.local.js'));
    },
  };
}

export default defineConfig({
  root: 'app',
  server: {
    port: 5173,
  },
  build: {
    outDir: '../www',
    emptyOutDir: true,
  },
  plugins: [copyRuntimeConfigPlugin()],
});
