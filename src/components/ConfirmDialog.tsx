import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

/**
 * Blocking confirmation for destructive actions. Cancel is the safe default:
 * it takes focus on open, sits first in the tab order, and Escape / a tap on
 * the backdrop both cancel — nothing here confirms by accident.
 *
 * Built on the native `<dialog>` element. The previous hand-rolled version set
 * `aria-modal="true"` while nothing actually kept focus inside it: Tab from the
 * confirm button landed on the page behind, which was neither inert nor
 * hidden, so a keyboard or screen-reader user could wander into live controls
 * while a destructive confirm was on screen — with the app telling assistive
 * tech the background was unavailable. `showModal()` gives the real thing:
 * focus containment, background inertness, Escape, and focus restored to
 * whatever opened it.
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
  const ref = useRef<HTMLDialogElement>(null);
  // A fixed id would collide if two dialogs ever mounted together.
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Escape closes a native dialog directly, bypassing React — route it back
    // through onCancel so the parent's state can't drift out of sync.
    const onNativeCancel = (e: Event) => {
      e.preventDefault();
      if (!busy) onCancel();
    };
    dialog.addEventListener("cancel", onNativeCancel);
    return () => dialog.removeEventListener("cancel", onNativeCancel);
  }, [busy, onCancel]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="w-full max-w-sm bg-transparent p-0 backdrop:bg-obsidian/70"
      // A click landing on the dialog element itself is a backdrop click: the
      // card below stops propagation for anything inside it.
      onClick={busy ? undefined : onCancel}
    >
      <div className="box w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 id={titleId} className="text-lg font-semibold text-ink">
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
    </dialog>
  );
}
