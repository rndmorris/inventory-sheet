import Dexie, { type EntityTable, type InsertType } from "dexie";
import { type Item, type InvItem, type ItemId } from "./tables";

const _db = new Dexie("inventory-list") as Dexie & {
    items: EntityTable<Item, "id">;
    invItems: EntityTable<InvItem, "id">;
};

_db.version(1).stores({
    items: "++id, category, name",
    invItems: "++id, itemId",
});

type ReadOnlyTable<T, TKey extends keyof T> = Omit<
    EntityTable<T, TKey>,
    | "add"
    | "bulkAdd"
    | "bulkDelete"
    | "bulkPut"
    | "bulkUpdate"
    | "delete"
    | "put"
    | "update"
>;

export const db: Dexie & {
    items: ReadOnlyTable<Item, "id">;
    invItems: ReadOnlyTable<InvItem, "id">;
} = _db;

export type CascadeAction = "none" | "delete" | "update";

interface MutTable<
    T,
    TKey extends keyof T,
    TKeyType = T[TKey],
    TInsert = InsertType<T, TKey>
> {
    /**
     * Delete one or more database records.
     * @param keys The keys of the database records to delete.
     * @param cascadeAction What to do with records that depend on the deleted records. `"none"` does nothing, `"delete"` deletes them, `"update"` will flatten relevant properties from the deleted records onto them.
     */
    delete(
        keys: TKeyType | TKeyType[],
        cascadeAction: CascadeAction
    ): Promise<void>;
    /**
     * Put one or more records into the database. Existing records will be updated, non-existing records will be created.
     * @param items The records to insert or update.
     */
    put(items: TInsert | TInsert[]): Promise<(TKeyType | undefined)[]>;
}

export const MUT_ITEMS: MutTable<Item, "id"> = {
    delete: async (keys, cascadeAction = "update") => {
        keys = Array.isArray(keys) ? keys : [keys];

        const deletedItems: Map<ItemId, Item> =
            cascadeAction !== "none"
                ? await db.items
                      .bulkGet(keys)
                      .then((items) =>
                          items
                              .filter((i) => i != null)
                              .reduce(
                                  (map, item) => map.set(item.id, item),
                                  new Map<ItemId, Item>()
                              )
                      )
                : new Map();
        const children =
            cascadeAction !== "none"
                ? await db.invItems.where("itemId").anyOf(keys).toArray()
                : [];

        if (cascadeAction === "delete") {
            await MUT_INV_ITEMS.delete(
                children.map((invItem) => invItem.id),
                cascadeAction
            );
        } else if (cascadeAction === "update") {
            const toPut = children.map((invItem) => {
                if (invItem.itemId == null) {
                    return invItem;
                }
                const item = deletedItems.get(invItem.itemId);
                invItem.itemId = null;
                if (item == null) {
                    return invItem;
                }
                invItem.name ??= item.name;
                invItem.desc ??= item.desc;
                invItem.weight ??= item.weight;
                invItem.value ??= item.value;
                return invItem;
            });
            await MUT_INV_ITEMS.put(toPut);
        }
        await _db.items.bulkDelete(keys);
    },
    put: async (items: InsertType<Item, "id"> | InsertType<Item, "id">[]) => {
        items = Array.isArray(items) ? items : [items];
        const insert = items.map(
            ({ id, name, category, desc, weight, value: monetaryValue }) => ({
                id,
                name,
                category,
                desc,
                weight,
                value: monetaryValue,
            })
        );
        return await _db.items.bulkPut(insert, { allKeys: true });
    },
};

export const MUT_INV_ITEMS: MutTable<InvItem, "id"> = {
    delete: async (keys, cascadeDelete) => {
        keys = Array.isArray(keys) ? keys : [keys];
        await _db.invItems.bulkDelete(keys);
    },
    put: async (invItems) => {
        invItems = Array.isArray(invItems) ? invItems : [invItems];
        const insert = invItems.map(
            ({ id, itemId, quantity, name, desc, weight, value }) => ({
                id,
                itemId,
                quantity,
                name,
                desc,
                weight,
                value,
            })
        );
        return await _db.invItems.bulkPut(insert, { allKeys: true });
    },
};
