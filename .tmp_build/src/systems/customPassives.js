"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passiveRegistry_1 = require("./passiveRegistry");
const passiveHelpers_1 = require("./passiveHelpers");
// Register specific crafted passives for newly named skills
try {
    (0, passiveRegistry_1.registerPassive)({
        id: 'heaven_splitter',
        name: 'Rift-Cleaver of Celestial Tide',
        description: 'A sword technique that rends the heavens and fractures fate; strikes with thunderlike finality.',
        apply: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            // helper APIs will create _autoApplied and _passiveHooks as needed
            // Apply stat deltas + persistent penalty metadata idempotently
            (0, passiveHelpers_1.applyStatDeltas)(out, 'heaven_splitter', { atk: 6, hsPenalty: 2 });
            // consume the small initial qi cost now
            out.qi = Math.max(0, (out.qi || 0) - 2);
            // Hooks must operate on runtime ctx.player and not close over `out`.
            const onEnter = (ctx) => {
                try {
                    const p = ctx.player || ctx;
                    p._autoApplied = p._autoApplied || {};
                    p._autoApplied.heaven_splitter = p._autoApplied.heaven_splitter || { atk: 6, hsPenalty: 2 };
                    p._autoApplied.heaven_splitter.nextEmpowered = true;
                }
                catch (e) { /* dev-safe */ }
            };
            const onDealDamage = (ctx) => {
                try {
                    const p = ctx.player || ctx;
                    const meta = (p._autoApplied && p._autoApplied.heaven_splitter) || null;
                    if (!meta || !meta.nextEmpowered)
                        return;
                    meta.nextEmpowered = false; // consume
                    ctx.modifiers = ctx.modifiers || {};
                    ctx.modifiers.critChance = (ctx.modifiers.critChance || 0) + 0.45;
                    ctx.modifiers.critDamage = (ctx.modifiers.critDamage || 0) + 1.0;
                    // cost: additional qi drain on trigger
                    p.qi = Math.max(0, (p.qi || 0) - 25);
                }
                catch (e) { /* dev-safe */ }
            };
            // Use helper to attach runtime hooks (deduped) and wrap with devSafe
            (0, passiveHelpers_1.addHook)(out, 'onEnterCombat', 'heaven_splitter', (0, passiveHelpers_1.devSafe)(onEnter));
            (0, passiveHelpers_1.addHook)(out, 'onDealDamage', 'heaven_splitter', (0, passiveHelpers_1.devSafe)(onDealDamage));
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            // Revert stat deltas recorded under _autoApplied
            (0, passiveHelpers_1.revertStatDeltas)(out, 'heaven_splitter');
            // restore qi penalty if present
            const pen = out._autoApplied && out._autoApplied.heaven_splitter && out._autoApplied.heaven_splitter.hsPenalty;
            if (pen)
                out.qi = Math.min((out.qi || 0) + pen, (out.maxQi || Infinity));
            // remove runtime hooks
            (0, passiveHelpers_1.removeHook)(out, 'onEnterCombat', 'heaven_splitter');
            (0, passiveHelpers_1.removeHook)(out, 'onDealDamage', 'heaven_splitter');
            return out;
        }
    });
    (0, passiveRegistry_1.registerPassive)({
        id: 'void_dragon_saber',
        name: 'Void-Dragon Saber',
        description: 'A saber form that channels the cold hunger of the void; cleaves through spirit and matter alike.',
        apply: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            // moderate attack and a proc that damages attackers on hit
            (0, passiveHelpers_1.applyStatDeltas)(out, 'void_dragon_saber', { atk: 4 });
            // attach onHit that wounds the attacker by a small percent
            const onHit = ({ attacker, damage }) => {
                try {
                    if (attacker && typeof attacker.hp === 'number') {
                        const refl = Math.max(1, Math.floor((damage || 1) * 0.12));
                        attacker.hp = Math.max(0, attacker.hp - refl);
                    }
                }
                catch (e) { /* ignore */ }
            };
            (0, passiveHelpers_1.addHook)(out, 'onHit', 'void_dragon_saber', (0, passiveHelpers_1.devSafe)(onHit));
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            // revert applied deltas and remove runtime hook
            (0, passiveHelpers_1.revertStatDeltas)(out, 'void_dragon_saber');
            (0, passiveHelpers_1.removeHook)(out, 'onHit', 'void_dragon_saber');
            return out;
        },
        onHit: undefined
    });
    (0, passiveRegistry_1.registerPassive)({
        id: 'phoenix_rebirth_aura_custom',
        name: 'Phoenix Rebirth Aura (Custom)',
        description: 'A custom stronger rebirth aura for playtesting; heals and restores qi over time.',
        apply: (player) => {
            const out = { ...player };
            const aura = (pl) => {
                try {
                    const max = pl.maxHp || 100;
                    pl.hp = Math.min(max, (pl.hp || 0) + 5);
                    pl.qi = Math.min((pl.qi || 0) + 4, (pl.maxQi || Infinity));
                }
                catch (e) { /* ignore */ }
            };
            // record serializable metadata and attach runtime hook
            (0, passiveHelpers_1.applyStatDeltas)(out, 'phoenix_rebirth_aura_custom', { heal: 5, qi: 4 });
            (0, passiveHelpers_1.addHook)(out, 'auraTick', 'phoenix_rebirth_aura_custom', (0, passiveHelpers_1.devSafe)(aura));
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            // revert stored metadata and remove runtime hook
            (0, passiveHelpers_1.revertStatDeltas)(out, 'phoenix_rebirth_aura_custom');
            (0, passiveHelpers_1.removeHook)(out, 'auraTick', 'phoenix_rebirth_aura_custom');
            return out;
        },
        auraTick: undefined
    });
}
catch (e) {
    // if passive registry isn't available, skip gracefully
}
exports.default = true;
// Ensure every skill entry has a runtime passive implementation.
// Tier-driven defaults: S (strongest): atk+5/def+3 + auraTick; A: atk+3/def+1; B: def+2; C: def+1 (weakest manuals)
try {
    // Use require to avoid TS JSON import constraints at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const SKILLS = require('../data/skills/all_skills.json');
    SKILLS.forEach((s) => {
        const id = s && s.id;
        if (!id)
            return;
        if ((0, passiveRegistry_1.getPassive)(id))
            return; // don't overwrite existing handcrafted passives
        const tier = ((s && s.tier) || 'C').toUpperCase();
        const name = (s && s.name) || id;
        const description = (s && s.description) || '';
        if (tier === 'S') {
            (0, passiveRegistry_1.registerPassive)({
                id,
                name,
                description,
                apply: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    (0, passiveHelpers_1.applyStatDeltas)(out, id, { atk: 5, def: 3, cultivationSpeed: 0.90 });
                    // attach aura tick: restore small qi each tick
                    const aura = (pl) => { try {
                        pl.qi = Math.min((pl.qi || 0) + 2, (pl.maxQi || Infinity));
                    }
                    catch (e) { /* dev-safe */ } };
                    (0, passiveHelpers_1.addHook)(out, 'auraTick', id, (0, passiveHelpers_1.devSafe)(aura));
                    return out;
                },
                remove: (player) => {
                    const out = { ...player };
                    // revert deltas
                    (0, passiveHelpers_1.revertStatDeltas)(out, id);
                    // remove aura hook
                    (0, passiveHelpers_1.removeHook)(out, 'auraTick', id);
                    return out;
                }
            });
            return;
        }
        if (tier === 'A') {
            (0, passiveRegistry_1.registerPassive)({
                id,
                name,
                description,
                apply: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    // record and apply deltas idempotently
                    (0, passiveHelpers_1.applyStatDeltas)(out, id, { atk: 3, def: 1, cultivationSpeed: 0.30 });
                    return out;
                },
                remove: (player) => {
                    const out = { ...player };
                    // revert deltas and remove stored metadata
                    (0, passiveHelpers_1.revertStatDeltas)(out, id);
                    return out;
                }
            });
            return;
        }
        if (tier === 'B') {
            (0, passiveRegistry_1.registerPassive)({
                id,
                name,
                description,
                apply: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    (0, passiveHelpers_1.applyStatDeltas)(out, id, { def: 2, cultivationSpeed: 0.12 });
                    return out;
                },
                remove: (player) => {
                    const out = { ...player };
                    (0, passiveHelpers_1.revertStatDeltas)(out, id);
                    return out;
                }
            });
            return;
        }
        // default C-tier
        (0, passiveRegistry_1.registerPassive)({
            id,
            name,
            description,
            apply: (player) => {
                const out = { ...player };
                out.stats = { ...(out.stats || {}) };
                (0, passiveHelpers_1.applyStatDeltas)(out, id, { def: 1, cultivationSpeed: 0.05 });
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                out.stats = { ...(out.stats || {}) };
                (0, passiveHelpers_1.revertStatDeltas)(out, id);
                return out;
            }
        });
    });
}
catch (e) {
    // graceful fallback if JSON can't be loaded
}
// Additional generated registrations (tier-driven)
try {
    // A-tier examples: moderate bonuses or simple hooks
    (0, passiveRegistry_1.registerPassive)({
        id: 'heavenly_fist_of_millennia',
        name: 'Millennia Heavenly Fist',
        description: 'Hundreds of years of condensed technique made into a single palm — a crushing truth disguised as an embrace.',
        apply: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            (0, passiveHelpers_1.applyStatDeltas)(out, 'heavenly_fist_of_millennia', { atk: 4, def: 2 });
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            (0, passiveHelpers_1.revertStatDeltas)(out, 'heavenly_fist_of_millennia');
            return out;
        }
    });
    (0, passiveRegistry_1.registerPassive)({
        id: 'swiftwind_strike',
        name: 'Swiftwind Gale Strike',
        description: 'A blade of wind that leaves no echo; grants sudden, decisive strikes and fleeting mobility.',
        apply: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            (0, passiveHelpers_1.applyStatDeltas)(out, 'swiftwind_strike', { speed: 4, atk: 2 });
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            (0, passiveHelpers_1.revertStatDeltas)(out, 'swiftwind_strike');
            return out;
        }
    });
    (0, passiveRegistry_1.registerPassive)({
        id: 'starfall_sword_dance',
        name: 'Starfall Sword Dance',
        description: 'A graceful barrage of blades like falling stars; excels at overwhelming multiple foes.',
        apply: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            (0, passiveHelpers_1.applyStatDeltas)(out, 'starfall_sword_dance', { atk: 3 });
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            (0, passiveHelpers_1.revertStatDeltas)(out, 'starfall_sword_dance');
            return out;
        }
    });
    // B-tier: modest stat tweaks
    const bTier = [
        'purifying_sutra', 'tenacious_guard', 'iron_skin', 'southern_academy_skill_4', 'sword_hall_skill_3', 'weapon_clanblade_ashen', 'weapon_clanstaff_yun', 'weapon_clanbow_wind', 'weapon_clanwhip_lotus', 'weapon_clandagger_shade', 'weapon_clanaxe_boulder', 'weapon_clanhammer_gale', 'mutra_gale_hand_sutra', 'sutra_silverscribe_breath', 'sutra_tidebinder_verse', 'sutra_moonfall_chant', 'mutra_serpent_twine', 'mutra_windvein_sutra', 'mutra_hollow_palm_sutra', 'mutra_echoing_braid'
    ];
    bTier.forEach((id) => {
        (0, passiveRegistry_1.registerPassive)({
            id,
            name: (id === 'purifying_sutra') ? 'Sutra of Purging Dawn' : undefined,
            description: '',
            apply: (player) => {
                const out = { ...player };
                out.stats = { ...(out.stats || {}) };
                (0, passiveHelpers_1.applyStatDeltas)(out, id, { def: 2 });
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                out.stats = { ...(out.stats || {}) };
                (0, passiveHelpers_1.revertStatDeltas)(out, id);
                return out;
            }
        });
    });
    // C-tier: minor bonuses
    const cTier = ['iron_mountain_skill_2', 'sect_generic_0', 'nomad_clans_tactic_0', 'monastic_temple_skill_1', 'weapon_clanknife_huos', 'weapon_clanshield_vigil', 'weapon_clanfan_mirth', 'mutra_echoing_braid'];
    cTier.forEach(id => {
        (0, passiveRegistry_1.registerPassive)({
            id,
            apply: (player) => {
                const out = { ...player };
                out.stats = { ...(out.stats || {}) };
                (0, passiveHelpers_1.applyStatDeltas)(out, id, { def: 1 });
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                out.stats = { ...(out.stats || {}) };
                (0, passiveHelpers_1.revertStatDeltas)(out, id);
                return out;
            }
        });
    });
    // S-tier extras
    (0, passiveRegistry_1.registerPassive)({
        id: 'eternal_spirit_18',
        name: 'Eternal-Spirit Chant XVIII',
        description: "An exalted incantation that harmonizes the spirit to the world's deeper rhythms.",
        apply: (player) => {
            const out = { ...player };
            out.stats = { ...(out.stats || {}) };
            // helper APIs will create _autoApplied and _passiveHooks as needed
            (0, passiveHelpers_1.applyStatDeltas)(out, 'eternal_spirit_18', { atk: 5, def: 3 });
            const aura = (pl) => { try {
                pl.qi = Math.min((pl.qi || 0) + 3, (pl.maxQi || Infinity));
                pl.insight = (pl.insight || 0) + 1;
            }
            catch (e) { /* dev-safe */ } };
            const onExplore = (ctx) => { try {
                const p = ctx.player || ctx;
                p.insight = (p.insight || 0) + 2;
            }
            catch (e) { /* dev-safe */ } };
            (0, passiveHelpers_1.addHook)(out, 'auraTick', 'eternal_spirit_18', (0, passiveHelpers_1.devSafe)(aura));
            (0, passiveHelpers_1.addHook)(out, 'onExplore', 'eternal_spirit_18', (0, passiveHelpers_1.devSafe)(onExplore));
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            (0, passiveHelpers_1.revertStatDeltas)(out, 'eternal_spirit_18');
            (0, passiveHelpers_1.removeHook)(out, 'auraTick', 'eternal_spirit_18');
            (0, passiveHelpers_1.removeHook)(out, 'onExplore', 'eternal_spirit_18');
            return out;
        }
    });
    (0, passiveRegistry_1.registerPassive)({
        id: 'immortal_necrosis_poison',
        name: 'Necrotic Tongue of the Immortals',
        description: 'A venom refined to corrupt mortal vitality and linger in the soul if untreated.',
        apply: (player) => {
            const out = { ...player };
            // attaches a proc that deals lingering damage to enemies when they hit
            const proc = (ctx) => {
                try {
                    const target = ctx.target;
                    if (target && typeof target.hp === 'number') {
                        target.hp = Math.max(0, target.hp - 2);
                    }
                }
                catch (e) { /* dev-safe */ }
            };
            // attach runtime hook and record simple metadata
            (0, passiveHelpers_1.applyStatDeltas)(out, 'immortal_necrosis_poison', { dot: 2 });
            (0, passiveHelpers_1.addHook)(out, 'proc', 'immortal_necrosis_poison', (0, passiveHelpers_1.devSafe)(proc));
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            // revert recorded metadata and remove runtime hook
            (0, passiveHelpers_1.revertStatDeltas)(out, 'immortal_necrosis_poison');
            (0, passiveHelpers_1.removeHook)(out, 'proc', 'immortal_necrosis_poison');
            return out;
        }
    });
    (0, passiveRegistry_1.registerPassive)({
        id: 'soul_shackle',
        name: 'Soul-Shackle Bind',
        description: "A metaphysical restraint that clamps spirit flow and weakens foes' cultivations.",
        apply: (player) => {
            const out = { ...player };
            // helper APIs will create _autoApplied and _passiveHooks as needed
            const onHit = ({ attacker }) => {
                try {
                    if (attacker && attacker.stats) {
                        attacker.stats.atk = Math.max(0, (attacker.stats.atk || 0) - 2);
                        attacker.stats.cultivationPower = Math.max(0, (attacker.stats.cultivationPower || 0) - 3);
                        // record a stacks counter in attacker's serializable metadata instead of ad-hoc field
                        try {
                            (0, passiveHelpers_1.safeInc)(attacker, ['_autoApplied', 'soul_shackle', 'stacks'], 1);
                        }
                        catch (e) { /* dev-safe */ }
                    }
                }
                catch (e) { /* dev-safe */ }
            };
            (0, passiveHelpers_1.addHook)(out, 'onHit', 'soul_shackle', (0, passiveHelpers_1.devSafe)(onHit));
            (0, passiveHelpers_1.applyStatDeltas)(out, 'soul_shackle', { applied: 1 });
            return out;
        },
        remove: (player) => {
            const out = { ...player };
            (0, passiveHelpers_1.removeHook)(out, 'onHit', 'soul_shackle');
            (0, passiveHelpers_1.revertStatDeltas)(out, 'soul_shackle');
            return out;
        }
    });
}
catch (e) {
    // ignore
}
