import { useState } from "react";
import type {
    EditableLineItem,
    LineItemId,
} from "../../data/tables";
import {
    getFieldUpdater,
    ModalConfirm,
    ModalWithButtons,
    type ModalButton,
    type ModalProps,
} from "../modals";
import { MUT_LINE_ITEMS, queries } from "../../data/db";
import { inputText, label } from "../styles";
import { tryGet, type Out } from "../../data/arrays";
import { useLiveQuery } from "dexie-react-hooks";

interface EditItemProps extends ModalProps {
    initialData: EditableLineItem;
    onSubmit?: (item: LineItemId | undefined) => void;
}
export function ModalEditLineItem(props: EditItemProps) {
    const [data, setData] = useState(props.initialData);
    const baseItemQuery = useLiveQuery(queries.getItem(data.itemId), [data]);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const update = getFieldUpdater(data, setData);

    // exit early until the query returns
    if (baseItemQuery?.completed !== true) {
        return null;
    }
    const baseItem = baseItemQuery.result;

    const saveLineItem = async () => {
        const putKeys = await MUT_LINE_ITEMS.put(data);
        const putKey: Out<LineItemId> = { val: undefined! };

        if (tryGet(putKeys, 0, putKey)) {
            console.log("Saved item under id " + putKey.val.toFixed());
        } else {
            console.log("Could not save new item. Check the log.");
        }
        if (props.onSubmit != null) {
            props.onSubmit(putKey.val);
        }
    }

    const confirmDeleteCallback = async (confirmed: boolean) => {
        if (!confirmed) {
            return;
        }
        if (data.id == null) {
            return;
        }
        await MUT_LINE_ITEMS.delete(data.id, "update");
        props.closeModal();
    };

    const buttons = (() => {
        const buttons: ModalButton[] = [
            {
                label: "Cancel",
                type: "button",
                onPressed: () => props.closeModal(),
            },
        ];
        if (data.id != null) {
            buttons.unshift({
                label: "Delete",
                type: "button",
                onPressed: () => setConfirmDelete(true),
            });
        }
        return buttons;
    })();

    const overridesRequired = data.itemId == null;

    return (
        <ModalWithButtons
            closeModal={props.closeModal}
            title={data.id == null ? "New Item" : `Edit ${data.name ?? baseItem?.name ?? "Item"}`}
            defaultButton={{ label: "Save Item", type: "submit" }}
            buttons={buttons}
            onSubmit={saveLineItem}
        >
            <div className="grid grid-cols-2">
                <label className={label()}>Name:</label>
                <input
                    type="text"
                    placeholder={baseItem?.name}
                    required={overridesRequired}
                    defaultValue={data.name}
                    className={inputText()}
                    onChange={update("name")}
                />

                <label className={label()}>Category:</label>
                <input
                    type="text"
                    placeholder={baseItem?.category}
                    required={overridesRequired}
                    defaultValue={data.category}
                    className={inputText()}
                    onChange={update("category")}
                />

                <label className={label()}>Weight:</label>
                <input
                    type="number"
                    placeholder={baseItem?.weight?.toFixed(2)}
                    required={overridesRequired}
                    defaultValue={data.weight}
                    className={inputText()}
                    onChange={update("weight", "number")}
                />

                <label className={label()}>Value:</label>
                <input
                    type="number"
                    placeholder={baseItem?.value?.toFixed(2)}
                    required={overridesRequired}
                    defaultValue={data.value}
                    className={inputText()}
                    onChange={update("value", "number")}
                />

                <label className={label()}>Quantity</label>
                <input
                    type="number"
                    required={true}
                    defaultValue={data.quantity}
                    className={inputText()}
                    onChange={update("quantity", "number")}
                />

                <div className="col-span-2">
                    <div>
                        <label className={label()}>Description:</label>
                    </div>

                    <textarea
                        placeholder={baseItem?.desc}
                        required={overridesRequired}
                        defaultValue={data.desc}
                        className={inputText("w-full")}
                        onChange={update("desc")}
                    ></textarea>
                </div>
            </div>
            {confirmDelete ? (
                <ModalConfirm
                    closeModal={() => setConfirmDelete(false)}
                    title={`Delete ${data.name ?? baseItem?.name ?? "Item"}?`}
                    children={<></>}
                    resultCallback={confirmDeleteCallback}
                />
            ) : null}
        </ModalWithButtons>
    );
}
