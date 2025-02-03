import { useLiveQuery } from "dexie-react-hooks";
import { db, MUT_ITEMS } from "../../data/db";
import { buttonPrimary, buttonSecondarySmall } from "../styles";
import { loremIpsum } from "../../data/text";
import { CardList } from "../CardList";

export default function ItemsTab() {
    const items = useLiveQuery(() => db.items.toArray());

    if (items == null) {
        return null;
    }

    async function generateItem() {
        return MUT_ITEMS.put({
            name: loremIpsum(1 + Math.floor(Math.random() * 4)),
            category: loremIpsum(1),
            desc: loremIpsum(3 + Math.floor(Math.random() * 26)),
            weight: 0,
            value: 0,
        });
    }

    return (
        <CardList header={<>
            <div className="text-2xl">Items</div>
            <button className={buttonPrimary()} onClick={generateItem}>+</button>
        </>} cards={items.map(item => {
            return {
                key: item.id,
                header: <>
                    <div>
                        <div className="font-bold">{item.name}</div>
                        <div>{item.category}</div>
                    </div>
                    <button className={buttonSecondarySmall()} onClick={() => MUT_ITEMS.delete(item.id, "update")}>+</button>                    
                </>,
                body: <>
                    <header className="flex justify-start gap-2">
                        <span><b>Weight</b> {item.weight.toFixed(2)}</span>
                        <span><b>Value</b> {item.value.toFixed(2)}</span>
                    </header>
                    <main>
                        {item.desc}
                    </main>
                </>,
            };
        })} />
    );
}
