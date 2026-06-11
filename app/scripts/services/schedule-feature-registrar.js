import { registerScheduleFeature } from '../features/schedule.js';

export function createScheduleFeatureRegistrar() {
    return registerScheduleFeature;
}
