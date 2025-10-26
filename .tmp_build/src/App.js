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
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("./store/useGameStore");
const TaiYungLore_1 = require("./components/game/TaiYungLore");
const SectPanel_1 = __importDefault(require("./components/game/SectPanel"));
const CharacterCreation_1 = require("./components/game/CharacterCreation");
const GameInterface_1 = require("./components/game/GameInterface");
const ErrorBoundary_1 = __importDefault(require("./components/ErrorBoundary"));
const SocialInterface_1 = require("./components/game/SocialInterface");
const DeathScreen_1 = require("./components/game/DeathScreen");
const DomainPanel_1 = __importDefault(require("./components/DomainPanel"));
const MusicPlayer_1 = __importDefault(require("./components/game/MusicPlayer"));
// Test component import removed from global render (kept in codebase for local testing)
const RebellionMastery_1 = require("./components/minigames/RebellionMastery");
const TutorialPage_1 = require("./components/tutorial/TutorialPage");
require("./styles/globals.css");
require("./styles/theme.css");
const BuffPanel_1 = __importDefault(require("./components/BuffPanel"));
const InterpersonalPage_1 = __importDefault(require("./pages/InterpersonalPage"));
const logger_1 = require("./utils/logger");
const ToastContainer_1 = __importDefault(require("./components/ToastContainer"));
// Dynamic imports for heavy panels
const SectJoiningPanel = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/game/SectJoiningPanel'))));
const MarketPanel = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/game/MarketPanel'))));
const MentorTeachingPanel = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./components/MentorTeachingPanel'))));
function App() {
    const { ui, assignRandomBloodline, assignRandomPhysique } = (0, useGameStore_1.useGameStore)();
    (0, react_1.useEffect)(() => {
        // Assign random bloodline and physique on first load
        assignRandomBloodline();
        assignRandomPhysique();
        // Load any persisted UI prefs (dialogue settings, realm list visibility)
        try {
            useGameStore_1.useGameStore.getState()._loadUIPrefsOnce?.();
        }
        catch { /* ignore */ }
    }, [assignRandomBloodline, assignRandomPhysique]);
    // Global audio bootstrap: load prefs, attempt autoplay once, and add a one-shot
    // user gesture fallback to enable audio per browser policies.
    (0, react_1.useEffect)(() => {
        try {
            // Load persisted audio preferences if available
            useGameStore_1.useGameStore.getState()._loadAudioPrefsOnce?.();
        }
        catch { /* ignore */ }
        try {
            const s = useGameStore_1.useGameStore.getState();
            if (!s.musicPlaying && !s.musicMuted) {
                // Attempt to start default ambient track on load
                s.playMusic?.('china-chinese-asian-music-346568.mp3');
            }
        }
        catch { /* ignore */ }
        const onUserGesture = () => {
            try {
                const st = useGameStore_1.useGameStore.getState();
                if (st.autoplayBlocked) {
                    // Retry playing current or default track and clear the blocked flag
                    st.playMusic?.(st.currentMusicTrack || 'china-chinese-asian-music-346568.mp3');
                    st.setAutoplayBlocked?.(false);
                }
            }
            catch { /* ignore */ }
            window.removeEventListener('pointerdown', onUserGesture);
            document.removeEventListener('keydown', onUserGesture);
        };
        // Attach once; they self-clean after first invocation
        window.addEventListener('pointerdown', onUserGesture, { once: true });
        document.addEventListener('keydown', onUserGesture, { once: true });
        return () => {
            window.removeEventListener('pointerdown', onUserGesture);
            document.removeEventListener('keydown', onUserGesture);
        };
    }, []);
    const renderScreen = () => {
        switch (ui.currentScreen) {
            case 'lore':
                return (0, jsx_runtime_1.jsx)(TaiYungLore_1.TaiYungLore, {});
            case 'creation':
                return (0, jsx_runtime_1.jsx)(CharacterCreation_1.CharacterCreation, {});
            case 'game':
                return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsx)(GameInterface_1.GameInterface, {}) }));
            case 'social':
                return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.default, { children: (0, jsx_runtime_1.jsx)(SocialInterface_1.SocialInterface, {}) }));
            case 'domain':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(DomainPanel_1.default, {})] }));
            case 'sects':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { style: { padding: 20 }, children: "Loading sects\u2026" }), children: (0, jsx_runtime_1.jsx)(SectJoiningPanel, {}) })] }));
            case 'combat':
                return (0, jsx_runtime_1.jsx)(GameInterface_1.GameInterface, {}); // CombatUI is rendered inside GameInterface when active
            case 'rebellion':
                return (0, jsx_runtime_1.jsx)(RebellionMastery_1.RebellionMastery, { difficulty: "medium", successThreshold: 500, onComplete: (result) => {
                        logger_1.logger.warn('Rebellion challenge completed:', result);
                        useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game');
                    }, onCancel: () => {
                        useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game');
                    } }); // Render the Rebellion Mastery component
            case 'market':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading market\u2026" }), children: (0, jsx_runtime_1.jsx)(MarketPanel, {}) })] }));
            case 'sect-hub':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(SectPanel_1.default, {})] }));
            case 'mentors':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading mentor panel\u2026" }), children: (0, jsx_runtime_1.jsx)(MentorTeachingPanel, {}) })] }));
            /* 'inventory' route removed — inventory is accessible via the Social screen */
            case 'relationships':
                return (0, jsx_runtime_1.jsx)(InterpersonalPage_1.default, {});
            case 'death':
                return (0, jsx_runtime_1.jsx)(DeathScreen_1.DeathScreen, {});
            case 'tutorial':
                return (0, jsx_runtime_1.jsx)(TutorialPage_1.TutorialPage, {});
            default:
                return (0, jsx_runtime_1.jsx)(TaiYungLore_1.TaiYungLore, {});
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '100vh', background: 'linear-gradient(135deg, var(--dark), var(--darker))' }, children: [renderScreen(), (0, jsx_runtime_1.jsx)(BuffPanel_1.default, {}), (0, jsx_runtime_1.jsx)(ToastContainer_1.default, {}), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: -9999, top: 0 }, "aria-hidden": true, children: (0, jsx_runtime_1.jsx)(MusicPlayer_1.default, {}) })] }));
}
