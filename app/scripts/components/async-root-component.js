import { defineAsyncComponent } from 'vue';

export function createAsyncRootComponent(loader, exportName) {
  return defineAsyncComponent(() => loader().then((module) => module[exportName]));
}
