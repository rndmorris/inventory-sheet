import { useLiveQuery } from "dexie-react-hooks";
import "./Records.css";
import { type ItemRecordHydrated } from "../data/tables";
import { useContext } from "react";
import { EnqueueModalContext } from "./IndexPage";
import { EditItemRecord } from "./modals";
import { dbItems, dbRecords } from "../data/db";

const query = async () => {
  const records = (await dbRecords.toArray()) as ItemRecordHydrated[];
  await Promise.all(
    records.map(async (record) => {
      if (record.itemId != null) {
        record.item = await dbItems.get(record.itemId);
      }
    })
  );

  return records;
};

export function RecordList() {
  const data = useLiveQuery(query);
  return data?.map((record) => <Record key={record.id} record={record} />);
}

export function Record({ record }: { record: ItemRecordHydrated }) {
  const enqueueModal = useContext(EnqueueModalContext);

  if (enqueueModal == null) {
    return null;
  }

  function editItem() {
    if (enqueueModal != null) {
      enqueueModal(<EditItemRecord initialData={record} />);
    }
  }

  return (
    <details>
      <summary>
        <div>
          <b>{record.name ?? record?.item?.name}</b> ({record.quantity})
        </div>

        {enqueueModal != null ? (
          <button className="btn-edit" onClick={editItem}>
            Edit
          </button>
        ) : null}
      </summary>
      {record?.item?.desc != null ? <p>{record?.item.desc}</p> : null}
      {record.desc != null ? <p>{record.desc}</p> : null}
    </details>
  );
}
