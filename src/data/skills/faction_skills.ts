import type { Skill } from '../../components/minigames/skills';

// Faction-wide tactics and group-oriented arts
export const FACTION_SKILLS: Skill[] = [];

const factions = ['Nomad Clans','Traders Guild','Imperial Guard','Bandit Confederacy','Scholar Circle'];
const tactics = ['Volley','Rally','Ambush','Charge','Fortify','Sabotage'];

for (let f = 0; f < factions.length; f++) {
  for (let i = 0; i < 16; i++) { // expand tactics per faction
    FACTION_SKILLS.push({
      id: `${factions[f].toLowerCase().replace(/\s+/g,'_')}_tactic_${i}`,
      name: `${factions[f]} ${tactics[i % tactics.length]}`,
      tier: 2 + (i % 4) as any,
      power: 15 + (i * 3),
      cooldown: 2 + (i % 3),
      cost: { ap: 0, qi: 0 },
      apCost: 0,
      qiCost: 0,
      effects: [{ type: 'buff', target: 'allies', stat: 'morale', value: 10 }],
      description: `A faction-level tactic executed by groups within the ${factions[f]}.`,
      mechanics: [{ type: 'conditional', condition: 'group_size>3' }]
    } as any);
  }
}

// Add a few high-impact faction powers
FACTION_SKILLS.push({
  id: 'imperial_guard_warpath',
  name: 'Warpath (Imperial Guard)',
  tier: 5,
  power: 60,
  cooldown: 6,
  cost: { ap: 0, qi: 20 },
  apCost: 0,
  qiCost: 20,
  effects: [{ type: 'damage', target: 'enemy', value: 60 }, { type: 'debuff', target: 'enemy', stat: 'armor', value: -10, duration: 2 }],
  description: 'A coordinated offensive by elite Guard units that breaks enemy lines.',
});

export default FACTION_SKILLS;
