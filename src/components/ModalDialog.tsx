import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

export interface ModalDialogProps {
  open: boolean;
  title: string;
  dialogId?: string;
  onClose(): void;
  children: ReactNode;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const openDialogStack: symbol[] = [];

export function ModalDialog({ open, title, dialogId, onClose, children, returnFocusRef }: ModalDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const returnFocusRefRef = useRef(returnFocusRef);
  const titleId = `modal-title-${useId()}`;

  useEffect(() => {
    onCloseRef.current = onClose;
    returnFocusRefRef.current = returnFocusRef;
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const token = Symbol("modal-dialog");
    openDialogStack.push(token);
    const previouslyFocused = returnFocusRefRef.current?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    closeRef.current?.focus();

    const backdrop = backdropRef.current;
    const parent = backdrop?.parentElement;
    const inertSnapshots = parent
      ? Array.from(parent.children)
        .filter((sibling): sibling is HTMLElement => sibling !== backdrop && sibling instanceof HTMLElement && !sibling.hasAttribute("data-modal-backdrop"))
        .map((sibling) => ({ element: sibling, hadAttribute: sibling.hasAttribute("inert"), value: sibling.getAttribute("inert") }))
      : [];
    for (const { element } of inertSnapshots) element.setAttribute("inert", "");

    const onKeyDown = (event: KeyboardEvent) => {
      if (openDialogStack[openDialogStack.length - 1] !== token) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const focusOutsideDialog = !dialogRef.current.contains(document.activeElement);
      if (focusOutsideDialog || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (focusOutsideDialog && !event.shiftKey ? first : last).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const stackIndex = openDialogStack.indexOf(token);
      if (stackIndex >= 0) openDialogStack.splice(stackIndex, 1);
      for (const { element, hadAttribute, value } of inertSnapshots) {
        if (hadAttribute) element.setAttribute("inert", value ?? "");
        else element.removeAttribute("inert");
      }
      (returnFocusRefRef.current?.current ?? previouslyFocused)?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div ref={backdropRef} className="modal-backdrop no-print" data-modal-backdrop="true" data-testid="modal-backdrop">
      <div ref={dialogRef} className="modal-dialog" id={dialogId} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <h2 id={titleId}>{title}</h2>
        <button ref={closeRef} type="button" onClick={onClose}>닫기</button>
        {children}
      </div>
    </div>
  );
}
