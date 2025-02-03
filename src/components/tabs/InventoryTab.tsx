import { db, putInvItem } from "../../data/db";
import { useLiveQuery } from "dexie-react-hooks";
import type { InvItem, Item, ItemId } from "../../data/tables";
import { CardList } from "../CardList";
import { buttonPrimary, buttonSecondarySmall } from "../styles";

type InvItemHydrated = Required<InvItem>;

async function query(): Promise<InvItemHydrated[]>  {
  const invItems = await db.invItems.toArray();

  return await Promise.all(invItems.map(async invItem => {
    const item = invItem.itemId != null ? await db.items.get(invItem.itemId) : null;
    return {
      id: invItem.id,
      itemId: invItem.itemId,
      quantity: invItem.quantity,
      name: invItem.name ?? item?.name ?? "",
      desc: invItem.desc ?? item?.desc ?? "",
      weight: invItem.weight ?? item?.weight ?? 0,
      value: invItem.value ?? item?.value ?? 0,
    };
  }));
}

export function InventoryTab() {
  const invItems = useLiveQuery(query);

  if (invItems == null) {
    return null;
  }

  async function generateInvItem() {
    const items = await db.items.toArray();
    return putInvItem({
      itemId: items[Math.floor(Math.random() * items.length)].id,
      quantity: 1 + Math.floor(Math.random() * 50),
    });
  }

  return (<CardList
    header={<>
      <div className="text-2xl">Inventory</div>
      <button className={buttonPrimary()} onClick={generateInvItem} >+</button>
    </>}
    cards={invItems.map(invItem => ({
      key: invItem.id,
      header: <>
        <span>
          <span className="font-bold">{invItem.name}</span> ({invItem.quantity})
        </span>
        <button className={buttonSecondarySmall()} onClick={() => db.invItems.delete(invItem.id)}>-</button>                    
      </>,
      body: <>
        <header className="flex justify-start gap-2">
            <span><b>Weight</b> {invItem?.weight?.toFixed(2)}</span>
            <span><b>Value</b> {invItem?.value?.toFixed(2)}</span>
        </header>
        <main>
            {invItem.desc}
        </main>
      </>,
    })
  )} />);
}
