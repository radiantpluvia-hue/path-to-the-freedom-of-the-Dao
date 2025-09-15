"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestCompletionNotification = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- temporary: importing core systems for UI integration */
const react_1 = require("react");
const QuestCompletionNotification = ({ quest, onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (quest) {
            setIsVisible(true);
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(() => {
                    setIsVisible(false);
                    onClose();
                }, 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [quest, duration, onClose]);
    if (!quest || !isVisible)
        return null;
    const formatReward = (reward) => {
        switch (reward.type) {
            case 'currency':
                return `${reward.amount} ${reward.target === 'yuan' ? 'Yuan' : 'Spirit Stones'}`;
            case 'stat':
                return `+${reward.amount} ${reward.target.charAt(0).toUpperCase() + reward.target.slice(1)}`;
            case 'skill':
                return `+${reward.amount} ${reward.target.replace(/_/g, ' ')} XP`;
            case 'item':
                return `${reward.amount}x ${reward.target.replace(/_/g, ' ')}`;
            case 'reputation':
                return `+${reward.amount} ${reward.target} Reputation`;
            case 'unlock':
                return `Unlocked: ${reward.target.replace(/_/g, ' ')}`;
            default:
                return reward.description;
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '400px',
            width: '90%'
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%)',
                            animation: 'shimmer 2s ease-in-out infinite',
                            pointerEvents: 'none'
                        } }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                            setIsAnimating(false);
                            setTimeout(() => {
                                setIsVisible(false);
                                onClose();
                            }, 300);
                        }, style: {
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'color 0.2s ease'
                        }, onMouseEnter: (e) => e.currentTarget.style.color = 'var(--text)', onMouseLeave: (e) => e.currentTarget.style.color = 'var(--muted)', children: "\u00D7" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '16px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '24px' }, children: "\uD83C\uDF89" }), (0, jsx_runtime_1.jsx)("h3", { style: {
                                            color: '#10b981',
                                            margin: 0,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }, children: "Quest Completed!" })] }), (0, jsx_runtime_1.jsx)("h4", { style: {
                                    color: 'var(--primary)',
                                    margin: 0,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold'
                                }, children: quest.title })] }), quest.experience > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            textAlign: 'center'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    color: '#3b82f6',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    marginBottom: '4px'
                                }, children: "Experience Gained" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                    color: '#60a5fa',
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold'
                                }, children: ["+", quest.experience, " XP"] })] })), quest.rewards.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: {
                                    color: 'var(--secondary)',
                                    margin: '0 0 12px 0',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }, children: "Rewards Received:" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '8px' }, children: quest.rewards.map((reward, index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '16px' }, children: reward.type === 'currency' ? '💰' :
                                                reward.type === 'stat' ? '📈' :
                                                    reward.type === 'skill' ? '🎯' :
                                                        reward.type === 'item' ? '📦' :
                                                            reward.type === 'reputation' ? '⭐' :
                                                                reward.type === 'unlock' ? '🔓' : '🎁' }), (0, jsx_runtime_1.jsx)("span", { style: {
                                                color: '#10b981',
                                                fontWeight: 'bold',
                                                flex: 1
                                            }, children: formatReward(reward) })] }, index))) })] })), (0, jsx_runtime_1.jsx)("div", { style: {
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: quest.type === 'main' ? 'rgba(239, 68, 68, 0.2)' :
                                quest.type === 'side' ? 'rgba(59, 130, 246, 0.2)' :
                                    quest.type === 'daily' ? 'rgba(245, 158, 11, 0.2)' :
                                        quest.type === 'achievement' ? 'rgba(139, 92, 246, 0.2)' :
                                            'rgba(107, 114, 128, 0.2)',
                            color: quest.type === 'main' ? '#ef4444' :
                                quest.type === 'side' ? '#3b82f6' :
                                    quest.type === 'daily' ? '#f59e0b' :
                                        quest.type === 'achievement' ? '#8b5cf6' :
                                            '#6b7280',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            border: `1px solid ${quest.type === 'main' ? 'rgba(239, 68, 68, 0.3)' :
                                quest.type === 'side' ? 'rgba(59, 130, 246, 0.3)' :
                                    quest.type === 'daily' ? 'rgba(245, 158, 11, 0.3)' :
                                        quest.type === 'achievement' ? 'rgba(139, 92, 246, 0.3)' :
                                            'rgba(107, 114, 128, 0.3)'}`
                        }, children: quest.type })] }), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      ` })] }));
};
exports.QuestCompletionNotification = QuestCompletionNotification;
exports.default = exports.QuestCompletionNotification;
