const cfg = window.__MUSCHE_CONFIG__ || {};

export const SUPABASE_URL = cfg.supabaseUrl || '';
export const SUPABASE_KEY = cfg.supabaseKey || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Musche] Missing Supabase config. Copy app/config.local.example.js to app/config.local.js.');
}
