const DEFAULT_KEEPALIVE_PATH = '/rest/v1/user_data?select=user_id&limit=1';
// GitHub runner 偶发 DNS/连接抖动会让单次 fetch 直接失败（实测约四分之一的定时运行中招），
// 而保活连续断 7 天 Supabase 就会暂停项目，所以瞬时故障必须重试。
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;
const DEFAULT_REQUEST_TIMEOUT_MS = 15000;

function isRetriableStatus(status) {
  // 5xx 与 429 属于服务端临时状况；4xx 是配置问题（密钥轮换、表被删），重试只会拖延告警。
  return status >= 500 || status === 429;
}

function createTimeoutSignal(timeoutMs) {
  return typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(timeoutMs) : undefined;
}

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
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  sleepImpl = ms => new Promise(resolve => setTimeout(resolve, ms)),
  logImpl = message => console.error(message),
} = {}) {
  const normalizedKey = requireEnv('SUPABASE_ANON_KEY', anonKey);
  const requestUrl = buildKeepaliveUrl(supabaseUrl, path);

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(requestUrl, {
        method: 'GET',
        headers: {
          apikey: normalizedKey,
          Authorization: `Bearer ${normalizedKey}`,
        },
        signal: createTimeoutSignal(requestTimeoutMs),
      });

      const responseText = await response.text();

      if (!response.ok) {
        const failure = new Error(`Supabase keepalive failed with ${response.status}: ${responseText}`);
        if (!isRetriableStatus(response.status)) {
          failure.fatal = true;
          throw failure;
        }
        lastError = failure;
      } else {
        const contentType = response.headers?.get?.('content-type') ?? '';
        const data = contentType.includes('application/json') && responseText
          ? JSON.parse(responseText)
          : responseText;

        return {
          status: response.status,
          data,
          attempts: attempt,
        };
      }
    } catch (error) {
      if (error?.fatal) {
        throw error;
      }
      lastError = error;
    }

    if (attempt < maxAttempts) {
      logImpl(`Keepalive attempt ${attempt}/${maxAttempts} failed: ${lastError?.message ?? lastError}`);
      await sleepImpl(retryDelayMs * attempt);
    }
  }

  throw new Error(`Supabase keepalive failed after ${maxAttempts} attempts: ${lastError?.message ?? lastError}`);
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
