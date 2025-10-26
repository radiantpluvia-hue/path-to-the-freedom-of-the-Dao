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
exports.LifeArcSystem = void 0;
// Prefer ESM imports for modules that are safe in the browser build. Node-only modules
// (fs/path) are loaded dynamically inside server-only guards so bundlers don't
// include them in client bundles.
const cultivationRealms_1 = require("../data/cultivationRealms");
const realmHelpersLoader_1 = require("../utils/realmHelpersLoader");
const logger_1 = require("../utils/logger");
/**
 * LifeArcSystem is an incremental replacement for the older Acts-based StorySystem.
 * It supports freeform, procedurally-evolving arcs, procedural opportunity generation,
 * and evolving honor/titles. This implementation is intentionally lightweight and
 * provides an adapter-compatible surface so existing code depending on StorySystem
 * can keep working during migration.
 */
class LifeArcSystem {
    constructor() {
        this.arcs = new Map();
        this.activeEvents = new Map();
        this.diagnostics = {
            totalChecked: 0,
            filtered: 0,
            reasons: { worldType: 0, minRealm: 0, maxRealm: 0 },
            samples: { worldType: [], minRealm: [], maxRealm: [] },
            sampleCap: 10
        };
        // Try to load legacy acts JSON (Node-only) and convert them to LifeArc entries.
        // Use a dynamic import inside a server-only guard so bundlers won't include
        // Node-only modules (fs/path) in browser builds.
        if (typeof window === 'undefined') {
            (async () => {
                try {
                    const storyMod = await Promise.resolve().then(() => __importStar(require('@/utils/storyLoader')));
                    const loadActsFromJson = (storyMod && (storyMod.loadActsFromJson || storyMod.default && storyMod.default.loadActsFromJson));
                    if (!loadActsFromJson)
                        return;
                    // Use runtime require for Node built-ins without the literal eval token so bundlers don't warn
                    const nodeRequire = (typeof window === 'undefined' && typeof require === 'function') ? Function('return require')() : null;
                    const pathMod = nodeRequire ? nodeRequire('path') : null;
                    const rootDir = pathMod ? pathMod.resolve(__dirname, '../../') : undefined;
                    const loadedActs = await loadActsFromJson(rootDir).catch(() => null);
                    if (loadedActs && loadedActs.size > 0) {
                        for (const [id, act] of loadedActs.entries()) {
                            const arc = {
                                id: id.replace(/^act/, 'arc') || id,
                                title: act.title || act.id || `Arc ${id}`,
                                description: act.description || '',
                                mainQuests: act.mainQuests || [],
                                sideQuests: act.sideQuests || [],
                                events: act.events || [],
                                unlockConditions: act.unlockConditions || undefined
                            };
                            // Preserve legacy act id mapping by also storing under the original act id
                            this.arcs.set(arc.id, arc);
                            this.arcs.set(id, arc);
                        }
                        return;
                    }
                }
                catch (err) {
                    // Non-fatal: fall back to a default arc
                    logger_1.logger.warn('LifeArcSystem: failed to load legacy acts for migration', err);
                }
            })();
        }
        // Initialize a simple default arc to preserve compatibility with existing saves.
        const defaultArc = {
            id: 'arc1',
            title: 'Early Life',
            description: 'Your formative years and initial opportunities',
            mainQuests: [],
            sideQuests: [],
            events: []
        };
        this.arcs.set(defaultArc.id, defaultArc);
    }
    // Compatibility: returns the arc matching story.currentAct (treating the act id as an arc id)
    getCurrentArc(gameState) {
        return this.arcs.get(gameState.story.currentAct) || null;
    }
    getPersonalizedArc(gameState) {
        // For now reuse getCurrentArc; in future we can merge procedural events and titles
        const base = this.getCurrentArc(gameState);
        if (!base)
            return null;
        // shallow clone to avoid accidental mutation
        return JSON.parse(JSON.stringify(base));
    }
    // Adapter-friendly methods matching StorySystem naming where practical
    getCurrentAct(gameState) {
        return this.getCurrentArc(gameState);
    }
    getPersonalizedAct(gameState) {
        return this.getPersonalizedArc(gameState);
    }
    getActiveQuests(gameState) {
        const arc = this.getCurrentArc(gameState);
        if (!arc)
            return [];
        return [...arc.mainQuests, ...arc.sideQuests].filter(q => q.status === 'active');
    }
    getAvailableEvents(gameState) {
        const arc = this.getCurrentArc(gameState);
        if (!arc)
            return [];
        const rawEvents = arc.events || [];
        // Phase 1 world / realm gating for LifeArc events (assumes events may carry same metadata fields)
        const gated = rawEvents.filter(evt => {
            this.diagnostics.totalChecked++;
            try {
                const currentWorldType = gameState.world.currentWorldType || 'murim';
                const { worldTypes, minRealm, maxRealm } = evt;
                const realmIndex = (r) => r ? cultivationRealms_1.REALM_ORDER.indexOf(r) : -1;
                // Use realm key helper if available
                let playerRealmKey = gameState.player.realm;
                if (!playerRealmKey || typeof playerRealmKey !== 'string') {
                    playerRealmKey = (0, realmHelpersLoader_1.getRealmKeyFromPlayerSync)(gameState.player);
                }
                const playerIdx = realmIndex(playerRealmKey);
                if (minRealm) {
                    const minIdx = realmIndex(minRealm);
                    if (minIdx !== -1 && playerIdx !== -1 && playerIdx < minIdx) {
                        this.diagnostics.filtered++;
                        this.diagnostics.reasons.minRealm++;
                        if (this.diagnostics.samples.minRealm.length < this.diagnostics.sampleCap)
                            this.diagnostics.samples.minRealm.push(evt.id || evt.id || 'unknown');
                        return false;
                    }
                }
                if (maxRealm) {
                    const maxIdx = realmIndex(maxRealm);
                    if (maxIdx !== -1 && playerIdx !== -1 && playerIdx > maxIdx) {
                        this.diagnostics.filtered++;
                        this.diagnostics.reasons.maxRealm++;
                        if (this.diagnostics.samples.maxRealm.length < this.diagnostics.sampleCap)
                            this.diagnostics.samples.maxRealm.push(evt.id || evt.id || 'unknown');
                        return false;
                    }
                }
                if (worldTypes && Array.isArray(worldTypes) && worldTypes.length > 0) {
                    if (!worldTypes.includes(currentWorldType)) {
                        this.diagnostics.filtered++;
                        this.diagnostics.reasons.worldType++;
                        if (this.diagnostics.samples.worldType.length < this.diagnostics.sampleCap)
                            this.diagnostics.samples.worldType.push(evt.id || evt.id || 'unknown');
                        return false;
                    }
                }
                else {
                    if (currentWorldType === 'immortal') {
                        this.diagnostics.filtered++;
                        this.diagnostics.reasons.worldType++;
                        if (this.diagnostics.samples.worldType.length < this.diagnostics.sampleCap)
                            this.diagnostics.samples.worldType.push(evt.id || evt.id || 'unknown');
                        return false;
                    } // default mortal-only
                }
                return true;
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.warn('LifeArc gating error:', err);
                return true; // fail-open
            }
        });
        const baseEvents = gated;
        // Try to integrate with a NarrativeEngine if provided in the gameState or systems
        try {
            const narrativeEngine = gameState.narrativeEngine || gameState.systems?.narrativeEngine;
            if (narrativeEngine && typeof narrativeEngine.generateEventsForPlayer === 'function') {
                const generated = narrativeEngine.generateEventsForPlayer({ player: gameState.player, world: gameState.world, story: gameState.story, ui: gameState.ui, systems: gameState.systems });
                if (Array.isArray(generated) && generated.length > 0) {
                    const converted = generated.map((t, idx) => {
                        const id = t.id || `narrative_generated_${Date.now()}_${idx}`;
                        return {
                            id,
                            title: t.title || t.name || 'Narrative Event',
                            description: t.description || '',
                            choices: (t.choices || []).map((c, ci) => ({ id: c.id || `c_${ci}`, text: c.text || (c.name || 'Choose'), consequences: c.consequences || {} }))
                        };
                    }).filter(e => !!e);
                    return [...baseEvents, ...converted];
                }
            }
        }
        catch (err) {
            // non-fatal
            logger_1.logger.warn('NarrativeEngine integration in LifeArcSystem failed:', err);
        }
        return baseEvents;
    }
    getDiagnosticsSummary() {
        const { totalChecked, filtered, reasons, samples } = this.diagnostics;
        return { totalChecked, filtered, passed: totalChecked - filtered, reasons: { ...reasons }, samples: { worldType: [...samples.worldType], minRealm: [...samples.minRealm], maxRealm: [...samples.maxRealm] } };
    }
    resetDiagnostics() {
        this.diagnostics.totalChecked = 0;
        this.diagnostics.filtered = 0;
        this.diagnostics.reasons.worldType = 0;
        this.diagnostics.reasons.minRealm = 0;
        this.diagnostics.reasons.maxRealm = 0;
        this.diagnostics.samples.worldType = [];
        this.diagnostics.samples.minRealm = [];
        this.diagnostics.samples.maxRealm = [];
    }
    triggerEvent(eventId, gameState) {
        const arc = this.getCurrentArc(gameState);
        if (!arc)
            return null;
        const ev = (arc.events || []).find(e => e.id === eventId);
        if (!ev)
            return null;
        this.activeEvents.set(eventId, ev);
        return ev;
    }
    makeChoice(eventId, choiceId, gameState) {
        const ev = this.activeEvents.get(eventId);
        if (!ev)
            return false;
        const choice = (ev.choices || []).find((c) => c.id === choiceId);
        if (!choice)
            return false;
        // Best-effort consequence application: very similar to StorySystem but minimal here
        if (choice.consequences && choice.consequences.stats) {
            for (const [k, v] of Object.entries(choice.consequences.stats)) {
                gameState.player[k] = (gameState.player[k] || 0) + Number(v || 0);
            }
        }
        this.activeEvents.delete(eventId);
        return true;
    }
    checkQuestCompletion(_gameState) {
        // Minimal pass-through: return empty array. Existing quest machinery in QuestSystem
        // should be used for robust checks.
        return [];
    }
    addQuest(arcId, quest, isMain = false) {
        const arc = this.arcs.get(arcId);
        if (!arc)
            return false;
        if (isMain)
            arc.mainQuests.push(quest);
        else
            arc.sideQuests.push(quest);
        return true;
    }
    addEvent(arcId, event) {
        const arc = this.arcs.get(arcId);
        if (!arc)
            return false;
        arc.events.push(event);
        return true;
    }
    // Keep an Acts-compatible UI surface so getActsForUI continues to function.
    getAvailableActs(_gameState) {
        return Array.from(this.arcs.values());
    }
    getActsForUI(_gameState) {
        return Array.from(this.arcs.values()).map(a => ({ id: a.id, title: a.title, description: a.description || '', disabled: false }));
    }
    progressToNextAct(_gameState) {
        // No-op for now: LifeArc progression will be event/opportunity-driven instead of linear.
        return false;
    }
}
exports.LifeArcSystem = LifeArcSystem;
exports.default = LifeArcSystem;
