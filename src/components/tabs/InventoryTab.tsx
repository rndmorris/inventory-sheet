import { db } from "../../data/db";
import { useLiveQuery } from "dexie-react-hooks";
import {
    emptyLineItem,
    type EditableLineItem,
    type LineItem,
} from "../../data/tables";
import { CardList } from "../CardList";
import { buttonPrimary, buttonSecondarySmall } from "../styles";
import { useState } from "react";
import { ModalEditLineItem } from "../modals/EditLineItem";

type LineItemFlattened = Required<LineItem> & {
    lineItem: LineItem;
};

export function InventoryTab() {
    const lineItems = useLiveQuery(getFlattenedLineItems);

    const [editData, setEditData] = useState<EditableLineItem | undefined>(
        undefined
    );

    if (lineItems == null) {
        return null;
    }

    return (
        <>
            <CardList
                header={<Header setEditData={setEditData} />}
                cards={cards(lineItems, setEditData)}
            />
            <EditModal
                editData={editData}
                closeModal={() => setEditData(undefined)}
            />
        </>
    );
}

async function getFlattenedLineItems(): Promise<LineItemFlattened[]> {
    const lineItems = await db.lineItems.toArray();

    return await Promise.all(
        lineItems.map(async (lineItem) => {
            const item =
                lineItem.itemId != null
                    ? await db.items.get(lineItem.itemId)
                    : null;
            return {
                lineItem: lineItem,
                id: lineItem.id,
                itemId: lineItem.itemId,
                quantity: lineItem.quantity,
                name: lineItem.name ?? item?.name ?? "",
                category: lineItem.category ?? item?.category ?? "",
                desc: lineItem.desc ?? item?.desc ?? "",
                weight: lineItem.weight ?? item?.weight ?? 0,
                value: lineItem.value ?? item?.value ?? 0,
            };
        })
    );
}

const Header = ({
    setEditData,
}: {
    setEditData: (lineItem: EditableLineItem) => void;
}) => (
    <>
        <div className="text-2xl">Inventory</div>
        <button
            className={buttonPrimary()}
            onClick={() => setEditData(emptyLineItem())}
        >
            Add Item
        </button>
    </>
);

const cards = (
    lineItems: LineItemFlattened[],
    setEditData: (lineItem: LineItem) => void
) =>
    lineItems?.map((lineItem) => ({
        key: lineItem.id,
        header: <CardHeader lineItem={lineItem} setEditData={setEditData} />,
        body: <CardBody lineItem={lineItem} />,
    }));

const CardHeader = ({
    lineItem,
    setEditData,
}: {
    lineItem: LineItemFlattened;
    setEditData: (lineItem: LineItem) => void;
}) => (
    <>
        <div>
            <div>
                <span className="font-bold">{lineItem.name}</span> (
                {lineItem.quantity})
            </div>
            <div>{lineItem.category}</div>
        </div>
        <div>
            <button
                className={buttonSecondarySmall()}
                onClick={() => setEditData(lineItem.lineItem)}
            >
                Edit
            </button>
        </div>
    </>
);

const CardBody = ({ lineItem }: { lineItem: LineItemFlattened }) => (
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
);

const EditModal = ({
    editData,
    closeModal,
}: {
    editData: EditableLineItem | undefined;
    closeModal: () => void;
}) =>
    editData != null ? (
        <ModalEditLineItem initialData={editData} closeModal={closeModal} />
    ) : null;
