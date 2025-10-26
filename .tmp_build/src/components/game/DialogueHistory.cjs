"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DialogueHistory;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
function DialogueHistory() {
    const transcript = (0, useGameStore_1.useGameStore)(s => s.getTranscript?.(200) || []);
    if (!transcript || !transcript.length)
        return (0, jsx_runtime_1.jsx)("div", { style: { padding: 12 }, children: "No dialogue history yet." });
    return ((0, jsx_runtime_1.jsx)("div", { style: { maxHeight: '60vh', overflow: 'auto', padding: 12 }, children: transcript.map((t, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: new Date(t.ts).toLocaleTimeString() }), (0, jsx_runtime_1.jsx)("div", { style: { fontWeight: '600', marginTop: 4 }, children: t.type === 'line' ? (t.meta?.speaker || 'Narrator') : t.type === 'choice' ? 'You' : 'System' }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 2 }, children: t.text })] }, i))) }));
}
