import { useSyncExternalStore } from "react";

export function useLocalStorage(key: string) {
    const subscribe = (callback: () => void) => {
        const filter = (event: StorageEvent) => {
            if (event.key !== key) {
                return;
            }
            if (event.storageArea !== window.localStorage) {
                return;
            }
            callback();
        };

        window.addEventListener("storage", filter);
        return () => {
            window.removeEventListener("storage", filter);
        };
    };

    const getSnapshot = () => window.localStorage.getItem(key);

    // we provide a bogus getServerSnapshot method to prevent an error message
    const value = useSyncExternalStore(subscribe, getSnapshot, () => "");
    return value;
}
