import { db, MUT_INV_ITEMS, notNull } from "../../data/db";
import { useLiveQuery } from "dexie-react-hooks";
import {
    type ItemId,
    type EditableInvItem,
    type InvItem,
    type InvItemId,
    type Item,
} from "../../data/tables";
import { CardList } from "../CardList";
import {
    buttonPrimary,
    buttonSecondarySmall,
    inputText,
    label,
} from "../styles";
import { useEffect, useRef, useState } from "react";
import {
    getFieldUpdater,
    ModalConfirm,
    ModalWithButtons,
    type ModalButton,
    type ModalProps,
} from "../modals";
import { tryGet, type Out } from "../../data/arrays";

type InvItemHydrated = Required<InvItem> & {
    invItem: InvItem;
};

async function query(): Promise<InvItemHydrated[]> {
    const invItems = await db.invItems.toArray();

    return await Promise.all(
        invItems.map(async (invItem) => {
            const item =
                invItem.itemId != null
                    ? await db.items.get(invItem.itemId)
                    : null;
            return {
                invItem: invItem,
                id: invItem.id,
                itemId: invItem.itemId,
                quantity: invItem.quantity,
                name: invItem.name ?? item?.name ?? "",
                category: invItem.category ?? item?.category ?? "",
                desc: invItem.desc ?? item?.desc ?? "",
                weight: invItem.weight ?? item?.weight ?? 0,
                value: invItem.value ?? item?.value ?? 0,
            };
        })
    );
}

export function InventoryTab() {
    const invItems = useLiveQuery(query);

    const [editData, setEditData] = useState<EditableInvItem | undefined>(
        undefined
    );

    if (invItems == null) {
        return null;
    }

    const hideEditModal = () => {
        setEditData(undefined);
    };

    const openEditModal = (forItem: InvItem) => () => {
        setEditData(forItem);
    };

    return (
        <>
            <CardList
                header={
                    <>
                        <div className="text-2xl">Inventory</div>
                        <button className={buttonPrimary()}>Add Item</button>
                    </>
                }
                cards={invItems.map((lineItem) => ({
                    key: lineItem.id,
                    header: (
                        <>
                            <div>
                                <div>
                                    <span className="font-bold">
                                        {lineItem.name}
                                    </span>{" "}
                                    ({lineItem.quantity})
                                </div>
                                <div>{lineItem.category}</div>
                            </div>
                            <div>
                                <button
                                    className={buttonSecondarySmall()}
                                    onClick={() => setEditData(lineItem.invItem)}
                                >
                                    Edit
                                </button>
                            </div>
                        </>
                    ),
                    body: (
                        <>
                            <header className="flex justify-start gap-2">
                                <span>
                                    <b>Weight</b> {lineItem?.weight?.toFixed(2)}
                                </span>
                                <span>
                                    <b>Value</b> {lineItem?.value?.toFixed(2)}
                                </span>
                            </header>
                            <main>{lineItem.desc}</main>
                        </>
                    ),
                }))}
            />
            {editData != null ? (
                <ModalEditInvItem
                    initialData={editData}
                    closeModal={() => setEditData(undefined)}
                />
            ) : null}
        </>
    );
}

interface EditInvItemProps extends ModalProps {
    initialData: EditableInvItem;
    onSubmit?: (item: InvItemId | undefined) => void;
}
function ModalEditInvItem(props: EditInvItemProps) {
    const [data, setData] = useState(Object.assign({}, props.initialData));

    const [baseItem, setBaseItem] = useState<Item | undefined>(undefined);
    const baseItems = useLiveQuery(async () =>
        (await db.items.toArray())
            .filter(notNull)
            .reduce((map, i) => map.set(i.id, i), new Map<ItemId, Item>())
    );
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (data.itemId == null) {
            setBaseItem(undefined);
            return;
        }
        setBaseItem(baseItems?.get(data.itemId));
    }, [data, baseItems]);

    useEffect(() => {
        dialogRef.current?.showModal();
        return () => dialogRef.current?.close();
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    const updateField = getFieldUpdater(data, setData);

    async function updateItem() {
        const putKeys = await MUT_INV_ITEMS.put(data);
        const putKey: Out<InvItemId> = { val: undefined! };

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
        await MUT_INV_ITEMS.delete(data.id, "update");
    }

    const deleteButton: ModalButton = {
        label: "Delete",
        type: "button",
        onPressed: () => setConfirmDelete(true),
    };

    return (
        <ModalWithButtons
            closeModal={props.closeModal}
            title={data.id == null ? "Add Line" : "Edit Line"}
            defaultButton={{ label: "Save Item", type: "submit" }}
            buttons={[
                ...(data.id != null ? [deleteButton] : []),
                {
                    label: "Cancel",
                    type: "button",
                    onPressed: () => props.closeModal(),
                },
            ]}
            onSubmit={async () => {
                await updateItem();
                props.closeModal();
            }}
        >
            <div className="grid grid-cols-2">
                <label className={label()}>Item:</label>
                <select onChange={updateField("itemId", "number")}></select>

                <label className={label()}>Name:</label>
                <input
                    type="text"
                    required={data.itemId == null}
                    placeholder={baseItem?.name}
                    defaultValue={data.name}
                    className={inputText()}
                    onChange={updateField("name")}
                />

                <label className={label()}>Category:</label>
                <input
                    type="text"
                    required={data.itemId == null}
                    placeholder={baseItem?.category}
                    defaultValue={data.category}
                    className={inputText()}
                    onChange={updateField("category")}
                />

                <label className={label()}>Weight:</label>
                <input
                    type="number"
                    required={data.itemId == null}
                    placeholder={baseItem?.weight?.toFixed(2)}
                    defaultValue={data.weight}
                    className={inputText()}
                    onChange={updateField("weight", "number")}
                />

                <label className={label()}>Cost:</label>
                <input
                    type="number"
                    required={data.itemId == null}
                    placeholder={baseItem?.value?.toFixed(2)}
                    defaultValue={data.value}
                    className={inputText()}
                    onChange={updateField("value", "number")}
                />

                <div className="col-span-2">
                    <div>
                        <label className={label()}>Description:</label>
                    </div>

                    <textarea
                        required={data.itemId == null}
                        defaultValue={data.desc}
                        placeholder={baseItem?.desc}
                        className={inputText("w-full")}
                        onChange={updateField("desc")}
                    ></textarea>
                </div>
            </div>
            {confirmDelete ? (
                <ModalConfirm
                    closeModal={() => setConfirmDelete(false)}
                    title={`Delete ${data.name ?? baseItem?.name}?`}
                    children=""
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
