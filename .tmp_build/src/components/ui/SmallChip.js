"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VARIANT_STYLES = void 0;
exports.default = SmallChip;
const jsx_runtime_1 = require("react/jsx-runtime");
const VARIANT_STYLES = {
    neutral: { background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.06)' },
    success: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.5)' },
    danger: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' },
    accent: { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }
};
exports.VARIANT_STYLES = VARIANT_STYLES;
function SmallChip({ children, className = '', style, variant = 'neutral', title }) {
    const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;
    return ((0, jsx_runtime_1.jsx)("span", { className: className, title: title, style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 6px',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            ...vs,
            ...style
        }, children: children }));
}
