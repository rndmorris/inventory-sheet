import { useLiveQuery } from "dexie-react-hooks";
import { dbItems } from "../../data/db";
import { buttonPrimary, buttonSecondary } from "../styles";
import { loremIpsum } from "../../data/testdb";

export default function ItemsTab() {
    const items = useLiveQuery(() => dbItems.toArray());

    if (items == null) {
        return null;
    }

    async function generateItem() {
        return dbItems.put({
            name: loremIpsum(1 + Math.floor(Math.random() * 4)),
            category: "Item",
            desc: loremIpsum(3 + Math.floor(Math.random() * 26)),
            weight: 0,
            value: 0,
        });
    }

    return (<div className="table w-full relative border-separate border-spacing-1 md:table-fixed bg-white">
        <div className="table-header-group top-0 sticky z-1 font-bold bg-white">
            <div className="table-cell text-center w-1">Category</div>
            <div className="table-cell w-1">Name</div>
            <div className="table-cell w-10">Description</div>
            <div className="table-cell text-center w-0.5">Weight</div>
            <div className="table-cell text-center w-0.5">Value</div>
            <div className="table-cell text-center w-0.5">
                <button className={buttonPrimary()} onClick={generateItem}>+</button>
            </div>
        </div>
        <div className="table-row-group overflow-scroll h-auto">
            {items.map(item => (<div key={item.id} className="table-row border border-black">
                <div className="table-cell text-center overflow-x-clip text-nowrap text-ellipsis">{item.category}</div>
                <div className="table-cell overflow-x-clip text-nowrap text-ellipsis">{item.name}</div>
                <div className="table-cell overflow-x-clip text-nowrap text-ellipsis">{item.desc}</div>
                <div className="table-cell text-center">{item.weight.toFixed(2)}</div>
                <div className="table-cell text-center">{item.value.toFixed(2)}</div>
                <div className="table-cell text-center">
                    <button className={buttonSecondary()} onClick={() => dbItems.delete(item.id)}>
                        X
                    </button>
                </div>
            </div>))}
        </div>
    </div>);
}