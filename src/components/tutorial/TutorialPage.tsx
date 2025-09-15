import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

// Dedicated tutorial screen with concise sections
export const TutorialPage: React.FC = () => {
  const { setUIProperty } = useGameStore();

  useEffect(() => {
  try { localStorage.setItem('xg_tutorial_seen', '1'); } catch (e) { /* ignore storage errors */ console.debug('TutorialPage: localStorage.setItem failed', e); }
  }, []);

  const backToGame = () => setUIProperty('currentScreen', 'game');

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>{title}</h3>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: 'var(--accent)' }}>Tutorial</h2>
        <button onClick={backToGame} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }}>← Back to Game</button>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 980, margin: '0 auto' }}>
        <Section title="Core Loop">
          Cultivate to gain Qi → Complete all minor stages → Attempt a realm breakthrough via challenges → Advance realms for better stats and systems.
        </Section>
        <Section title="Cultivation & Breakthroughs">
          Use the Cultivation button to open the interactive practice. Earn Qi from the mini-game, then perform Minor Breakthroughs. When all minor stages are complete, select a Challenge to attempt a Realm Breakthrough.
        </Section>
        <Section title="Quests & Story">
          Track your Main Quest and story events on the right sidebar of the Core page. Choices affect stats, karma, and unlocks.
        </Section>
        <Section title="Sects, Market, Mentors">
          Join a sect to gain reputation and services. Trade items and resources in the Market. Visit Mentors for teachings (when available).
        </Section>
        <Section title="Tips">
          Practice Qi Control often for steady Qi gain. Improve Meditation and Qi Control skills to speed progress. Read event outcomes; karma matters.
        </Section>
      </div>
    </div>
  );
};