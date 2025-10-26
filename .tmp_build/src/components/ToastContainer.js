"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../store/useGameStore");
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
const variantColors = {
    info: { bg: 'rgba(0,0,0,0.85)', color: '#fff' },
    success: { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', color: '#06160a' },
    error: { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', color: '#fff' }
};
const ToastContainer = () => {
    const toast = (0, useGameStore_1.useGameStore)(state => state.toast);
    const hide = (0, useGameStore_1.useGameStore)(state => state.hideToast);
    let style = {};
    if (toast) {
        const v = (toast.type && variantColors[toast.type]) ? variantColors[toast.type] : variantColors.info;
        style = {
            position: 'fixed',
            right: 20,
            bottom: 20,
            background: v.bg,
            color: v.color,
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 9999,
            minWidth: 220,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transform: 'translateY(0)',
            transition: 'opacity 220ms ease, transform 220ms ease',
            opacity: 1
        };
    }
    if (!toast)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { "aria-live": "polite", role: "status", style: style, children: [(0, jsx_runtime_1.jsx)("div", { style: { flex: 1 }, children: toast.message }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: () => hide?.(), ariaLabel: "Close toast", title: "Close", size: 16 }) })] }));
};
exports.default = ToastContainer;
