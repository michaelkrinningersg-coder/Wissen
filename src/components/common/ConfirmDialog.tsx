interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="modal-box">
        <h3 id="confirm-dialog-title">{title}</h3>
        <p className="text-dim">{description}</p>
        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="button-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
