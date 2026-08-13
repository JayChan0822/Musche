import { registerSessionFeature } from '../features/session.js';

export function wireSessionFeature(assembly) {
    const { currentSessionId, activeDropdown } = assembly.refs;
    const { settings } = assembly.state;
    const { idUtils } = assembly.utils;

    return registerSessionFeature({
        refs: {
            currentSessionId,
            activeDropdown,
        },
        state: {
            settings,
        },
        utils: {
            generateUniqueId: idUtils.generateUniqueId,
        },
        actions: {
            openInputModal: (...args) => assembly.helpers.openInputModal(...args),
            openConfirmModal: (...args) => assembly.helpers.openConfirmModal(...args),
            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
            // 切 session 会整体切换 currentSessionId：pending 的录音写回 debounce
            // 若不取消，1.5s 后会把 ratio 写进新 session 的数据并多推一条历史。
            cancelPendingTrackSave: () => assembly.helpers.cancelPendingTrackSave?.(),
        },
    });
}
