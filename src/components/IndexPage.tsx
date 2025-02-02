import { RecordList } from "./Records";
import React, { createContext, useEffect, useRef, useState } from "react";
import { EditItem, EditItemRecord } from "./modals";
import { buttonPrimary, buttonSecondary } from "./styles";

export const OpenModalContext = createContext<
    ((modal: React.ReactNode) => void) | undefined
>(undefined);

export const ExitModalContext = createContext<(() => void) | undefined>(undefined);

export default function IndexPage() {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [modalQueue, setModalQueue] = useState<React.ReactNode[]>([]);

    const openModal = (modal: React.ReactNode) => {
        setModalQueue(modalQueue.concat(modal));
    };

    const dequeueModal = () => {
        setModalQueue(modalQueue.slice(1));
    };

    const openAddItemModal = () => {
        openModal(<EditItem onSubmit={dequeueModal} />);
    };

    const openAddItemRecordModal = () => {
        openModal(<EditItemRecord onSubmit={dequeueModal} />);
    };

    useEffect(() => {
        if (modalQueue.length > 0 && dialogRef.current?.open !== true) {
            dialogRef.current?.showModal();
        } else if (modalQueue.length < 1 && dialogRef.current?.open === true) {
            dialogRef.current?.close();
        }
    }, [modalQueue]);

    return (
        <OpenModalContext.Provider value={openModal}>
            <ExitModalContext.Provider value={dequeueModal}>
                <div id="container" className="flex flex-col justify-end w-full h-full p-5 box-border">
                    <header className="flex-shrink">
                        <button className={buttonPrimary()} onClick={openAddItemModal}>Create Item</button>
                        <button className={buttonSecondary()} onClick={openAddItemRecordModal}>Add Item</button>
                    </header>
                    <main className="flex-grow">
                        <RecordList />
                    </main>
                </div>
                <dialog className="m-auto w-full h-full flex justify-center align-center" ref={dialogRef} onClose={dequeueModal}>
                    <div className="m-auto flex flex-col">
                        <header className="flex justify-end">
                            <button className={buttonSecondary()} onClick={dequeueModal}>X</button>
                        </header>
                        <main>
                            {modalQueue.length > 0 ? modalQueue[0] : null}
                        </main>
                    </div>
                </dialog>
            </ExitModalContext.Provider>
        </OpenModalContext.Provider>
    );
}
6