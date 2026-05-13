const cfg = typeof window !== 'undefined' ? (window.__MUSCHE_CONFIG__ || {}) : {};
const env = typeof import.meta !== 'undefined' ? (import.meta.env || {}) : {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL || cfg.supabaseUrl || '';
export const SUPABASE_KEY = env.VITE_SUPABASE_KEY || cfg.supabaseKey || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[Musche] Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY for hosted builds, or use app/config.local.js for local-only development.');
}
