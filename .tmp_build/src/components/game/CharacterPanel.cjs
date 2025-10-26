"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Card_1 = require("../core/Card");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const DestinyAffinityBadge_1 = __importDefault(require("../ui/DestinyAffinityBadge"));
const AlignmentPassivesPanel_1 = __importDefault(require("./AlignmentPassivesPanel"));
const passiveRegistry_1 = require("@/systems/passiveRegistry");
const CharacterPanel = ({ player, setUIProperty }) => {
    // Proactively ensure generated passives load so names/descriptions resolve in tooltips
    (0, react_1.useEffect)(() => { try {
        (0, passiveRegistry_1.ensureGeneratedPassives)();
    }
    catch (e) { /* ignore */ } }, []);
    const passiveIds = (0, react_1.useMemo)(() => {
        const eq = player?.equipment || {};
        const fromEquipment = Object.values(eq).flatMap((it) => (it && Array.isArray(it.passives)) ? it.passives : []);
        const declared = Array.isArray(player?.passiveIds) ? player.passiveIds : [];
        const all = [...declared, ...fromEquipment].filter(Boolean);
        // Avoid duplicating alignment tag passives (they are shown by AlignmentPassivesPanel)
        const filtered = all.filter(id => typeof id === 'string' && !id.startsWith('tag_'));
        return Array.from(new Set(filtered));
    }, [player?.equipment, player?.passiveIds]);
    const passiveMeta = (0, react_1.useMemo)(() => {
        return passiveIds.map((id) => {
            let def = null;
            try {
                def = (0, passiveRegistry_1.getPassive)(id);
            }
            catch (e) {
                def = null;
            }
            const name = (def && (def.name || def.id)) || id;
            const description = (def && def.description) || 'No description available.';
            // Try to extract tier from registered passive; fall back to canonical data JSON
            let tier = def && def.tier;
            if (!tier) {
                try {
                    // relative path from this file to src/data/skills/all_skills.json
                    // guarded so bundlers that inline generated passives won't break
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const ALL_SKILLS = require('../../data/skills/all_skills.json');
                    const found = Array.isArray(ALL_SKILLS) ? ALL_SKILLS.find((s) => s && s.id === id) : null;
                    if (found && found.tier)
                        tier = found.tier;
                }
                catch (e) {
                    // ignore lookup failures
                }
            }
            return { id, name, description, tier };
        });
    }, [passiveIds]);
    return ((0, jsx_runtime_1.jsxs)(Card_1.Card, { title: "Character", children: [(0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', marginBottom: '15px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '2rem', marginBottom: '5px' }, children: "\uD83D\uDC64" }), (0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--primary)', marginBottom: '5px' }, children: player.name || 'Cultivator' }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: [player.race, " ", player.gender, " \u2022 Age ", player.age] }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }, children: ["Lifespan: ", player.lifespan ?? 0] }), player.destinyAffinity !== undefined && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)(DestinyAffinityBadge_1.default, { value: player.destinyAffinity, history: player.destinyHistory || [], onOpenThreads: () => setUIProperty?.('showNarrative', true) }) }))] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 8 }, children: player.alignment?.id ? ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `${player.alignment.displayName || player.alignment.id}\n${player.alignment?.axes ? `Virtue:${player.alignment.axes.virtue} Order:${player.alignment.axes.order} Independence:${player.alignment.axes.independence} Ruthlessness:${player.alignment.axes.ruthlessness}` : ''}`, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 12, background: 'rgba(255,255,255,0.02)', color: 'var(--primary)', fontWeight: 600, fontSize: 12 }, children: player.alignment.displayName || player.alignment.id }) })) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 12 }, children: "Alignment: Neutral" })) }), (0, jsx_runtime_1.jsx)(AlignmentPassivesPanel_1.default, { player: player }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: 0, color: 'var(--text-primary)' }, children: "Passives" }), (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--muted)', fontSize: 12 }, children: "hover to view details" })] }), passiveMeta.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 12, marginTop: 6 }, children: "No active passives" })) : ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }, children: passiveMeta.map(p => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gap: 6, maxWidth: 320 }, children: [p.tier ? (0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 700 }, children: ["Tier: ", (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: p.tier })] }) : null, (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: 13 }, children: p.description })] })), children: (0, jsx_runtime_1.jsxs)(SmallChip_1.default, { style: { display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', fontSize: 12, color: 'var(--text-primary)' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { opacity: 0.8 }, children: "\u2666" }), (0, jsx_runtime_1.jsx)("span", { children: p.name }), p.tier ? ((0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: p.tier, small: true })) : null] }) }, p.id))) }))] })] }));
};
exports.CharacterPanel = CharacterPanel;
exports.default = exports.CharacterPanel;
