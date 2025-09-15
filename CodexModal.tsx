import React, { useEffect, useRef } from 'react';
import './src/styles/codex.css';
import CodexList from './src/components/CodexList';

export interface CodexModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const CodexModal: React.FC<CodexModalProps> = ({ open, onClose, children }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Save focus and move to modal
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstFocusable = overlayRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="codex-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Codex"
      ref={overlayRef}
      onClick={(e) => {
        // close when clicking on the overlay (but not when clicking inside modal)
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="codex-modal" role="document">
        <button
          aria-label="Close codex"
          className="codex-close"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="codex-title">Codex</h2>
  <div className="codex-content">{children || <CodexList />}</div>
      </div>
    </div>
  );
};

export default CodexModal;
