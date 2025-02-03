import type { InsertType } from "dexie";

// newtypes: https://kubyshkin.name/posts/newtype-in-typescript/
export type ItemId = number & { readonly __tag: unique symbol; };
export type InvItemId = number & { readonly __tag: unique symbol; };

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

export interface InvItem {
    id: InvItemId;
    itemId: ItemId | null;
    quantity: number;

    // Definition Overrides
    name?: string;
    desc?: string;
    weight?: number;
    value?: number;
}

export function emptyInvItem(): InsertType<InvItem, "id"> {
    return {
        itemId: null,
        quantity: 1,
    };
}
