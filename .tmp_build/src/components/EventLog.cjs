"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLog = EventLog;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const SmallChip_1 = __importDefault(require("./ui/SmallChip"));
function EventLog({ maxVisible = 15, autoScroll = true, forwardedRef = null }) {
    const eventLog = (0, useGameStore_1.useGameStore)(state => state.eventLog);
    const localRef = (0, react_1.useRef)(null);
    const ref = forwardedRef || localRef;
    const prevLengthRef = (0, react_1.useRef)(eventLog.length);
    const [userAtBottom, setUserAtBottom] = (0, react_1.useState)(true);
    // Handler to detect user scroll position
    const onScroll = (e) => {
        try {
            const el = e.target;
            const threshold = 24; // px from bottom considered "at bottom"
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
            setUserAtBottom(atBottom);
        }
        catch (e) { /* ignore */ }
    };
    (0, react_1.useEffect)(() => {
        if (!autoScroll)
            return;
        try {
            if (ref && 'current' in ref && ref.current) {
                const el = ref.current;
                const added = eventLog.length > prevLengthRef.current;
                prevLengthRef.current = eventLog.length;
                // Only autoscroll when items were added and the user was at/near the bottom
                if (added && userAtBottom) {
                    // If the container uses column-reverse, we still want the visual bottom
                    // to show the latest messages. Setting scrollTop to max ensures the
                    // viewport is scrolled to the newest entries.
                    el.scrollTop = el.scrollHeight;
                }
            }
        }
        catch (e) {
            // ignore in non-browser envs
        }
    }, [eventLog.length, autoScroll, ref, userAtBottom]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', boxSizing: 'border-box' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { position: 'sticky', top: 0, zIndex: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, background: 'linear-gradient(135deg, var(--dark), var(--darker))', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }, children: "Event Log" }), (0, jsx_runtime_1.jsx)("button", { "aria-label": "Jump to bottom", onClick: () => { try {
                            const el = (ref && 'current' in ref && ref.current) ? ref.current : null;
                            if (el)
                                el.scrollTop = el.scrollHeight;
                        }
                        catch (e) { /* ignore */ } }, style: { background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }, children: "Jump to bottom" })] }), (0, jsx_runtime_1.jsx)("div", { ref: ref, role: "log", "aria-live": "polite", "aria-atomic": "false", "aria-relevant": "additions", tabIndex: 0, "aria-label": "Game event log", onScroll: onScroll, style: { position: 'relative', maxHeight: '220px', overflowY: 'auto', fontSize: '0.85rem', display: 'flex', flexDirection: 'column-reverse', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: 6, padding: '6px 8px', background: 'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.12))', zIndex: 110, boxSizing: 'border-box' }, "data-testid": "event-log-container", children: eventLog.slice(-maxVisible).map((event, index) => ((0, jsx_runtime_1.jsx)("div", { style: { borderBottom: '1px solid rgba(212, 175, 55, 0.08)' }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { display: 'block', padding: '4px 6px', borderRadius: 4, background: 'transparent', color: 'var(--text)' }, children: event }) }, index))) })] }));
}
exports.default = EventLog;
