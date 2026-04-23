const DEFAULT_KEEPALIVE_PATH = '/auth/v1/settings';

function normalizeKeepalivePath(path = DEFAULT_KEEPALIVE_PATH) {
  const trimmedPath = typeof path === 'string' ? path.trim() : '';
  const effectivePath = trimmedPath || DEFAULT_KEEPALIVE_PATH;
  return effectivePath.startsWith('/') ? effectivePath : `/${effectivePath}`;
}

function requireEnv(name, value) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function buildKeepaliveUrl(supabaseUrl, path = DEFAULT_KEEPALIVE_PATH) {
  const normalizedUrl = requireEnv('SUPABASE_URL', supabaseUrl);
  const normalizedPath = normalizeKeepalivePath(path);
  return new URL(normalizedPath, normalizedUrl).toString();
}

export async function runKeepalive({
  supabaseUrl = process.env.SUPABASE_URL,
  anonKey = process.env.SUPABASE_ANON_KEY,
  path = process.env.SUPABASE_KEEPALIVE_PATH,
  fetchImpl = fetch,
} = {}) {
  const normalizedKey = requireEnv('SUPABASE_ANON_KEY', anonKey);
  const requestUrl = buildKeepaliveUrl(supabaseUrl, path);

  const response = await fetchImpl(requestUrl, {
    method: 'GET',
    headers: {
      apikey: normalizedKey,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase keepalive failed with ${response.status}: ${responseText}`);
  }

  const contentType = response.headers?.get?.('content-type') ?? '';
  const data = contentType.includes('application/json') && responseText
    ? JSON.parse(responseText)
    : responseText;

  return {
    status: response.status,
    data,
  };
}

async function main() {
  const result = await runKeepalive();
  console.log(JSON.stringify({
    ok: true,
    status: result.status,
    data: result.data,
  }));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
