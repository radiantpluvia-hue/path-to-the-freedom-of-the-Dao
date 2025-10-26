"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TierBadge;
const jsx_runtime_1 = require("react/jsx-runtime");
const tierHelpers_1 = require("@/game/tierHelpers");
const rarityNames_1 = require("@/utils/rarityNames");
require("./TierBadge.css");
function TierBadge({ tier, className = '', small = false }) {
    const code = String(tier || '');
    const base = code.replace(/[+-]$/, '') || 'F';
    const modifier = code.endsWith('+') ? 'plus' : code.endsWith('-') ? 'minus' : '';
    const cssClass = `tier-badge tier-${base}${modifier ? `-${modifier}` : ''} ${className}`.trim();
    const title = (0, tierHelpers_1.tierFullLabel)(code || 'F');
    return ((0, jsx_runtime_1.jsxs)("span", { className: cssClass, title: title, "aria-label": title, style: { fontSize: small ? '0.75rem' : '0.9rem', padding: small ? '2px 6px' : '4px 8px', borderRadius: 6, display: 'inline-block' }, children: [(0, rarityNames_1.displayRarity)(code) || (code || 'F'), " ", small ? '' : `• ${(0, tierHelpers_1.tierFriendlyName)(code)}`] }));
}
