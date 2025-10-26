"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MinigamePlayground;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- dev-only playground imports */
const react_1 = __importDefault(require("react"));
const MiniGameSystem_1 = require("@/systems/MiniGameSystem");
const BracketView_1 = __importDefault(require("./BracketView"));
const FactionWarSummary_1 = __importDefault(require("./FactionWarSummary"));
const sys = new MiniGameSystem_1.MiniGameSystem();
function MinigamePlayground() {
    const [tRes, setTRes] = react_1.default.useState(null);
    const [wRes, setWRes] = react_1.default.useState(null);
    const runTournament = () => {
        const res = sys.runSectTournament(10);
        setTRes(res);
    };
    const runWar = () => {
        const res = sys.runFactionWar(120, 100);
        setWRes(res);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 12, alignItems: 'flex-start' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: runTournament, children: "Run Tournament (10)" }), tRes && (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)(BracketView_1.default, { ...tRes }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: runWar, children: "Run Faction War" }), wRes && (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8 }, children: (0, jsx_runtime_1.jsx)(FactionWarSummary_1.default, { result: wRes }) })] })] }));
}
