"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleBloodlineStats = exports.getRealmMultiplier = exports.ALL_BLOODLINES = exports.GENERATED_BLOODLINES = void 0;
const scalingSystem_1 = require("./scalingSystem");
// Helper function to generate bloodline IDs from names
function generateBloodlineId(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '');
}
// Base stats for different rarity tiers
const BASE_STATS = {
    common: { qi: 50, atk: 10, def: 10 },
    uncommon: { qi: 75, atk: 15, def: 15 },
    rare: { qi: 100, atk: 20, def: 20 },
    epic: { qi: 150, atk: 30, def: 30 },
    legendary: { qi: 200, atk: 40, def: 40 },
    mythical: { qi: 300, atk: 60, def: 60 },
    transcendent: { qi: 500, atk: 100, def: 100 }
};
// Base skill bonuses for different rarity tiers (xianxia style)
const BASE_SKILLS = {
    common: { martialMastery: 1, qiControl: 1 },
    uncommon: { martialMastery: 2, qiControl: 2 },
    rare: { martialMastery: 3, qiControl: 3 },
    epic: { martialMastery: 4, qiControl: 4 },
    legendary: { martialMastery: 5, qiControl: 5 },
    mythical: { martialMastery: 7, qiControl: 7 },
    transcendent: { martialMastery: 10, qiControl: 10 }
};
// Bloodline themes and their associated special effects
const BLOODLINE_THEMES = {
    celestial: ['celestial_blessing', 'divine_protection', 'heavenly_aura'],
    dragon: ['draconic_power', 'dragon_breath', 'scale_armor'],
    phoenix: ['rebirth', 'fire_mastery', 'immortal_flame'],
    void: ['dimensional_travel', 'void_immunity', 'shadow_walk'],
    elemental: ['elemental_mastery', 'nature_communion', 'elemental_fusion'],
    thunder: ['lightning_mastery', 'thunder_strike', 'storm_call'],
    shadow: ['shadow_manipulation', 'stealth_enhancement', 'dark_energy'],
    light: ['light_mastery', 'purification', 'holy_aura'],
    beast: ['beast_transformation', 'animal_kinship', 'predator_instinct'],
    time: ['time_manipulation', 'precognition', 'temporal_shield'],
    space: ['spatial_manipulation', 'teleportation', 'dimensional_awareness'],
    reality: ['reality_manipulation', 'concept_mastery', 'law_comprehension'],
    star: ['stellar_energy', 'cosmic_awareness', 'night_cultivation'],
    moon: ['lunar_energy', 'dream_walking', 'moonlight_step'],
    sun: ['solar_energy', 'light_affinity', 'sun_empowerment'],
    earth: ['earth_mastery', 'stone_skin', 'tremor_sense'],
    water: ['water_mastery', 'aquatic_adaptation', 'tidal_control'],
    fire: ['fire_mastery', 'heat_resistance', 'flame_control'],
    wind: ['wind_mastery', 'aerial_agility', 'gale_step'],
    ice: ['ice_mastery', 'cold_immunity', 'frost_breath'],
    blood: ['blood_magic', 'life_drain', 'berserker_rage'],
    soul: ['soul_manipulation', 'spirit_sight', 'mental_defense'],
    dream: ['dream_manipulation', 'psychic_projection', 'subconscious_access']
};
// Function to get appropriate special effects based on bloodline name
function getSpecialEffects(name, rarity) {
    const nameLower = name.toLowerCase();
    const effects = [];
    // Determine theme based on name keywords
    if (nameLower.includes('celestial') || nameLower.includes('heaven')) {
        effects.push(...BLOODLINE_THEMES.celestial);
    }
    if (nameLower.includes('dragon')) {
        effects.push(...BLOODLINE_THEMES.dragon);
    }
    if (nameLower.includes('phoenix')) {
        effects.push(...BLOODLINE_THEMES.phoenix);
    }
    if (nameLower.includes('void') || nameLower.includes('shadow')) {
        effects.push(...BLOODLINE_THEMES.void);
    }
    if (nameLower.includes('elemental') || nameLower.includes('nature')) {
        effects.push(...BLOODLINE_THEMES.elemental);
    }
    if (nameLower.includes('thunder') || nameLower.includes('lightning')) {
        effects.push(...BLOODLINE_THEMES.thunder);
    }
    if (nameLower.includes('shadow') || nameLower.includes('dark')) {
        effects.push(...BLOODLINE_THEMES.shadow);
    }
    if (nameLower.includes('light') || nameLower.includes('holy')) {
        effects.push(...BLOODLINE_THEMES.light);
    }
    if (nameLower.includes('beast') || nameLower.includes('animal')) {
        effects.push(...BLOODLINE_THEMES.beast);
    }
    if (nameLower.includes('time') || nameLower.includes('temporal')) {
        effects.push(...BLOODLINE_THEMES.time);
    }
    if (nameLower.includes('space') || nameLower.includes('dimensional')) {
        effects.push(...BLOODLINE_THEMES.space);
    }
    if (nameLower.includes('reality') || nameLower.includes('concept')) {
        effects.push(...BLOODLINE_THEMES.reality);
    }
    if (nameLower.includes('star') || nameLower.includes('stellar')) {
        effects.push(...BLOODLINE_THEMES.star);
    }
    if (nameLower.includes('moon') || nameLower.includes('lunar')) {
        effects.push(...BLOODLINE_THEMES.moon);
    }
    if (nameLower.includes('sun') || nameLower.includes('solar')) {
        effects.push(...BLOODLINE_THEMES.sun);
    }
    if (nameLower.includes('earth') || nameLower.includes('stone')) {
        effects.push(...BLOODLINE_THEMES.earth);
    }
    if (nameLower.includes('water') || nameLower.includes('ocean')) {
        effects.push(...BLOODLINE_THEMES.water);
    }
    if (nameLower.includes('fire') || nameLower.includes('flame')) {
        effects.push(...BLOODLINE_THEMES.fire);
    }
    if (nameLower.includes('wind') || nameLower.includes('gale')) {
        effects.push(...BLOODLINE_THEMES.wind);
    }
    if (nameLower.includes('ice') || nameLower.includes('frost')) {
        effects.push(...BLOODLINE_THEMES.ice);
    }
    if (nameLower.includes('blood')) {
        effects.push(...BLOODLINE_THEMES.blood);
    }
    if (nameLower.includes('soul') || nameLower.includes('spirit')) {
        effects.push(...BLOODLINE_THEMES.soul);
    }
    if (nameLower.includes('dream')) {
        effects.push(...BLOODLINE_THEMES.dream);
    }
    // Limit effects based on rarity
    const maxEffects = {
        common: 1,
        uncommon: 1,
        rare: 2,
        epic: 2,
        legendary: 3,
        mythical: 4,
        transcendent: 5
    };
    return effects.slice(0, maxEffects[rarity] || 1);
}
// Function to determine rarity based on name and index
function determineRarity(index, total) {
    const percent = (index / total) * 100;
    if (percent < 40)
        return 'common';
    if (percent < 60)
        return 'uncommon';
    if (percent < 75)
        return 'rare';
    if (percent < 85)
        return 'epic';
    if (percent < 92)
        return 'legendary';
    if (percent < 97)
        return 'mythical';
    return 'transcendent';
}
// Function to create bloodline from name
function createBloodline(name, index, total) {
    const rarity = determineRarity(index, total);
    const rarityMultiplier = (0, scalingSystem_1.getRarityMultiplier)(rarity);
    const baseStats = BASE_STATS[rarity];
    const baseSkills = BASE_SKILLS[rarity];
    // Apply rarity multiplier to stats
    const stats = Object.fromEntries(Object.entries(baseStats).map(([key, value]) => [key, Math.round(value * rarityMultiplier)]));
    // Apply rarity multiplier to skills
    const skills = Object.fromEntries(Object.entries(baseSkills).map(([key, value]) => [key, Math.round(value * rarityMultiplier)]));
    const specialEffects = getSpecialEffects(name, rarity);
    return {
        id: generateBloodlineId(name),
        name: name,
        description: `The ancient ${name} bloodline, a xianxia lineage carrying profound ancestral powers and forbidden arts.`,
        rarity: rarity,
        effects: {
            stats,
            skills,
            special: specialEffects
        },
        awakening_requirements: {
            realm: rarity === 'transcendent' ? 'chaos_saint' :
                rarity === 'mythical' ? 'core_formation' :
                    rarity === 'legendary' ? 'soul_transformation' :
                        rarity === 'epic' ? 'golden_immortal' : 'foundation_establishment',
            qi: 1000 * (rarity === 'transcendent' ? 100 :
                rarity === 'mythical' ? 50 :
                    rarity === 'legendary' ? 25 :
                        rarity === 'epic' ? 10 :
                            rarity === 'rare' ? 5 : 1)
        }
    };
}
// Bloodline names from TODO_XIANXIA_NAMING.md (removed duplicates)
const BLOODLINE_NAMES = [
    "Celestial Dragon Marrow",
    "Void-Treading Shadow Vein",
    "Ninefold Thunderheart",
    "Starlight Monarch Lineage",
    "Primordial Phoenix Vein",
    "Abyssal Nightflame",
    "Heaven-Destiny Severer",
    "Crimson Lotus Emperor",
    "Frostjade Serpent Lineage",
    "Mountain-Sunder Titan",
    "Sun-Devourer Lineage",
    "Moonlit Mirage Vein",
    "River of Samsara Lineage",
    "Verdant Wood Sovereign",
    "Sky-Forger Colossus",
    "Iron-Will Tyrant",
    "Spirit-Sealing Warden",
    "Whispering Windstep",
    "Oceanheart Leviathan",
    "Ashen Bone Revenant",
    "Golden Crow Ember Lineage",
    "Immortal Crane Plume",
    "Azure Tempest King",
    "Stoneheart Sentinel",
    "Starforged Astral Vein",
    "Eclipse Wolf Blood",
    "Scarlet Thorn Empress",
    "Heavenly Lightning Tyrant",
    "Void Lantern Lineage",
    "Wintergrave Monarch",
    "Duskblade Wyrm",
    "Spring Dew Saint Lineage",
    "Autumn Gale Regent",
    "Summer Blaze Lord",
    "Dawnstar Oracle",
    "Nether River Ferryman",
    "Mirage Glass Unicorn",
    "Earthshaker Giant Vein",
    "Skywhale Navigator",
    "Spiritvine Keeper",
    "Celestial Tortoise Shell",
    "Bloodmoon Predator",
    "Luminous Jade Sage",
    "Shadowleaf Stalker",
    "Thunderstep Roc",
    "Frost-Iron Rhino",
    "Lotus of Rebirth Vein",
    "Tempest Whale Lineage",
    "Star-Eater Mantis",
    "Heaven-Warding Bastion",
    "Ethereal Flame Bloodline",
    "Shadowed Moon Vein",
    "Celestial Serpent Lineage",
    "Abyssal Gale Monarch",
    "Radiant Sunfire Lineage",
    "Mystic Frost Vein",
    "Thunderous Roar Bloodline",
    "Eternal Nightshade Lineage",
    "Celestial Phoenix Vein",
    "Divine Dragon Marrow",
    "Spirit-Wind Sovereign",
    "Celestial Starfire Lineage",
    "Voidwalker Bloodline",
    "Celestial Beast Vein",
    "Ethereal Shadow Monarch",
    "Bloodline of the Titans",
    "Celestial Gale Vein",
    "Abyssal Serpent Lineage",
    "Celestial Thunder Vein",
    "Bloodline of the Phoenix",
    "Celestial Frost Vein",
    "Ethereal Flame Monarch",
    "Celestial Nightshade Lineage",
    "Bloodline of the Stars",
    "Celestial Earth Vein",
    "Ethereal Spirit Vein",
    "Celestial Water Vein",
    "Celestial Fire Vein",
    "Ethereal Wind Vein",
    "Celestial Light Vein",
    "Bloodline of the Shadows",
    "Celestial Darkness Vein",
    "Ethereal Ice Vein",
    "Celestial Storm Vein",
    "Bloodline of the Elements",
    "Celestial Void Vein",
    "Ethereal Thunder Vein",
    "Celestial Lightning Vein",
    "Bloodline of the Cosmos",
    "Celestial Time Vein",
    "Ethereal Space Vein",
    "Celestial Reality Vein",
    "Bloodline of the Universe",
    "Celestial Dream Vein",
    "Ethereal Illusion Vein",
    "Celestial Memory Vein",
    "Celestial Fate Vein"
];
// Create all bloodlines
exports.GENERATED_BLOODLINES = BLOODLINE_NAMES.map((name, index) => createBloodline(name, index, BLOODLINE_NAMES.length));
// Keep original main character bloodlines and add them to the beginning
const ORIGINAL_MAIN_CHARACTER_BLOODLINES = [
    {
        id: 'fate_destroyer',
        name: 'Fate Destroyer Bloodline',
        description: 'Bloodline blessed by the Fate Destroying Emperor, capable of severing destiny itself.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 200, atk: 50, def: 50 },
            skills: { combatSkills: 5, qiControl: 5 },
            special: ['fate_manipulation', 'destiny_severing']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'heaven_sealer',
        name: 'Heaven Sealer Bloodline',
        description: 'Bloodline of Meng Hao, master of sealing arts and heavenly defiance.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 180, atk: 45, def: 45 },
            skills: { daoInsight: 5, mentalFortitude: 5 },
            special: ['sealing_arts', 'heavenly_defiance']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'eternal_alchemist',
        name: 'Eternal Alchemist Bloodline',
        description: 'Bloodline of Bai Xiaochun, master of immortality and pill refinement.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 190, atk: 40, def: 40 },
            skills: { alchemy: 5, combatSkills: 4 },
            special: ['immortality_arts', 'pill_mastery']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'dao_comprehender',
        name: 'Dao Comprehender Bloodline',
        description: 'Bloodline of Han Jue, with unparalleled understanding of the Dao and fate.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 210, atk: 55, def: 55 },
            skills: { daoInsight: 6, qiControl: 6 },
            special: ['dao_mastery', 'fate_comprehension']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'sword_sovereign',
        name: 'Sword Sovereign Bloodline',
        description: 'Bloodline of Ji Ning, ultimate master of the sword and spatial techniques.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 220, atk: 60, def: 60 },
            skills: { combatSkills: 6, daoInsight: 5 },
            special: ['sword_domain', 'spatial_mastery']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'dragon_emperor',
        name: 'Dragon Emperor Bloodline',
        description: 'Bloodline of Linley, with draconic heritage and noble warrior spirit.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 200, atk: 50, def: 50 },
            skills: { combatSkills: 5, mentalFortitude: 4 },
            special: ['draconic_power', 'noble_heritage']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'renegade_immortal',
        name: 'Renegade Immortal Bloodline',
        description: 'Bloodline of Wang Lin, known for incredible resilience and killing intent.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 210, atk: 55, def: 55 },
            skills: { combatSkills: 6, mentalFortitude: 5 },
            special: ['killing_intent', 'immortal_resilience']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'frost_monarch',
        name: 'Frost Monarch Bloodline',
        description: 'Bloodline of Xue Ying, absolute master of ice and frost elements.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 200, atk: 50, def: 50 },
            skills: { elementalMastery: 5, combatSkills: 4 },
            special: ['absolute_zero', 'frost_domain']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    },
    {
        id: 'chaos_origin',
        name: 'Chaos Origin Bloodline',
        description: 'Bloodline originating from primordial chaos, with reality-bending powers.',
        rarity: 'legendary',
        effects: {
            stats: { qi: 230, atk: 60, def: 60 },
            skills: { daoInsight: 7, qiControl: 6 },
            special: ['chaos_energy', 'reality_manipulation']
        },
        awakening_requirements: {
            realm: 'soul_transformation',
            qi: 25000
        }
    }
];
// Combine original main characters with new bloodlines
exports.ALL_BLOODLINES = [
    ...ORIGINAL_MAIN_CHARACTER_BLOODLINES,
    ...exports.GENERATED_BLOODLINES
];
// Export for use in character creation and other systems
var scalingSystem_2 = require("./scalingSystem");
Object.defineProperty(exports, "getRealmMultiplier", { enumerable: true, get: function () { return scalingSystem_2.getRealmMultiplier; } });
Object.defineProperty(exports, "scaleBloodlineStats", { enumerable: true, get: function () { return scalingSystem_2.scaleBloodlineStats; } });
