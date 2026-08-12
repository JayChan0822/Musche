import { registerDropdownsFeature } from '../features/dropdowns.js';

export function wireDropdownsFeature(assembly) {
    const {
        activeDropdown,
        showMobileMenu,
        showProfileMenu,
        settingsGroupFocus,
        showGroupSuggestions,
        editingItem,
        newItem,
    } = assembly.refs;
    const { settings } = assembly.state;
    return registerDropdownsFeature({
        refs: {
            activeDropdown,
            showMobileMenu,
            showProfileMenu,
            settingsGroupFocus,
            showGroupSuggestions,
            editingItem,
        },
        state: {
            settings,
            newItem,
        },
        actions: {
            onMusicianSelect: () => assembly.features.quickAdd.onMusicianSelect(),
            getSettingsNameFocus: () => assembly.refs.settingsNameFocus,
            getActiveRecDropdown: () => assembly.refs.activeRecDropdown,
        },
    });
}
