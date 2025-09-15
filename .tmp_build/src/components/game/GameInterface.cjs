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
const SectSystem_1 = require("../../systems/SectSystem");
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
const FactionStandingPanel_1 = require("../info/FactionStandingPanel");
const CultivationUI_1 = require("../CultivationUI");
const TutorialOverlay_1 = require("../tutorial/TutorialOverlay");
const realmHelpers_1 = require("../../utils/realmHelpers");
function GameInterface() {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, realms, eventLog, cultivate, explore, saveGame, loadGame, ui, setUIProperty, world, story, getQuestsByType, clearQuestCompletionNotification, requestSectMission, seekRefuge, startRivalEncounter, startCombatWithRival, updateObjectiveProgress, checkEnhancedQuestCompletion, getActiveEnhancedQuests, checkDailyReset, } = store;
    const { selectedRival } = ui;
    // Normalized realm key for UI/display (falls back safely for legacy state)
    const currentRealmKey = (0, realmHelpers_1.getRealmKeyFromPlayer)(player);
    const closeRivalModal = () => setUIProperty('selectedRival', null);
    const [showCultivation, setShowCultivation] = (0, react_1.useState)(false);
    // we only need the setter in this component; ignore the first tuple element to avoid unused var warning
    const [, setActiveQuests] = (0, react_1.useState)([]);
    const [completedQuest, setCompletedQuest] = (0, react_1.useState)(null);
    const realmProgress = player.qiRequired > 0 ? (player.currentQi / player.qiRequired) * 100 : 0;
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
    }, [player.realmId, player.sect, player.skills, player.inventory, player.defeatedRivals, player.dailyCultivationCount, completedQuest, checkEnhancedQuestCompletion, getActiveEnhancedQuests, updateObjectiveProgress]);
    // Check for quest completion when player state or quests change
    (0, react_1.useEffect)(() => {
        if (!story?.quests)
            return;
        // Trigger completion check (side-effects handled elsewhere).
        // Intentionally exclude `checkQuestCompletion` from deps because it's a stable
        // top-level system function whose identity may not affect the hook's re-run.
        (0, QuestSystem_1.checkQuestCompletion)({ player, story });
    }, [player, story]);
    const handleCultivate = () => performActionAndCheckEvolutions(cultivate);
    const handleExplore = () => performActionAndCheckEvolutions(explore);
    const handleRequestSectMission = () => requestSectMission();
    const toggleCodex = () => {
        setUIProperty('showCodex', !ui.showCodex);
    };
    // If combat is active, render combat UI full-screen
    if (ui.currentScreen === 'combat') {
        return (0, jsx_runtime_1.jsx)(CombatUI_1.default, {});
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '100vh' }, children: [(0, jsx_runtime_1.jsx)(TutorialOverlay_1.TutorialOverlay, {}), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    gap: 8,
                    padding: '10px 20px',
                    position: 'sticky',
                    top: 0,
                    background: 'linear-gradient(135deg, var(--dark), var(--darker))',
                    zIndex: 5,
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('currentScreen', 'game'), style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: ui.currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer'
                        }, children: "Core" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('currentScreen', 'social'), style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: ui.currentScreen === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer'
                        }, children: "Social" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('currentScreen', 'tutorial'), style: {
                            marginLeft: 'auto',
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer'
                        }, children: "Tutorial" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('compactLayout', !ui.compactLayout), title: "Toggle minimal UI", style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: ui.compactLayout ? 'rgba(212,175,55,0.15)' : 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            marginLeft: 8
                        }, children: "Minimal UI" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                            try {
                                localStorage.removeItem('xg_tutorial_seen');
                            }
                            catch (e) { /* ignore storage errors */
                                console.debug('GameInterface: localStorage removeItem failed', e);
                            }
                            setUIProperty('currentScreen', 'tutorial');
                        }, title: "Show tutorial overlay", style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(212,175,55,0.25)',
                            background: 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            marginLeft: 8
                        }, children: "Show Tutorial" })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: ui.compactLayout ? '200px 1fr' : '300px 1fr 300px',
                    gap: '20px',
                    padding: '20px'
                }, children: [(0, jsx_runtime_1.jsx)(ChoiceModal_1.ChoiceModal, {}), (0, jsx_runtime_1.jsx)(Codex_1.CodexModal, { open: ui.showCodex, onClose: toggleCodex }), showCultivation && ((0, jsx_runtime_1.jsx)(CultivationUI_1.CultivationUI, { onClose: () => setShowCultivation(false) })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '20px', alignContent: 'start' }, children: [ui.selectedRival && ((0, jsx_runtime_1.jsx)("div", { style: {
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500
                                }, children: (0, jsx_runtime_1.jsx)("div", { style: { backgroundColor: 'var(--dark)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }, children: (0, jsx_runtime_1.jsx)(RivalInfoPanel_1.RivalInfoPanel, { rivalId: ui.selectedRival, onClose: () => setUIProperty('selectedRival', null), onChallenge: (rid) => {
                                            startRivalEncounter(rid);
                                            setUIProperty('selectedRival', null);
                                        } }) }) })), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Character", children: (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', marginBottom: '15px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '2rem', marginBottom: '5px' }, children: "\uD83D\uDC64" }), (0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--primary)', marginBottom: '5px' }, children: player.name || 'Cultivator' }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: [player.race, " ", player.gender, " \u2022 Age ", player.age] }), player.sect && ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--accent)', fontSize: '0.9rem', marginTop: '5px', fontWeight: 'bold' }, children: SectSystem_1.MAJOR_SECTS.find(s => s.id === player.sect)?.name || 'Unknown Sect' }))] }) }), player.talentId && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83C\uDF1F Talent", children: (0, jsx_runtime_1.jsx)(TalentInfoPanel_1.TalentInfoPanel, { talentId: player.talentId }) })), player.bloodline && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83E\uDE78 Bloodline", children: (0, jsx_runtime_1.jsx)(BloodlineInfoPanel_1.BloodlineInfoPanel, { bloodline: player.bloodline }) })), player.physique && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCAA Physique", children: (0, jsx_runtime_1.jsx)(PhysiqueInfoPanel_1.PhysiqueInfoPanel, { physique: player.physique }) })), (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "Cultivation Progress", children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: realms[currentRealmKey]?.name || currentRealmKey }), player.minorStage > 1 && ((0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)', fontSize: '0.9rem', marginLeft: '5px' }, children: ["Stage ", player.minorStage] }))] }), (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: realmProgress, max: 100 }), (0, jsx_runtime_1.jsxs)("p", { style: { textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)', marginTop: '5px' }, children: ["Progress: ", Math.floor(realmProgress), "%"] })] }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Stats", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '8px', fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Cultivation Power:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--primary)' }, children: player.cultivationPower })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Insight:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--accent)' }, children: player.insight })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Karma:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: player.karma >= 0 ? 'var(--success)' : 'var(--danger)' }, children: player.karma })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "Spirit Stones:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--primary)' }, children: [player.spiritStones.low, "L / ", player.spiritStones.mid, "M / ", player.spiritStones.high, "H"] })] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'grid',
                            gap: '20px',
                            alignContent: 'start'
                        }, children: [(0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83E\uDDD8 Cultivation Methods", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '15px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleCultivate, size: "large", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.1rem', marginBottom: '5px' }, children: "\uD83E\uDDD8 Quick Cultivate" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', color: 'var(--muted)' }, children: "Rapid cultivation session with automatic breakthroughs" })] }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setShowCultivation(true), size: "large", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.1rem', marginBottom: '5px' }, children: "\uD83C\uDFAE Interactive Cultivation" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', color: 'var(--muted)' }, children: "Enter cultivation mode with minigames and breakthroughs" })] }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleExplore, size: "large", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.1rem', marginBottom: '5px' }, children: "\uD83C\uDFD4\uFE0F Explore" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', color: 'var(--muted)' }, children: "Venture into the wilderness seeking opportunities and treasures" })] }) })] }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCBE Game Management", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: saveGame, children: "\uD83D\uDCBE Save Game" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: loadGame, children: "\uD83D\uDCC1 Load Game" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: toggleCodex, variant: "secondary", children: "\uD83D\uDCDA Codex" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'rebellion'), variant: "secondary", children: "\u2694\uFE0F Rebellion Mastery" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'sects'), variant: "secondary", children: "\uD83D\uDED5 Join a Sect" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'market'), variant: "secondary", children: "\uD83C\uDFEA Market" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => setUIProperty('currentScreen', 'mentors'), variant: "secondary", children: "\uD83E\uDDD9 Mentor Teachings" }), player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: handleRequestSectMission, variant: "secondary", children: "\uD83D\uDCDC Request Sect Mission" })), world.flags.expelledFrom && !player.sect && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: seekRefuge, variant: "danger", children: "\u2694\uFE0F Seek Refuge" }))] }) })] }), !ui.compactLayout && ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '20px', alignContent: 'start' }, children: [(0, jsx_runtime_1.jsx)(EnhancedQuestPanel_1.EnhancedQuestPanel, { quests: getQuestsByType('main'), showType: "main", maxQuests: 3 }), (0, jsx_runtime_1.jsx)(EnhancedQuestPanel_1.EnhancedQuestPanel, { quests: getQuestsByType('daily'), showType: "daily", maxQuests: 2 }), (0, jsx_runtime_1.jsx)(StoryEventPanel_1.StoryEventPanel, {}), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Faction Standings", children: (0, jsx_runtime_1.jsx)(FactionStandingPanel_1.FactionStandingPanel, {}) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCDC Event Log", children: (0, jsx_runtime_1.jsx)("div", { style: { maxHeight: '300px', overflowY: 'auto', fontSize: '0.9rem' }, children: eventLog.slice(-10).map((event, index) => ((0, jsx_runtime_1.jsx)("div", { style: { padding: '5px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }, children: event }, index))) }) }), (0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\u2B50 Realm List", children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: Object.entries(realms).map(([realmKey, realmData], index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                            padding: '5px',
                                            color: realmKey === currentRealmKey ? 'var(--primary)' : 'var(--muted)',
                                            fontWeight: realmKey === currentRealmKey ? 'bold' : 'normal'
                                        }, children: [index + 1, ". ", realmData.name || realmKey] }, realmKey))) }) })] }))] }), ui.showNotes && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', right: 12, bottom: 12, width: 300, zIndex: 1200 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: 'var(--card-bg)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: 10 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: "Notes" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('showNotes', false), style: { background: 'none', border: 'none', cursor: 'pointer' }, children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Quick notes...", style: { width: '100%', height: 120, borderRadius: 6, padding: 8 } }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setUIProperty('showNotes', false), style: { padding: '6px 8px' }, children: "Close" }), (0, jsx_runtime_1.jsx)("button", { style: { padding: '6px 8px' }, children: "Save" })] })] }) })), selectedRival && ((0, jsx_runtime_1.jsx)("div", { style: {
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
                    } }) })), (0, jsx_runtime_1.jsx)(QuestCompletionNotification_1.QuestCompletionNotification, { quest: completedQuest, onClose: () => {
                    setCompletedQuest(null);
                    clearQuestCompletionNotification();
                }, duration: 6000 })] }));
}
