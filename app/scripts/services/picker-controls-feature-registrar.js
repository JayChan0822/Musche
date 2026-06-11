import { registerPickerControlsFeature } from '../features/picker-controls.js';

export function createPickerControlsFeatureRegistrar() {
    return function wirePickerControlsFeature(assembly) {
        const {
            showDurationPicker,
            tempDuration,
            pickerMinRef,
            pickerSecRef,
            pickerPos,
        } = assembly.refs;
        const { triggerTouchHaptic } = assembly.services;
        return registerPickerControlsFeature({
            refs: {
                showDurationPicker,
                tempDuration,
                pickerMinRef,
                pickerSecRef,
                pickerPos,
            },
            utils: {
                calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
            },
            actions: {
                pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                triggerTouchHaptic: triggerTouchHaptic,
            },
        });
    };
}
