'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Fired when the open state should change (close button, backdrop click, Escape). */
  onOpenChange: (open: boolean) => void;
  /** Optional accessible title for the dialog. */
  title?: string;
  children: React.ReactNode;
}

/**
 * A simple, accessible dialog built on the native HTML <dialog> element.
 * Clicking the backdrop or pressing Escape closes the dialog.
 *
 * The dialog is opened/closed imperatively via showModal()/close() rather than
 * the `open` attribute, because mixing the attribute with showModal() throws
 * an InvalidStateError.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Sync the native dialog with the controlled `open` state imperatively.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !prevOpen.current) {
      dialog.showModal();
    } else if (!open && prevOpen.current) {
      dialog.close();
    }
    prevOpen.current = open;
  }, [open]);

  // Handle the dialog being closed via Escape or backdrop click (cancel).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCancel = () => {
      prevOpen.current = false;
      onOpenChange(false);
    };

    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
    };
  }, [onOpenChange]);

  const handleClick = (event: React.MouseEvent) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Close when clicking the backdrop (first child div), not the dialog content.
    if (event.target === dialog.firstElementChild) {
      handleClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100]"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 id="dialog-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close dialog"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </dialog>
  );
}
