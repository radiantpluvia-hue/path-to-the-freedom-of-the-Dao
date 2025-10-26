"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const SmallChip_1 = __importDefault(require("./SmallChip"));
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
    if (!open)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }, onClick: onCancel }), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', background: 'var(--dark)', color: 'var(--text-primary)', padding: 20, borderRadius: 8, width: 520, maxWidth: '92%', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.04)' }, children: [title && (0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: { margin: '12px 0', color: 'var(--muted)' }, children: message }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onCancel, style: { padding: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 6, background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--primary)' }, children: cancelLabel }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onConfirm, style: { padding: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 6, background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'var(--dark)' }, children: confirmLabel }) })] })] })] }));
};
exports.default = ConfirmModal;
