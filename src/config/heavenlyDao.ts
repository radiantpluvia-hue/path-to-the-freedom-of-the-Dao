// File: src/config/heavenlyDao.ts
export const HEAVENLY_RANKING = {
  CATEGORY_NAMES: ['power', 'providence', 'karma'] as const,
  MAX_ENTRIES: 100,
  TOP_REWARD_THRESHOLD: 10,
  RANKING_CYCLE_YEARS: 5000, // game years per season
  MIN_REALM_FOR_RANKING: 'immortal_early', // adjust to your realm enum
  COMPRESSION_ALPHA: 0.55, // project compression constant
  // weights for composite sorting (tweak as desired)
  POWER_WEIGHT: 0.6,
  PROVIDENCE_WEIGHT: 0.25,
  KARMA_WEIGHT: 0.15,
  // reward tuning (placeholders)
  TOP_REWARD_TITLES: [
    'Heaven\'s Chosen', 'Heaven\'s Champion', 'Heavenly Paragon'
  ],
};

export default HEAVENLY_RANKING;
