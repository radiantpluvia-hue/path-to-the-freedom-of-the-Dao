"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eraManager = void 0;
const eraGenerator_1 = require("./eraGenerator");
const default_eras_json_1 = __importDefault(require("../../data/eras/default_eras.json"));
// SaveLoadSystem import is intentionally dynamic/optional in some environments; bypass restricted-imports rule here
// eslint-disable-next-line no-restricted-imports
const SaveLoadSystem_1 = require("@/systems/SaveLoadSystem");
function deepClone(v) { return JSON.parse(JSON.stringify(v)); }
function mergeModifiers(target, mod) {
    if (!target.modifiers)
        target.modifiers = {};
    // Merge by override; leave interpretation (multipliers) to systems using normalized layer
    target.modifiers.qiDensity = mod.qiDensity;
    target.modifiers.demonicQi = mod.demonicQi;
    target.modifiers.holyQi = mod.holyQi;
    target.modifiers.sectCorruptionRate = mod.sectCorruptionRate;
    target.modifiers.artifactDensity = mod.artifactDensity;
    target.modifiers.eventBias = deepClone(mod.eventBias);
    target.modifiers.tribulationSeverity = mod.tribulationSeverity;
}
function findTemplateById(id) {
    return default_eras_json_1.default.find(e => e.id === id);
}
function latestDefinedIndex() {
    return default_eras_json_1.default.reduce((m, e) => Math.max(m, e.index), -1);
}
exports.eraManager = {
    generate(options = {}) {
        const template = options.templateId ? findTemplateById(options.templateId) : default_eras_json_1.default[0];
        if (!template)
            throw new Error('Era template not found');
        return (0, eraGenerator_1.generateEraFromTemplate)(template, { seed: options.seed, playerId: options.playerId, reincarnationCount: options.reincarnationCount, index: options.index ?? template.index });
    },
    applyEra(era, worldState, story) {
        // Persist current era id/index on world
        worldState.currentEraId = era.id;
        worldState.currentEraIndex = era.index;
        worldState.currentEraSeed = era.generatedSeed;
        mergeModifiers(worldState, era.modifiers);
        // Seed factions minimally
        if (!worldState.factions)
            worldState.factions = {};
        for (const f of era.startingFactions) {
            worldState.factions[f.id] = { type: f.type, influence: f.influence };
        }
        // Push unique events into a world pool flag; StorySystem may later consume
        if (!worldState.flags)
            worldState.flags = {};
        const pool = Array.isArray(worldState.eventPool) ? worldState.eventPool : [];
        worldState.eventPool = Array.from(new Set([...pool, ...era.uniqueEvents]));
        // Optional: expose normalized modifiers for per-tick systems
        worldState.eraNormalized = {
            qiDensityNorm: era.modifiers.qiDensity / 10000,
            artifactDensityNorm: era.modifiers.artifactDensity / 100
        };
        // Attach bias for consumers selecting events
        worldState.eventBias = deepClone(era.modifiers.eventBias);
        if (story) {
            // Provide available mentors hint for UI/system use
            story.availableMentors = Array.from(new Set([...(story.availableMentors || []), ...era.availableMentors]));
        }
    },
    snapshotAndUnapply(gs) {
        const snap = { world: deepClone(gs.world), story: deepClone(gs.story) };
        // Clear era-specific fields in world to simulate unapply during tests
        const w = gs.world;
        delete w.currentEraId;
        delete w.currentEraIndex;
        delete w.currentEraSeed;
        delete w.eraNormalized;
        delete w.eventBias;
        // Don't touch unrelated keys
        return snap;
    },
    reincarnateToIndex(gs, targetIndex, seed) {
        const currentIndex = gs.world.currentEraIndex ?? 0;
        if (targetIndex < currentIndex)
            throw new Error('Cannot reincarnate into an earlier era');
        const tpl = default_eras_json_1.default.find(e => e.index === targetIndex) || default_eras_json_1.default[default_eras_json_1.default.length - 1];
        const era = this.generate({ templateId: tpl.id, seed, index: targetIndex, playerId: String(gs.player.id || gs.player.name || 'player'), reincarnationCount: (gs.player.reincarnationCount || 0) + 1 });
        try {
            SaveLoadSystem_1.SaveLoadSystem.saveGame(gs);
        }
        catch { /* best-effort */ }
        gs.player.previousLives = Array.isArray(gs.player.previousLives) ? gs.player.previousLives : [];
        const lifeNum = (gs.player.previousLives.length || 0) + 1;
        gs.player.previousLives.push({ lifeNum, eraId: era.id, eraIndex: era.index, fateSummary: 'Reincarnated', seed: era.generatedSeed });
        this.applyEra(era, gs.world, gs.story);
    },
    attemptReincarnation(gs, options) {
        const currentIndex = gs.world.currentEraIndex ?? 0;
        const lastIndex = latestDefinedIndex();
        let targetIndex = currentIndex;
        // targetTemplateId intentionally unused in current flow; kept for future extension
        if (options.nextEra) {
            targetIndex = currentIndex + 1;
            if (targetIndex > lastIndex) {
                // For now, clamp to last defined; a future appendProceduralEra() could extend
                targetIndex = lastIndex;
            }
            // template lookup retained for potential future use
        }
        else if (options.randomFuture) {
            if (currentIndex >= lastIndex) {
                targetIndex = lastIndex;
            }
            else {
                const choices = default_eras_json_1.default.filter(e => e.index > currentIndex);
                const pick = choices[Math.floor(Math.random() * choices.length)];
                targetIndex = pick.index;
            }
        }
        else if (options.sameEra) {
            // keep same template id, same index
            targetIndex = currentIndex;
        }
        if (targetIndex < currentIndex) {
            throw new Error('Cannot reincarnate into an earlier era');
        }
        this.reincarnateToIndex(gs, targetIndex, options.seed);
    },
    reseedEra(eraId, seed, ctx = {}) {
        const template = findTemplateById(eraId);
        if (!template)
            throw new Error('Template not found');
        return (0, eraGenerator_1.generateEraFromTemplate)(template, { seed, playerId: ctx.playerId, reincarnationCount: ctx.reincarnationCount, index: template.index });
    },
    appendProceduralEra(_archetype) {
        const nextIndex = latestDefinedIndex() + 1;
        const base = {
            id: `era_proc_${nextIndex}`,
            name: `Procedural Era ${nextIndex}`,
            index: nextIndex,
            description: 'A procedurally generated era.',
            seedHint: 'procedural',
            modifiers: { qiDensity: 500000, demonicQi: 200000, holyQi: 300000, sectCorruptionRate: 3000, eventBias: { dark: 0.33, neutral: 0.34, light: 0.33 }, tribulationSeverity: 0.5, artifactDensity: 2000 },
            startingFactions: [],
            uniqueEvents: [],
            availableMentors: []
        };
        return (0, eraGenerator_1.generateEraFromTemplate)(base, { seed: `${Date.now()}`, index: nextIndex });
    }
};
