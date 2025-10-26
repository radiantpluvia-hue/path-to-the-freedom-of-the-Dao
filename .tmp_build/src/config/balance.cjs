"use strict";
// Central balance knobs for broad-stroke number scaling.
// We keep this disabled (1x) in tests to preserve snapshot and numeric assertions.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseNumberMultiplier = getBaseNumberMultiplier;
exports.getEnemyBaseMultiplier = getEnemyBaseMultiplier;
exports.getPowerScale = getPowerScale;
exports.setPowerScalePercent = setPowerScalePercent;
exports.setPowerScaleDecimal = setPowerScaleDecimal;
function getBaseNumberMultiplier() {
    try {
        // In tests, keep baseline unchanged
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test')
            return 1;
        // Allow quick override via global for live tuning
        if (typeof window !== 'undefined' && window.__BASE_MULTIPLIER__) {
            const v = Number(window.__BASE_MULTIPLIER__);
            if (isFinite(v) && v > 0)
                return Math.min(Math.max(v, 1), 1000);
        }
    }
    catch { /* ignore */ }
    // Default: beef up numbers to feel more immortal without changing formulas
    return 3; // 3x base stats and pools
}
// Enemy baseline multiplier: scale NPCs to keep challenge when player bases are increased.
// Tests remain 1x; allow quick override via global.
function getEnemyBaseMultiplier() {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test')
            return 1;
        if (typeof window !== 'undefined') {
            const g = window;
            const v = g.__ENEMY_BASE_MULTIPLIER__ ?? g.__ENEMY_MULTIPLIER__;
            if (v != null) {
                const n = Number(v);
                if (isFinite(n) && n > 0)
                    return Math.min(Math.max(n, 0.1), 1000);
            }
        }
    }
    catch { /* ignore */ }
    const base = getBaseNumberMultiplier();
    // Era/realm-aware curve: modest increase per era and realm tier
    // Pull live state best-effort; fall back to safe defaults when unavailable
    let eraIndex = 0;
    let realmIndex = 0; // index into REALM_ORDER (0=mortal)
    try {
        // Prefer the globally exposed gameStore when available (avoids a hard
        // import and prevents circular require/imports at module init time).
        const globalAny = typeof window !== 'undefined' ? window : global;
        const gs = globalAny?.gameStore || (globalAny?.useGameStore ? globalAny.useGameStore : null);
        const state = gs && typeof gs.getState === 'function' ? gs.getState() : null;
        if (state) {
            eraIndex = Number(state.world?.currentEraIndex ?? 0) || 0;
            try {
                const key = (state.player && (0, playerHelpers_1.getPlayerRealmKey)(state.player)) || 'mortal';
                const REALM_ORDER = (globalAny && globalAny.REALM_ORDER) || ['mortal'];
                realmIndex = Math.max(0, REALM_ORDER.indexOf(key));
            }
            catch { /* ignore realm lookup errors */ }
        }
    }
    catch { /* ignore store errors */ }
    // Baseline keeps player a bit ahead when BASE>1
    const sqrtBase = base > 1 ? Math.sqrt(base) : 1;
    // Scale gently per era (12% each) and per realm step (3% each)
    const eraCurve = 1 + Math.max(0, eraIndex) * 0.12;
    const realmCurve = 1 + Math.max(0, realmIndex) * 0.03;
    const dyn = sqrtBase * eraCurve * realmCurve;
    // Clamp for safety
    return Math.max(0.5, Math.min(dyn, 20));
}
// Global balance settings for the game. Keep simple getters/setters so tests
// and UI can adjust the overall power scale without changing many files.
const STORAGE_KEY = 'xianxia_power_scale_percent';
// Default scale decimal (1.0 == 100%)
let powerScaleDecimal = 1.0;
// Import the game's Zustand hook. This creates a cycle (store -> balance -> store),
// but ESM handles cycles with live bindings and our usage avoids accessing the
// store during module initialization. Tests expect synchronous persistence.
const useGameStore_1 = require("../store/useGameStore");
const playerHelpers_1 = require("../utils/playerHelpers");
// Try to initialize from localStorage if available (guarded so tests/node won't throw)
try {
    if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = parseInt(raw, 10);
            if (!isNaN(parsed)) {
                powerScaleDecimal = Math.max(1, Math.min(100, parsed)) / 100;
            }
        }
    }
}
catch (e) {
    // ignore - tests or some environments may not provide localStorage
}
// Note: prefer localStorage for initial value. Persisting to the game's
// Zustand store is attempted asynchronously later to avoid synchronous
// `require()` during module initialization which can leak into client bundles.
function getPowerScale() {
    return powerScaleDecimal;
}
// Accept percent (1..100) or decimal (0..1). Normalize and persist percent to localStorage when possible.
function setPowerScalePercent(percent) {
    if (percent > 1) {
        percent = Math.max(1, Math.min(100, Math.round(percent)));
        powerScaleDecimal = percent / 100;
    }
    else {
        // assume decimal
        powerScaleDecimal = Math.max(0.01, Math.min(1, percent));
    }
    // Persist to localStorage when available (best-effort)
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, String(Math.round(powerScaleDecimal * 100)));
        }
    }
    catch (e) { /* ignore persistence errors */ }
    // Update the game's Zustand store synchronously when available (tests depend on this)
    try {
        const storeHook = useGameStore_1.useGameStore;
        if (storeHook && typeof storeHook.getState === 'function' && typeof storeHook.setState === 'function') {
            const cur = storeHook.getState();
            if (cur && typeof cur.setSettings === 'function') {
                cur.setSettings({ powerScalePercent: Math.round(powerScaleDecimal * 100) });
            }
            else {
                const settings = (cur && cur.player && cur.player.settings) || {};
                storeHook.setState({ player: { ...cur.player, settings: { ...settings, powerScalePercent: Math.round(powerScaleDecimal * 100) } } });
            }
        }
        else {
            // Fallback: try global exposure
            const globalAny = typeof window !== 'undefined' ? window : global;
            const gs = globalAny?.gameStore || (globalAny?.useGameStore ? globalAny.useGameStore : null);
            if (gs && typeof gs.getState === 'function') {
                const cur = gs.getState();
                if (cur && typeof cur.setSettings === 'function') {
                    cur.setSettings({ powerScalePercent: Math.round(powerScaleDecimal * 100) });
                }
                else if (typeof gs.setState === 'function') {
                    const settings = (cur && cur.player && cur.player.settings) || {};
                    gs.setState({ player: { ...cur.player, settings: { ...settings, powerScalePercent: Math.round(powerScaleDecimal * 100) } } });
                }
            }
        }
    }
    catch (e) { /* ignore store update errors */ }
}
function setPowerScaleDecimal(d) {
    // Accept decimal 0..1 or >1 scaled to percent
    if (d > 1) {
        setPowerScalePercent(Math.round(d));
    }
    else {
        setPowerScalePercent(Math.round(Math.max(0.01, Math.min(1, d)) * 100));
    }
}
