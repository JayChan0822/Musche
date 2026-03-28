import * as appState from './state/app-state.js';
import * as defaults from './state/defaults.js';
import * as timeUtils from './utils/time.js';
import * as formatUtils from './utils/format.js';
import * as idUtils from './utils/id.js';
import * as midiUtils from './utils/midi.js';
import * as csvUtils from './utils/csv.js';
import * as storageService from './services/storage-service.js';
import * as supabaseService from './services/supabase-service.js';
import * as deviceService from './services/device-service.js';
import * as scheduleFeature from './features/schedule.js';
import * as settingsFeature from './features/settings.js';
import * as importCsvFeature from './features/import-csv.js';
import * as importMidiFeature from './features/import-midi.js';
import * as authFeature from './features/auth.js';
import * as mobileUiFeature from './features/mobile-ui.js';

const scaffoldModules = {
  appState,
  defaults,
  timeUtils,
  formatUtils,
  idUtils,
  midiUtils,
  csvUtils,
  storageService,
  supabaseService,
  deviceService,
  scheduleFeature,
  settingsFeature,
  importCsvFeature,
  importMidiFeature,
  authFeature,
  mobileUiFeature,
};

if (typeof window !== 'undefined') {
  window.__MUSCHE_MODULARIZATION__ = {
    phase: 'task-1-scaffold',
    appEntrypoint: 'www/scripts/app.js',
    modules: scaffoldModules,
  };
}
