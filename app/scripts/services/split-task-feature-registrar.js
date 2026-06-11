import { registerSplitTaskFeature } from '../features/split-task.js';

export function createSplitTaskFeatureRegistrar() {
    return registerSplitTaskFeature;
}
