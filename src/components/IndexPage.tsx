'use client';
import { InventoryTab } from "./tabs/InventoryTab";
import React, { createContext, useState } from "react";
import { buttonPrimary, buttonPrimaryPressed } from "./styles";
import ItemsTab from "./tabs/ItemsTab";
import type { JSX } from "astro/jsx-runtime";

export const OpenModalContext = createContext<
    ((modal: React.ReactNode) => void) | undefined
>(undefined);

export const ExitModalContext = createContext<(() => void) | undefined>(undefined);

const tabs: { [key: string]: {label: string, generator: () => JSX.Element}; } = {
    items: {label: "Items", generator: () => <ItemsTab />},
    inventory: {label: "Inventory", generator: () => <InventoryTab />},
    //settings: {label: "Settings", generator: () => <SettingsTab />},
};

export default function IndexPage() {
    const [openTab, setOpenTab] = useState("items");

    const tabComponent = openTab != null && openTab in tabs
        ? tabs[openTab].generator()
        : tabs.items.generator();
    
    const changeTab = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOpenTab(event.target.value);
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
                            {Object.keys(tabs).map((key) => (
                                <label key={key} className={openTab === key ? buttonPrimaryPressed() : buttonPrimary()} >
                                    {tabs[key].label}
                                    <input type="radio" name="open-tab" className="hidden" onChange={changeTab} value={key} defaultChecked={openTab === key} />
                                </label>
                            ))}
                        </nav>
                    </header>
                    <main className="w-full">
                        {tabComponent}
                    </main>
                </div>
            </ExitModalContext.Provider>
        </OpenModalContext.Provider>
    );
}
