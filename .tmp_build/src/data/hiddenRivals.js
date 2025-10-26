"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIDDEN_RIVALS = exports.KID_GOD_RIVAL = void 0;
// Full rival template for Kid God (Taek Jin). This is intentionally not added to RivalSystem
// default rivals — it will be injected at spawn time to keep him hidden until encountered.
exports.KID_GOD_RIVAL = {
    id: 'kid_god_taek_jin',
    name: 'Kid God (Taek Jin)',
    title: 'Heaven-born Prodigy',
    description: "A heaven-defying prodigy trained in Recoilless Taekwondo. Playful yet terrifyingly skilled, he fights with a polearm and devastating kicks.",
    faction: 'independent',
    sect: 'hidden_children_of_heaven',
    realm: 'mystic_divine_origin_3',
    level: 120,
    stats: { hp: 4000, qi: 3000, atk: 220, def: 160, speed: 160 },
    // Techniques are referenced by id; the RivalSystem will map them into CombatTechnique objects.
    techniques: [
        'recoilless_kick',
        'ruyi_jingu_strike',
        'dragon_catcher',
        'ground_draw',
        'baek_nok_strike',
        'blue_dragon_kick',
        'ice_kick',
        'recoilless_concept'
    ],
    personality: 'aggressive',
    relationship: 0,
    lastEncounter: 0,
    encounterCount: 0,
    defeated: false,
    // Special ability flag used by CombatSystem to enforce the "half-power until half HP" behavior
    specialAbilities: ['half_power_then_unleash', 'legendary_presence'],
    loot: [
        { name: "Ruyi Jingu Fragment", description: 'A broken fragment of an otherworldly staff', value: 2000 },
        { name: 'Heavenly Core Shard', description: 'Rare cultivation material', value: 1500 }
    ],
    archetype: 'legendary_hidden',
    growthStage: 1,
    lastGrowth: Date.now(),
    teachingAffinity: 5,
    storyProgression: {}
};
exports.HIDDEN_RIVALS = [exports.KID_GOD_RIVAL];
