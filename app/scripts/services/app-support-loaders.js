import { createMidiSmfLoader } from './midi-smf-loader.js';
import { createXlsxLoader } from './xlsx-loader.js';
import { createCropperLoader } from './cropper-loader.js';
import { createPinyinMatchLoader } from './pinyin-match-loader.js';

export function createAppSupportLoaders({ ref } = {}) {
    const loadMidiSmf = createMidiSmfLoader();

    return {
        loadMidiSmf,
        loadXlsx: createXlsxLoader(),
        loadCropper: createCropperLoader(),
        pinyinMatchSupport: createPinyinMatchLoader({ ref }),
    };
}
