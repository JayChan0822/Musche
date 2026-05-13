import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

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
