export interface CraftingStation {
  id: string;
  name: string;
  description: string;
  skill: 'alchemy' | 'forging' | 'all';
  bonuses: {
    successChance?: number; // e.g., 0.1 for +10%
    qualityChance?: number; // e.g., 0.15 for +15% to roll higher quality
    expGainMultiplier?: number; // e.g., 1.2 for 20% more EXP
  };
}

export const allStations: CraftingStation[] = [
  {
    id: 'heavenly_forge',
    name: 'Heavenly Forge',
    description: 'A forge blessed by celestial fire, improving the quality of crafted items.',
    skill: 'forging',
    bonuses: {
      successChance: 0.1,
      qualityChance: 0.2,
      expGainMultiplier: 1.5,
    },
  },
  {
    id: 'moonlit_cauldron',
    name: 'Moonlit Cauldron',
    description: 'An alchemy cauldron that gathers moonlight, increasing the potency of pills.',
    skill: 'alchemy',
    bonuses: {
      successChance: 0.05,
      qualityChance: 0.25,
    },
  },
];

export const stationsById = new Map(allStations.map(s => [s.id, s]));