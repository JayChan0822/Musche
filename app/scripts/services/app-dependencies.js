import { createAppUtilityFunctions } from './app-utility-functions.js';
import { createAppBootstrapServices } from './app-bootstrap-services.js';
import { createAppSupportLoaders } from './app-support-loaders.js';
import { createAppFeatureLoaders } from './app-feature-loaders.js';
import { createAppFeatureRegistrars } from './app-feature-registrars.js';
import { createAppStateFactories } from './app-state-factories.js';
import { createAppRootComponents } from './app-root-components.js';
import { createAppVueRuntime } from './app-vue-runtime.js';
import { createLazyFeatureProxy } from './lazy-feature-proxy.js';

export function createAppDependencies() {
    const vueRuntime = createAppVueRuntime();
    const supportLoaders = createAppSupportLoaders({ ref: vueRuntime.ref });

    return {
        ...vueRuntime,
        ...createAppUtilityFunctions(),
        ...createAppBootstrapServices(),
        ...supportLoaders,
        ...createAppFeatureLoaders({
            cropperSupport: supportLoaders.loadCropper,
            midiSmfSupport: supportLoaders.loadMidiSmf,
            xlsxSupport: supportLoaders.loadXlsx,
        }),
        ...createAppFeatureRegistrars({
            pinyinMatchSupport: supportLoaders.pinyinMatchSupport,
        }),
        ...createAppStateFactories({
            ref: vueRuntime.ref,
            reactive: vueRuntime.reactive,
            shallowRef: vueRuntime.shallowRef,
            computed: vueRuntime.computed,
        }),
        ...createAppRootComponents(),
        createLazyFeatureProxy,
    };
}
