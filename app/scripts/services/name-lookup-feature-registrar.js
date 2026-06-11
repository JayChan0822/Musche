import { registerNameLookupFeature } from '../features/name-lookup.js';

export function createNameLookupFeatureRegistrar() {
  return registerNameLookupFeature;
}
