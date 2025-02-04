import React, { useEffect, useRef, useState } from "react";
import { buttonPrimarySmall, buttonSecondarySmall } from "./styles";
import { createPortal } from "react-dom";
import type { JSX } from "astro/jsx-runtime";

export interface ModalProps {
    closeModal: () => void;
}

export function getFieldUpdater<R>(data: R, setData: (data: R) => void) {
    return function <F extends keyof R, T extends "string" | "number">(
        field: F,
        type: T = "string" as T
    ) {
        return (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >
        ) => {
            if (type === "string") {
                if (e.target.value == null || e.target.value.trim().length < 1) {
                    (data as any)[field] = undefined;
                } else {
                    (data as any)[field] = e.target.value;
                }
            } else if (type === "number") {
                (data as any)[field] = Number.parseInt(e.target.value);
            }
            setData(data);
        };
    };
}

export interface AlertProps extends ModalProps {
    title: string;
    children: JSX.Element;
}
export const ModalAlert = (props: AlertProps) => {
    return (
        <ModalWithButtons
            closeModal={props.closeModal}
            title={props.title}
            defaultButton={{
                label: "OK",
                type: "button",
                onPressed: () => props.closeModal(),
            }}
        >
            {props.children}
        </ModalWithButtons>
    );
};

export interface ConfirmProps extends ModalProps {
    title: string;
    children: JSX.Element;
    resultCallback: (result: boolean) => void;
}
export const ModalConfirm = (props: ConfirmProps) => {
    return (
        <ModalWithButtons
            closeModal={props.closeModal}
            title={props.title}
            defaultButton={{
                label: "Confirm",
                type: "submit",
                onPressed: () => props.resultCallback(true),
            }}
            buttons={[
                {
                    label: "Cancel",
                    type: "button",
                    onPressed: () => props.resultCallback(false),
                },
            ]}
            onSubmit={() => props.resultCallback(true)}
        >
            {props.children}
        </ModalWithButtons>
    );
};

export type ModalButton =
    | {
          label: string;
          onPressed: () => void;
          type: "button" | "reset";
      }
    | {
          label: string;
          onPressed?: () => void;
          type: "submit";
      };
export interface ButtonsProps extends ModalProps {
    title: string;
    children: React.ReactNode;
    defaultButton: ModalButton;
    buttons?: ModalButton[];
    onSubmit?: () => void;
}
export function ModalWithButtons<T>(props: ButtonsProps) {
    return (
        <Dialog closeModal={props.closeModal} title={props.title}>
            <form
                method="dialog"
                onSubmit={props.onSubmit}
                className="grid grid-cols-1"
            >
                <div>{props.children}</div>
                <div className="w-full flex justify-end col-span-2 pt-3 gap-1">
                    {props.buttons?.map((btn, index) => (
                        <button
                            key={index}
                            type={btn.type}
                            className={buttonSecondarySmall()}
                            onClick={btn.onPressed}
                        >
                            {btn.label}
                        </button>
                    ))}
                    <button
                        type={props.defaultButton.type}
                        className={buttonPrimarySmall()}
                        onClick={props.defaultButton.onPressed}
                    >
                        {props.defaultButton.label}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}

export interface DialogProps extends ModalProps {
    children: React.ReactNode;
    title?: string;
}
export function Dialog(props: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        dialogRef.current?.showModal();
        return () => {};
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return null;
    }

    const contents = (
        <dialog
            ref={dialogRef}
            className="max-w-full max-h-full w-full h-full bg-black/80 flex flex-col justify-center items-center"
        >
            <div className="grid p-5 bg-white dark:bg-(--background-section) rounded">
                <div className="flex justify-between border-b-1 my-1">
                    <span className="text-xl">{props.title}</span>
                </div>
                <div>
                    <div>{props.children}</div>
                </div>
            </div>
        </dialog>
    );

    return createPortal(contents, document.body);
}

