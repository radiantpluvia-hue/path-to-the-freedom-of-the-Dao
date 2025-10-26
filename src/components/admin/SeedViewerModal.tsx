import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  seed: any | null;
};

export default function SeedViewerModal({ open, onClose, seed }: Props) {
  if (!open || !seed) return null;

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: 16, maxWidth: 800, width: '90%', maxHeight: '90%', overflow: 'auto', borderRadius: 8 }} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{seed.title || seed.name || seed.id}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{seed.description || seed.text || JSON.stringify(seed, null, 2)}</pre>
        </div>

        {seed.effects && (
          <div style={{ marginTop: 12 }}>
            <h4>Effects</h4>
            <ul>
              {seed.effects.map((e:any, i:number) => <li key={i}>{typeof e === 'string' ? e : JSON.stringify(e)}</li>)}
            </ul>
          </div>
        )}

        {seed.rewards && (
          <div style={{ marginTop: 12 }}>
            <h4>Rewards</h4>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(seed.rewards, null, 2)}</pre>
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
