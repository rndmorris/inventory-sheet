import Dexie, { type EntityTable, type InsertType } from "dexie";
import {
    type Item,
    type LineItem,
    type ItemId,
    type OrphanLineItem,
    type LineItemId,
} from "./tables";

const _db = new Dexie("inventory-list") as Dexie & {
    items: EntityTable<Item, "id">;
    lineItems: EntityTable<LineItem, "id">;
};

_db.version(1).stores({
    items: "++id, category, name",
    lineItems: "++id, itemId",
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
    lineItems: ReadOnlyTable<LineItem, "id">;
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
                ? await db.lineItems.where("itemId").anyOf(keys).toArray()
                : [];

        if (cascadeAction === "delete") {
            await MUT_LINE_ITEMS.delete(
                children.map((lineItem) => lineItem.id),
                cascadeAction
            );
        } else if (cascadeAction === "update") {
            await MUT_LINE_ITEMS.orphan(children);
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

interface MutLineItems extends MutTable<LineItem, "id"> {
    /**
     * Unset the `itemId` of one or more `LineItem`s, and set the value of the `LineItem`s empty override fields to those of the parent `Item`s'.
     * @param keys The keys of the `LineItem`s to orphan
     * @returns The keys of the orphaned `LineItem`s
     */
    orphan(keys: LineItemId[]): Promise<(LineItemId | undefined)[]>;
    /**
     * Unset the `itemId` of one or more `LineItem`s, and set the value of the `LineItem`s empty override fields to those of the parent `Item`s'.
     * @param lineItems The `LineItem`s to orphan.
     * @returns The keys of the orphaned `LineItem`s
     */
    orphan(LineItems: LineItem[]): Promise<(LineItemId | undefined)[]>;
}

export const MUT_LINE_ITEMS: MutLineItems = {
    delete: async (keys, cascadeDelete) => {
        keys = Array.isArray(keys) ? keys : [keys];
        await _db.lineItems.bulkDelete(keys);
    },
    put: async (lineItems) => {
        lineItems = Array.isArray(lineItems) ? lineItems : [lineItems];
        const insert = lineItems.map(
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
        return await _db.lineItems.bulkPut(insert, { allKeys: true });
    },
    orphan: async (arg1: LineItemId[] | LineItem[]) => {
        if (arg1.length < 1) {
            return [];
        }

        const lineItems = (
            isLineItemIds(arg1) ? await db.lineItems.bulkGet(arg1) : arg1
        ).filter((i) => i != null);

        const items = (await db.items.bulkGet(lineItems.map(i => i.itemId).filter(notNull))).filter(notNull).reduce(
            (map, i) => map.set(i.id, i), new Map<ItemId, Item>()
        );

        const orphan: (lineItem: LineItem) => OrphanLineItem | null = (
            lineItem
        ) => {
            if (lineItem.itemId == null) {
                return null;
            }
            const item = items.get(lineItem.itemId);
            lineItem.itemId = null;
            if (item == null) {
                return null;
            }

            return {
                id: lineItem.id,
                itemId: null,
                quantity: lineItem.quantity,

                name: lineItem.name ?? item.name,
                category: lineItem.category ?? item.category,
                desc: lineItem.desc ?? item.desc,
                weight: lineItem.weight ?? item.weight,
                value: lineItem.value ?? item.value,
            };
        };
        return await MUT_LINE_ITEMS.put(lineItems.map(orphan).filter(notNull));
    },
};

const isLineItemIds = (arr: LineItemId[] | LineItem[]): arr is LineItemId[] => {
    if (arr.length < 1) {
        return false;
    }
    return typeof arr[0] === "number";
};
export const notNull = <T>(t: T) => t != null;

export interface LiveQueryResult<T> {
    completed: true;
    result: T;
};
export type AsyncLiveQueryResult<T> = Promise<LiveQueryResult<T>>;

export const queries = {
    getFlattenedLineItems: () => async (): AsyncLiveQueryResult<FlattenedLineItem[]> => {
        const lineItems = await db.lineItems.toArray();

        const result = await Promise.all(
            lineItems.map(async (lineItem) => {
                const item =
                    lineItem.itemId != null
                        ? await db.items.get(lineItem.itemId)
                        : null;
                return {
                    lineItem: lineItem,
                    id: lineItem.id,
                    itemId: lineItem.itemId,
                    quantity: lineItem.quantity,
                    name: lineItem.name ?? item?.name ?? "",
                    category: lineItem.category ?? item?.category ?? "",
                    desc: lineItem.desc ?? item?.desc ?? "",
                    weight: lineItem.weight ?? item?.weight ?? 0,
                    value: lineItem.value ?? item?.value ?? 0,
                };
            })
        );

        return {
            completed: true,
            result,
        };
    },
    getItem: (key: ItemId | null) => async (): AsyncLiveQueryResult<Item | null> => {
        if (key == null) {
            return {
                completed: true,
                result: null,
            };
        }
        const result = await db.items.get(key);
        return {
            completed: true,
            result: result ?? null, // collapse undefined into null
        }
    }
}

export type FlattenedLineItem = Required<LineItem> & {
    lineItem: LineItem;
};