// newtypes: https://kubyshkin.name/posts/newtype-in-typescript/

export type ItemDefinitionId = number & { readonly __tag: unique symbol; };
export type ItemRecordId = number & { readonly __tag: unique symbol; };

export interface ItemDefinition {
    id: ItemDefinitionId;
    name: string;
    desc: string;
    weight: number;
    monetaryValue: number;

    fields?: CustomFields;
}

export interface ItemRecord {
    // Required Fields
    id: ItemRecordId;
    definitionId: ItemDefinitionId | null;
    quantity: number;
    fields?: CustomFields;

    // Definition Overrides
    name?: string;
    desc?: string;
    weight?: number;
    monetaryValue?: number;
}

export interface CustomFields {
    [key: string]: unknown | undefined | null;
}

const sampleDefinitions: Map<ItemDefinitionId, ItemDefinition> = new Map(
    [
        {
            id: 0 as ItemDefinitionId,
            name: "Copper Piece",
            desc: "A copper coin",
            weight: .02,
            monetaryValue: .01,
            fields: {},
        },
        {
            id: 1 as ItemDefinitionId,
            name: "Silver Piece",
            desc: "A silver coin",
            weight: .02,
            monetaryValue: .1,
            fields: {},
        },
        {
            id: 2 as ItemDefinitionId,
            name: "Gold Piece",
            desc: "A gold coin",
            weight: .02,
            monetaryValue: 1,
            fields: {},
        },
    ].map(obj => [obj.id, obj])
);

const sampleRecords: Map<ItemRecordId, ItemRecord> = new Map(
    [
        {
            id: 0 as ItemRecordId,
            definitionId: 0 as ItemDefinitionId,
            quantity: 50,
            fields: {},
        },
        {
            id: 1 as ItemRecordId,
            definitionId: 1 as ItemDefinitionId,
            quantity: 50,
            fields: {},
        },
        {
            id: 2 as ItemRecordId,
            definitionId: 2 as ItemDefinitionId,
            quantity: 50,
            desc: "It is very shiny.",
            fields: {},
        },
        {
            id: 3 as ItemRecordId,
            definitionId: 1 as ItemDefinitionId,
            quantity: 5,
            desc: "Stamped with the face of Count Strahd.",
            fields: {},
        }
    ].map(obj => [obj.id, obj])
);

export { sampleDefinitions, sampleRecords };