import type { ItemDefinition, ItemRecord } from "../data/db";
import { sampleDefinitions, sampleRecords } from "../data/db";
import './Records.css';

export function RecordList() {

    const rows = sampleRecords.keys().map(key => {
        const rec = sampleRecords.get(key)!;
        const def = rec.definitionId != null ? sampleDefinitions.get(rec.definitionId) : undefined;
        return <Record key={rec.id} definition={def} record={rec} />
    });

    return rows.toArray();
}

export function Record({definition, record} : { definition?: ItemDefinition | null, record: ItemRecord }) {
    return (
        <details>
            <summary>
                <div>
                    <b>{record.name ?? definition?.name}</b> ({record.quantity})
                </div>
                
                <button className="btn-edit">Edit</button>
            </summary>
            {definition?.desc != null ? (<p>{definition.desc}</p>) : null}
            {record.desc != null ? (<p>{record.desc}</p>) : null}
        </details>
    );
}