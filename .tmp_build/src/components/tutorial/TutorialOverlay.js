"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorialOverlay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// Lightweight first-run tutorial overlay with localStorage persistence
// No dependency on global store to keep changes minimal
const TutorialOverlay = () => {
    const [visible, setVisible] = (0, react_1.useState)(false);
    const [step, setStep] = (0, react_1.useState)(0);
    const steps = [
        {
            title: 'Welcome to Xianxia: Toward the Dao',
            body: 'This quick guide will walk you through the core loop: cultivate, complete minor stages, then attempt breakthroughs.'
        },
        {
            title: 'Core vs Social',
            body: 'Use the top tabs to switch between Core (cultivation and progress) and Social (inventory, manuals, relations).'
        },
        {
            title: 'Cultivation UI',
            body: 'Open Cultivation from the Core page to practice Qi Control and gain Qi. When your Qi meets requirements, attempt a Minor Breakthrough.'
        },
        {
            title: 'Realm Breakthroughs',
            body: 'After finishing all minor stages in a realm, choose a challenge to attempt a Realm Breakthrough. Success advances you to the next realm.'
        },
        {
            title: 'Quests & Story',
            body: 'Track Main Quests and Story Events on the right side of the Core page. Choices affect stats, karma, and opportunities.'
        },
        {
            title: 'Sects, Market, Mentors',
            body: 'Use Game Management shortcuts to join a sect, trade on the market, and learn from mentors. These unlock more progression paths.'
        }
    ];
    (0, react_1.useEffect)(() => {
        try {
            const seen = localStorage.getItem('xg_tutorial_seen');
            if (!seen) {
                setVisible(true);
            }
        }
        catch {
            // Ignore storage errors (e.g., private mode)
            setVisible(true);
        }
    }, []);
    const close = () => {
        setVisible(false);
        try {
            localStorage.setItem('xg_tutorial_seen', '1');
        }
        catch (e) { /* ignore storage errors */
            console.debug('TutorialOverlay: localStorage.setItem failed', e);
        }
    };
    if (!visible)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                width: 'min(720px, 92vw)', background: 'var(--card-bg)', border: '2px solid var(--primary)',
                borderRadius: 12, padding: 20, boxShadow: '0 0 24px rgba(212,175,55,0.25)'
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0, color: 'var(--primary)' }, children: "Quick Tutorial" }), (0, jsx_runtime_1.jsx)("button", { onClick: close, style: { background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }, children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '8px 0', color: 'var(--accent)' }, children: steps[step]?.title }), (0, jsx_runtime_1.jsx)("p", { style: { margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }, children: steps[step]?.body })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 6 }, children: steps.map((_, i) => ((0, jsx_runtime_1.jsx)("div", { style: { width: 8, height: 8, borderRadius: '50%', background: i === step ? 'var(--primary)' : 'rgba(212,175,55,0.3)' } }, i))) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setStep(s => Math.max(0, s - 1)), disabled: step === 0, style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.3)', background: 'transparent', color: 'var(--text)', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }, children: "\u2190 Back" }), step < steps.length - 1 ? ((0, jsx_runtime_1.jsx)("button", { onClick: () => setStep(s => Math.min(steps.length - 1, s + 1)), style: { padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }, children: "Next \u2192" })) : ((0, jsx_runtime_1.jsx)("button", { onClick: close, style: { padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }, children: "Finish" })), (0, jsx_runtime_1.jsx)("button", { onClick: close, style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.3)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }, children: "Skip" })] })] })] }) }));
};
exports.TutorialOverlay = TutorialOverlay;
