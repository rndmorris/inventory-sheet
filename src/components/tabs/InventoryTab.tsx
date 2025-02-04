import { db, queries, type FlattenedLineItem } from "../../data/db";
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

export function InventoryTab() {
    const lineItemsQuery = useLiveQuery(queries.getFlattenedLineItems());

    const [editData, setEditData] = useState<EditableLineItem | undefined>(
        undefined
    );

    if (lineItemsQuery?.completed !== true) {
        return null;
    }
    const lineItems = lineItemsQuery.result;

    const hideEditModal = () => {
        setEditData(undefined);
    };

    return (
        <>
            <CardList
                header={<Header setEditData={setEditData} />}
                cards={cards(lineItems, setEditData)}
            />
            {editData != null ? (
        <ModalEditLineItem initialData={editData} closeModal={hideEditModal} onSubmit={hideEditModal} />
    ) : null}
        </>
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
    lineItems: FlattenedLineItem[],
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
    lineItem: FlattenedLineItem;
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

const CardBody = ({ lineItem }: { lineItem: FlattenedLineItem }) => (
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

