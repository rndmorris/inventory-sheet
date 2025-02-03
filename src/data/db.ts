import Dexie, { type EntityTable, type InsertType, type PromiseExtended, type WhereClause } from 'dexie';
import { type Item, type InvItem, type ItemId, type InvItemId } from './tables';

const _db = new Dexie('inventory-list') as Dexie & {
    items: EntityTable<Item, "id">;
    invItems: EntityTable<InvItem, 'id'>;
};

_db.version(1).stores({
    items: '++id, category, name',
    invItems: '++id, itemId',
});

type ReadOnlyTable<T, TKey extends keyof T> = Omit<EntityTable<T, TKey>, "add" | "bulkAdd" | "bulkDelete" | "bulkPut" | "bulkUpdate" | "delete" | "put" | "update">;

export const db: Dexie & {
    items: ReadOnlyTable<Item, "id">;
    invItems: ReadOnlyTable<InvItem, "id">;
} = _db;

export const deleteItem = async (keys: ItemId | ItemId[], cascadeDelete: boolean = true) => {
    keys = Array.isArray(keys) ? keys : [keys];
    await _db.items.bulkDelete(keys);
    if (cascadeDelete) {
        const toDelete = await db.invItems.where("itemId").anyOf(keys).toArray();
        await deleteInvItem(toDelete.map(invItem => invItem.id));
    }
};

export const deleteInvItem = async (keys: InvItemId | InvItemId[], cascadeDelete: boolean = true) => {
    keys = Array.isArray(keys) ? keys : [keys];
    await _db.invItems.bulkDelete(keys);
};

export const putItem = async (items: InsertType<Item, "id"> | InsertType<Item, "id">[]) => {
    items = Array.isArray(items) ? items : [items];
    const insert = items.map(({ id, name, category, desc, weight, value: monetaryValue }) => ({
        id,
        name,
        category,
        desc,
        weight,
        value: monetaryValue,
    }));
    await _db.items.bulkPut(insert);
};

export const putInvItem = async (invItems: InsertType<InvItem, "id"> | InsertType<InvItem, "id">[]) => {
    invItems = Array.isArray(invItems) ? invItems : [invItems];
    const insert = invItems.map(({ id, itemId, quantity, name, desc, weight, value }) => ({
        id,
        itemId,
        quantity,
        name,
        desc,
        weight,
        value,
    }));
    await _db.invItems.bulkPut(insert);
}