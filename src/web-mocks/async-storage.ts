const store: Record<string, string> = {};

const AsyncStorage = {
    getItem: async (key: string): Promise<string | null> => store[key] ?? null,
    setItem: async (key: string, value: string): Promise<void> => { store[key] = value; },
    removeItem: async (key: string): Promise<void> => { delete store[key]; },
    clear: async (): Promise<void> => { Object.keys(store).forEach(k => delete store[k]); },
    getAllKeys: async (): Promise<string[]> => Object.keys(store),
    multiGet: async (keys: string[]): Promise<[string, string | null][]> =>
        keys.map(k => [k, store[k] ?? null]),
    multiSet: async (pairs: [string, string][]): Promise<void> => {
        pairs.forEach(([k, v]) => { store[k] = v; });
    },
    multiRemove: async (keys: string[]): Promise<void> => {
        keys.forEach(k => delete store[k]);
    },
};

export const useAsyncStorage = (key: string) => ({
    getItem: () => AsyncStorage.getItem(key),
    setItem: (value: string) => AsyncStorage.setItem(key, value),
    removeItem: () => AsyncStorage.removeItem(key),
});

export default AsyncStorage;
