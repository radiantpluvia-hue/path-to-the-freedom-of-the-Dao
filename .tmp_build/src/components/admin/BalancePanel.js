"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BalancePanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const encounterTemplates_1 = require("@/data/encounterTemplates");
const useGameStore_1 = require("../../store/useGameStore");
const index_1 = __importDefault(require("@/data/index"));
const SeedViewerModal_1 = __importDefault(require("./SeedViewerModal"));
const seedValidator_1 = require("@/utils/seedValidator");
const draftSaver_1 = require("@/utils/draftSaver");
function BalancePanel() {
    const [selected, setSelected] = (0, react_1.useState)('roadbandit_small');
    const [preview, setPreview] = (0, react_1.useState)(null);
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    const [seedType, setSeedType] = (0, react_1.useState)('none');
    const [seedSelected, setSeedSelected] = (0, react_1.useState)('');
    const store = (0, useGameStore_1.useGameStore)();
    const tmpl = (0, encounterTemplates_1.getEncounterTemplate)(selected);
    const handlePreview = () => {
        setPreview(tmpl);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 12 }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Balance / Encounter Editor (Dev)" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("select", { value: selected, onChange: (e) => setSelected(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "roadbandit_small", children: "Road Bandit" }), (0, jsx_runtime_1.jsx)("option", { value: "spirit_hound", children: "Spirit Hound" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handlePreview, children: "Preview" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Dev Seeds (optional)" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsxs)("select", { value: seedType, onChange: (e) => { setSeedType(e.target.value); setSeedSelected(''); }, children: [(0, jsx_runtime_1.jsx)("option", { value: "none", children: "-- seeds --" }), (0, jsx_runtime_1.jsx)("option", { value: "events", children: "Events" }), (0, jsx_runtime_1.jsx)("option", { value: "items", children: "Items" }), (0, jsx_runtime_1.jsx)("option", { value: "manuals", children: "Manuals" }), (0, jsx_runtime_1.jsx)("option", { value: "passives", children: "Passives" })] }), (0, jsx_runtime_1.jsxs)("select", { value: seedSelected, onChange: (e) => setSeedSelected(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "(select)" }), (() => {
                                        const idx = index_1.default || {};
                                        const list = seedType === 'events' ? (idx.SEED_EVENTS || []) : seedType === 'items' ? (idx.SEED_ITEMS || []) : seedType === 'manuals' ? (idx.SEED_MANUALS || []) : seedType === 'passives' ? (idx.SEED_PASSIVES || []) : [];
                                        return list.map((s) => (0, jsx_runtime_1.jsx)("option", { value: s.id || s, children: s.title || s.name || s.id }, s.id || s));
                                    })()] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                    const idx = index_1.default || {};
                                    const list = seedType === 'events' ? (idx.SEED_EVENTS || []) : seedType === 'items' ? (idx.SEED_ITEMS || []) : seedType === 'manuals' ? (idx.SEED_MANUALS || []) : seedType === 'passives' ? (idx.SEED_PASSIVES || []) : [];
                                    const found = list.find((s) => (s.id || s) === seedSelected);
                                    setPreview(found || null);
                                }, children: "Preview Seed" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setModalOpen(true); }, children: "View" }), (0, jsx_runtime_1.jsx)("button", { onClick: async () => {
                                    const idx = index_1.default || {};
                                    const list = seedType === 'events' ? (idx.SEED_EVENTS || []) : seedType === 'items' ? (idx.SEED_ITEMS || []) : seedType === 'manuals' ? (idx.SEED_MANUALS || []) : seedType === 'passives' ? (idx.SEED_PASSIVES || []) : [];
                                    const found = list.find((s) => (s.id || s) === seedSelected);
                                    if (!found)
                                        return alert('No seed selected');
                                    const errs = (0, seedValidator_1.validateSeed)(found, seedType);
                                    if (errs && errs.length) {
                                        // show simple alert for now
                                        return alert('Validation failed:\n' + errs.join('\n'));
                                    }
                                    try {
                                        await (0, draftSaver_1.saveDraft)(found, seedType);
                                        alert('Draft saved to data/drafts/');
                                    }
                                    catch (err) {
                                        alert('Failed to save draft: ' + (err && err.message));
                                    }
                                }, children: "Save Draft" })] })] }), (0, jsx_runtime_1.jsx)(SeedViewerModal_1.default, { open: modalOpen, onClose: () => setModalOpen(false), seed: preview }), preview && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("strong", { children: preview.name }) }), (0, jsx_runtime_1.jsxs)("div", { children: ["HP: ", preview.hp, " ATK: ", preview.atk, " DEF: ", preview.def, " SPD: ", preview.speed] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: ["Techniques: ", Array.isArray(preview.techniques) ? preview.techniques.join(', ') : 'none'] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: ["Loot: ", Array.isArray(preview.loot) ? preview.loot.map((l) => JSON.stringify(l)).join(', ') : 'none'] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => { store.addEventLog(`Previewed template ${preview.id}`); }, children: "Log Preview" }) })] }))] }));
}
