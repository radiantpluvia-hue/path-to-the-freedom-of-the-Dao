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
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- component needs to reference CombatSystem for runtime behavior */
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const Button_1 = require("./core/Button");
const Progress_1 = require("./core/Progress");
// Use centralized combat power helper when available to keep metrics consistent
let computeCombatPower = null;
// Prefer static import; keep a runtime-gated fallback to avoid circular-init issues in some test setups
const combatConfig_1 = require("../systems/combatConfig");
computeCombatPower = combatConfig_1.computeCombatPower || null;
const TravelEncounterSystem_1 = require("@/systems/TravelEncounterSystem");
const rng_1 = require("../utils/rng");
const safeImport_1 = require("@/utils/safeImport");
const CombatTutorial_1 = __importDefault(require("./ui/CombatTutorial"));
const RichTooltip_1 = __importDefault(require("./ui/RichTooltip"));
const SmallChip_1 = __importDefault(require("./ui/SmallChip"));
const CombatUI = () => {
    const { combatSystem, setUIProperty, addEventLog, gainSkillExp, adjustRivalRelationship, markRivalDefeated, getFactionStanding, getSectReputation, adjustFactionStanding, adjustSectReputation, getVisibleStats } = (0, useGameStore_1.useGameStore)();
    const [combatState, setCombatState] = (0, react_1.useState)(null);
    const [combatOutcomeProcessed, setCombatOutcomeProcessed] = (0, react_1.useState)(false);
    const [reputationDelta, setReputationDelta] = (0, react_1.useState)({});
    const [showTutorial, setShowTutorial] = (0, react_1.useState)(false);
    const handleCombatOutcome = (0, react_1.useCallback)((outcome) => {
        if (!combatSystem)
            return;
        const enemy = combatSystem.getState().participants.find((p) => p.id !== 'player');
        if (!enemy)
            return;
        const applyReputationOutcome = (outcomeType, enemyParam) => {
            const ctx = combatSystem.getContext ? combatSystem.getContext() : null;
            if (!ctx) {
                setReputationDelta({});
                return;
            }
            const computePower = (p) => {
                if (!p)
                    return 1;
                if (computeCombatPower)
                    return computeCombatPower(p);
                const atk = p.stats?.atk ?? 0;
                const def = p.stats?.def ?? 0;
                const speed = p.stats?.speed ?? 0;
                const hp = p.maxHp ?? p.hp ?? 0;
                const qi = p.maxQi ?? p.qi ?? 0;
                return atk * 1.5 + def * 1.2 + speed + hp * 0.05 + qi * 0.05;
            };
            const playerPower = computePower(combatSystem.getState().participants.find((p) => p.id === 'player'));
            const enemyPower = computePower(enemyParam);
            const ratio = playerPower > 0 ? enemyPower / playerPower : 1;
            const scale = Math.max(0.5, Math.min(1.5, ratio));
            const baseByOutcome = (type) => {
                if (type === 'faction_battle')
                    return outcomeType === 'victory' ? 15 : outcomeType === 'defeat' ? -10 : -5;
                if (type === 'sect_war')
                    return outcomeType === 'victory' ? 12 : outcomeType === 'defeat' ? -8 : -4;
                if (type === 'rival')
                    return outcomeType === 'victory' ? 15 : outcomeType === 'defeat' ? -10 : -5;
                return 0;
            };
            const sideFaction = ctx.faction || null;
            const sideSect = ctx.sect || null;
            const enemyFaction = (enemyParam && enemyParam.faction) || ctx.enemyFaction || null;
            const enemySect = (enemyParam && enemyParam.sect) || ctx.enemySect || null;
            let factionDelta = null;
            let sectDelta = null;
            const base = baseByOutcome(ctx.type);
            const scaledValue = Math.round(base * scale);
            if (ctx.type === 'faction_battle') {
                if (sideFaction) {
                    adjustFactionStanding(sideFaction, scaledValue);
                    factionDelta = (factionDelta ?? 0) + scaledValue;
                }
                if (enemyFaction)
                    adjustFactionStanding(enemyFaction, -scaledValue);
            }
            else if (ctx.type === 'sect_war') {
                if (sideSect) {
                    adjustSectReputation(sideSect, scaledValue);
                    sectDelta = (sectDelta ?? 0) + scaledValue;
                }
                if (enemySect)
                    adjustSectReputation(enemySect, -scaledValue);
            }
            else if (ctx.type === 'rival') {
                if (outcomeType === 'victory') {
                    if (enemyFaction)
                        adjustFactionStanding(enemyFaction, -Math.round(15 * scale));
                    if (enemySect)
                        adjustSectReputation(enemySect, -Math.round(15 * scale));
                }
                else if (outcomeType === 'defeat') {
                    if (enemyFaction)
                        adjustFactionStanding(enemyFaction, Math.round(10 * scale));
                    if (enemySect)
                        adjustSectReputation(enemySect, Math.round(8 * scale));
                }
                else if (outcomeType === 'flee') {
                    if (enemyFaction)
                        adjustFactionStanding(enemyFaction, Math.round(5 * scale));
                    if (enemySect)
                        adjustSectReputation(enemySect, Math.round(4 * scale));
                }
            }
            setReputationDelta({ faction: factionDelta, sect: sectDelta });
        };
        const handleVictory = (enemyParam) => {
            gainSkillExp('combatSkills', 25);
            gainSkillExp('weaponMastery', 15);
            const ctx = combatSystem.getContext ? combatSystem.getContext() : null;
            if (ctx?.type === 'rival' && enemyParam.id.startsWith('rival_')) {
                const rivalId = enemyParam.id;
                adjustRivalRelationship(rivalId, 15);
                markRivalDefeated(rivalId);
                addEventLog(`Defeated rival ${enemyParam.name}! Gained combat experience and improved reputation.`);
                try {
                    useGameStore_1.useGameStore.getState().rivalSystem?.recordCombatOutcome?.(rivalId, 'victory', combatSystem.getState().round || 0);
                }
                catch (e) { /* ignore */ }
            }
            else {
                addEventLog(`Victory! Defeated ${enemyParam.name} and gained combat experience.`);
            }
            applyReputationOutcome('victory', enemyParam);
            // If this was an encounter, attempt to grant loot from template registry
            try {
                const sr = ctx?.specialRules || [];
                const encRule = (sr || []).find((s) => typeof s === 'string' && s.startsWith('encounter:'));
                if (encRule) {
                    const _encId = encRule.split(':')[1];
                    void _encId;
                    (async () => {
                        try {
                            const mod = await (0, safeImport_1.safeImport)(() => Promise.resolve().then(() => __importStar(require('../data/encounterTemplates'))));
                            const tmpl = mod ? mod.getEncounterTemplate(_encId) : null;
                            if (tmpl && tmpl.loot) {
                                for (const item of tmpl.loot) {
                                    if (item.type === 'yuan') {
                                        setTimeout(() => { try {
                                            useGameStore_1.useGameStore.getState().setPlayerProperty?.('yuan', (useGameStore_1.useGameStore.getState().player.yuan || 0) + item.amount);
                                        }
                                        catch (e) {
                                            void e;
                                        } }, 0);
                                    }
                                    else if (item.type === 'spirit_stone') {
                                        setTimeout(() => { try {
                                            useGameStore_1.useGameStore.getState().setPlayerProperty?.('spiritStones', Object.assign({}, useGameStore_1.useGameStore.getState().player.spiritStones, { low: (useGameStore_1.useGameStore.getState().player.spiritStones?.low || 0) + (item.amount || 0) }));
                                        }
                                        catch (e) {
                                            void e;
                                        } }, 0);
                                    }
                                    else if (item.type === 'resource') {
                                        // add to inventory as simple item object
                                        setTimeout(() => { try {
                                            useGameStore_1.useGameStore.getState().addToInventory?.({ id: item.id || 'res', qty: item.qty || 1 });
                                        }
                                        catch (e) {
                                            void e;
                                        } }, 0);
                                    }
                                }
                            }
                        }
                        catch (e) {
                            // ignore missing template
                        }
                    })();
                }
            }
            catch (e) {
                void e;
            }
            try {
                const ctx = combatSystem.getContext ? combatSystem.getContext() : null;
                const ctxRng = (ctx && typeof ctx.rng === 'function') ? ctx.rng : (0, rng_1.getRng)();
                const r = (typeof ctxRng === 'function') ? ctxRng() : (0, rng_1.getRng)()();
                if (r < 0.3) {
                    gainSkillExp('resourcefulness', 10);
                    addEventLog('Found some resources while searching the defeated opponent.');
                }
            }
            catch (e) {
                const f = (0, rng_1.getRng)();
                const r = f();
                if (r < 0.3) {
                    gainSkillExp('resourcefulness', 10);
                    addEventLog('Found some resources while searching the defeated opponent.');
                }
            }
        };
        const handleDefeat = () => {
            addEventLog('You were defeated in combat. Your cultivation has been set back.');
            gainSkillExp('mentalFortitude', 10);
            const enemyParam = combatSystem.getState().participants.find((p) => p.id !== 'player');
            applyReputationOutcome('defeat', enemyParam);
            try {
                if (enemyParam?.id?.startsWith('rival_')) {
                    useGameStore_1.useGameStore.getState().rivalSystem?.recordCombatOutcome?.(enemyParam.id, 'defeat', combatSystem.getState().round || 0);
                }
            }
            catch (e) { /* ignore */ }
        };
        const handleFleeOutcome = () => {
            addEventLog('You successfully fled from combat, but lost some dignity.');
            gainSkillExp('socialSkills', -5);
            const enemyParam = combatSystem.getState().participants.find((p) => p.id !== 'player');
            applyReputationOutcome('flee', enemyParam);
        };
        switch (outcome) {
            case 'victory':
                handleVictory(enemy);
                break;
            case 'defeat':
                handleDefeat();
                break;
            case 'fled':
                handleFleeOutcome();
                break;
        }
        // If this combat was started as an encounter (specialRules marker), notify encounter resolver
        try {
            const ctx = combatSystem.getContext ? combatSystem.getContext() : null;
            const sr = ctx?.specialRules || [];
            const encRule = (sr || []).find((s) => typeof s === 'string' && s.startsWith('encounter:'));
            if (encRule) {
                const _encId = encRule.split(':')[1];
                void _encId;
                // on victory -> resume travel, on defeat/fled -> do not resume
                if (combatSystem.getState().status === 'victory')
                    (0, TravelEncounterSystem_1.resolveActiveEncounterOutcome)({ success: true, resumeTravel: true });
                else
                    (0, TravelEncounterSystem_1.resolveActiveEncounterOutcome)({ success: false, resumeTravel: false });
            }
        }
        catch (e) {
            // ignore
        }
    }, [combatSystem, gainSkillExp, adjustRivalRelationship, markRivalDefeated, addEventLog, adjustFactionStanding, adjustSectReputation, setReputationDelta]);
    (0, react_1.useEffect)(() => {
        if (!combatSystem) {
            setUIProperty('currentScreen', 'game'); // Return to game if no combat
            return;
        }
        // Reset state for new combat
        setCombatState(combatSystem.getState());
        setCombatOutcomeProcessed(false);
        setReputationDelta({});
        // Listen for combat state changes
        // Interval reads combatSystem and updates local state.
        const interval = setInterval(() => {
            if (combatSystem) {
                const currentState = combatSystem.getState();
                setCombatState(currentState);
                // Handle combat outcome when combat ends
                if (currentState.status !== 'ongoing' && !combatOutcomeProcessed) {
                    handleCombatOutcome(currentState.status);
                    setCombatOutcomeProcessed(true);
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, [combatSystem, combatOutcomeProcessed, handleCombatOutcome, setUIProperty]);
    // Show tutorial on first combat unless the player has hidden it forever
    (0, react_1.useEffect)(() => {
        try {
            const player = useGameStore_1.useGameStore.getState().player;
            const hidden = player?.settings?.combatTutorialHidden;
            if (!hidden)
                setShowTutorial(true);
        }
        catch (e) { /* ignore */ }
    }, [combatSystem]);
    if (!combatSystem || !combatState)
        return null;
    const player = combatState.participants.find(p => p.id === 'player');
    const enemy = combatState.participants.find(p => p.id !== 'player');
    if (!player || !enemy)
        return null;
    // Derive combat context info (faction/sect/rival) for header badges
    const context = combatSystem.getContext ? combatSystem.getContext() : null;
    const contextType = context?.type || 'normal';
    const contextFaction = context?.faction || null;
    const contextSect = context?.sect || null;
    const contextRivalId = context?.rivalId || null;
    const factionStanding = contextFaction ? getFactionStanding(contextFaction) : null;
    const sectReputation = contextSect ? getSectReputation(contextSect) : null;
    // Enemy intent display helpers
    const enemyIntent = combatState.enemyIntent;
    const enemyIntentTechniqueName = enemyIntent?.techniqueId
        ? (enemy.techniques.find(t => t.id === enemyIntent.techniqueId)?.name || null)
        : null;
    const formatStanding = (v) => v === null ? '-' : `${v > 0 ? '+' : ''}${v}`;
    const standingColor = (v) => v === null ? '#aaa' : v >= 50 ? '#16a34a' : v >= 0 ? '#ca8a04' : v >= -50 ? '#ea580c' : '#dc2626';
    const getRelationshipDescription = (relationship) => {
        if (relationship >= 80)
            return 'Devoted Ally';
        if (relationship >= 60)
            return 'Close Friend';
        if (relationship >= 40)
            return 'Good Friend';
        if (relationship >= 20)
            return 'Friendly';
        if (relationship >= 0)
            return 'Neutral';
        if (relationship >= -20)
            return 'Unfriendly';
        if (relationship >= -40)
            return 'Hostile';
        if (relationship >= -60)
            return 'Enemy';
        if (relationship >= -80)
            return 'Bitter Enemy';
        return 'Mortal Enemy';
    };
    const HeaderContextBadges = () => {
        const rival = contextType === 'rival' && contextRivalId ? useGameStore_1.useGameStore.getState().getRivalById(contextRivalId) : null;
        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }, children: [rival && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }, children: [(0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "danger", style: { position: 'relative' }, title: rival.name, children: ["Rival: ", rival.name] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: '#666', display: 'flex', gap: '8px', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Relationship: ", getRelationshipDescription(useGameStore_1.useGameStore.getState().getRivalRelationship(rival.id))] }), (0, jsx_runtime_1.jsx)("span", { children: "\u2022" }), (0, jsx_runtime_1.jsx)("span", { children: rival.personality.charAt(0).toUpperCase() + rival.personality.slice(1) })] })] })), contextFaction && ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative' }, children: [(0, jsx_runtime_1.jsxs)(SmallChip_1.default, { style: { color: standingColor(factionStanding), border: '1px solid rgba(59,130,246,0.6)' }, children: ["Faction: ", contextFaction.replace('_', ' ').toUpperCase(), " (", formatStanding(factionStanding), ")"] }), typeof reputationDelta.faction === 'number' && reputationDelta.faction !== 0 && ((0, jsx_runtime_1.jsxs)("span", { style: { position: 'absolute', top: -10, right: -10, fontSize: 12, fontWeight: 700, color: reputationDelta.faction > 0 ? '#16a34a' : '#dc2626' }, children: [reputationDelta.faction > 0 ? '+' : '', reputationDelta.faction] }))] })), contextSect && ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative' }, children: [(0, jsx_runtime_1.jsxs)(SmallChip_1.default, { style: { color: standingColor(sectReputation), border: '1px solid rgba(34,197,94,0.6)' }, children: ["Sect: ", contextSect.replace('_', ' ').toUpperCase(), " (", formatStanding(sectReputation), ")"] }), typeof reputationDelta.sect === 'number' && reputationDelta.sect !== 0 && ((0, jsx_runtime_1.jsxs)("span", { style: { position: 'absolute', top: -10, right: -10, fontSize: 12, fontWeight: 700, color: reputationDelta.sect > 0 ? '#16a34a' : '#dc2626' }, children: [reputationDelta.sect > 0 ? '+' : '', reputationDelta.sect] }))] }))] }));
    };
    const handleAction = (actionId) => {
        combatSystem.useTechnique('player', actionId, enemy.id);
        combatSystem.endTurn();
        setCombatState(combatSystem.getState());
    };
    const handleFlee = () => {
        combatSystem.flee();
        setCombatState(combatSystem.getState());
    };
    const availableTechniques = combatSystem.getAvailableTechniques('player');
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', maxWidth: '800px', margin: '0 auto' }, children: [showTutorial && ((0, jsx_runtime_1.jsx)(CombatTutorial_1.default, { onClose: () => setShowTutorial(false), onHideForever: () => {
                    try {
                        useGameStore_1.useGameStore.getState().setPlayerProperty?.('settings', { ...(useGameStore_1.useGameStore.getState().player.settings || {}), combatTutorialHidden: true });
                    }
                    catch (e) {
                        void e;
                    }
                    setShowTutorial(false);
                } })), (0, jsx_runtime_1.jsxs)("h2", { style: { color: 'var(--primary)', textAlign: 'center', marginBottom: '6px' }, children: ["\u2694\uFE0F Combat - Round ", combatState.round] }), (0, jsx_runtime_1.jsx)(HeaderContextBadges, {}), (contextFaction || contextSect) && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    background: 'var(--dark)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 10,
                    marginBottom: 12
                }, children: [contextFaction && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#93c5fd', fontWeight: 600 }, children: "Faction Standing" }), (0, jsx_runtime_1.jsx)("span", { style: { color: standingColor(factionStanding) }, children: formatStanding(factionStanding) })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: 8, background: 'rgba(59,130,246,0.2)', borderRadius: 6, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { height: '100%', width: `${((factionStanding ?? 0) + 100) / 2}%`, background: '#3b82f6' } }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 4, color: '#9ca3af', fontSize: 12 }, children: contextFaction.replace('_', ' ').toUpperCase() })] })), contextSect && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: '#86efac', fontWeight: 600 }, children: "Sect Reputation" }), (0, jsx_runtime_1.jsx)("span", { style: { color: standingColor(sectReputation) }, children: formatStanding(sectReputation) })] }), (0, jsx_runtime_1.jsx)("div", { style: { height: 8, background: 'rgba(34,197,94,0.2)', borderRadius: 6, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { height: '100%', width: `${((sectReputation ?? 0) + 100) / 2}%`, background: '#22c55e' } }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 4, color: '#9ca3af', fontSize: 12 }, children: contextSect.replace('_', ' ').toUpperCase() })] }))] })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px', marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            backgroundColor: 'var(--dark)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '2px solid var(--primary)'
                        }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { color: 'var(--primary)', marginBottom: '10px' }, children: ["\uD83D\uDC64 ", player.name] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "HP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [player.hp, "/", player.maxHp] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (player.hp / player.maxHp) * 100, max: 100 })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Qi:" }), (0, jsx_runtime_1.jsxs)("span", { children: [player.qi, "/", player.maxQi, ' ', (0, jsx_runtime_1.jsxs)("small", { style: { color: '#9ca3af', marginLeft: 8 }, children: ["(", getVisibleStats().qi, ")"] })] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (player.qi / player.maxQi) * 100, max: 100 })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '5px' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "AP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [player.ap, "/", player.maxAp] })] }) }), (player.buffs?.length || player.debuffs?.length) && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }, children: [player.buffs?.map((b, idx) => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: b.description, children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "success", children: ["\uD83D\uDFE2 ", b.name, " (", b.duration, ")"] }) }, `pb-${idx}`))), player.debuffs?.map((d, idx) => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: d.description, children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "danger", children: ["\uD83D\uDD34 ", d.name, " (", d.duration, ")"] }) }, `pd-${idx}`)))] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            backgroundColor: 'var(--dark)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '2px solid var(--danger)'
                        }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { color: 'var(--danger)', marginBottom: '10px' }, children: ["\uD83D\uDC79 ", enemy.name] }), enemyIntent && ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '8px' }, children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "danger", children: ["Intent: ", enemyIntent.intent.toUpperCase(), " ", enemyIntentTechniqueName ? `(${enemyIntentTechniqueName})` : ''] }) })), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "HP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [enemy.hp, "/", enemy.maxHp] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (enemy.hp / enemy.maxHp) * 100, max: 100 })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Qi:" }), (0, jsx_runtime_1.jsxs)("span", { children: [enemy.qi, "/", enemy.maxQi] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (enemy.qi / enemy.maxQi) * 100, max: 100 })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '5px' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "AP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [enemy.ap, "/", enemy.maxAp] })] }) })] }), (enemy.buffs?.length || enemy.debuffs?.length) && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }, children: [enemy.buffs?.map((b, idx) => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: b.description, children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "success", children: ["\uD83D\uDFE2 ", b.name, " (", b.duration, ")"] }) }, `eb-${idx}`))), enemy.debuffs?.map((d, idx) => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: d.description, children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "danger", children: ["\uD83D\uDD34 ", d.name, " (", d.duration, ")"] }) }, `ed-${idx}`)))] }))] }), combatState.isPlayerTurn && combatState.status === 'ongoing' && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--accent)', marginBottom: '10px' }, children: "Actions" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' }, children: [availableTechniques.map(technique => ((0, jsx_runtime_1.jsx)("div", { style: { minWidth: '120px' }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleAction(technique.id), disabled: technique.apCost > player.ap || technique.qiCost > player.qi, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: technique.name }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', opacity: 0.8 }, children: ["AP: ", technique.apCost, " | Qi: ", technique.qiCost] })] }) }) }, technique.id))), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleFlee, variant: "secondary", children: "\uD83C\uDFC3 Flee" }) })] })] })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    backgroundColor: 'var(--dark)',
                    padding: '15px',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--muted)', marginBottom: '10px' }, children: "Combat Log" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: combatState.combatLog.slice(-10).map((log, index) => ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '5px', padding: '5px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }, children: log }, index))) })] }), combatState.status !== 'ongoing' && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: combatState.status === 'victory' ? 'var(--success)' : 'var(--danger)',
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center'
                }, children: [(0, jsx_runtime_1.jsx)("h3", { children: combatState.status === 'victory' ? '🎉 Victory!' :
                            combatState.status === 'defeat' ? '💀 Defeat!' :
                                '🏃 Fled!' }), (0, jsx_runtime_1.jsx)("p", { style: { marginBottom: '15px' }, children: combatState.status === 'victory' ? 'You emerged victorious from the battle!' :
                            combatState.status === 'defeat' ? 'You were defeated but gained valuable experience.' :
                                'You successfully escaped the battle.' }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                            setUIProperty('currentScreen', 'game');
                            setCombatOutcomeProcessed(false);
                        }, children: "Return to Game" })] }))] }));
};
exports.default = CombatUI;
