"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedQuestPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- component imports EnhancedQuestSystem for display */
const react_1 = require("react");
const Card_1 = require("../core/Card");
const Progress_1 = require("../core/Progress");
// Button import removed (unused)
const EnhancedQuestPanel = ({ quests, onQuestSelect, showType, maxQuests = 5 }) => {
    const [selectedQuest, setSelectedQuest] = (0, react_1.useState)(null);
    const [completedQuests, setCompletedQuests] = (0, react_1.useState)(new Set());
    // Filter quests by type if specified
    const filteredQuests = showType
        ? quests.filter(quest => quest.type === showType)
        : quests;
    // Sort quests by priority (main > side > daily > achievement)
    const sortedQuests = filteredQuests
        .slice(0, maxQuests)
        .sort((a, b) => {
        const typePriority = { main: 0, side: 1, sect: 2, daily: 3, achievement: 4 };
        return typePriority[a.type] - typePriority[b.type];
    });
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'trivial': return '#10b981'; // green
            case 'easy': return '#3b82f6'; // blue
            case 'normal': return '#f59e0b'; // yellow
            case 'hard': return '#ef4444'; // red
            case 'legendary': return '#8b5cf6'; // purple
            default: return '#6b7280'; // gray
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'main': return '📜';
            case 'side': return '📋';
            case 'sect': return '🏛️';
            case 'daily': return '🌅';
            case 'achievement': return '🏆';
            default: return '❓';
        }
    };
    const getQuestProgress = (quest) => {
        const requiredObjectives = quest.objectives.filter(obj => !obj.isOptional);
        const completedObjectives = requiredObjectives.filter(obj => obj.isCompleted);
        return {
            completed: completedObjectives.length,
            total: requiredObjectives.length,
            percentage: requiredObjectives.length > 0 ? (completedObjectives.length / requiredObjectives.length) * 100 : 0
        };
    };
    const getObjectiveProgress = (objective) => {
        const current = objective.currentProgress || 0;
        const target = typeof objective.value === 'number' ? objective.value : 1;
        return {
            current,
            target,
            percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0
        };
    };
    const handleQuestClick = (questId) => {
        setSelectedQuest(selectedQuest === questId ? null : questId);
        if (onQuestSelect) {
            onQuestSelect(questId);
        }
    };
    // Animation for quest completion
    (0, react_1.useEffect)(() => {
        const newlyCompleted = quests
            .filter(quest => quest.status === 'completed' && !completedQuests.has(quest.id))
            .map(quest => quest.id);
        if (newlyCompleted.length > 0) {
            setCompletedQuests(prev => new Set([...prev, ...newlyCompleted]));
            // Show completion animation/notification
            newlyCompleted.forEach(questId => {
                const quest = quests.find(q => q.id === questId);
                if (quest) {
                    // You could trigger a toast notification here
                    console.log(`Quest completed: ${quest.title}`);
                }
            });
        }
    }, [quests, completedQuests]);
    if (sortedQuests.length === 0) {
        return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: `${getTypeIcon(showType || 'main')} ${showType ? showType.charAt(0).toUpperCase() + showType.slice(1) : 'Active'} Quests`, children: (0, jsx_runtime_1.jsx)("div", { style: {
                    textAlign: 'center',
                    color: 'var(--muted)',
                    padding: '20px',
                    fontStyle: 'italic'
                }, children: "No active quests. Continue your cultivation journey to unlock new quests." }) }));
    }
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: `${getTypeIcon(showType || 'main')} ${showType ? showType.charAt(0).toUpperCase() + showType.slice(1) : 'Active'} Quests`, children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '12px' }, children: sortedQuests.map(quest => {
                const progress = getQuestProgress(quest);
                const isSelected = selectedQuest === quest.id;
                const isCompleted = quest.status === 'completed';
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        border: `2px solid ${isCompleted ? '#10b981' : getDifficultyColor(quest.difficulty)}`,
                        borderRadius: '8px',
                        padding: '12px',
                        backgroundColor: isCompleted
                            ? 'rgba(16, 185, 129, 0.1)'
                            : isSelected
                                ? 'rgba(59, 130, 246, 0.1)'
                                : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isCompleted ? 0.8 : 1
                    }, onClick: () => handleQuestClick(quest.id), children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }, children: quest.title }), isCompleted && (0, jsx_runtime_1.jsx)("span", { style: { color: '#10b981', fontSize: '1.2rem' }, children: "\u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                                        color: getDifficultyColor(quest.difficulty),
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase'
                                                    }, children: quest.difficulty }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "\u2022" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: quest.type.charAt(0).toUpperCase() + quest.type.slice(1) }), quest.experience > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "\u2022" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: 'var(--accent)' }, children: [quest.experience, " XP"] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                        fontSize: '0.9rem',
                                        color: 'var(--primary)',
                                        fontWeight: 'bold',
                                        minWidth: '60px',
                                        textAlign: 'right'
                                    }, children: [progress.completed, "/", progress.total] })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '8px' }, children: (0, jsx_runtime_1.jsx)(Progress_1.Progress, { value: progress.percentage, style: {
                                    height: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                } }) }), (0, jsx_runtime_1.jsx)("p", { style: {
                                color: 'var(--muted)',
                                fontSize: '0.85rem',
                                margin: '0 0 8px 0',
                                lineHeight: 1.4
                            }, children: quest.description }), isSelected && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: {
                                                color: 'var(--secondary)',
                                                fontSize: '0.9rem',
                                                margin: '0 0 8px 0',
                                                fontWeight: 'bold'
                                            }, children: "Objectives:" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '6px' }, children: quest.objectives.map(objective => {
                                                const objProgress = getObjectiveProgress(objective);
                                                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '0.85rem'
                                                    }, children: [(0, jsx_runtime_1.jsxs)("span", { style: {
                                                                color: objective.isCompleted ? '#10b981' : 'var(--text)',
                                                                textDecoration: objective.isCompleted ? 'line-through' : 'none'
                                                            }, children: [objective.isCompleted ? '✓' : '○', " ", objective.description] }), objective.isOptional && ((0, jsx_runtime_1.jsx)("span", { style: {
                                                                color: 'var(--muted)',
                                                                fontSize: '0.75rem',
                                                                fontStyle: 'italic'
                                                            }, children: "(Optional)" })), !objective.isCompleted && objProgress.target > 1 && ((0, jsx_runtime_1.jsxs)("span", { style: {
                                                                color: 'var(--accent)',
                                                                fontSize: '0.75rem',
                                                                marginLeft: 'auto'
                                                            }, children: [objProgress.current, "/", objProgress.target] }))] }, objective.id));
                                            }) })] }), quest.rewards.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: {
                                                color: 'var(--secondary)',
                                                fontSize: '0.9rem',
                                                margin: '0 0 8px 0',
                                                fontWeight: 'bold'
                                            }, children: "Rewards:" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '6px',
                                                fontSize: '0.8rem'
                                            }, children: [quest.experience > 0 && ((0, jsx_runtime_1.jsxs)("span", { style: {
                                                        background: 'rgba(59, 130, 246, 0.2)',
                                                        color: '#3b82f6',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(59, 130, 246, 0.3)'
                                                    }, children: [quest.experience, " XP"] })), quest.rewards.map((reward, index) => ((0, jsx_runtime_1.jsx)("span", { style: {
                                                        background: 'rgba(16, 185, 129, 0.2)',
                                                        color: '#10b981',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                                    }, children: reward.description }, index)))] })] })), quest.timeLimit && quest.startedAt && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        marginTop: '8px',
                                        fontSize: '0.8rem',
                                        color: 'var(--danger)'
                                    }, children: ["\u23F0 Time Limit: ", quest.timeLimit, " days"] }))] }))] }, quest.id));
            }) }) }));
};
exports.EnhancedQuestPanel = EnhancedQuestPanel;
exports.default = exports.EnhancedQuestPanel;
