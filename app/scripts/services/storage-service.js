export function createStorageService(storage = globalThis.window?.localStorage) {
  if (
    typeof storage?.getItem !== 'function'
    || typeof storage?.setItem !== 'function'
    || typeof storage?.removeItem !== 'function'
  ) {
    throw new TypeError('createStorageService requires a storage backend with getItem, setItem, and removeItem');
  }

  return {
    getItem(key) {
      return storage.getItem(key);
    },
    setItem(key, value) {
      storage.setItem(key, value);
    },
    removeItem(key) {
      storage.removeItem(key);
    },
    loadData(key) {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    },
    saveData(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
  };
}
