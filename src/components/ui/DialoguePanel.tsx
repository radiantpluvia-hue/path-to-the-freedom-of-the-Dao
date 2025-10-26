import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import SmallChip from './SmallChip';

export default function DialoguePanel() {
  const current = useGameStore(s => s.currentDialogue);
  const idx = useGameStore(s => s.currentLineIndex);
  const advance = useGameStore(s => s.advanceDialogue);
  const choose = useGameStore(s => s.chooseDialogueChoice);
  const cancelTimed = useGameStore(s => (s as any).cancelTimedChoice);
  const _timedMeta = useGameStore(s => (s as any)._timedChoiceMeta);
  const appendTranscript = useGameStore(s => (s as any).appendTranscript);

  void _timedMeta;

  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingSpeed] = useState(10);
  const typingTimerRef = useRef<number | null>(null as any);

  const line = current?.lines?.[idx] as any;
  const ui = useGameStore(s => s.ui);
  const dialoguePos = ui?.dialoguePanelPosition || 'bottom-left';
  const dialogueOpacity = typeof ui?.dialoguePanelOpacity === 'number' ? ui.dialoguePanelOpacity : 0.85;

  useEffect(() => {
    if (!line) return;
    setTyped('');
    setTyping(true);
    try { appendTranscript?.({ type: 'line', text: String(line.text || ''), meta: { speaker: line.speaker, dialogueId: current?.id, lineIndex: idx } }); } catch (e) { /* ignore */ }
    let i = 0;
    const text = String(line.text || '');
    const id = setInterval(() => {
      i++;
      setTyped(text.substr(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setTyping(false);
      }
    }, typingSpeed);
    return () => { clearInterval(id); if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; } };
  }, [line?.text, idx, typingSpeed]);

  useEffect(() => {
    const el = document.querySelector('.dialogue-panel') as HTMLElement | null;
    if (el) el.focus();
  }, [current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!line) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idxKey = Number(e.key) - 1;
        if (line.choices && line.choices[idxKey]) {
          cancelTimed?.();
          choose(idxKey);
        }
      }
      if (e.key === 'Escape') cancelTimed?.();
      if (e.key === 'Enter' && !(line.choices && line.choices.length)) {
        cancelTimed?.();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [line, choose, advance, cancelTimed]);

  if (!current || !line) return null;

  return (
    <div
      className="dialogue-panel"
      role="dialog"
      aria-label="dialogue"
      tabIndex={-1}
      style={{
        position: 'fixed',
        zIndex: 3500, // ensure it overlays event log
        width: 480,
        maxWidth: 'min(92%, 560px)',
  background: `rgba(8,10,12,${Math.max(0.3, Math.min(1, dialogueOpacity))})`, // controlled opacity
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 14,
        boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
        transition: 'transform 160ms ease, opacity 160ms ease',
        opacity: dialogueOpacity,
        ...(dialoguePos === 'bottom-left' ? { left: 20, bottom: 80 } : {}),
        ...(dialoguePos === 'bottom-right' ? { right: 20, bottom: 80 } : {}),
        ...(dialoguePos === 'top-left' ? { left: 20, top: 80 } : {}),
        ...(dialoguePos === 'top-right' ? { right: 20, top: 80 } : {}),
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {line.portrait ? (
          <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flex: '0 0 56px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <img src={`/assets/icons/${line.portrait}.svg`} alt={line.speaker} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : null}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.02rem' }}>{line.speaker || 'You'}</div>
          </div>
          <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.98rem', lineHeight: 1.45, minHeight: 56 }} aria-live="polite">
            {typed}{typing ? <span style={{ marginLeft: 4 }} className="cursor">|</span> : null}
          </div>

          <div style={{ marginTop: 12 }}>
            {line.choices && line.choices.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {line.choices.map((c: any, i: number) => (
                  <button key={i} onClick={() => { cancelTimed?.(); choose(i); }} style={{ padding: 0, borderRadius: 6 }}>
                    <SmallChip>{line.choices.length > 1 ? `${i+1}. ` : ''}{c.text}</SmallChip>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => { cancelTimed?.(); advance(); }} style={{ padding: 0, borderRadius: 6 }}><SmallChip>Continue</SmallChip></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
