import React from 'react';
import { Button } from '../core/Button';

interface Props {
  onClose: () => void;
  onHideForever: () => void;
}

const CombatTutorial: React.FC<Props> = ({ onClose, onHideForever }) => {
  return (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2200 }}>
      <div style={{ width: 720, background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.06)', padding: 20, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
        <h2 style={{ marginTop: 0 }}>Combat Tutorial</h2>
        <p>Combat uses AP (action points) and Qi. Each technique consumes AP and/or Qi — pick intelligently. Enemies telegraph intent; use defensive techniques to mitigate powerful attacks.</p>
        <ul>
          <li>AP determines how many techniques you can use each turn.</li>
          <li>Qi is a consumable resource for powerful techniques.</li>
          <li>Enemy intent shows their planned action; respond with defense or interrupt if possible.</li>
        </ul>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button onClick={onClose}>Got it</Button>
          <Button onClick={onHideForever} variant="secondary">Don't show again</Button>
        </div>
      </div>
    </div>
  );
};

export default CombatTutorial;
