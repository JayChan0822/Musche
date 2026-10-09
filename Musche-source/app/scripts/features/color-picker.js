import { ref } from 'vue';

const hexToRgb = hex => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const getTextColor = hex => {
  if (!hex) return '#1f2937';
  const [r, g, b] = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#1f2937' : '#f9fafb';
};

const generateRandomHexColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

const adjustColor = (hex, percent) => {
  if (!hex) return '#f3f4f6';
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 + percent;
  const newR = Math.min(255, Math.max(0, Math.floor(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.floor(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.floor(b * factor)));
  return '#' + [newR, newG, newB].map(x => x.toString(16).padStart(2, '0')).join('');
};

export function registerColorPickerFeature(context) {
  const { actions } = context;
  const { pushHistory } = actions;

  const showColorPickerModal = ref(false);
  const colorPickerTarget = ref(null);
  const tempColor = ref('');

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#71717a', '#000000',
  ];

  const getDefaultColorByType = (type) => {
    if (type === 'project') return '#eab308';
    if (type === 'instrument') return '#3b82f6';
    if (type === 'musician') return '#a855f7';
    return '#9ca3af';
  };

  const getGroupColor = (item, key, isBorder) => {
    if (key === 'musicianId') return '#a855f7';
    if (key === 'projectId') return '#eab308';
    if (key === 'instrumentId') return '#3b82f6';
    return isBorder ? '#9ca3af' : '#f3f4f6';
  };

  const openColorPicker = (item, type) => {
    colorPickerTarget.value = { item, type };
    tempColor.value = item.color || getDefaultColorByType(type);
    showColorPickerModal.value = true;
  };

  const resetColorPicker = () => {
    if (colorPickerTarget.value) {
      tempColor.value = getDefaultColorByType(colorPickerTarget.value.type);
    }
  };

  const saveColorPicker = () => {
    if (colorPickerTarget.value && tempColor.value) {
      colorPickerTarget.value.item.color = tempColor.value;
      pushHistory();
    }
    showColorPickerModal.value = false;
  };

  return {
    showColorPickerModal,
    colorPickerTarget,
    tempColor,
    presetColors,
    hexToRgb,
    getTextColor,
    generateRandomHexColor,
    adjustColor,
    getDefaultColorByType,
    getGroupColor,
    openColorPicker,
    resetColorPicker,
    saveColorPicker,
  };
}
