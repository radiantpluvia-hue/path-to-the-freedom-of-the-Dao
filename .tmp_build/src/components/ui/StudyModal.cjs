"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StudyModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("../../store/useGameStore");
function StudyModal({ open, sutra, onClose }) {
    const store = useGameStore_1.useGameStore.getState();
    const getPlayer = () => store.player;
    if (!open || !sutra)
        return null;
    const player = getPlayer();
    // Simple cost mapping: require yuan or spiritStones.low depending on tier
    const costYuan = Math.max(0, Math.floor((sutra.tier || 1) / 2));
    const costQi = (sutra.cost?.qi) || 0;
    const canAfford = (player.yuan || 0) >= costYuan && (player.currentQi || 0) >= costQi;
    function confirmStudy() {
        if (!canAfford)
            return;
        const s = useGameStore_1.useGameStore.getState();
        if (typeof s.attemptStudy === 'function') {
            const ok = s.attemptStudy(sutra.id);
            if (ok) {
                onClose();
            }
        }
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "modal-backdrop", "data-testid": "study-modal", children: (0, jsx_runtime_1.jsxs)("div", { className: "modal", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "xui-title", children: ["Study: ", sutra.name] }), (0, jsx_runtime_1.jsx)("div", { className: "xui-muted", children: sutra.description }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-body", children: [(0, jsx_runtime_1.jsxs)("div", { className: "xui-muted", children: ["Tier: ", sutra.tier, " \u00A0 \u2022 \u00A0 AP: ", sutra.cost?.ap || 0, " \u2022 QI: ", sutra.cost?.qi || 0] }), (0, jsx_runtime_1.jsxs)("div", { className: "xui-note", children: ["Study Cost: ", (0, jsx_runtime_1.jsx)("strong", { children: costYuan }), " yuan and ", (0, jsx_runtime_1.jsx)("strong", { children: costQi }), " QI"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "xbtn", onClick: onClose, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "xbtn", onClick: confirmStudy, disabled: !canAfford, "data-testid": "confirm-study", children: canAfford ? 'Confirm Study' : 'Insufficient Resources' })] })] }) }));
}
