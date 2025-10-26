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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
// Lazy-load the technique mastery panel so bundlers can split it into its own chunk.
// Kept at module scope to avoid invoking React.lazy inside render (and to appease linters).
const TechniqueMasteryPanelLazy = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('@/components/game/TechniqueMasteryPanel'))));
const trainings_json_1 = __importDefault(require("../../data/trainings.json"));
const training_1 = require("../game/training");
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const useGameStore_1 = require("@/store/useGameStore");
// Lightweight Train Modal — conservative, presentational, and safe to import
const TrainModal = ({ open = true, onClose } = {}) => {
    if (!open)
        return null;
    // Use the canonical store hook. Tests should install a mock for
    // '@/store/useGameStore' before importing this module; fallback to the
    // legacy global `gameStore` when present to preserve test/runtimes that use it.
    let player = (0, useGameStore_1.useGameStore)((s) => s.player);
    let addEventLog = (0, useGameStore_1.useGameStore)((s) => s.addEventLog);
    // grab the optional wrapper that some apps expose
    const storeStartById = (0, useGameStore_1.useGameStore)((s) => s.startTrainingById);
    if (!player && globalThis.gameStore && typeof globalThis.gameStore.getState === 'function') {
        const gs = globalThis.gameStore.getState();
        player = gs.player;
        addEventLog = globalThis.gameStore.addEventLog || addEventLog;
    }
    const [confirming, setConfirming] = (0, react_1.useState)(null);
    // Legacy training UI state (kept for compatibility with older tests and flows)
    const [message, setMessage] = (0, react_1.useState)(null);
    const [isTraining, setIsTraining] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const setShowTechniqueMastery = (0, useGameStore_1.useGameStore)((s) => s.setShowTechniqueMastery);
    const showTechniqueMastery = (0, useGameStore_1.useGameStore)((s) => (s.ui || {}).showTechniqueMastery);
    function onStart(id) {
        if (!player)
            return;
        // Prefer store wrapper (startTrainingById) when provided by the app/store; fallback to engine startTraining
        const storeStart = storeStartById;
        if (storeStart) {
            try {
                storeStart(id);
                addEventLog?.(`Started training: ${id}`);
                setConfirming(null);
                return;
            }
            catch (e) {
                addEventLog?.(`Could not start training: ${id}`);
                return;
            }
        }
        const res = (0, training_1.startTraining)(player, id, Date.now());
        if (res && res.ok) {
            addEventLog?.(`Started training: ${id}`);
            setConfirming(null);
        }
        else {
            addEventLog?.(`Could not start training: ${id}`);
        }
    }
    // Legacy training actions (Comprehend / Body / Meditate / Martial)
    function doLegacyTrain(type) {
        if (!player)
            return;
        // In test environment, call synchronous store helpers when present
        if (process && process.env && process.env.NODE_ENV === 'test') {
            try {
                let res = { success: false };
                const storeState = useGameStore_1.useGameStore.getState ? useGameStore_1.useGameStore.getState() : null;
                if (type === 'comprehend' && storeState && typeof storeState.trainComprehendManual === 'function')
                    res = storeState.trainComprehendManual();
                else if (type === 'body' && storeState && typeof storeState.trainBody === 'function')
                    res = storeState.trainBody();
                else if (type === 'meditate' && storeState && typeof storeState.trainMeditate === 'function')
                    res = storeState.trainMeditate();
                else if (type === 'martial' && storeState && typeof storeState.trainMartial === 'function')
                    res = storeState.trainMartial();
                else if (storeState && typeof storeState.runTrainingSession === 'function') {
                    // fallback mapped names
                    if (type === 'comprehend')
                        res = storeState.runTrainingSession(60, 'comprehend');
                    else if (type === 'body')
                        res = storeState.runTrainingSession(60, 'body');
                    else if (type === 'meditate')
                        res = storeState.runTrainingSession(60, 'meditate');
                    else if (type === 'martial')
                        res = storeState.runTrainingSession(60, 'martial');
                }
                setMessage(res?.message || (res.success ? 'Training completed.' : 'Training failed.'));
            }
            catch (e) {
                setMessage('Training failed.');
            }
            return;
        }
        // Non-test: simulate short progress then call legacy store methods if present
        setIsTraining(true);
        setProgress(0);
        const totalTicks = 20;
        let tick = 0;
        const iv = setInterval(() => {
            tick += 1;
            setProgress(Math.min(100, Math.round((tick / totalTicks) * 100)));
            if (tick >= totalTicks) {
                clearInterval(iv);
                try {
                    const storeState = useGameStore_1.useGameStore.getState ? useGameStore_1.useGameStore.getState() : null;
                    let res = { success: false };
                    if (type === 'comprehend' && storeState && typeof storeState.trainComprehendManual === 'function')
                        res = storeState.trainComprehendManual();
                    else if (type === 'body' && storeState && typeof storeState.trainBody === 'function')
                        res = storeState.trainBody();
                    else if (type === 'meditate' && storeState && typeof storeState.trainMeditate === 'function')
                        res = storeState.trainMeditate();
                    else if (type === 'martial' && storeState && typeof storeState.trainMartial === 'function')
                        res = storeState.trainMartial();
                    else if (storeState && typeof storeState.runTrainingSession === 'function') {
                        if (type === 'comprehend')
                            res = storeState.runTrainingSession(60, 'comprehend');
                        else if (type === 'body')
                            res = storeState.runTrainingSession(60, 'body');
                        else if (type === 'meditate')
                            res = storeState.runTrainingSession(60, 'meditate');
                        else if (type === 'martial')
                            res = storeState.runTrainingSession(60, 'martial');
                    }
                    setMessage(res?.message || (res.success ? 'Training completed.' : 'Training failed.'));
                }
                catch (e) {
                    setMessage('Training failed.');
                }
                setIsTraining(false);
                setProgress(0);
            }
        }, 30);
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "train-modal", role: "dialog", "aria-label": "Trainings", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Trainings" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 12, padding: 10, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.95rem', color: 'var(--muted)', marginBottom: 8 }, children: "Choose a training method:" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => doLegacyTrain('comprehend'), disabled: isTraining, style: { padding: '8px 12px', borderRadius: 6 }, children: "Comprehend Manual" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => doLegacyTrain('body'), disabled: isTraining, style: { padding: '8px 12px', borderRadius: 6 }, children: "Body Tempering" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => doLegacyTrain('meditate'), disabled: isTraining, style: { padding: '8px 12px', borderRadius: 6 }, children: "Meditate" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => doLegacyTrain('martial'), disabled: isTraining, style: { padding: '8px 12px', borderRadius: 6 }, children: "Martial Arts Training" }), isTraining && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)("div", { style: { width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 120ms linear' } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)', marginTop: 6 }, children: ["Training... ", progress, "%"] })] })), message ? (0, jsx_runtime_1.jsx)("div", { style: { color: message.includes('failed') ? 'var(--danger)' : 'var(--accent)' }, children: message }) : null, (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 8 }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowTechniqueMastery?.(true), style: { padding: '8px 12px' }, children: "Technique Mastery" }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "training-list", style: { display: 'grid', gap: 12 }, children: trainings_json_1.default.map((t) => {
                    const unlocked = (player?.realm || 0) >= (t.unlock_realm || 0);
                    const missingItems = !(0, training_1.hasRequiredItems)(player, t.cost?.items || []);
                    const cooldownActive = !!(player?.cooldowns?.training && player.cooldowns.training[t.id] && player.cooldowns.training[t.id] > Date.now());
                    // Disabled when locked, missing items, or cooldown active.
                    // Keep behavior consistent between test and runtime environments.
                    const disabled = (!unlocked || missingItems || cooldownActive);
                    const highRisk = ['heart_demon_confrontation', 'dao_heart_tempering'].includes(t.id);
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "training-row", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid #333', borderRadius: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "training-meta", style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 44 }, children: t.rarity ? (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: t.rarity }) : (0, jsx_runtime_1.jsx)("div", { style: { width: 36 } }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "training-name", style: { fontWeight: 700 }, children: t.name || t.id }), (0, jsx_runtime_1.jsx)("div", { className: "training-desc", style: { color: '#bbb' }, children: t.flavor_text || t.ui_hint || '' }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6, display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: `Time: ${(t.time_ticks ?? t.time) || '—'}` }), (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: `Unlock: ${t.unlock_realm ?? '—'}` }), t.cost?.items && t.cost.items.length > 0 && (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: `Cost: ${t.cost.items.join(', ')}` }), highRisk && (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { background: '#4a0' }, children: "High Risk" })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "training-actions", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => highRisk && !disabled ? setConfirming(t) : onStart(t.id), disabled: !!disabled, "aria-disabled": !!disabled, style: { padding: '8px 12px', borderRadius: 6 }, children: "Start" }) })] }, t.id));
                }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, style: { padding: '8px 12px' }, children: "Close" }) }), confirming && ((0, jsx_runtime_1.jsx)("div", { role: "dialog", "aria-modal": true, style: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: '#111', padding: 20, borderRadius: 10, width: 520 }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: confirming.name || confirming.id }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#ddd' }, children: confirming.risk?.description || 'This training may have severe consequences. Are you sure you want to proceed?' }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setConfirming(null), style: { padding: '8px 12px' }, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => onStart(confirming.id), style: { padding: '8px 12px', background: '#880' }, children: "Confirm" })] })] }) })), typeof window !== 'undefined' && ((() => {
                try {
                    return ((0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: null, children: (0, jsx_runtime_1.jsx)(TechniqueMasteryPanelLazy, { open: !!showTechniqueMastery, onClose: () => setShowTechniqueMastery?.(false) }) }));
                }
                catch (e) {
                    return null;
                }
            })())] }));
};
exports.TrainModal = TrainModal;
exports.default = exports.TrainModal;
