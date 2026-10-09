import { appRootStaticComponents } from '../components/app-root-static-components.js';

function createAppRootOptions() {
    return {
        components: appRootStaticComponents,
    };
}

export function createAppRootComponents() {
    return {
        createAppRootOptions,
    };
}
