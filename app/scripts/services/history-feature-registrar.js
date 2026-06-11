import { registerHistoryFeature } from '../features/history.js';

export function createHistoryFeatureRegistrar() {
  return registerHistoryFeature;
}
