/* eslint-disable no-restricted-imports -- entrypoint imports RivalSystem for bootstrapping */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useGameStore } from './store/useGameStore';
import { RivalSystem } from './systems/RivalSystem';

// Expose store and systems globally for systems that reference window.*
// This is a pragmatic bridge for current architecture; consider replacing with context/injection later.
(function exposeGlobals() {
  try {
    // Initialize store once; zustand create returns a hook, but we can access getState/setState via getState
    // const store = useGameStore.getState();
    (window as any).gameStore = {
      adjustRivalRelationship: useGameStore.getState().adjustRivalRelationship,
      markRivalDefeated: useGameStore.getState().markRivalDefeated,
      adjustFactionStanding: useGameStore.getState().adjustFactionStanding,
    };
    // Reuse the RivalSystem instance from the store if needed elsewhere
    (window as any).rivalSystem = useGameStore.getState().rivalSystem as RivalSystem;
  } catch (e) {
    console.warn('Global exposure failed:', e);
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

