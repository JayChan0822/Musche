import { registerAppRuntimeFeature } from '../features/app-runtime.js';

export function createAppRuntimeFeatureRegistrar() {
  return registerAppRuntimeFeature;
}
