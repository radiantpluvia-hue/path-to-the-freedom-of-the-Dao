const ENCOUNTER_TEMPLATES: Record<string, any> = {
  'roadbandit_small': {
    id: 'roadbandit_small',
    name: 'Road Bandit',
    hp: 60,
    atk: 8,
    def: 5,
    speed: 8,
  // Use curated techniques to give the bandit a stun and multi-hit option
    techniques: ['cur_stun_strike', 'cur_multi_slash'],
    ai: { preferredTechniques: ['cur_stun_strike', 'cur_multi_slash'], openingBias: true },
    loot: [{ type: 'yuan', amount: 5 }, { type: 'resource', id: 'herb_common', qty: 1 }]
  },
  'spirit_hound': {
    id: 'spirit_hound',
    name: 'Spirit Hound',
    hp: 90,
    atk: 12,
    def: 6,
    speed: 12,
    // Spirit hound uses howl + a multi-strike
    techniques: ['cur_howl_frenzy', 'cur_multi_slash'],
    ai: { preferredTechniques: ['cur_howl_frenzy', 'cur_multi_slash'], openingBias: true },
    loot: [{ type: 'spirit_stone', grade: 'low', amount: 1 }]
  }
};

export function getEncounterTemplate(id: string) {
  return ENCOUNTER_TEMPLATES[id] || null;
}

export default ENCOUNTER_TEMPLATES;
