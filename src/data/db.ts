import Dexie, { type EntityTable, type InsertType, type PromiseExtended } from 'dexie';
import { type Item, type ItemRecord } from './tables';

const db = new Dexie('inventory-list') as Dexie & {
    items: EntityTable<Item, 'id'>;
    records: EntityTable<ItemRecord, 'id'>;
};

db.version(1).stores({
    items: '++id, category, name',
    records: '++id',
});

export interface Repository<T, TKey extends keyof T, TKeyProp = T[TKey]> {
    toArray(): PromiseExtended<T[]>;
    get(key: TKeyProp): PromiseExtended<T | undefined>;
    put(item: InsertType<T, TKey>): PromiseExtended<TKeyProp>;
    delete(key: TKeyProp): PromiseExtended<void>;
}

export const dbItems: Repository<Item, `id`> = {
    toArray: () => db.items.toArray(),
    get: (key) => db.items.get(key),
    put: ({ id, name, category, desc, weight, value: monetaryValue }: InsertType<Item, "id">) => db.items.put({
        id,
        name,
        category,
        desc,
        weight,
        value: monetaryValue,
    }),
    delete: (key) => db.items.delete(key),
};

export const dbRecords: Repository<ItemRecord, `id`> = {
    toArray: () => db.records.toArray(),
    get: (key) => db.records.get(key),
    put: ({ id, itemId, quantity, fields, name, desc, weight, value: monetaryValue }: InsertType<ItemRecord, "id">) => db.records.put({
        id,
        itemId,
        quantity,
        fields,
        name,
        desc,
        weight,
        value: monetaryValue,
    }),
    delete: (key) => db.records.delete(key),
}