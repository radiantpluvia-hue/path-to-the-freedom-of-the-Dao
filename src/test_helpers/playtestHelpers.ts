import { makeSeededRng, setRuntimeRng, clearRuntimeRng } from '../utils/seededRng';

// freshStore pattern used across tests: require the module after resetModules
export async function initializeStoreForPlaytest(seed?: number) {
  // Reset modules when possible (jest environment) - best-effort
  try { (global as any).jest?.resetModules?.(); } catch (e) { /* not running under jest */ }
  if (seed !== undefined) setRuntimeRng(makeSeededRng(seed));
  // Dynamically import the store module so this helper works in ESM runtime
  const storeMod = await import('../store/useGameStore');
  const useGameStore = storeMod.useGameStore;

  const store = useGameStore;

  const actions: any = {
    startNewGame: (opts: any) => {
      const s: any = useGameStore.getState();
      if (typeof (s as any).startNewGame === 'function') return (s as any).startNewGame(opts);
      try { useGameStore.setState({ player: { ...s.player, name: opts?.name || 'Playtester' } }); } catch (e) { /* ignore */ }
    },
    unlockMentor: (mentorId: string) => {
      const s: any = useGameStore.getState();
      if (typeof (s as any).unlockMentor === 'function') return (s as any).unlockMentor(mentorId);
    },
    advanceDays: (days: number) => {
      for (let i = 0; i < (days || 1); i++) {
        const s: any = useGameStore.getState();
        try { (s as any).dailyTick?.(); } catch (e) { /* ignore */ }
      }
    },
    triggerActEvents: (actNum: number) => {
      const s: any = useGameStore.getState();
      if (typeof (s as any).triggerActEvents === 'function') return (s as any).triggerActEvents(actNum);
    }
  };

  return { store, actions };
}

export function shutdownPlaytest() {
  try { clearRuntimeRng(); } catch (e) { /* ignore */ }
}

export function advanceTicks(store: any, ticks: number) {
  for (let i = 0; i < ticks; i++) {
    try { store.getState().dailyTick?.(); } catch (e) { /* ignore */ }
    try { store.getState().seclusionTick?.(); } catch (e) { /* ignore */ }
    try { store.getState().hermitTick?.(); } catch (e) { /* ignore */ }
  }
}

export function getStoreSnapshot(store: any) {
  try { return store.getState(); } catch (e) { return null; }
}

export default {
  initializeStoreForPlaytest,
  shutdownPlaytest,
  advanceTicks,
  getStoreSnapshot
};
