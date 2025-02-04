import { useState } from "react";
import type { EditableItem, ItemId } from "../../data/tables";
import {
    getFieldUpdater,
    ModalConfirm,
    ModalWithButtons,
    type ModalButton,
    type ModalProps,
} from "../modals";
import { MUT_ITEMS } from "../../data/db";
import { tryGet, type Out } from "../../data/arrays";
import { label, inputText } from "../styles";

export interface EditItemProps extends ModalProps {
    initialData: EditableItem;
    onSubmit?: (item: ItemId | undefined) => void;
}
export function ModalEditItem(props: EditItemProps) {
    const [data, setData] = useState(props.initialData);

    const [confirmDelete, setConfirmDelete] = useState(false);

    const update = getFieldUpdater(data, setData);

    const saveItem = async () => {
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
    };

    const confirmDeleteCallback = async (confirmed: boolean) => {
        if (!confirmed) {
            return;
        }
        if (data.id == null) {
            return;
        }
        await MUT_ITEMS.delete(data.id, "update");
        props.closeModal();
    };

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

    return (
        <ModalWithButtons
            closeModal={props.closeModal}
            title={data.id == null ? "New Item" : "Edit Item"}
            defaultButton={{ label: "Save Item", type: "submit" }}
            buttons={buttons}
            onSubmit={saveItem}
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
                    resultCallback={confirmDeleteCallback}
                />
            ) : null}
        </ModalWithButtons>
    );
}
