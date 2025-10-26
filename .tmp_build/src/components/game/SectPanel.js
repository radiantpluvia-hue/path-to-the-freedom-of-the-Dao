"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../../store/useGameStore");
const Card_1 = require("../core/Card");
const SmallChip_1 = __importDefault(require("../ui/SmallChip"));
const Button_1 = require("../core/Button");
const ToastContainer_1 = __importDefault(require("../ToastContainer"));
const RandomizedCharacters_1 = __importDefault(require("../../components/RandomizedCharacters"));
const SectPanel = () => {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, leaveSect, requestSectMission, setUIProperty, addEventLog, acceptSectMission, declineSectMission, toggleMissionDetails, attemptMission, completeMission } = store;
    const handleLeave = () => {
        try {
            leaveSect?.();
            addEventLog?.('You left your sect.');
            setUIProperty('currentScreen', 'game');
        }
        catch (e) { /* ignore */ }
    };
    const handleRequestMission = () => {
        try {
            requestSectMission?.();
            addEventLog?.('Requested a sect mission.');
        }
        catch (e) { /* ignore */ }
    };
    const inventory = Array.isArray(player.inventory) ? player.inventory : [];
    const activeMissions = (store.story && Array.isArray(store.story.activeRandomMissions)) ? store.story.activeRandomMissions : [];
    const toggleMissionOpen = (id) => { try {
        toggleMissionDetails?.(id);
    }
    catch (e) { /* ignore */ } };
    // Helper to render objective progress for a mission
    const renderObjectives = (m) => {
        if (!m.objectives || !Array.isArray(m.objectives) || m.objectives.length === 0)
            return (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No objectives." });
        return ((0, jsx_runtime_1.jsx)("ul", { style: { marginTop: 8 }, children: m.objectives.map((o, idx) => {
                const progress = o.progress || 0;
                const target = o.target || 1;
                const done = progress >= target;
                return ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: o.description || o.type || 'Objective' }), (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { fontSize: 12 }, children: `${progress}/${target}${done ? ' ✓' : ''}` })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: done ? 'var(--success)' : 'var(--muted)' }, children: done ? 'Complete' : '' })] }, idx));
            }) }));
    };
    // Note: per-mission Accept/Decline handlers are applied inline in the list render
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20, maxWidth: 900, margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { textAlign: 'center', marginBottom: 16, color: 'var(--primary)' }, children: "Sect Hub" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 16 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Your Sect", children: player.sect ? ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Member of: ", (0, jsx_runtime_1.jsx)("strong", { children: player.sect })] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Reputation: ", store.getSectReputation?.(player.sect) ?? 0] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h5", { style: { margin: '6px 0' }, children: "Notable Disciples" }), (0, jsx_runtime_1.jsx)(RandomizedCharacters_1.default, { strength: store.getSectReputation?.(player.sect) ?? 0, size: 5, seed: player.sect || 'sect' })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleRequestMission, variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Request Sect Mission" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleLeave, variant: "danger", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Leave Sect" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'game'), variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Back to Game" }) })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)' }, children: ["You are not a member of any sect. Visit Join a Sect to browse available sects.", (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'sects'), variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Browse Sects" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'game'), variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Back to Game" }) })] })] })) }), (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "Inventory Preview", children: [(0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "Quick view of your inventory (first 10 items)" }), (0, jsx_runtime_1.jsxs)("ul", { style: { marginTop: 8 }, children: [inventory.slice(0, 10).map((it, idx) => ((0, jsx_runtime_1.jsx)("li", { style: { padding: '6px 0' }, children: typeof it === 'string' ? it : it.name || it.id }, idx))), inventory.length === 0 && (0, jsx_runtime_1.jsx)("li", { style: { color: 'var(--muted)' }, children: "No items" })] })] }), (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "Active Sect Missions", children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                        const removed = store.checkMissionExpirations?.();
                                        addEventLog?.(`Checked missions: removed ${removed}`);
                                        store.showToast?.(`Checked missions: removed ${removed}`);
                                    }
                                    catch (e) { /* ignore */ } }, variant: "secondary", children: "Refresh Missions" }) }), activeMissions.length ? (activeMissions.map((m) => ((0, jsx_runtime_1.jsxs)("div", { style: { borderBottom: '1px dashed var(--border)', padding: '8px 0' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: m.title }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: m.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                                                            try {
                                                                if (typeof acceptSectMission === 'function') {
                                                                    acceptSectMission(m.id);
                                                                }
                                                                else if (typeof attemptMission === 'function') {
                                                                    attemptMission(m.id);
                                                                }
                                                                else if (typeof completeMission === 'function') {
                                                                    completeMission(m.id);
                                                                }
                                                            }
                                                            catch (e) { /* ignore */ }
                                                        }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Accept" }) }), ((m.isCompleted === true) || (Array.isArray(m.objectives) && m.objectives.every((o) => (o.progress || 0) >= (o.target || o.value || 1)))) && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                                            const ok = store.claimMissionRewards?.(m.id);
                                                            if (ok) {
                                                                addEventLog?.(`Claimed rewards for ${m.title}`);
                                                                store.showToast?.(`Claimed rewards for ${m.title}`);
                                                            }
                                                            else {
                                                                store.showToast?.('Failed to claim rewards');
                                                            }
                                                        }
                                                        catch (e) { /* ignore */ } }, variant: "primary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Claim Rewards" }) })), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                                            declineSectMission?.(m.id);
                                                        }
                                                        catch (e) { /* ignore */ } }, variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Decline" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => toggleMissionOpen(m.id), variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: m._uiExpanded ? 'Hide' : 'Details' }) })] })] }), m._uiExpanded && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: renderObjectives(m) }), m.reward && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, fontSize: '0.9rem', color: 'var(--muted)' }, children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("strong", { children: "Rewards:" }) }), (0, jsx_runtime_1.jsxs)("div", { children: ["Yuan: ", m.reward.yuan || 0] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Spirit Stones: ", m.reward.spiritStones ? `${m.reward.spiritStones.low || 0}/${m.reward.spiritStones.mid || 0}/${m.reward.spiritStones.high || 0}` : '0/0/0'] }), Array.isArray(m.reward.items) && m.reward.items.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6 }, children: ["Items:", (0, jsx_runtime_1.jsx)("ul", { children: m.reward.items.map((it, i) => (0, jsx_runtime_1.jsx)("li", { children: it.name || it.id || JSON.stringify(it) }, i)) })] }))] }))] }))] }, m.id)))) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No active sect missions." }))] }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Developer Notes", children: (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "This is a lightweight scaffold for the Sect/Inventory hub. Use this screen to build sect-specific features (missions, reputation, sect stores, relics) and to surface inventory interactions tied to sect progression." }) })] }), (0, jsx_runtime_1.jsx)(ToastContainer_1.default, {})] }));
};
exports.default = SectPanel;
