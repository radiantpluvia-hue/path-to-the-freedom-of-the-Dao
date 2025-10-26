"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPassive = registerPassive;
exports.unregisterPassive = unregisterPassive;
exports.getPassive = getPassive;
exports._registryContains = _registryContains;
exports.applyPassiveToPlayer = applyPassiveToPlayer;
exports.removePassiveFromPlayer = removePassiveFromPlayer;
exports.loadGeneratedPassives = loadGeneratedPassives;
exports.ensureGeneratedPassives = ensureGeneratedPassives;
// Use `var` here to ensure the registry variable is hoisted in compiled bundles.
// This avoids a TDZ/circular-import initialization problem where generated
// modules reference the registry during their top-level evaluation.
const registry = {};
function registerPassive(def) {
    if (!def || !def.id)
        throw new Error('Passive must have an id');
    registry[def.id] = def;
}
function unregisterPassive(id) {
    delete registry[id];
}
function getPassive(id) {
    return registry[id];
}
// Internal helper used by tests to assert presence of generated/manual registry entries
function _registryContains(id) {
    return Boolean(registry[id]);
}
function applyPassiveToPlayer(player, passiveId, payload) {
    const def = registry[passiveId];
    if (!def)
        return player;
    try {
        const out = def.apply(player, payload);
        // Attach any declared hooks to a runtime _passiveHooks map on the player so systems
        // like CombatSystem can discover and invoke them.
        if (def.onHit || def.auraTick || def.proc) {
            out._passiveHooks = { ...(out._passiveHooks || {}) };
            if (def.onHit)
                (0, passiveHelpers_1.addHook)(out, 'onHit', def.id, (0, passiveHelpers_1.devSafe)(def.onHit));
            if (def.auraTick)
                (0, passiveHelpers_1.addHook)(out, 'auraTick', def.id, (0, passiveHelpers_1.devSafe)(def.auraTick));
            if (def.proc)
                (0, passiveHelpers_1.addHook)(out, 'proc', def.id, (0, passiveHelpers_1.devSafe)(def.proc));
        }
        return out;
    }
    catch (e) {
        return player;
    }
}
function removePassiveFromPlayer(player, passiveId, payload) {
    const def = registry[passiveId];
    if (!def)
        return player;
    // First, call the passive's remove implementation. If it throws, we must
    // return the original player to avoid half-applied state.
    let out;
    try {
        out = def.remove(player, payload);
    }
    catch (e) {
        const msg = e && (e.message || String(e));
        logger_1.logger.warn && logger_1.logger.warn('[PassiveRegistry] remove() threw for passive', passiveId, msg);
        return player;
    }
    // Attempt to remove any runtime hook entries matching this passive id.
    // Hook removal errors shouldn't prevent the passive's state from being
    // reverted, so catch and log them separately.
    try {
        if (out._passiveHooks) {
            ['onHit', 'auraTick', 'proc'].forEach((k) => (0, passiveHelpers_1.removeHook)(out, k, passiveId));
            if (Object.keys(out._passiveHooks).length === 0)
                delete out._passiveHooks;
        }
    }
    catch (e) {
        const msg = e && (e.message || String(e));
        logger_1.logger.warn && logger_1.logger.warn('[PassiveRegistry] hook removal failed for passive', passiveId, msg);
    }
    return out;
}
// Register a small example passive used by some tests or quick prototyping
registerPassive({
    id: 'example_strength_boost',
    name: 'Example Strength Boost',
    description: 'Adds +5 to attack when applied',
    apply: (player) => {
        const p = { ...player };
        p.stats = { ...(p.stats || {}) };
        p.stats.attack = (p.stats.attack || 0) + 5;
        return p;
    },
    remove: (player) => {
        const p = { ...player };
        p.stats = { ...(p.stats || {}) };
        p.stats.attack = (p.stats.attack || 0) - 5;
        return p;
    }
});
// Register simple generated passives for each major sect (tests expect ids like `${sect.id}_passive_1`)
const SectSystem_1 = require("./SectSystem");
const logger_1 = require("../utils/logger");
const passiveHelpers_1 = require("./passiveHelpers");
SectSystem_1.MAJOR_SECTS.forEach((sect) => {
    const id = `${sect.id}_passive_1`;
    if (!registry[id]) {
        registerPassive({
            id,
            name: `${sect.name} Passive 1`,
            description: `Auto-generated passive for ${sect.name}`,
            apply: (player) => player,
            remove: (player) => player,
        });
    }
});
// Import generated passive registrations so functional generated passives are active
// NOTE: generated passive registrations are large (JSON) and executed at import-time.
// To avoid inflating the initial bundle we lazily load and register them on demand.
let __generatedPassivesLoaded = false;
async function loadGeneratedPassives() {
    if (__generatedPassivesLoaded)
        return;
    __generatedPassivesLoaded = true;
    try {
        // Diagnostic: log when loadGeneratedPassives runs
        logger_1.logger.debug('[PassiveRegistry] loadGeneratedPassives invoked');
        let mod = null;
        try {
            // Prefer synchronous require when running under Node/Jest to avoid async import timing issues
            // that can cause modules to be imported after the Jest environment tears down.
            // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
            mod = require('./generatedPassiveRegistrations');
        }
        catch (eRequire) {
            try {
                mod = await Promise.resolve().then(() => __importStar(require('./generatedPassiveRegistrations')));
            }
            catch (eImport) {
                mod = null;
            }
        }
        if (mod && typeof mod.registerGeneratedPassives === 'function') {
            // wrap registerPassive to add diagnostics for first few registrations
            let count = 0;
            const wrapped = (def) => {
                try {
                    registerPassive(def);
                    count += 1;
                    if (count <= 3) {
                        logger_1.logger.debug(`[PassiveRegistry] registered generated passive: ${def && def.id}`);
                    }
                }
                catch (e) {
                    const msg = (e && (e.message || String(e))) || 'unknown';
                    logger_1.logger.warn('[PassiveRegistry] failed registering passive', msg);
                }
            };
            // Support both synchronous and asynchronous register functions
            const res = mod.registerGeneratedPassives(wrapped);
            if (res && typeof res.then === 'function') {
                await res;
            }
            logger_1.logger.info && logger_1.logger.info(`[PassiveRegistry] registered ${count} generated passives (diagnostic)`);
        }
    }
    catch (e) {
        // fail silently; generated passives are optional at runtime
    }
}
// Kicks off background loading but doesn't await it. Useful when we want to
// start fetching the generated passives without blocking synchronous code paths.
function ensureGeneratedPassives() {
    // start loading in background
    void loadGeneratedPassives();
}
// Note: we intentionally export functions as named exports to avoid default import/case issues
// --- Balanced default background passives ---
// These map to background effect passive IDs so backgrounds confer mild, reversible benefits.
// Guidelines:
//  - Stick to small numeric stat bonuses and simple hooks.
//  - Ensure remove reverses apply exactly.
//  - Avoid one-time resources so removal is clean.
try {
    const safeInc = (obj, path, delta) => {
        let cur = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const k = path[i];
            cur[k] = cur[k] || {};
            cur = cur[k];
        }
        const leaf = path[path.length - 1];
        const prev = Number(cur[leaf] || 0);
        cur[leaf] = prev + delta;
    };
    const ensureStatsObj = (p) => { p.stats = { ...(p.stats || {}) }; };
    const REGISTER = [
        {
            id: 'noble_upbringing',
            name: 'Noble Upbringing',
            description: 'Refined training grants a small all-around polish.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], 1);
                safeInc(out, ['stats', 'def'], 1);
                safeInc(out, ['stats', 'speed'], 1);
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], -1);
                safeInc(out, ['stats', 'def'], -1);
                safeInc(out, ['stats', 'speed'], -1);
                return out;
            },
        },
        {
            id: 'demonic_resolve',
            name: 'Demonic Resolve',
            description: 'Unyielding ferocity bolsters attack at a karmic cost.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], 3);
                safeInc(out, ['karma'], -10);
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], -3);
                safeInc(out, ['karma'], 10);
                return out;
            },
        },
        {
            id: 'draconic_resilience',
            name: 'Draconic Resilience',
            description: 'Scales like iron add sturdy defense.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], 4);
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], -4);
                return out;
            },
        },
        {
            id: 'draconic_vigor',
            name: 'Draconic Vigor',
            description: 'Ancient vitality sharpens fang and claw.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], 3);
                safeInc(out, ['stats', 'speed'], 2);
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], -3);
                safeInc(out, ['stats', 'speed'], -2);
                return out;
            },
        },
        {
            id: 'phoenix_regen',
            name: 'Phoenix Regeneration',
            description: 'A gentle healing aura mends small wounds over time.',
            apply: (player) => {
                const out = { ...player };
                // Mild sustain: heal 3 HP per aura tick (CombatSystem may call auraTick each round)
                const aura = (pl) => {
                    const max = pl.maxHp || 0;
                    const cur = pl.hp || 0;
                    const heal = Math.max(1, Math.min(3, Math.floor(0.02 * (max || 150)))); // ~2% or min 1, cap mild
                    const nextHp = Math.min(max || cur + heal, cur + heal);
                    pl.hp = nextHp;
                };
                // Attach via hooks on apply
                out._passiveHooks = { ...(out._passiveHooks || {}) };
                out._passiveHooks.auraTick = [
                    ...((out._passiveHooks.auraTick) || []),
                    { id: 'phoenix_regen', fn: aura }
                ];
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                if (out._passiveHooks && Array.isArray(out._passiveHooks.auraTick)) {
                    out._passiveHooks.auraTick = out._passiveHooks.auraTick.filter((h) => h.id !== 'phoenix_regen');
                    if (out._passiveHooks.auraTick.length === 0)
                        delete out._passiveHooks.auraTick;
                }
                if (out._passiveHooks && Object.keys(out._passiveHooks).length === 0)
                    delete out._passiveHooks;
                return out;
            },
            auraTick: undefined,
        },
        {
            id: 'phoenix_flame_affinity',
            name: 'Phoenix Flame Affinity',
            description: 'A faint ember of phoenix fire bolsters attack slightly and warms the spirit.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], 2);
                // small qi comfort bonus (non-stat) tracked privately for exact reversal
                out._pfa = 5;
                out.qi = (out.qi || 0) + 5;
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], -2);
                const delta = out._pfa || 0;
                if (delta)
                    out.qi = Math.max(0, (out.qi || 0) - delta);
                if (out._pfa)
                    delete out._pfa;
                return out;
            },
        },
        {
            id: 'heavenly_benefaction',
            name: 'Heavenly Benefaction',
            description: 'Subtle favor of the heavens improves fortune and poise.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], 2);
                safeInc(out, ['karma'], 10);
                // track a small world reputation bonus under a private field for exact reversal
                out._hbBonus = out._hbBonus || { world: 5 };
                out.reputation = { ...(out.reputation || {}), world: ((out.reputation || {}).world || 0) + 5 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], -2);
                safeInc(out, ['karma'], -10);
                const bonus = (out._hbBonus && out._hbBonus.world) || 0;
                if (bonus) {
                    const prev = ((out.reputation || {}).world) || 0;
                    out.reputation = { ...(out.reputation || {}), world: prev - bonus };
                }
                if (out._hbBonus)
                    delete out._hbBonus;
                return out;
            },
        },
        // Curated legendary background passives (handcrafted, reversible, balanced)
        {
            id: 'dragon_ancestral_endurance',
            name: 'Dragon Ancestral Endurance',
            description: 'Inherited draconic resilience increases defense and vitality.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], 6);
                safeInc(out, ['maxHp'], 50);
                // track applied values for exact reversal
                out._dragonAncestral = { def: 6, maxHp: 50 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._dragonAncestral || { def: 6, maxHp: 50 };
                safeInc(out, ['stats', 'def'], -applied.def);
                safeInc(out, ['maxHp'], -applied.maxHp);
                if (out._dragonAncestral)
                    delete out._dragonAncestral;
                if (out.hp > (out.maxHp || 0))
                    out.hp = out.maxHp || out.hp;
                return out;
            }
        },
        {
            id: 'phoenix_rebirth_aura',
            name: 'Phoenix Rebirth Aura',
            description: 'A restorative aura that slowly heals and stabilizes qi over time.',
            apply: (player) => {
                const out = { ...player };
                // heal 5 HP per aura tick (gentle but meaningful)
                const aura = (pl) => {
                    try {
                        const max = pl.maxHp || 100;
                        const heal = Math.max(2, Math.round(0.03 * (max || 150))); // ~3% or min 2
                        pl.hp = Math.min(max, (pl.hp || 0) + heal);
                        // small qi restoration as well
                        pl.qi = Math.min((pl.qi || 0) + 3, (pl.maxQi || Infinity));
                    }
                    catch (e) { /* ignore */ }
                };
                out._passiveHooks = { ...(out._passiveHooks || {}) };
                out._passiveHooks.auraTick = [...((out._passiveHooks.auraTick) || []), { id: 'phoenix_rebirth_aura', fn: aura }];
                out._phoenixRebirth = { heal: 3 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                if (out._passiveHooks && Array.isArray(out._passiveHooks.auraTick)) {
                    out._passiveHooks.auraTick = out._passiveHooks.auraTick.filter((h) => h.id !== 'phoenix_rebirth_aura');
                    if (out._passiveHooks.auraTick.length === 0)
                        delete out._passiveHooks.auraTick;
                }
                if (out._phoenixRebirth)
                    delete out._phoenixRebirth;
                if (out._passiveHooks && Object.keys(out._passiveHooks).length === 0)
                    delete out._passiveHooks;
                return out;
            }
        },
        {
            id: 'celestial_judgement_shield',
            name: 'Celestial Judgement Shield',
            description: 'Heavenly mandate steadies the body, bolstering defense and reputation.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], 5);
                safeInc(out, ['karma'], 20);
                out.reputation = { ...(out.reputation || {}), world: ((out.reputation || {}).world || 0) + 10 };
                out._cjShield = { def: 5, karma: 20, rep: 10 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._cjShield || { def: 5, karma: 20, rep: 10 };
                safeInc(out, ['stats', 'def'], -applied.def);
                safeInc(out, ['karma'], -applied.karma);
                out.reputation = { ...(out.reputation || {}), world: Math.max(0, ((out.reputation || {}).world || 0) - applied.rep) };
                if (out._cjShield)
                    delete out._cjShield;
                return out;
            }
        },
        {
            id: 'monkey_kingline_agility',
            name: 'Monkey King Agility',
            description: 'Innate simian grace increases speed and nimbleness.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'speed'], 6);
                safeInc(out, ['stats', 'atk'], 3);
                out._monkeyAgility = { speed: 6, atk: 3 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._monkeyAgility || { speed: 6, atk: 3 };
                safeInc(out, ['stats', 'speed'], -applied.speed);
                safeInc(out, ['stats', 'atk'], -applied.atk);
                if (out._monkeyAgility)
                    delete out._monkeyAgility;
                return out;
            }
        },
        {
            id: 'monkey_kingline_trickery',
            name: 'Monkey King Trickery',
            description: 'A knack for misdirection grants sharper reactions and cunning.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], 3);
                safeInc(out, ['stats', 'speed'], 2);
                out._monkeyTrick = { atk: 3, speed: 2 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._monkeyTrick || { atk: 3, speed: 2 };
                safeInc(out, ['stats', 'atk'], -applied.atk);
                safeInc(out, ['stats', 'speed'], -applied.speed);
                if (out._monkeyTrick)
                    delete out._monkeyTrick;
                return out;
            }
        },
        {
            id: 'fox_nine_charm',
            name: 'Nine-Tailed Charm',
            description: 'Sly presence bends fortune; grants social sway and a light cunning.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'atk'], 2);
                safeInc(out, ['karma'], 15);
                out.reputation = { ...(out.reputation || {}), world: ((out.reputation || {}).world || 0) + 5 };
                out._foxCharm = { atk: 2, karma: 15, rep: 5 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._foxCharm || { atk: 2, karma: 15, rep: 5 };
                safeInc(out, ['stats', 'atk'], -applied.atk);
                safeInc(out, ['karma'], -applied.karma);
                out.reputation = { ...(out.reputation || {}), world: Math.max(0, ((out.reputation || {}).world || 0) - applied.rep) };
                if (out._foxCharm)
                    delete out._foxCharm;
                return out;
            }
        },
        {
            id: 'qilin_blessing',
            name: 'Qilin Blessing',
            description: 'Auspicious aura grants fortitude and a touch of healing to the bearer.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['stats', 'def'], 4);
                out.qi = (out.qi || 0) + 8;
                out.reputation = { ...(out.reputation || {}), world: ((out.reputation || {}).world || 0) + 10 };
                out._qilinBless = { def: 4, qi: 8, rep: 10 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._qilinBless || { def: 4, qi: 8, rep: 10 };
                safeInc(out, ['stats', 'def'], -applied.def);
                out.qi = Math.max(0, (out.qi || 0) - applied.qi);
                out.reputation = { ...(out.reputation || {}), world: Math.max(0, ((out.reputation || {}).world || 0) - applied.rep) };
                if (out._qilinBless)
                    delete out._qilinBless;
                return out;
            }
        },
        {
            id: 'chelonian_stoicism',
            name: 'Chelonian Stoicism',
            description: 'Patience and steady cultivation render more endurance and fortitude.',
            apply: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                safeInc(out, ['maxHp'], 120);
                safeInc(out, ['stats', 'def'], 6);
                out._chelonianStoic = { maxHp: 120, def: 6 };
                return out;
            },
            remove: (player) => {
                const out = { ...player };
                ensureStatsObj(out);
                const applied = out._chelonianStoic || { maxHp: 120, def: 6 };
                safeInc(out, ['maxHp'], -applied.maxHp);
                safeInc(out, ['stats', 'def'], -applied.def);
                if (out._chelonianStoic)
                    delete out._chelonianStoic;
                if (out.hp > out.maxHp)
                    out.hp = out.maxHp || out.hp;
                return out;
            }
        },
    ];
    REGISTER.forEach(def => {
        if (!getPassive(def.id))
            registerPassive(def);
    });
}
catch (_e) { /* ignore */ }
// Register lightweight alignment-tag passives so ALIGNMENTS passiveTags can translate to effects
// These are intentionally mild and stack-neutral; can be tuned later.
try {
    // Scaling guidelines:
    //  - Base bonus at threshold |axis| >= 15.
    //  - Scales roughly every 25 points of relevant axis (capped at +5 total for any single passive stat).
    //  - Each passive focuses on one primary stat for clarity.
    //  - We store applied value under player._alignmentPassiveAppliedValues[id] to ensure exact removal.
    const ALIGNMENT_TAG_PASSIVES = [
        { id: 'tag_honor_bound', stat: 'attack', axis: 'virtue', scale: 25, base: 1, cap: 5 },
        { id: 'tag_sect_favored', stat: 'defense', axis: 'order', scale: 25, base: 1, cap: 4 },
        { id: 'tag_bloodthirsty', stat: 'attack', axis: 'ruthlessness', scale: 20, base: 1, cap: 6 },
        { id: 'tag_forbidden_affinity', stat: 'speed', axis: 'ruthlessness', scale: 30, base: 1, cap: 4 },
        { id: 'tag_wildcraft', stat: 'speed', axis: 'independence', scale: 25, base: 1, cap: 5 },
        { id: 'tag_unpredictable', stat: 'attack', axis: 'independence', scale: 30, base: 1, cap: 4 },
        { id: 'tag_lone_wolf', stat: 'defense', axis: 'independence', scale: 25, base: 1, cap: 5 },
        { id: 'tag_pragmatist', stat: 'attack', axis: 'order', scale: 30, base: 1, cap: 4 },
    ];
    ALIGNMENT_TAG_PASSIVES.forEach((p) => {
        if (!getPassive(p.id)) {
            registerPassive({
                id: p.id,
                name: p.id,
                description: 'Alignment-derived passive',
                apply: (player) => {
                    const out = { ...player };
                    const axes = (out.alignment && out.alignment.axes) || {};
                    const axisVal = Math.abs(axes[p.axis] || 0);
                    let bonus = 0;
                    if (axisVal >= 15) {
                        const tiers = Math.floor((axisVal - 15) / p.scale) + 1; // 15+ gives first tier
                        bonus = Math.min(p.base + (tiers - 1), p.cap);
                    }
                    if (bonus > 0) {
                        out.stats = { ...(out.stats || {}) };
                        const prev = out.stats[p.stat] || 0;
                        out.stats[p.stat] = prev + bonus;
                        out._alignmentPassiveAppliedValues = { ...(out._alignmentPassiveAppliedValues || {}) };
                        out._alignmentPassiveAppliedValues[p.id] = bonus;
                    }
                    return out;
                },
                remove: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    const appliedValues = out._alignmentPassiveAppliedValues || {};
                    const bonus = appliedValues[p.id] || 0;
                    if (bonus) {
                        const prev = out.stats[p.stat] || 0;
                        out.stats[p.stat] = prev - bonus;
                    }
                    if (out._alignmentPassiveAppliedValues) {
                        delete out._alignmentPassiveAppliedValues[p.id];
                        if (Object.keys(out._alignmentPassiveAppliedValues).length === 0)
                            delete out._alignmentPassiveAppliedValues;
                    }
                    return out;
                }
            });
        }
    });
}
catch (_e) { /* ignore */ }
// Register auto-generated background passives (created by data layer) so every background
// passive id has a lightweight implementation. These provide small, reversible stat bonuses
// and are safe no-ops if the id collides with an existing passive.
try {
    const rarityMultiplier = (rarity) => {
        // Conservative scaling: common=1, uncommon=1.25, rare=1.6, legendary=2
        switch ((rarity || '').toLowerCase()) {
            case "D": return 2.0;
            case "F": return 1.6;
            case "G": return 1.25;
            default: return 1.0;
        }
    };
    const defaultBonusForGenerated = (id, rarity) => {
        // Pick one of primary stats and a small base value, then scale by rarity.
        const seed = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        const statPick = ['atk', 'def', 'speed'][seed % 3];
        const base = 1 + (seed % 3); // 1..3
        const mult = rarityMultiplier(rarity);
        const val = Math.max(1, Math.round(base * mult));
        return { stat: statPick, val };
    };
    // Collect probable generated ids by scanning backgrounds to avoid hardcoding.
    // Lazy-require the backgrounds file to avoid circular import at module load time.
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const bgMod = require('../data/raceBackgrounds');
        const RACE_BACKGROUNDS = bgMod && bgMod.RACE_BACKGROUNDS;
        if (RACE_BACKGROUNDS && typeof RACE_BACKGROUNDS === 'object') {
            Object.keys(RACE_BACKGROUNDS).forEach((race) => {
                (RACE_BACKGROUNDS[race] || []).forEach((bg) => {
                    const passives = (bg && bg.effects && bg.effects.passives) || {};
                    Object.keys(passives).forEach((pid) => {
                        if (!getPassive(pid)) {
                            const bonus = defaultBonusForGenerated(pid, bg.rarity);
                            // Decide passive flavor by background tags
                            const tags = Array.isArray(bg.tags) ? bg.tags : [];
                            const isHealing = tags.includes('healing') || tags.includes('purification') || tags.includes('auspice');
                            const isDefensive = tags.includes('defense') || tags.includes('guardian') || tags.includes('steadfast');
                            const isOffensive = tags.includes('combat') || tags.includes('power') || tags.includes('attack');
                            const prettyName = `${bg.name || bg.id} — ${bonus.stat.toUpperCase()} Boon`;
                            const prettyDescParts = [];
                            prettyDescParts.push(`Grants +${bonus.val} ${bonus.stat.toUpperCase()} (scaled by rarity).`);
                            if (isHealing)
                                prettyDescParts.push('Also provides mild restorative aura.');
                            if (isDefensive)
                                prettyDescParts.push('Lean toward durability and defense.');
                            if (isOffensive)
                                prettyDescParts.push('Lean toward offensive power.');
                            registerPassive({
                                id: pid,
                                name: prettyName,
                                description: `Auto-generated passive for background ${bg.name || bg.id}. ${prettyDescParts.join(' ')}`,
                                apply: (player) => {
                                    const out = { ...player };
                                    out.stats = { ...(out.stats || {}) };
                                    // Apply stat/secondary bonuses
                                    if (bonus.stat === 'atk') {
                                        out.stats.atk = (out.stats.atk || 0) + bonus.val;
                                        out.stats.attack = (out.stats.attack || 0) + bonus.val;
                                        // offensive backgrounds also gain a small qi or hp boost
                                        if (isOffensive)
                                            out.qi = (out.qi || 0) + Math.max(1, Math.round(bonus.val * 2));
                                    }
                                    else if (bonus.stat === 'def') {
                                        out.stats.def = (out.stats.def || 0) + bonus.val;
                                        out.stats.defense = (out.stats.defense || 0) + bonus.val;
                                        if (isDefensive)
                                            out.maxHp = Math.max((out.maxHp || 0), (out.maxHp || 0) + Math.round(bonus.val * 10));
                                    }
                                    else if (bonus.stat === 'speed') {
                                        out.stats.speed = (out.stats.speed || 0) + bonus.val;
                                        out.stats.agility = (out.stats.agility || 0) + bonus.val;
                                        // speed can also slightly increase ap or similar (we use ap if present)
                                        out.ap = (out.ap || 0);
                                    }
                                    // Optional healing aura: attach auraTick hook that heals small amount
                                    if (isHealing) {
                                        const healVal = Math.max(1, Math.round(bonus.val));
                                        const auraFn = (pl) => {
                                            try {
                                                const max = pl.maxHp || 100;
                                                pl.hp = Math.min(max, (pl.hp || 0) + healVal);
                                            }
                                            catch (e) { /* ignore */ }
                                        };
                                        out._passiveHooks = { ...(out._passiveHooks || {}) };
                                        out._passiveHooks.auraTick = [...((out._passiveHooks.auraTick) || []), { id: pid, fn: auraFn }];
                                        // store the hook so we can remove it exactly
                                        out._generatedPassiveApplied = { ...(out._generatedPassiveApplied || {}), [pid]: { ...bonus, hook: true } };
                                    }
                                    else {
                                        out._generatedPassiveApplied = { ...(out._generatedPassiveApplied || {}), [pid]: bonus };
                                    }
                                    return out;
                                },
                                remove: (player) => {
                                    const out = { ...player };
                                    out.stats = { ...(out.stats || {}) };
                                    const applied = (out._generatedPassiveApplied || {})[pid] || bonus;
                                    if (applied.stat === 'atk') {
                                        out.stats.atk = (out.stats.atk || 0) - applied.val;
                                        out.stats.attack = (out.stats.attack || 0) - applied.val;
                                        if (isOffensive)
                                            out.qi = Math.max(0, (out.qi || 0) - Math.max(1, Math.round(applied.val * 2)));
                                    }
                                    else if (applied.stat === 'def') {
                                        out.stats.def = (out.stats.def || 0) - applied.val;
                                        out.stats.defense = (out.stats.defense || 0) - applied.val;
                                        if (isDefensive) {
                                            // best-effort: reduce maxHp but avoid negative
                                            const dec = Math.round(applied.val * 10);
                                            out.maxHp = Math.max(0, (out.maxHp || 0) - dec);
                                            if (out.hp > out.maxHp)
                                                out.hp = out.maxHp;
                                        }
                                    }
                                    else if (applied.stat === 'speed') {
                                        out.stats.speed = (out.stats.speed || 0) - applied.val;
                                        out.stats.agility = (out.stats.agility || 0) - applied.val;
                                    }
                                    // Remove auraTick hook if present
                                    if (out._passiveHooks && Array.isArray(out._passiveHooks.auraTick)) {
                                        out._passiveHooks.auraTick = out._passiveHooks.auraTick.filter((h) => h.id !== pid);
                                        if (out._passiveHooks.auraTick.length === 0)
                                            delete out._passiveHooks.auraTick;
                                    }
                                    if (out._generatedPassiveApplied) {
                                        delete out._generatedPassiveApplied[pid];
                                        if (Object.keys(out._generatedPassiveApplied).length === 0)
                                            delete out._generatedPassiveApplied;
                                    }
                                    return out;
                                }
                            });
                        }
                    });
                });
            });
        }
    }
    catch (e) {
        // if backgrounds can't be required (rare), skip gracefully
    }
}
catch (e) { /* ignore */ }
// Developer seed passives: register simple reversible passives from data/passives/seed_passives.json
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedPassives = require('../../data/passives/seed_passives.json');
    if (Array.isArray(seedPassives)) {
        seedPassives.forEach((p) => {
            if (!p || !p.id)
                return;
            if (getPassive(p.id))
                return;
            const delta = p.delta || 1;
            const stat = (p.stat || 'atk');
            registerPassive({
                id: p.id,
                name: p.name || p.id,
                description: p.description || '',
                apply: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    out.stats[stat] = (out.stats[stat] || 0) + delta;
                    return out;
                },
                remove: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    out.stats[stat] = Math.max(0, (out.stats[stat] || 0) - delta);
                    return out;
                }
            });
        });
    }
}
catch (e) { /* ignore missing seed passives */ }
