"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_ABILITIES = void 0;
exports.ACTIVE_ABILITIES = [
    // Mortal-world leader inspired active abilities
    { id: 'ability_battle_cry', name: 'Battle Cry', tier: 'mortal', power: 0, cost: { ap: 5 }, description: 'Boosts allies attack for several turns.', effects: [{ type: 'buff', stat: 'atkPct', value: 10, duration: 3 }] },
    { id: 'ability_form_rally', name: 'Form Rally', tier: 'mortal', power: 0, cost: { ap: 6 }, description: 'Reorganize formation to grant defense to frontliners.', effects: [{ type: 'buff', stat: 'def', value: 4, duration: 4 }] },
    { id: 'ability_precise_shot', name: 'Precise Shot', tier: 'mortal', power: 12, cost: { ap: 8 }, description: 'A focused ranged attack with increased crit chance.', effects: [{ type: 'damage', amount: 12, critChance: 15 }] },
    { id: 'ability_shield_wall', name: 'Shield Wall', tier: 'mortal', power: 0, cost: { ap: 7 }, description: 'Create a protective stance that reduces incoming damage.', effects: [{ type: 'buff', stat: 'defPct', value: 12, duration: 3 }] },
    { id: 'ability_flanking_maneuver', name: 'Flanking Maneuver', tier: 'mortal', power: 10, cost: { ap: 9 }, description: 'Strike the enemy flank for bonus damage.', effects: [{ type: 'damage', amount: 10, bonusAgainstFlank: true }] },
    { id: 'ability_disruptive_whip', name: 'Disruptive Whip', tier: 'mortal', power: 8, cost: { ap: 6 }, description: 'Disrupt enemy formations and reduce their initiative.', effects: [{ type: 'debuff', stat: 'speedPct', value: -10, duration: 2 }] },
    { id: 'ability_hammer_strike', name: 'Hammer Strike', tier: 'mortal', power: 14, cost: { ap: 10 }, description: 'A heavy strike that can stun on critical hit.', effects: [{ type: 'damage', amount: 14, stunChance: 12 }] },
    { id: 'ability_trap_set', name: 'Trap Set', tier: 'mortal', power: 0, cost: { ap: 4 }, description: 'Place a trap that triggers when enemies move.', effects: [{ type: 'trap', damage: 8, trigger: 'onMove' }] },
    { id: 'ability_rallying_shout', name: 'Rallying Shout', tier: 'mortal', power: 0, cost: { ap: 5 }, description: 'Remove a single negative effect from allies and heals small qi.', effects: [{ type: 'cleanse', target: 'ally' }, { type: 'healQi', amount: 6 }] },
    { id: 'ability_night_stalker', name: 'Night Stalker', tier: 'mortal', power: 11, cost: { ap: 8 }, description: 'A stealth approach attack dealing increased damage from behind.', effects: [{ type: 'damage', amount: 11, backstabBonus: 10 }] },
    { id: 'ability_quick_slash', name: 'Quick Slash', type: 'melee', power: 8, cost: { qi: 5 }, cooldown: 1, tags: ['opener', 'combo'] },
    { id: 'ability_spirit_burst', name: 'Spirit Burst', type: 'spirit', power: 14, cost: { qi: 20 }, cooldown: 3, tags: ['spirit', 'aoe'] },
    { id: 'ability_wave_pierce', name: 'Wave Pierce', type: 'spear', power: 12, cost: { qi: 8 }, cooldown: 2, tags: ['reach', 'formation'] },
    { id: 'ability_moonlit_step', name: 'Moonlit Step', type: 'mobility', power: 0, cost: { qi: 6 }, cooldown: 2, tags: ['movement', 'defense'], effect: { dodgeBonus: 0.25 } },
    { id: 'ability_rain_of_blades', name: 'Rain of Blades', type: 'aoe', power: 20, cost: { qi: 30 }, cooldown: 5, tags: ['aoe', 'finisher'] },
    { id: 'ability_shadow_piercer', name: 'Shadow Piercer', type: 'stealth', power: 18, cost: { qi: 12 }, cooldown: 4, tags: ['crit', 'stealth'] },
    { id: 'ability_tidal_grasp', name: 'Tidal Grasp', type: 'control', power: 0, cost: { qi: 15 }, cooldown: 4, tags: ['control', 'crowd'], effect: { pull: 1 } },
    { id: 'ability_furnace_bellow', name: 'Furnace Bellow', type: 'buff', power: 0, cost: { qi: 10 }, cooldown: 6, tags: ['buff'], effect: { atkMultiplier: 1.15, duration: 6 } },
    { id: 'ability_thorn_trap', name: 'Thorn Trap', type: 'trap', power: 6, cost: { qi: 8 }, cooldown: 8, tags: ['trap', 'control'], effect: { dot: 4, duration: 4 } },
    { id: 'ability_worldflow_strike', name: 'Worldflow Strike', type: 'ultimate', power: 40, cost: { qi: 80 }, cooldown: 20, tags: ['ultimate', 'spirit'] },
    { id: 'ability_whirling_crescent', name: 'Whirling Crescent', type: 'aoe', power: 16, cost: { qi: 18 }, cooldown: 4, tags: ['aoe', 'sweep'] },
    { id: 'ability_gale_dash', name: 'Gale Dash', type: 'mobility', power: 0, cost: { qi: 6 }, cooldown: 3, tags: ['movement', 'engage'], effect: { reposition: true } },
    { id: 'ability_stone_wall', name: 'Stone Wall', type: 'defense', power: 0, cost: { qi: 12 }, cooldown: 10, tags: ['defense', 'guard'], effect: { damageReduction: 0.3, duration: 4 } },
    { id: 'ability_bloodletting_strike', name: 'Bloodletting Strike', type: 'finisher', power: 22, cost: { qi: 25 }, cooldown: 6, tags: ['finisher', 'bleed'], effect: { applyDot: 'passive_bleed_on_hit' } },
    { id: 'ability_luminous_shield', name: 'Luminous Shield', type: 'spirit', power: 0, cost: { qi: 14 }, cooldown: 8, tags: ['spirit', 'shield'], effect: { absorb: 30, duration: 5 } },
    { id: 'ability_infernal_sunder', name: 'Infernal Sunder', type: 'heavy', power: 30, cost: { qi: 35 }, cooldown: 8, tags: ['heavy', 'stagger'] },
    { id: 'ability_mistcloak', name: 'Mistcloak', type: 'utility', power: 0, cost: { qi: 5 }, cooldown: 12, tags: ['stealth', 'utility'], effect: { invisibility: 3 } },
    { id: 'ability_zen_pulse', name: 'Zen Pulse', type: 'spirit', power: 10, cost: { qi: 10 }, cooldown: 2, tags: ['spirit', 'heal'], effect: { heal: 12 } },
    { id: 'ability_iron_barrage', name: 'Iron Barrage', type: 'ranged', power: 14, cost: { qi: 16 }, cooldown: 3, tags: ['ranged', 'multi'], effect: { hits: 3 } },
    { id: 'ability_hawk_eye', name: 'Hawk Eye', type: 'buff', power: 0, cost: { qi: 6 }, cooldown: 6, tags: ['support', 'precision'], effect: { accuracy: 15, duration: 6 } }
];
