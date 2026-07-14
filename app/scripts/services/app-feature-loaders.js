import { createDesktopResizeFeatureLoader } from './desktop-resize-feature-loader.js';
import { createScheduleDeletionFeatureLoader } from './schedule-deletion-feature-loader.js';
import { createAvatarCropFeatureLoader } from './avatar-crop-feature-loader.js';
import { createDataIoFeatureLoader } from './data-io-feature-loader.js';
import { createMetadataModalsFeatureLoader } from './metadata-modals-feature-loader.js';
import { createTourFeatureLoader } from './tour-feature-loader.js';
import { createMidiManagerFeatureLoader } from './midi-manager-feature-loader.js';
import { createTaskEditorFeatureLoader } from './task-editor-feature-loader.js';
import { createMobileTouchFeatureLoader } from './mobile-touch-feature-loader.js';
import { createTrackListFeatureLoader } from './track-list-feature-loader.js';
import { createSettingsFeatureLoader } from './settings-feature-loader.js';
import { createImportDataDependencyLoader } from './import-data-dependency-loader.js';

export function createAppFeatureLoaders({ cropperSupport, midiSmfSupport, xlsxSupport } = {}) {
    return {
        loadDesktopResizeFeature: createDesktopResizeFeatureLoader(),
        loadScheduleDeletionFeature: createScheduleDeletionFeatureLoader(),
        loadAvatarCropFeature: createAvatarCropFeatureLoader({ loadCropper: cropperSupport }),
        loadImportDataFeature: createImportDataDependencyLoader({ loadMidiSmf: midiSmfSupport }),
        loadDataIoFeature: createDataIoFeatureLoader({ loadXlsx: xlsxSupport }),
        loadMetadataModalsFeature: createMetadataModalsFeatureLoader(),
        loadTourFeature: createTourFeatureLoader(),
        loadMidiManagerFeature: createMidiManagerFeatureLoader(),
        loadTaskEditorFeature: createTaskEditorFeatureLoader(),
        loadMobileTouchRegistration: createMobileTouchFeatureLoader(),
        loadTrackListFeature: createTrackListFeatureLoader(),
        loadSettingsFeature: createSettingsFeatureLoader(),
    };
}
