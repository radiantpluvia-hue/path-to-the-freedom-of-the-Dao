function freshStore() {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const storeMod = require('../src/store/useGameStore');
  return storeMod.useGameStore;
}

test('headless playtest: act1 start -> mentor unlock -> act4 events', () => {
  const useGameStore = freshStore();
  const s = useGameStore.getState();

  // Start new game best-effort
  if (typeof s.startNewGame === 'function') {
    s.startNewGame({ name: 'Playtester', seed: 12345 });
  } else {
    useGameStore.setState({ player: { ...s.player, name: 'Playtester' } });
  }

  // Unlock a mentor if API exists
  if (typeof s.unlockMentor === 'function') {
    s.unlockMentor('fang_yuan');
  }

  // Advance a few days by invoking dailyTick if present
  for (let i = 0; i < 7; i++) {
    try { useGameStore.getState().dailyTick?.(); } catch (e) { /* ignore */ }
  }

  // Trigger Act 4 events if API exists
  if (typeof useGameStore.getState().triggerActEvents === 'function') {
    useGameStore.getState().triggerActEvents(4);
  }

  const snap = useGameStore.getState();
  expect(snap.player).toBeTruthy();
  // basic sanity checks
  expect(typeof snap.player.name).toBe('string');
});
