import { registerOrchestrationFeature } from '../features/orchestration.js';

export function createOrchestrationFeatureRegistrar() {
    return registerOrchestrationFeature;
}
