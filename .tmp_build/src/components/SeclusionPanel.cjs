"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeclusionPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const useGameStore_1 = require("../store/useGameStore");
const Button_1 = require("./core/Button");
const Card_1 = require("./core/Card");
const SeclusionPanel = () => {
    // Avoid calling `getState()` inside the selector which may read from the
    // seclusionPath instance and cause synchronous store updates that lead to
    // nested update loops. Instead we select the reference and snapshot it in
    // an effect into local component state.
    const seclusionPathRef = (0, useGameStore_1.useGameStore)(state => state.seclusionPath);
    const [seclusionState, setSeclusionState] = react_1.default.useState(null);
    react_1.default.useEffect(() => {
        let mounted = true;
        try {
            if (seclusionPathRef && typeof seclusionPathRef.getState === 'function') {
                const snap = seclusionPathRef.getState();
                if (mounted)
                    setSeclusionState(snap);
            }
            else {
                if (mounted)
                    setSeclusionState(null);
            }
        }
        catch (e) {
            if (mounted)
                setSeclusionState(null);
        }
        return () => { mounted = false; };
    }, [seclusionPathRef]);
    const player = (0, useGameStore_1.useGameStore)(state => state.player);
    const enterSeclusion = (0, useGameStore_1.useGameStore)(state => state.enterSeclusion);
    const exitSeclusion = (0, useGameStore_1.useGameStore)(state => state.exitSeclusion);
    const performSeclusionStudy = (0, useGameStore_1.useGameStore)(state => state.performSeclusionStudy);
    const attemptRealmBreakthroughWithConsolidation = (0, useGameStore_1.useGameStore)(state => state.attemptRealmBreakthroughWithConsolidation);
    const seclusionProgress = (0, useGameStore_1.useGameStore)(state => state.ui?.seclusionProgress || 0);
    const seclusionReady = (0, useGameStore_1.useGameStore)(state => state.ui?.seclusionReadyForBreakthrough || false);
    const addEventLog = (0, useGameStore_1.useGameStore)(state => state.addEventLog);
    // Unlock rules
    const canStudy = (player.manuals && player.manuals.length > 0) || (player.skills?.meditation?.level || 0) > 0;
    const isSecluded = seclusionState?.mode === 'secluded';
    return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "Seclusion", children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Mode: ", seclusionState?.mode ?? 'idle'] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Ticks in seclusion: ", seclusionState?.ticksSinceSeclusionStart ?? 0] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Accumulated comprehension: ", seclusionState?.accumulatedComprehension ?? 0] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Seclusion Progress:" }), " ", seclusionProgress, "% ", seclusionReady ? '(Ready for breakthrough)' : ''] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                                try {
                                    if (typeof attemptRealmBreakthroughWithConsolidation === 'function') {
                                        attemptRealmBreakthroughWithConsolidation('seclusion_auto');
                                    }
                                    else if (window.__TEST__ && window.__TEST__.onAttemptBreakthrough) {
                                        window.__TEST__.onAttemptBreakthrough();
                                    }
                                    else {
                                        addEventLog?.('No breakthrough handler available.');
                                    }
                                }
                                catch (e) {
                                    try {
                                        addEventLog?.('Attempt breakthrough failed.');
                                    }
                                    catch { /* ignore */ }
                                }
                            }, disabled: !seclusionReady, variant: seclusionReady ? 'primary' : 'secondary', ariaLabel: "Attempt Breakthrough", children: "Attempt Breakthrough" }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                    enterSeclusion && enterSeclusion(1, false);
                                }
                                catch (e) {
                                    addEventLog?.('Enter seclusion failed.');
                                } }, disabled: isSecluded, variant: "secondary", ariaLabel: "Enter Seclusion", children: "Enter Seclusion (1yr)" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => {
                                    try {
                                        const days = player.cultivationDaysAllocated || 0;
                                        const years = Math.max(1, Math.ceil(days / 365));
                                        enterSeclusion && enterSeclusion(years, false);
                                    }
                                    catch (e) {
                                        addEventLog?.('Start scheduled seclusion failed.');
                                    }
                                }, disabled: isSecluded || !(player.cultivationDaysAllocated && player.cultivationDaysAllocated > 0), variant: "secondary", style: { marginLeft: 8 }, ariaLabel: "Start Scheduled Seclusion", children: "Start Seclusion (use schedule)" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                                    exitSeclusion && exitSeclusion();
                                }
                                catch (e) {
                                    addEventLog?.('Exit seclusion failed.');
                                } }, disabled: !isSecluded, variant: "secondary", style: { marginLeft: 8 }, ariaLabel: "Exit Seclusion", children: "Exit Seclusion" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => { try {
                            performSeclusionStudy && performSeclusionStudy(1);
                        }
                        catch (e) {
                            addEventLog?.('Study failed.');
                        } }, disabled: !isSecluded || !canStudy, variant: "primary", ariaLabel: "Study", children: "Study (Intensity 1)" }), !canStudy && (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', marginTop: 6 }, children: "Study unlock: acquire a manual or meditation level \u2265 1." })] })] }));
};
exports.SeclusionPanel = SeclusionPanel;
exports.default = exports.SeclusionPanel;
