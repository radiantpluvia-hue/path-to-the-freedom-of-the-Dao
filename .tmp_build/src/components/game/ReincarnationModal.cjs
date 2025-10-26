"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReincarnationModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const useGameStore_1 = require("@/store/useGameStore");
const default_eras_json_1 = __importDefault(require("../../../data/eras/default_eras.json"));
const tierMigration_1 = require("@/migrations/tierMigration");
function ReincarnationModal() {
    const { ui, world, player, setUIProperty, reincarnateSameEra, reincarnateNextEra, reincarnateRandomFuture } = (0, useGameStore_1.useGameStore)();
    if (!ui.showReincarnationModal)
        return null;
    const currentIndex = world.currentEraIndex ?? 0;
    const available = default_eras_json_1.default.filter(e => e.index >= currentIndex);
    const cur = available.find(e => e.index === currentIndex) || available[0];
    const next = available.find(e => e.index > currentIndex);
    const randomFuturePool = available.filter(e => e.index > currentIndex);
    // Carryover preview based on metaUnlocks and inventory
    const prevUnlocks = (player?.metaUnlocks) || {};
    const carryCount = Number((prevUnlocks.carryArtifactCount != null ? prevUnlocks.carryArtifactCount : (prevUnlocks.carryArtifact ? 1 : 0)) || 0);
    const inv = Array.isArray(player?.inventory) ? player.inventory : [];
    // Map canonical tier letters to priority (higher = rarer)
    const TIER_ORDER = { H: 1, G: 2, F: 3, E: 4, D: 5, B: 6 };
    const candidates = inv.filter((it) => {
        const t = String(it.type || '').toLowerCase();
        const rawR = it.rarity;
        const tier = (0, tierMigration_1.migrateTier)(rawR);
        // consider high-tier items or explicit artifacts or soulbound uniques
        const isHighTier = tier && (tier === 'D' || tier === 'B' || tier === 'E' || (0, tierMigration_1.revertTier)(tier) === 'legendary' || (0, tierMigration_1.revertTier)(tier) === 'transcendent');
        return t === 'artifact' || isHighTier || it.uniqueProperties?.soulbound === true;
    }).sort((a, b) => {
        const ta = (0, tierMigration_1.migrateTier)(a?.rarity || 'H');
        const tb = (0, tierMigration_1.migrateTier)(b?.rarity || 'H');
        return (TIER_ORDER[tb] || 0) - (TIER_ORDER[ta] || 0);
    });
    const previewCarry = carryCount > 0 ? candidates.slice(0, carryCount) : [];
    const top3Mods = (e) => {
        const m = e.modifiers || {};
        return [['qiDensity', m.qiDensity], ['artifactDensity', m.artifactDensity], ['sectCorruptionRate', m.sectCorruptionRate]]
            .filter((x) => x[1] != null)
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: '#111', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: 16, width: 560 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Reincarnate" }), (0, jsx_runtime_1.jsx)("p", { children: "Advancing the Era will move the world forward in time \u2014 past eras will remain unreachable. Proceed?" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 12, marginBottom: 12 }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { reincarnateSameEra(); setUIProperty('showReincarnationModal', false); }, children: "Same Era" }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: !next, "aria-label": !next ? 'No later era defined; stays at current' : undefined, onClick: () => { reincarnateNextEra(); setUIProperty('showReincarnationModal', false); }, children: "Next Era" }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: 'Choose a later era at random. This will skip forward in history — you cannot go back.', children: (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: randomFuturePool.length === 0, onClick: () => { reincarnateRandomFuture(); setUIProperty('showReincarnationModal', false); }, children: "Random Future Era" }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginLeft: 'auto' }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setUIProperty('showReincarnationModal', false), children: "Cancel" }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #333', padding: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Current Era" }), (0, jsx_runtime_1.jsxs)("div", { children: [cur?.name, " (#", cur?.index, ")"] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Top modifiers: ", cur ? top3Mods(cur) : '—'] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Artifact density: ", cur?.modifiers?.artifactDensity] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Factions: ", (cur?.startingFactions || []).slice(0, 3).map((f) => f.id).join(', ')] }), (0, jsx_runtime_1.jsxs)("div", { style: { opacity: 0.8 }, children: [cur?.description?.slice(0, 140), "..."] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #333', padding: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Next Era" }), next ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [next.name, " (#", next.index, ")"] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Top modifiers: ", top3Mods(next)] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Artifact density: ", next.modifiers?.artifactDensity] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Factions: ", (next.startingFactions || []).slice(0, 3).map((f) => f.id).join(', ')] }), (0, jsx_runtime_1.jsxs)("div", { style: { opacity: 0.8 }, children: [next.description?.slice(0, 140), "..."] })] })) : (0, jsx_runtime_1.jsx)("div", { children: "No later era defined." })] }), (0, jsx_runtime_1.jsxs)("div", { style: { gridColumn: '1 / span 2', border: '1px solid #333', padding: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Carryover Preview" }), (0, jsx_runtime_1.jsxs)("div", { style: { color: '#aaa', marginTop: 4 }, children: ["Unlocked slots: ", carryCount, ". ", carryCount === 0 ? 'Earn meta-unlocks to carry artifacts forward.' : ''] }), previewCarry.length ? ((0, jsx_runtime_1.jsx)("ul", { style: { margin: '6px 0 0 16px' }, children: previewCarry.map((it, i) => ((0, jsx_runtime_1.jsxs)("li", { children: [it.name || it.id || it.itemId, " ", it.rarity ? (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: 6 }, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: it.rarity, small: true }) }) : ''] }, i))) })) : ((0, jsx_runtime_1.jsx)("div", { style: { color: '#888', marginTop: 4 }, children: "No qualifying items to carry." }))] })] })] }) }));
}
