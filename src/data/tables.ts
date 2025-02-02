import type { InsertType } from "dexie";

// newtypes: https://kubyshkin.name/posts/newtype-in-typescript/
export type ItemId = number & { readonly __tag: unique symbol; };
export type ItemRecordId = number & { readonly __tag: unique symbol; };

export interface Item {
    id: ItemId;
    name: string;
    category: string;
    desc: string;
    weight: number;
    value: number;
}

export function emptyItem(): InsertType<Item, "id"> {
    return {
        name: "",
        category: "",
        desc: "",
        weight: 0,
        value: 0,
    };
}

export interface ItemRecord {
    // Required Fields
    id: ItemRecordId;
    itemId: ItemId | null;
    quantity: number;
    fields?: CustomFields;

    // Definition Overrides
    name?: string;
    desc?: string;
    weight?: number;
    value?: number;
}

export function emptyItemRecord(): InsertType<ItemRecord, "id"> {
    return {
        itemId: null,
        quantity: 1,
    };
}

export interface CustomFields {
    [key: string]: unknown | undefined | null;
}

export interface ItemRecordHydrated extends ItemRecord {
    item: Item | undefined;
}