"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAT_TIERS = void 0;
exports.numericToTier = numericToTier;
exports.tierToNumeric = tierToNumeric;
exports.tierLabelFor = tierLabelFor;
// Visible stat tiers derived from cultivation realms so players see their cultivation
// level as the visible stat tier. This file maps numeric cultivation/qi values to
// human-friendly realm names and provides conversion helpers.
const cultivationRealms_1 = require("./cultivationRealms");
// Build STAT_TIERS dynamically from REALM_ORDER and CULTIVATION_REALMS.
// We add a leading 'none' tier for values below the first realm's qiRequirement.
exports.STAT_TIERS = (() => {
    const tiers = [];
    if (!Array.isArray(cultivationRealms_1.REALM_ORDER) || typeof cultivationRealms_1.CULTIVATION_REALMS !== 'object') {
        // Fallback to a simple set if cultivation data missing
        return [
            { id: 'none', name: 'None', min: 0, max: 99 },
            { id: 'mortal', name: 'Mortal', min: 100, max: 9999999 }
        ];
    }
    // first realm threshold
    const firstRealmId = cultivationRealms_1.REALM_ORDER[0];
    const firstQi = cultivationRealms_1.CULTIVATION_REALMS[firstRealmId]?.qiRequirement || 0;
    // 'none' covers values below the first realm requirement
    tiers.push({ id: 'none', name: 'None', min: 0, max: Math.max(0, firstQi - 1) });
    for (let i = 0; i < cultivationRealms_1.REALM_ORDER.length; i++) {
        const realmId = cultivationRealms_1.REALM_ORDER[i];
        const realm = cultivationRealms_1.CULTIVATION_REALMS[realmId];
        if (!realm)
            continue;
        const min = realm.qiRequirement;
        // upper bound is one less than the next realm's qiRequirement, or very large for last
        const nextRealmId = cultivationRealms_1.REALM_ORDER[i + 1];
        const nextQi = nextRealmId ? (cultivationRealms_1.CULTIVATION_REALMS[nextRealmId]?.qiRequirement || Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
        const max = Math.max(min, nextQi - 1);
        tiers.push({ id: realm.id, name: realm.name, min, max });
    }
    return tiers;
})();
// Given a numeric value (cultivation/qi/etc), return the corresponding tier object
function numericToTier(value) {
    if (typeof value !== 'number' || isNaN(value))
        value = 0;
    // search tiers from highest to lowest so upper open ranges map correctly
    for (let i = exports.STAT_TIERS.length - 1; i >= 0; i--) {
        const t = exports.STAT_TIERS[i];
        if (value >= t.min && value <= t.max)
            return t;
    }
    return exports.STAT_TIERS[0];
}
// Given a tier id (realm id), return a representative numeric value (median of range)
function tierToNumeric(tierId) {
    const t = exports.STAT_TIERS.find(x => x.id === tierId) || exports.STAT_TIERS[0];
    // If the tier has a very large max (Number.MAX_SAFE_INTEGER), return its min
    if (t.max === Number.MAX_SAFE_INTEGER)
        return t.min;
    return Math.floor((t.min + t.max) / 2);
}
// Convenience: return the visible label (realm name) for a numeric value
function tierLabelFor(value) {
    return numericToTier(value).name;
}
exports.default = exports.STAT_TIERS;
