import type { Skill } from '../../components/minigames/skills';

// Sect-specific signature techniques — typically tailored to sect identity
export const SECT_SKILLS: Skill[] = [];

const sectNames = ['Jade Serene','Crimson Wolf','Iron Mountain','Silent Lotus','Azure Cloud','Black Crane','Golden Pine','Moonfall'];
const types = ['Palm','Saber','Form','Seal','Breath','Dagger','Spear','Shield'];

for (let s = 0; s < sectNames.length; s++) {
  for (let i = 0; i < 10; i++) { // increase per-sect techniques to 10
    const idn = `${sectNames[s].toLowerCase().replace(/\s+/g,'_')}_skill_${i}`;
    SECT_SKILLS.push({
      id: idn,
      name: `${sectNames[s]} ${types[i % types.length]} ${i+1}`,
      tier: 2 + (i % 5) as any,
      power: 20 + (s * 3) + i * 4,
      cooldown: 1 + (i % 4),
      cost: { ap: 0 + Math.floor((i+1)/2), qi: Math.max(0, 5 + (i * 2)) },
      type: 'attack',
      apCost: 0,
      qiCost: 5 + (i % 10),
      effects: [{ type: 'damage', target: 'enemy', value: 20 + (s * 3) + i * 4 }],
      description: `A hallmark technique of the ${sectNames[s]} sect, used in rites and duels.`,
      unlock: { sectId: sectNames[s].toLowerCase().replace(/\s+/g,'_') }
    } as any);
  }
}

// Extra generic sect techniques
for (let i = 0; i < 10; i++) {
  SECT_SKILLS.push({
    id: `sect_generic_${i}`,
    name: `Sect Technique ${i}`,
    tier: 3 as any,
    power: 25 + (i % 10),
    cooldown: 1 + (i % 3),
    cost: { ap: 0, qi: 6 + (i % 8) },
    type: 'generic',
    apCost: 0,
    qiCost: 6 + (i % 8),
    effects: [{ type: 'generic', target: 'self', value: 25 + (i % 10) }],
    description: `A H sect technique used by mid-tier disciples.`
  } as any);
}

export default SECT_SKILLS;
