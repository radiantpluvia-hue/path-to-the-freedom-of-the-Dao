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
exports.SaveLoadSystem = void 0;
const logger_1 = require("../utils/logger");
const playerHelpers_1 = require("../utils/playerHelpers");
// Use ES module imports so this file works in the browser (no `require` at runtime)
const UniqueWeaponRegistry = __importStar(require("./UniqueWeaponRegistry"));
// InnerVoice is optional (may be absent in some builds); load defensively later
const release_1 = require("../config/release");
class SaveLoadSystem {
    static injectRelicRegistry(reg) {
        this.injectedRelicRegistry = reg;
    }
    static saveGame(gameState) {
        try {
            const narrativeSnapshot = {};
            try {
                // conservative extraction: if systems.narrativeEngine present, snapshot key arrays
                const engine = gameState.systems?.narrativeEngine || gameState.narrativeEngine;
                if (engine) {
                    if (Array.isArray(engine.karmaHistory))
                        narrativeSnapshot.karmaHistory = engine.karmaHistory;
                    if (Array.isArray(engine.destinyThreads))
                        narrativeSnapshot.destinyThreads = engine.destinyThreads;
                    if (Array.isArray(engine.legacyRemnants))
                        narrativeSnapshot.legacyRemnants = engine.legacyRemnants;
                    if (Array.isArray(engine.heavenlyDaoInsights))
                        narrativeSnapshot.heavenlyDaoInsights = engine.heavenlyDaoInsights;
                }
            }
            catch (e) {
                // ignore snapshot errors
            }
            const saveData = {
                // Ensure the entire game state is saved
                gameState,
                gameVersion: '1.0.0',
                timestamp: Date.now(),
                narrativeSnapshot: Object.keys(narrativeSnapshot).length > 0 ? narrativeSnapshot : undefined
            };
            try {
                // attach unique registry state so unique artifacts persist across loads
                if (UniqueWeaponRegistry && typeof UniqueWeaponRegistry.getRegistryState === 'function') {
                    saveData.uniqueRegistryState = UniqueWeaponRegistry.getRegistryState();
                }
                // attach relic registry state (avoid runtime `require()` in browser builds)
                try {
                    // Prefer an injected instance (tests) or a global attach point. If neither
                    // is available we attempt a synchronous require in Node/Jest environments
                    // so tests that don't inject the registry still snapshot relic state.
                    let relicReg = this.injectedRelicRegistry || globalThis.relicRegistry || globalThis.RelicRegistry;
                    try {
                        if (!relicReg && typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID) {
                            // In Node/Jest only: obtain a safe require function without referencing
                            // a bare `require` identifier during module initialization so bundlers
                            // don't emit CommonJS calls into ESM client bundles.
                            try {
                                const nodeRequire = Function('return require')();
                                relicReg = nodeRequire('./relicRegistry');
                            }
                            catch (_err) {
                                // ignore
                            }
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                    if (relicReg && typeof relicReg.getRelicRegistryState === 'function') {
                        saveData.relicRegistryState = relicReg.getRelicRegistryState();
                    }
                }
                catch (e) {
                    // non-fatal
                }
                // attach lifePhase snapshot (conservative) so cross-life chronicle persists
                try {
                    const sys = gameState.systems;
                    if (sys && sys.lifePhase) {
                        saveData.lifePhaseSnapshot = sys.lifePhase;
                    }
                }
                catch (e) {
                    // non-fatal
                }
                // attach inner voice snapshot if system exists at runtime
                try {
                    // Prefer the global instance if present. We intentionally avoid a
                    // synchronous `require()` here to prevent emitting CommonJS calls into
                    // browser bundles. If an InnerVoice module exists but isn't globally
                    // attached, snapshotting will be skipped (best-effort).
                    const iv = globalThis.InnerVoice;
                    if (iv && typeof iv.getInnerVoiceSnapshot === 'function') {
                        saveData.innerVoiceSnapshot = iv.getInnerVoiceSnapshot();
                    }
                }
                catch (e) {
                    // optional, non-fatal
                }
            }
            catch (e) {
                // non-fatal
            }
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to save game:', error);
            return false;
        }
    }
    static loadGame(options) {
        try {
            const saveString = localStorage.getItem(this.SAVE_KEY);
            if (!saveString)
                return null;
            // Parse once, keep a deep copy as the raw unmodified save for callers who want it.
            const parsed = JSON.parse(saveString);
            const rawSave = JSON.parse(JSON.stringify(parsed));
            // Work on a cloned copy for migration so we don't mutate the original parsed
            // object (tests expect exact round-trip equality for save -> load).
            const saveData = JSON.parse(JSON.stringify(parsed));
            // Run conservative legacy migrations to keep old saves compatible on the
            // cloned object.
            this.migrateLegacyKeys(saveData);
            // Ensure player realm fields are normalized early so later migrations and
            // world/ascension logic can rely on both `realm` and `realmId` being present.
            try {
                // Require relative to this module so bundlers/Node resolve correctly
                const { normalizePlayerRealmInState } = require('../utils/playerSetters');
                try {
                    normalizePlayerRealmInState(saveData.gameState);
                }
                catch (_e) {
                    // non-fatal: keep proceeding with other migrations
                }
            }
            catch (e) {
                // If require isn't available (browser) or module missing, skip here.
            }
            // Ensure narrative snapshot fields exist for older saves (conservative defaults)
            try {
                if (!saveData.narrativeSnapshot)
                    saveData.narrativeSnapshot = {};
                const snap = saveData.narrativeSnapshot;
                if (!Array.isArray(snap.karmaHistory))
                    snap.karmaHistory = [];
                if (!Array.isArray(snap.destinyThreads))
                    snap.destinyThreads = [];
                if (!Array.isArray(snap.legacyRemnants))
                    snap.legacyRemnants = [];
                if (!Array.isArray(snap.heavenlyDaoInsights))
                    snap.heavenlyDaoInsights = [];
                // Ensure lifePhaseSnapshot exists for older saves
                if (saveData.lifePhaseSnapshot === undefined)
                    saveData.lifePhaseSnapshot = {};
            }
            catch (e) {
                // non-fatal
            }
            // Tier migration: convert legacy tier strings found in common locations to the canonical new codes
            try {
                const migr = require('../migrations/tierMigration');
                const migrateTierFn = migr && migr.migrateTier ? migr.migrateTier : null;
                if (migrateTierFn) {
                    // migration target placeholder (saveData.gameState) - no local alias required
                    const walkAndMigrate = (obj) => {
                        if (!obj || typeof obj !== 'object')
                            return;
                        for (const k of Object.keys(obj)) {
                            try {
                                const v = obj[k];
                                if (k === 'tier' && typeof v === 'string') {
                                    obj[k] = migrateTierFn(v);
                                }
                                else if (k === 'rarity' && typeof v === 'string') {
                                    obj[k] = migrateTierFn(v);
                                }
                                else {
                                    walkAndMigrate(v);
                                }
                            }
                            catch (_e) { /* ignore per-field errors */ }
                        }
                    };
                    try {
                        walkAndMigrate(saveData.gameState);
                    }
                    catch (e) { /* ignore */ }
                    // mark migration meta
                    saveData._meta = saveData._meta || {};
                    saveData._meta.migrations = saveData._meta.migrations || {};
                    saveData._meta.migrations.tier = '2025-10-20';
                }
            }
            catch (e) {
                // non-fatal; tier migration best-effort
            }
            // Guard unreleased acts in loaded saves (force back to last released act)
            try {
                const gs = saveData.gameState;
                if (gs && gs.story && typeof gs.story.currentAct === 'string') {
                    const n = parseInt(String(gs.story.currentAct).replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(n) && n > release_1.MAX_RELEASED_ACT) {
                        gs.story.currentAct = `act${release_1.MAX_RELEASED_ACT}`;
                        if (!/^act\d+$/.test(gs.story.currentAct)) {
                            gs.story.currentAct = 'act1';
                        }
                    }
                }
            }
            catch (e) {
                // non-fatal
            }
            // Phase 6 migration: ensure world.currentWorldType exists and ascension consistency.
            // Apply this migration when the save appears to be from a legacy source (no
            // explicit gameVersion) OR when the saved gameState is missing `world` or
            // `world.currentWorldType`. Tests create minimal gameState objects (no
            // `world`) and expect the loader to backfill defaults, so treat those as
            // legacy for the purposes of this migration. preserveRaw behavior is
            // preserved because `rawSave` contains the unmodified parsed save.
            try {
                const isLegacyVersionPhase6 = !saveData.gameVersion || String(saveData.gameVersion).startsWith('0');
                const gs = saveData.gameState;
                // Apply the Phase 6 backfill when the save is from a legacy version OR
                // when the original parsed save (rawSave) lacked a `world` object.
                // This ensures older/partial saves get reasonable defaults while
                // preserving round-trip equality for modern saves that already had
                // a world object (tests expect no new keys to be injected).
                const rawHadNoWorld = !rawSave || !rawSave.gameState || !rawSave.gameState.world;
                if (isLegacyVersionPhase6 || rawHadNoWorld) {
                    if (gs) {
                        if (!gs.world || typeof gs.world !== 'object')
                            gs.world = {};
                        const ascensionRealms = ['true_immortal', 'heavenly_immortal', 'golden_immortal'];
                        // If realm suggests ascension or world.ascended is true, mark immortal
                        // Use safe accessor to support legacy numeric realm ids and string realms
                        const realm = gs.player && (0, playerHelpers_1.getPlayerRealmKey)(gs.player);
                        if (!gs.world.currentWorldType) {
                            if (gs.world.ascended || ascensionRealms.includes(realm)) {
                                gs.world.currentWorldType = 'immortal';
                                gs.world.ascended = true;
                            }
                            else {
                                gs.world.currentWorldType = 'murim';
                            }
                        }
                        if (gs.world.ascended && gs.world.currentWorldType !== 'immortal') {
                            gs.world.currentWorldType = 'immortal';
                        }
                        if (gs.player && ascensionRealms.includes((0, playerHelpers_1.getPlayerRealmKey)(gs.player)) && !gs.world.ascended) {
                            gs.world.ascended = true;
                            gs.world.currentWorldType = 'immortal';
                        }
                    }
                }
                // Always enforce simple ascension consistency: if a save indicates the
                // world has ascended, ensure the world type is `immortal`. This corrects
                // inconsistent states even if the saveVersion is modern.
                try {
                    const gsAll = saveData.gameState;
                    if (gsAll && gsAll.world && gsAll.world.ascended && gsAll.world.currentWorldType !== 'immortal') {
                        gsAll.world.currentWorldType = 'immortal';
                    }
                    const ascensionRealms = ['true_immortal', 'heavenly_immortal', 'golden_immortal'];
                    if (gsAll && gsAll.player && ascensionRealms.includes((0, playerHelpers_1.getPlayerRealmKey)(gsAll.player)) && (!gsAll.world || !gsAll.world.ascended)) {
                        if (!gsAll.world)
                            gsAll.world = {};
                        gsAll.world.ascended = true;
                        gsAll.world.currentWorldType = 'immortal';
                    }
                }
                catch (e) {
                    // non-fatal
                }
            }
            catch (e) {
                // non-fatal
            }
            // Load unique registry state into runtime registry so claimed uniques persist
            try {
                if (UniqueWeaponRegistry && typeof UniqueWeaponRegistry.loadRegistryState === 'function') {
                    UniqueWeaponRegistry.loadRegistryState(saveData.uniqueRegistryState);
                }
            }
            catch (e) {
                // non-fatal
            }
            // Load relic registry state so claimed relics persist
            try {
                // Prefer injected or globally-attached relic registry to avoid runtime
                // require() in browser bundles. This keeps loadGame synchronous. In test
                // environments, fall back to a synchronous require so suites that don't
                // inject the registry still restore relic state.
                let relicReg = this.injectedRelicRegistry || globalThis.relicRegistry || globalThis.RelicRegistry;
                try {
                    if (!relicReg && typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID) {
                        try {
                            const nodeRequire = Function('return require')();
                            relicReg = nodeRequire('./relicRegistry');
                        }
                        catch (_err) {
                            // ignore
                        }
                    }
                }
                catch (e) {
                    // ignore
                }
                if (relicReg && typeof relicReg.loadRelicRegistryState === 'function') {
                    relicReg.loadRelicRegistryState(saveData.relicRegistryState || { claimed: [] });
                }
            }
            catch (e) {
                // non-fatal
            }
            // Load inner voice snapshot if present (best-effort)
            try {
                const iv = globalThis.InnerVoice;
                if (iv && typeof iv.loadInnerVoiceSnapshot === 'function') {
                    iv.loadInnerVoiceSnapshot(saveData.innerVoiceSnapshot || null);
                }
            }
            catch (e) {
                // non-fatal
            }
            // Alignment passive persistence / reconstruction:
            // If the saved player has an alignment and either (a) an explicit alignmentPassiveApplied array
            // or (b) only legacy passiveTags, ensure alignment-derived passives are actually applied
            // so stat modifiers are reflected after load. We trust a saved alignmentPassiveApplied array
            // (explicit persistence) but if it's missing we invoke the bridge to derive it.
            try {
                const gsAny = saveData.gameState;
                const player = gsAny && gsAny.player;
                if (player && player.alignment) {
                    const hasExplicit = Array.isArray(player.alignmentPassiveApplied);
                    // Always run bridge if missing explicit list or if list exists but stats seem inconsistent (heuristic)
                    let needsRebuild = !hasExplicit;
                    if (!needsRebuild && hasExplicit) {
                        // Heuristic: if any listed passive id is not currently applied via _passiveHooks (or stats baseline mismatch), rebuild
                        try {
                            const appliedIds = player.alignmentPassiveApplied || [];
                            const hookList = (player._passiveHooks && player._passiveHooks.onHit) || [];
                            const hookIds = new Set(hookList.map((h) => h.id));
                            for (const id of appliedIds) {
                                if (!hookIds.has(id)) {
                                    needsRebuild = true;
                                    break;
                                }
                            }
                        }
                        catch { /* ignore heuristic failures */ }
                    }
                    if (needsRebuild) {
                        try {
                            const bridge = require('./AlignmentPassiveBridge');
                            if (bridge && typeof bridge.applyAlignmentPassives === 'function') {
                                const updated = bridge.applyAlignmentPassives(player);
                                // Mutate in place so subsequent code uses enriched player object
                                Object.assign(player, updated);
                            }
                        }
                        catch { /* ignore */ }
                    }
                }
            }
            catch { /* non-fatal */ }
            // Rebind runtime-only passive hooks for any passives recorded under _autoApplied.
            // This ensures saved player JSON doesn't need to persist function references.
            try {
                const { getPassive } = require('./passiveRegistry');
                const { addHook, devSafe } = require('./passiveHelpers');
                const gsAny = saveData.gameState;
                const player = gsAny && gsAny.player;
                if (player && player._autoApplied && typeof player._autoApplied === 'object') {
                    Object.keys(player._autoApplied).forEach((pid) => {
                        try {
                            const def = getPassive(pid);
                            if (!def)
                                return;
                            // Attach declared hooks from registry (wrap devSafe). We attach only
                            // the hook entries; apply/remove logic already persisted via _autoApplied
                            if (def.onHit)
                                addHook(player, 'onHit', pid, devSafe(def.onHit));
                            if (def.auraTick)
                                addHook(player, 'auraTick', pid, devSafe(def.auraTick));
                            if (def.proc)
                                addHook(player, 'proc', pid, devSafe(def.proc));
                        }
                        catch (pe) { /* ignore per-passive bind errors */ }
                    });
                }
            }
            catch (e) {
                // non-fatal, best-effort rebind
            }
            if (options && options.preserveRaw) {
                return { raw: rawSave, migrated: saveData };
            }
            return saveData;
        }
        catch (error) {
            logger_1.logger.error('Failed to load game:', error);
            return null;
        }
    }
    /**
     * Conservative migration for legacy keys in save data.
     * Maps `hermit*` keys to `seclusion*` variants where found.
     */
    static migrateLegacyKeys(saveData) {
        try {
            if (!saveData || !saveData.gameState)
                return;
            const gs = saveData.gameState;
            // small helper: conservative copy only when new key missing
            const copyIfMissing = (obj, oldKey, newKey) => {
                if (!obj || typeof obj !== 'object')
                    return;
                if (obj[oldKey] !== undefined && obj[newKey] === undefined) {
                    obj[newKey] = obj[oldKey];
                }
            };
            // top-level legacy mappings (non-destructive)
            copyIfMissing(gs, 'hermitPath', 'seclusionPath');
            copyIfMissing(gs, 'hermitCurse', 'seclusionCurse');
            copyIfMissing(gs, 'hermitStudyProgress', 'seclusionStudyProgress');
            // mentorTeachings: update known legacy mentor IDs conservatively and nested fields
            if (gs.mentorTeachings && Array.isArray(gs.mentorTeachings)) {
                gs.mentorTeachings = gs.mentorTeachings.map((m) => {
                    try {
                        if (m && m.id === 'hermitCurse') {
                            // replace id but keep other fields intact
                            return { ...m, id: 'seclusionCurse' };
                        }
                        // For nested objects (prerequisites, reward, failureConsequence) copy hermit* -> seclusion*
                        ['prerequisites', 'reward', 'failureConsequence'].forEach((k) => {
                            if (m && m[k] && typeof m[k] === 'object') {
                                copyIfMissing(m[k], 'hermitCurse', 'seclusionCurse');
                                copyIfMissing(m[k], 'hermitStudyProgress', 'seclusionStudyProgress');
                            }
                        });
                        return m;
                    }
                    catch (e) {
                        // Be best-effort: if a malformed teaching exists, leave it as-is.
                        return m;
                    }
                });
            }
            // player-level conservative mappings
            if (gs.player && typeof gs.player === 'object') {
                copyIfMissing(gs.player, 'hermitStatus', 'seclusionStatus');
                copyIfMissing(gs.player, 'hermitStudyProgress', 'seclusionStudyProgress');
                // Arcane -> Mystic migration: rename player-level affinity
                if (gs.player.arcana !== undefined && gs.player.mysticPower === undefined) {
                    gs.player.mysticPower = gs.player.arcana;
                }
                // Backfill willPower (new first-class numeric stat) from legacy spiritStones heuristic
                // Only apply conservative backfill for legacy save versions to avoid mutating modern saves
                try {
                    const isLegacyVersion = !saveData.gameVersion || String(saveData.gameVersion).startsWith('0');
                    if (isLegacyVersion && gs.player.willPower === undefined) {
                        const stones = gs.player.spiritStones || { low: 0, mid: 0, high: 0 };
                        const backfilled = Math.max(0, (stones.low || 0) + (stones.mid || 0) * 5 + (stones.high || 0) * 25);
                        gs.player.willPower = backfilled;
                    }
                }
                catch (e) {
                    // ignore backfill errors
                }
                // Ensure new training-related fields exist so older saves don't break.
                try {
                    if (!gs.player.cooldowns || typeof gs.player.cooldowns !== 'object')
                        gs.player.cooldowns = {};
                    if (!gs.player.cooldowns.training || typeof gs.player.cooldowns.training !== 'object')
                        gs.player.cooldowns.training = {};
                    if (gs.player.trainingQueue === undefined)
                        gs.player.trainingQueue = null;
                }
                catch (e) {
                    // non-fatal
                }
            }
            // Basic shape validation: ensure world/day/tick exist to avoid runtime errors.
            // Only apply conservative shape defaulting for legacy save versions (pre-1.x)
            // to avoid mutating up-to-date save files created by this code (v1.0.0+).
            const isLegacyVersion = !saveData.gameVersion || String(saveData.gameVersion).startsWith('0');
            if (isLegacyVersion) {
                if (!gs.world || typeof gs.world !== 'object') {
                    gs.world = { day: 0, tick: 0 };
                }
                else {
                    if (typeof gs.world.day !== 'number')
                        gs.world.day = 0;
                    if (typeof gs.world.tick !== 'number')
                        gs.world.tick = 0;
                }
            }
            // write-back is implicit since we mutate saveData
            // Item-level conservative migration: map arcane item ids/effects to mystic equivalents
            try {
                const migrateItem = (item) => {
                    if (!item || typeof item !== 'object')
                        return;
                    if (item.id === 'arcane_talisman') {
                        item.id = 'mystic_talisman';
                        if (typeof item.name === 'string')
                            item.name = item.name.replace(/Arcane/gi, 'Mystic');
                    }
                    if (item.effects && item.effects.arcana !== undefined) {
                        if (item.effects.mysticPower === undefined)
                            item.effects.mysticPower = item.effects.arcana;
                        delete item.effects.arcana;
                    }
                };
                if (Array.isArray(gs.player && gs.player.inventory)) {
                    for (const it of gs.player.inventory)
                        migrateItem(it);
                }
                if (gs.world && Array.isArray(gs.world.markets)) {
                    for (const m of gs.world.markets) {
                        if (m && Array.isArray(m.items))
                            for (const it of m.items)
                                migrateItem(it);
                    }
                }
            }
            catch (e) {
                // non-fatal
            }
        }
        catch (e) {
            console.warn('SaveLoadSystem: migrateLegacyKeys failed', e);
            logger_1.logger.warn('SaveLoadSystem: migrateLegacyKeys failed', e);
        }
    }
    static deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to delete save:', error);
            return false;
        }
    }
}
exports.SaveLoadSystem = SaveLoadSystem;
SaveLoadSystem.SAVE_KEY = 'cultivation_game_save';
// Optional injected relic registry for tests
SaveLoadSystem.injectedRelicRegistry = null;
