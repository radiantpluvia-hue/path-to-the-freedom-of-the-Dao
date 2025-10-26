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
const presets_1 = __importDefault(require("../../playtest/presets"));
const useGameStore_1 = require("../../store/useGameStore");
const seededRng_1 = require("../../utils/seededRng");
// GENERATED_PASSIVES is large; load it on demand to avoid inflating the main bundle
const passiveRegistry_1 = require("../../systems/passiveRegistry");
const MinigamePlayground_1 = __importDefault(require("../game/MinigamePlayground"));
const PlaytestOverlay = () => {
    const applyPreset = (name) => {
        const preset = presets_1.default[name];
        if (!preset)
            return;
        // merge partial state into store
        useGameStore_1.useGameStore.setState(preset);
    };
    const seed = (v) => { try {
        const s = parseInt(v || '0', 10) || Date.now();
        (0, seededRng_1.setRuntimeRng)((0, seededRng_1.makeSeededRng)(s));
    }
    catch (e) {
        void e;
    } };
    const grantSamplePassives = (n = 3) => {
        try {
            const rng = (0, seededRng_1.makeSeededRng)(12345);
            // dynamically import the generated passives file when needed
            // keep synchronous path minimal and do not block UI
            void (async () => {
                try {
                    const mod = await Promise.resolve().then(() => __importStar(require('../../data/generated/passives.generated')));
                    const list = (mod && mod.GENERATED_PASSIVES) ? mod.GENERATED_PASSIVES.slice(0, 100) : [];
                    const chosen = [];
                    for (let i = 0; i < n; i++) {
                        const idx = Math.floor(rng() * list.length);
                        chosen.push(list[idx]);
                    }
                    // Apply to store's player
                    useGameStore_1.useGameStore.setState((s) => {
                        let p = { ...(s.player || {}) };
                        chosen.forEach(c => { p = (0, passiveRegistry_1.applyPassiveToPlayer)(p, c.id); });
                        return { player: p };
                    });
                }
                catch (e) { /* ignore */ }
            })();
        }
        catch (e) { /* ignore */ }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'fixed', right: 12, top: 12, zIndex: 9999, background: 'rgba(0,0,0,0.6)', color: 'white', padding: 8, borderRadius: 6, fontSize: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 6 }, children: "Playtest Overlay (dev)" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 6 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => applyPreset('quick'), children: "Apply Quick" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => applyPreset('highfatigue'), children: "Apply High Fatigue" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => grantSamplePassives(3), children: "Grant Sample Passives" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6 }, children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "seed", id: "pt_seed_input", style: { width: 120 } }), (0, jsx_runtime_1.jsx)("button", { onClick: () => seed(document.getElementById('pt_seed_input')?.value), children: "Seed RNG" })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => { const el = document.getElementById('minigame_playground_container'); if (el) {
                        el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    } }, children: "Toggle Minigame Playground" }) }), (0, jsx_runtime_1.jsx)("div", { id: "minigame_playground_container", style: { display: 'none', marginTop: 8 }, children: (0, jsx_runtime_1.jsx)(MinigamePlayground_1.default, {}) })] }));
};
exports.default = PlaytestOverlay;
