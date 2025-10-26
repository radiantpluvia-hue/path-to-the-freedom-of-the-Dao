"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainQuestPanel = MainQuestPanel;
exports.SectQuestsPanel = SectQuestsPanel;
exports.BetrayalMissionsPanel = BetrayalMissionsPanel;
exports.RandomMissionsPanel = RandomMissionsPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const Button_1 = require("@/components/core/Button");
const Card_1 = require("@/components/core/Card");
const storyData_1 = require("@/events/storyData");
const revengeQuests_1 = require("./revengeQuests");
function MainQuestPanel() {
    const { getActiveQuests, getCurrentAct } = (0, useGameStore_1.useGameStore)(state => ({
        getActiveQuests: state.getActiveQuests,
        getCurrentAct: state.getCurrentAct
    }));
    const activeQuests = getActiveQuests();
    const currentAct = getCurrentAct();
    if (!currentAct || activeQuests.length === 0) {
        return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCDC Main Quests", children: (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "No active quests. Continue your cultivation journey to unlock new quests." }) }));
    }
    // Show main quests (filter out side quests if needed)
    const mainQuests = activeQuests.filter((quest) => currentAct.mainQuests?.some((mq) => mq.id === quest.id));
    if (mainQuests.length === 0) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '15px' }, children: mainQuests.map((quest) => ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: `📜 ${quest.title}`, children: [(0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', marginBottom: '15px', fontSize: '0.9rem', lineHeight: 1.4 }, children: quest.description }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '8px', fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Objectives:" }), quest.objectives.map((obj, index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: obj.isCompleted ? 0.5 : 1
                            }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["- ", obj.description] }), obj.isCompleted && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { color: 'var(--success)', marginLeft: 8 }, children: "\u2713" }))] }, index)))] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '12px', fontSize: '0.8rem', color: 'var(--muted)' }, children: ["Status: ", (0, jsx_runtime_1.jsx)("span", { style: { color: quest.status === 'completed' ? 'var(--success)' : 'var(--primary)' }, children: quest.status.charAt(0).toUpperCase() + quest.status.slice(1) })] })] }, quest.id))) }));
}
function SectQuestsPanel() {
    const { story, player, addEventLog } = (0, useGameStore_1.useGameStore)(state => ({
        story: state.story,
        player: state.player,
        addEventLog: state.addEventLog,
    }));
    if (!player.sect || story.activeSectQuests.length === 0) {
        return null;
    }
    const getQuestData = (questId) => {
        const sectId = player.sect;
        return storyData_1.sectQuests[sectId]?.[questId] || revengeQuests_1.revengeQuests[sectId]?.[questId];
    };
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: story.activeSectQuests.map(questId => {
            const quest = getQuestData(questId);
            if (!quest)
                return null;
            return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: `🛕 ${quest.title}`, children: [(0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', marginBottom: '15px', fontSize: '0.9rem', lineHeight: 1.4 }, children: quest.description }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '8px', fontSize: '0.9rem' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Objectives:" }), quest.objectives.map((obj, index) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: obj.isCompleted(useGameStore_1.useGameStore.getState()) ? 0.5 : 1 }, children: [(0, jsx_runtime_1.jsxs)("span", { children: ["- ", obj.description] }), obj.type === 'trigger_event' && !obj.isCompleted(useGameStore_1.useGameStore.getState()) && ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => addEventLog(`Trigger event: ${String(obj.target)}`), size: "small", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Begin" }) })), obj.isCompleted(useGameStore_1.useGameStore.getState()) && ((0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--success)' }, children: "\u2713" }))] }, index)))] })] }, quest.id));
        }) }));
}
function BetrayalMissionsPanel() {
    const { story, addEventLog } = (0, useGameStore_1.useGameStore)(state => ({
        story: state.story,
        addEventLog: state.addEventLog,
    }));
    if (!story.activeBetrayalMissions || story.activeBetrayalMissions.length === 0) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83E\uDD2B Secret Missions", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '15px' }, children: story.activeBetrayalMissions.map(mission => ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--danger)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(255, 0, 0, 0.05)' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--danger)' }, children: mission.title }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', fontSize: '0.85rem', margin: '5px 0' }, children: mission.description }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => addEventLog(`Complete betrayal mission: ${mission.id}`), size: "small", variant: "danger", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { variant: "danger", children: "Complete Task" }) })] }, mission.id))) }) }));
}
function RandomMissionsPanel() {
    const { story, player, attemptMission } = (0, useGameStore_1.useGameStore)(state => ({
        story: state.story,
        player: state.player,
        attemptMission: state.attemptMission,
    }));
    if (!player.sect || story.activeRandomMissions.length === 0) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "Sect Missions", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '15px' }, children: story.activeRandomMissions.map((mission) => ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid var(--border)', padding: '10px', borderRadius: '4px' }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: mission.title }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', fontSize: '0.85rem', margin: '5px 0' }, children: mission.description }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px', marginTop: '8px' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => attemptMission(mission.id), size: "small", children: "Attempt Mission" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: 'var(--muted)' }, children: ["Location: ", mission.location] })] })] }, mission.id))) }) }));
}
