import { createStorageService } from './storage-service.js';
import { createConfiguredSupabaseService } from './configured-supabase-service.js';

export function createAppBootstrapServices() {
    const storageService = createStorageService();
    const supabaseService = createConfiguredSupabaseService();

    return {
        storageService,
        supabaseService,
    };
}
