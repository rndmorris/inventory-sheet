import type { InsertType } from "dexie";

// newtypes: https://kubyshkin.name/posts/newtype-in-typescript/
export type ItemId = number & { readonly __tag: unique symbol };
export type LineItemId = number & { readonly __tag: unique symbol };

export interface Item {
    id: ItemId;
    name: string;
    category: string;
    desc: string;
    weight: number;
    value: number;
}

export type EditableItem = InsertType<Item, "id">;
export function emptyItem(): EditableItem {
    return {
        name: "",
        category: "",
        desc: "",
        weight: 0,
        value: 0,
    };
}

export type EditableLineItem = InsertType<LineItem, "id">;
export interface LineItem {
    id: LineItemId;
    itemId: ItemId | null;
    quantity: number;

    // Definition Overrides
    name?: string;
    category?: string;
    desc?: string;
    weight?: number;
    value?: number;
}
export type OrphanLineItem = InsertType<Required<LineItem>, "id">;

export function emptyLineItem(): EditableLineItem {
    return {
        itemId: null,
        quantity: 1,
    };
}
