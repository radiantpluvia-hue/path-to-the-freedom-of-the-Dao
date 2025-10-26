export const KIDGOD_ABILITIES = [
  {
    id: 'recoilless_kick',
    name: 'Recoilless Kick',
    tier: 'immortal',
    power: 160,
    cooldown: 2,
    cost: { ap: 1, qi: 40 },
    apCost: 1,
    qiCost: 40,
    description: 'A blinding, recoilless kick that deals strong damage and briefly weakens enemy defense.',
    effects: [
      { type: 'damage', target: 'enemy', value: 160 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.6666667, duration: 3 }
    ]
  },
  {
    id: 'ruyi_jingu_strike',
    name: 'Ruyi Jingu Strike',
    tier: 'immortal',
    power: 220,
    cooldown: 4,
    cost: { ap: 2, qi: 80 },
    apCost: 2,
    qiCost: 80,
    description: 'A devastating polearm strike that shatters guard; heavy damage and longer defense weakening.',
    effects: [
      { type: 'damage', target: 'enemy', value: 220 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.6666667, duration: 4 }
    ]
  },
  {
    id: 'dragon_catcher',
    name: 'Dragon Catcher',
    tier: 'immortal',
    power: 140,
    cooldown: 3,
    cost: { ap: 1, qi: 50 },
    apCost: 1,
    qiCost: 50,
    description: 'A mid-range pole technique that pulls the foe and reduces their defense for a few turns.',
    effects: [
      { type: 'damage', target: 'enemy', value: 140 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.75, duration: 3 }
    ]
  },
  {
    id: 'ground_draw',
    name: 'Ground Draw',
    tier: 'immortal',
    power: 120,
    cooldown: 2,
    cost: { ap: 1, qi: 30 },
    apCost: 1,
    qiCost: 30,
    description: 'A sweeping technique that trips the opponent and lowers defense briefly.',
    effects: [
      { type: 'damage', target: 'enemy', value: 120 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.8, duration: 2 }
    ]
  },
  {
    id: 'baek_nok_strike',
    name: 'Baek Nok Strike',
    tier: 'immortal',
    power: 150,
    cooldown: 3,
    cost: { ap: 1, qi: 45 },
    apCost: 1,
    qiCost: 45,
    description: 'A focused foot strike that pierces guard and applies a strong defense penalty.',
    effects: [
      { type: 'damage', target: 'enemy', value: 150 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.7, duration: 3 }
    ]
  },
  {
    id: 'blue_dragon_kick',
    name: "Blue Dragon's Kick",
    tier: 'immortal',
    power: 180,
    cooldown: 3,
    cost: { ap: 1, qi: 55 },
    apCost: 1,
    qiCost: 55,
    description: 'A signature kick imbued with dragon force; high damage and moderate defense weakening.',
    effects: [
      { type: 'damage', target: 'enemy', value: 180 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.72, duration: 3 }
    ]
  },
  {
    id: 'ice_kick',
    name: 'Ice Kick',
    tier: 'immortal',
    power: 110,
    cooldown: 2,
    cost: { ap: 1, qi: 35 },
    apCost: 1,
    qiCost: 35,
    description: 'A chilling kick that deals damage and slightly weakens defense while reducing speed.',
    effects: [
      { type: 'damage', target: 'enemy', value: 110 },
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.85, duration: 3 },
      { type: 'debuff', target: 'enemy', stat: 'speed', value: -6, duration: 2 }
    ]
  },
  {
    id: 'recoilless_concept',
    name: 'Recoilless Concept',
    tier: 'immortal',
    power: 0,
    cooldown: 6,
    cost: { ap: 0, qi: 60 },
    apCost: 0,
    qiCost: 60,
    description: 'A conceptual burst that temporarily reduces enemy defense massively and buffs Kid God for a short time.',
    effects: [
      { type: 'debuff', target: 'enemy', stat: 'def_multiplier', multiplier: 0.6, duration: 3 },
      { type: 'buff', target: 'self', stat: 'atk', value: 60, duration: 3 }
    ]
  }
];

export default KIDGOD_ABILITIES;
