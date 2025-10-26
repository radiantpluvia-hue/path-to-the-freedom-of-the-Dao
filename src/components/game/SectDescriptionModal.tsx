import React, { useEffect, useRef } from 'react';
import { Card } from '../core/Card';

type Props = {
  open: boolean;
  sect: any | null;
  onClose: () => void;
};

export const SectDescriptionModal: React.FC<Props> = ({ open, sect, onClose }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !sect) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div style={{ width: 'min(900px, 96vw)', maxHeight: '85vh', overflowY: 'auto' }}>
        <Card title={sect.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--muted)' }}>{sect.description}</p>
              {sect.leaderName && (
                <div style={{ marginTop: 8 }}>
                  <strong>Leader:</strong> {sect.leaderName} {sect.leaderTitle ? ` — ${sect.leaderTitle}` : ''}
                  {sect.leaderDescription && <p style={{ marginTop: 6 }}>{sect.leaderDescription}</p>}
                </div>
              )}
              {sect.philosophy && (
                <div style={{ marginTop: 8 }}>
                  <strong>Philosophy:</strong>
                  <p style={{ marginTop: 6 }}>{sect.philosophy}</p>
                </div>
              )}
            </div>

            <div style={{ marginLeft: 12, minWidth: 220 }}>
              <div style={{ marginBottom: 8 }}><strong>Realm:</strong> {sect.realm}</div>
              <div style={{ marginBottom: 8 }}><strong>Power:</strong> {sect.power}</div>
              <div style={{ marginBottom: 8 }}><strong>Type:</strong> {sect.type}</div>
              <div style={{ marginTop: 12 }}>
                <button onClick={onClose} className="xbtn" style={{ width: '100%' }}>Close</button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SectDescriptionModal;
