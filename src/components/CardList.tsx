import type { JSX } from "astro/jsx-runtime";
import { useState } from "react";

export function CardList({header, cards}: { header: JSX.Element, cards: CardProps[], }) {
    return (<div className="p-2">
        <div className="flex justify-between items-center my-3 bg-neutral-200 py-1 px-2 rounded">
            {header}
        </div>
        <div className="flex flex-col gap-2">
            {cards.map(card => <Card key={card.key} header={card.header} body={card.body} />)}
        </div>
    </div>);
}

export interface CardProps { key: any, header: JSX.Element, body: JSX.Element, }
export function Card({ key, header, body, }: CardProps) {
    const [open, setOpen] = useState(false);
    return (
        <details key={key} className="bg-neutral-200 rounded" onToggle={(e) => setOpen(e.newState === "open")}>
            <summary className={"flex justify-between cursor-pointer items-center rounded py-1 px-2 hover:text-(--color-secondary) border-black" + (open ? " border-b-2" : "")} title={open ? "Click to collapse" : "Click to expand"}>
                {header}
            </summary>
            <div className="p-1 px-2">
                {body}
            </div>
        </details>
    );
}