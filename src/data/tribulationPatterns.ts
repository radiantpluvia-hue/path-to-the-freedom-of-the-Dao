export const TRIBULATION_PATTERNS: { patterns: Record<string, any>; modifiers: { realm_scaling: Record<string, number>; bloodline_multipliers: Record<string, number>; physique_multipliers: Record<string, number> } } = {
  patterns: {
    heavenly_thunder: { waves: [], description: 'Heavenly thunder pattern', completionBonus: {}, curses: [], type: 'physical' },
    heart_demon_assault: { waves: [], description: 'Heart demon', completionBonus: {}, curses: [], type: 'mental' },
    karmic_retribution: { waves: [], description: 'Karmic retribution', completionBonus: {}, curses: [], type: 'karmic' },
    dao_chaos_storm: { waves: [], description: 'Dao chaos', completionBonus: {}, curses: [], type: 'chaos' },
    bloodline_awakening: { waves: [], description: 'Bloodline awakening', completionBonus: {}, curses: [], type: 'bloodline' }
  },
  modifiers: {
    realm_scaling: {} as Record<string, number>,
    bloodline_multipliers: {} as Record<string, number>,
    physique_multipliers: {} as Record<string, number>
  }
};
