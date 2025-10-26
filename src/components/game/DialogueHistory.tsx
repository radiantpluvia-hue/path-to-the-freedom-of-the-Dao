import React from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function DialogueHistory() {
  const transcript = useGameStore(s => (s as any).getTranscript?.(200) || []);

  if (!transcript || !transcript.length) return <div style={{ padding: 12 }}>No dialogue history yet.</div>;

  return (
    <div style={{ maxHeight: '60vh', overflow: 'auto', padding: 12 }}>
      {transcript.map((t: any, i: number) => (
        <div key={i} style={{ marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{new Date(t.ts).toLocaleTimeString()}</div>
          <div style={{ fontWeight: '600', marginTop: 4 }}>{t.type === 'line' ? (t.meta?.speaker || 'Narrator') : t.type === 'choice' ? 'You' : 'System'}</div>
          <div style={{ marginTop: 2 }}>{t.text}</div>
        </div>
      ))}
    </div>
  );
}
