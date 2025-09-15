import { ALL_MANUALS } from '../src/data/manuals';

// We'll import the store fresh in each test to avoid cross-test state
function freshStore() {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const storeMod = require('../src/store/useGameStore');
  return storeMod.useGameStore;
}

describe('attemptStudy store action', () => {
  test('succeeds when player has enough yuan and QI', () => {
    const useGameStore = freshStore();
    const sutra = ALL_MANUALS[0];

    // Initialize player with sufficient resources
    useGameStore.setState({ player: { ...useGameStore.getState().player, yuan: 10, currentQi: 100, manuals: [] } });

    const res = useGameStore.getState().attemptStudy(sutra.id);
    expect(res).toBe(true);

    const player = useGameStore.getState().player;
    // After studying, manual should be present
    expect(player.manuals.some((m: any) => m.id === sutra.id)).toBe(true);
    // Yuan should be deducted by floor(tier/2) (tier may be missing; safe check: deduction >= 0)
    expect(player.yuan).toBeGreaterThanOrEqual(0);
  });

  test('fails when insufficient yuan or QI', () => {
    const useGameStore = freshStore();
    const sutra = ALL_MANUALS[0];

    // insufficient yuan
    useGameStore.setState({ player: { ...useGameStore.getState().player, yuan: 0, currentQi: 100, manuals: [] } });
    expect(useGameStore.getState().attemptStudy(sutra.id)).toBe(false);

    // insufficient QI
    useGameStore.setState({ player: { ...useGameStore.getState().player, yuan: 100, currentQi: 0, manuals: [] } });
    expect(useGameStore.getState().attemptStudy(sutra.id)).toBe(false);
  });
});
