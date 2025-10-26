"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEAPONS = void 0;
const tierMigration_1 = require("@/migrations/tierMigration");
exports.WEAPONS = [
    // Additional mortal-world clan leader weapons adapted as immortal mentors' favored arms
    { id: 'weapon_clanblade_ashen', name: 'Ashen Clanblade', tier: 'mortal', atk: 6, description: 'A well-tempered blade favored by ash-clan leaders.' },
    { id: 'weapon_clanstaff_yun', name: 'Yun Clanstaff', tier: 'mortal', atk: 4, description: 'A simple wooden staff used for teaching formation basics.' },
    { id: 'weapon_clanknife_huos', name: 'Huos Clanknife', tier: 'mortal', atk: 5, description: 'Close-quarters blade common among mountain clans.' },
    { id: 'weapon_clanhalberd_ridge', name: 'Ridge Halberd', tier: 'mortal', atk: 7, description: 'A polearm with a heavy crescent blade used in defensive formations.' },
    { id: 'weapon_clanbow_wind', name: 'Windclan Longbow', tier: 'mortal', atk: 5, description: 'A longbow prized for precision and teaching ranged tactics.' },
    { id: 'weapon_clanwhip_lotus', name: 'Lotus Whip', tier: 'mortal', atk: 4, description: 'Flexible whip used by leaders for crowd control.' },
    { id: 'weapon_clandagger_shade', name: 'Shade Dagger', tier: 'mortal', atk: 5, description: 'A stealth blade favored by covert-minded elders.' },
    { id: 'weapon_clanaxe_boulder', name: 'Boulder Axe', tier: 'mortal', atk: 8, description: 'Heavy axe used for training brute strength and shock tactics.' },
    { id: 'weapon_clanspear_sky', name: 'Sky Spear', tier: 'mortal', atk: 6, description: 'A spear balanced for coordinated thrust formations.' },
    { id: 'weapon_clanshield_vigil', name: 'Vigil Shield', tier: 'mortal', atk: 1, description: 'A sturdy shield used to teach formation anchoring.' },
    { id: 'weapon_clanfan_mirth', name: 'Mirth Fan', tier: 'mortal', atk: 3, description: 'A decorative fan that hides subtle blade edges and secret techniques.' },
    { id: 'weapon_clanflail_thorn', name: 'Thorn Flail', tier: 'mortal', atk: 7, description: 'An intimidating flail used to break ranks.' },
    { id: 'weapon_clanblade_triad', name: 'Triad Blade', tier: 'mortal', atk: 6, description: 'A paired blade used in synchronized teaching drills.' },
    { id: 'weapon_clanhammer_gale', name: 'Gale Hammer', tier: 'mortal', atk: 8, description: 'A heavy hammer used to instill raw power and timing.' },
    { id: 'weapon_clanscythe_dusk', name: 'Dusk Scythe', tier: 'mortal', atk: 6, description: 'A scythe adapted for formation-clearing techniques.' },
    { id: 'weapon_sword_iron_broker', name: 'Iron Broker Sword', type: 'sword', tier: 1, atk: 4, speed: 1, tags: ['starter', 'melee'], rarityCode: (0, tierMigration_1.migrateTier)('H') },
    { id: 'weapon_sword_veldra', name: 'Veldra Shortblade', type: 'sword', tier: 1, atk: 5, speed: 1.2, tags: ['melee', 'balanced'], rarityCode: (0, tierMigration_1.migrateTier)('H') },
    { id: 'weapon_spear_river_pike', name: 'River Pike', type: 'spear', tier: 2, atk: 6, speed: 0.9, tags: ['reach', 'formation'] },
    { id: 'weapon_spear_mantle_reach', name: 'Mantle Reach', type: 'spear', tier: 3, atk: 9, speed: 0.95, tags: ['reach', 'control'] },
    { id: 'weapon_bow_windwhisper', name: 'Windwhisper Bow', type: 'bow', tier: 2, atk: 5, speed: 1.1, tags: ['ranged', 'precision'] },
    { id: 'weapon_crossbow_dawnpiercer', name: 'Dawnpiercer Crossbow', type: 'bow', tier: 3, atk: 11, speed: 0.85, tags: ['ranged', 'pierce'] },
    { id: 'weapon_axe_earthcleaver', name: 'Earthcleaver Axe', type: 'axe', tier: 3, atk: 10, speed: 0.7, tags: ['heavy', 'cleave'] },
    { id: 'weapon_dagger_shadowfang', name: 'Shadowfang Dagger', type: 'dagger', tier: 2, atk: 5, speed: 1.6, tags: ['crit', 'stealth'] },
    { id: 'weapon_dagger_windshank', name: 'Windshank', type: 'dagger', tier: 1, atk: 4, speed: 1.7, tags: ['starter', 'mobility'] },
    { id: 'weapon_staff_moonpole', name: 'Moonpole Staff', type: 'staff', tier: 3, atk: 7, speed: 1.0, tags: ['spirit', 'channel'] },
    { id: 'weapon_staff_wind_herald', name: 'Herald of Wind', type: 'staff', tier: 4, atk: 12, speed: 1.05, tags: ['spirit', 'aoe'] },
    { id: 'weapon_polearm_starmark', name: 'Starmark Halberd', type: 'polearm', tier: 4, atk: 12, speed: 0.85, tags: ['reach', 'control'] },
    { id: 'weapon_claw_iron_talon', name: 'Iron Talon Claws', type: 'claw', tier: 2, atk: 6, speed: 1.4, tags: ['frenzy', 'bleed'] },
    { id: 'weapon_claw_razorwind', name: 'Razorwind Talons', type: 'claw', tier: 3, atk: 9, speed: 1.5, tags: ['crit', 'frenzy'] },
    { id: 'weapon_whip_silk_binder', name: 'Silk Binder Whip', type: 'whip', tier: 2, atk: 4, speed: 1.2, tags: ['disarm', 'control'] },
    { id: 'weapon_whip_iron_chain', name: 'Iron Chain Whip', type: 'whip', tier: 3, atk: 8, speed: 1.0, tags: ['control', 'reach'] },
    { id: 'weapon_spiritblade_ghostedge', name: 'Ghostedge Spiritblade', type: 'spiritblade', tier: 5, atk: 18, speed: 1.1, tags: ['spirit'], rarityCode: (0, tierMigration_1.migrateTier)('B') },
    { id: 'weapon_fan_sorrowgale', name: 'Sorrowgale Fan', type: 'fan', tier: 2, atk: 4, speed: 1.3, tags: ['ranged', 'control'], rarityCode: (0, tierMigration_1.migrateTier)('G') },
    { id: 'weapon_blade_kairos', name: 'Kairos Greatblade', type: 'greatsword', tier: 4, atk: 16, speed: 0.65, tags: ['heavy', 'cleave'] },
    { id: 'weapon_glaive_astral', name: 'Astral Glaive', type: 'glaive', tier: 5, atk: 20, speed: 0.9, tags: ['reach', "C"] }
];
exports.default = exports.WEAPONS;
