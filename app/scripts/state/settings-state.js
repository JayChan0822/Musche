import { createDefaultSettings } from './defaults.js';

export function createSettingsState({ reactive }) {
  if (typeof reactive !== 'function') {
    throw new TypeError('createSettingsState requires Vue reactive factory');
  }

  return reactive(createDefaultSettings());
}
