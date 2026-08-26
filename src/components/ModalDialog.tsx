import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export interface ModalDialogProps {
  open: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function ModalDialog({ open, title, onClose, children, returnFocusRef }: ModalDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
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
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open, returnFocusRef]);

  if (!open) return null;
  const titleId = "update-history-title";
  return (
    <div className="modal-backdrop" data-testid="modal-backdrop">
      <div ref={dialogRef} className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <h2 id={titleId}>{title}</h2>
        <button ref={closeRef} type="button" onClick={onClose}>닫기</button>
        {children}
      </div>
    </div>
  );
}
