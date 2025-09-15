import { useGameStore } from '@/store/useGameStore';
import { RACE_BACKGROUNDS } from '@/data/raceBackgrounds';

describe('Character creation -> startGame background effects', () => {
  beforeEach(() => {
    // Reset relevant store slices to a known base
    useGameStore.setState(state => ({
      player: {
        ...state.player,
        yuan: 0,
        spiritStones: { low: 0, mid: 0, high: 0 },
        reputation: { world: 0 },
        factionStandings: {},
        // Reset skill to base for deterministic assertion
        skills: {
          ...state.player.skills,
          socialSkills: { ...state.player.skills.socialSkills, level: 0, exp: 0, expToNext: 100 },
        },
        background: null,
      },
      ui: { ...state.ui, currentScreen: 'creation' },
    }));
  });

  it('applies Human Noble background effects on startGame', () => {
    const noble = RACE_BACKGROUNDS['Human'].find(b => b.id === 'human_noble');
    expect(noble).toBeTruthy();

    // Set background
    useGameStore.getState().setPlayerProperty('background', noble!);

    // Start game
    useGameStore.getState().startGame();

    const state = useGameStore.getState();

    expect(state.ui.currentScreen).toBe('game');
    expect(state.player.yuan).toBeGreaterThanOrEqual(2000);
    expect(state.player.spiritStones.low).toBeGreaterThanOrEqual(100);
    expect(state.player.spiritStones.mid).toBeGreaterThanOrEqual(10);
    expect(state.player.skills.socialSkills.level).toBeGreaterThanOrEqual(3);
    expect(state.player.reputation.world).toBeGreaterThanOrEqual(50);
  });
});