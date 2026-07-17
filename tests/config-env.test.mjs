import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import viteConfig from '../vite.config.mjs';

const indexHtml = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');

test('config falls back to window.__MUSCHE_CONFIG__ when runtime config is present', async () => {
  globalThis.window = {
    __MUSCHE_CONFIG__: {
      supabaseUrl: 'https://window-project.supabase.co',
      supabaseKey: 'window-publishable-key',
    },
  };

  const moduleUrl = `${pathToFileURL(new URL('../app/scripts/config.js', import.meta.url).pathname).href}?window-test=1`;
  const configModule = await import(moduleUrl);

  assert.equal(configModule.SUPABASE_URL, 'https://window-project.supabase.co');
  assert.equal(configModule.SUPABASE_KEY, 'window-publishable-key');

  delete globalThis.window;
});

test('production HTML does not request the local runtime config file', () => {
  assert.doesNotMatch(indexHtml, /config\.local\.js/);
});

test('Vite injects local runtime config only for the development server', () => {
  const plugin = viteConfig.plugins?.find((candidate) => candidate.name === 'musche-local-runtime-config');

  assert.ok(plugin, 'Vite config should register the local runtime config plugin');
  assert.equal(plugin.apply, 'serve');
  assert.deepEqual(plugin.transformIndexHtml(), [{
    tag: 'script',
    attrs: { src: '/config.local.js' },
    injectTo: 'head',
  }]);
});

test('favicon is published from Vite public assets', () => {
  assert.equal(
    existsSync(new URL('../app/public/icon/icon.png', import.meta.url)),
    true,
    'app/public/icon/icon.png should exist so /icon/icon.png is present after build',
  );
});
