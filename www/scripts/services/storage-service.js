export function createStorageService(storage = window.localStorage) {
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
