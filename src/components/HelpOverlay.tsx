import React from 'react';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

export default function HelpOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="dialog" aria-modal="true" aria-label="Help">
      <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Keyboard Shortcuts</h2>
          <ModalCloseButton onClick={onClose} ariaLabel="Close help" title="Close" />
        </div>
        <ul style={{ marginTop: 12 }}>
          <li><strong>?</strong> — Toggle this help overlay</li>
          <li><strong>C</strong> — Quick cultivate</li>
          <li><strong>E</strong> — Explore</li>
          <li><strong>S</strong> — Save game</li>
          <li><strong>L</strong> — Load game</li>
          <li><strong>X</strong> — Toggle Codex</li>
        </ul>
        <p style={{ marginTop: 10, color: 'var(--muted)' }}>These shortcuts are active when the game UI has focus.</p>
      </div>
    </div>
  );
}
