import { registerUndoToastFeature } from '../features/undo-toast.js';

export function wireUndoToastFeature(assembly) {
    const { isMobile, historyIndex, isBootstrappingData } = assembly.refs;
    return registerUndoToastFeature({
        refs: {
            isMobile,
            historyIndex,
            isBootstrappingData,
        },
        actions: {
            // undo 由 history feature 提供，经 helpers 延迟取值（注册顺序无关）
            undo: (...args) => assembly.helpers.undo?.(...args),
        },
    });
}
