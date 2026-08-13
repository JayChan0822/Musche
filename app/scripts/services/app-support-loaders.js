import { createMidiSmfLoader } from './midi-smf-loader.js';
import { createXlsxLoader } from './xlsx-loader.js';
import { createCropperLoader } from './cropper-loader.js';

export function createAppSupportLoaders() {
    const loadMidiSmf = createMidiSmfLoader();

    return {
        loadMidiSmf,
        loadXlsx: createXlsxLoader(),
        loadCropper: createCropperLoader(),
    };
}
