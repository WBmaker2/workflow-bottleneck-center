import type { ReactNode } from "react";
import type { getRequiredAction } from "../app/appSelectors";

export interface RequiredActionButtonProps {
  actionId: NonNullable<ReturnType<typeof getRequiredAction>>;
  activeActionId: ReturnType<typeof getRequiredAction>;
  children: ReactNode;
  onClick(): void;
}

export function RequiredActionButton({ actionId, activeActionId, children, onClick }: RequiredActionButtonProps) {
  const isActive = actionId === activeActionId;
  return (
    <button
      type="button"
      className={isActive ? "required-action gi-pulse" : "required-action"}
      data-testid="required-action"
      {...(isActive ? { "data-pulse": "true" } : {})}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
