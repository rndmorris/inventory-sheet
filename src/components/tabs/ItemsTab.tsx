import { useLiveQuery } from "dexie-react-hooks";
import { db, MUT_ITEMS } from "../../data/db";
import { buttonPrimary, buttonPrimarySmall, buttonSecondarySmall, buttonTertiarySmall, inputText, label } from "../styles";
import { CardList } from "../CardList";
import { useEffect, useRef, useState } from "react";
import { emptyItem, type EditableItem, type Item, type ItemId } from "../../data/tables";
import { Dialog, getFieldUpdater, ModalButtons, ModalConfirm, type ModalProps } from "../modals";
import { tryGet, type Out } from "../../data/arrays";

export default function ItemsTab() {
    const items = useLiveQuery(() => db.items.toArray());

    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;;

        return () => {
            mounted.current = false;
        };
    }, [])

    const [modalData, setModalData] = useState<EditableItem | undefined>(undefined);

    if (items == null) {
        return null;
    }

    const hide = () => {
        setModalData(undefined);
    }

    const editItem = (item: Item) => {
        return () => {
            setModalData(item);
        };
    }

    return (
        <>
            <CardList header={<>
                <div className="text-2xl">Items</div>
                <button className={buttonPrimary()} onClick={() => setModalData(emptyItem())}>New Item</button>
            </>} cards={items.map(item => {
                return {
                    key: item.id,
                    header: <>
                        <div>
                            <div className="font-bold">{item.name}</div>
                            <div>{item.category}</div>
                        </div>
                        <div>
                            <button className={buttonTertiarySmall()} onClick={editItem(item)}>Edit</button>
                            <button className={buttonSecondarySmall("ml-2")} onClick={() => MUT_ITEMS.delete(item.id, "update")}>Add</button>
                        </div>
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
            {modalData != null ? <ModalEditItem onSubmit={hide} close={hide} initialData={modalData} /> : null}
        </>
    );
}

interface EditItemProps extends ModalProps {
    initialData: EditableItem;
    onSubmit?: (item: ItemId | undefined) => void;
}
export function ModalEditItem(props: EditItemProps) {
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
        }
        else {
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

    return (
        <Dialog close={props.close} title={data.id == null ? "New Item" : "Edit Item"}>
            <form method="dialog" onSubmit={updateItem} className="grid grid-cols-2">
                <label className={label()}>Name:</label>
                <input
                    type="text"
                    required={true}
                    defaultValue={data.name}
                    className={inputText()}
                    onChange={update("name")}
                />

                <label className={label()}>Category:</label>
                <input type="text" required={true} defaultValue={data.category} className={inputText()} onChange={update("category")} />

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

                    <textarea required={true} defaultValue={data.desc} className={inputText("w-full")} onChange={update("desc")}>



                    </textarea>
                </div>

                <div className="w-full flex justify-end col-span-2 pt-3 gap-1">
                    {data.id != null
                        ? <button className={buttonSecondarySmall()} type="button" onClick={() => setConfirmDelete(true)} >Delete</button>
                        : null}
                    <button className={buttonSecondarySmall()} type="button" onClick={props.close}>Cancel</button>
                    <button className={buttonPrimarySmall()} type="submit">Save Item</button>
                </div>
            </form>
            {confirmDelete
                ? <ModalConfirm
                    close={() => setConfirmDelete(false)}
                    title={`Delete ${data.name}?`}
                    text="Items in your inventory will be unlinked."
                    resultCallback={async (result) => {
                        if (result) {
                            await deleteItem();
                            props.close();
                        }
                    }} />
                : null}
        </Dialog>
    );
}