/* eslint-disable no-restricted-imports -- entrypoint imports RivalSystem for bootstrapping */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Kick off non-blocking ensures for large runtime datasets so they can begin
// loading early without blocking startup. We intentionally do not await these.
void import('./systems/passiveRegistry').then(mod => { try { if (mod && typeof (mod as any).ensureGeneratedPassives === 'function') (mod as any).ensureGeneratedPassives(); } catch (e) { void e; } }).catch(() => { void 0; });
// Load custom passives (non-blocking) so handcrafted passives register early without delaying render
void import('./systems/customPassives').catch(() => { /* ignore */ });
import { useGameStore } from './store/useGameStore';
import { worldState } from './systems/worldState';
import { idleManager } from './systems/idleManager';
import { breakthroughChallenge } from './systems/breakthroughChallenge';
import { eventManager } from './systems/eventManager';
import { rumorSystem } from './systems/rumorSystem';
import { npcManager } from './systems/npcManager';
import { relationshipManager } from './systems/relationshipManager';
import { loreCodex } from './systems/loreCodex';
import { logger } from './utils/logger';
import { RivalSystem } from './systems/RivalSystem';
// Dev-only playtest utilities
let PlaytestOverlay: any = null;
// Load dev-only playtest helpers via dynamic import to avoid bundling CommonJS `require`
try {
  if (process.env.NODE_ENV !== 'production') {
    import('./components/dev/PlaytestOverlay').then(m => { PlaytestOverlay = m.default; }).catch(() => { void 0; });
    import('./playtest/presets').then(m => {
      const PRESETS = m.PRESETS as any;
      const query = new URLSearchParams(window.location.search || '');
      const p = query.get('playtest');
      if (p && PRESETS && PRESETS[p]) {
        try { useGameStore.setState(PRESETS[p]); } catch (e) { /* ignore */ }
        import('./utils/seededRng').then(s => {
          try { const { makeSeededRng, setRuntimeRng } = s; setRuntimeRng(makeSeededRng(12345)); } catch (e) { /* ignore */ }
        }).catch(() => { void 0; });
      }
    }).catch(() => { void 0; });
  }
} catch (e) { void e; }

// Expose store and systems globally for systems that reference window.*
// This is a pragmatic bridge for current architecture; consider replacing with context/injection later.
(function exposeGlobals() {
  try {
    // Initialize store once; zustand create returns a hook, but we can access getState/setState via getState
    // const store = useGameStore.getState();
    // Expose a small dev-friendly bridge to the store only when explicitly
    // enabled via env var to avoid leaking internals. Two ways to enable:
    //  - Node/CI/local: set ENABLE_E2E=1 in the environment
    //  - Vite dev builds: set VITE_ENABLE_E2E=true in .env or define via dev server
    // Check Node/CI env first (ENABLE_E2E=1). For Vite dev we avoid referencing
    // `import.meta` directly (it breaks the CJS tsc build). Instead use a runtime
    // global that Vite can set (e.g. window.__VITE_ENABLE_E2E) or fall back to
    // string-typed globals. This keeps the bridge gated while remaining
    // compatible with the Node/CommonJS build step.
    const nodeFlag = (typeof process !== 'undefined' && (process as any).env && (process as any).env.ENABLE_E2E === '1');
    const viteFlag = (typeof (globalThis as any) !== 'undefined' && ((globalThis as any).__VITE_ENABLE_E2E === true || (globalThis as any).__VITE_ENABLE_E2E === 'true'));
    const enableE2E = nodeFlag || viteFlag;
    if (enableE2E) {
      // Keep it minimal and defensive
      const _gs = useGameStore.getState();
      (window as any).gameStore = (window as any).gameStore || {};
      try {
        (window as any).gameStore.getState = useGameStore.getState;
        (window as any).gameStore.setState = useGameStore.setState;
        if (typeof _gs.adjustRivalRelationship === 'function') (window as any).gameStore.adjustRivalRelationship = _gs.adjustRivalRelationship;
        if (typeof _gs.markRivalDefeated === 'function') (window as any).gameStore.markRivalDefeated = _gs.markRivalDefeated;
        if (typeof _gs.adjustFactionStanding === 'function') (window as any).gameStore.adjustFactionStanding = _gs.adjustFactionStanding;
        if (typeof _gs.runTrainingSession === 'function') (window as any).gameStore.runTrainingSession = _gs.runTrainingSession;
        if (typeof _gs.trainBody === 'function') (window as any).gameStore.trainBody = _gs.trainBody;
        if (typeof _gs.trainMartial === 'function') (window as any).gameStore.trainMartial = _gs.trainMartial;
      } catch (e) {
        logger.debug('Failed to augment window.gameStore bridge:', e);
      }
    }
    // Reuse the RivalSystem instance from the store if needed elsewhere
    (window as any).rivalSystem = useGameStore.getState().rivalSystem as RivalSystem;
        // Expose WorldState for dev/test inspection when the E2E bridge is enabled
        try {
          (window as any).game = (window as any).game || {};
          (window as any).game.worldState = worldState;
          (window as any).game.idleManager = idleManager;
          (window as any).game.breakthrough = breakthroughChallenge;
          (window as any).game.eventManager = eventManager;
          (window as any).game.rumorSystem = rumorSystem;
          (window as any).game.npcManager = npcManager;
          (window as any).game.relationshipManager = relationshipManager;
          (window as any).game.loreCodex = loreCodex;
        } catch (e) { /* non-fatal */ }
  } catch (e) {
    logger.warn('Global exposure failed:', e);
  }
})();

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <>
        <App />
        {PlaytestOverlay ? <PlaytestOverlay /> : null}
      </>
    </React.StrictMode>
  );
} else {
  // If the root element is missing, log a warning in dev; do not throw in production builds
  try { console.warn('Root element not found: skipping initial render'); } catch (e) { void e; }
}

