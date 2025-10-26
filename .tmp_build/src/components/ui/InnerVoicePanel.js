"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InnerVoicePanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../../store/useGameStore");
// Do not statically import InnerVoice here; it may be large and is also
// dynamically imported elsewhere. Resolve at runtime to avoid forcing it
// into the initial bundle.
async function resolveInnerVoice() {
    if (globalThis.InnerVoice)
        return globalThis.InnerVoice;
    try {
        const m = await Promise.resolve().then(() => __importStar(require('../../systems/InnerVoice')));
        return m.default || m;
    }
    catch (e) {
        return null;
    }
}
function InnerVoicePanel({ max = 3 }) {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const store = (0, useGameStore_1.useGameStore)();
    const settings = store.getSettings ? store.getSettings() : {};
    const showPanel = settings?.innerVoice?.showPanel !== false; // default true
    const displayMs = typeof settings?.innerVoice?.displayMs === 'number' ? settings.innerVoice.displayMs : 4500;
    (0, react_1.useEffect)(() => {
        if (!showPanel)
            return;
        let mounted = true;
        // wrap async work in an inner function
        (async () => {
            try {
                const iv = globalThis.InnerVoice || null;
                const resolved = iv ? iv : await resolveInnerVoice();
                if (resolved && typeof resolved.registerListener === 'function') {
                    const unreg = resolved.registerListener('*', (t) => {
                        if (!mounted)
                            return;
                        setMessages(prev => {
                            const next = [t, ...prev].slice(0, max);
                            return next;
                        });
                        // auto-remove after TTL-ish (visual fade); do not rely on snapshot
                        setTimeout(() => {
                            if (!mounted)
                                return;
                            setMessages(prev => prev.filter(m => m.id !== t.id));
                        }, displayMs);
                    });
                    // cleanup
                    return () => { mounted = false; unreg(); };
                }
            }
            catch (e) {
                // no-op
            }
        })();
        return () => { mounted = false; };
    }, [max, showPanel, displayMs]);
    if (!showPanel || messages.length === 0)
        return null;
    const onClickBubble = (t) => {
        // Persist thought into player settings savedInnerVoice array and open dialogue history
        try {
            const cur = store.getSettings ? store.getSettings() : {};
            const saved = (cur.savedInnerVoice || []);
            store.setSettings && store.setSettings({ savedInnerVoice: [{ ...t, persistedAt: Date.now() }, ...saved].slice(0, 200) });
            store.setUIProperty('showNarrative', true);
        }
        catch (e) { /* ignore */ }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', left: 20, bottom: 120, zIndex: 2500, display: 'flex', flexDirection: 'column', gap: 8 }, children: messages.map(m => ((0, jsx_runtime_1.jsx)("div", { onClick: () => onClickBubble(m), style: { background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.6)', maxWidth: 380, cursor: 'pointer' }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.95rem' }, children: m.text }) }, m.id))) }));
}
