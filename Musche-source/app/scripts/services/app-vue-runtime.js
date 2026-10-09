import { createApp, ref, computed, onMounted, onUnmounted, watch, reactive, nextTick, shallowRef } from 'vue';

export function createAppVueRuntime() {
    return {
        createApp,
        ref,
        computed,
        onMounted,
        onUnmounted,
        watch,
        reactive,
        nextTick,
        shallowRef,
    };
}
