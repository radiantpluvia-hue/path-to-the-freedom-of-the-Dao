"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SutraBrowser;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const sutras_1 = __importDefault(require("../minigames/sutras"));
// useGameStore import removed (unused)
const StudyModal_1 = __importDefault(require("./StudyModal"));
function SutraBrowser() {
    const sutras = sutras_1.default;
    const [selected, setSelected] = (0, react_1.useState)(null);
    const [open, setOpen] = (0, react_1.useState)(false);
    // player not used in this browser; keep for future UI extensions
    function openStudy(sutra) {
        setSelected(sutra);
        setOpen(true);
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "xui-panel", children: [(0, jsx_runtime_1.jsx)("h2", { className: "xui-title", children: "Sutras & Manuals" }), (0, jsx_runtime_1.jsx)("ul", { className: "sutra-list", children: sutras.map((s) => ((0, jsx_runtime_1.jsxs)("li", { className: "sutra-item", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: s.name }), " ", (0, jsx_runtime_1.jsxs)("span", { className: "xui-muted", children: ["(Tier ", s.tier, ")"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "xui-muted", children: s.description })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { className: "xbtn", onClick: () => openStudy(s), "data-testid": `study-${s.id}`, children: "Study" }) })] }, s.id))) }), (0, jsx_runtime_1.jsx)(StudyModal_1.default, { open: open, sutra: selected, onClose: () => setOpen(false) })] }));
}
