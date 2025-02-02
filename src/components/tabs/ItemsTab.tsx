import { useLiveQuery } from "dexie-react-hooks";
import { dbItems } from "../../data/db";
import { buttonPrimary, buttonSecondary, buttonSecondarySmall } from "../styles";
import { loremIpsum } from "../../data/text";
import { useState } from "react";
import type { Item } from "../../data/tables";

export default function ItemsTab() {
    const items = useLiveQuery(() => dbItems.toArray());

    if (items == null) {
        return null;
    }

    async function generateItem() {
        return dbItems.put({
            name: loremIpsum(1 + Math.floor(Math.random() * 4)),
            category: loremIpsum(1),
            desc: loremIpsum(3 + Math.floor(Math.random() * 26)),
            weight: 0,
            value: 0,
        });
    }

    return (<div className="p-2">
        <div className="flex justify-between items-center my-3 bg-neutral-200 py-1 px-2 rounded">
            <div className="text-2xl">Items</div>
            <button className={buttonPrimary()} onClick={generateItem}>+</button>
        </div>
        <div className="flex flex-col gap-2">
            {items.map(item => <ItemCard item={item} />)}
        </div>
    </div>);
}

export function ItemCard({item}: {item: Item}) {
    const [open, setOpen] = useState(false);

    return (<details className="bg-neutral-200 rounded" onToggle={(e) => setOpen(e.newState === "open")}>
        <summary className={"flex justify-between cursor-pointer items-center rounded py-1 px-2 hover:text-(--color-secondary) border-black" + (open ? " border-b-2" : "")} title={open ? "Click to collapse" : "Click to expand"}>
            <div>
                <div className="font-bold">{item.name}</div>
                <div>{item.category}</div>
            </div>
            <button className={buttonSecondarySmall()} onClick={() => dbItems.delete(item.id)}>+</button>                    
        </summary>
        <div className="p-1 px-2">
            <header className="flex justify-start gap-2">
                <span><b>Weight</b> {item.weight.toFixed(2)}</span>
                <span><b>Value</b> {item.value.toFixed(2)}</span>
            </header>
            <main>
                {item.desc}
            </main>
        </div>
    </details>);
}