"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RandomizedCharacters;
const jsx_runtime_1 = require("react/jsx-runtime");
const cultivationRealms_1 = require("../data/cultivationRealms");
require("./RandomizedCharacters.css");
// small seeded RNG (mulberry32)
function makeRng(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}
const syllables = ['an', 'li', 'wei', 'shen', 'xiao', 'yu', 'zheng', 'hao', 'ming', 'feng', 'rui', 'lei', 'chen', 'bo', 'qiu'];
function makeName(rng) {
    const parts = 2 + Math.floor(rng() * 2);
    let name = '';
    for (let i = 0; i < parts; i++)
        name += syllables[Math.floor(rng() * syllables.length)];
    return name.charAt(0).toUpperCase() + name.slice(1);
}
function realmIndexFromStrength(strength) {
    // Clamp and normalize an unknown-range strength into [0,1]
    // Assume typical strength around -100..200; map to [0,1]
    const clamped = Math.max(-150, Math.min(300, strength));
    const norm = (clamped + 150) / 450; // 0..1
    const max = Object.keys(cultivationRealms_1.CULTIVATION_REALMS).length - 1;
    return Math.round(norm * max);
}
function RandomizedCharacters({ strength, size = 6, seed }) {
    const seedNum = typeof seed === 'number' ? seed : (typeof seed === 'string' ? [...seed].reduce((s, c) => s + c.charCodeAt(0), 0) : Math.floor((strength + 12345) * 997));
    const rng = makeRng(seedNum);
    const baseRealmIdx = realmIndexFromStrength(strength);
    const chars = Array.from({ length: size }).map(() => {
        const jitter = Math.floor((rng() - 0.5) * 3); // -1..+1 roughly
        const idx = Math.max(0, Math.min(Object.keys(cultivationRealms_1.CULTIVATION_REALMS).length - 1, baseRealmIdx + jitter));
        const realmKeys = Object.keys(cultivationRealms_1.CULTIVATION_REALMS);
        const realmKey = realmKeys[idx];
        return {
            name: makeName(rng),
            realmKey,
            power: Math.max(1, Math.round((idx + 1) * (1 + rng() * 0.4)))
        };
    });
    return ((0, jsx_runtime_1.jsx)("div", { className: "randomized-characters", children: chars.map((c, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "rc-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "rc-avatar", children: c.name.charAt(0) }), (0, jsx_runtime_1.jsxs)("div", { className: "rc-info", children: [(0, jsx_runtime_1.jsx)("div", { className: "rc-name", children: c.name }), (0, jsx_runtime_1.jsxs)("div", { className: "rc-meta", children: [cultivationRealms_1.CULTIVATION_REALMS[c.realmKey]?.name || c.realmKey, " \u2022 Power ", c.power] })] })] }, `${c.name}-${i}`))) }));
}
