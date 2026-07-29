import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const scriptPath = resolve(rootDir, 'scripts/supabase-keepalive.mjs');
const workflowPath = resolve(rootDir, '.github/workflows/supabase-keepalive.yml');

test('keepalive workflow schedules a near-every-three-days run and executes the keepalive script', () => {
  assert.ok(existsSync(workflowPath), 'keepalive workflow should exist');

  const workflow = readFileSync(workflowPath, 'utf8');

  assert.match(workflow, /workflow_dispatch:/, 'workflow should support manual dispatch');
  assert.match(workflow, /cron:\s*["']0 3 \*\/3 \* \*["']/, 'workflow should run at 03:00 UTC on every third day-of-month');
  assert.match(workflow, /node scripts\/supabase-keepalive\.mjs/, 'workflow should run the keepalive script');
});

test('runKeepalive requests a database-backed keepalive endpoint without exposing rows', async () => {
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

  assert.equal(request.url, 'https://example.supabase.co/rest/v1/user_data?select=user_id&limit=1');
  assert.equal(request.options.method, 'GET');
  assert.equal(request.options.headers.apikey, 'anon-test-key');
  assert.equal(request.options.headers.Authorization, 'Bearer anon-test-key');
  assert.deepEqual(response.data, { ok: true });
});

test('runKeepalive retries transient network failures before succeeding', async () => {
  const { runKeepalive } = await import(pathToFileURL(scriptPath));

  const delays = [];
  let attempts = 0;
  const response = await runKeepalive({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon-test-key',
    retryDelayMs: 1,
    sleepImpl: async ms => { delays.push(ms); },
    fetchImpl: async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new TypeError('fetch failed');
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: async () => '{"ok":true}',
      };
    },
  });

  assert.equal(attempts, 3, 'should retry until the request succeeds');
  assert.equal(delays.length, 2, 'should back off between attempts');
  assert.ok(delays[1] > delays[0], 'backoff should grow between attempts');
  assert.deepEqual(response.data, { ok: true });
});

test('runKeepalive retries server-side errors but not client-side ones', async () => {
  const { runKeepalive } = await import(pathToFileURL(scriptPath));

  let serverErrorAttempts = 0;
  await runKeepalive({
    supabaseUrl: 'https://example.supabase.co',
    anonKey: 'anon-test-key',
    retryDelayMs: 1,
    sleepImpl: async () => {},
    fetchImpl: async () => {
      serverErrorAttempts += 1;
      const failing = serverErrorAttempts === 1;
      return {
        ok: !failing,
        status: failing ? 503 : 200,
        headers: { get: () => 'application/json' },
        text: async () => (failing ? '{"message":"unavailable"}' : '{"ok":true}'),
      };
    },
  });
  assert.equal(serverErrorAttempts, 2, '5xx should be retried');

  // 401/404 是配置问题（密钥轮换、表被删），重试只会拖延告警，必须立即失败。
  let clientErrorAttempts = 0;
  await assert.rejects(
    () => runKeepalive({
      supabaseUrl: 'https://example.supabase.co',
      anonKey: 'anon-test-key',
      retryDelayMs: 1,
      sleepImpl: async () => {},
      fetchImpl: async () => {
        clientErrorAttempts += 1;
        return {
          ok: false,
          status: 401,
          headers: { get: () => 'application/json' },
          text: async () => '{"message":"JWT expired"}',
        };
      },
    }),
    /Supabase keepalive failed with 401/
  );
  assert.equal(clientErrorAttempts, 1, '4xx should fail fast without retrying');
});

test('runKeepalive reports the last error after exhausting every attempt', async () => {
  const { runKeepalive } = await import(pathToFileURL(scriptPath));

  let attempts = 0;
  await assert.rejects(
    () => runKeepalive({
      supabaseUrl: 'https://example.supabase.co',
      anonKey: 'anon-test-key',
      maxAttempts: 4,
      retryDelayMs: 1,
      sleepImpl: async () => {},
      fetchImpl: async () => {
        attempts += 1;
        throw new TypeError('fetch failed');
      },
    }),
    /after 4 attempts.*fetch failed/s
  );
  assert.equal(attempts, 4, 'should honour the configured attempt budget');
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
