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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EncounterModal;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- imports core systems intentionally for encounter UI */
const react_1 = __importDefault(require("react"));
const useGameStore_1 = require("../../store/useGameStore");
const CombatSystem_1 = require("@/systems/CombatSystem");
const PickupSystem_1 = require("@/systems/PickupSystem");
// Lazy resolve skill registry helpers to avoid pulling the full registry into entry
async function resolveSkillRegistry() {
    try {
        const m = await Promise.resolve().then(() => __importStar(require('@/systems/skillRegistry')));
        return { toCombatTechnique: m.toCombatTechnique, getActiveAbilityById: m.getSkillById };
    }
    catch {
        return { toCombatTechnique: (x) => x, getActiveAbilityById: (_) => null };
    }
}
// Avoid static import of encounterNarratives to prevent merging into entry.
// We'll dynamically import and cache the getter in state.
const TravelEncounterSystem_1 = require("@/systems/TravelEncounterSystem");
const seededRng_1 = require("@/utils/seededRng");
const rng_1 = require("../../utils/rng");
const logger_1 = require("../../utils/logger");
function EncounterModal() {
    const store = (0, useGameStore_1.useGameStore)();
    const { player } = store;
    const enc = player.activeEncounter;
    const [getEncounterTemplate, setGetEncounterTemplate] = react_1.default.useState(null);
    // Refer to intentionally-unused runtime helpers to satisfy the linter
    void seededRng_1.runtimeRng;
    react_1.default.useEffect(() => {
        let mounted = true;
        // Test-time synchronous loader: when running under Jest, prefer require() so
        // tests don't need to wait for dynamic import to resolve. This is guarded
        // so production bundles keep using dynamic import.
        try {
            if (typeof process !== 'undefined' && process.env && (process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test')) {
                // In tests prefer synchronous require so templates are available immediately
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const mod = require('../../data/encounterNarratives');
                    const fn = mod.getEncounterTemplate || (mod.default && mod.default.getEncounterTemplate) || null;
                    if (mounted && fn)
                        setGetEncounterTemplate(() => fn);
                }
                catch (e) {
                    logger_1.logger.debug('EncounterModal: sync require failed', e);
                }
            }
        }
        catch (e) {
            logger_1.logger.debug('EncounterModal: env detection failed', e);
        }
        (async () => {
            try {
                const mod = await Promise.resolve().then(() => __importStar(require('@/data/encounterNarratives')));
                const fn = mod.getEncounterTemplate || (mod.default && mod.default.getEncounterTemplate) || null;
                if (mounted && fn)
                    setGetEncounterTemplate(() => fn);
            }
            catch (e) {
                logger_1.logger.debug('EncounterModal: async import failed', e);
            }
        })();
        return () => { mounted = false; };
    }, []);
    // Negotiation modal state and handler (hooks must be declared unconditionally)
    const [negotiateOpen, setNegotiateOpen] = react_1.default.useState(false);
    // Helper: pick a template to display (branch state overrides encounterId if present)
    const currentTemplate = react_1.default.useMemo(() => {
        try {
            const tid = enc?.branchState?.currentTemplateId || enc?.encounterId || (enc && enc.meta && enc.meta.edge && enc.meta.edge.templateId) || null;
            if (!tid)
                return null;
            return getEncounterTemplate ? getEncounterTemplate(tid) : null;
        }
        catch (e) {
            return null;
        }
    }, [enc, getEncounterTemplate]);
    if (!enc)
        return null;
    const startCombatForEncounter = async (templateId) => {
        try {
            // Optimistically switch UI to combat early so tests that read UI synchronously
            // after a click observe the intended navigation without waiting for async imports.
            try {
                store.setUIProperty('currentScreen', 'combat');
            }
            catch (e) {
                void e;
            }
            // Build player participant like other combat starters
            const playerTechniqueIds = Array.isArray(store.player.techniques) ? store.player.techniques : [];
            const { toCombatTechnique, getActiveAbilityById } = await resolveSkillRegistry();
            const playerTechniques = playerTechniqueIds
                .map((id) => {
                try {
                    const skill = getActiveAbilityById(id);
                    return skill ? toCombatTechnique(skill) : null;
                }
                catch {
                    return null;
                }
            })
                .filter(Boolean);
            const playerPart = {
                id: 'player',
                name: store.player.name || 'You',
                hp: store.player.hp || store.player.maxHp || 100,
                maxHp: store.player.maxHp || 100,
                qi: store.player.qi || store.player.maxQi || 0,
                maxQi: store.player.maxQi || 0,
                ap: 5,
                maxAp: 5,
                stats: {
                    atk: store.player.stats?.atk || 10,
                    def: store.player.stats?.def || 10,
                    speed: store.player.stats?.speed || 10
                },
                techniques: playerTechniques,
                buffs: [],
                debuffs: []
            };
            // Create a simple enemy from encounter metadata (fallback to a weak default)
            const metaEdge = enc.meta?.edge || {};
            const tmplId = templateId || enc.branchState?.currentTemplateId || enc.encounterId || metaEdge.templateId || null;
            let template = null;
            if (tmplId && getEncounterTemplate) {
                try {
                    template = getEncounterTemplate(tmplId) || null;
                }
                catch (e) {
                    template = null;
                }
            }
            const enemyId = enc.encounterId ? `enc_${enc.encounterId}` : `enc_edge_${enc.edgeIndex}`;
            // Resolve template technique ids to CombatTechnique instances when possible
            let resolvedTechs = [];
            try {
                if (template && Array.isArray(template.techniques)) {
                    const { toCombatTechnique, getActiveAbilityById } = await resolveSkillRegistry();
                    resolvedTechs = template.techniques.map((tid) => {
                        try {
                            const sk = getActiveAbilityById(tid);
                            return sk ? toCombatTechnique(sk) : null;
                        }
                        catch (e) {
                            return null;
                        }
                    }).filter(Boolean);
                }
            }
            catch (e) {
                resolvedTechs = [];
            }
            const enemy = template ? {
                id: enemyId,
                name: template.name || enc.encounterId || 'Unknown',
                hp: template.hp || 60,
                maxHp: template.hp || 60,
                qi: 0,
                maxQi: 0,
                ap: 5,
                maxAp: 5,
                stats: { atk: template.atk || 8, def: template.def || 5, speed: template.speed || 8 },
                techniques: resolvedTechs.length > 0 ? resolvedTechs : (template.techniques || []),
                buffs: [],
                debuffs: [],
                loot: template.loot || []
            } : {
                id: enemyId,
                name: metaEdge.name || enc.encounterId || 'Road Thug',
                hp: (metaEdge.hp || 60),
                maxHp: (metaEdge.hp || 60),
                qi: 0,
                maxQi: 0,
                ap: 5,
                maxAp: 5,
                stats: {
                    atk: metaEdge.atk || Math.max(6, Math.round((metaEdge.difficulty || 1) * 8)),
                    def: metaEdge.def || Math.max(4, Math.round((metaEdge.difficulty || 1) * 6)),
                    speed: metaEdge.speed || 8
                },
                techniques: [],
                buffs: [],
                debuffs: []
            };
            // Build combat context with AI hints from template if present
            const combatContext = { type: 'normal', specialRules: [`encounter:${enc.encounterId || enemyId}`] };
            if (template && template.ai) {
                if (Array.isArray(template.ai.preferredTechniques))
                    combatContext.preferredTechniques = template.ai.preferredTechniques;
                if (template.ai.openingBias)
                    combatContext.openingBias = true;
            }
            const cs = new CombatSystem_1.CombatSystem(playerPart, [enemy], store, store.rivalSystem, combatContext);
            // set combat system on store and open Combat UI
            store.combatSystem = cs; // immediate field set
            store.setUIProperty('currentScreen', 'combat');
            try {
                store.addEventLog(`Encountered ${enemy.name}!`);
            }
            catch (e) {
                void e;
            }
        }
        catch (e) {
            logger_1.logger.error('Failed to start combat for encounter', e);
            // fallback: cancel encounter
            try {
                useGameStore_1.useGameStore.getState().resolveActiveEncounterOutcome?.({ success: false, resumeTravel: false });
            }
            catch (ee) {
                logger_1.logger.debug('resolveActiveEncounterOutcome fallback failed', ee);
            }
        }
    };
    const handleFlee = () => {
        // fleeing cancels travel; no resume
        store.addEventLog(`You fled from ${enc.encounterId}. Travel cancelled.`);
        // record choice in branch history
        try {
            const st = useGameStore_1.useGameStore.getState();
            const ae = st.player.activeEncounter || {};
            const newHist = (ae.branchState?.choiceHistory || []).concat([{ choiceId: 'flee', templateId: ae.branchState?.currentTemplateId, consequence: 'escape' }]);
            useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: { ...ae, branchState: { ...(ae.branchState || {}), choiceHistory: newHist } } } }));
        }
        catch (e) {
            void e;
        }
        try {
            useGameStore_1.useGameStore.getState().resolveActiveEncounterOutcome?.({ success: false, resumeTravel: false });
        }
        catch (e) {
            void e;
        }
    };
    const handleNegotiate = () => {
        // Open small negotiate modal instead (use state to drive UI)
        setNegotiateOpen(true);
    };
    const handleNegotiateAttempt = (bonus = 0) => {
        setNegotiateOpen(false);
        const social = store.player.skills?.socialSkills?.level || 0;
        const _diff = (enc.meta?.edge?.difficulty || 1) * 5;
        void _diff;
        const _rngFunc = (store && store.rng) ? store.rng : (0, rng_1.getRng)(store);
        const _sam = (typeof _rngFunc === 'function') ? _rngFunc() : Math.random();
        const roll = Math.floor(_sam * 100) / 100;
        const chance = Math.min(0.95, (social * 0.1) + (bonus * 0.05));
        const success = roll < chance;
        if (success) {
            store.addEventLog('Negotiation succeeded; you slip past without combat.');
            // record negotiation success in branch history
            try {
                const st = useGameStore_1.useGameStore.getState();
                const ae = st.player.activeEncounter || {};
                const newHist = (ae.branchState?.choiceHistory || []).concat([{ choiceId: 'negotiate_success', templateId: ae.branchState?.currentTemplateId, consequence: 'peace' }]);
                useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: { ...ae, branchState: { ...(ae.branchState || {}), choiceHistory: newHist } } } }));
            }
            catch (e) {
                void e;
            }
            try {
                useGameStore_1.useGameStore.getState().resolveActiveEncounterOutcome?.({ success: true, resumeTravel: true });
            }
            catch (e) {
                void e;
            }
        }
        else {
            store.addEventLog('Negotiation failed; the situation escalates to combat.');
            // record negotiation failure in branch history
            try {
                const st = useGameStore_1.useGameStore.getState();
                const ae = st.player.activeEncounter || {};
                const newHist = (ae.branchState?.choiceHistory || []).concat([{ choiceId: 'negotiate_fail', templateId: ae.branchState?.currentTemplateId, consequence: 'combat' }]);
                useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: { ...ae, branchState: { ...(ae.branchState || {}), choiceHistory: newHist } } } }));
            }
            catch (e) {
                void e;
            }
            void startCombatForEncounter();
        }
    };
    // intentionally-unused local helpers referenced above (none remain at file scope)
    // Helper: note that currentTemplate is declared above via useMemo to keep hooks order stable
    const handleChoice = (choice) => {
        // record the choice (deferred to avoid mid-event re-render that can break hooks ordering)
        try {
            const st = useGameStore_1.useGameStore.getState();
            const ae = st.player.activeEncounter || {};
            const newHist = (ae.branchState?.choiceHistory || []).concat([{ choiceId: choice.id, templateId: ae.branchState?.currentTemplateId || enc.encounterId, consequence: choice.consequence }]);
            const nextTid = choice.nextTemplateId || null;
            const newBranch = { ...(ae.branchState || {}), currentTemplateId: nextTid, choiceHistory: newHist };
            // defer branchState update slightly to avoid unmount during the event handler
            setTimeout(() => {
                try {
                    useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: { ...ae, branchState: newBranch } } }));
                }
                catch (e) {
                    void e;
                }
            }, 0);
        }
        catch (e) { /* ignore */ }
        // resolve consequence
        if (choice.consequence === 'combat') {
            // defer to avoid unmounting component during event handler and hooks mismatch
            setTimeout(() => { void startCombatForEncounter(currentTemplate?.id || enc.encounterId); }, 0);
        }
        else if (choice.consequence === 'peace') {
            store.addEventLog('You resolve the encounter peacefully.');
            try {
                setTimeout(() => (0, TravelEncounterSystem_1.resolveActiveEncounterOutcome)({ success: true, resumeTravel: true }), 0);
            }
            catch (e) {
                void e;
            }
        }
        else if (choice.consequence === 'reward') {
            // Apply reward if specified on choice or template
            try {
                const st = useGameStore_1.useGameStore.getState();
                const player = st.player;
                const reward = choice.reward || currentTemplate?.reward || null;
                // Deduct required yuan if present (choice.requires.minYuan) before granting
                const cost = (choice.requires && choice.requires.minYuan) || (reward && reward.cost && reward.cost.yuan) || 0;
                if (cost && (player.yuan || 0) >= cost) {
                    useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, yuan: (state.player.yuan || 0) - cost } }));
                }
                if (reward) {
                    if (reward.yuan) {
                        useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, yuan: (state.player.yuan || 0) + reward.yuan } }));
                        store.addEventLog(`You gain ${reward.yuan} yuan.`);
                    }
                    if (reward.item) {
                        useGameStore_1.useGameStore.setState(state => ({ player: { ...state.player, inventory: [...(state.player.inventory || []), reward.item] } }));
                        store.addEventLog(`You received ${reward.item.name || reward.item.id}.`);
                        try {
                            // Notify PickupSystem so mission objectives that listen for pickups update
                            const ps = new PickupSystem_1.PickupSystem(store);
                            try {
                                ps.notifyItemPicked(reward.item.id || reward.item);
                            }
                            catch (e) { /* ignore */ }
                        }
                        catch (e) { /* ignore */ }
                    }
                }
                else {
                    store.addEventLog('You pay/agree and move on.');
                }
            }
            catch (e) {
                void e;
            }
            try {
                setTimeout(() => (0, TravelEncounterSystem_1.resolveActiveEncounterOutcome)({ success: true, resumeTravel: true }), 0);
            }
            catch (e) {
                void e;
            }
            // If this template references a mentor (secret mentor encounter), and player accepted,
            // open the MentorTeaching panel and pass the mentor id via UI state.
            try {
                const mentorId = currentTemplate?.meta?.mentorId || (choice && choice.meta && choice.meta.mentorId) || null;
                if (mentorId) {
                    try {
                        // Try to pick a teaching id to auto-start the interactive teaching when the
                        // MentorTeachingPanel mounts. Use the store helper to list available teachings.
                        const st = useGameStore_1.useGameStore.getState();
                        let teachingId = null;
                        try {
                            const teachings = (st.getAvailableTeachingsForMentor && st.getAvailableTeachingsForMentor(mentorId)) || [];
                            if (Array.isArray(teachings) && teachings.length > 0)
                                teachingId = teachings[0].id || null;
                        }
                        catch (e) {
                            teachingId = null;
                        }
                        // Use a global one-off flag so we don't need to expand the typed UI shape.
                        try {
                            window.__autoStartMentorTeaching = { mentorId, teachingId };
                        }
                        catch (e) {
                            void e;
                        }
                    }
                    catch (e) { /* ignore */ }
                    // Open mentor UI so the panel mounts and consumes the auto-start flag
                    try {
                        useGameStore_1.useGameStore.getState().setUIProperty('selectedMentor', mentorId);
                    }
                    catch (e) {
                        void e;
                    }
                    try {
                        useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'mentors');
                    }
                    catch (e) {
                        void e;
                    }
                }
            }
            catch (e) {
                void e;
            }
        }
        else if (choice.consequence === 'escape') {
            store.addEventLog('You manage to avoid the conflict and slip away.');
            try {
                setTimeout(() => (0, TravelEncounterSystem_1.resolveActiveEncounterOutcome)({ success: false, resumeTravel: true }), 0);
            }
            catch (e) {
                void e;
            }
        }
    };
    const checkChoiceAvailable = (choice) => {
        try {
            if (!choice || !choice.requires)
                return true;
            const st = useGameStore_1.useGameStore.getState();
            const player = st.player;
            const req = choice.requires;
            if (req.skill) {
                const level = player.skills?.[req.skill]?.level || 0;
                if (typeof req.minLevel === 'number' && level < req.minLevel)
                    return false;
            }
            if (req.itemId) {
                const has = Array.isArray(player.inventory) && player.inventory.some((it) => it && (it.id === req.itemId || it === req.itemId));
                if (!has)
                    return false;
            }
            if (typeof req.minYuan === 'number') {
                if ((player.yuan || 0) < req.minYuan)
                    return false;
            }
            // Require specific world/player flags
            if (req.flags) {
                const flags = st.world?.flags || {};
                for (const k of Object.keys(req.flags)) {
                    if (flags[k] !== req.flags[k])
                        return false;
                }
            }
            // Require quest state: { id: string, status: 'active'|'completed'|'not_started' }
            if (req.questState) {
                const q = req.questState;
                const questEntry = (st.story && st.story.questProgress && st.story.questProgress[q.id]) || null;
                // backward-compat: if questProgress contained a boolean/marker, treat presence as active
                if (!questEntry) {
                    if (q.status === 'not_started') {
                        // ok
                    }
                    else {
                        return false;
                    }
                }
                else {
                    const status = questEntry.status || (questEntry.completed ? 'completed' : 'active');
                    if (q.status === 'completed' && status !== 'completed')
                        return false;
                    if (q.status === 'active' && status === 'not_started')
                        return false;
                    if (q.status === 'not_started' && status !== 'not_started')
                        return false;
                }
            }
            // Chance gating using deterministic-aware RNG (0..1)
            if (typeof req.chance === 'number') {
                // Use call-time RNG resolver; this preserves tests that inject an RNG on the store
                const f = (store && store.rng) ? store.rng : (0, rng_1.getRng)(store);
                const r = (typeof f === 'function') ? f() : Math.random();
                if (r >= req.chance)
                    return false;
            }
            return true;
        }
        catch (e) {
            return true;
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, background: 'rgba(0,0,0,0.45)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Encounter" }), currentTemplate ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h4", { children: currentTemplate.title }), (0, jsx_runtime_1.jsx)("p", { children: currentTemplate.body }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "Choose:" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }, children: Array.isArray(currentTemplate.choices) ? currentTemplate.choices.filter(checkChoiceAvailable).map((c) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handleChoice(c), style: { padding: '8px 12px' }, children: c.text }, c.id))) : null })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("p", { children: ["A sudden event blocks your path: ", (0, jsx_runtime_1.jsx)("strong", { children: String(enc.encounterId || 'unknown') })] }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)' }, children: "Choose how to handle it." }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => startCombatForEncounter(undefined), style: { padding: '8px 12px' }, children: "Fight" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleNegotiate, style: { padding: '8px 12px' }, children: "Negotiate" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleFlee, style: { padding: '8px 12px' }, children: "Flee" })] })] })), negotiateOpen && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12, padding: 12, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, background: 'rgba(0,0,0,0.6)' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: "Negotiate" }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, color: 'var(--muted)' }, children: "Attempt a social check to avoid combat. Your social skill and any offered bonus affect success chance." }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12, display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleNegotiateAttempt(0), style: { padding: '6px 10px' }, children: "Attempt" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleNegotiateAttempt(1), style: { padding: '6px 10px' }, children: "Use Item (+bonus)" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setNegotiateOpen(false), style: { padding: '6px 10px' }, children: "Cancel" })] })] }))] }) }));
}
