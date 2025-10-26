"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConfirm = GlobalConfirm;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const Card_1 = require("@/components/core/Card");
const Button_1 = require("@/components/core/Button");
const confirmRegistry_1 = __importDefault(require("@/store/confirmRegistry"));
function GlobalConfirm() {
    const { ui, setUIProperty } = (0, useGameStore_1.useGameStore)(state => ({ ui: state.ui, setUIProperty: state.setUIProperty }));
    const active = ui.activeConfirm;
    if (!active)
        return null;
    const handleConfirm = () => {
        // Call any externally-registered handler
        const handlers = confirmRegistry_1.default.consumeConfirmHandler(active.id || '');
        try {
            if (handlers && handlers.onConfirm)
                handlers.onConfirm();
        }
        catch (e) {
            console.error('confirm handler failed', e);
        }
        setUIProperty('activeConfirm', undefined);
    };
    const handleCancel = () => {
        const handlers = confirmRegistry_1.default.consumeConfirmHandler(active.id || '');
        try {
            if (handlers && handlers.onCancel)
                handlers.onCancel();
        }
        catch (e) {
            console.error('confirm cancel handler failed', e);
        }
        setUIProperty('activeConfirm', undefined);
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 2500 }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: 'min(640px, 92vw)' }, children: (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: active.title || 'Confirm', children: [(0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', marginBottom: '16px' }, children: active.message }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: handleCancel, children: active.cancelLabel || 'Cancel' }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "danger", onClick: handleConfirm, children: active.confirmLabel || 'Confirm' })] })] }) }) }));
}
exports.default = GlobalConfirm;
