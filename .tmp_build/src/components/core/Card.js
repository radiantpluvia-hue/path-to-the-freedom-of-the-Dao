"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const jsx_runtime_1 = require("react/jsx-runtime");
function Card({ title, children, compact = false, style }) {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            padding: compact ? '12px' : '20px',
            ...(style || {})
        }, children: [title && ((0, jsx_runtime_1.jsx)("h3", { style: {
                    color: 'var(--primary)',
                    marginBottom: compact ? '10px' : '15px',
                    fontSize: compact ? '1rem' : '1.2rem',
                    fontWeight: '600'
                }, children: title })), children] }));
}
