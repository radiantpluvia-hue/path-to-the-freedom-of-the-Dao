import React from 'react';
import PRESETS from '../../playtest/presets';
import { useGameStore } from '../../store/useGameStore';
import { makeSeededRng, setRuntimeRng } from '../../utils/seededRng';
// GENERATED_PASSIVES is large; load it on demand to avoid inflating the main bundle
import { applyPassiveToPlayer } from '../../systems/passiveRegistry';
import MinigamePlayground from '../game/MinigamePlayground';

const PlaytestOverlay: React.FC = () => {
  const applyPreset = (name: string) => {
    const preset = (PRESETS as any)[name];
    if (!preset) return;
    // merge partial state into store
    useGameStore.setState(preset as any);
  };

  const seed = (v: string) => { try { const s = parseInt(v || '0', 10) || Date.now(); setRuntimeRng(makeSeededRng(s)); } catch (e) { void e; } };

  const grantSamplePassives = (n = 3) => {
    try {
      const rng = makeSeededRng(12345);
      // dynamically import the generated passives file when needed
      // keep synchronous path minimal and do not block UI
      void (async () => {
        try {
          const mod = await import('../../data/generated/passives.generated');
          const list = (mod && mod.GENERATED_PASSIVES) ? mod.GENERATED_PASSIVES.slice(0, 100) : [];
          const chosen: any[] = [];
          for (let i = 0; i < n; i++) {
            const idx = Math.floor(rng() * list.length);
            chosen.push(list[idx]);
          }
          // Apply to store's player
          useGameStore.setState((s: any) => {
            let p = { ...(s.player || {}) };
            chosen.forEach(c => { p = applyPassiveToPlayer(p, c.id); });
            return { player: p } as any;
          });
        } catch (e) { /* ignore */ }
      })();
    } catch (e) { /* ignore */ }
  };

  return (
    <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 9999, background: 'rgba(0,0,0,0.6)', color: 'white', padding: 8, borderRadius: 6, fontSize: 12 }}>
      <div style={{ marginBottom: 6 }}>Playtest Overlay (dev)</div>
      <div style={{ display: 'flex', gap: 6 }}>
  <button onClick={() => applyPreset('quick')}>Apply Quick</button>
  <button onClick={() => applyPreset('highfatigue')}>Apply High Fatigue</button>
  <button onClick={() => grantSamplePassives(3)}>Grant Sample Passives</button>
      </div>
      <div style={{ marginTop: 6 }}>
        <input placeholder="seed" id="pt_seed_input" style={{ width: 120 }} />
        <button onClick={() => seed((document.getElementById('pt_seed_input') as any)?.value)}>Seed RNG</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => { const el = document.getElementById('minigame_playground_container'); if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; } }}>Toggle Minigame Playground</button>
      </div>
      <div id="minigame_playground_container" style={{ display: 'none', marginTop: 8 }}>
        <MinigamePlayground />
      </div>
    </div>
  );
};

export default PlaytestOverlay;
