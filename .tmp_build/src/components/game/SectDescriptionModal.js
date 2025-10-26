"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectDescriptionModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Card_1 = require("../core/Card");
const SectDescriptionModal = ({ open, sect, onClose }) => {
    const overlayRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const onKey = (e) => { if (e.key === 'Escape')
            onClose(); };
        if (open)
            window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open || !sect)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }, ref: overlayRef, onClick: (e) => { if (e.target === overlayRef.current)
            onClose(); }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: 'min(900px, 96vw)', maxHeight: '85vh', overflowY: 'auto' }, children: (0, jsx_runtime_1.jsx)(Card_1.Card, { title: sect.name, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)' }, children: sect.description }), sect.leaderName && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Leader:" }), " ", sect.leaderName, " ", sect.leaderTitle ? ` — ${sect.leaderTitle}` : '', sect.leaderDescription && (0, jsx_runtime_1.jsx)("p", { style: { marginTop: 6 }, children: sect.leaderDescription })] })), sect.philosophy && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Philosophy:" }), (0, jsx_runtime_1.jsx)("p", { style: { marginTop: 6 }, children: sect.philosophy })] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginLeft: 12, minWidth: 220 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Realm:" }), " ", sect.realm] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Power:" }), " ", sect.power] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Type:" }), " ", sect.type] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12 }, children: (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "xbtn", style: { width: '100%' }, children: "Close" }) })] })] }) }) }) }));
};
exports.SectDescriptionModal = SectDescriptionModal;
exports.default = exports.SectDescriptionModal;
