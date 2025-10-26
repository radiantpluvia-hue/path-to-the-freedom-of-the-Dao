"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEW_TO_LEGACY = exports.LEGACY_TO_NEW_TIER = void 0;
exports.migrateTier = migrateTier;
exports.revertTier = revertTier;
// Canonical mapping for legacy (word) rarity keys -> new single-letter tiers.
// Keys are lowercased to make lookups case-insensitive.
exports.LEGACY_TO_NEW_TIER = {
    'common': 'H',
    'common+': 'H+',
    'common-': 'H-',
    'uncommon': 'G',
    'rare': 'F',
    'epic': 'E',
    'legendary': 'D',
    'mythic': 'B',
    'mythical': 'B',
    'transcendent': 'B'
};
// Reversible mapping: canonical single-letter tiers back to a reasonable legacy word.
exports.NEW_TO_LEGACY = {
    H: 'common',
    G: 'uncommon',
    F: 'rare',
    E: 'epic',
    D: 'legendary',
    B: 'transcendent'
};
// Migrate a legacy rarity (word, mixed-case, or simple numeric) to a canonical tier code.
// Returns an uppercase tier (e.g. 'H', 'G', 'F', 'E', 'D', 'B') and preserves a single trailing '+' or '-' if present.
function migrateTier(legacy) {
    if (!legacy)
        return 'F';
    const raw = String(legacy).trim();
    if (!raw)
        return 'F';
    // If already looks like a tier code (letters, optionally with + or -), accept it (uppercase).
    const tierLike = /^([A-Za-z]{1,4})([+-])?$/.exec(raw);
    if (tierLike) {
        const letters = tierLike[1].toUpperCase();
        const sign = tierLike[2] || '';
        // Treat single-letter codes (H/G/F/...) and a small set of known multi-letter codes as canonical.
        const ALLOWED_MULTI = new Set(['SS', 'SSS', 'A']);
        if (letters.length === 1 || ALLOWED_MULTI.has(letters)) {
            // Normalize case and preserve any +/- suffix.
            return letters + sign;
        }
        // otherwise (e.g. 'rare' or other words), fall through to legacy-word lookup below.
    }
    // Lowercase lookup for legacy words (handles 'common', 'transcendent', etc.)
    const key = raw.toLowerCase();
    if (exports.LEGACY_TO_NEW_TIER[key])
        return exports.LEGACY_TO_NEW_TIER[key];
    // If the input had a +/- suffix (e.g., 'common+' but not in map because of spacing/case), try to preserve it.
    const m = /^(.+?)([+-])$/.exec(raw);
    if (m) {
        const base = m[1].toLowerCase();
        const suffix = m[2];
        if (exports.LEGACY_TO_NEW_TIER[base])
            return exports.LEGACY_TO_NEW_TIER[base] + suffix;
    }
    // Numeric fallback: keep simple and safe — treat numeric and unknown values as 'F' (mid-tier).
    if (/^\d+$/.test(raw))
        return 'F';
    // Final fuzzy fallbacks for some common synonyms.
    if (key.includes('common'))
        return 'H';
    if (key.includes('uncommon'))
        return 'G';
    if (key.includes('rare'))
        return 'F';
    if (key.includes('epic'))
        return 'E';
    if (key.includes('legend'))
        return 'D';
    if (key.includes('transcend') || key.includes('myth'))
        return 'B';
    // Default conservative tier
    return 'F';
}
// Revert a canonical tier code back to a legacy word where possible. Returns undefined for unknown tiers.
function revertTier(tier) {
    if (!tier)
        return undefined;
    const t = String(tier).trim().toUpperCase();
    // Strip single trailing + or - when checking canonical mapping
    const base = t.replace(/[+-]$/, '');
    return exports.NEW_TO_LEGACY[base];
}
