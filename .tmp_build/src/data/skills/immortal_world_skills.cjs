"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMMORTAL_WORLD_SKILLS = void 0;
// A collection of high-tier, legendary Immortal World skills
exports.IMMORTAL_WORLD_SKILLS = [
    {
        id: 'heavenly_fist_of_millennia',
        name: 'Heavenly Fist of Millennia',
        tier: 7,
        power: 95,
        cooldown: 3,
        cost: { ap: 1, qi: 40 },
        apCost: 1,
        qiCost: 40,
        effects: [{ type: 'damage', target: 'enemy', value: 95 }, { type: 'debuff', target: 'enemy', stat: 'stun_chance', value: 1, duration: 1 }],
        description: 'A crushing fist technique channeling celestial force; may stun nearby foes.',
        passives: ['stun_chance']
    },
    {
        id: 'celestial_tiger_claw',
        name: 'Celestial Tiger Claw',
        tier: 6,
        power: 88,
        cooldown: 2,
        cost: { ap: 1, qi: 35 },
        description: 'Rips through defenses with claw-like fist extensions; causes bleeding over time.',
        passives: ['bleed_on_hit']
    },
    {
        id: 'void_dragon_saber',
        name: 'Void Dragon Saber',
        tier: 8,
        power: 120,
        cooldown: 5,
        cost: { ap: 2, qi: 60 },
        description: 'Swing that opens a momentary void to slice reality; high damage, pierce armor.',
        passives: ['armor_pierce']
    },
    {
        id: 'starfall_sword_dance',
        name: 'Starfall Sword Dance',
        tier: 7,
        power: 100,
        cooldown: 4,
        cost: { ap: 2, qi: 50 },
        description: 'A rapid dance of blades like falling stars; strikes multiple times.',
        mechanics: [{ type: 'multiHit', hits: 3 }]
    },
    {
        id: 'immortal_necrosis_poison',
        name: 'Immortal Necrosis Poison',
        tier: 7,
        power: 80,
        cooldown: 6,
        cost: { ap: 1, qi: 30 },
        description: 'A legendary toxin that corrodes both body and spirit; deals damage over time.',
        passives: ['dot_poison']
    },
    {
        id: 'heavenly_dagger_voidstep',
        name: 'Heavenly Dagger Voidstep',
        tier: 8,
        power: 110,
        cooldown: 4,
        cost: { ap: 1, qi: 45 },
        description: 'An assassin technique that teleports behind the foe for a fatal cut.',
        mechanics: [{ type: 'conditional', condition: 'after_dash' }]
    }
];
// Auto-generate additional skills to reach ~55 entries
const extra = [];
const tiers = [5, 5, 6, 6, 7, 7, 8, 4, 3, 2];
const forms = ['Fist', 'Sword', 'Saber', 'Dagger', 'Poison', 'Staff', 'Archery', 'Unarmed', 'Spirit', 'Alchemy'];
for (let i = 0; i < 74; i++) { // generate more to push total toward 80+
    const tier = tiers[i % tiers.length];
    const form = forms[i % forms.length];
    extra.push({
        id: `eternal_${form.toLowerCase()}_${i}`,
        name: `${form} Art of the Eternal ${i}`,
        tier,
        power: 55 + (i % 35),
        cooldown: 1 + (i % 4),
        cost: { ap: Math.max(0, Math.floor(tier / 2)), qi: 10 + (i % 30) },
        apCost: Math.max(0, Math.floor(tier / 2)),
        qiCost: 10 + (i % 30),
        effects: [{ type: 'damage', target: 'enemy', value: 55 + (i % 35) }],
        description: `A powerful Immortal World ${form.toLowerCase()} skill variant #${i}.`,
    });
}
exports.IMMORTAL_WORLD_SKILLS.push(...extra);
exports.default = exports.IMMORTAL_WORLD_SKILLS;
