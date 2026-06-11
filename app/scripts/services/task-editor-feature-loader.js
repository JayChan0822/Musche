export function createTaskEditorFeatureLoader({
    importTaskEditorFeature = () => import('../features/task-editor.js'),
} = {}) {
    if (typeof importTaskEditorFeature !== 'function') {
        throw new TypeError('createTaskEditorFeatureLoader requires an importTaskEditorFeature function');
    }

    return () => importTaskEditorFeature()
        .then((taskEditorModule) => taskEditorModule.registerTaskEditorFeature);
}
