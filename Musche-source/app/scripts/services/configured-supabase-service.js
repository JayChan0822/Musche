import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createSupabaseService } from './supabase-service.js';

export function createConfiguredSupabaseService() {
  return createSupabaseService({ url: SUPABASE_URL, key: SUPABASE_KEY });
}
