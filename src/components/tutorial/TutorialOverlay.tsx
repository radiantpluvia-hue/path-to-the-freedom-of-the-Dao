import React, { useEffect, useState } from 'react';

// Lightweight first-run tutorial overlay with localStorage persistence
// No dependency on global store to keep changes minimal
export const TutorialOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps: { title: string; body: string }[] = [
    {
      title: 'Welcome to Xianxia: Toward the Dao',
      body: 'This quick guide will walk you through the core loop: cultivate, complete minor stages, then attempt breakthroughs.'
    },
    {
      title: 'Core vs Social',
      body: 'Use the top tabs to switch between Core (cultivation and progress) and Social (inventory, manuals, relations).'
    },
    {
      title: 'Cultivation UI',
      body: 'Open Cultivation from the Core page to practice Qi Control and gain Qi. When your Qi meets requirements, attempt a Minor Breakthrough.'
    },
    {
      title: 'Realm Breakthroughs',
      body: 'After finishing all minor stages in a realm, choose a challenge to attempt a Realm Breakthrough. Success advances you to the next realm.'
    },
    {
      title: 'Quests & Story',
      body: 'Track Main Quests and Story Events on the right side of the Core page. Choices affect stats, karma, and opportunities.'
    },
    {
      title: 'Sects, Market, Mentors',
      body: 'Use Game Management shortcuts to join a sect, trade on the market, and learn from mentors. These unlock more progression paths.'
    }
  ];

  useEffect(() => {
    try {
      const seen = localStorage.getItem('xg_tutorial_seen');
      if (!seen) {
        setVisible(true);
      }
    } catch {
      // Ignore storage errors (e.g., private mode)
      setVisible(true);
    }
  }, []);

  const close = () => {
    setVisible(false);
  try { localStorage.setItem('xg_tutorial_seen', '1'); } catch (e) { /* ignore storage errors */ console.debug('TutorialOverlay: localStorage.setItem failed', e); }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: 'min(720px, 92vw)', background: 'var(--card-bg)', border: '2px solid var(--primary)',
        borderRadius: 12, padding: 20, boxShadow: '0 0 24px rgba(212,175,55,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Quick Tutorial</h3>
          <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: '8px 0', color: 'var(--accent)' }}>{steps[step]?.title}</h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{steps[step]?.body}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === step ? 'var(--primary)' : 'rgba(212,175,55,0.3)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.3)', background: 'transparent', color: 'var(--text)', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}
            >
              ← Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={close}
                style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
              >
                Finish
              </button>
            )}
            <button
              onClick={close}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.3)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};