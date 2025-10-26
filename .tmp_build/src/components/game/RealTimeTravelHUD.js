"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RealTimeTravelHUD;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../../store/useGameStore");
const Button_1 = require("../core/Button");
const SmallChip_1 = __importDefault(require("../ui/SmallChip"));
const TravelEncounterSystem_1 = require("@/systems/TravelEncounterSystem");
function RealTimeTravelHUD() {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, cancelTravel: _cancelTravel } = store;
    void _cancelTravel;
    const active = player.activeTravel;
    const realMeta = active?.meta || {};
    const secs = realMeta?.realTimeDurationSeconds || 0;
    const [remaining, setRemaining] = (0, react_1.useState)(secs);
    const startRef = (0, react_1.useRef)(null);
    const arrivalEpochMs = realMeta?.arrivalEpochMs || null;
    const pending = realMeta?.pendingEncounters || [];
    const pendingIndexRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        if (!active || !realMeta.realTime)
            return;
        // Compute remaining time using absolute arrivalEpochMs when available; falls back to relative duration
        const nowMs = Date.now();
        if (arrivalEpochMs) {
            setRemaining(Math.max(0, Math.ceil((arrivalEpochMs - nowMs) / 1000)));
        }
        else {
            // fallback: resume from saved timestamp if present
            const saved = realMeta.realTimeStartTimestamp || null;
            startRef.current = saved ? Number(saved) : Date.now();
            setRemaining(secs - Math.floor((Date.now() - (startRef.current || Date.now())) / 1000));
        }
        const iv = setInterval(() => {
            const now = Date.now();
            const rem = arrivalEpochMs ? Math.max(0, Math.ceil((arrivalEpochMs - now) / 1000)) : Math.max(0, secs - Math.floor((now - (startRef.current || now)) / 1000));
            setRemaining(rem);
            // Check pending encounters and trigger if their epoch has passed
            try {
                const idx = pendingIndexRef.current || 0;
                if (pending && pending.length > idx) {
                    const next = pending[idx];
                    if (next && next.epochMs && Date.now() >= next.epochMs) {
                        // Trigger encounter: set player.activeEncounter via TravelEncounterSystem
                        try {
                            // Compose an activeEncounter object and persist via system
                            const _created = (0, TravelEncounterSystem_1.resolvePlannedEncountersAndMaybeInterrupt)({ edges: [next], fromNodeId: next.from, toNodeId: next.to, mode: 'walk' });
                            void _created;
                            // advance pending index to avoid retrigger
                            pendingIndexRef.current = idx + 1;
                            // Pause HUD while encounter active (we simply stop interval until encounter resolves)
                            clearInterval(iv);
                            return;
                        }
                        catch (e) {
                            // ignore and continue
                        }
                    }
                }
            }
            catch (e) {
                // ignore pending errors
            }
            if (rem <= 0) {
                clearInterval(iv);
                // finish travel: resolve arrival via processTravelTick
                try {
                    useGameStore_1.useGameStore.getState().processTravelTick();
                }
                catch (e) {
                    void e;
                }
            }
        }, 500);
        return () => clearInterval(iv);
    }, [active, realMeta.realTime, secs]);
    if (!active || !realMeta.realTime)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: 'rgba(0,0,0,0.55)', padding: 12, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center', minWidth: 360, boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: `Travelling to ${String(active.toNodeId || '').replace(/_/g, ' ')}` }), (0, jsx_runtime_1.jsx)("div", { style: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: `${Math.round((((realMeta.arrivalEpochMs ? Math.max(0, Math.ceil((realMeta.arrivalEpochMs - Date.now()) / 1000)) : realMeta.realTimeDurationSeconds) - remaining) / Math.max(1, realMeta.realTimeDurationSeconds)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--primary))' } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [remaining, "s remaining"] }), realMeta.plannedEncounters && realMeta.plannedEncounters.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6, fontSize: 12, opacity: 0.9 }, children: ["Risk along route: ", Math.round(realMeta.plannedEncounters.reduce((acc, e) => acc + (e.encounter?.chance || 0), 0) * 100), "%"] }))] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: () => { try {
                            useGameStore_1.useGameStore.getState().cancelTravel();
                        }
                        catch (e) {
                            void e;
                        } }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { padding: '4px 8px' }, children: "Cancel" }) }) })] }) }));
}
