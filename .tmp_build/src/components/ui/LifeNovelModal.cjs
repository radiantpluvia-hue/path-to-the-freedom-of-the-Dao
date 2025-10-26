"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeNovelModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
const SmallChip_1 = __importDefault(require("./SmallChip"));
const chronicleExporter_1 = __importDefault(require("@/utils/chronicleExporter"));
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
const LifeNovelModal = ({ open, onClose }) => {
    const overlayRef = (0, react_1.useRef)(null);
    const { lifePhaseSystem, systems } = (0, useGameStore_1.useGameStore)();
    const [exportMessage, setExportMessage] = (0, react_1.useState)(null);
    const [previewFilename, setPreviewFilename] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!open)
            return;
        const onKey = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open)
        return null;
    let novel = '';
    let hasLife = false;
    try {
        if (lifePhaseSystem && typeof lifePhaseSystem.renderNovel === 'function') {
            novel = lifePhaseSystem.renderNovel();
            try {
                hasLife = !!(lifePhaseSystem.getState && (lifePhaseSystem.getState().pastPhases?.length || lifePhaseSystem.getState().currentPhase));
            }
            catch (e) {
                void e;
            }
        }
        else if (systems && systems.lifePhase) {
            const snap = systems.lifePhase;
            const lines = [];
            const appendPhase = (p) => {
                if (!p)
                    return;
                lines.push(`--- ${p.title || p.id} (${p.type || 'Life'}) ---`);
                for (const ev of p.events || []) {
                    lines.push(`${ev.title || ev.id}: ${ev.description || ''}`);
                }
            };
            for (const p of snap.pastPhases || [])
                appendPhase(p);
            appendPhase(snap.currentPhase);
            novel = lines.join('\n');
            hasLife = !!(snap && ((snap.pastPhases && snap.pastPhases.length) || snap.currentPhase));
        }
    }
    catch (e) {
        novel = 'Failed to render novel.';
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2200 }, ref: overlayRef, onClick: (e) => { if (e.target === overlayRef.current)
            onClose(); }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 'min(900px, 95vw)', maxHeight: '85vh', overflowY: 'auto', background: 'var(--darkest)', padding: '18px', borderRadius: 10, color: 'var(--text-primary)' }, children: [(0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { onClick: onClose, ariaLabel: "Close novel", title: "Close" }), (0, jsx_runtime_1.jsx)("h2", { style: { marginTop: 0 }, children: "Life Chronicle" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                try {
                                    const store = useGameStore_1.useGameStore.getState();
                                    const saveLike = { player: { name: store.player.name || store.playerState?.name || 'Unknown' }, lifePhaseSnapshot: store.systems?.lifePhase || store.lifePhaseSystem?.getState?.() };
                                    const ts = new Date().toISOString().replace(/[:.]/g, '-');
                                    const filename = `Chronicle_${(saveLike.player.name || 'player')}_${ts}.md`;
                                    setPreviewFilename(filename);
                                    const md = (0, chronicleExporter_1.default)(saveLike);
                                    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(url);
                                    setExportMessage(`Exported ${filename}`);
                                    setTimeout(() => setExportMessage(null), 2500);
                                }
                                catch (e) {
                                    console.error('Export failed', e);
                                    setExportMessage('Export failed');
                                    setTimeout(() => setExportMessage(null), 2500);
                                }
                            }, disabled: !hasLife, "aria-label": !hasLife ? 'No life data to export yet' : 'Export Chronicle as Markdown', style: { padding: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 6, background: hasLife ? 'transparent' : 'rgba(255,255,255,0.04)', color: 'var(--text)' }, children: "Export Chronicle" }) }), previewFilename && (0, jsx_runtime_1.jsxs)("div", { style: { marginLeft: 8, color: 'var(--muted)', fontSize: 13 }, children: ["Will download: ", previewFilename] }), exportMessage && (0, jsx_runtime_1.jsx)("div", { style: { marginLeft: 8, color: 'lightgreen', fontSize: 13 }, children: exportMessage })] }), (0, jsx_runtime_1.jsx)("pre", { style: { whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--muted)' }, children: novel || 'No life recorded yet.' })] }) }));
};
exports.LifeNovelModal = LifeNovelModal;
exports.default = exports.LifeNovelModal;
