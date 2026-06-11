import { registerSearchFeature } from '../features/search.js';

export function createSearchFeatureRegistrar({ pinyinMatchSupport } = {}) {
    return (context) => registerSearchFeature({
        ...context,
        utils: {
            ...context.utils,
            pinyinMatch: pinyinMatchSupport?.pinyinMatch,
            ensurePinyinMatch: pinyinMatchSupport?.loadPinyinMatch,
        },
    });
}
