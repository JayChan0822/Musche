import { registerGlobalKeyboardFeature } from '../features/global-keyboard.js';

export function createGlobalKeyboardFeatureRegistrar() {
  return registerGlobalKeyboardFeature;
}
