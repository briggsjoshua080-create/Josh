import "fake-indexeddb/auto";

/**
 * Test environment shims. The suite runs in plain Node (no jsdom) to stay fast,
 * but the data layer touches two browser globals: IndexedDB, provided by
 * fake-indexeddb above, and localStorage, which `resetAllData` clears.
 *
 * This is a real Storage-shaped stub rather than a partial object, so code under
 * test hits the same API surface a browser gives it.
 */
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  const localStorageStub: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => void store.delete(key),
    setItem: (key, value) => void store.set(String(key), String(value)),
  };
  // Object.keys(localStorage) is how resetAllData enumerates keys, so the stub
  // must expose them as own enumerable properties, not just via key()/getItem().
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new Proxy(localStorageStub, {
      get: (target, prop) =>
        prop in target ? target[prop as keyof Storage] : store.get(String(prop)),
      set: (_target, prop, value) => {
        store.set(String(prop), String(value));
        return true;
      },
      deleteProperty: (_target, prop) => store.delete(String(prop)),
      has: (target, prop) => prop in target || store.has(String(prop)),
      ownKeys: () => [...store.keys()],
      getOwnPropertyDescriptor: (_target, prop) =>
        store.has(String(prop))
          ? { configurable: true, enumerable: true, value: store.get(String(prop)) }
          : undefined,
    }),
  });
}
