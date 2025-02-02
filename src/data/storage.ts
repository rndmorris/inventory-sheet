interface LocalStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export const storageLocal: LocalStorage = Object.freeze({
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => {
        const oldValue = storageLocal.getItem(key);
        window.localStorage.setItem(key, value);
        window.dispatchEvent(new StorageEvent("storage", {
            key,
            newValue: value,
            oldValue: oldValue,
            storageArea: window.localStorage,
            url: window.location.href,
        }));
    },
    removeItem: (key: string) => {
        storageLocal.setItem(key, null as any as string);
    }
});
