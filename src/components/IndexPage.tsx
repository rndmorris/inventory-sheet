import { RecordList } from './Records';
import './Index.css';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditItem, EditItemRecord } from './modals';

export const EnqueueModalContext = createContext<((modal: React.ReactNode) => void) | null>(null);

export default function IndexPage() {

    const dialogRef = useRef<HTMLDialogElement>(null);

    const [modalQueue, setModalQueue] = useState<React.ReactNode[]>([]);

    const enqueueModal = (modal: React.ReactNode) => {
        setModalQueue(modalQueue.concat(modal));
    };

    const dequeueModal = () => {
        setModalQueue(modalQueue.slice(1))
    }

    const openAddItemModal = () => {
        enqueueModal(<EditItem onSubmit={dequeueModal} />)
    }

    const openAddItemRecordModal = () => {
        enqueueModal(<EditItemRecord onSubmit={dequeueModal} />)
    }

    useEffect(() => {
        if (modalQueue.length > 0 && dialogRef.current?.open !== true) {
            dialogRef.current?.showModal();
        }
        else if (modalQueue.length < 1 && dialogRef.current?.open === true) {
            dialogRef.current?.close();
        }
    }, [modalQueue])

    return (
        <EnqueueModalContext.Provider value={enqueueModal}>
            <div id="container">
                <header>
                    <h1>Header</h1>
                    <button onClick={openAddItemModal}>Create New Item Type</button>
                    <button onClick={openAddItemRecordModal}>Add Item</button>
                </header>
                <main>
                    <RecordList />
                </main>
                <footer>
                    <h1>
                        Footer
                    </h1>
                </footer>
            </div>
            <dialog ref={dialogRef} onClose={dequeueModal}>
                <header style={{display: "flex", justifyContent: "flex-end"}}>
                    <button onClick={() => dialogRef.current?.close()}>X</button>
                </header>
                {modalQueue.length > 0 ? modalQueue[0] : null}
            </dialog>
        </EnqueueModalContext.Provider>
    );
}