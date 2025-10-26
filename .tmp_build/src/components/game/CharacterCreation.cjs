"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterCreation = CharacterCreation;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const raceBackgrounds_1 = require("@/data/raceBackgrounds");
const useGameStore_1 = require("@/store/useGameStore");
const seededRng_1 = require("@/utils/seededRng");
const Icon_1 = __importDefault(require("@/components/ui/Icon"));
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const LifeNovelModal_1 = __importDefault(require("@/components/ui/LifeNovelModal"));
const ConfirmModal_1 = __importDefault(require("@/components/ui/ConfirmModal"));
const react_2 = require("react");
const passiveRegistry_1 = require("@/systems/passiveRegistry");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
function CharacterCreation() {
    const { startGame, lifePhaseSystem, systems, saveGame, loadGame } = (0, useGameStore_1.useGameStore)();
    const saveInProgress = (0, useGameStore_1.useGameStore)(s => s.ui?.saveInProgress ?? false);
    const [novelOpen, setNovelOpen] = (0, react_2.useState)(false);
    const [confirmOpen, setConfirmOpen] = (0, react_2.useState)(false);
    // Novel preview from LifePhase runtime (if available) or snapshot
    const novelPreview = (() => {
        try {
            if (lifePhaseSystem && typeof lifePhaseSystem.renderNovel === 'function') {
                return (lifePhaseSystem.renderNovel() || '').split('\n').slice(0, 3).join('\n');
            }
            const snap = systems?.lifePhase;
            if (snap) {
                // Minimal rendering: show currentPhase title + first events lines
                const lines = [];
                if (snap.currentPhase && snap.currentPhase.title)
                    lines.push(`--- ${snap.currentPhase.title} ---`);
                const evs = (snap.currentPhase && snap.currentPhase.events) || [];
                for (let i = 0; i < Math.min(3, evs.length); i++) {
                    const e = evs[i];
                    lines.push(`${e.title || e.id}: ${e.description || ''}`);
                }
                return lines.join('\n');
            }
        }
        catch (e) {
            // ignore
        }
        return '';
    })();
    const [name, setName] = (0, react_1.useState)('');
    const [selectedGender, setSelectedGender] = (0, react_1.useState)('Male');
    // Randomly pick a race on mount
    const [race] = (0, react_1.useState)(() => {
        const races = Object.keys(raceBackgrounds_1.RACE_BACKGROUNDS);
        return races[Math.floor((0, seededRng_1.runtimeRng)() * races.length)];
    });
    const visibleBackgrounds = raceBackgrounds_1.RACE_BACKGROUNDS[race] || [];
    // Ensure generated passives are registered so getPassive resolves names/descriptions
    (0, react_1.useEffect)(() => { try {
        (0, passiveRegistry_1.ensureGeneratedPassives)();
    }
    catch (e) { /* ignore */ } }, []);
    // Default selected background (random from visible ones)
    const [selectedBackground, _setSelectedBackground] = (0, react_1.useState)(() => {
        return visibleBackgrounds.length > 0
            ? visibleBackgrounds[Math.floor((0, seededRng_1.runtimeRng)() * visibleBackgrounds.length)]
            : null;
    });
    // intentionally unused setter (UI-only preview); reference to silence lint
    void _setSelectedBackground;
    // Dev toggle to reveal raw configured weights
    const [showRawWeights, setShowRawWeights] = (0, react_1.useState)(false);
    // Very small demo picks for talent/physique/bloodline as before; these are opaque to the UI for now
    const [talent] = (0, react_1.useState)(() => 'average');
    const [physique] = (0, react_1.useState)(() => null);
    const [bloodline] = (0, react_1.useState)(() => null);
    const handleCreateCharacter = () => {
        startGame({
            name,
            gender: selectedGender,
            talent,
            physique,
            bloodline,
            selectedBackground: selectedBackground ?? undefined,
            race
        });
    };
    const formatStartChance = (b) => {
        const sc = b.startChance;
        if (typeof sc === 'number')
            return (sc * 100).toFixed(2) + '%';
        return 'default';
    };
    // Compute normalized probabilities for display: if any background has startChance, use those weights;
    // otherwise show uniform probabilities.
    const computedProbabilities = (() => {
        if (!visibleBackgrounds || visibleBackgrounds.length === 0)
            return {};
        const weights = visibleBackgrounds.map((b) => (typeof b.startChance === 'number' ? b.startChance : 0));
        const anyWeights = weights.some((w) => w > 0);
        if (!anyWeights) {
            const uniform = 1 / visibleBackgrounds.length;
            return visibleBackgrounds.reduce((acc, b) => ({ ...acc, [b.id]: uniform }), {});
        }
        const total = weights.reduce((s, w) => s + w, 0);
        return visibleBackgrounds.reduce((acc, b, idx) => ({ ...acc, [b.id]: total > 0 ? weights[idx] / total : 0 }), {});
    })();
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--dark), var(--darker))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: '720px', maxWidth: '95%', color: 'var(--text-primary)' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { marginBottom: '12px' }, children: "Character Creation" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '6px' }, children: "Name" }), (0, jsx_runtime_1.jsx)("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Enter your name", style: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' } })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '18px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold' }, children: "Gender:" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px' }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setSelectedGender('Male'), style: {
                                        flex: 1,
                                        padding: '12px',
                                        color: '#fff',
                                        border: selectedGender === 'Male' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        background: selectedGender === 'Male' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.12)',
                                        cursor: 'pointer'
                                    }, children: "\u2642\uFE0F Male" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setSelectedGender('Female'), style: {
                                        flex: 1,
                                        padding: '12px',
                                        color: '#fff',
                                        border: selectedGender === 'Female' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        background: selectedGender === 'Female' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.12)',
                                        cursor: 'pointer'
                                    }, children: "\u2640\uFE0F Female" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '18px' }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { display: 'block', marginBottom: '8px', fontWeight: 'bold' }, children: ["Available Backgrounds (", race, "):"] }), (0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '6px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showRawWeights, onChange: (e) => setShowRawWeights(e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)' }, children: "Show raw weights" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-light)', borderRadius: '6px' }, children: [visibleBackgrounds.map((b) => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: (() => {
                                        try {
                                            const passives = (b.effects && b.effects.passives) || {};
                                            const ids = Object.keys(passives || {});
                                            const baseDesc = String(b.description || '');
                                            if (ids.length === 0)
                                                return baseDesc;
                                            const parts = ids.map((pid) => {
                                                try {
                                                    const def = (0, passiveRegistry_1.getPassive)(pid) || {};
                                                    const name = def.name || pid;
                                                    const desc = def.description || '';
                                                    return `• ${name}: ${desc}`;
                                                }
                                                catch (e) {
                                                    return `• ${pid}`;
                                                }
                                            });
                                            return `${baseDesc}\n\nPassives:\n${parts.join('\n')}`;
                                        }
                                        catch (e) {
                                            return String(b.description || '');
                                        }
                                    })(), children: (0, jsx_runtime_1.jsxs)("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '10px',
                                            background: selectedBackground?.id === b.id ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.06)',
                                            borderRadius: '6px',
                                            cursor: 'default',
                                            border: selectedBackground?.id === b.id ? '1px solid var(--primary)' : '1px solid transparent'
                                        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '10px', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: (0, jsx_runtime_1.jsx)(Icon_1.default, { id: b.previewIcon, size: 40, alt: `${b.name} icon` }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: b.name }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: b.description })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'right', minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700 }, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: b.rarity, small: true }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)' }, children: ["startChance: ", formatStartChance(b)] }), (0, jsx_runtime_1.jsx)("div", { style: { width: '140px', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }, "data-testid": `prob-bar-shell-${b.id}`, children: (0, jsx_runtime_1.jsx)("div", { "data-testid": `prob-bar-${b.id}`, style: { width: `${Math.round((computedProbabilities[b.id] || 0) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.75rem', color: 'var(--muted)' }, "data-testid": `prob-percent-${b.id}`, children: [Math.round((computedProbabilities[b.id] || 0) * 10000) / 100, "%"] }), showRawWeights && ((0, jsx_runtime_1.jsxs)("div", { "data-testid": `raw-weight-${b.id}`, style: { fontSize: '0.75rem', color: 'var(--muted)' }, children: ["weight: ", typeof b.startChance === 'number' ? b.startChance : 'uniform'] }))] })] }, b.id) }, b.id))), visibleBackgrounds.length === 0 && ((0, jsx_runtime_1.jsx)("div", { style: { padding: '8px', color: 'var(--muted)' }, children: "No backgrounds available for this race." }))] })] }), novelPreview && ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--muted)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }, children: novelPreview })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setNovelOpen(true), type: "button", style: { background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }, children: "View Full Novel" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => { try {
                                saveGame();
                            }
                            catch (e) { /* ignore */ } }, type: "button", disabled: saveInProgress, "aria-disabled": saveInProgress, style: { background: 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 6, cursor: saveInProgress ? 'not-allowed' : 'pointer', position: 'relative' }, children: ["\uD83D\uDCBE Save Game", saveInProgress && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: '-26px', right: 0 }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 8, fontSize: '0.85rem', color: 'var(--muted)', background: 'rgba(0,0,0,0.6)', borderRadius: 6 }, children: "Saving\u2026" }) }))] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setConfirmOpen(true); }, type: "button", disabled: saveInProgress, "aria-disabled": saveInProgress, style: { background: saveInProgress ? 'rgba(255,255,255,0.03)' : 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 6, cursor: saveInProgress ? 'not-allowed' : 'pointer' }, children: "\uD83D\uDCC1 Load Game" }), (0, jsx_runtime_1.jsx)(ConfirmModal_1.default, { open: confirmOpen, title: "Load saved game?", message: "Loading will overwrite your current progress. Are you sure you want to load the most recent save?", onCancel: () => setConfirmOpen(false), onConfirm: () => { setConfirmOpen(false); try {
                                loadGame();
                            }
                            catch (e) { /* ignore */ } } })] }), (0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: handleCreateCharacter, disabled: !name, style: {
                            background: !name ? 'var(--muted)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: 'var(--dark)',
                            border: '2px solid var(--primary)',
                            borderRadius: '8px',
                            padding: '12px 28px',
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            cursor: !name ? 'not-allowed' : 'pointer',
                            opacity: !name ? 0.6 : 1
                        }, children: "Begin Your Journey" }) }), (0, jsx_runtime_1.jsx)(LifeNovelModal_1.default, { open: novelOpen, onClose: () => setNovelOpen(false) })] }) }));
}
