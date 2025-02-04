import React, { useEffect, useRef, useState } from "react";
import { buttonPrimarySmall, buttonSecondarySmall } from "./styles";
import { createPortal } from "react-dom";

export interface ModalProps {
  closeModal: () => void;
}

export function getFieldUpdater<R>(data: R, setData: (data: R) => void) {
  return function <F extends keyof R, T extends "string" | "number">(
    field: F,
    type: T = "string" as T
  ) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (type === "string") {
        (data as any)[field] = e.target.value;
      } else if (type === "number") {
        (data as any)[field] = Number.parseInt(e.target.value);
      }
      setData(data);
    };
  };
}

interface ConfirmProps extends ModalProps {
  title: string;
  text: string;
  resultCallback: (result: boolean) => void;
}
export const ModalConfirm = (props: ConfirmProps) => {

  return (
    <ModalWithButtons
      closeModal={props.closeModal}
      title={props.title}
      defaultButton={{ label: "Confirm", type: "submit", onPressed: () => props.resultCallback(true), }}
      buttons={[{ label: "Cancel", type: "button", onPressed: () => props.resultCallback(false) }]}
      onSubmit={() => props.resultCallback(true)}
    >
      <p>{props.text}</p>
    </ModalWithButtons>
  )
};

export type ModalButton = {
  label: string;
  onPressed: () => void;
  type: "button" | "reset";
} | {
  label: string;
  onPressed?: () => void;
  type: "submit";
};
interface ButtonsProps extends ModalProps {
  title: string;
  children: React.ReactNode;
  defaultButton: ModalButton;
  buttons?: ModalButton[];
  onSubmit?: () => void;
}
export function ModalWithButtons<T>(props: ButtonsProps) {

  return (
    <Dialog closeModal={props.closeModal} title={props.title}>
      <form method="dialog" onSubmit={props.onSubmit} className="grid grid-cols-1">
        <div>
          {props.children}
        </div>
        <div className="w-full flex justify-end col-span-2 pt-3 gap-1">
          {props.buttons?.map((btn, index) => <button key={index} type={btn.type} className={buttonSecondarySmall()} onClick={btn.onPressed}>{btn.label}</button>)}
          <button type={props.defaultButton.type} className={buttonPrimarySmall()} onClick={props.defaultButton.onPressed}>{props.defaultButton.label}</button>
        </div>
      </form>
    </Dialog>
  );
}

interface DialogProps extends ModalProps {
  children: React.ReactNode;
  title?: string;
}
export function Dialog(props: DialogProps) {

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => {};
  })

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false);
  }, [])

  if (!mounted) {
    return null;
  }

  const contents = (
    <dialog ref={dialogRef} className="max-w-full max-h-full w-full h-full bg-black/80 flex flex-col justify-center items-center">
      <div className="grid p-5 bg-white dark:bg-(--background-section) rounded">
        <div className="flex justify-between border-b-1 my-1">
          <span className="text-xl">{props.title}</span>
          {/* <button className={buttonSecondarySmall("aspect-square")} onClick={props.closeModal}>X</button> */}
        </div>
        <div>
          <div>
            {props.children}
          </div>
        </div>
      </div>
    </dialog>
  );

  return createPortal(contents, document.body)
}

// export function EditItemRecord({
//   onSubmit,
//   initialData,
// }: {
//   onSubmit?: (item: InvItemId) => void;
//   initialData?: InvItem;
// }) {
//   const [data, setData] = useState(initialData ?? emptyInvItem());

//   const update = getFieldUpdater(data, setData);
//   const exitModal = useContext(ExitModalContext);

//   const items = useLiveQuery(() => dbItems.toArray());

//   if (items == null) {
//     return null;
//   }

//   async function submit() {
//     if (initialData == null) {
//       delete (data as any).id;
//     }
//     const putKey = await dbInvItems.put(data);
//     console.log("Saved new item record under id " + putKey.toFixed());
//     if (onSubmit != null) {
//       onSubmit(putKey);
//     }
//   }

//   return (
//     <form method="dialog">
//       <label>Item Type:</label>
//       <select onChange={update("itemId", "number")}>
//         <option value={undefined}></option>
//         {items
//           .toSorted((i1, i2) => i1.name.localeCompare(i2.name))
//           .map((item) => (
//             <option value={item.id} selected={item.id === data.itemId}>
//               {item.name}
//             </option>
//           ))}
//       </select>

//       <label>Quantity:</label>
//       <input
//         type="number"
//         defaultValue={data.quantity}
//         onChange={update("quantity", "number")}
//       />

//       <label>Override Name:</label>
//       <input type="text" defaultValue={data.name} onChange={update("name")} />

//       <label>Override Description:</label>
//       <input type="text" defaultValue={data.desc} onChange={update("desc")} />

//       <label>Override Weight:</label>
//       <input
//         type="number"
//         defaultValue={data.weight}
//         onChange={update("weight", "number")}
//       />

//       <label>Override Cost:</label>
//       <input
//         type="number"
//         defaultValue={data.value}
//         onChange={update("monetaryValue", "number")}
//       />

//       <button className={buttonPrimary()} onClick={submit}>Save Item</button>
//       <button className={buttonSecondary()} onClick={exitModal}>Cancel</button>
//     </form>
//   );
// }
