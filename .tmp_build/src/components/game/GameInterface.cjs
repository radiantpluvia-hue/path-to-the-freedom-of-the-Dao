"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameInterface = GameInterface;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- imports core systems intentionally for integration UI */
const useGameStore_1 = require("../../store/useGameStore");
const Button_1 = require("../core/Button");
const Card_1 = require("../core/Card");
const Progress_1 = require("../core/Progress");
const PhysiqueInfoPanel_1 = require("../info/PhysiqueInfoPanel");
const BloodlineInfoPanel_1 = require("../info/BloodlineInfoPanel");
const TalentInfoPanel_1 = require("../info/TalentInfoPanel");
const react_1 = require("react");
const EventLog_1 = __importDefault(require("../EventLog"));
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const logger_1 = require("@/utils/logger");
const SmallChip_1 = __importDefault(require("../ui/SmallChip"));
// These imports seem to have incorrect paths and are not used.
// import { MainQuestPanel, SectQuestsPanel, BetrayalMissionsPanel, RandomMissionsPanel } from '../../../QuestPanels';
const CombatUI_1 = __importDefault(require("../CombatUI"));
const StoryEventPanel_1 = require("../StoryEventPanel");
const QuestSystem_1 = require("../../systems/QuestSystem");
const EnhancedQuestPanel_1 = require("../quest/EnhancedQuestPanel");
const QuestCompletionNotification_1 = require("../quest/QuestCompletionNotification");
// import { RivalsPanel } from '../../../RivalsPanel'; // Not used
const ChoiceModal_1 = require("../../../ChoiceModal");
const Codex_1 = require("../Codex");
const RivalInfoPanel_1 = require("../info/RivalInfoPanel");
const TopBar_1 = __importDefault(require("./TopBar"));
const CharacterPanel_1 = __importDefault(require("./CharacterPanel"));
const FactionStandingPanel_1 = require("../info/FactionStandingPanel");
const CultivationUI_1 = require("../CultivationUI");
const TutorialOverlay_1 = require("../tutorial/TutorialOverlay");
const realmHelpers_1 = require("../../utils/realmHelpers");
const all_skills_json_1 = __importDefault(require("../../data/skills/all_skills.json"));
const MusicSettings_1 = __importDefault(require("./MusicSettings"));
const TrainModal_1 = __importDefault(require("./TrainModal"));
const SeclusionPanel_1 = __importDefault(require("../SeclusionPanel"));
const InventoryPanel_1 = __importDefault(require("./InventoryPanel"));
const ReincarnationModal_1 = __importDefault(require("./ReincarnationModal"));
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
function GameInterface() {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, realms, eventLog, cultivate, explore, saveGame, ui, setUIProperty, addEventLog, world, story, getQuestsByType, clearQuestCompletionNotification, requestSectMission, seekRefuge, startRivalEncounter, startCombatWithRival, updateObjectiveProgress, checkEnhancedQuestCompletion, getActiveEnhancedQuests, checkDailyReset, } = store;
    // Autosave: periodically save the game when enabled in UI settings
    (0, react_1.useEffect)(() => {
        try {
            const enabled = ui.autosaveEnabled !== false;
            const interval = Number(ui.autosaveIntervalMs || 60000);
            if (!enabled)
                return;
            const id = setInterval(() => {
                try {
                    saveGame && saveGame();
                }
                catch (e) { /* ignore */ }
            }, Math.max(5000, interval));
            return () => clearInterval(id);
        }
        catch (e) { /* ignore */ }
    }, [saveGame, ui]);
    const { selectedRival } = ui;
    // Normalized realm key for UI/display (falls back safely for legacy state)
    const currentRealmKey = (0, realmHelpers_1.getRealmKeyFromPlayer)(player);
    const closeRivalModal = () => setUIProperty('selectedRival', null);
    const [showCultivation, setShowCultivation] = (0, react_1.useState)(false);
    const [showTraining, setShowTraining] = (0, react_1.useState)(false);
    const [showSeclusion, setShowSeclusion] = (0, react_1.useState)(false);
    const [showBreakthroughPicker, setShowBreakthroughPicker] = (0, react_1.useState)(false);
    const [showRecentTrainingSummary, setShowRecentTrainingSummary] = (0, react_1.useState)(false);
    const [availableChallenges, setAvailableChallenges] = (0, react_1.useState)([]);
    // we only need the setter in this component; ignore the first tuple element to avoid unused var warning
    const [, setActiveQuests] = (0, react_1.useState)([]);
    const [completedQuest, setCompletedQuest] = (0, react_1.useState)(null);
    const realmProgress = player.qiRequired > 0 ? (player.currentQi / player.qiRequired) * 100 : 0;
    // Lock cultivate and methods until the player has a manual item in inventory
    const hasManual = Array.isArray(player?.inventory)
        ? player.inventory.some((i) => i && (i.type === 'manual' || i.category === 'manual'))
        : (Array.isArray(player.manuals) && player.manuals.length > 0);
    // intentionally-unused binding (event log handled by EventLog component)
    void eventLog;
    const performActionAndCheckEvolutions = (action) => {
        action();
        // Check quest completion after any action
        const result = checkEnhancedQuestCompletion();
        if (result.completed.length > 0) {
            setCompletedQuest(result.completed[0]); // Show first completed quest
        }
        // Update active quests
        setActiveQuests(getActiveEnhancedQuests());
    };
    // Initialize and update quests on mount
    (0, react_1.useEffect)(() => {
        // Check for daily reset first
        checkDailyReset();
        setActiveQuests(getActiveEnhancedQuests());
        // Check for quest completion on component mount
        const result = checkEnhancedQuestCompletion();
        if (result.completed.length > 0) {
            setCompletedQuest(result.completed[0]);
        }
    }, [checkDailyReset, getActiveEnhancedQuests, checkEnhancedQuestCompletion]); // Run once on mount
    // Update quest progress when player state changes
    (0, react_1.useEffect)(() => {
        // Update cultivation progress for daily quests
        if (player.dailyCultivationCount !== undefined) {
            updateObjectiveProgress('daily_cultivation', 'cultivate_three_times', player.dailyCultivationCount);
        }
        // Check for quest completion
        const result = checkEnhancedQuestCompletion();
        if (result.completed.length > 0 && !completedQuest) {
            setCompletedQuest(result.completed[0]);
        }
        // Update active quests list
        setActiveQuests(getActiveEnhancedQuests());
    }, [currentRealmKey, player.sect, player.skills, player.inventory, player.defeatedRivals, player.dailyCultivationCount, completedQuest, checkEnhancedQuestCompletion, getActiveEnhancedQuests, updateObjectiveProgress]);
    // Transient UI: show a small summary when recent training stat deltas are present
    (0, react_1.useEffect)(() => {
        try {
            const deltas = player.recentStatDelta;
            if (deltas && Object.keys(deltas).length > 0) {
                setShowRecentTrainingSummary(true);
                const id = setTimeout(() => setShowRecentTrainingSummary(false), 6000);
                return () => clearTimeout(id);
            }
        }
        catch (e) { /* ignore */ }
        return;
    }, [player.recentStatDelta]);
    // Check for quest completion when player state or quests change
    (0, react_1.useEffect)(() => {
        if (!story?.quests)
            return;
        // Trigger completion check (side-effects handled elsewhere).
        // Intentionally exclude `checkQuestCompletion` from deps because it's a stable
        // top-level system function whose identity may not affect the hook's re-run.
        (0, QuestSystem_1.checkQuestCompletion)({ player, story });
    }, [player, story]);
    const handleCultivate = () => {
        try {
            // If currently cultivating (manual session) then stop cultivating
            if (ui.isCultivating && !ui._cultivationTimerId) {
                try {
                    store.stopCultivation?.();
                }
                catch (e) { /* ignore */ }
                return;
            }
            // Prevent cultivating when the player has no learned manuals — provide a helpful log message.
            if (!hasManual && !ui.isCultivating) {
                addEventLog?.('You need a cultivation manual to cultivate. Find one via Work or Explore.');
                return;
            }
            performActionAndCheckEvolutions(cultivate);
        }
        catch (e) {
            // swallow errors from optional bindings in tests/mocks
        }
    };
    const handleExplore = () => performActionAndCheckEvolutions(explore);
    const handleWork = () => performActionAndCheckEvolutions(store.workJob || (() => { }));
    // EventLog component handles its own auto-scroll
    const handleRequestSectMission = () => requestSectMission();
    const toggleCodex = () => {
        setUIProperty('showCodex', !ui.showCodex);
    };
    // If combat is active, render combat UI full-screen
    if (ui.currentScreen === 'combat') {
        return (0, jsx_runtime_1.jsx)(CombatUI_1.default, {});
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '100vh' }, children: [(0, jsx_runtime_1.jsx)(TutorialOverlay_1.TutorialOverlay, {}), (0, jsx_runtime_1.jsx)(TopBar_1.default, { currentScreen: ui.currentScreen, compactLayout: ui.compactLayout, showRealmList: ui.showRealmList, setUIProperty: setUIProperty }), (0, jsx_runtime_1.jsxs)("div", { className: `main-grid ${ui.compactLayout ? 'compact' : ''}`, children: [(0, jsx_runtime_1.jsx)(ChoiceModal_1.ChoiceModal, {}), (0, jsx_runtime_1.jsx)(Codex_1.CodexModal, { open: ui.showCodex, onClose: toggleCodex }), showCultivation && ((0, jsx_runtime_1.jsx)(CultivationUI_1.CultivationUI, { onClose: () => setShowCultivation(false) })), showTraining && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(TrainModal_1.default, { open: showTraining, onClose: () => setShowTraining(false) }), player.recentStatDelta && Object.keys(player.recentStatDelta).length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', right: 24, top: 80, zIndex: 2100 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text)', minWidth: 180 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold', marginBottom: 6 }, children: "Recent Training" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: [player.recentStatDelta.atk ? (0, jsx_runtime_1.jsxs)("div", { children: ["\u2694\uFE0F ATK: ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: 'var(--success)' }, children: ["+", player.recentStatDelta.atk] })] }) : null, player.recentStatDelta.def ? (0, jsx_runtime_1.jsxs)("div", { children: ["\uD83D\uDEE1\uFE0F DEF: ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: 'var(--success)' }, children: ["+", player.recentStatDelta.def] })] }) : null, player.recentStatDelta.speed ? (0, jsx_runtime_1.jsxs)("div", { children: ["\uD83C\uDFC3 SPD: ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: 'var(--success)' }, children: ["+", player.recentStatDelta.speed] })] }) : null, player.recentStatDelta.insight ? (0, jsx_runtime_1.jsxs)("div", { children: ["\uD83D\uDCD8 INS: ", (0, jsx_runtime_1.jsxs)("strong", { style: { color: 'var(--success)' }, children: ["+", player.recentStatDelta.insight] })] }) : null] })] }) }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "left-sidebar", style: { position: 'relative', zIndex: 60 }, children: [ui.selectedRival && ((0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500
                                }, children: (0, jsx_runtime_1.jsx)("div", { style: { backgroundColor: 'var(--dark)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }, children: (0, jsx_runtime_1.jsx)(RivalInfoPanel_1.RivalInfoPanel, { rivalId: ui.selectedRival, onClose: () => setUIProperty('selectedRival', null), onChallenge: (rid) => {
                                            startRivalEncounter(rid);
                                            setUIProperty('selectedRival', null);
                                        } }) }) })), (0, jsx_runtime_1.jsx)(CharacterPanel_1.default, { player: player, setUIProperty: setUIProperty }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDF1F Talent", children: player.talentId ? ((0, jsx_runtime_1.jsx)(TalentInfoPanel_1.TalentInfoPanel, { talentId: player.talentId })) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "No talent selected \u2014 pick one during character creation or via events." })) }), player.bloodline && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83E\uDE78 Bloodline", children: (0, jsx_runtime_1.jsx)(BloodlineInfoPanel_1.BloodlineInfoPanel, { bloodline: player.bloodline }) })), showBreakthroughPicker && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: "Choose a Breakthrough Challenge" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8, marginTop: 12 }, children: availableChallenges && availableChallenges.length ? (availableChallenges.map((c) => ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 12, borderRadius: 6, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: c.name || c.id }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }, children: c.description })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                                try {
                                                                    setShowBreakthroughPicker(false);
                                                                    if (typeof store.attemptRealmBreakthroughWithConsolidation === 'function') {
                                                                        store.attemptRealmBreakthroughWithConsolidation(c.id);
                                                                    }
                                                                    else {
                                                                        // fallback: call a generic attempt API if available
                                                                        store.checkRealmBreakthrough?.();
                                                                    }
                                                                }
                                                                catch (e) { /* ignore */ }
                                                            }, style: { padding: '8px 12px' }, children: "Attempt" }) })] }, c.id)))) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No challenges available. Improve your cultivation foundation before attempting." })) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowBreakthroughPicker(false), style: { padding: '8px 12px' }, children: "Close" }) })] }) })), player.physique && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCAA Physique", children: (0, jsx_runtime_1.jsx)(PhysiqueInfoPanel_1.PhysiqueInfoPanel, { physique: player.physique }) })), (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "Cultivation Progress", children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: realms[currentRealmKey]?.name || currentRealmKey }), (player.minorStage ?? 0) >= 1 && ((0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)', fontSize: '0.9rem', marginLeft: '5px' }, children: ["Stage ", player.minorStage || 1] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", onClick: handleCultivate, 
                                                        // Keep the button disabled only while auto-cultivating; allow clicks when no manual so
                                                        // the UI can provide a helpful log message via handleCultivate.
                                                        disabled: ui._cultivationTimerId != null, ariaLabel: !hasManual && !ui.isCultivating ? 'You need a cultivation manual to cultivate. Find one via Work or Explore.' : undefined, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: (ui.isCultivating && !ui._cultivationTimerId ? 'Stop' : 'Cultivate') }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", variant: "secondary", disabled: ui.isCultivating === true, onClick: () => {
                                                            try {
                                                                const progress = Number((ui.cultivationProgress ?? realmProgress)) || 0;
                                                                const realmKey = (0, realmHelpers_1.getRealmKeyFromPlayer)(player);
                                                                if (progress >= 100) {
                                                                    // Show a modal allowing the player to pick a breakthrough challenge
                                                                    const challenges = store.breakthroughSystem?.getAvailableChallenges?.(realmKey) || [];
                                                                    setAvailableChallenges(Array.isArray(challenges) ? challenges : []);
                                                                    setShowBreakthroughPicker(true);
                                                                }
                                                                else {
                                                                    store.advanceMinorStage?.();
                                                                }
                                                            }
                                                            catch (e) {
                                                                /* no-op */
                                                            }
                                                        }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Advance Stage / Breakthrough" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", variant: "secondary", onClick: () => setShowTraining(true), children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Train" }) })] })] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: Number((ui.cultivationProgress ?? realmProgress).toFixed ? ui.cultivationProgress : realmProgress), max: 100 }), (0, jsx_runtime_1.jsxs)("p", { style: { textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)', marginTop: '5px' }, children: ["Progress: ", Math.floor((ui.cultivationProgress ?? realmProgress)), "%"] }), ui.isCultivating && ((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }, children: "Auto-cultivating\u2026 other activities are disabled until you stop." }))] }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Stats", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '8px', fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "HP:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--primary)' }, children: [player.hp, "/", player.maxHp] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Qi:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--primary)' }, children: player.maxQi ?? (player.stats?.qi || 0) })] }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: (player.recentStatDelta?.atk ? `+${player.recentStatDelta.atk} from recent training` : ''), children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "ATK:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)' }, children: [player.stats?.atk ?? 0, player.recentStatDelta?.atk ? (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }, children: ["+", player.recentStatDelta.atk] }) : null] })] }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: (player.recentStatDelta?.def ? `+${player.recentStatDelta.def} from recent training` : ''), children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "DEF:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)' }, children: [player.stats?.def ?? 0, player.recentStatDelta?.def ? (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }, children: ["+", player.recentStatDelta.def] }) : null] })] }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: (player.recentStatDelta?.speed ? `+${player.recentStatDelta.speed} from recent training` : ''), children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Speed:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)' }, children: [player.stats?.speed ?? 0, player.recentStatDelta?.speed ? (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }, children: ["+", player.recentStatDelta.speed] }) : null] })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Cultivation Power:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--primary)' }, children: player.cultivationPower })] }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: (player.recentStatDelta?.insight ? `+${player.recentStatDelta.insight} from recent study` : ''), children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Insight:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)' }, children: [player.insight, player.recentStatDelta?.insight ? (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }, children: ["+", player.recentStatDelta.insight] }) : null] })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Karma:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: (player.karma ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' }, children: player.karma ?? 0 })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Spirit Stones:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--primary)' }, children: [player.spiritStones.low, "L / ", player.spiritStones.mid, "M / ", player.spiritStones.high, "H"] })] }), Array.isArray(player.passiveIds) && player.passiveIds.length > 0 && (() => {
                                            const counts = { S: 0, A: 0, B: 0, C: 0 };
                                            player.passiveIds.forEach((pid) => {
                                                const def = all_skills_json_1.default.find((s) => s.id === pid);
                                                const tier = (def && def.tier) ? String(def.tier).toUpperCase() : 'C';
                                                if (!counts[tier])
                                                    counts[tier] = 0;
                                                counts[tier] += 1;
                                            });
                                            return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "Passive Tiers" }), (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { color: 'var(--accent)' }, children: `S(${counts.S}) A(${counts.A}) B(${counts.B}) C(${counts.C})` })] }));
                                        })()] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "main-content", style: { paddingLeft: 24, position: 'relative', zIndex: 20 }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83E\uDDD8 Cultivation Methods", compact: true, style: { width: '90%', overflow: 'hidden', boxSizing: 'border-box' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setShowCultivation(true), size: "medium", disabled: !hasManual, ariaLabel: !hasManual ? 'You need a cultivation manual to unlock this feature.' : undefined, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1rem', marginBottom: '4px' }, children: "\uD83C\uDFAE Interactive Cultivation" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: "Enter cultivation mode with minigames and breakthroughs" })] }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleExplore, size: "medium", disabled: ui.isCultivating === true, ariaLabel: undefined, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1rem', marginBottom: '4px' }, children: "\uD83C\uDFD4\uFE0F Explore" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: "Venture into the wilderness seeking opportunities and treasures" })] }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleWork, size: "medium", disabled: ui.isCultivating === true, ariaLabel: undefined, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1rem', marginBottom: '4px' }, children: "\uD83D\uDEE0\uFE0F Work a Job" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: "Earn yuan and maybe discover a manual while working" })] }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setShowTraining(true), size: "medium", disabled: ui.isCultivating === true, ariaLabel: undefined, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1rem', marginBottom: '4px' }, children: "\uD83C\uDFCB\uFE0F Training" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: "Comprehend manuals, temper your body, and train martial arts" })] }) }), showRecentTrainingSummary && player.recentStatDelta && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, padding: '8px', borderRadius: 6, background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold', marginBottom: 6 }, children: "Recent Training" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 10 }, children: [player.recentStatDelta.atk ? (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--success)' }, children: ["ATK +", player.recentStatDelta.atk] }) : null, player.recentStatDelta.def ? (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--success)' }, children: ["DEF +", player.recentStatDelta.def] }) : null, player.recentStatDelta.speed ? (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--success)' }, children: ["SPD +", player.recentStatDelta.speed] }) : null, player.recentStatDelta.insight ? (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--success)' }, children: ["INS +", player.recentStatDelta.insight] }) : null] })] })), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setShowSeclusion(true), size: "medium", disabled: ui.isCultivating === true, ariaLabel: undefined, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1rem', marginBottom: '4px' }, children: "\uD83C\uDF32 Seclusion" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: "Enter seclusion to quietly study and accumulate comprehension over time" })] }) })] }) }), (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "\uD83D\uDCBE Game Management", compact: true, style: { width: '100%', boxSizing: 'border-box' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: toggleCodex, variant: "secondary", size: "small", children: "\uD83D\uDCDA Codex" }), !player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'sects'), variant: "secondary", size: "small", children: "\uD83D\uDED5 Join a Sect" })), player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'sect-hub'), variant: "secondary", size: "small", children: "\uD83C\uDFDB\uFE0F Sect Hub" })), player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                                    store.leaveSect?.();
                                                    addEventLog?.('You left your sect.');
                                                }
                                                catch (e) { /* ignore */ } }, variant: "danger", size: "small", children: "\uD83D\uDEAA Leave Sect" })), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'market'), variant: "secondary", size: "small", children: "\uD83C\uDFEA Market" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'mentors'), variant: "secondary", size: "small", children: "\uD83E\uDDD9 Mentor Teachings" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('showInventoryModal', true), variant: "secondary", size: "small", children: "\uD83C\uDF92 Inventory" }), player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleRequestSectMission, variant: "secondary", size: "small", children: "\uD83D\uDCDC Request Sect Mission" })), world.flags.expelledFrom && !player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: seekRefuge, variant: "danger", size: "small", children: "\u2694\uFE0F Seek Refuge" }))] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCDC Event Log", compact: true, children: (0, jsx_runtime_1.jsx)(EventLog_1.default, { maxVisible: 12 }) }) })] })] }), !ui.compactLayout && ((0, jsx_runtime_1.jsxs)("div", { className: "right-sidebar", children: [(0, jsx_runtime_1.jsx)(EnhancedQuestPanel_1.EnhancedQuestPanel, { quests: getQuestsByType('main'), showType: "main", maxQuests: 3 }), (0, jsx_runtime_1.jsx)(EnhancedQuestPanel_1.EnhancedQuestPanel, { quests: getQuestsByType('daily'), showType: "daily", maxQuests: 2 }), (0, jsx_runtime_1.jsx)(StoryEventPanel_1.StoryEventPanel, {}), (world.currentWorldType && world.currentWorldType !== 'mortal') && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Faction Standings", children: (0, jsx_runtime_1.jsx)(FactionStandingPanel_1.FactionStandingPanel, {}) })), ui.showRealmList !== false && ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "\u2B50 Realm List", children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "Available Realms" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty('showRealmList', false), style: { background: 'none', border: 'none', padding: 0, cursor: 'pointer' }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 4 }, children: "Hide" }) })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: Object.entries(realms).map(([realmKey, realmData], index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                padding: '5px',
                                                color: realmKey === currentRealmKey ? 'var(--primary)' : 'var(--muted)',
                                                fontWeight: realmKey === currentRealmKey ? 'bold' : 'normal'
                                            }, children: [index + 1, ". ", realmData.name || realmKey] }, realmKey))) })] }))] }))] }), ui.showNotes && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', right: 12, bottom: 12, width: 300, zIndex: 1200 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: 'var(--card-bg)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: 10 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: "Notes" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty('showNotes', false), style: { background: 'none', border: 'none', cursor: 'pointer' }, children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Quick notes...", style: { width: '100%', height: 120, borderRadius: 6, padding: 8 } }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty('showNotes', false), style: { padding: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Close" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: { padding: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Save" }) })] })] }) })), selectedRival && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }, children: (0, jsx_runtime_1.jsx)(RivalInfoPanel_1.RivalInfoPanel, { rivalId: selectedRival, onClose: closeRivalModal, onChallenge: (rivalId) => {
                        closeRivalModal();
                        startCombatWithRival(rivalId);
                    } }) })), ui.showSettings && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1600
                }, children: (0, jsx_runtime_1.jsxs)("div", { style: { backgroundColor: 'var(--dark)', padding: 16, borderRadius: 8, minWidth: 320 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty('showSettings', false), style: { float: 'right', background: 'none', border: 'none', color: 'var(--muted)' }, children: "\u2715" }), (0, jsx_runtime_1.jsx)(MusicSettings_1.default, { onClose: () => setUIProperty('showSettings', false) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12, color: 'var(--muted)' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { marginTop: 0 }, children: "Autosave" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', gap: 6, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: ui.autosaveEnabled ?? true, onChange: (e) => setUIProperty?.('autosaveEnabled', !!e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "Enable autosave" })] }), (0, jsx_runtime_1.jsxs)("label", { style: { marginLeft: 12, color: 'var(--muted)', fontSize: '0.9rem' }, children: ["Interval (s):", (0, jsx_runtime_1.jsx)("input", { type: "number", min: 5, value: Math.max(5, Number(ui.autosaveIntervalMs || 60000) / 1000), onChange: (e) => {
                                                        const val = Math.max(5, Number(e.target.value) || 5);
                                                        setUIProperty?.('autosaveIntervalMs', Math.floor(val * 1000));
                                                    }, style: { marginLeft: 6, width: 80 } })] })] })] })] }) })), typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test' && ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty('showNarrative', true), style: { position: 'absolute', left: -9999, top: 0 }, children: "View threads" })), showSeclusion && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }, children: [(0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: () => setShowSeclusion(false), ariaLabel: "Close seclusion", title: "Close" }), (0, jsx_runtime_1.jsx)(SeclusionPanel_1.default, {})] }) })), (0, jsx_runtime_1.jsx)(ReincarnationModal_1.default, {}), ui.showInventoryModal && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 760, maxHeight: '80vh', overflow: 'auto', background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }, children: [(0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: () => setUIProperty('showInventoryModal', false), ariaLabel: "Close inventory", title: "Close" }), (0, jsx_runtime_1.jsx)(InventoryPanel_1.default, { injectedUseGameStore: useGameStore_1.useGameStore })] }) })), (() => {
                const devOn = (typeof window !== 'undefined') && window.__ERA_DEV__ === true;
                const hasState = typeof useGameStore_1.useGameStore.getState === 'function';
                const hasDev = hasState && useGameStore_1.useGameStore.getState().eraDev;
                return devOn && hasDev;
            })() ? ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'fixed', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 10px', borderRadius: 8, display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { "aria-label": "Era seed", placeholder: "Era seed", onChange: (e) => (window.__ERA_DEV_SEED__ = e.target.value), style: { padding: '4px 6px', borderRadius: 4, border: '1px solid #444', background: '#111', color: '#fff' } }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { const s = window.__ERA_DEV_SEED__ || String(Date.now()); const dev = useGameStore_1.useGameStore.getState?.().eraDev; dev?.reseedCurrent?.(s); }, style: { padding: '6px 8px', borderRadius: 6, border: '1px solid #666', background: '#222', color: '#fff', cursor: 'pointer' }, children: "Reseed Era" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { const dev = useGameStore_1.useGameStore.getState?.().eraDev; dev?.forceNext?.(); }, style: { padding: '6px 8px', borderRadius: 6, border: '1px solid #666', background: '#222', color: '#fff', cursor: 'pointer' }, children: "Next Era" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { const dev = useGameStore_1.useGameStore.getState?.().eraDev; const d = dev?.dump?.(); logger_1.logger.debug && logger_1.logger.debug('Era dump', d); }, style: { padding: '6px 8px', borderRadius: 6, border: '1px solid #666', background: '#222', color: '#fff', cursor: 'pointer' }, children: "Dump" })] })) : null, (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'test') && ((0, jsx_runtime_1.jsx)(DevEraToggle, {})), (0, jsx_runtime_1.jsx)(QuestCompletionNotification_1.QuestCompletionNotification, { quest: completedQuest, onClose: () => {
                    setCompletedQuest(null);
                    clearQuestCompletionNotification();
                }, duration: 6000 }), showBreakthroughPicker && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: "Choose a Breakthrough Challenge" }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)' }, children: "Select a breakthrough challenge to attempt. Consolidation penalties will be applied automatically based on recent cultivation speed." }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8, marginTop: 12 }, children: availableChallenges && availableChallenges.length ? (availableChallenges.map((c) => {
                                // compute a simple requirements list and consolidation summary
                                const reqs = [];
                                if (c.requirements?.skills) {
                                    Object.entries(c.requirements.skills).forEach(([sk, val]) => reqs.push(`${sk}: ${val}`));
                                }
                                if (c.requirements?.minStats) {
                                    Object.entries(c.requirements.minStats).forEach(([st, val]) => reqs.push(`${st}: ${val}`));
                                }
                                if (c.requirements?.items) {
                                    reqs.push(`Items: ${c.requirements.items.join(', ')}`);
                                }
                                if (c.requirements?.karma !== undefined) {
                                    reqs.push(`Karma >= ${c.requirements.karma}`);
                                }
                                const rewards = [];
                                if (c.rewards?.insights)
                                    rewards.push(...c.rewards.insights.map((i) => `Insight: ${i}`));
                                if (c.rewards?.stats)
                                    rewards.push(...Object.entries(c.rewards.stats).map(([k, v]) => `${k} +${v}`));
                                const ticksSpent = Math.max(0, (store.world?.tick || 0) - (player.cultivationStartTick || 0));
                                const consolidationThreshold = 3;
                                const consolidationFactor = Math.min(1, ticksSpent / consolidationThreshold);
                                const daoHeart = player.daoHeart || 0;
                                const penalty = Math.floor((1 - consolidationFactor) * daoHeart);
                                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 12, borderRadius: 6, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: c.name || c.id }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: ["Difficulty: ", Math.round(c.difficulty || 0)] })] }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }, children: c.description }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 12, marginTop: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }, children: "Requirements" }), reqs.length ? reqs.map((r, i) => (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: r }, i)) : (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "None" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }, children: "Rewards" }), rewards.length ? rewards.map((r, i) => (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: r }, i)) : (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "None" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { width: 180 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }, children: "Risks" }), c.risks && c.risks.length ? c.risks.map((r, i) => (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: r }, i)) : (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "Minor" }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }, children: "Consolidation" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: ["Ticks spent cultivating: ", ticksSpent] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: ["Consolidation factor: ", consolidationFactor.toFixed(2)] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.9rem' }, children: ["Estimated daoHeart penalty: -", penalty] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { size: "small", onClick: () => {
                                                    try {
                                                        setShowBreakthroughPicker(false);
                                                        if (typeof store.attemptRealmBreakthroughWithConsolidation === 'function') {
                                                            store.attemptRealmBreakthroughWithConsolidation(c.id);
                                                        }
                                                        else {
                                                            store.breakthroughSystem?.attemptRealmBreakthrough?.((0, realmHelpers_1.getRealmKeyFromPlayer)(player), c.id, { daoHeart: player.daoHeart || 0, stability: player.stability || 0, karma: player.karma || 0, hp: player.hp || 0 }, player.skills);
                                                        }
                                                    }
                                                    catch (e) {
                                                        void e;
                                                    }
                                                }, children: "Attempt" }) })] }, c.id));
                            })) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No breakthrough challenges available. Improve your cultivation foundation or attempt minor stage advancement." })) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => setShowBreakthroughPicker(false), children: "Close" }) })] }) }))] }));
}
// Small internal component to register a debug hotkey for toggling the Era Dev Panel
function DevEraToggle() {
    // useEffect is imported as a named import earlier
    (0, react_1.useEffect)(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.altKey && (e.key === 'e' || e.key === 'E')) {
                window.__ERA_DEV__ = !window.__ERA_DEV__;
                try {
                    logger_1.logger.debug && logger_1.logger.debug('ERA DEV toggled:', window.__ERA_DEV__);
                }
                catch (_err) {
                    void 0;
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    return null;
}
