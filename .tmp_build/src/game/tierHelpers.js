"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTierBase = getTierBase;
exports.tierFriendlyName = tierFriendlyName;
exports.tierFullLabel = tierFullLabel;
const tier_1 = require("./tier");
function getTierBase(t) {
    if (!t)
        return '';
    return String(t).replace(/[+-]$/, '');
}
function tierFriendlyName(t) {
    const base = getTierBase(t);
    const meta = tier_1.TIER_METADATA[base] || { name: base };
    if (String(t).endsWith('+'))
        return `High ${meta.name}`;
    if (String(t).endsWith('-'))
        return `Low ${meta.name}`;
    return meta.name;
}
function tierFullLabel(t) {
    const base = getTierBase(t);
    const subtitle = (tier_1.TIER_METADATA[base] && tier_1.TIER_METADATA[base].subtitle) || `${base} Tier`;
    return `${t} — ${tierFriendlyName(t)}${subtitle ? ` (${subtitle})` : ''}`;
}
