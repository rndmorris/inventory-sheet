import { createHashRouter, NavLink, Outlet, RouterProvider } from "react-router-dom";
import { navLink } from "./styles";
import ItemsTab from "./tabs/ItemsTab";
import { InventoryTab } from "./tabs/InventoryTab";
import React from "react";
import "../styles/global.css";

export const tabs: { [key: string]: { label: string, }; } = {
    "items": { label: "Items", },
    "inventory": { label: "Inventory" },
};

export const NavBar = () => {
    return (<nav>
        {Object.keys(tabs).map((key) => (
            <NavLink key={key} className={navLink()} to={`/${key}`} >
                {tabs[key].label}
            </NavLink>
        ))}
    </nav>);
}

export const Layout = () => {
    return (
        <div id="container" className="w-full h-full p-5 box-border">
            <header>
                <h1 className="text-3xl text-white pb-5">
                    Inventory Manager
                </h1>
                <NavBar />
            </header>
            <main className="w-full">
                <Outlet />
            </main>
        </div>
    );
}

const router = createHashRouter([
    {
        path: '',
        element: <Layout />,
        children: [
            { path: '', element: <ItemsTab /> },
            { path: 'items', element: <ItemsTab /> },
            { path: 'inventory', element: <InventoryTab /> },
        ],
    },
]);

export const App = () => {
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}