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
/* eslint-disable no-restricted-imports -- UI panel needs access to some system internals for playtest */
/* eslint @typescript-eslint/no-non-null-assertion: "off" */
const react_1 = require("react");
const useGameStore_1 = require("../../store/useGameStore");
const SectSystem_1 = require("../../systems/SectSystem");
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
const SmallChip_1 = __importDefault(require("../ui/SmallChip"));
const SectDescriptionModal_1 = __importDefault(require("./SectDescriptionModal"));
const BracketView_1 = __importDefault(require("./BracketView"));
const MiniMap_1 = __importDefault(require("./MiniMap"));
const DomainCaptureModal_1 = __importDefault(require("./DomainCaptureModal"));
const dropTable_1 = require("../../utils/dropTable");
const seededRng_1 = require("../../utils/seededRng");
void seededRng_1.makeSeededRng;
const DomainUtils = __importStar(require("../../utils/domainSystem"));
const playerHelpers_1 = require("../../utils/playerHelpers");
const SectJoiningPanel = () => {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, joinSect } = store;
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    const [visitedSect, setVisitedSect] = (0, react_1.useState)(null);
    const [bracketOpen, setBracketOpen] = (0, react_1.useState)(false);
    const [bracketResult, setBracketResult] = (0, react_1.useState)(null);
    const [seedText, setSeedText] = (0, react_1.useState)('');
    const [selectedTerritory, setSelectedTerritory] = (0, react_1.useState)(null);
    const [dropTableName, setDropTableName] = (0, react_1.useState)(dropTable_1.DEFAULT_TOURNAMENT_DROP);
    const [autoCommit, setAutoCommit] = (0, react_1.useState)(false);
    const [pendingCapture, setPendingCapture] = (0, react_1.useState)(null);
    const availableSects = SectSystem_1.MAJOR_SECTS.filter(sect => {
        // Use safe access for permissive data shapes coming from MAJOR_SECTS
        const req = sect.requirements || {};
        if (req.minRealm && ((0, playerHelpers_1.getPlayerRealmId)(player) ?? 0) < req.minRealm)
            return false;
        if (req.minCombatPower && (player.cultivationPower ?? 0) < req.minCombatPower)
            return false;
        if (req.karma !== undefined && (player.karma ?? 0) < req.karma)
            return false;
        return true;
    });
    const handleJoinSect = (sectId) => {
        const success = joinSect(sectId);
        if (success) {
            alert(`Successfully joined the sect!`);
        }
        else {
            alert(`Failed to join the sect. Check requirements.`);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', maxWidth: '800px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }, children: "Join a Sect" }), player.sect && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Current Sect", children: (0, jsx_runtime_1.jsxs)("p", { children: ["You are currently a member of: ", (0, jsx_runtime_1.jsx)("strong", { children: SectSystem_1.MAJOR_SECTS.find(s => s.id === player.sect)?.name || player.sect })] }) })), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '15px' }, children: availableSects.map(sect => ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: sect.name, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: sect.description }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Type:" }), " ", sect.type] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Realm:" }), " ", sect.realm] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Power:" }), " ", sect.power] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Requirements:" }), (0, jsx_runtime_1.jsxs)("ul", { style: { margin: '5px 0', paddingLeft: '20px' }, children: [sect.requirements?.minRealm && (0, jsx_runtime_1.jsxs)("li", { children: ["Min Realm: ", sect.requirements.minRealm] }), sect.requirements?.minCombatPower && (0, jsx_runtime_1.jsxs)("li", { children: ["Min Combat Power: ", sect.requirements.minCombatPower] }), sect.requirements?.karma !== undefined && (0, jsx_runtime_1.jsxs)("li", { children: ["Karma: ", sect.requirements.karma] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Benefits:" }), (0, jsx_runtime_1.jsxs)("ul", { style: { margin: '5px 0', paddingLeft: '20px' }, children: [Array.isArray(sect.benefits?.techniques) && sect.benefits.techniques.length > 0 && ((0, jsx_runtime_1.jsxs)("li", { children: ["Techniques: ", sect.benefits.techniques.join(', ')] })), sect.benefits?.resources && Object.keys(sect.benefits.resources).length > 0 && ((0, jsx_runtime_1.jsxs)("li", { children: ["Resources: ", Object.entries(sect.benefits.resources).map(([k, v]) => `${k}: ${v}`).join(', ')] })), sect.benefits?.protection && (0, jsx_runtime_1.jsxs)("li", { children: ["Protection: ", sect.benefits.protection] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [sect.showDescriptionOnVisit && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { setVisitedSect(sect); setModalOpen(true); }, size: "large", variant: "secondary", children: "Visit" })), (0, jsx_runtime_1.jsxs)(Button_1.Button, { onClick: () => handleJoinSect(sect.id), size: "large", children: ["Join ", sect.name] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "seed (optional)", value: seedText, onChange: e => setSeedText(e.target.value), style: { padding: '6px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' } }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                                                // apply seed into runtime RNG for deterministic results
                                                try {
                                                    if (seedText && seedText.length > 0) {
                                                        const seeded = (0, seededRng_1.seededFromString)(seedText);
                                                        (0, seededRng_1.setRuntimeRng)(seeded);
                                                    }
                                                    else {
                                                        (0, seededRng_1.clearRuntimeRng)();
                                                    }
                                                }
                                                catch (e) {
                                                    // ignore
                                                }
                                            }, size: "small", variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { padding: '2px 6px' }, children: "Apply Seed" }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginLeft: 8 }, children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }, children: "Target Territory" }), (0, jsx_runtime_1.jsx)(MiniMap_1.default, { territories: store.world?.territories, positions: store.world?.territoryPositions, width: 260, height: 160, selected: selectedTerritory, onSelect: (id) => setSelectedTerritory(id) }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: 'var(--muted)', marginTop: 6 }, children: selectedTerritory ? `Selected: ${selectedTerritory}` : '(Auto select)' })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 8 }, children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: '0.8rem', color: 'var(--muted)' }, children: "Drop Table" }), (0, jsx_runtime_1.jsx)("select", { value: dropTableName, onChange: e => setDropTableName(e.target.value), style: { padding: '6px 8px', borderRadius: 4 }, children: dropTable_1.TOURNAMENT_DROP_OPTIONS.map(opt => (0, jsx_runtime_1.jsx)("option", { value: opt, children: opt }, opt)) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: autoCommit, onChange: e => setAutoCommit(e.target.checked), id: `autoCommit-${sect.id}` }), (0, jsx_runtime_1.jsx)("label", { htmlFor: `autoCommit-${sect.id}`, style: { fontSize: '0.9rem' }, children: "Auto-commit capture" })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                                                try {
                                                    const store = useGameStore_1.useGameStore.getState();
                                                    // invoke sect tournament via shared system on the store
                                                    const res = store.sectFactionSystem?.runTournamentForSect?.(sect.id, 32, store.player.level || 10);
                                                    if (res && res.result) {
                                                        setBracketResult(res.result);
                                                        setBracketOpen(true);
                                                        // Consequence: if player's sect hosted and one of its disciples won, reward player
                                                        try {
                                                            const winnerId = res.result.winnerIndex;
                                                            // heuristic: winnerId string will start with `${sect.id}_r_` for generated rivals
                                                            const playerIsMember = store.player.sect === sect.id;
                                                            if (playerIsMember && String(winnerId).startsWith(sect.id)) {
                                                                // reward via drop table (seeded RNG from store if available)
                                                                try {
                                                                    const rng = store.runtimeRng || undefined;
                                                                    const loot = (0, dropTable_1.rollFromTableName)(dropTableName || dropTable_1.DEFAULT_TOURNAMENT_DROP, rng);
                                                                    if (loot)
                                                                        store.addToInventory?.(loot);
                                                                }
                                                                catch (e) {
                                                                    // fallback deterministic grant
                                                                    store.addToInventory?.({ id: 'spirit_stone_common', qty: 10 });
                                                                }
                                                                store.setPlayerProperty?.('yuan', (store.player.yuan || 0) + 200);
                                                                try {
                                                                    store.addEventLog?.(`Your sect's disciple triumphed in the tournament. You receive rewards.`);
                                                                }
                                                                catch (e) {
                                                                    void e;
                                                                }
                                                                // Territory consequences: grant influence, mark contested, and transfer if threshold reached
                                                                try {
                                                                    const territories = (store.world && store.world.territories) ? store.world.territories : {};
                                                                    const territoryIds = Object.keys(territories);
                                                                    if (territoryIds.length > 0) {
                                                                        // choose a target: use selectedTerritory if provided, else prefer neutral
                                                                        const targetId = selectedTerritory || territoryIds.find((t) => !territories[t].ownerFactionId) || territoryIds[0];
                                                                        if (targetId) {
                                                                            // apply influence via domain utils (handles contestedSince)
                                                                            const inc = Math.max(5, Math.floor((res.result.bracketSize || 16) / 8));
                                                                            DomainUtils.applyTerritoryInfluence?.(store, targetId, sect.id, inc);
                                                                            // decay influence slightly to simulate time passing
                                                                            DomainUtils.decayInfluence?.(store, targetId, 0.98);
                                                                            // check capture preview (non-committal); auto-commit if requested
                                                                            try {
                                                                                const capturePreview = DomainUtils.attemptTerritoryCapture?.(store, targetId, 0.6, false);
                                                                                if (capturePreview && capturePreview.newOwner) {
                                                                                    if (autoCommit) {
                                                                                        // commit directly
                                                                                        const captureRes = DomainUtils.attemptTerritoryCapture?.(store, targetId, 0.6, true);
                                                                                        if (captureRes && captureRes.newOwner) {
                                                                                            if (typeof store.setWorld === 'function') {
                                                                                                store.setWorld({ ...(store.world || {}), territories: store.world.territories });
                                                                                            }
                                                                                            else {
                                                                                                useGameStore_1.useGameStore.setState((s) => ({ world: { ...(s.world || {}), territories: s.world.territories } }));
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        // prompt user with preview
                                                                                        setPendingCapture({ id: targetId, territory: store.world.territories[targetId], preview: capturePreview });
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    // no capture yet; just write back influence changes
                                                                                    if (typeof store.setWorld === 'function') {
                                                                                        store.setWorld({ ...(store.world || {}), territories });
                                                                                    }
                                                                                    else {
                                                                                        useGameStore_1.useGameStore.setState((s) => ({ world: { ...(s.world || {}), territories } }));
                                                                                    }
                                                                                }
                                                                            }
                                                                            catch (e) {
                                                                                // fallback: write world changes
                                                                                if (typeof store.setWorld === 'function') {
                                                                                    store.setWorld({ ...(store.world || {}), territories });
                                                                                }
                                                                                else {
                                                                                    useGameStore_1.useGameStore.setState((s) => ({ world: { ...(s.world || {}), territories } }));
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                catch (e) {
                                                                    // ignore territory update failures
                                                                }
                                                            }
                                                        }
                                                        catch (e) { /* ignore non-fatal reward logic errors */ }
                                                    }
                                                    else {
                                                        alert('Tournament could not be run.');
                                                    }
                                                }
                                                catch (e) {
                                                    // non-fatal UI error
                                                }
                                            }, size: "large", variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { padding: '6px 10px' }, children: "Hold Great Sect Tournament" }) })] })] })] }, sect.id))) }), (0, jsx_runtime_1.jsx)(DomainCaptureModal_1.default, { open: !!pendingCapture, territoryId: pendingCapture?.id, territory: pendingCapture?.territory, capturePreview: pendingCapture?.preview, onCancel: () => setPendingCapture(null), onConfirm: (opts) => {
                    try {
                        const store = useGameStore_1.useGameStore.getState();
                        if (pendingCapture) {
                            const funding = opts?.funding || 'normal';
                            const _forceConfirm = opts?.forceConfirm || false;
                            void _forceConfirm;
                            const forceParams = funding === 'force_capture' ? { attritionMultiplier: 1.5, influencePenalty: 10, reputationPenalty: 5 } : null;
                            // commit capture with funding/force params via domain utils shim
                            const res = DomainUtils.attemptTerritoryCapture?.(store, pendingCapture.id, 0.6, true, funding, forceParams);
                            if (res && res.newOwner) {
                                try {
                                    store.addEventLog?.(`${res.newOwner} captured ${pendingCapture.id}`);
                                }
                                catch (e) {
                                    void e;
                                }
                            }
                            // write back world
                            if (typeof store.setWorld === 'function') {
                                store.setWorld({ ...(store.world || {}), territories: store.world.territories });
                            }
                            else {
                                useGameStore_1.useGameStore.setState((s) => ({ world: { ...(s.world || {}), territories: s.world.territories } }));
                            }
                        }
                    }
                    catch (e) { /* ignore */ }
                    setPendingCapture(null);
                } }), availableSects.length === 0 && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "No Available Sects", children: (0, jsx_runtime_1.jsx)("p", { children: "You don't meet the requirements for any sects yet. Continue cultivating to unlock more options." }) })), (0, jsx_runtime_1.jsx)(SectDescriptionModal_1.default, { open: modalOpen, sect: visitedSect, onClose: () => { setModalOpen(false); setVisitedSect(null); } }), bracketOpen && bracketResult && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', left: '50%', top: '10%', transform: 'translateX(-50%)', zIndex: 9999 }, children: (0, jsx_runtime_1.jsx)(BracketView_1.default, { result: bracketResult, onClose: () => { setBracketOpen(false); setBracketResult(null); } }) }))] }));
};
exports.default = SectJoiningPanel;
