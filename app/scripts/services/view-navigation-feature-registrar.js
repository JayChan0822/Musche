import { registerViewNavigationFeature } from '../features/view-navigation.js';

export function createViewNavigationFeatureRegistrar() {
  return registerViewNavigationFeature;
}
