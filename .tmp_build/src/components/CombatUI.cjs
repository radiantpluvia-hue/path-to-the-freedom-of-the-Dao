"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- component needs to reference CombatSystem for runtime behavior */
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const Button_1 = require("./core/Button");
const Progress_1 = require("./core/Progress");
// Use centralized combat power helper when available to keep metrics consistent
let computeCombatPower = null;
try {
    // require used to avoid static circular deps in some build setups
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    computeCombatPower = require('../systems/combatConfig').computeCombatPower;
}
catch (e) {
    computeCombatPower = null;
}
const CombatUI = () => {
    const { combatSystem, setUIProperty, addEventLog, gainSkillExp, adjustRivalRelationship, markRivalDefeated, getFactionStanding, getSectReputation, adjustFactionStanding, adjustSectReputation, getVisibleStats } = (0, useGameStore_1.useGameStore)();
    const [combatState, setCombatState] = (0, react_1.useState)(null);
    const [combatOutcomeProcessed, setCombatOutcomeProcessed] = (0, react_1.useState)(false);
    const [reputationDelta, setReputationDelta] = (0, react_1.useState)({});
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
            if (Math.random() < 0.3) {
                gainSkillExp('resourcefulness', 10);
                addEventLog('Found some resources while searching the defeated opponent.');
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
        return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }, children: [rival && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { background: 'rgba(220,38,38,0.15)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, border: '1px solid #ef4444', position: 'relative' }, children: ["Rival: ", rival.name] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: '#666', display: 'flex', gap: '8px', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Relationship: ", getRelationshipDescription(useGameStore_1.useGameStore.getState().getRivalRelationship(rival.id))] }), (0, jsx_runtime_1.jsx)("span", { children: "\u2022" }), (0, jsx_runtime_1.jsx)("span", { children: rival.personality.charAt(0).toUpperCase() + rival.personality.slice(1) })] })] })), contextFaction && ((0, jsx_runtime_1.jsxs)("span", { style: { background: 'rgba(59,130,246,0.15)', color: standingColor(factionStanding), padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.6)', position: 'relative' }, children: ["Faction: ", contextFaction.replace('_', ' ').toUpperCase(), " (", formatStanding(factionStanding), ")", typeof reputationDelta.faction === 'number' && reputationDelta.faction !== 0 && ((0, jsx_runtime_1.jsxs)("span", { style: { position: 'absolute', top: -10, right: -10, fontSize: 12, fontWeight: 700, color: reputationDelta.faction > 0 ? '#16a34a' : '#dc2626' }, children: [reputationDelta.faction > 0 ? '+' : '', reputationDelta.faction] }))] })), contextSect && ((0, jsx_runtime_1.jsxs)("span", { style: { background: 'rgba(34,197,94,0.15)', color: standingColor(sectReputation), padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.6)', position: 'relative' }, children: ["Sect: ", contextSect.replace('_', ' ').toUpperCase(), " (", formatStanding(sectReputation), ")", typeof reputationDelta.sect === 'number' && reputationDelta.sect !== 0 && ((0, jsx_runtime_1.jsxs)("span", { style: { position: 'absolute', top: -10, right: -10, fontSize: 12, fontWeight: 700, color: reputationDelta.sect > 0 ? '#16a34a' : '#dc2626' }, children: [reputationDelta.sect > 0 ? '+' : '', reputationDelta.sect] }))] }))] }));
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
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', maxWidth: '800px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsxs)("h2", { style: { color: 'var(--primary)', textAlign: 'center', marginBottom: '6px' }, children: ["\u2694\uFE0F Combat - Round ", combatState.round] }), (0, jsx_runtime_1.jsx)(HeaderContextBadges, {}), (contextFaction || contextSect) && ((0, jsx_runtime_1.jsxs)("div", { style: {
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
                        }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { color: 'var(--primary)', marginBottom: '10px' }, children: ["\uD83D\uDC64 ", player.name] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "HP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [player.hp, "/", player.maxHp] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (player.hp / player.maxHp) * 100, max: 100 })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Qi:" }), (0, jsx_runtime_1.jsxs)("span", { children: [player.qi, "/", player.maxQi, ' ', (0, jsx_runtime_1.jsxs)("small", { style: { color: '#9ca3af', marginLeft: 8 }, children: ["(", getVisibleStats().qi, ")"] })] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (player.qi / player.maxQi) * 100, max: 100 })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '5px' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "AP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [player.ap, "/", player.maxAp] })] }) }), (player.buffs?.length || player.debuffs?.length) && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }, children: [player.buffs?.map((b, idx) => ((0, jsx_runtime_1.jsxs)("span", { title: b.description, style: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.5)', fontSize: 12 }, children: ["\uD83D\uDFE2 ", b.name, " (", b.duration, ")"] }, `pb-${idx}`))), player.debuffs?.map((d, idx) => ((0, jsx_runtime_1.jsxs)("span", { title: d.description, style: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.5)', fontSize: 12 }, children: ["\uD83D\uDD34 ", d.name, " (", d.duration, ")"] }, `pd-${idx}`)))] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            backgroundColor: 'var(--dark)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '2px solid var(--danger)'
                        }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { color: 'var(--danger)', marginBottom: '10px' }, children: ["\uD83D\uDC79 ", enemy.name] }), enemyIntent && ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '8px' }, children: (0, jsx_runtime_1.jsxs)("span", { style: { background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.5)' }, children: ["Intent: ", enemyIntent.intent.toUpperCase(), " ", enemyIntentTechniqueName ? `(${enemyIntentTechniqueName})` : ''] }) })), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "HP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [enemy.hp, "/", enemy.maxHp] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (enemy.hp / enemy.maxHp) * 100, max: 100 })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Qi:" }), (0, jsx_runtime_1.jsxs)("span", { children: [enemy.qi, "/", enemy.maxQi] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: (enemy.qi / enemy.maxQi) * 100, max: 100 })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '5px' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "AP:" }), (0, jsx_runtime_1.jsxs)("span", { children: [enemy.ap, "/", enemy.maxAp] })] }) })] }), (enemy.buffs?.length || enemy.debuffs?.length) && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }, children: [enemy.buffs?.map((b, idx) => ((0, jsx_runtime_1.jsxs)("span", { title: b.description, style: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.5)', fontSize: 12 }, children: ["\uD83D\uDFE2 ", b.name, " (", b.duration, ")"] }, `eb-${idx}`))), enemy.debuffs?.map((d, idx) => ((0, jsx_runtime_1.jsxs)("span", { title: d.description, style: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.5)', fontSize: 12 }, children: ["\uD83D\uDD34 ", d.name, " (", d.duration, ")"] }, `ed-${idx}`)))] }))] }), combatState.isPlayerTurn && combatState.status === 'ongoing' && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--accent)', marginBottom: '10px' }, children: "Actions" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' }, children: [availableTechniques.map(technique => ((0, jsx_runtime_1.jsx)("div", { style: { minWidth: '120px' }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleAction(technique.id), disabled: technique.apCost > player.ap || technique.qiCost > player.qi, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: technique.name }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', opacity: 0.8 }, children: ["AP: ", technique.apCost, " | Qi: ", technique.qiCost] })] }) }) }, technique.id))), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleFlee, variant: "secondary", children: "\uD83C\uDFC3 Flee" }) })] })] })), (0, jsx_runtime_1.jsxs)("div", { style: {
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
