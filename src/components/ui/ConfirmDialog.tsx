import React from 'react';
import { Card } from '../core/Card';
import { Button } from '../core/Button';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div style={{ width: 'min(600px, 92vw)' }}>
        <Card title={title || 'Confirm'}>
          <div style={{ color: 'var(--muted)', marginBottom: 12 }}>{message}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
            <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmDialog;
