"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RARITY_DISPLAY_LONG = void 0;
exports.displayRarity = displayRarity;
const rarityDisplay_1 = require("./rarityDisplay");
// Keep the older human-readable map for longer-form labels (manuals, item full names)
exports.RARITY_DISPLAY_LONG = {
    common: 'Mortal',
    uncommon: 'Refined Mortal',
    rare: 'Heaven-Touched',
    epic: 'Adept',
    legendary: 'Celestial',
    mythical: 'Primordial',
    transcendent: 'Transcendent',
    // weapons.ts uses TitleCase rarities; keep mappings for those as well
    Common: 'Mortal',
    Uncommon: 'Refined Mortal',
    Rare: 'Heaven-Touched',
    Legendary: 'Celestial',
    Unique: 'True Artifact'
};
// New display function: prefer the compact label mapping (user-provided sequence),
// but fall back to the long human-readable names when appropriate.
function displayRarity(key) {
    if (!key)
        return 'Unknown';
    // If the compact mapping can create a label, use it
    const compact = (0, rarityDisplay_1.getDisplayRarity)(key);
    if (compact && compact !== String(key).trim())
        return compact;
    // otherwise return the longer, human-friendly name if available
    return exports.RARITY_DISPLAY_LONG[key] || String(key);
}
exports.default = { RARITY_DISPLAY_LONG: exports.RARITY_DISPLAY_LONG, displayRarity };
