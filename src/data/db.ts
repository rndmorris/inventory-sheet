import Dexie, { type EntityTable } from 'dexie';
import type { Item, ItemRecord } from './tables';

const db = new Dexie('inventory-list') as Dexie & {
    items: EntityTable<Item, 'id'>;
    records: EntityTable<ItemRecord, 'id'>;
};

db.version(1).stores({
    items: '++id',
    records: '++id',
});

export { db };