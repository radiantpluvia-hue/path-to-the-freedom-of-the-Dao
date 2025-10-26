"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Card_1 = require("@/components/core/Card");
const Button_1 = require("@/components/core/Button");
const EnhancedQuestPanel_1 = require("./EnhancedQuestPanel");
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const useGameStore_1 = require("@/store/useGameStore");
const QuestManager = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('main');
    const [availableQuests, setAvailableQuests] = (0, react_1.useState)([]);
    const { getQuestsByType, getAvailableEnhancedQuests, activateEnhancedQuest } = (0, useGameStore_1.useGameStore)();
    (0, react_1.useEffect)(() => {
        setAvailableQuests(getAvailableEnhancedQuests());
    }, [getAvailableEnhancedQuests]);
    const tabs = [
        { id: 'main', label: 'Main Quests', icon: '📜', color: '#ef4444' },
        { id: 'side', label: 'Side Quests', icon: '📋', color: '#3b82f6' },
        { id: 'daily', label: 'Daily Quests', icon: '🌅', color: '#f59e0b' },
        { id: 'achievement', label: 'Achievements', icon: '🏆', color: '#8b5cf6' }
    ];
    // activeQuests is not used in this component; omit to avoid lint warnings
    const questsByType = getQuestsByType(activeTab);
    const availableQuestsForType = availableQuests.filter(q => q.type === activeTab);
    const getQuestCounts = () => {
        return tabs.map(tab => ({
            ...tab,
            activeCount: getQuestsByType(tab.id).filter(q => q.status === 'active').length,
            availableCount: availableQuests.filter(q => q.type === tab.id).length
        }));
    };
    const questCounts = getQuestCounts();
    return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "\uD83C\uDFAF Quest Manager", children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '20px',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '12px'
                }, children: questCounts.map(tab => ((0, jsx_runtime_1.jsxs)("button", { type: "button", "aria-pressed": activeTab === tab.id, onClick: () => setActiveTab(tab.id), style: {
                        background: activeTab === tab.id ? `${tab.color}20` : 'transparent',
                        border: `2px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: activeTab === tab.id ? tab.color : 'var(--muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem',
                        fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        position: 'relative'
                    }, onMouseEnter: (e) => {
                        if (activeTab !== tab.id) {
                            e.currentTarget.style.color = 'var(--text)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }
                    }, onMouseLeave: (e) => {
                        if (activeTab !== tab.id) {
                            e.currentTarget.style.color = 'var(--muted)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }
                    }, children: [(0, jsx_runtime_1.jsx)("span", { children: tab.icon }), (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { fontSize: '0.9rem', background: 'transparent', color: activeTab === tab.id ? tab.color : 'var(--muted)', fontWeight: activeTab === tab.id ? 'bold' : 'normal', padding: 0 }, children: tab.label }), (tab.activeCount > 0 || tab.availableCount > 0) && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { background: tab.color, color: 'white', borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold', minWidth: '18px', textAlign: 'center' }, children: tab.activeCount + tab.availableCount }))] }, tab.id))) }), (0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '300px' }, children: [questsByType.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: {
                                    color: 'var(--primary)',
                                    fontSize: '1.1rem',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u26A1" }), "Active ", tabs.find(t => t.id === activeTab)?.label] }), (0, jsx_runtime_1.jsx)(EnhancedQuestPanel_1.EnhancedQuestPanel, { quests: questsByType, showType: activeTab, maxQuests: 10 })] })), availableQuestsForType.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { style: {
                                    color: 'var(--secondary)',
                                    fontSize: '1.1rem',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCCB" }), "Available ", tabs.find(t => t.id === activeTab)?.label] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '12px' }, children: availableQuestsForType.map(quest => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        border: '2px dashed var(--border)',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        transition: 'all 0.2s ease'
                                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: {
                                                        color: 'var(--primary)',
                                                        margin: '0 0 8px 0',
                                                        fontSize: '1rem'
                                                    }, children: quest.title }), (0, jsx_runtime_1.jsx)("p", { style: {
                                                        color: 'var(--muted)',
                                                        fontSize: '0.85rem',
                                                        margin: '0 0 12px 0',
                                                        lineHeight: 1.4
                                                    }, children: quest.description }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        fontSize: '0.8rem',
                                                        marginBottom: '12px'
                                                    }, children: [(0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { fontSize: '0.8rem', background: tabs.find(t => t.id === activeTab)?.color, color: 'white', textTransform: 'uppercase', fontWeight: 'bold' }, children: quest.difficulty }), quest.experience > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "\u2022" }), (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "accent", style: { fontSize: '0.8rem' }, children: [quest.experience, " XP"] })] })), quest.rewards.length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "\u2022" }), (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { variant: "success", style: { fontSize: '0.8rem' }, children: [quest.rewards.length, " Reward", quest.rewards.length > 1 ? 's' : ''] })] }))] }), quest.prerequisites && quest.prerequisites.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                        fontSize: '0.8rem',
                                                        color: 'var(--muted)',
                                                        marginBottom: '12px'
                                                    }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Prerequisites:" }), " ", quest.prerequisites.join(', ')] }))] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                                                const success = activateEnhancedQuest(quest.id);
                                                if (success) {
                                                    setAvailableQuests(getAvailableEnhancedQuests());
                                                }
                                            }, "aria-label": `Start quest ${quest.title}`, size: "small", style: {
                                                backgroundColor: tabs.find(t => t.id === activeTab)?.color,
                                                borderColor: tabs.find(t => t.id === activeTab)?.color
                                            }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Start Quest" }) })] }, quest.id))) })] })), questsByType.length === 0 && availableQuestsForType.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            textAlign: 'center',
                            color: 'var(--muted)',
                            padding: '40px 20px',
                            fontStyle: 'italic'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }, children: tabs.find(t => t.id === activeTab)?.icon }), (0, jsx_runtime_1.jsxs)("p", { children: ["No ", activeTab, " quests available at the moment."] }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '0.85rem', marginTop: '8px' }, children: [activeTab === 'main' && 'Progress through the story to unlock main quests.', activeTab === 'side' && 'Explore the world and interact with NPCs to find side quests.', activeTab === 'daily' && 'Daily quests reset every 24 hours.', activeTab === 'achievement' && 'Achievements unlock as you progress and master different aspects of cultivation.'] })] }))] })] }));
};
exports.QuestManager = QuestManager;
exports.default = exports.QuestManager;
