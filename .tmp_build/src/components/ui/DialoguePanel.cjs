"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DialoguePanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../../store/useGameStore");
const SmallChip_1 = __importDefault(require("./SmallChip"));
function DialoguePanel() {
    const current = (0, useGameStore_1.useGameStore)(s => s.currentDialogue);
    const idx = (0, useGameStore_1.useGameStore)(s => s.currentLineIndex);
    const advance = (0, useGameStore_1.useGameStore)(s => s.advanceDialogue);
    const choose = (0, useGameStore_1.useGameStore)(s => s.chooseDialogueChoice);
    const cancelTimed = (0, useGameStore_1.useGameStore)(s => s.cancelTimedChoice);
    const _timedMeta = (0, useGameStore_1.useGameStore)(s => s._timedChoiceMeta);
    const appendTranscript = (0, useGameStore_1.useGameStore)(s => s.appendTranscript);
    void _timedMeta;
    const [typed, setTyped] = (0, react_1.useState)('');
    const [typing, setTyping] = (0, react_1.useState)(false);
    const [typingSpeed] = (0, react_1.useState)(10);
    const typingTimerRef = (0, react_1.useRef)(null);
    const line = current?.lines?.[idx];
    const ui = (0, useGameStore_1.useGameStore)(s => s.ui);
    const dialoguePos = ui?.dialoguePanelPosition || 'bottom-left';
    const dialogueOpacity = typeof ui?.dialoguePanelOpacity === 'number' ? ui.dialoguePanelOpacity : 0.85;
    (0, react_1.useEffect)(() => {
        if (!line)
            return;
        setTyped('');
        setTyping(true);
        try {
            appendTranscript?.({ type: 'line', text: String(line.text || ''), meta: { speaker: line.speaker, dialogueId: current?.id, lineIndex: idx } });
        }
        catch (e) { /* ignore */ }
        let i = 0;
        const text = String(line.text || '');
        const id = setInterval(() => {
            i++;
            setTyped(text.substr(0, i));
            if (i >= text.length) {
                clearInterval(id);
                setTyping(false);
            }
        }, typingSpeed);
        return () => { clearInterval(id); if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        } };
    }, [line?.text, idx, typingSpeed]);
    (0, react_1.useEffect)(() => {
        const el = document.querySelector('.dialogue-panel');
        if (el)
            el.focus();
    }, [current]);
    (0, react_1.useEffect)(() => {
        const handler = (e) => {
            if (!line)
                return;
            if (e.key === '1' || e.key === '2' || e.key === '3') {
                const idxKey = Number(e.key) - 1;
                if (line.choices && line.choices[idxKey]) {
                    cancelTimed?.();
                    choose(idxKey);
                }
            }
            if (e.key === 'Escape')
                cancelTimed?.();
            if (e.key === 'Enter' && !(line.choices && line.choices.length)) {
                cancelTimed?.();
                advance();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [line, choose, advance, cancelTimed]);
    if (!current || !line)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "dialogue-panel", role: "dialog", "aria-label": "dialogue", tabIndex: -1, style: {
            position: 'fixed',
            zIndex: 3500, // ensure it overlays event log
            width: 480,
            maxWidth: 'min(92%, 560px)',
            background: `rgba(8,10,12,${Math.max(0.3, Math.min(1, dialogueOpacity))})`, // controlled opacity
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
            transition: 'transform 160ms ease, opacity 160ms ease',
            opacity: dialogueOpacity,
            ...(dialoguePos === 'bottom-left' ? { left: 20, bottom: 80 } : {}),
            ...(dialoguePos === 'bottom-right' ? { right: 20, bottom: 80 } : {}),
            ...(dialoguePos === 'top-left' ? { left: 20, top: 80 } : {}),
            ...(dialoguePos === 'top-right' ? { right: 20, top: 80 } : {}),
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 10, alignItems: 'flex-start' }, children: [line.portrait ? ((0, jsx_runtime_1.jsx)("div", { style: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flex: '0 0 56px', border: '1px solid rgba(255,255,255,0.04)' }, children: (0, jsx_runtime_1.jsx)("img", { src: `/assets/icons/${line.portrait}.svg`, alt: line.speaker, style: { width: '100%', height: '100%', objectFit: 'cover' } }) })) : null, (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 800, color: 'var(--primary)', fontSize: '1.02rem' }, children: line.speaker || 'You' }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, color: 'var(--muted)', fontSize: '0.98rem', lineHeight: 1.45, minHeight: 56 }, "aria-live": "polite", children: [typed, typing ? (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 4 }, className: "cursor", children: "|" }) : null] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12 }, children: line.choices && line.choices.length ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 }, children: line.choices.map((c, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { cancelTimed?.(); choose(i); }, style: { padding: 0, borderRadius: 6 }, children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { children: [line.choices.length > 1 ? `${i + 1}. ` : '', c.text] }) }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => { cancelTimed?.(); advance(); }, style: { padding: 0, borderRadius: 6 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Continue" }) }) })) })] })] }) }));
}
