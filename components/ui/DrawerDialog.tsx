"use client";

import React, { useEffect, useRef } from "react";

interface DrawerDialogProps {
  open: boolean;
  labelledBy: string;
  className?: string;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

function isOutsideDialogBounds(
  clientX: number,
  clientY: number,
  dialog: HTMLDialogElement
): boolean {
  const rect = dialog.getBoundingClientRect();
  return (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  );
}

/**
 * Shared accessible native `<dialog>` drawer wrapper implementing modal top-layer semantics,
 * Escape cancellation, backdrop light-dismiss without drag false-positives, and initial focus.
 *
 * @param props - DrawerDialogProps with visibility state, ARIA label reference, and close callback.
 * @returns Native modal `<dialog>` element wrapping drawer content.
 */
export function DrawerDialog({
  open,
  labelledBy,
  className = "spark-drawer",
  onClose,
  initialFocusRef,
  children,
}: DrawerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      closedby="any"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        const dialog = dialogRef.current;
        pressedOutsideRef.current = dialog
          ? isOutsideDialogBounds(e.clientX, e.clientY, dialog)
          : false;
      }}
      onPointerUp={(e) => {
        const dialog = dialogRef.current;
        if (
          pressedOutsideRef.current &&
          dialog &&
          isOutsideDialogBounds(e.clientX, e.clientY, dialog)
        ) {
          onClose();
        }
        pressedOutsideRef.current = false;
      }}
      className={className}
    >
      <div className="drawer-inner">{children}</div>
    </dialog>
  );
}
