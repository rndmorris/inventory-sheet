// newtypes: https://kubyshkin.name/posts/newtype-in-typescript/
export type ItemId = number & { readonly __tag: unique symbol; };
export type ItemRecordId = number & { readonly __tag: unique symbol; };

export interface Item {
    id: ItemId;
    name: string;
    desc: string;
    weight: number;
    monetaryValue: number;

    fields?: CustomFields;
}

export function defaultItem(): Item {
    return {
        id: 0 as ItemId,
        name: "",
        desc: "",
        weight: 0,
        monetaryValue: 0,
    };
}

export function cloneItem({id, name, desc, weight, monetaryValue, fields}: Item): Item {
    return {
        id, name, desc, weight, monetaryValue, fields
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
    monetaryValue?: number;
}

export function defaultItemRecord(): ItemRecord {
    return {
        id: 0 as ItemRecordId,
        itemId: null,
        quantity: 1,
    };
}

export function cloneItemRecord({id, itemId, quantity, fields, name, desc, weight, monetaryValue}: ItemRecord): ItemRecord {
    return {
        id, itemId, quantity, fields, name, desc, weight, monetaryValue
    };
}

export interface CustomFields {
    [key: string]: unknown | undefined | null;
}

export interface ItemRecordHydrated extends ItemRecord {
    item: Item | undefined;
}