import { createAppUtilityFunctions } from './app-utility-functions.js';
import { createAppBootstrapServices } from './app-bootstrap-services.js';
import { createAppSupportLoaders } from './app-support-loaders.js';
import { createAppFeatureLoaders } from './app-feature-loaders.js';
import { createAppFeatureRegistrars } from './app-feature-registrars.js';
import { createAppStateFactories } from './app-state-factories.js';
import { createAppRootComponents } from './app-root-components.js';
import { createAppVueRuntime } from './app-vue-runtime.js';
import { createAppAssembly } from './app-assembly.js';
import { createAppLazyFeatureWirings } from './app-lazy-feature-wirings.js';
import { createAppRootContexts } from './app-root-context-wiring.js';
import { createLazyFeatureProxy } from './lazy-feature-proxy.js';

export function createAppDependencies() {
    const vueRuntime = createAppVueRuntime();
    const supportLoaders = createAppSupportLoaders();
    const featureLoaders = createAppFeatureLoaders({
        cropperSupport: supportLoaders.loadCropper,
        midiSmfSupport: supportLoaders.loadMidiSmf,
        xlsxSupport: supportLoaders.loadXlsx,
    });

    return {
        ...vueRuntime,
        ...createAppUtilityFunctions(),
        ...createAppBootstrapServices(),
        ...supportLoaders,
        ...featureLoaders,
        ...createAppLazyFeatureWirings({ loaders: featureLoaders }),
        ...createAppFeatureRegistrars(),
        ...createAppStateFactories({
            ref: vueRuntime.ref,
            reactive: vueRuntime.reactive,
            shallowRef: vueRuntime.shallowRef,
            computed: vueRuntime.computed,
        }),
        ...createAppRootComponents(),
        createAppAssembly,
        createAppRootContexts,
        createLazyFeatureProxy,
    };
}
