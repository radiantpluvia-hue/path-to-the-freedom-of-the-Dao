"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const useGameStore_1 = require("@/store/useGameStore");
const ConfirmModal_1 = __importDefault(require("@/components/ui/ConfirmModal"));
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const TopBar = ({ currentScreen, compactLayout, showRealmList, setUIProperty }) => {
    // selectors from store
    const musicPlaying = (0, useGameStore_1.useGameStore)(s => s.musicPlaying ?? false);
    const playMusic = (0, useGameStore_1.useGameStore)(s => s.playMusic);
    const stopMusic = (0, useGameStore_1.useGameStore)(s => s.stopMusic);
    const musicMuted = (0, useGameStore_1.useGameStore)(s => s.musicMuted ?? false);
    const setMusicMuted = (0, useGameStore_1.useGameStore)(s => s.setMusicMuted);
    const world = (0, useGameStore_1.useGameStore)(s => s.world) || {};
    const player = (0, useGameStore_1.useGameStore)(s => s.player) || {};
    // saveInProgress / lastSavedAt live under ui in the central store
    const saveInProgress = (0, useGameStore_1.useGameStore)(s => s.ui?.saveInProgress ?? false);
    const lastSavedAt = (0, useGameStore_1.useGameStore)(s => s.ui?.lastSavedAt ?? null);
    // requestEnableAudio isn't declared on the public GameStore interface in some
    // build configs, so read it via `any` to avoid a type error while still
    // preserving runtime behavior (other modules use the same pattern).
    const requestEnableAudio = (0, useGameStore_1.useGameStore)(s => s.requestEnableAudio);
    const [showSavedToast, setShowSavedToast] = react_1.default.useState(false);
    const savedTimerRef = react_1.default.useRef(null);
    const [confirmOpen, setConfirmOpen] = react_1.default.useState(false);
    react_1.default.useEffect(() => {
        if (!lastSavedAt)
            return;
        setShowSavedToast(true);
        if (savedTimerRef.current != null) {
            window.clearTimeout(savedTimerRef.current);
        }
        savedTimerRef.current = window.setTimeout(() => {
            setShowSavedToast(false);
            savedTimerRef.current = null;
        }, 2500);
        return () => {
            if (savedTimerRef.current != null) {
                window.clearTimeout(savedTimerRef.current);
                savedTimerRef.current = null;
            }
        };
    }, [lastSavedAt]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', padding: 8, gap: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('currentScreen', 'game'), style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer' }, children: "Core" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('currentScreen', 'social'), style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: currentScreen === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer' }, children: "Social" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('currentScreen', 'domain'), style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: currentScreen === 'domain' ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer' }, children: "Domain" })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('currentScreen', 'tutorial'), style: { marginLeft: 'auto', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }, children: "Tutorial" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }, children: [!musicPlaying ? ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Play music", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => playMusic?.('china-chinese-asian-music-346568.mp3'), style: { padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--primary)' }, "aria-label": "Play music", children: "\u25B6 Music" }) })) : ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Pause music", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => stopMusic?.(), style: { padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.15)', color: 'var(--primary)' }, "aria-label": "Pause music", children: "\u23F8 Music" }) })), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: musicMuted ? 'Unmute' : 'Mute', children: (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setMusicMuted?.(!musicMuted), "aria-pressed": musicMuted, "aria-label": musicMuted ? 'Unmute' : 'Mute', style: { padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: musicMuted ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)' }, children: [(0, jsx_runtime_1.jsx)("span", { "aria-hidden": true, children: musicMuted ? '🔇' : '🔊' }), (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: musicMuted ? 'Unmute' : 'Mute' })] }) }), Boolean(requestEnableAudio) && ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Enable audio (click to allow)", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { try {
                                requestEnableAudio?.();
                            }
                            catch (e) {
                                void e;
                            } }, "aria-label": "Enable audio", style: { padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'linear-gradient(90deg,#2b2 0%, #274 100%)', color: '#fff' }, children: "Enable Audio" }) }))] }), world?.currentEraId && ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Era ${(world.currentEraId || '')} #${world.currentEraIndex ?? ''}\nBias: D${world?.eventBias?.dark ?? '-'} / N${world?.eventBias?.neutral ?? '-'} / L${world?.eventBias?.light ?? '-'}\nQi x${world?.eraNormalized?.qiDensityNorm ?? '-'} | Artifacts x${world?.eraNormalized?.artifactDensityNorm ?? '-'}`, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 8, fontSize: '0.8rem' }, children: `Era ${world.currentEraIndex}` }) })), player?.alignment?.id && ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `${player.alignment.displayName || player.alignment.id}`, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 8, borderRadius: 8, background: 'rgba(255,255,255,0.02)', color: 'var(--primary)' }, children: player.alignment.displayName || player.alignment.id }) })), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Inventory", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('showInventoryModal', true), "aria-label": "Inventory", title: "Inventory", style: { padding: 0, marginLeft: 8 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Inventory" }) }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Settings", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('showSettings', true), "aria-label": "Settings", style: { padding: 0, marginLeft: 8 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Settings" }) }) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', marginLeft: 8, gap: 6 }, children: (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: saveInProgress ? 'Saving…' : (lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved') }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Toggle minimal UI", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty?.('compactLayout', !compactLayout), "aria-label": "Toggle minimal UI", style: { padding: 0, marginLeft: 8 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { background: compactLayout ? 'rgba(212,175,55,0.15)' : 'transparent' }, children: "Minimal UI" }) }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Toggle realm list", children: (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setUIProperty?.('showRealmList', !showRealmList), "aria-label": "Toggle realm list", style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: showRealmList ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer', marginLeft: 8 }, children: [showRealmList ? 'Hide' : 'Show', " realms"] }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Save game", children: (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => { try {
                        useGameStore_1.useGameStore.getState().saveGame();
                    }
                    catch (e) { /* ignore */ } }, "aria-label": "Save game", title: "Save game", disabled: saveInProgress, "aria-disabled": saveInProgress, style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: saveInProgress ? 'rgba(255,255,255,0.03)' : 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', cursor: saveInProgress ? 'not-allowed' : 'pointer', marginLeft: 8, position: 'relative' }, children: ["\uD83D\uDCBE Save", saveInProgress ? ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: '-28px', right: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 8, fontSize: '0.85rem', color: 'var(--muted)', background: 'rgba(0,0,0,0.6)', borderRadius: 6 }, children: "Saving\u2026" }) })) : (showSavedToast && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: '-28px', right: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 8, fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(0,0,0,0.6)', borderRadius: 6 }, children: "Saved" }) })))] }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Load game", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setConfirmOpen(true), "aria-label": "Load game", title: "Load game", disabled: saveInProgress, "aria-disabled": saveInProgress, style: { padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: saveInProgress ? 'rgba(255,255,255,0.03)' : 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', cursor: saveInProgress ? 'not-allowed' : 'pointer', marginLeft: 8 }, children: "\uD83D\uDCC1 Load" }) }), (0, jsx_runtime_1.jsx)(ConfirmModal_1.default, { open: confirmOpen, title: "Load saved game?", message: "Loading will overwrite your current progress. Are you sure you want to load the most recent save?", onCancel: () => setConfirmOpen(false), onConfirm: () => {
                    setConfirmOpen(false);
                    try {
                        useGameStore_1.useGameStore.getState().loadGame();
                    }
                    catch (e) { /* ignore */ }
                } })] }));
};
exports.default = TopBar;
