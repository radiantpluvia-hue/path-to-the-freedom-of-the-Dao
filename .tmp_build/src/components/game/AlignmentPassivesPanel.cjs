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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlignmentPassivesPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * AlignmentPassivesPanel
 * Displays currently active alignment-derived passives (alignmentPassiveApplied) with their
 * dynamically scaled bonus values. Scaling logic lives in PassiveRegistry; values are stored
 * per-passive under player._alignmentPassiveAppliedValues[passiveId] so we can show and remove
 * exact amounts even as axes shift. Hidden when no alignment passives are active.
 */
const PassiveRegistry = __importStar(require("../../systems/passiveRegistry"));
// Small helper to pretty-print a passive id (tag_honor_bound -> Honor Bound)
function formatPassiveId(id) {
    return id
        .replace(/^tag_/, '')
        .split('_')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
}
const AlignmentPassivesPanel = ({ player }) => {
    const applied = player.alignmentPassiveApplied || [];
    if (!applied.length)
        return null;
    const valueMap = player._alignmentPassiveAppliedValues || {};
    return ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600, fontSize: '0.85rem', letterSpacing: 0.5, color: 'var(--primary)', marginBottom: 4 }, children: "Alignment Passives" }), (0, jsx_runtime_1.jsx)("ul", { style: { listStyle: 'none', margin: 0, padding: 0, maxHeight: 120, overflowY: 'auto' }, children: applied.map((pid) => {
                    const passiveDef = PassiveRegistry.getPassive(pid) || { id: pid };
                    const bonus = valueMap[pid];
                    return ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', padding: '2px 4px', borderRadius: 4, background: 'var(--surface-alt)', marginBottom: 2 }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '0.75rem' }, children: formatPassiveId(passiveDef.id) }), bonus ? (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: '0.7rem', color: 'var(--success)' }, children: ["+", bonus] }) : null] }, pid));
                }) })] }));
};
exports.AlignmentPassivesPanel = AlignmentPassivesPanel;
exports.default = exports.AlignmentPassivesPanel;
