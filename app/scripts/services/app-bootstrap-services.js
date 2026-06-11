import { createStorageService } from './storage-service.js';
import { createConfiguredSupabaseService } from './configured-supabase-service.js';
import { createDeviceService } from './device-service.js';
import { createHapticsService } from './haptics-service.js';

export function createAppBootstrapServices() {
    const storageService = createStorageService();
    const supabaseService = createConfiguredSupabaseService();
    const deviceService = createDeviceService();
    const { triggerTouchHaptic } = createHapticsService({ deviceService });

    return {
        storageService,
        supabaseService,
        deviceService,
        triggerTouchHaptic,
    };
}
