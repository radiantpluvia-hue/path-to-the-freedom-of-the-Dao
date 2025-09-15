import { Recipe } from '../systems';

export const allRecipes: Recipe[] = [
  // --- ALCHEMY RECIPES ---
  {
    id: 'lesser_qi_pill',
    name: 'Lesser Qi Pill',
    description: 'A simple pill to restore a small amount of Qi.',
    skill: 'alchemy',
    requiredLevel: 1,
    ingredients: [
      { itemId: 'spirit_grass', quantity: 3 },
      { itemId: 'dewdrop', quantity: 1 },
    ],
    output: {
      itemId: 'lesser_qi_pill_item',
      name: 'Lesser Qi Pill',
      type: 'pill',
      quantity: 1,
      effects: { qi_recovery: 50 }
    },
    baseSuccessChance: 0.8,
    qualityTiers: ['Crude', 'Common', 'Refined'],
    expGain: 10,
  },
  {
    id: 'body_tempering_elixir',
    name: 'Body Tempering Elixir',
    description: 'An elixir that temporarily boosts physical resilience.',
    skill: 'alchemy',
    requiredLevel: 5,
    ingredients: [
      { itemId: 'ironbone_herb', quantity: 2 },
      { itemId: 'beast_blood', quantity: 1 },
    ],
    output: {
      itemId: 'body_tempering_elixir_item',
      name: 'Body Tempering Elixir',
      type: 'elixir',
      quantity: 1,
      effects: { temporary_stat_boost: { def: 10 }, duration: 300 } // duration in seconds
    },
    baseSuccessChance: 0.6,
    qualityTiers: ['Murky', 'Potent', 'Pristine'],
    expGain: 25,
  },
  {
    id: 'refined_qi_pill',
    name: 'Refined Qi Pill',
    description: 'A more potent pill made from refining lesser ones.',
    isSecret: true, // This recipe must be discovered through experimentation
    skill: 'alchemy',
    requiredLevel: 10,
    ingredients: [
      { itemId: 'lesser_qi_pill_item', quantity: 2 }, // This is the output of another recipe
      { itemId: 'high_grade_spirit_stone', quantity: 1 }, // Assumes this item exists
    ],
    output: {
      itemId: 'refined_qi_pill_item',
      name: 'Refined Qi Pill',
      type: 'pill',
      quantity: 1,
      effects: { qi_recovery: 250 },
      uniqueProperties: {
        specialEffectId: 'qi_purification_1',
        description: 'This pill purifies your meridians, doubling the Qi gained from your next cultivation session.'
      }
    },
    baseSuccessChance: 0.7,
    qualityTiers: ['Concentrated', 'Pure', 'Flawless'],
    expGain: 50,
  },

  {
    id: 'spirit_root_elixir',
    name: 'Spirit Root Elixir',
    description: 'A potent elixir that permanently strengthens one\'s foundation by nourishing the spirit root.',
    skill: 'alchemy',
    requiredLevel: 15,
    ingredients: [
      { itemId: 'thousand_year_spirit_herb', quantity: 1 }, // Assumes this is a rare drop
      { itemId: 'beast_core_fragment', quantity: 5 },
      { itemId: 'high_grade_spirit_stone', quantity: 2 },
    ],
    output: {
      itemId: 'spirit_root_elixir_item',
      name: 'Spirit Root Elixir',
      type: 'elixir',
      quantity: 1,
      effects: { permanent_stat_boost: { atk: 1 } } // Permanent +1 to attack
    },
    baseSuccessChance: 0.4,
    qualityTiers: ['Cloudy', 'Clear', 'Radiant'],
    expGain: 100,
  },

  {
    id: 'dragon_strength_elixir',
    name: 'Dragon Strength Elixir',
    description: 'An elixir imbued with a dragon\'s might, temporarily boosting attack power significantly.',
    skill: 'alchemy',
    requiredLevel: 20,
    ingredients: [
      { itemId: 'dragon_blood_herb', quantity: 1 }, // Assumes this is a rare drop
      { itemId: 'beast_core_fragment', quantity: 10 },
    ],
    output: {
      itemId: 'dragon_strength_elixir_item',
      name: 'Dragon Strength Elixir',
      type: 'elixir',
      quantity: 1,
      effects: { temporary_stat_boost: { atk: { percent: 0.15 } }, duration: 180 } // +15% ATK for 180 ticks
    },
    baseSuccessChance: 0.3,
    qualityTiers: ['Impure', 'Vibrant', 'Draconic'],
    expGain: 150,
  },

  {
    id: 'thornscale_elixir',
    name: 'Thornscale Elixir',
    description: 'An elixir that coats your spiritual presence in sharp, reflective barbs.',
    skill: 'alchemy',
    requiredLevel: 12,
    ingredients: [
      { itemId: 'ironbone_herb', quantity: 3 },
      { itemId: 'beast_core_fragment', quantity: 2 },
    ],
    output: {
      itemId: 'thornscale_elixir_item',
      name: 'Thornscale Elixir',
      type: 'elixir',
      quantity: 1,
      effects: { temporary_triggered_effect: { on_take_damage: { type: 'reflect_damage', percent: 0.10 } }, duration: 300 } // Reflects 10% of damage taken
    },
    baseSuccessChance: 0.5,
    qualityTiers: ['Jagged', 'Barbed', 'Impenetrable'],
    expGain: 60,
  },

  // --- FORGING RECIPES ---
  {
    id: 'spirit_steel_sword',
    name: 'Spirit-Steel Sword',
    description: 'A basic sword infused with a hint of spiritual energy.',
    skill: 'forging',
    requiredLevel: 1,
    ingredients: [
      { itemId: 'iron_ore', quantity: 5 },
      { itemId: 'low_grade_spirit_stone', quantity: 1 },
    ],
    output: {
      itemId: 'spirit_steel_sword_item',
      name: 'Spirit-Steel Sword',
      type: 'weapon',
      quantity: 1,
      effects: { atk_boost: 5 }
    },
    baseSuccessChance: 0.75,
    qualityTiers: ['Flawed', 'Standard', 'Masterwork'],
    expGain: 15,
  },
  {
    id: 'beast_core_talisman',
    name: 'Beast Core Talisman',
    description: 'A talisman that pulses with the faint energy of a spirit beast.',
    skill: 'forging',
    requiredLevel: 8,
    ingredients: [{ itemId: 'beast_core_fragment', quantity: 3 }],
    output: { itemId: 'beast_core_talisman_item', name: 'Beast Core Talisman', type: 'artifact', quantity: 1, effects: { qi_regen_boost: 1 } },
    baseSuccessChance: 0.5,
    qualityTiers: ['Dim', 'Glowing', 'Resonant'],
    expGain: 40,
  },
];