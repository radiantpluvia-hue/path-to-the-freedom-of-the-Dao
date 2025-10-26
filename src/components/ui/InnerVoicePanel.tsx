import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
// Do not statically import InnerVoice here; it may be large and is also
// dynamically imported elsewhere. Resolve at runtime to avoid forcing it
// into the initial bundle.
async function resolveInnerVoice() {
  if ((globalThis as any).InnerVoice) return (globalThis as any).InnerVoice;
  try {
    const m = await import('../../systems/InnerVoice');
    return (m as any).default || m;
  } catch (e) {
    return null;
  }
}

type Thought = {
  id: string;
  speakerId: string;
  text: string;
  importance: number;
  createdAt: number;
};

export default function InnerVoicePanel({ max = 3 }: { max?: number }) {
  const [messages, setMessages] = useState<Thought[]>([]);
  const store = useGameStore();
  const settings = (store as any).getSettings ? (store as any).getSettings() : {};
  const showPanel = settings?.innerVoice?.showPanel !== false; // default true
  const displayMs = typeof settings?.innerVoice?.displayMs === 'number' ? settings.innerVoice.displayMs : 4500;

  useEffect(() => {
    if (!showPanel) return;
    let mounted = true;
    // wrap async work in an inner function
    (async () => {
      try {
        const iv = (globalThis as any).InnerVoice || null;
        const resolved = iv ? iv : await resolveInnerVoice();
        if (resolved && typeof resolved.registerListener === 'function') {
          const unreg = resolved.registerListener('*', (t: Thought) => {
            if (!mounted) return;
            setMessages(prev => {
              const next = [t, ...prev].slice(0, max);
              return next;
            });
            // auto-remove after TTL-ish (visual fade); do not rely on snapshot
            setTimeout(() => {
              if (!mounted) return;
              setMessages(prev => prev.filter(m => m.id !== t.id));
            }, displayMs);
          });
          // cleanup
          return () => { mounted = false; unreg(); };
        }
      } catch (e) {
        // no-op
      }
    })();
    return () => { mounted = false; };
  }, [max, showPanel, displayMs]);

  if (!showPanel || messages.length === 0) return null;

  const onClickBubble = (t: Thought) => {
    // Persist thought into player settings savedInnerVoice array and open dialogue history
    try {
  const cur = (store as any).getSettings ? (store as any).getSettings() : {};
  const saved = (cur.savedInnerVoice || []) as Thought[];
  (store as any).setSettings && (store as any).setSettings({ savedInnerVoice: [{ ...t, persistedAt: Date.now() }, ...saved].slice(0, 200) });
      store.setUIProperty('showNarrative', true);
    } catch (e) { /* ignore */ }
  };

  return (
    <div style={{ position: 'fixed', left: 20, bottom: 120, zIndex: 2500, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {messages.map(m => (
        <div key={m.id} onClick={() => onClickBubble(m)} style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.6)', maxWidth: 380, cursor: 'pointer' }}>
          <div style={{ fontSize: '0.95rem' }}>{m.text}</div>
        </div>
      ))}
    </div>
  );
}
