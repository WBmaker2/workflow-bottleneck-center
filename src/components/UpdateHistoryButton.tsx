import { useRef } from "react";
import { useAppDispatch, useAppState } from "../app/AppProvider";
import { updateHistory } from "../data/updateHistory";
import { ModalDialog } from "./ModalDialog";

export function UpdateHistoryButton() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button" className="update-history-trigger no-print" data-testid="update-history-trigger" aria-haspopup="dialog" aria-controls="update-history-dialog" onClick={() => dispatch({ type: "OPEN_UPDATE_DIALOG" })}>
        업데이트 내역
      </button>
      <ModalDialog open={state.updateDialogOpen} title="업데이트 내역" dialogId="update-history-dialog" returnFocusRef={triggerRef} onClose={() => dispatch({ type: "CLOSE_UPDATE_DIALOG" })}>
        <ul>
          {updateHistory.map((entry) => (
            <li key={`${entry.date}-${entry.category}`}>
              <time dateTime={entry.date}>{entry.date}</time> · <span>{entry.category}</span> · <span>{entry.description}</span>
            </li>
          ))}
        </ul>
      </ModalDialog>
    </>
  );
}
