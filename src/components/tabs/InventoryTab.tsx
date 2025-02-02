import { type ItemRecordHydrated } from "../../data/tables";
import { dbItems, dbRecords } from "../../data/db";

const query = async () => {
  const records = (await dbRecords.toArray()) as ItemRecordHydrated[];
  await Promise.all(
    records.map(async (record) => {
      if (record.itemId != null) {
        record.item = await dbItems.get(record.itemId);
      }
    })
  );

  return records;
};

export function InventoryTab() {
  return <>To-do: build the inventory tab</>;
}
