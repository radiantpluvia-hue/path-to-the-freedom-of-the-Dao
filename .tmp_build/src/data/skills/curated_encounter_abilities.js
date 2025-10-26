"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURATED_ENCOUNTER_ABILITIES = void 0;
// Curated techniques intended for encounter templates and small enemies
exports.CURATED_ENCOUNTER_ABILITIES = [
    {
        id: 'cur_stun_strike',
        name: 'Stunning Strike',
        description: 'A focused strike with a chance to stun the target for 1 turn.',
        type: 'attack',
        apCost: 2,
        qiCost: 0,
        cooldown: 2,
        effects: [{ type: 'damage', target: 'enemy', value: 10 }, { type: 'debuff', target: 'enemy', stat: 'speed', value: -2, duration: 1 }]
    },
    {
        id: 'cur_multi_slash',
        name: 'Multi Slash',
        description: 'Rapid slashes that hit multiple times for moderate damage.',
        type: 'attack',
        apCost: 3,
        qiCost: 0,
        cooldown: 3,
        effects: [{ type: 'damage', target: 'enemy', value: 6 }, { type: 'damage', target: 'enemy', value: 6 }]
    },
    {
        id: 'cur_howl_frenzy',
        name: 'Howl of Frenzy',
        description: 'A spirit howl that increases own attack for 2 turns and may demoralize foes.',
        type: 'support',
        apCost: 2,
        qiCost: 0,
        cooldown: 4,
        effects: [{ type: 'buff', target: 'self', stat: 'atk', value: 4, duration: 2 }, { type: 'debuff', target: 'enemy', stat: 'atk', value: -1, duration: 1 }]
    },
    {
        id: 'cur_quick_feint',
        name: 'Quick Feint',
        description: 'A quick feint that lowers enemy defense for 1 turn and opens for a follow-up.',
        type: 'attack',
        apCost: 1,
        qiCost: 0,
        cooldown: 2,
        effects: [{ type: 'debuff', target: 'enemy', stat: 'def', value: -3, duration: 1 }, { type: 'damage', target: 'enemy', value: 4 }]
    },
    {
        id: 'cur_lunge_pierce',
        name: 'Lunge Pierce',
        description: 'A piercing lunge with increased crit chance against lower-defense targets.',
        type: 'attack',
        apCost: 2,
        qiCost: 0,
        cooldown: 3,
        effects: [{ type: 'damage', target: 'enemy', value: 12 }],
        mechanics: [{ type: 'bonusCritIfTargetDefBelow', threshold: 6, critBonus: 0.2 }]
    },
    {
        id: 'cur_spirit_mend',
        name: 'Spirit Mend',
        description: 'Basic self-heal to recover some HP over short duration.',
        type: 'support',
        apCost: 2,
        qiCost: 0,
        cooldown: 4,
        effects: [{ type: 'heal', target: 'self', value: 10 }]
    },
    {
        id: 'cur_frenetic_bite',
        name: 'Frenetic Bite',
        description: 'A frenzied multi-hit bite that scales with missing HP.',
        type: 'attack',
        apCost: 3,
        qiCost: 0,
        cooldown: 4,
        effects: [{ type: 'damage', target: 'enemy', value: 5 }, { type: 'damage', target: 'enemy', value: 5 }, { type: 'damage', target: 'enemy', value: 5 }],
        mechanics: [{ type: 'scaleWithMissingHp', factor: 0.2 }]
    }
];
exports.default = exports.CURATED_ENCOUNTER_ABILITIES;
