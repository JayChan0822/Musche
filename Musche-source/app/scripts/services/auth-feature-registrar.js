import { registerAuthFeature } from '../features/auth.js';

export function wireAuthFeature(assembly) {
    const {
        user,
        showAuthModal,
        authLoading,
        authForm,
        activeDropdown,
        showProfileMenu,
        showMobileMenu,
        tempAvatarUrl,
        tempNickname,
        localDataVersion,
        saveStatus,
        isSyncing,
        itemPool,
        scheduledTasks,
        currentSessionId,
    } = assembly.refs;
    const { settings } = assembly.state;
    const { formatUtils, idUtils } = assembly.utils;
    const { storageService, supabaseService } = assembly.services;
    return registerAuthFeature({
        refs: {
            user,
            showAuthModal,
            authLoading,
            authForm,
            activeDropdown,
            showProfileMenu,
            showMobileMenu,
            tempAvatarUrl,
            tempNickname,
            localDataVersion,
            saveStatus,
            isSyncing,
            itemPool,
            scheduledTasks,
            currentSessionId,
        },
        state: {
            settings,
        },
        utils: {
            formatDate: formatUtils.formatDate,
            ensureItemRecords: (...args) => assembly.features.ratio.ensureItemRecords(...args),
            calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
            generateUniqueId: idUtils.generateUniqueId,
        },
        services: {
            storageService,
            supabaseService,
        },
        actions: {
            pushHistory: (...args) => assembly.helpers.pushHistory(...args),
            openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
            openConfirmModal: (...args) => assembly.helpers.openConfirmModal(...args),
            // 登录/登出/恢复会整体替换 itemPool 与 currentSessionId：
            // pending 的录音写回 debounce 若不取消，会打在新数据上。
            cancelPendingTrackSave: () => assembly.helpers.cancelPendingTrackSave?.(),

            setSaveStatus: (value) => {
                saveStatus.value = value;
            },
        },
    });
}
