import React, { useEffect, useRef, useState } from "react";
import { buttonPrimarySmall, buttonSecondarySmall } from "./styles";
import { createPortal } from "react-dom";

export interface ModalProps {
  close: () => void;
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
    <ModalButtons
      close={props.close}
      title={props.title}
      children={<p>{props.text}</p>}
      defaultButton={{ label: "Confirm", result: true }}
      buttons={[{ label: "Cancel", result: false }]}
      onPressed={props.resultCallback}
    />
  )
};

interface Button<T> {
  label: string;
  result: T;
}
interface ButtonsProps<T> extends ModalProps {
  title: string;
  children: React.ReactNode;
  defaultButton: Button<T>;
  buttons?: Button<T>[];
  onPressed: (result: T) => void;
}
export function ModalButtons<T>(props: ButtonsProps<T>) {

  const submit = (result: T) => () => {
    props.close();
    props.onPressed(result);
  };

  return (
    <Dialog close={props.close} title={props.title}>
      <form method="dialog" onSubmit={submit(props.defaultButton.result)} className="grid grid-cols-1">
        <div>
          {props.children}
        </div>
        <div className="w-full flex justify-end col-span-2 pt-3 gap-1">
          {props.buttons?.map((btn, index) => <button key={index} type="button" className={buttonSecondarySmall()} onClick={submit(btn.result)}>{btn.label}</button>)}
          <button type="button" className={buttonPrimarySmall()} onClick={submit(props.defaultButton.result)}>{props.defaultButton.label}</button>
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
    return () => dialogRef.current?.close();
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
          <button className={buttonSecondarySmall("aspect-square")} onClick={props.close}>X</button>
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
