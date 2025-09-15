"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- entrypoint imports RivalSystem for bootstrapping */
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App"));
const useGameStore_1 = require("./store/useGameStore");
// Expose store and systems globally for systems that reference window.*
// This is a pragmatic bridge for current architecture; consider replacing with context/injection later.
(function exposeGlobals() {
    try {
        // Initialize store once; zustand create returns a hook, but we can access getState/setState via getState
        // const store = useGameStore.getState();
        window.gameStore = {
            adjustRivalRelationship: useGameStore_1.useGameStore.getState().adjustRivalRelationship,
            markRivalDefeated: useGameStore_1.useGameStore.getState().markRivalDefeated,
            adjustFactionStanding: useGameStore_1.useGameStore.getState().adjustFactionStanding,
        };
        // Reuse the RivalSystem instance from the store if needed elsewhere
        window.rivalSystem = useGameStore_1.useGameStore.getState().rivalSystem;
    }
    catch (e) {
        console.warn('Global exposure failed:', e);
    }
})();
client_1.default.createRoot(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_1.default, {}) }));
