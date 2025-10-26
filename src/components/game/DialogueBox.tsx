import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function DialogueBox() {
  const current = useGameStore(s => s.currentDialogue);
  const idx = useGameStore(s => s.currentLineIndex);
  const advance = useGameStore(s => s.advanceDialogue);
  const choose = useGameStore(s => s.chooseDialogueChoice);
  const cancelTimed = useGameStore(s => (s as any).cancelTimedChoice);
  const timedMeta = useGameStore(s => (s as any)._timedChoiceMeta);
  const appendTranscript = useGameStore(s => (s as any).appendTranscript);

  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(8);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const typingTimerRef = useRef<number | null>(null as any);

  const line = current?.lines?.[idx] as any;

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
        if (autoAdvance) {
          typingTimerRef.current = window.setTimeout(() => advance(), 350);
        }
      }
    }, typingSpeed);
    return () => { clearInterval(id); if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; } };
  }, [line?.text, idx, typingSpeed, autoAdvance]);

  useEffect(() => {
    // focus management when dialogue opens
    const el = document.querySelector('.dialogue-box') as HTMLElement | null;
    if (el) el.focus();
  }, [current]);

  // keyboard shortcuts for choices and cancel timed choice
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
      if (e.key === 'Escape') {
        // cancel timer but don't close dialogue
        cancelTimed?.();
      }
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
    <div className="dialogue-box" role="dialog" aria-label="dialogue" tabIndex={-1}>
      <div className="portrait">{line.portrait ? <img src={`/assets/icons/${line.portrait}.svg`} alt={line.speaker} /> : null}</div>
      <div className="content">
        <div className="speaker">{line.speaker}</div>
        <div className="text" aria-live="polite">{typed}{typing ? <span className="cursor">|</span> : null}</div>
        <div className="dialogue-controls" style={{marginTop:8}}>
          <label style={{display:'inline-block', marginRight:8}}>Typing speed</label>
          <input type="range" min={2} max={40} value={typingSpeed} onChange={e => setTypingSpeed(Number(e.target.value))} />
          <label style={{marginLeft:12}}><input type="checkbox" checked={autoAdvance} onChange={e => setAutoAdvance(e.target.checked)} /> Auto-advance</label>
        </div>
        {line.choices && line.choices.length ? (
          <div className="choices" role="list">
            {timedMeta ? (() => {
              const now = Date.now();
              const elapsed = Math.max(0, now - (timedMeta.startAt || now));
              const remaining = Math.max(0, (timedMeta.timeoutMs || 10000) - elapsed);
              const pct = Math.max(0, Math.min(1, remaining / (timedMeta.timeoutMs || 10000)));
              return (
                <div className="timed-visual" style={{marginBottom:8}}>
                  <div className="progress" aria-hidden style={{height:6, background:'#333', borderRadius:3, overflow:'hidden'}}>
                    <div style={{width:`${pct*100}%`, height:'100%', background:'#9ecbff', transition:'width 0.1s linear'}} />
                  </div>
                  <div className="countdown" aria-live="polite" style={{marginTop:6}}>{Math.ceil(remaining/1000)}s</div>
                </div>
              );
            })() : null}
            {line.choices.map((c: any, i: number) => {
              const isDefault = timedMeta && (timedMeta.defaultChoiceIndex === i);
              const nearEnd = timedMeta && ( (timedMeta.timeoutMs || 10000) - (Date.now() - (timedMeta.startAt || 0)) <= 2000 );
              return (
                <button
                  key={i}
                  onClick={() => { cancelTimed?.(); choose(i); }}
                  aria-label={`Choice ${i+1}: ${c.text}`}
                  style={{
                    margin:6,
                    padding: '8px 12px',
                    transform: isDefault && nearEnd ? 'scale(1.03)' : 'none',
                    transition: 'transform 120ms ease-in-out',
                    boxShadow: isDefault ? '0 0 8px rgba(158,203,255,0.6)' : undefined
                  }}
                >
                  <span style={{fontWeight: 'bold', marginRight:8}}>{line.choices.length > 1 ? `${i+1}. ` : ''}</span>
                  {c.text}
                </button>
              );
            })}
          </div>
        ) : (
          <button onClick={() => { cancelTimed?.(); advance(); }}>Continue</button>
        )}
      </div>
    </div>
  );
}
