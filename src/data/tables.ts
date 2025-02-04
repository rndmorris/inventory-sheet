import type { InsertType } from "dexie";

// newtypes: https://kubyshkin.name/posts/newtype-in-typescript/
export type ItemId = number & { readonly __tag: unique symbol };
export type InvItemId = number & { readonly __tag: unique symbol };

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

export type EditableInvItem = InsertType<InvItem, "id">;
export interface InvItem {
    id: InvItemId;
    itemId: ItemId | null;
    quantity: number;

    // Definition Overrides
    name?: string;
    category?: string;
    desc?: string;
    weight?: number;
    value?: number;
}
export type OrphanInvItem = InsertType<Required<InvItem>, "id">;

export function emptyInvItem(): InsertType<InvItem, "id"> {
    return {
        itemId: null,
        quantity: 1,
    };
}
