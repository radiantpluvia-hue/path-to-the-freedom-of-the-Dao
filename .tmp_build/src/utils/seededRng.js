"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSeededRng = makeSeededRng;
exports.seededFromString = seededFromString;
exports.runtimeRng = runtimeRng;
exports.setRuntimeRng = setRuntimeRng;
exports.clearRuntimeRng = clearRuntimeRng;
// Small seeded PRNG (LCG) for deterministic tests
function makeSeededRng(seed) {
    let s = seed >>> 0;
    return function rng() {
        // Constants from Numerical Recipes
        s = (s * 1664525 + 1013904223) >>> 0;
        return (s & 0x7fffffff) / 0x80000000;
    };
}
// Convenience: deterministic string-based seed
function seededFromString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return makeSeededRng(h);
}
// Global runtime RNG that can be overridden in tests
// Expose runtime RNG via a global accessor so tests that reset modules can still override it
const GLOBAL_KEY = '__XIANXIA_RUNTIME_RNG__';
if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = Math.random;
}
function runtimeRng() {
    return globalThis[GLOBAL_KEY]();
}
function setRuntimeRng(rng) {
    globalThis[GLOBAL_KEY] = rng;
}
function clearRuntimeRng() {
    globalThis[GLOBAL_KEY] = Math.random;
}
