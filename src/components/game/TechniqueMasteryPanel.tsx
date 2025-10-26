import React from 'react';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import { useGameStore } from '../../store/useGameStore';

export default function TechniqueMasteryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useGameStore();
  if (!open) return null;
  const list = store.getTechniqueMasteryProgress();
  const playerQi = store.player.currentQi || 0;
  const playerFatigue = store.player.fatigue || 0;
  const inlineMessage = store.ui.lastPracticeMessage;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
      <Card title="Technique Mastery">
        <div style={{ minWidth: 420, maxHeight: '70vh', overflow: 'auto' }}>
          {inlineMessage ? <div style={{ marginBottom: 8, color: inlineMessage.startsWith('+') ? 'var(--accent)' : 'var(--danger)' }}>{inlineMessage}</div> : null}
          {list.length === 0 ? <div style={{ color: 'var(--muted)' }}>You have no techniques yet.</div> : (
            <div style={{ display: 'grid', gap: 8 }}>
              {list.map((t: any) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Rank: {t.masteryRank ?? 0} • XP: {t.masteryXp ?? 0}</div>
                  </div>
                  <div style={{ width: 160 }}>
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: 10, borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, ((t.masteryXp || 0) / 5) * 100)}%`, height: '100%', background: 'var(--accent)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', alignSelf: 'center' }}>Qi: {playerQi} • Fatigue: {playerFatigue}</div>
                      <Button variant="primary" onClick={() => store.practiceTechnique(t.id)}>Practice</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
