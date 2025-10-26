import { GameState } from '../types';

// Minimal partial presets to apply via setState in dev
export const PRESETS: Record<string, Partial<GameState>> = {
  quick: {
    player: {
      currentQi: 200,
      fatigue: 0,
      techniques: [{ id: 'dt_test_tech', name: 'DT Test', masteryXp: 0, masteryRank: 0 } as any],
      hp: 100,
      qi: 100,
    } as any
  },
  highfatigue: {
    player: {
      currentQi: 200,
      fatigue: 22,
      techniques: [{ id: 'dt_test_tech', name: 'DT Test', masteryXp: 0, masteryRank: 0 } as any]
    } as any
  }
};

export default PRESETS;
