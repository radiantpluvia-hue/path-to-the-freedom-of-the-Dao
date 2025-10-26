"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RACE_BACKGROUNDS_WITH_LUCK = exports.RACE_BACKGROUNDS = void 0;
const rarity_1 = require("../config/rarity");
const tierMigration_1 = require("../migrations/tierMigration");
// Rarity weights used to normalize startChance per race
// common: 60, uncommon: 25, rare: 10, legendary: 5
// startChance is computed per race as weight / sum(weights)
// Define raw data first; startChance may be absent and will be computed per-race below
const RACE_BACKGROUNDS_RAW = {
    Human: [
        {
            id: 'human_noble',
            name: 'Noble Lineage',
            description: 'Raised in a family of cultivators with access to manuals and connections.',
            rarity: "D",
            previewIcon: 'icon-noble',
            effects: { yuan: 2000, spiritStones: { low: 100, mid: 10, high: 0 }, socialSkills: { level: 3 }, reputation: { world: 50 }, passives: { noble_upbringing: { level: 1 }, noble_patronage: { level: 1 } } },
            abilities: { diplomacy: { tier: 'B' } },
            tags: ['social', 'wealth'],
            previewEffects: ['+2000 yuan', '+3 Social Skills']
        },
        {
            id: 'human_scholar',
            name: 'Scholar Household',
            description: 'Grew among archives and sutras, gifted in comprehension and dao study.',
            rarity: "G",
            previewIcon: 'icon-scholar',
            effects: { insight: 20, daoInsight: { level: 2 }, qiControl: { level: 1 } },
            tags: ['dao', 'study'],
            previewEffects: ['+20 Insight', 'Dao Insight II']
        },
        {
            id: 'human_commoner',
            name: 'Common Roots',
            description: 'Humble upbringing; resilient and pragmatic.',
            rarity: "H",
            previewIcon: 'icon-commoner',
            effects: { discipline: 15, patience: 15 },
            tags: ['grounded', 'survival'],
            previewEffects: ['+15 Discipline', '+15 Patience']
        },
        {
            id: 'human_sectborn',
            name: 'Born in Sect',
            description: 'Raised within a sect from childhood; trained in basic sect techniques and etiquette.',
            rarity: "G",
            previewIcon: 'icon-sect',
            effects: { daoInsight: { level: 1 }, socialSkills: { level: 1 }, sectAffinity: 1 },
            tags: ['sect', 'training'],
            previewEffects: ['Dao Insight I', '+1 Sect Affinity']
        },
        {
            id: 'human_rogue_roaming',
            name: 'Rogue Cultivator',
            description: 'A wanderer who refuses formal sect ties and survives by cunning and grit.',
            rarity: "F",
            startChance: 0,
            effects: { cunning: 25, resilience: 20, resourcefulness: 15 },
            tags: ['hidden', 'rogue', 'roaming'],
            previewEffects: ['+25 Cunning', '+20 Resilience']
        },
        {
            id: 'human_antihero',
            name: 'Antihero',
            description: 'Marked by moral ambiguity; pursues power by unconventional means.',
            rarity: "F",
            startChance: 0,
            effects: { cunning: 15, karma: -20, combatPower: 40 },
            tags: ['hidden', 'antihero', 'pathway'],
            previewEffects: ['+40 Combat Power', '-20 Karma']
        }
    ],
    Demon: [
        {
            id: 'demon_noble',
            name: 'Infernal Scion',
            description: 'Bloodline with inherent destructive qi and resistance to spiritual pain.',
            rarity: "D",
            previewIcon: 'icon-infernal',
            effects: { combatPower: 150, karma: -40, combatSkills: { level: 3 }, passives: { infernal_scion_wrath: { level: 1 } } },
            abilities: { terrifyingPresence: { tier: 'A' } },
            tags: ['combat', 'bloodline'],
            previewEffects: ['+150 Combat Power', 'Terrifying Presence A']
        },
        {
            id: 'demon_outcast',
            name: 'Outcast',
            description: 'Raised on the fringes of demon society; cunning and adaptive.',
            rarity: "G",
            previewIcon: 'icon-outcast',
            effects: { cunning: 30, mentalFortitude: { level: 2 }, karma: -10 },
            tags: ['cunning', 'survivor'],
            previewEffects: ['+30 Cunning', '+2 Mental Fortitude']
        },
        {
            id: 'demon_demonic_cultivator',
            name: 'Demonic Cultivator',
            description: 'A cultivator who has accepted demonic qi and walks a darker path.',
            rarity: "F",
            startChance: 0,
            effects: { combatPower: 80, karma: -60, qi: 80, passives: { demonic_resolve: { level: 1 } } },
            tags: ['hidden', 'pathway', 'demonic'],
            previewEffects: ['+80 Combat Power', '+80 Qi']
        }
    ],
    Spirit: [
        {
            id: 'spirit_woodland',
            name: 'Woodland Warden',
            description: 'Symbiotic with nature; calmer dao and natural affinities.',
            rarity: "F",
            previewIcon: 'icon-woodland',
            effects: { daoHeart: 25, patience: 20, special: ['nature_communion'] },
            tags: ['nature', 'calm'],
            previewEffects: ['+25 Dao Heart', 'Nature Communion']
        },
        {
            id: 'spirit_wandering',
            name: 'Wandering Spirit',
            description: 'Drifts between places and eras; adaptable and perceptive.',
            rarity: "G",
            previewIcon: 'icon-wandering',
            effects: { insight: 18, socialSkills: { level: 1 } },
            tags: ['adaptable', 'insight'],
            previewEffects: ['+18 Insight']
        }
    ],
    Dragon: [
        {
            id: 'dragon_blood',
            name: 'Dragonblood',
            description: 'Marked by draconic qi; strong affinity for qi amplification and longevity.',
            rarity: "D",
            previewIcon: 'icon-dragonblood',
            effects: { combatPower: 300, qi: 120, lifespan: 500, passives: { draconic_resilience: { level: 2 }, draconic_vigor: { level: 1 }, dragon_ancestral_endurance: { level: 1 } } },
            abilities: { dragonRoar: { tier: 'S' } },
            tags: ['power', 'longevity'],
            previewEffects: ['+300 Combat Power', '+120 Qi']
        },
        {
            id: 'dragon_scholarly',
            name: 'Dragon Scholar',
            description: 'Ancient dragon line known for profound dao insight and technique retention.',
            rarity: "F",
            previewIcon: 'icon-dragon-scholar',
            effects: { daoInsight: { level: 4 }, qiControl: { level: 3 } },
            abilities: { artifact_forging: { tier: 'B' } },
            tags: ['dao', 'crafting'],
            previewEffects: ['Dao Insight IV', 'Qi Control III']
        }
    ],
    Phoenix: [
        {
            id: 'phoenix_reborn',
            name: 'Reborn Phoenix',
            description: 'A lineage with regenerative qi and purification affinity.',
            rarity: "D",
            // Make Reborn Phoenix explicitly rarer in start selection (20%)
            startChance: 0.2,
            previewIcon: 'icon-phoenix-reborn',
            effects: {
                daoHeart: 30,
                mentalFortitude: { level: 4 },
                karma: 30,
                // Rarer backgrounds grant more/better passives
                passives: { phoenix_regen: { level: 2 }, phoenix_flame_affinity: { level: 1 }, phoenix_rebirth_aura: { level: 1 } }
            },
            abilities: { rebirthMemory: { tier: 'A' } },
            tags: ['healing', 'purification'],
            previewEffects: ['+30 Dao Heart', '+4 Mental Fortitude']
        },
        {
            id: 'phoenix_flame',
            name: 'Flame Kin',
            description: 'Attuned to fire dao; excels at cleansing and transformative arts.',
            rarity: "F",
            // Commoner Phoenix branch is more frequent (80%)
            startChance: 0.8,
            previewIcon: 'icon-phoenix-flame',
            effects: { qi: 100, qiControl: { level: 3 } },
            tags: ['fire', 'transformation'],
            previewEffects: ['+100 Qi', 'Qi Control III']
        }
    ],
    Celestial: [
        {
            id: 'celestial_bureau',
            name: 'Heavenly Bureau',
            description: 'Connected to the bureaucracy of heaven; social authority and fate-swaying presence.',
            rarity: "D",
            previewIcon: 'icon-celestial-bureau',
            effects: { karma: 80, socialSkills: { level: 4 }, reputation: { heavenly_court: 60 }, passives: { heavenly_benefaction: { level: 2 }, celestial_judgement_shield: { level: 1 } } },
            tags: ['social', 'fate'],
            previewEffects: ['+80 Karma', '+4 Social Skills']
        },
        {
            id: 'celestial_fallen',
            name: 'Fallen Celestial',
            description: 'Cast down nobles with strong dao insight but tarnished reputation.',
            rarity: "G",
            previewIcon: 'icon-celestial-fallen',
            effects: { daoInsight: { level: 3 }, karma: -30 },
            tags: ['dao', 'fallen'],
            previewEffects: ['Dao Insight III', '-30 Karma']
        }
    ],
    Asura: [
        {
            id: 'asura_warborn',
            name: 'Warborn Asura',
            description: 'Martial lineage obsessed with might; high combat aptitude.',
            rarity: "F",
            previewIcon: 'icon-asura-warborn',
            effects: { combatPower: 220, atk: 25, bodyTempering: { level: 4 } },
            tags: ['combat', 'body'],
            previewEffects: ['+220 Combat Power', '+25 Atk']
        },
        {
            id: 'asura_rage',
            name: 'Rage-Blooded',
            description: 'Bloodline prone to battle fury; excels in short bursts of overwhelming power.',
            rarity: "G",
            previewIcon: 'icon-asura-rage',
            effects: { atk: 20, combatPower: 120, special: ['berserk_burst'] },
            tags: ['burst', 'offense'],
            previewEffects: ['+20 Atk', 'Berserk Burst']
        },
        {
            id: 'asura_tactician',
            name: 'Asura Tactician',
            description: 'Combines ferocity with cunning strategy; favored by warlords.',
            rarity: "F",
            previewIcon: 'icon-asura-tactician',
            effects: { cunning: 25, combatSkills: { level: 3 }, socialSkills: { level: 2 } },
            abilities: { soul_bind_passive: { tier: 'C' } },
            tags: ['tactic', 'combat'],
            previewEffects: ['+25 Cunning', 'Combat Skills III']
        }
    ],
    Monkey: [
        {
            id: 'monkey_kingline',
            name: 'Monkey Kingline',
            description: 'Legendary simian heritage; nimble, mischievous, and talented in trickery.',
            rarity: "D",
            previewIcon: 'icon-monkey-king',
            effects: { speed: 30, cunning: 35, agility: 20, passives: { monkey_kingline_agility: { level: 2 }, monkey_kingline_trickery: { level: 1 } } },
            tags: ['trickster', 'agile'],
            previewEffects: ['+30 Speed', '+35 Cunning']
        },
        {
            id: 'monkey_mountain',
            name: 'Mountain Monkey',
            description: 'Agile climbers and fighters from sacred mountains.',
            rarity: "H",
            previewIcon: 'icon-monkey-mountain',
            effects: { speed: 15, combatSkills: { level: 2 } },
            tags: ['agile', 'fighter'],
            previewEffects: ['+15 Speed', 'Combat Skills II']
        },
        {
            id: 'monkey_trickster',
            name: 'Trickster Simian',
            description: 'Streetwise pranksters and illusionists; excel at deception and quick escapes.',
            rarity: "G",
            previewIcon: 'icon-monkey-trickster',
            effects: { cunning: 25, socialSkills: { level: 1 }, speed: 10 },
            abilities: { mislead: { tier: 'B' } },
            tags: ['deception', 'speed'],
            previewEffects: ['+25 Cunning', 'Mislead B']
        },
        {
            id: 'monkey_mystic',
            name: 'Mountain Mystic',
            description: 'A contemplative branch that blends agility with surprising dao sensitivity.',
            rarity: "F",
            previewIcon: 'icon-monkey-mystic',
            effects: { daoInsight: { level: 2 }, agility: 18, qiControl: { level: 1 } },
            tags: ['dao', 'agile'],
            previewEffects: ['Dao Insight II', '+18 Agility']
        },
        {
            id: 'monkey_artisan',
            name: 'Artisan Clans',
            description: 'Skilled tinkerers and tool-users; their clever gadgets and improvised weapons aid them in conflict.',
            rarity: "H",
            previewIcon: 'icon-monkey-artisan',
            effects: { cunning: 12, special: ['gadgeteer'], dexterity: 10 },
            tags: ['crafting', 'gadgeteer'],
            previewEffects: ['+12 Cunning', 'Gadgeteer']
        }
    ],
    Fox: [
        {
            id: 'fox_nine_tailed',
            name: 'Nine-Tailed',
            description: 'Charismatic trickster lineage with long-lived cunning.',
            rarity: "D",
            previewIcon: 'icon-fox-nine',
            effects: { cunning: 40, socialSkills: { level: 3 }, passives: { fox_nine_charm: { level: 2 } } },
            tags: ['charisma', 'trickster'],
            previewEffects: ['+40 Cunning', '+3 Social Skills']
        },
        {
            id: 'fox_city',
            name: 'Urban Fox',
            description: 'Adapts to human cities; skilled at infiltration and charms.',
            rarity: "H",
            previewIcon: 'icon-fox-city',
            effects: { socialSkills: { level: 1 }, cunning: 15 },
            tags: ['urban', 'infiltration'],
            previewEffects: ['+15 Cunning', '+1 Social Skill']
        }
    ],
    Qilin: [
        {
            id: 'qilin_auspice',
            name: 'Auspicious Qilin',
            description: 'Blessed with favorable fate and auspicious presence.',
            rarity: "F",
            previewIcon: 'icon-qilin-auspice',
            effects: { reputation: { world: 40 }, daoInsight: { level: 2 } },
            tags: ['auspice', 'support'],
            previewEffects: ['+40 World Reputation', 'Dao Insight II']
        },
        {
            id: 'qilin_guardian',
            name: 'Guardian Qilin',
            description: 'Protector of sacred places and righteous causes; strong defense and aura of calm.',
            rarity: "F",
            previewIcon: 'icon-qilin-guardian',
            effects: { def: 25, daoHeart: 15 },
            tags: ['defense', 'guardian'],
            previewEffects: ['+25 Def', '+15 Dao Heart']
        },
        {
            id: 'qilin_blessed',
            name: 'Blessed Qilin',
            description: 'Rare branch with powerful auspicious effects that aid allies.',
            rarity: "D",
            previewIcon: 'icon-qilin-blessed',
            effects: { reputation: { world: 80 }, special: ['auspice_healing'], passives: { qilin_blessing: { level: 2 } } },
            tags: ['healing', 'auspice'],
            previewEffects: ['+80 World Reputation', 'Auspice Healing']
        }
    ],
    Kunpeng: [
        {
            id: 'kunpeng_ocean_devourer',
            name: 'Ocean Devourer',
            description: 'A colossal Kunpeng scion shaped by the depths; commands oceanic force.',
            rarity: "F",
            previewIcon: 'icon-kunpeng-ocean',
            effects: { qi: 120, stamina: 40 },
            tags: ['ocean', 'power'],
            previewEffects: ['+120 Qi', '+40 Stamina']
        },
        {
            id: 'kunpeng_sky_sovereign',
            name: 'Sky Sovereign',
            description: 'A Kunpeng suited for the sky — swift, vast, and tempestuous.',
            rarity: "F",
            previewIcon: 'icon-kunpeng-sky',
            effects: { speed: 25, control: 15 },
            tags: ['air', 'speed'],
            previewEffects: ['+25 Speed']
        }
    ],
    Heavenly: [
        {
            id: 'heavenly_warrior',
            name: 'Heavenly Warrior',
            description: 'A martial enforcer of heavenly decree with ritual training.',
            rarity: "G",
            previewIcon: 'icon-heavenly-warrior',
            effects: { atk: 18, socialSkills: { level: 1 } },
            tags: ['heaven', 'martial'],
            previewEffects: ['+18 Atk']
        },
        {
            id: 'heavenly_noble',
            name: 'Heavenly Noble',
            description: 'A court-born agent of the celestial bureaucracy; wields influence as well as power.',
            rarity: "F",
            previewIcon: 'icon-heavenly-noble',
            effects: { reputation: { heavenly_court: 40 }, daoInsight: { level: 2 } },
            tags: ['social', 'fate'],
            previewEffects: ['+40 Heavenly Reputation']
        }
    ],
    Devil: [
        {
            id: 'devil_shadow',
            name: 'Shadow Devil',
            description: 'A devil attuned to darkness and stealth; excels at subtle corruption.',
            rarity: "G",
            previewIcon: 'icon-devil-shadow',
            effects: { stealth: 20, cunning: 15 },
            tags: ['shadow', 'corrupt'],
            previewEffects: ['+20 Stealth']
        },
        {
            id: 'devil_contractor',
            name: 'Infernal Contractor',
            description: 'A dealmaker who trades favors and resources for power.',
            rarity: "F",
            previewIcon: 'icon-devil-contract',
            effects: { resources: { yuan: 500 }, corruption: 10 },
            tags: ['bargain', 'infernal'],
            previewEffects: ['+500 Yuan', '+10 Corruption']
        }
    ],
    Ghost: [
        {
            id: 'ghost_wandering',
            name: 'Wandering Ghost',
            description: 'A restless spirit bound to memories or grievances; perceptive and eerie.',
            rarity: "H",
            previewIcon: 'icon-ghost-wandering',
            effects: { insight: 12, perception: 10 },
            tags: ['spirit', 'perception'],
            previewEffects: ['+12 Insight']
        },
        {
            id: 'ghost_ancestral',
            name: 'Ancestral Ghost',
            description: 'A spirit of lineage and memory; grants access to old lore and minor boons.',
            rarity: "F",
            previewIcon: 'icon-ghost-ancestral',
            effects: { loreAccess: 1, reputation: { clan: 30 } },
            tags: ['ancestral', 'lore'],
            previewEffects: ['+30 Clan Reputation']
        }
    ],
    chelonian: [
        {
            id: 'chelonian_longevity',
            name: 'Longevity Sage',
            description: 'An ancient chelonian steeped in centuries of patient cultivation and wisdom.',
            rarity: "D",
            previewIcon: 'icon-chelonian-longevity',
            effects: { lifespan: 800, cultivationMultiplier: 1.2, passives: { chelonian_longevity: { level: 3 }, chelonian_stoicism: { level: 1 } } },
            tags: ['longevity', 'steadfast'],
            previewEffects: ['+800 Lifespan', 'Cultivation x1.2']
        },
        {
            id: 'chelonian_guardian',
            name: 'Oceanic Guardian',
            description: 'A protective presence at sea; strong defensive and support affinities.',
            rarity: "F",
            previewIcon: 'icon-chelonian-guardian',
            effects: { defense: 60, stamina: 40, passives: { chelonian_guardian: { level: 1 } } },
            tags: ['defense', 'guardian'],
            previewEffects: ['+60 Defense', '+40 Stamina']
        }
    ],
    Monster: [
        {
            id: 'monster_chimera',
            name: 'Chimera',
            description: 'A hybrid predator combining traits from multiple beasts; unpredictable and lethal.',
            rarity: "F",
            previewIcon: 'icon-monster-chimera',
            effects: { combatPower: 160, adaptability: 10 },
            tags: ['hybrid', 'predator'],
            previewEffects: ['+160 Combat Power']
        },
        {
            id: 'monster_behemoth',
            name: 'Behemoth',
            description: 'A towering creature of raw strength and endurance.',
            rarity: "F",
            previewIcon: 'icon-monster-behemoth',
            effects: { hp: 500, def: 30 },
            tags: ['brute', 'endurance'],
            previewEffects: ['+500 HP', '+30 Def']
        }
    ]
};
// Compute startChance per-race for entries missing it, distributing rarity weight equally
function withComputedStartChances(input) {
    const out = {};
    for (const race of Object.keys(input)) {
        const arr = input[race];
        const counts = {};
        for (const bg of arr) {
            if (bg.startChance === undefined)
                counts[bg.rarity] = (counts[bg.rarity] || 0) + 1;
        }
        out[race] = arr.map((bg) => {
            if (typeof bg.startChance === 'number')
                return bg;
            const cfg = rarity_1.RARITY_CONFIG[bg.rarity];
            const denom = counts[bg.rarity] || 1;
            const startChance = (cfg?.weight ?? 1) / denom / 100;
            return { ...bg, startChance: Math.max(0, Math.min(1, Number(startChance.toFixed(3)))) };
        });
    }
    return out;
}
// Upgrade passive levels for rarer backgrounds when the passive id appears in ENHANCED_PASSIVE_LEVELS
function withEnhancedPassives(input) {
    const out = {};
    for (const race of Object.keys(input)) {
        out[race] = input[race].map((bg) => {
            const upgrades = (0, rarity_1.getEnhancedPassiveLevelsFor)(bg.rarity);
            if (!upgrades)
                return bg;
            const effects = (bg.effects || {});
            const passives = effects.passives || {};
            let changed = false;
            const upgraded = { ...passives };
            for (const k of Object.keys(passives)) {
                const targetLevel = upgrades[k];
                if (typeof targetLevel === 'number') {
                    const cur = passives[k] || {};
                    upgraded[k] = { ...cur, level: Math.max(cur.level || 1, targetLevel) };
                    changed = true;
                }
            }
            // If we didn't find explicit passives, auto-generate conservative passive ids
            // based on rarity so every background has some passives by default.
            if (Object.keys(passives).length === 0) {
                const rarity = (bg.rarity || "H");
                // default counts: legendary 4, rare 3, uncommon 2, common 1
                const defaultCountMap = { legendary: 4, rare: 3, uncommon: 2, common: 1 };
                let count = defaultCountMap[rarity] || 1;
                // Humans are given fewer passives (1-3)
                if (race.toLowerCase() === 'human')
                    count = Math.min(3, count);
                const gen = {};
                for (let i = 1; i <= count; i++) {
                    const pid = `${race.toLowerCase()}_${bg.id}_passive_${i}`;
                    gen[pid] = { level: 1 };
                }
                return { ...bg, effects: { ...effects, passives: gen } };
            }
            if (!changed)
                return bg;
            return { ...bg, effects: { ...effects, passives: upgraded } };
        });
    }
    return out;
}
exports.RACE_BACKGROUNDS = withEnhancedPassives(withComputedStartChances(RACE_BACKGROUNDS_RAW));
// Attach human-friendly luck labels for backgrounds and races without changing
// internal rarity calculations. This adds two non-destructive fields to each
// background: `luckIndex` (0..7) and `luckLabel` (one of the requested 8 labels).
// The mapping is conservative: unknown/neutral rarities map to 'Normal'.
const LUCK_LABELS = [
    'Super unlucky',
    'Greatly unlucky',
    'Unlucky',
    'Normal',
    'Lucky',
    'Super lucky',
    'Heavenly luck',
    'Ascendent luck'
];
function withLuckLabels(input) {
    const out = {};
    for (const race of Object.keys(input)) {
        out[race] = input[race].map((bg) => {
            const raw = bg.rarity || 'H';
            // Normalize to canonical tier letter (H/G/F/E/D/B) when possible
            const tier = (0, tierMigration_1.migrateTier)(String(raw));
            // Map letters to roughly-centered index where H -> Normal (3)
            const letterToIndex = { H: 3, G: 4, F: 5, E: 6, D: 7, B: 7 };
            const idx = letterToIndex[tier.replace(/[+-]$/, '')] ?? 3;
            return { ...bg, luckIndex: Math.max(0, Math.min(LUCK_LABELS.length - 1, idx)), luckLabel: LUCK_LABELS[Math.max(0, Math.min(LUCK_LABELS.length - 1, idx))] };
        });
    }
    return out;
}
// Re-export RACE_BACKGROUNDS with luck labels attached for UI/authoring convenience.
exports.RACE_BACKGROUNDS_WITH_LUCK = withLuckLabels(exports.RACE_BACKGROUNDS);
