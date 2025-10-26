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
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- entrypoint imports RivalSystem for bootstrapping */
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App"));
// Kick off non-blocking ensures for large runtime datasets so they can begin
// loading early without blocking startup. We intentionally do not await these.
void Promise.resolve().then(() => __importStar(require('./systems/passiveRegistry'))).then(mod => { try {
    if (mod && typeof mod.ensureGeneratedPassives === 'function')
        mod.ensureGeneratedPassives();
}
catch (e) {
    void e;
} }).catch(() => { void 0; });
// Load custom passives (non-blocking) so handcrafted passives register early without delaying render
void Promise.resolve().then(() => __importStar(require('./systems/customPassives'))).catch(() => { });
const useGameStore_1 = require("./store/useGameStore");
const worldState_1 = require("./systems/worldState");
const idleManager_1 = require("./systems/idleManager");
const breakthroughChallenge_1 = require("./systems/breakthroughChallenge");
const eventManager_1 = require("./systems/eventManager");
const rumorSystem_1 = require("./systems/rumorSystem");
const npcManager_1 = require("./systems/npcManager");
const relationshipManager_1 = require("./systems/relationshipManager");
const loreCodex_1 = require("./systems/loreCodex");
const logger_1 = require("./utils/logger");
// Dev-only playtest utilities
let PlaytestOverlay = null;
// Load dev-only playtest helpers via dynamic import to avoid bundling CommonJS `require`
try {
    if (process.env.NODE_ENV !== 'production') {
        Promise.resolve().then(() => __importStar(require('./components/dev/PlaytestOverlay'))).then(m => { PlaytestOverlay = m.default; }).catch(() => { void 0; });
        Promise.resolve().then(() => __importStar(require('./playtest/presets'))).then(m => {
            const PRESETS = m.PRESETS;
            const query = new URLSearchParams(window.location.search || '');
            const p = query.get('playtest');
            if (p && PRESETS && PRESETS[p]) {
                try {
                    useGameStore_1.useGameStore.setState(PRESETS[p]);
                }
                catch (e) { /* ignore */ }
                Promise.resolve().then(() => __importStar(require('./utils/seededRng'))).then(s => {
                    try {
                        const { makeSeededRng, setRuntimeRng } = s;
                        setRuntimeRng(makeSeededRng(12345));
                    }
                    catch (e) { /* ignore */ }
                }).catch(() => { void 0; });
            }
        }).catch(() => { void 0; });
    }
}
catch (e) {
    void e;
}
// Expose store and systems globally for systems that reference window.*
// This is a pragmatic bridge for current architecture; consider replacing with context/injection later.
(function exposeGlobals() {
    try {
        // Initialize store once; zustand create returns a hook, but we can access getState/setState via getState
        // const store = useGameStore.getState();
        // Expose a small dev-friendly bridge to the store only when explicitly
        // enabled via env var to avoid leaking internals. Two ways to enable:
        //  - Node/CI/local: set ENABLE_E2E=1 in the environment
        //  - Vite dev builds: set VITE_ENABLE_E2E=true in .env or define via dev server
        // Check Node/CI env first (ENABLE_E2E=1). For Vite dev we avoid referencing
        // `import.meta` directly (it breaks the CJS tsc build). Instead use a runtime
        // global that Vite can set (e.g. window.__VITE_ENABLE_E2E) or fall back to
        // string-typed globals. This keeps the bridge gated while remaining
        // compatible with the Node/CommonJS build step.
        const nodeFlag = (typeof process !== 'undefined' && process.env && process.env.ENABLE_E2E === '1');
        const viteFlag = (typeof globalThis !== 'undefined' && (globalThis.__VITE_ENABLE_E2E === true || globalThis.__VITE_ENABLE_E2E === 'true'));
        const enableE2E = nodeFlag || viteFlag;
        if (enableE2E) {
            // Keep it minimal and defensive
            const _gs = useGameStore_1.useGameStore.getState();
            window.gameStore = window.gameStore || {};
            try {
                window.gameStore.getState = useGameStore_1.useGameStore.getState;
                window.gameStore.setState = useGameStore_1.useGameStore.setState;
                if (typeof _gs.adjustRivalRelationship === 'function')
                    window.gameStore.adjustRivalRelationship = _gs.adjustRivalRelationship;
                if (typeof _gs.markRivalDefeated === 'function')
                    window.gameStore.markRivalDefeated = _gs.markRivalDefeated;
                if (typeof _gs.adjustFactionStanding === 'function')
                    window.gameStore.adjustFactionStanding = _gs.adjustFactionStanding;
                if (typeof _gs.runTrainingSession === 'function')
                    window.gameStore.runTrainingSession = _gs.runTrainingSession;
                if (typeof _gs.trainBody === 'function')
                    window.gameStore.trainBody = _gs.trainBody;
                if (typeof _gs.trainMartial === 'function')
                    window.gameStore.trainMartial = _gs.trainMartial;
            }
            catch (e) {
                logger_1.logger.debug('Failed to augment window.gameStore bridge:', e);
            }
        }
        // Reuse the RivalSystem instance from the store if needed elsewhere
        window.rivalSystem = useGameStore_1.useGameStore.getState().rivalSystem;
        // Expose WorldState for dev/test inspection when the E2E bridge is enabled
        try {
            window.game = window.game || {};
            window.game.worldState = worldState_1.worldState;
            window.game.idleManager = idleManager_1.idleManager;
            window.game.breakthrough = breakthroughChallenge_1.breakthroughChallenge;
            window.game.eventManager = eventManager_1.eventManager;
            window.game.rumorSystem = rumorSystem_1.rumorSystem;
            window.game.npcManager = npcManager_1.npcManager;
            window.game.relationshipManager = relationshipManager_1.relationshipManager;
            window.game.loreCodex = loreCodex_1.loreCodex;
        }
        catch (e) { /* non-fatal */ }
    }
    catch (e) {
        logger_1.logger.warn('Global exposure failed:', e);
    }
})();
const rootEl = document.getElementById('root');
if (rootEl) {
    client_1.default.createRoot(rootEl).render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(App_1.default, {}), PlaytestOverlay ? (0, jsx_runtime_1.jsx)(PlaytestOverlay, {}) : null] }) }));
}
else {
    // If the root element is missing, log a warning in dev; do not throw in production builds
    try {
        console.warn('Root element not found: skipping initial render');
    }
    catch (e) {
        void e;
    }
}
