import { registerSessionFeature } from '../features/session.js';

export function createSessionFeatureRegistrar() {
  return registerSessionFeature;
}
