"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card_1 = require("../core/Card");
const Button_1 = require("../core/Button");
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
    if (!open)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: 'min(600px, 92vw)' }, children: (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: title || 'Confirm', children: [(0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', marginBottom: 12 }, children: message }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: onCancel, children: cancelLabel }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "danger", onClick: onConfirm, children: confirmLabel })] })] }) }) }));
};
exports.ConfirmDialog = ConfirmDialog;
exports.default = exports.ConfirmDialog;
