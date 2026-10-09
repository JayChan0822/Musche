import { appPickerModalComponents } from './app-picker-modal-components.js';

export const AppPickerModalsShell = {
  name: 'AppPickerModalsShell',
  components: appPickerModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-color-picker-modal :ctx="ctx.appColorPickerModal"></app-color-picker-modal>
    <app-duration-picker :ctx="ctx.appDurationPicker"></app-duration-picker>
  `,
};
