import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Card } from '@/components/core/Card';
import { Button } from '@/components/core/Button';
import confirmRegistry from '@/store/confirmRegistry';

export function GlobalConfirm() {
  const { ui, setUIProperty } = useGameStore(state => ({ ui: state.ui, setUIProperty: state.setUIProperty }));
  const active = (ui as any).activeConfirm;
  if (!active) return null;

  const handleConfirm = () => {
    // Call any externally-registered handler
    const handlers = confirmRegistry.consumeConfirmHandler(active.id || '');
    try { if (handlers && handlers.onConfirm) handlers.onConfirm(); } catch (e) { console.error('confirm handler failed', e); }
    setUIProperty('activeConfirm', undefined);
  };

  const handleCancel = () => {
    const handlers = confirmRegistry.consumeConfirmHandler(active.id || '');
    try { if (handlers && handlers.onCancel) handlers.onCancel(); } catch (e) { console.error('confirm cancel handler failed', e); }
    setUIProperty('activeConfirm', undefined);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 2500 }}>
      <div style={{ width: 'min(640px, 92vw)' }}>
        <Card title={active.title || 'Confirm'}>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>{active.message}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={handleCancel}>{active.cancelLabel || 'Cancel'}</Button>
            <Button variant="danger" onClick={handleConfirm}>{active.confirmLabel || 'Confirm'}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default GlobalConfirm;
