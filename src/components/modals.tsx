import React, { useState } from "react";
import { cloneItemRecord, defaultItem, defaultItemRecord, type Item, type ItemId, type ItemRecord, type ItemRecordId } from "../data/tables";
import { db } from "../data/db";
import { useLiveQuery } from "dexie-react-hooks";

function getFieldUpdater<R>(data: R, setData: (data: R) => void) {
    return function<F extends keyof R, T extends "string" | "number">(field: F, type: T = "string" as T) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            if (type === "string") {
                (data as any)[field] = e.target.value;
            }
            else if (type === "number") {
                (data as any)[field] = Number.parseInt(e.target.value);
            }
            setData(data);
        };
    };
}

export function EditItem({onSubmit, initialData}: { onSubmit: (item: ItemId) => void, initialData?: Item}) {

    const [data, setData] = useState(initialData ?? defaultItem());

    const update = getFieldUpdater(data, setData);

    async function submit() {
        if (initialData == null) {
            delete (data as any).id;
        }
        const putKey = await db.items.put(data);
        console.log("Saved new item under id " + putKey.toFixed());
        onSubmit(putKey);
    }

    return (
        <form method="dialog" >
            <label>Name:</label>
            <input name="name" type="text" required={true} defaultValue={data.name} onChange={update("name")} />

            <label>Description:</label>
            <input name="desc" type="text" defaultValue={data.desc}  onChange={update("desc")} />

            <label>Weight:</label>
            <input name="weight" type="number" defaultValue={data.weight}  onChange={update("weight", "number")} />

            <label>Cost:</label>
            <input name="monetaryValue" type="number" defaultValue={data.monetaryValue} onChange={update("monetaryValue", "number")} />

            <button onClick={submit}>Save Item</button>
        </form>
    );
}

export function EditItemRecord({onSubmit, initialData}: { onSubmit?: (item: ItemRecordId) => void, initialData?: ItemRecord}) {

    const [data, setData] = useState(initialData ?? defaultItemRecord());

    const update = getFieldUpdater(data, setData);

    const items = useLiveQuery(() => db.items.toArray());

    if (items == null) {
        return null;
    }

    async function submit() {
        if (initialData == null) {
            delete (data as any).id;
        }
        const putKey = await db.records.put(cloneItemRecord(data));
        console.log("Saved new item record under id " + putKey.toFixed());
        if (onSubmit != null) {
            onSubmit(putKey);
        }
    }

    return (
        <form method="dialog" >
            <label>Item Type:</label>
            <select onChange={update("itemId", "number")}>
                <option value={undefined}></option>
                {items.toSorted((i1, i2) => i1.name.localeCompare(i2.name)).map(item => <option value={item.id} selected={item.id === data.itemId}>{item.name}</option>)}
            </select>

            <label>Quantity:</label>
            <input type="number" defaultValue={data.quantity} onChange={update("quantity", "number")} />

            <label>Override Name:</label>
            <input type="text" defaultValue={data.name} onChange={update("name")} />

            <label>Override Description:</label>
            <input type="text" defaultValue={data.desc}  onChange={update("desc")} />

            <label>Override Weight:</label>
            <input type="number" defaultValue={data.weight}  onChange={update("weight", "number")} />

            <label>Override Cost:</label>
            <input type="number" defaultValue={data.monetaryValue} onChange={update("monetaryValue", "number")} />

            <button onClick={submit}>Save Item</button>
        </form>
    );
}