"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSIVES = void 0;
const tierMigration_1 = require("@/migrations/tierMigration");
exports.PASSIVES = [
    // Mortal-world clan leader inspired passives (usable by immortal mentors as teaching anchors)
    { id: 'passive_leader_aura', name: 'Leader Aura', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 2, def: 2, description: 'An aura that bolsters nearby allies.', tags: ['support'] },
    { id: 'passive_veteran_tactics', name: 'Veteran Tactics', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 3, def: 1, description: 'Grants improved formation coordination.', tags: ['formation'] },
    { id: 'passive_shieldwall', name: 'Shieldwall Discipline', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), def: 4, description: 'Increases party defense when anchored.', tags: ['defense'] },
    { id: 'passive_ranged_accuracy', name: 'Ranged Accuracy', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 2, description: 'Improves ranged hit chance and damage.', tags: ['ranged'] },
    { id: 'passive_scouting_instincts', name: 'Scouting Instincts', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), speedPct: 5, description: 'Improves initiative and detection.', tags: ['utility'] },
    { id: 'passive_berserker_rage', name: 'Berserker Rage', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 5, description: 'Temporarily increases attack after taking heavy damage.', tags: ['offense'] },
    { id: 'passive_steel_will', name: 'Steel Will', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), def: 3, qiMax: 10, description: 'Reduces the duration of crowd-control effects.', tags: ['utility'] },
    { id: 'passive_inspiring_cry', name: 'Inspiring Cry', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atkPct: 5, description: 'Boosts allies attack percentage briefly upon entering combat.', tags: ['support'] },
    { id: 'passive_hunter_mark', name: 'Hunter Mark', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 3, description: 'Marks a target to increase subsequent damage.', tags: ['ranged', 'single-target'] },
    { id: 'passive_siege_mastery', name: 'Siege Mastery', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 4, description: 'Enhances damage against anchored formations.', tags: ['siege'] },
    { id: 'passive_stealth_shroud', name: 'Stealth Shroud', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), speedPct: 8, description: 'Grants a temporary stealth window at range.', tags: ['stealth'] },
    { id: 'passive_trap_expert', name: 'Trap Expert', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), description: 'Increases trap damage and detection likelihood.', tags: ['utility'] },
    { id: 'passive_rallying_banner', name: 'Rallying Banner', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), def: 2, qiMax: 5, description: 'Provides small passive morale recovery to allies.', tags: ['support'] },
    { id: 'passive_piercing_precision', name: 'Piercing Precision', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), atk: 3, description: 'Ignores a portion of enemy defenses on hit.', tags: ['offense'] },
    { id: 'passive_endurance_training', name: 'Endurance Training', tier: 'mortal', rarityCode: (0, tierMigration_1.migrateTier)('H'), hp: 20, description: 'Increases max HP through conditioning.', tags: ['survival'] },
    { id: 'passive_stun_chance', name: 'Stun Chance', description: 'Small chance to stun on hit.', tags: ['control', 'offense'], tier: 1, rarityCode: (0, tierMigration_1.migrateTier)('H') },
    { id: 'passive_bleed_on_hit', name: 'Bleed on Hit', description: 'Deal small bleeding damage over time.', tags: ['dot', 'offense'], tier: 1, rarityCode: (0, tierMigration_1.migrateTier)('H') },
    { id: 'passive_armor_pierce', name: 'Armor Pierce', description: 'Penetrate a portion of enemy defense.', tags: ['offense'], tier: 2 },
    { id: 'passive_dot_poison', name: 'Poison Toxin', description: 'Applies stacking poison DOT.', tags: ['dot', 'poison'], tier: 2 },
    { id: 'passive_quick_recovery', name: 'Quick Recovery', description: 'Recover from stagger faster.', tags: ['defense', 'utility'], tier: 1 },
    { id: 'passive_channel_focus', name: 'Channel Focus', description: 'Improve channeling efficiency for sutras and spells.', tags: ['spirit', 'utility'], tier: 2 },
    { id: 'passive_critical_mastery', name: 'Critical Mastery', description: 'Increase critical hit chance by a small percent.', tags: ['offense', 'crit'], tier: 3 },
    { id: 'passive_guard_resilience', name: 'Guard Resilience', description: 'Improve guard strength and reduce knockback.', tags: ['defense'], tier: 2 },
    { id: 'passive_spirit_resonance', name: 'Spirit Resonance', description: 'Small passive boost to spirit-affecting abilities.', tags: ['spirit', 'passive'], tier: 3 },
    { id: 'passive_formation_leader', name: 'Formation Leader', description: 'Grants minor bonuses to nearby allies when in a formation.', tags: ['formation', 'leadership'], tier: 4 },
    { id: 'passive_berserk_rage', name: 'Berserk Rage', description: 'Gain increased attack but suffer defense penalty while HP below threshold.', tags: ['offense', 'risky'], tier: 2 },
    { id: 'passive_shroud_of_mist', name: 'Shroud of Mist', description: 'Small chance to negate incoming first-hit effects each encounter.', tags: ['defense', 'utility'], tier: 3 },
    { id: 'passive_armored_stance', name: 'Armored Stance', description: 'Flat damage reduction when guarding.', tags: ['defense'], tier: 2 },
    { id: 'passive_echoed_strikes', name: 'Echoed Strikes', description: 'Every third attack deals additional spirit damage.', tags: ['spirit', 'offense'], tier: 3 },
    { id: 'passive_martial_disciple', name: 'Martial Disciple', description: 'Small flat XP gain bonus and faster skill learning.', tags: ['utility'], tier: 1 },
    { id: 'passive_sunder_armor', name: 'Sunder Armor', description: 'Occasionally reduce an enemy armor stat on hit.', tags: ['offense', 'debuff'], tier: 3 },
    { id: 'passive_serene_mind', name: 'Serene Mind', description: 'Reduce spirit-cost of chi abilities.', tags: ['spirit', 'cost'], tier: 2 },
    { id: 'passive_vigilant_guard', name: 'Vigilant Guard', description: 'Slightly increase perception to detect ambushes.', tags: ['utility', 'defense'], tier: 1 },
    { id: 'passive_war_leader', name: 'War Leader', description: 'Improve nearby ally damage when leading a formation.', tags: ['formation', 'leadership'], tier: 4 }
];
