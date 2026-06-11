import { registerScheduleInteractionsFeature } from '../features/schedule-interactions.js';

export function createScheduleInteractionsFeatureRegistrar() {
    return registerScheduleInteractionsFeature;
}
