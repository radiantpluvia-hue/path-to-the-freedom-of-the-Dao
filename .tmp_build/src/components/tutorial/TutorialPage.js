"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorialPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
const logger_1 = require("../../utils/logger");
// Dedicated tutorial screen with concise sections
const TutorialPage = () => {
    const { setUIProperty } = (0, useGameStore_1.useGameStore)();
    (0, react_1.useEffect)(() => {
        try {
            localStorage.setItem('xg_tutorial_seen', '1');
        }
        catch (e) {
            /* ignore storage errors */
            logger_1.logger.debug('TutorialPage: localStorage.setItem failed', e);
        }
    }, []);
    const backToGame = () => setUIProperty('currentScreen', 'game');
    const Section = ({ title, children }) => ((0, jsx_runtime_1.jsxs)("div", { style: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, padding: 16 }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0, color: 'var(--primary)' }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--text-secondary)', lineHeight: 1.7 }, children: children })] }));
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { margin: 0, color: 'var(--accent)' }, children: "Tutorial" }), (0, jsx_runtime_1.jsx)("button", { onClick: backToGame, style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--text)' }, children: "\u2190 Back to Game" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 980, margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)(Section, { title: "Core Loop", children: "Cultivate to gain Qi \u2192 Complete all minor stages \u2192 Attempt a realm breakthrough via challenges \u2192 Advance realms for better stats and systems." }), (0, jsx_runtime_1.jsx)(Section, { title: "Cultivation & Breakthroughs", children: "Use the Cultivation button to open the interactive practice. Earn Qi from the mini-game, then perform Minor Breakthroughs. When all minor stages are complete, select a Challenge to attempt a Realm Breakthrough." }), (0, jsx_runtime_1.jsx)(Section, { title: "Quests & Story", children: "Track your Main Quest and story events on the right sidebar of the Core page. Choices affect stats, karma, and unlocks." }), (0, jsx_runtime_1.jsx)(Section, { title: "Sects, Market, Mentors", children: "Join a sect to gain reputation and services. Trade items and resources in the Market. Visit Mentors for teachings (when available)." }), (0, jsx_runtime_1.jsx)(Section, { title: "Tips", children: "Practice Qi Control often for steady Qi gain. Improve Meditation and Qi Control skills to speed progress. Read event outcomes; karma matters." })] })] }));
};
exports.TutorialPage = TutorialPage;
