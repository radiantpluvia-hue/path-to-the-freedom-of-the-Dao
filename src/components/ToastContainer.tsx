import React from 'react';
import { useGameStore } from '../store/useGameStore';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

const variantColors: Record<string, { bg: string; color: string }> = {
  info: { bg: 'rgba(0,0,0,0.85)', color: '#fff' },
  success: { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', color: '#06160a' },
  error: { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', color: '#fff' }
};

const ToastContainer: React.FC = () => {
  const toast = useGameStore(state => state.toast);
  const hide = useGameStore(state => state.hideToast);
  let style: any = {};
  if (toast) {
    const v = (toast.type && variantColors[toast.type]) ? variantColors[toast.type] : variantColors.info;
    style = {
      position: 'fixed' as const,
      right: 20,
      bottom: 20,
      background: v.bg,
      color: v.color,
      padding: '10px 14px',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      zIndex: 9999,
      minWidth: 220,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      transform: 'translateY(0)',
      transition: 'opacity 220ms ease, transform 220ms ease',
      opacity: 1
    };
  }

  if (!toast) return null;

  return (
    <div aria-live="polite" role="status" style={style}>
      <div style={{ flex: 1 }}>{(toast as any).message}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ModalCloseButton onClick={() => hide?.()} ariaLabel="Close toast" title="Close" size={16} />
      </div>
    </div>
  );
};

export default ToastContainer;
