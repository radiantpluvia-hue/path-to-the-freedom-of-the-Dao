"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DialogueBox;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
function DialogueBox() {
    const current = (0, useGameStore_1.useGameStore)(s => s.currentDialogue);
    const idx = (0, useGameStore_1.useGameStore)(s => s.currentLineIndex);
    const advance = (0, useGameStore_1.useGameStore)(s => s.advanceDialogue);
    const choose = (0, useGameStore_1.useGameStore)(s => s.chooseDialogueChoice);
    const cancelTimed = (0, useGameStore_1.useGameStore)(s => s.cancelTimedChoice);
    const timedMeta = (0, useGameStore_1.useGameStore)(s => s._timedChoiceMeta);
    const appendTranscript = (0, useGameStore_1.useGameStore)(s => s.appendTranscript);
    const [typed, setTyped] = (0, react_1.useState)('');
    const [typing, setTyping] = (0, react_1.useState)(false);
    const [typingSpeed, setTypingSpeed] = (0, react_1.useState)(8);
    const [autoAdvance, setAutoAdvance] = (0, react_1.useState)(false);
    const typingTimerRef = (0, react_1.useRef)(null);
    const line = current?.lines?.[idx];
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
                if (autoAdvance) {
                    typingTimerRef.current = window.setTimeout(() => advance(), 350);
                }
            }
        }, typingSpeed);
        return () => { clearInterval(id); if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        } };
    }, [line?.text, idx, typingSpeed, autoAdvance]);
    (0, react_1.useEffect)(() => {
        // focus management when dialogue opens
        const el = document.querySelector('.dialogue-box');
        if (el)
            el.focus();
    }, [current]);
    // keyboard shortcuts for choices and cancel timed choice
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
            if (e.key === 'Escape') {
                // cancel timer but don't close dialogue
                cancelTimed?.();
            }
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dialogue-box", role: "dialog", "aria-label": "dialogue", tabIndex: -1, children: [(0, jsx_runtime_1.jsx)("div", { className: "portrait", children: line.portrait ? (0, jsx_runtime_1.jsx)("img", { src: `/assets/icons/${line.portrait}.svg`, alt: line.speaker }) : null }), (0, jsx_runtime_1.jsxs)("div", { className: "content", children: [(0, jsx_runtime_1.jsx)("div", { className: "speaker", children: line.speaker }), (0, jsx_runtime_1.jsxs)("div", { className: "text", "aria-live": "polite", children: [typed, typing ? (0, jsx_runtime_1.jsx)("span", { className: "cursor", children: "|" }) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "dialogue-controls", style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'inline-block', marginRight: 8 }, children: "Typing speed" }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: 2, max: 40, value: typingSpeed, onChange: e => setTypingSpeed(Number(e.target.value)) }), (0, jsx_runtime_1.jsxs)("label", { style: { marginLeft: 12 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: autoAdvance, onChange: e => setAutoAdvance(e.target.checked) }), " Auto-advance"] })] }), line.choices && line.choices.length ? ((0, jsx_runtime_1.jsxs)("div", { className: "choices", role: "list", children: [timedMeta ? (() => {
                                const now = Date.now();
                                const elapsed = Math.max(0, now - (timedMeta.startAt || now));
                                const remaining = Math.max(0, (timedMeta.timeoutMs || 10000) - elapsed);
                                const pct = Math.max(0, Math.min(1, remaining / (timedMeta.timeoutMs || 10000)));
                                return ((0, jsx_runtime_1.jsxs)("div", { className: "timed-visual", style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { className: "progress", "aria-hidden": true, style: { height: 6, background: '#333', borderRadius: 3, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: `${pct * 100}%`, height: '100%', background: '#9ecbff', transition: 'width 0.1s linear' } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "countdown", "aria-live": "polite", style: { marginTop: 6 }, children: [Math.ceil(remaining / 1000), "s"] })] }));
                            })() : null, line.choices.map((c, i) => {
                                const isDefault = timedMeta && (timedMeta.defaultChoiceIndex === i);
                                const nearEnd = timedMeta && ((timedMeta.timeoutMs || 10000) - (Date.now() - (timedMeta.startAt || 0)) <= 2000);
                                return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => { cancelTimed?.(); choose(i); }, "aria-label": `Choice ${i + 1}: ${c.text}`, style: {
                                        margin: 6,
                                        padding: '8px 12px',
                                        transform: isDefault && nearEnd ? 'scale(1.03)' : 'none',
                                        transition: 'transform 120ms ease-in-out',
                                        boxShadow: isDefault ? '0 0 8px rgba(158,203,255,0.6)' : undefined
                                    }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 'bold', marginRight: 8 }, children: line.choices.length > 1 ? `${i + 1}. ` : '' }), c.text] }, i));
                            })] })) : ((0, jsx_runtime_1.jsx)("button", { onClick: () => { cancelTimed?.(); advance(); }, children: "Continue" }))] })] }));
}
