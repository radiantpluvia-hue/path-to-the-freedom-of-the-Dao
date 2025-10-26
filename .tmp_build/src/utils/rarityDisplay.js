"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTRA_LABELS = exports.INTERNAL_TO_DISPLAY = void 0;
exports.getDisplayRarity = getDisplayRarity;
exports.INTERNAL_TO_DISPLAY = {
    // internal letter codes -> user-provided display sequence
    H: 'F',
    G: 'E',
    F: 'D',
    E: 'C',
    D: 'B',
    B: 'A',
    // map the legacy words to nearby labels as a sensible default
    common: 'F',
    uncommon: 'E',
    rare: 'D',
    epic: 'C',
    legendary: 'B',
    mythical: 'S',
    transcendent: 'SSS',
    // weapons/items may use TitleCase keys
    Common: 'F',
    Uncommon: 'E',
    Rare: 'D',
    Epic: 'C',
    Legendary: 'B',
    Mythical: 'S',
    Transcendent: 'SSS',
};
// Secondary mapping for higher-granularity special tiers if needed
exports.EXTRA_LABELS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'X', 'Z'];
function getDisplayRarity(key) {
    if (!key)
        return 'Unknown';
    const k = String(key).trim();
    // direct mapping
    if (exports.INTERNAL_TO_DISPLAY[k])
        return exports.INTERNAL_TO_DISPLAY[k];
    // try uppercase letter
    const up = k.toUpperCase();
    if (exports.INTERNAL_TO_DISPLAY[up])
        return exports.INTERNAL_TO_DISPLAY[up];
    // try lowercase word
    const lw = k.toLowerCase();
    if (exports.INTERNAL_TO_DISPLAY[lw])
        return exports.INTERNAL_TO_DISPLAY[lw];
    // if key already looks like one of the display labels, return as-is
    if (exports.EXTRA_LABELS.includes(k))
        return k;
    if (exports.EXTRA_LABELS.includes(up))
        return up;
    // fallback: return original string
    return k;
}
exports.default = { INTERNAL_TO_DISPLAY: exports.INTERNAL_TO_DISPLAY, getDisplayRarity };
