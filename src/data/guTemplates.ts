// guTemplates.ts
// Starter Gu templates inspired by Reverend Insanity themes (no Fang Yuan entries here).
// Replace names/descriptions with exact novel references if you want.

export interface GuTemplate {
  id: string;
  name: string;
  description: string;
  rank: number; // 1..N
  isVital?: boolean;
  basePower: number;
  upkeepCost?: { essence?: number; food?: number };
}

const GU_TEMPLATES: Record<string, GuTemplate> = {
  starter_gu: {
    id: 'starter_gu',
    name: 'Starter Gu',
    description: 'A neutral vital Gu that assists digestion and Qi refinement.',
    rank: 1,
    isVital: true,
    basePower: 5,
    upkeepCost: { essence: 2, food: 1 },
  },
  razor_worm: {
    id: 'razor_worm',
    name: 'Razor Worm',
    description: 'A vicious worm-like Gu; excels at shredding defenses and corrupting small pockets of Qi.',
    rank: 2,
    basePower: 12,
    upkeepCost: { essence: 6 },
  },
  glass_serpent: {
    id: 'glass_serpent',
    name: 'Glass Serpent',
    description: 'A translucent, venomous Gu that can refine incoming essence into destructive strikes.',
    rank: 3,
    basePower: 22,
    upkeepCost: { essence: 12 },
  },
  bone_colossus: {
    id: 'bone_colossus',
    name: 'Bone Colossus',
    description: 'A large, ancient Gu formed from gathered bones; grants great durability to its host at cost of appetite.',
    rank: 5,
    basePower: 48,
    upkeepCost: { essence: 30, food: 10 },
  },
  ember_mite: {
    id: 'ember_mite',
    name: 'Ember Mite',
    description: 'Small gu that concentrates residual fire-essence; useful for short bursts of destructive power.',
    rank: 2,
    basePower: 14,
    upkeepCost: { essence: 5 },
  },
  mirror_spore: {
    id: 'mirror_spore',
    name: 'Mirror Spore',
    description: 'A deceptive Gu that can create spectral afterimages to confuse attackers.',
    rank: 3,
    basePower: 20,
    upkeepCost: { essence: 10 },
  },
  ravenous_hive: {
    id: 'ravenous_hive',
    name: 'Ravenous Hive',
    description: 'A collective Gu made of many small mouths; increases host consumption but grants swarm attacks.',
    rank: 4,
    basePower: 36,
    upkeepCost: { essence: 20, food: 8 },
  },
  obsidian_queen: {
    id: 'obsidian_queen',
    name: 'Obsidian Queen',
    description: 'A rare vital Gu that dominates lesser Gu; grants strong offensive and defensive bonuses at high upkeep.',
    rank: 7,
    basePower: 110,
    upkeepCost: { essence: 80, food: 25 },
  },
};

export default GU_TEMPLATES;
