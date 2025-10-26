import React from 'react';
import SmallChip from './SmallChip';

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={onCancel} />
      <div style={{ position: 'relative', background: 'var(--dark)', color: 'var(--text-primary)', padding: 20, borderRadius: 8, width: 520, maxWidth: '92%', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div style={{ margin: '12px 0', color: 'var(--muted)' }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={{ padding: 0 }}><SmallChip style={{ borderRadius: 6, background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--primary)' }}>{cancelLabel}</SmallChip></button>
          <button type="button" onClick={onConfirm} style={{ padding: 0 }}><SmallChip style={{ borderRadius: 6, background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'var(--dark)' }}>{confirmLabel}</SmallChip></button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
