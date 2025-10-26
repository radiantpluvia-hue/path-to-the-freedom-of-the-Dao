// guEnemies.ts
// Side-zone enemy templates tied to Gu progression ranks. No Fang Yuan characters included.

export interface GuEnemyTemplate {
  id: string;
  name: string;
  description: string;
  suggestedRank: number; // which Gu rank this enemy typically appears at
  power: number; // abstract combat power
  loot?: { guFragments?: number; items?: string[] };
}

const GU_ENEMIES: GuEnemyTemplate[] = [
  {
    id: 'fangling_raiders',
    name: 'Fangling Raiders',
    description: "Small bandit-like cultivators lured by rumor of Gu caches.",
    suggestedRank: 1,
    power: 8,
    loot: { guFragments: 1, items: ['rusted_blade'] },
  },
  {
    id: 'pit_digester',
    name: 'Pit Digester',
    description: 'A semi-sentient Gu-tendril that drags prey into pits to be consumed.',
    suggestedRank: 2,
    power: 18,
    loot: { guFragments: 2, items: ['acid_gland'] },
  },
  {
    id: 'jade_claw_hunter',
    name: 'Jade Claw Hunter',
    description: 'An agile, predatory cultivator enhanced with minor Gu implants.',
    suggestedRank: 3,
    power: 30,
    loot: { guFragments: 4, items: ['jade_claw'] },
  },
  {
    id: 'bone_warrior',
    name: 'Bone Warrior',
    description: 'A hulking enemy animated by bone Gu; often defends deeper nests.',
    suggestedRank: 5,
    power: 65,
    loot: { guFragments: 10, items: ['hollow_bone'] },
  },
  {
    id: 'ember_swarm_leader',
    name: 'Ember Swarm Leader',
    description: 'Leader of ember mites. Quick and deadly in short bursts; often coordinates swarms.',
    suggestedRank: 2,
    power: 22,
    loot: { guFragments: 3, items: ['embershard'] },
  },
  {
    id: 'mirror_phantom',
    name: 'Mirror Phantom',
    description: 'A cultivator fused with Mirror Spore; creates illusions and ambushes.',
    suggestedRank: 3,
    power: 28,
    loot: { guFragments: 4, items: ['glimmer_dust'] },
  },
  {
    id: 'ravenous_hive_guard',
    name: 'Ravenous Hive Guard',
    description: 'A human host heavily augmented by Ravenous Hive; slow but devastating.',
    suggestedRank: 4,
    power: 44,
    loot: { guFragments: 7, items: ['hive_organ'] },
  },
  {
    id: 'obsidian_matriarch',
    name: 'Obsidian Matriarch',
    description: 'A near-mythic Gu guardian often found protecting obsidian nests; tremendously powerful.',
    suggestedRank: 7,
    power: 150,
    loot: { guFragments: 50, items: ['obsidian_heart'] },
  },
  {
    id: 'renowned_hunter_xi',
    name: 'Renowned Hunter Xi',
    description: 'A mortal hunter who made a pact with a mid-rank Gu; well-known in local lore (not Fang Yuan).',
    suggestedRank: 3,
    power: 36,
    loot: { guFragments: 6, items: ['hunter_spike'] },
  },
];

export default GU_ENEMIES;
