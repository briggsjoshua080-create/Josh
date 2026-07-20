import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

/**
 * Blocking confirmation for destructive actions. Cancel is the safe default:
 * it takes focus on open, sits first in the tab order, and Escape / a tap on
 * the backdrop both cancel — nothing here confirms by accident.
 */
export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
  children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Disables both actions while the confirmed work runs. */
  busy?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/60 p-5 sm:items-center"
      style={{ zIndex: "var(--z-backdrop)" }}
      onClick={busy ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm box p-6"
        style={{ zIndex: "var(--z-sheet)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="ghost" className="w-full" autoFocus disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" className="w-full" disabled={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
