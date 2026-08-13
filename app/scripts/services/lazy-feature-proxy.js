export function createLazyFeatureProxy({ loadFeature }) {
    if (typeof loadFeature !== 'function') {
        throw new TypeError('createLazyFeatureProxy requires a loadFeature function');
    }

    let feature;
    let featurePromise;

    const getFeature = () => {
        if (feature) return Promise.resolve(feature);
        if (!featurePromise) {
            featurePromise = Promise.resolve(loadFeature())
                .then((loadedFeature) => {
                    feature = loadedFeature;
                    return loadedFeature;
                })
                .catch((error) => {
                    featurePromise = null;
                    throw error;
                });
        }
        return featurePromise;
    };

    const method = (methodName, fallback) => (...args) => {
        if (feature) return feature[methodName](...args);
        const result = getFeature().then((loadedFeature) => loadedFeature[methodName](...args));
        return fallback === undefined ? result : fallback;
    };

    const methods = (methodNames) => Object.fromEntries(
        methodNames.map((methodName) => [methodName, method(methodName)])
    );

    // 是否已加载完成。未加载时调用方若只想 no-op（如取消类操作），
    // 可借此避免触发 getFeature() 的动态 import 拉取 chunk。
    const isLoaded = () => !!feature;

    return {
        getFeature,
        method,
        methods,
        isLoaded,
    };
}
