import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const scriptPath = resolve(rootDir, 'scripts/supabase-keepalive.mjs');
const workflowPath = resolve(rootDir, '.github/workflows/supabase-keepalive.yml');

test('keepalive workflow schedules a weekly run and executes the keepalive script', () => {
  assert.ok(existsSync(workflowPath), 'keepalive workflow should exist');

  const workflow = readFileSync(workflowPath, 'utf8');

  assert.match(workflow, /workflow_dispatch:/, 'workflow should support manual dispatch');
  assert.match(workflow, /cron:\s*["']0 3 \* \* 3["']/, 'workflow should run every Wednesday at 03:00 UTC');
  assert.match(workflow, /node scripts\/supabase-keepalive\.mjs/, 'workflow should run the keepalive script');
});

test('runKeepalive requests the configured Supabase auth settings endpoint', async () => {
  const { runKeepalive } = await import(pathToFileURL(scriptPath));

  let request;
  const response = await runKeepalive({
    supabaseUrl: 'https://example.supabase.co/',
    anonKey: 'anon-test-key',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        headers: {
          get(name) {
            return name.toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null;
          },
        },
        text: async () => '{"ok":true}',
      };
    },
  });

  assert.equal(request.url, 'https://example.supabase.co/auth/v1/settings');
  assert.equal(request.options.method, 'GET');
  assert.equal(request.options.headers.apikey, 'anon-test-key');
  assert.deepEqual(response.data, { ok: true });
});

test('runKeepalive throws a readable error when Supabase responds with a failure', async () => {
  const { runKeepalive } = await import(pathToFileURL(scriptPath));

  await assert.rejects(
    () => runKeepalive({
      supabaseUrl: 'https://example.supabase.co',
      anonKey: 'anon-test-key',
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        headers: {
          get(name) {
            return name.toLowerCase() === 'content-type' ? 'application/json' : null;
          },
        },
        text: async () => '{"message":"JWT expired"}',
      }),
    }),
    /Supabase keepalive failed with 401: {"message":"JWT expired"}/
  );
});
