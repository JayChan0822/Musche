export const AppDurationPicker = {
  name: 'AppDurationPicker',
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return props.ctx;
  },
  template: `
<div v-if="showDurationPicker" class="bubble-picker-overlay" @click.self="closePicker">

    <div class="bubble-picker-box" :style="{ top: pickerPos.top + 'px', left: pickerPos.left + 'px' }">

        <div class="bubble-columns">
            <div class="bubble-highlight"></div>

            <div class="bubble-col" :ref="(el) => { pickerMinRef = el; }" @scroll="onScroll($event, 'm')"
                 @mousedown.prevent="onDragStart($event, 'm')">
                <div v-for="m in 60" :key="'m'+(m-1)"
                     class="bubble-item"
                     :class="{'active-item': tempDuration.m === m-1}">
                    {{ (m - 1).toString().padStart(2, '0') }}
                </div>
            </div>

            <div class="bubble-col" :ref="(el) => { pickerSecRef = el; }" @scroll="onScroll($event, 's')"
                 @mousedown.prevent="onDragStart($event, 's')">
                <div v-for="s in 60" :key="'s'+(s-1)"
                     class="bubble-item"
                     :class="{'active-item': tempDuration.s === s-1}">
                    {{ (s - 1).toString().padStart(2, '0') }}
                </div>
            </div>
        </div>

        <div class="bubble-footer">
            <button @click="resetDuration" class="btn-reset">Reset</button>
            <button @click="confirmDurationPicker" class="btn-confirm">
                <i class="fa-solid fa-check"></i>
            </button>
        </div>
    </div>
</div>
  `,
};
