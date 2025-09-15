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
const CharacterCreation_1 = require("./components/game/CharacterCreation");
const GameInterface_1 = require("./components/game/GameInterface");
const SocialInterface_1 = require("./components/game/SocialInterface");
const SkillEvolutionTest_1 = __importDefault(require("./components/test/SkillEvolutionTest"));
const RebellionMastery_1 = require("./components/minigames/RebellionMastery");
const TutorialPage_1 = require("./components/tutorial/TutorialPage");
require("./styles/globals.css");
require("./styles/theme.css");
const BuffPanel_1 = __importDefault(require("./components/BuffPanel"));
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
    }, [assignRandomBloodline, assignRandomPhysique]);
    const renderScreen = () => {
        switch (ui.currentScreen) {
            case 'lore':
                return (0, jsx_runtime_1.jsx)(TaiYungLore_1.TaiYungLore, {});
            case 'creation':
                return (0, jsx_runtime_1.jsx)(CharacterCreation_1.CharacterCreation, {});
            case 'game':
                return (0, jsx_runtime_1.jsx)(GameInterface_1.GameInterface, {});
            case 'social':
                return (0, jsx_runtime_1.jsx)(SocialInterface_1.SocialInterface, {});
            case 'sects':
                return ((0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { style: { padding: 20 }, children: "Loading sects\u2026" }), children: (0, jsx_runtime_1.jsx)(SectJoiningPanel, {}) }));
            case 'combat':
                return (0, jsx_runtime_1.jsx)(GameInterface_1.GameInterface, {}); // CombatUI is rendered inside GameInterface when active
            case 'rebellion':
                return (0, jsx_runtime_1.jsx)(RebellionMastery_1.RebellionMastery, { difficulty: "medium", successThreshold: 500, onComplete: (result) => {
                        console.log('Rebellion challenge completed:', result);
                        useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game');
                    }, onCancel: () => {
                        useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game');
                    } }); // Render the Rebellion Mastery component
            case 'market':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading market\u2026" }), children: (0, jsx_runtime_1.jsx)(MarketPanel, {}) })] }));
            case 'mentors':
                return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 12 }, children: (0, jsx_runtime_1.jsx)("button", { style: { padding: '8px 12px' }, onClick: () => useGameStore_1.useGameStore.getState().setUIProperty('currentScreen', 'game'), children: "\u2190 Back to Game" }) }), (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading mentor panel\u2026" }), children: (0, jsx_runtime_1.jsx)(MentorTeachingPanel, {}) })] }));
            case 'tutorial':
                return (0, jsx_runtime_1.jsx)(TutorialPage_1.TutorialPage, {});
            default:
                return (0, jsx_runtime_1.jsx)(TaiYungLore_1.TaiYungLore, {});
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: '100vh', background: 'linear-gradient(135deg, var(--dark), var(--darker))' }, children: [renderScreen(), (0, jsx_runtime_1.jsx)(BuffPanel_1.default, {}), process.env.NODE_ENV === 'development' && (0, jsx_runtime_1.jsx)(SkillEvolutionTest_1.default, {})] }));
}
