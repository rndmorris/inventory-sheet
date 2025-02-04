import { useLiveQuery } from "dexie-react-hooks";
import { db, MUT_LINE_ITEMS } from "../../data/db";
import {
    buttonPrimary,
    buttonSecondarySmall,
    buttonTertiarySmall,
} from "../styles";
import { CardList } from "../CardList";
import { useState } from "react";
import {
    emptyItem,
    type EditableItem,
    type Item,
} from "../../data/tables";
import { ModalEditItem } from "../modals/EditItem";

export default function ItemsTab() {
    const items = useLiveQuery(() => db.items.toArray());

    const [editData, setEditData] = useState<EditableItem | undefined>(
        undefined
    );

    if (items == null) {
        return null;
    }

    const hideEditModal = () => {
        setEditData(undefined);
    };

    const openEditModal = (forItem: Item) => () => {
        setEditData(forItem);
    };

    return (
        <>
            <CardList
                header={
                    <>
                        <div className="text-2xl">Items</div>
                        <button
                            className={buttonPrimary()}
                            onClick={() => setEditData(emptyItem())}
                        >
                            New Item
                        </button>
                    </>
                }
                cards={items.map((item) => {
                    return {
                        key: item.id,
                        header: (
                            <>
                                <div>
                                    <div className="font-bold">{item.name}</div>
                                    <div>{item.category}</div>
                                </div>
                                <div>
                                    <button
                                        className={buttonTertiarySmall()}
                                        onClick={openEditModal(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={buttonSecondarySmall("ml-2")}
                                        onClick={() =>
                                            MUT_LINE_ITEMS.put({
                                                itemId: item.id,
                                                quantity: 1,
                                            })
                                        }
                                    >
                                        Add
                                    </button>
                                </div>
                            </>
                        ),
                        body: (
                            <>
                                <header className="flex justify-start gap-2">
                                    <span>
                                        <b>Weight</b> {item.weight.toFixed(2)}
                                    </span>
                                    <span>
                                        <b>Value</b> {item.value.toFixed(2)}
                                    </span>
                                </header>
                                <main>{item.desc}</main>
                            </>
                        ),
                    };
                })}
            />
            {editData != null ? (
                <ModalEditItem
                    onSubmit={hideEditModal}
                    closeModal={hideEditModal}
                    initialData={editData}
                />
            ) : null}
        </>
    );
}