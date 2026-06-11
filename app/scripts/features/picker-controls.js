import { registerColorPickerFeature } from './color-picker.js';
import { registerDurationPickerFeature } from './duration-picker.js';

export function registerPickerControlsFeature(context) {
  const { refs, utils, actions } = context;

  const colorPickerFeature = registerColorPickerFeature({
    actions: {
      pushHistory: actions.pushHistory,
    },
  });

  const durationPickerFeature = registerDurationPickerFeature({
    refs: {
      showDurationPicker: refs.showDurationPicker,
      tempDuration: refs.tempDuration,
      pickerMinRef: refs.pickerMinRef,
      pickerSecRef: refs.pickerSecRef,
      pickerPos: refs.pickerPos,
    },
    utils: {
      calculateEstTime: utils.calculateEstTime,
    },
    actions: {
      pushHistory: actions.pushHistory,
      triggerTouchHaptic: actions.triggerTouchHaptic,
    },
  });

  return {
    showColorPickerModal: colorPickerFeature.showColorPickerModal,
    colorPickerTarget: colorPickerFeature.colorPickerTarget,
    tempColor: colorPickerFeature.tempColor,
    presetColors: colorPickerFeature.presetColors,
    getTextColor: colorPickerFeature.getTextColor,
    generateRandomHexColor: colorPickerFeature.generateRandomHexColor,
    adjustColor: colorPickerFeature.adjustColor,
    getDefaultColorByType: colorPickerFeature.getDefaultColorByType,
    getGroupColor: colorPickerFeature.getGroupColor,
    openColorPicker: colorPickerFeature.openColorPicker,
    resetColorPicker: colorPickerFeature.resetColorPicker,
    saveColorPicker: colorPickerFeature.saveColorPicker,
    onDragStart: durationPickerFeature.onDragStart,
    onDragMove: durationPickerFeature.onDragMove,
    onDragEnd: durationPickerFeature.onDragEnd,
    openDurationPicker: durationPickerFeature.openDurationPicker,
    closePicker: durationPickerFeature.closePicker,
    onScroll: durationPickerFeature.onScroll,
    confirmDurationPicker: durationPickerFeature.confirmDurationPicker,
    resetDuration: durationPickerFeature.resetDuration,
  };
}
