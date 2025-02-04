'use client';
import { InventoryTab } from "./tabs/InventoryTab";
import { buttonPrimary, buttonPrimaryPressed } from "./styles";
import ItemsTab from "./tabs/ItemsTab";
import type { JSX } from "astro/jsx-runtime";

const tabs: { [key: string]: { label: string, generator: () => JSX.Element }; } = {
    items: { label: "Items", generator: () => <ItemsTab /> },
    inventory: { label: "Inventory", generator: () => <InventoryTab /> },
    //settings: {label: "Settings", generator: () => <SettingsTab />},
};

export default function App({ tab }: { tab: string | undefined }) {

    if (tab == null || tab === '') {
        tab = 'items';
    }

    const tabComponent = tab != null && tab in tabs
        ? tabs[tab].generator()
        : tabs.items.generator();

    return (
        <div id="container" className="w-full h-full p-5 box-border">
            <header>
                <h1 className="text-3xl text-white pb-5">
                    Inventory Manager
                </h1>
                <NavBar tab={tab} />
            </header>
            <main className="w-full">
                {tabComponent}
            </main>
        </div>
    );
}

const NavBar = ({ tab }: { tab: string }) => (
    <nav>
        {Object.keys(tabs).map((key) => (
            <a key={key} className={tab === key ? buttonPrimaryPressed() : buttonPrimary()} href={`${import.meta.env.BASE_URL}/${key}`} >
                {tabs[key].label}
            </a>
        ))}
    </nav>
);