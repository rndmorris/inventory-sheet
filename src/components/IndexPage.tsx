'use client';
import { InventoryTab } from "./tabs/InventoryTab";
import React, { createContext } from "react";
import { buttonPrimary, buttonPrimaryPressed } from "./styles";
import ItemsTab from "./tabs/ItemsTab";
import SettingsTab from "./tabs/SettingsTab";
import { useLocalStorage } from "./hooks";
import type { JSX } from "astro/jsx-runtime";
import { storageLocal } from "../data/storage";

export const OpenModalContext = createContext<
    ((modal: React.ReactNode) => void) | undefined
>(undefined);

export const ExitModalContext = createContext<(() => void) | undefined>(undefined);

const tabs: { [key: string]: () => JSX.Element; } = {
    items: () => <ItemsTab />,
    inventory: () => <InventoryTab />,
    settings: () => <SettingsTab />,
};

export default function IndexPage() {
    const storageKey = "openTab";
    const openTab = useLocalStorage(storageKey) ?? "items";
    const tabComponent = openTab != null && openTab in tabs
        ? tabs[openTab]()
        : tabs.items();
    
    const changeTab = (event: React.ChangeEvent<HTMLInputElement>) => {
        storageLocal.setItem(storageKey, event.target.value);
    };
    
    return (
        <OpenModalContext.Provider value={undefined}>
            <ExitModalContext.Provider  value={undefined}>
                <div id="container" className="w-full h-full p-5 box-border">
                    <header>
                        <h1 className="text-3xl text-white pb-5">
                            Character Inventory Manager
                        </h1>
                        <nav>
                            {[["items", "Item List"], ["inventory", "Inventory"], ["settings", "Settings"]].map(([key, label]) => (
                                <label key={key} className={openTab === key ? buttonPrimaryPressed() : buttonPrimary()}>
                                    {label}
                                    <input type="radio" name="open-tab" className="hidden" onChange={changeTab} value={key} defaultChecked={openTab === key} />
                                </label>
                            ))}
                        </nav>
                    </header>
                    <main className="bg-white w-full">
                        {tabComponent}
                    </main>
                </div>
            </ExitModalContext.Provider>
        </OpenModalContext.Provider>
    );
}
