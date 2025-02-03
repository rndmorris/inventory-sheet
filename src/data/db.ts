import Dexie, { type EntityTable, type InsertType, type PromiseExtended, type WhereClause } from 'dexie';
import { type Item, type InvItem } from './tables';

const _db = new Dexie('inventory-list') as Dexie & {
    items: EntityTable<Item, "id">;
    invItems: EntityTable<InvItem, 'id'>;
};

_db.version(1).stores({
    items: '++id, category, name',
    invItems: '++id',
});

type RestrictedTable<T, TKey extends keyof T> = Omit<EntityTable<T, TKey>, "bulkAdd" | "bulkPut" | "bulkUpdate" | "add" | "put" | "update">;

export const db: Dexie & {
    items: RestrictedTable<Item, "id">;
    invItems: RestrictedTable<InvItem, "id">;
} = _db;

export type SafePut<T, TKey extends keyof T, TTable extends EntityTable<T, TKey> = EntityTable<T, TKey>> = TTable["put"];

export const putItem: SafePut<Item, "id"> = ({ id, name, category, desc, weight, value: monetaryValue }: InsertType<Item, "id">) => _db.items.put({
    id,
    name,
    category,
    desc,
    weight,
    value: monetaryValue,
});
export const putInvItem: SafePut<InvItem, "id"> = ({ id, itemId, quantity, name, desc, weight, value: monetaryValue }: InsertType<InvItem, "id">) => _db.invItems.put({
    id,
    itemId,
    quantity,
    name,
    desc,
    weight,
    value: monetaryValue,
});
