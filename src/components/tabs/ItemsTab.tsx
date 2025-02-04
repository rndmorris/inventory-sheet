import { useLiveQuery } from "dexie-react-hooks";
import { db, MUT_INV_ITEMS, MUT_ITEMS } from "../../data/db";
import {
    buttonPrimary,
    buttonSecondarySmall,
    buttonTertiarySmall,
    inputText,
    label,
} from "../styles";
import { CardList } from "../CardList";
import { useEffect, useRef, useState } from "react";
import {
    emptyItem,
    type EditableItem,
    type Item,
    type ItemId,
} from "../../data/tables";
import {
    getFieldUpdater,
    ModalWithButtons,
    ModalConfirm,
    type ModalProps,
    type ModalButton,
} from "../modals";
import { tryGet, type Out } from "../../data/arrays";

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
                                            MUT_INV_ITEMS.put({
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

interface EditItemProps extends ModalProps {
    initialData: EditableItem;
    onSubmit?: (item: ItemId | undefined) => void;
}
function ModalEditItem(props: EditItemProps) {
    const [data, setData] = useState(props.initialData);

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        dialogRef.current?.showModal();
        return () => dialogRef.current?.close();
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    const update = getFieldUpdater(data, setData);

    async function updateItem() {
        const putKeys = await MUT_ITEMS.put(data);
        const putKey: Out<ItemId> = { val: undefined! };

        if (tryGet(putKeys, 0, putKey)) {
            console.log("Saved item under id " + putKey.val.toFixed());
        } else {
            console.log("Could not save new item. Check the log.");
        }
        if (props.onSubmit != null) {
            props.onSubmit(putKey.val);
        }
    }

    async function deleteItem() {
        if (data.id == null) {
            return;
        }
        await MUT_ITEMS.delete(data.id, "update");
    }

    const deleteButton: ModalButton = {
        label: "Delete",
        type: "button",
        onPressed: () => setConfirmDelete(true),
    };

    return (
        <ModalWithButtons
            closeModal={props.closeModal}
            title={data.id == null ? "New Item" : "Edit Item"}
            defaultButton={{ label: "Save Item", type: "submit" }}
            buttons={[
                ...(data.id != null ? [deleteButton] : []),
                {
                    label: "Cancel",
                    type: "button",
                    onPressed: () => props.closeModal(),
                },
            ]}
            onSubmit={updateItem}
        >
            <div className="grid grid-cols-2">
                <label className={label()}>Name:</label>
                <input
                    type="text"
                    required={true}
                    defaultValue={data.name}
                    className={inputText()}
                    onChange={update("name")}
                />

                <label className={label()}>Category:</label>
                <input
                    type="text"
                    required={true}
                    defaultValue={data.category}
                    className={inputText()}
                    onChange={update("category")}
                />

                <label className={label()}>Weight:</label>
                <input
                    type="number"
                    required={true}
                    defaultValue={data.weight}
                    className={inputText()}
                    onChange={update("weight", "number")}
                />

                <label className={label()}>Cost:</label>
                <input
                    type="number"
                    required={true}
                    defaultValue={data.value}
                    className={inputText()}
                    onChange={update("value", "number")}
                />

                <div className="col-span-2">
                    <div>
                        <label className={label()}>Description:</label>
                    </div>

                    <textarea
                        required={true}
                        defaultValue={data.desc}
                        className={inputText("w-full")}
                        onChange={update("desc")}
                    ></textarea>
                </div>
            </div>
            {confirmDelete ? (
                <ModalConfirm
                    closeModal={() => setConfirmDelete(false)}
                    title={`Delete ${data.name}?`}
                    children="Items in your inventory will be unlinked."
                    resultCallback={async (result) => {
                        if (result) {
                            await deleteItem();
                            props.closeModal();
                        }
                    }}
                />
            ) : null}
        </ModalWithButtons>
    );
}
